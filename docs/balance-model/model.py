"""
Bushel & Bone — Balance Model: MODEL (state + season-stepped engine).

The engine advances one SEASON at a time and calls hooks on a `strategy` object
(see strategies.py). Everything is driven by config.py. All randomness flows
through a single seeded PRNG so runs are perfectly reproducible (§D-021).

Fidelity note (honest scope): this is a v0.1 economic+moral core. Fully modeled:
crops/fertility/taint, clone food economy, morale deaths, market pricing + glut,
winter survival, the Reckoning meter + tiers + run-end, the mortgage clock.
Abstracted/stubbed: day-level harvest windows (rolled into season labor scaling),
the event engine (§9), contracts (§7), festivals (§12), ascension (§15). Those
are where later versions extend; hypotheses depending on them are reported
NOT MODELED rather than silently faked.
"""

import math
import random
from dataclasses import dataclass, field as dfield

import config as C


# ── State ────────────────────────────────────────────────────────────────────
@dataclass
class Field:
    size: str = "small"
    crop: str = None            # None = empty/fallow
    progress: float = 0.0       # 0..1 growth toward harvest
    fertility: float = 1.0
    taint: float = 0.0
    fallow_seasons: int = 0


@dataclass
class Clone:
    name: str
    body: str = "average"
    mind: str = "average"
    archetype: str = "field_hand"
    morale: float = C.MORALE_START
    alive: bool = True

    @property
    def labor(self):
        return C.BODY_MULT[self.body]


@dataclass
class Farm:
    seed: int
    rng: random.Random
    coin: float = C.START_COIN
    fields: list = dfield(default_factory=list)
    clones: list = dfield(default_factory=list)
    storage: dict = dfield(default_factory=dict)   # crop -> units
    reckoning: float = 0.0
    reputation: float = C.REP_START
    has_vat: bool = False
    ghost_roll: list = dfield(default_factory=list)
    hidden_cruelties: int = 0          # un-exposed acts (for exposure rolls)
    # calendar
    year: int = 1
    season_idx: int = 0                # index into C.SEASONS
    # bookkeeping
    total_coin_earned: float = 0.0
    peak_coin: float = C.START_COIN
    clones_died: int = 0
    mortgage_misses: int = 0
    reckoning_proper_seasons: int = 0
    alive: bool = True
    end_reason: str = None
    log_lines: list = dfield(default_factory=list)

    @property
    def season(self):
        return C.SEASONS[self.season_idx]

    @property
    def is_winter(self):
        return self.season == "Winter"

    @property
    def alive_clones(self):
        return [c for c in self.clones if c.alive]

    @property
    def workers(self):
        # farmer (1.0) + alive clones' body labor, minus coordination overhead (§11)
        n = len(self.alive_clones)
        overhead = 1.0
        if n >= 11:
            overhead = 0.90
        elif n >= 6:
            overhead = 0.95
        base = 1.0 + sum(c.labor for c in self.alive_clones)
        return base * overhead

    @property
    def reck_tier(self):
        return C.reck_tier(self.reckoning)


def new_farm(seed):
    rng = random.Random(seed)
    f = Farm(seed=seed, rng=rng)
    f.fields = [Field(size=C.START_FIELD_SIZE) for _ in range(C.START_FIELDS)]
    f.clones = [Clone(name=f"Clone-{i+1}") for i in range(C.START_CLONES)]
    f.storage["_bought_food"] = float(C.START_FOOD)   # starting larder (§1 scenario A)
    return f


# ── Helpers ──────────────────────────────────────────────────────────────────
def _taint_yield_mult(is_bone_root, taint):
    if is_bone_root:
        if taint < 0.21:
            return 0.0            # bone-root needs tainted ground
        if taint <= 0.50:
            return 1.0
        if taint <= 0.80:
            return 1.25
        return 1.50
    else:
        if taint <= 0.20:
            return 1.0
        if taint <= 0.50:
            return 0.80
        if taint <= 0.80:
            return 0.50
        return 0.0               # normal crops fail on heavily tainted ground


def _weather(rng):
    w = rng.gauss(C.WEATHER_MEAN, C.WEATHER_SD)
    return max(0.6, min(1.2, w))


