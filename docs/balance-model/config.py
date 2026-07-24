"""
Bushel & Bone — Balance Model: CONFIG (single source of truth for every number).

Every constant here traces to a section of docs/mechanics-bible.md. To tune the
balance, edit THIS file only — the engine reads from it. That is the whole point
of a balance model: change a number, re-run the hypotheses, see what breaks.

Season-stepped model: the simulation advances one SEASON at a time (4/year).
Day-level nuances (harvest windows, cold-snap timing) are abstracted into
season-level multipliers and probabilities; this is documented where it happens.
"""

# ── Calendar (§D-008) ────────────────────────────────────────────────────────
DAYS_PER_SEASON = 20
SEASONS = ["Spring", "Summer", "Fall", "Winter"]
DAYS_PER_YEAR = DAYS_PER_SEASON * len(SEASONS)  # 80
MAX_YEARS = 15  # run cap; reaching it counts as "survived to cap"

# ── Start state (§1 scenario A) ──────────────────────────────────────────────
START_COIN = 100
# RATIFIED (2a): the homestead comes with more cleared ground (4 small fields, was 3) —
# a production-side fix that protects heavy consumption. Narratively justified: the Sull
# is quick ground, unnaturally fertile (D-029).
START_FIELDS = 4          # small fields (was 3)
START_FIELD_SIZE = "small"
START_CLONES = 1
START_FOOD = 80           # starting larder (§1 scenario A) — ~1 season's buffer

# ── Field sizes (§1) ─────────────────────────────────────────────────────────
# CALIBRATION (v0.1 pass): small bumped 0.5 -> 0.6. At 0.5 a 3-small-field starter
# plot produced ~100 food/yr vs a farmer+1 need of ~125/yr, starving ~90% of runs
# by Year 2 before any deeper dynamics could express. See README "Calibration".
FIELD_SIZE_MULT = {"small": 0.8, "medium": 1.0, "large": 2.0}
# RATIFIED (2a): the Sull is quick ground — a global yield bump standing in for its
# unnatural fertility (D-029). A tuning knob for the production-side survival fix.
QUICK_GROUND_YIELD = 1.10

# ── Crops (§1 stat table + §4 food values) ───────────────────────────────────
# yield_medium = base yield for a MEDIUM field at 100% fertility, ideal conditions.
# grow_seasons  = seasons in which the crop makes growth progress (else it stalls).
# harvest_labor = clone-days to harvest a medium field.
# food_value    = food units per unit (§4); cash crops are 0 — the anti-mono gate (D-025).
CROPS = {
    "wheat":        dict(family="grains", grow_days=30, seed=4,  yield_medium=12, price=3,  grow_seasons={"Spring", "Summer", "Fall"},        harvest_labor=1.0, storage=8,  food=1.5),
    "corn":         dict(family="grains", grow_days=25, seed=5,  yield_medium=10, price=4,  grow_seasons={"Summer", "Fall"},                  harvest_labor=1.0, storage=6,  food=2.0),
    "oats":         dict(family="grains", grow_days=18, seed=3,  yield_medium=8,  price=3,  grow_seasons={"Spring", "Fall"},                  harvest_labor=0.8, storage=8,  food=1.5),
    "potato":       dict(family="roots",  grow_days=22, seed=6,  yield_medium=15, price=2,  grow_seasons={"Spring", "Summer", "Fall"},        harvest_labor=1.2, storage=12, food=2.0),
    "turnip":       dict(family="roots",  grow_days=15, seed=3,  yield_medium=10, price=2,  grow_seasons={"Spring", "Fall"},                  harvest_labor=0.8, storage=8,  food=1.5),
    "tobacco":      dict(family="cash",   grow_days=40, seed=12, yield_medium=6,  price=15, grow_seasons={"Summer", "Fall"},                  harvest_labor=1.5, storage=12, food=0.0),
    "cotton":       dict(family="cash",   grow_days=45, seed=10, yield_medium=8,  price=12, grow_seasons={"Spring", "Summer", "Fall"},        harvest_labor=3.0, storage=10, food=0.0),
    "hops":         dict(family="cash",   grow_days=30, seed=8,  yield_medium=6,  price=10, grow_seasons={"Summer", "Fall"},                  harvest_labor=1.2, storage=4,  food=0.0),
    "moon_barley":  dict(family="weird",  grow_days=20, seed=15, yield_medium=4,  price=25, grow_seasons=set(SEASONS),                        harvest_labor=1.0, storage=4,  food=0.0),
    "bone_root":    dict(family="weird",  grow_days=25, seed=10, yield_medium=6,  price=4,  grow_seasons=set(SEASONS),                        harvest_labor=1.5, storage=8,  food=0.0),  # RATIFIED (2c): price 30->4 to hit the 1.5-2x-of-wheat raw-margin target
    "whisper_wheat":dict(family="weird",  grow_days=30, seed=20, yield_medium=8,  price=20, grow_seasons={"Summer", "Fall"},                  harvest_labor=1.5, storage=6,  food=0.0),
}