def market_price(farm, crop, venue):
    """Per-unit price at a venue this season (§2 stack, micro-noise folded in)."""
    fam = C.CROPS[crop]["family"]
    base = C.CROPS[crop]["price"]
    seasonal = C.SEASONAL_MULT[fam][farm.season]
    vmult, _cap = C.VENUE[venue]
    if venue == "black" and fam != "weird":
        vmult = C.BLACK_MARKET_NORMAL_MULT     # fence won't pay for legal crops (H-08)
    noise = 1.0 + farm.rng.uniform(-C.MICRO_NOISE, C.MICRO_NOISE)
    return base * seasonal * vmult * noise


def _glut_avg_factor(units, cap):
    """Average price factor when selling `units` at a venue with soft-cap `cap` (§2)."""
    if units <= 0:
        return 1.0
    total, sold = 0.0, 0
    block = 0
    while units - sold > 1e-9:   # tolerance guards against float-asymptote loops
        n = min(cap, units - sold)
        factor = max(C.GLUT_FLOOR, 1.0 - C.GLUT_STEP * block)
        total += n * factor
        sold += n
        block += 1
    return total / units


def food_price_per_unit(farm):
    """Cheapest market cost to BUY one food unit this season (via a staple crop)."""
    best = None
    for crop, d in C.CROPS.items():
        if d["food"] <= 0:
            continue
        per_food = market_price(farm, crop, "local") / d["food"]
        if best is None or per_food < best:
            best = per_food
    return best or 5.0


# ── Engine phases ────────────────────────────────────────────────────────────
def _plant(farm, strat):
    if farm.is_winter:
        return
    free = [fl for fl in farm.fields if fl.crop is None]
    if not free:
        return
    picks = strat.plant(farm, free)
    for fl, crop in zip(free, picks):
        if crop in (None, "fallow"):
            fl.fallow_seasons += 1
            continue
        if farm.season not in C.CROPS[crop]["grow_seasons"]:
            continue  # can't start a crop out of its window
        seed_cost = C.CROPS[crop]["seed"]
        if farm.coin < seed_cost:
            continue
        farm.coin -= seed_cost
        fl.crop = crop
        fl.progress = 0.0
        fl.fallow_seasons = 0


def _cruelty(farm, strat):
    """Strategy may sacrifice clones to taint fields (e.g. bone-root path)."""
    n = strat.cruelty_sacrifices(farm)
    for _ in range(n):
        living = farm.alive_clones
        if len(living) <= 1:      # never sacrifice the last hand
            break
        victim = living[-1]
        # bury unmarked in a chosen field -> taint
        target = min(farm.fields, key=lambda fl: fl.taint)
        _kill_clone(farm, victim, "unmarked", target_field=target)


def _grow_and_harvest(farm, strat):
    tier_mult = C.RECK_MULT[farm.reck_tier]
    workers = farm.workers
    tend_cap = int(C.FIELDS_PER_WORKER * workers)
    planted = [fl for fl in farm.fields if fl.crop]
    tended = set(id(fl) for fl in planted[:tend_cap])

    # advance growth
    matured = []
    for fl in planted:
        if farm.season in C.CROPS[fl.crop]["grow_seasons"]:
            fl.progress += C.DAYS_PER_SEASON / C.CROPS[fl.crop]["grow_days"]
        if fl.progress >= 1.0:
            matured.append(fl)

    # labor demand for harvesting matured fields
    labor_cap = workers * C.DAYS_PER_SEASON
    labor_demand = sum(C.CROPS[fl.crop]["harvest_labor"] for fl in matured)
    labor_factor = 1.0 if labor_demand <= labor_cap else labor_cap / labor_demand

    for fl in matured:
        d = C.CROPS[fl.crop]
        base = d["yield_medium"] * C.FIELD_SIZE_MULT[fl.size]
        tend = C.TEND_GENERIC if id(fl) in tended else C.TEND_NONE
        # grower archetype present improves tending a touch
        if any(c.archetype == "grower" for c in farm.alive_clones) and id(fl) in tended:
            tend = C.TEND_GROWER
        taint_mult = _taint_yield_mult(fl.crop == "bone_root", fl.taint)
        weather = _weather(farm.rng)
        # hail roll on cash crops (§10), resilient families exempt
        if d["family"] not in C.RESILIENT_FAMILIES and d["family"] == "cash":
            if farm.rng.random() < C.HAIL_CHANCE_PER_CASH_HARVEST:
                weather *= (1.0 - C.HAIL_LOSS)
        y = (base * C.fertility_factor(fl.fertility) * tend * tier_mult
             * taint_mult * weather * labor_factor)
        y = max(0.0, y)
        farm.storage[fl.crop] = farm.storage.get(fl.crop, 0.0) + y
        if fl.crop == "bone_root" and y > 0:
            farm.reckoning += C.RECK_ACCRUAL["bone_root_harvest"]
        # fertility decay + reset field
        fl.fertility = max(C.FERTILITY_FLOOR, fl.fertility - C.FERTILITY_DECAY[d["family"]])
        fl.crop = None
        fl.progress = 0.0


def _sell(farm, strat):
    for crop in list(farm.storage.keys()):
        if crop not in C.CROPS:      # skip bookkeeping keys like "_bought_food"
            continue
        units = farm.storage[crop]
        if units <= 0:
            continue
        frac, venue = strat.sell(farm, crop, units)
        if frac <= 0:
            continue
        fam = C.CROPS[crop]["family"]
        if fam == "weird":
            venue = "black"                 # only buyer for weird crops
        to_sell = units * frac
        _cap = C.VENUE[venue][1]
        price = market_price(farm, crop, venue)
        avg = _glut_avg_factor(to_sell, _cap)
        revenue = to_sell * price * avg
        farm.coin += revenue
        farm.total_coin_earned += revenue
        farm.storage[crop] -= to_sell
        if venue == "black":
            farm.reputation = max(0, farm.reputation - C.BLACK_MARKET_REP_HIT)


def _consume(farm, strat):
    """Food (all seasons) and fuel (winter). Shortfalls kill clones, then the farmer."""
    # --- FOOD ---
    clone_rate = C.FOOD_PER_CLONE_DAY_WINTER if farm.is_winter else C.FOOD_PER_CLONE_DAY
    need = (C.FOOD_PER_FARMER_DAY + clone_rate * len(farm.alive_clones)) * C.DAYS_PER_SEASON
    have = _available_food(farm)
    if have < need and strat.will_buy_food(farm):
        deficit = need - have
        ppf = food_price_per_unit(farm)
        affordable = farm.coin / ppf if ppf > 0 else 0
        buy = min(deficit, affordable)
        if buy > 0:
            farm.coin -= buy * ppf
            farm.storage["_bought_food"] = farm.storage.get("_bought_food", 0.0) + buy / 1.0  # 1 food/unit
    _drain_food(farm, need)   # consumes; returns handled inside via deaths

    # --- FUEL (winter) ---
    if farm.is_winter:
        snaps = C.COLD_SNAPS_PER_WINTER
        fuel_need = C.FUEL_PER_WINTER * (1 + C.COLD_SNAP_FUEL_SPIKE * snaps / C.DAYS_PER_SEASON * 3)
        fuel = getattr(farm, "_fuel", 0.0)
        if fuel < fuel_need:
            # emergency coal buy if strategy allows
            if strat.will_buy_food(farm):
                deficit = fuel_need - fuel
                coal = deficit / C.COAL_FUEL_VALUE
                cost = coal * C.COAL_PRICE
                if farm.coin >= cost:
                    farm.coin -= cost
                    fuel += deficit
        if fuel < fuel_need:
            # freeze: weakest clones die
            shortfall_ratio = 1.0 - (fuel / fuel_need if fuel_need else 1.0)
            _cold_deaths(farm, strat, shortfall_ratio)
        farm._fuel = 0.0  # spent


def _available_food(farm):
    total = 0.0
    for crop, units in farm.storage.items():
        if crop == "_bought_food":
            total += units
        elif crop in C.CROPS and C.CROPS[crop]["food"] > 0:
            total += units * C.CROPS[crop]["food"]
    return total


def _drain_food(farm, need):
    remaining = need
    # feed from bought food first, then edible crops (perishable first by storage life)
    order = ["_bought_food"] + sorted(
        [c for c in farm.storage if c in C.CROPS and C.CROPS[c]["food"] > 0],
        key=lambda c: C.CROPS[c]["storage"])
    for crop in order:
        if remaining <= 0:
            break
        units = farm.storage.get(crop, 0.0)
        if units <= 0:
            continue
        fv = 1.0 if crop == "_bought_food" else C.CROPS[crop]["food"]
        food_avail = units * fv
        used = min(food_avail, remaining)
        farm.storage[crop] = units - used / fv
        remaining -= used
    if remaining > 0:
        _starvation(farm, remaining)