# ── Fertility (§1) ───────────────────────────────────────────────────────────
# CALIBRATION: roots 0.25 -> 0.18. At 0.25/harvest a monocropped food field floored
# its fertility in ~3 harvests, making roots (the staple food) unsustainable and
# starving farms. FLAG: proposed Mechanics-Bible §1 revisit for food sustainability.
FERTILITY_DECAY = {"grains": 0.15, "roots": 0.18, "cash": 0.30, "weird": 0.10}
FERTILITY_FALLOW_RESTORE = 0.30
FERTILITY_FLOOR = 0.20
FERTILITY_CEILING = 1.20
# fertility% -> yield factor (folds §1's growth-rate fertility_mult into harvest yield)
def fertility_factor(fert):
    # 0% -> 0.40, 50% -> 0.75, 100% -> 1.00, 120% -> ~1.06 (linear-ish)
    if fert <= 0.5:
        return 0.40 + (fert / 0.5) * (0.75 - 0.40)
    return 0.75 + ((fert - 0.5) / 0.5) * (1.00 - 0.75)

# ── Tending (§1 / §3) ────────────────────────────────────────────────────────
TEND_NONE = 1.0
TEND_GENERIC = 1.15
TEND_GROWER = 1.25
FIELDS_PER_WORKER = 2      # §11 labor-to-land sweet spot; beyond this, no tending bonus

# ── Reckoning (§6, the authority; §1 reckoning_mult) ─────────────────────────
# tiers by ceiling: Whispers 0-24, Warnings 25-54, Walkers 55-79, VigilFails 80-94, Proper 95-100
RECK_TIER_CEILINGS = [24, 54, 79, 94]           # above 94 = Proper
RECK_TIER_NAMES = ["Whispers", "Warnings", "Walkers", "Long Vigil Fails", "Reckoning Proper"]
RECK_MULT = [1.00, 0.95, 0.85, 0.70, 0.50]       # crop-yield multiplier per tier
RECK_PROPER_FLOOR = 95

RECK_ACCRUAL = dict(
    worked_to_death=8, unmarked_burial=6, fed_to_vat=6, sold_to_vane=3,
    bone_root_harvest=6, dark_ritual=10,   # RATIFIED (2c): bone_root 4->6, the land minds it more
)
RECK_VAT_DRIP_PER_SEASON = 0.5 * DAYS_PER_SEASON   # +0.5/day while Vat operates (§6)
RECK_OVERWORK_PER_SEASON = 2
RECK_BASELINE_PER_SEASON = 0.1 * DAYS_PER_SEASON   # +0.1/day (§6) = +2/season
RECK_DECAY_PER_SEASON = 2                           # passive (only if cruelty stops); offsets baseline over a year
RECK_INHERITANCE = 0.25                            # heir inherits 25% on the same land (D-027)

# atonement (§6): first act full, each subsequent act in a season 50% as effective
ATONE_FUNERAL = 8
ATONE_PREACHER = 5
ATONE_OLDNAN = 10
ATONE_DIMINISH = 0.5

def reck_tier(reck):
    for i, ceil in enumerate(RECK_TIER_CEILINGS):
        if reck <= ceil:
            return i
    return 4  # Proper

# ── Clones (§3) ──────────────────────────────────────────────────────────────
# RATIFIED (issue #2, decision 2a — "protect the survival weight"): consumption stays
# at the committed §3/§4 values so food remains a heavy ongoing burden. The annual gap
# is closed on the PRODUCTION side instead (more starting land + the quick-ground yield
# bump below), not by making people eat less. Winter still costs more per head (§4).
FOOD_PER_CLONE_DAY = 0.5          # §3 (committed)
FOOD_PER_CLONE_DAY_WINTER = 0.75  # §4 (committed)
FOOD_PER_FARMER_DAY = 1.0         # §3 (committed)
FOOD_UNDERFEED = 0.25
BODY_MULT = {"frail": 0.75, "average": 1.0, "strong": 1.25}
OVERWORK_CAP = 1.5          # max clone-days/day (§3)
OVERWORK_BONUS = 0.5        # +50% labor when overworked
OVERWORK_MORALE = -8        # per day overworked

MERCHANT_PRICE = {("average", "average"): 60, ("strong", "dull"): 75, ("grower", "sharp"): 110}
MERCHANT_PRICE_DEFAULT = 60
MERCHANT_VISIT_DAYS = 10
MERCHANT_MARKUP_LOW_REP = 1.25   # rep < 40 (§3 fixed in consistency pass)
MERCHANT_DISCOUNT_HIGH_REP = 0.90  # rep >= 70

# Morale (§3): start 60; bands 70+/40-69/20-39/<20
MORALE_START = 60
MORALE_CONTENT = 70
MORALE_UNREST = 39
MORALE_REVOLT = 19
MORALE_VARIANCE = 3