def _starvation(farm, food_short):
    """Not enough food: clones die (weakest first); if even the farmer can't eat, line-death."""
    farmer_need = C.FOOD_PER_FARMER_DAY * C.DAYS_PER_SEASON
    # each dead clone frees ~a season of its ration; kill until covered or none left
    living = sorted(farm.alive_clones, key=lambda c: c.labor)  # frail first
    # if shortfall exceeds all clone rations, the farmer starves
    for c in living:
        if food_short <= 0:
            break
        _kill_clone(farm, c, _strat_disposal_placeholder(farm), starvation=True)
        food_short -= C.FOOD_PER_CLONE_DAY_WINTER * C.DAYS_PER_SEASON
    if food_short > farmer_need * 0.0:  # still short after clones gone -> farmer at risk
        if not farm.alive_clones and food_short > 0:
            farm.alive = False
            farm.end_reason = "starvation"
    # household-wide morale crash
    for c in farm.alive_clones:
        c.morale += C.STARVE_MORALE_PER_SEASON


def _cold_deaths(farm, strat, ratio):
    living = sorted(farm.alive_clones, key=lambda c: c.labor)
    n = max(1, int(round(len(living) * ratio * 0.5)))
    for c in living[:n]:
        _kill_clone(farm, c, strat.disposal(farm))
    for c in farm.alive_clones:
        c.morale -= 6


# placeholder disposal for starvation (usually can't afford funerals)
def _strat_disposal_placeholder(farm):
    return "marked" if farm.coin >= 0 else "unmarked"


def _kill_clone(farm, clone, disposal, starvation=False, target_field=None):
    if not clone.alive:
        return
    clone.alive = False
    farm.clones_died += 1
    d = C.DISPOSAL.get(disposal, C.DISPOSAL["marked"])
    farm.coin += d["coin"]
    if d["reck"]:
        farm.reckoning += C.RECK_ACCRUAL[d["reck"]]
    if d["ghost"]:
        farm.ghost_roll.append(clone.name)
        farm.hidden_cruelties += 1
    if d["taint"] > 0:
        tf = target_field or min(farm.fields, key=lambda fl: fl.taint)
        tf.taint = min(1.0, tf.taint + d["taint"])
    if disposal == "funeral":
        farm.reckoning = max(0.0, farm.reckoning - C.ATONE_FUNERAL)
        if farm.ghost_roll:
            farm.ghost_roll.pop()
    for c in farm.alive_clones:
        c.morale += d["morale"]


def _merchant(farm, strat):
    # merchant visits ~twice per season (10-day cadence); allow up to 2 buys
    for _ in range(2):
        if not strat.buy_clone(farm):
            break
        price = C.MERCHANT_PRICE_DEFAULT
        if farm.reputation < 40:
            price *= C.MERCHANT_MARKUP_LOW_REP
        elif farm.reputation >= C.REP_PILLAR:
            price *= C.MERCHANT_DISCOUNT_HIGH_REP
        if farm.coin < price:
            break
        farm.coin -= price
        farm.clones.append(Clone(name=f"Clone-{len(farm.clones)+1}"))


def _reckoning_upkeep(farm, cruelty_this_season):
    farm.reckoning += C.RECK_BASELINE_PER_SEASON
    if farm.has_vat:
        farm.reckoning += C.RECK_VAT_DRIP_PER_SEASON
    if not cruelty_this_season:
        farm.reckoning = max(0.0, farm.reckoning - C.RECK_DECAY_PER_SEASON)
    farm.reckoning = max(0.0, min(100.0, farm.reckoning))
    if farm.reckoning >= C.RECK_PROPER_FLOOR:
        farm.reckoning_proper_seasons += 1
        if farm.reckoning_proper_seasons >= 2:   # sustained Proper -> land lost to curse
            farm.alive = False
            farm.end_reason = "reckoning_proper"
    else:
        farm.reckoning_proper_seasons = 0