# Disposal (§3/§5/§6): (morale_delta, reckoning_key, ghost_roll, coin, taint_add)
DISPOSAL = {
    "marked":   dict(morale=+2,  reck=None,               ghost=False, coin=0,   taint=0.0),
    "unmarked": dict(morale=-10, reck="unmarked_burial",  ghost=True,  coin=0,   taint=0.50),
    "sell":     dict(morale=-6,  reck="sold_to_vane",     ghost=False, coin=15,  taint=0.0),
    "vat":      dict(morale=-8,  reck="fed_to_vat",       ghost=True,  coin=0,   taint=0.0),
    "funeral":  dict(morale=+10, reck=None,               ghost=False, coin=-40, taint=0.0),  # + atonement handled separately
}
CORPSE_SALE_COIN = 15        # H-12 invariant: must stay < cheapest replacement
CLONE_REPLACE_MIN = 60

# ── Winter Survival (§4) ─────────────────────────────────────────────────────
FUEL_PER_DAY = 2
FUEL_PER_WINTER = FUEL_PER_DAY * DAYS_PER_SEASON  # 40
WOOD_PER_CLONE_DAY = 4
COAL_PRICE = 3
COAL_PRICE_RAIL = 2
COAL_FUEL_VALUE = 2          # 1 coal = 2 fuel
COLD_SNAPS_PER_WINTER = 2
COLD_SNAP_FUEL_SPIKE = 0.5   # +50% demand during a snap
PIG_FOOD = 15
COW_FOOD = 25
STARVE_MORALE_PER_SEASON = -15

# ── Market (§2) ──────────────────────────────────────────────────────────────
# seasonal price multiplier by family (§2 table)
SEASONAL_MULT = {
    "grains": {"Spring": 1.15, "Summer": 1.00, "Fall": 0.75, "Winter": 1.25},
    "roots":  {"Spring": 1.10, "Summer": 1.00, "Fall": 0.80, "Winter": 1.20},
    "cash":   {"Spring": 0.90, "Summer": 1.20, "Fall": 1.05, "Winter": 0.95},
    "weird":  {"Spring": 1.00, "Summer": 1.00, "Fall": 1.10, "Winter": 1.30},
}
MICRO_NOISE = 0.05           # ±5% daily jitter (applied per sale batch)
VENUE = {  # name -> (price_mult, daily_soft_cap)
    "local":    (1.00, 10),
    "regional": (1.10, 30),
    "rail":     (1.25, 100),
    "black":    (1.55, 15),   # for weird/contraband; normal crops sell here at 0.90x
}
BLACK_MARKET_NORMAL_MULT = 0.90   # normal crops at the fence (H-08)
BLACK_MARKET_REP_HIT = 8
GLUT_STEP = 0.15             # price drop per soft-cap block
GLUT_FLOOR = 0.40
GLUT_DECAY_PER_DAY = 0.20    # saturation decays 20%/day

# ── Contracts (§7) ───────────────────────────────────────────────────────────
CONTRACT_PREMIUM = (1.05, 1.20)   # near/far
CONTRACT_DEPOSIT = 0.20
CONTRACT_DEFAULT_REP = -15

# ── Reputation (§5/§12) ──────────────────────────────────────────────────────
REP_START = 50
REP_PILLAR = 70
REP_SUSPECT = 39
REP_PARIAH = 19
REP_RECOVERY_PER_SEASON = 1
REP_EXPOSURE_BASE = 0.15     # per-season chance a hidden cruelty is exposed
REP_EXPOSURE_PER_ACT = 0.05

# ── Mortgage (§13) ───────────────────────────────────────────────────────────
MORTGAGE_ANNUAL = 150
MORTGAGE_BUYOUT = 1200
MORTGAGE_MISS_LIMIT = 2      # consecutive misses -> foreclosure (land-loss)
# CALIBRATION: a starter plot earns ~50-80/yr — unable to service 150/yr from Year 1,
# foreclosing ~Year 2-3 before establishing. A 2-year grace ("The Newcomer" arc, §13)
# lets a farm find its feet. FLAG: proposed design addition, not yet in the Mechanics Bible.
MORTGAGE_GRACE_YEARS = 2

# ── Events pacing (§9) — used only for the pacing hypothesis ─────────────────
EVENT_BASE_RATE = 0.30
EVENT_PRESSURE_STEP = 0.10
EVENT_MAJOR_DENSITY_CEIL = 2  # per rolling 3 days

# ── Weather (§10) — simplified aggregate for the season model ────────────────
WEATHER_MEAN = 1.0
WEATHER_SD = 0.06            # mild seasonal variation on yield
HAIL_CHANCE_PER_CASH_HARVEST = 0.20   # a ripe cash crop hail roll
HAIL_LOSS = 0.40
RESILIENT_FAMILIES = {"roots"}         # shrug off hail/frost (§10)