def _reputation_upkeep(farm):
    # drift toward neutral 50
    if farm.reputation < 50:
        farm.reputation = min(50, farm.reputation + C.REP_RECOVERY_PER_SEASON)
    # exposure roll on hidden cruelties
    if farm.hidden_cruelties > 0:
        p = C.REP_EXPOSURE_BASE + C.REP_EXPOSURE_PER_ACT * (farm.hidden_cruelties - 1)
        if farm.rng.random() < p:
            farm.reputation = max(0, farm.reputation - 3 * farm.hidden_cruelties)
            farm.hidden_cruelties = 0


def _year_end_mortgage(farm):
    if farm.year <= C.MORTGAGE_GRACE_YEARS:   # establishment grace (§13 "The Newcomer")
        return
    if farm.coin >= C.MORTGAGE_ANNUAL:
        farm.coin -= C.MORTGAGE_ANNUAL
        farm.mortgage_misses = 0
    else:
        farm.mortgage_misses += 1
        if farm.mortgage_misses >= C.MORTGAGE_MISS_LIMIT:
            farm.alive = False
            farm.end_reason = "foreclosure"


def _clamp_morale(farm):
    for c in farm.clones:
        c.morale = max(0.0, min(100.0, c.morale + farm.rng.uniform(-C.MORALE_VARIANCE, C.MORALE_VARIANCE)))
        if c.alive and c.morale <= C.MORALE_REVOLT:
            # desertion roll
            if farm.rng.random() < 0.5:
                c.alive = False  # deserts (not a death; no disposal/reckoning)


# ── Season step & campaign ───────────────────────────────────────────────────
def _clear_fields(farm, strat):
    n = strat.clear_fields(farm)
    for _ in range(n):
        if farm.coin < 20:
            break
        farm.coin -= 20
        farm.fields.append(Field(size="small"))


def step_season(farm, strat):
    cruel_before = (farm.clones_died, farm.reckoning)
    if farm.season == "Spring":
        _clear_fields(farm, strat)
    _plant(farm, strat)
    _cruelty(farm, strat)
    cruelty_this_season = strat.cruelty_sacrifices(farm) > 0 or (farm.clones_died > cruel_before[0])
    _grow_and_harvest(farm, strat)
    if not farm.is_winter:
        _plant(farm, strat)     # fidelity fix: replant fields freed by this season's harvest
    # fallow restore for fields left genuinely empty this season (§1: full-season fallow +30%)
    for fl in farm.fields:
        if fl.crop is None:
            fl.fertility = min(C.FERTILITY_CEILING, fl.fertility + C.FERTILITY_FALLOW_RESTORE)
            fl.taint = max(0.0, fl.taint - 0.05)
    # Fall: chop/provision fuel for the coming winter
    if farm.season == "Fall":
        strat.provision_winter(farm)
    _sell(farm, strat)
    _merchant(farm, strat)
    _consume(farm, strat)
    _reckoning_upkeep(farm, cruelty_this_season)
    _reputation_upkeep(farm)
    _clamp_morale(farm)

    farm.peak_coin = max(farm.peak_coin, farm.coin)

    # advance calendar
    farm.season_idx += 1
    if farm.season_idx >= len(C.SEASONS):
        farm.season_idx = 0
        _year_end_mortgage(farm)
        farm.year += 1

    if farm.alive and farm.year > C.MAX_YEARS:
        farm.alive = False
        farm.end_reason = "survived_cap"


def run_campaign(strategy, seed):
    """Run one full campaign. `strategy` is a fresh strategy object. Returns metrics."""
    farm = new_farm(seed)
    strategy.on_start(farm)
    guard = 0
    while farm.alive and guard < C.MAX_YEARS * 4 + 4:
        step_season(farm, strategy)
        guard += 1
    return metrics(farm)


def metrics(farm):
    years = farm.year - 1 if farm.end_reason in ("survived_cap",) else farm.year
    return dict(
        seed=farm.seed,
        years_survived=min(years, C.MAX_YEARS),
        end_reason=farm.end_reason or "unknown",
        peak_coin=round(farm.peak_coin, 1),
        total_coin_earned=round(farm.total_coin_earned, 1),
        final_reckoning=round(farm.reckoning, 1),
        final_tier=C.RECK_TIER_NAMES[farm.reck_tier],
        clones_died=farm.clones_died,
        final_clones=len(farm.alive_clones),
        final_reputation=round(farm.reputation, 1),
    )
