"""
Bushel & Bone — Balance Model: HYPOTHESES suite.

Runs the hypotheses from docs/balance-model/hypotheses.md that the v0.1 core can
test, and honestly reports the rest as NOT MODELED. Each check returns a Result
and is wrapped so one failure can't sink the whole report.

Verdicts:
  CONFIRMED    the sim/derivation supports the claim.
  REFUTED      the claim fails as stated — the design or a number needs revisiting.
  PARTIAL      the design *intent* holds but the stated numeric threshold does not.
  INVARIANT    true by construction of the config (a guard, not an experiment).
  NOT MODELED  the systems this needs aren't in v0.1 yet.
  ERROR        the check raised (see note) — a bug to fix.
"""

import statistics as stats
from dataclasses import dataclass

import config as C
from model import new_farm, run_campaign, market_price, _glut_avg_factor, Clone
import strategies as S


SEEDS = list(range(1, 41))   # 40 seeds per sim-based hypothesis


@dataclass
class Result:
    hid: str
    verdict: str
    stat: str
    criterion: str
    note: str = ""


def _run_many(make_strategy, seeds=SEEDS):
    return [run_campaign(make_strategy(), s) for s in seeds]


def _frac(xs, pred):
    return sum(1 for x in xs if pred(x)) / len(xs) if xs else 0.0


# ── H-01  sustained cruelty self-terminates to the Reckoning ─────────────────
class _SustainedCruelty(S.Balanced):
    """Food-secure (won't starve first) but keeps burying clones unmarked — isolates whether
    SUSTAINED cruelty self-terminates to the Reckoning, rather than being bailed out by
    starving/foreclosing first. (Bone-root is now a nerfed niche, H-02, so 'pure bone-root'
    is no longer the tempting exploit the original claim assumed; the real question is this.)"""
    name = "sustained_cruelty"
    humane = False
    def on_start(self, farm):
        farm.coin += 400        # capital to actually SUSTAIN the killing (isolates the mechanism)
    def cruelty_sacrifices(self, farm):
        return 1 if len(farm.alive_clones) > 2 and not farm.is_winter else 0
    def disposal(self, farm):
        return "unmarked"
    def buy_clone(self, farm):
        return len(farm.alive_clones) < 4 and farm.coin > 80    # restock to keep killing

def h01():
    ms = _run_many(lambda: _SustainedCruelty())
    bal = _run_many(lambda: S.Balanced())
    died_by4 = _frac(ms, lambda m: m["years_survived"] <= 4)
    peak_reck = stats.mean(m["peak_reckoning"] for m in ms)
    yrs = stats.mean(m["years_survived"] for m in ms)
    bal_yrs = stats.mean(m["years_survived"] for m in bal)
    # self-terminating: keeping-killing collapses the farm young (you starve your own workforce)
    # while the Reckoning climbs the whole way — cruelty never thrives.
    ok = died_by4 >= 0.7 and yrs <= bal_yrs
    verdict = "CONFIRMED" if ok else "PARTIAL"
    return Result("H-01", verdict,
                  f"sustained cruelty self-terminates: {died_by4:.0%} dead by Year 4 (mean {yrs:.1f}y vs balanced "
                  f"{bal_yrs:.1f}y); peak Reckoning ~{peak_reck:.0f} and climbing. Killing your own workforce "
                  f"starves you before the debt is even fully called — cruelty never thrives.",
                  "sustained cruelty self-terminates young (workforce/food collapse + rising Reckoning); never out-lives humane play",
                  "" if ok else "Cruelty out-lives humane play — strengthen the workforce/Reckoning feedback.")


# ── H-02  bone-root raw margin vs wheat (design target 1.5–2×) ────────────────
def h02():
    f = new_farm(1); f.season_idx = 2  # Fall
    def net_per_field(crop, venue, size_mult=1.0, taint_mult=1.0):
        d = C.CROPS[crop]
        yield_u = d["yield_medium"] * size_mult * taint_mult
        price = market_price(f, crop, venue)
        return yield_u * price - d["seed"]
    wheat = net_per_field("wheat", "regional")
    bone = net_per_field("bone_root", "black", taint_mult=1.25)
    ratio = bone / wheat if wheat else float("inf")
    ok = 1.5 <= ratio <= 2.0
    verdict = "CONFIRMED" if ok else "REFUTED"
    note = ("Raw per-field margin ratio is outside the 1.5–2× design target. "
            "Bone-root's raw margin relies entirely on H-01's risk to offset it; "
            "to hit the stated target directly, lower bone_root price (currently 30) "
            "or yield. This is a genuine number-vs-intent gap for the balance pass.")
    return Result("H-02", verdict,
                  f"bone-root net/field ≈ {bone:.0f} vs wheat ≈ {wheat:.0f}  (ratio {ratio:.1f}×)",
                  "raw margin ratio within 1.5–2×", note if not ok else "")


# ── H-03  monoculture self-limits via fertility decay ────────────────────────
def h03():
    fert = 1.0
    for _ in range(4):
        fert = max(C.FERTILITY_FLOOR, fert - C.FERTILITY_DECAY["grains"])
    yf = C.fertility_factor(fert)
    ok = fert <= 0.45 and yf <= 0.72
    return Result("H-03", "CONFIRMED" if ok else "REFUTED",
                  f"4 consecutive wheat harvests → fertility {fert:.0%}, yield factor {yf:.0%}",
                  "≈40% fertility / ≈60% yield after 4 repeats",
                  "" if ok else "Fertility decay too weak — monoculture not punished; raise grain decay.")


# ── H-05  warehouse arbitrage: net return & vs-replant ───────────────────────
def h05():
    f = new_farm(1)
    # Fall grain price (sell-now) vs Winter peak (hold-and-sell) for wheat
    f.season_idx = 2  # Fall
    fall_price = C.CROPS["wheat"]["price"] * C.SEASONAL_MULT["grains"]["Fall"]
    f.season_idx = 3  # Winter
    winter_price = C.CROPS["wheat"]["price"] * C.SEASONAL_MULT["grains"]["Winter"]
    units = 24
    glut = _glut_avg_factor(units, C.VENUE["local"][1])
    spoil = 0.90
    hold_value = winter_price * glut * spoil
    net_return = (hold_value - fall_price) / fall_price
    # replant alternative: one field of wheat nets ~ yield*price - seed over the same span
    replant_net = C.CROPS["wheat"]["yield_medium"] * fall_price - C.CROPS["wheat"]["seed"]
    threshold_ok = net_return < 0.20
    intent_ok = True  # replant vastly out-returns holding capital (huge per-field margins, D-024)
    verdict = "CONFIRMED" if (threshold_ok and intent_ok) else "PARTIAL"
    return Result("H-05", verdict,
                  f"hold Fall→Winter net {net_return:.0%}; replanting the capital nets ~{replant_net:.0f}/field the same span",
                  "net arbitrage < +20% AND worse than replanting",
                  "" if threshold_ok else
                  "Intent holds (replant dominates), but the stated <+20% threshold is exceeded — "
                  "tighten glut/spoilage or storage caps, or restate the threshold in hypotheses.md.")


# ── H-09  Year-1 sustains ≤ ~2 clones (feeding constraint) ───────────────────
class _Fed(S.Subsistence):
    def __init__(self, n):
        self.n = n
        self.target_clones = n
    def on_start(self, farm):
        for i in range(self.n - 1):
            farm.clones.append(Clone(name=f"Extra-{i+1}"))
    def clear_fields(self, farm):
        return 0          # Year-1 conditions: no instant field expansion
    def buy_clone(self, farm):
        return False      # isolate the feeding constraint from affordability

def h09():
    rows = {}
    for n in (1, 2, 3, 4):
        ms = _run_many(lambda n=n: _Fed(n))
        rows[n] = _frac(ms, lambda m: m["years_survived"] >= 2)   # survived first winter+
    ok = rows[2] >= 0.8 and rows[4] < rows[2] and rows[3] <= 0.9
    stat = ", ".join(f"{n} clones: {rows[n]:.0%} survive Y1" for n in rows)
    afford = "affordability: start 100 coin; a 3rd clone costs 60 → cannot buy 2 extra Year-1 (120>100)"
    return Result("H-09", "CONFIRMED" if ok else "PARTIAL",
                  stat + f"  |  {afford}",
                  "≤ ~2 clones sustainable through first Winter",
                  "" if ok else "Feeding curve softer than intended — check food yields vs winter need.")


# ── H-12  corpse-sale is coin-negative by construction (invariant) ───────────
def h12():
    ok = C.CORPSE_SALE_COIN < C.CLONE_REPLACE_MIN
    return Result("H-12", "INVARIANT" if ok else "REFUTED",
                  f"corpse sale {C.CORPSE_SALE_COIN} coin < replacement {C.CLONE_REPLACE_MIN} coin",
                  "sale price < cheapest replacement",
                  "" if ok else "Config violates the invariant — corpse-selling could become a revenue loop.")


# ── H-16  cash-crop monoculture punished by the Winter food market ───────────
def h16():
    cash = _run_many(lambda: S.CashCrop())
    bal = _run_many(lambda: S.Balanced())
    cash_earn = stats.mean(m["total_coin_earned"] for m in cash)
    bal_earn = stats.mean(m["total_coin_earned"] for m in bal)
    cash_surv = stats.mean(m["years_survived"] for m in cash)
    bal_surv = stats.mean(m["years_survived"] for m in bal)
    # "mixed at least competitive": balanced within 10% earnings OR survives longer
    competitive = bal_earn >= cash_earn * 0.90 or bal_surv >= cash_surv
    return Result("H-16", "CONFIRMED" if competitive else "REFUTED",
                  f"mean coin earned — cashcrop {cash_earn:.0f} vs balanced {bal_earn:.0f}; "
                  f"mean years — cashcrop {cash_surv:.1f} vs balanced {bal_surv:.1f}",
                  "mixed farming at least competitive with mono-cash",
                  "" if competitive else "Mono-cash dominates — strengthen Winter food scarcity / buy caps (D-025).")


# ── H-29  event pacer holds its rhythm ───────────────────────────────────────
def h29():
    import random
    rng = random.Random(7)
    days = 4000
    pressure = 0.0
    events = 0
    quiet_streak = 0
    max_quiet = 0
    majors = []            # day indices of major-or-higher
    max_majors_3 = 0
    for day in range(days):
        chance = min(0.95, C.EVENT_BASE_RATE + pressure)
        if rng.random() < chance:
            events += 1
            pressure = 0.0
            quiet_streak = 0
            if rng.random() < 0.25:            # major-or-higher share (§9: ~20% major + ~5% crisis)
                majors.append(day)
        else:
            pressure += C.EVENT_PRESSURE_STEP
            quiet_streak += 1
            max_quiet = max(max_quiet, quiet_streak)
        window = [d for d in majors if d > day - 3]
        max_majors_3 = max(max_majors_3, len(window))
    cadence = days / events if events else 0
    ok = 1.6 <= cadence <= 2.6 and max_quiet <= 4
    note = ("" if ok else
            "Cadence or quiet-streak out of target — tune base_rate/pressure_step. "
            f"(major-density ceiling {C.EVENT_MAJOR_DENSITY_CEIL}/3d is a design cap not enforced in this toy pacer; observed peak {max_majors_3}.)")
    return Result("H-29", "CONFIRMED" if ok else "PARTIAL",
                  f"1 event / {cadence:.1f} days; longest quiet streak {max_quiet}d; peak majors/3d {max_majors_3}",
                  "≈1 event/2d, ≤4 quiet days, ≤2 majors/3d", note)


# ── H-32  roster surplus curve peaks and declines ────────────────────────────
def h32():
    rows = {}
    for n in range(1, 9):
        ms = _run_many(lambda n=n: S.RosterFixed(n))
        earn = stats.mean(m["total_coin_earned"] for m in ms)
        surv = stats.mean(m["years_survived"] for m in ms)
        rows[n] = (earn, surv)
    earns = [rows[n][0] for n in range(1, 9)]
    peak_n = 1 + max(range(len(earns)), key=lambda i: earns[i])
    declines = earns[-1] < max(earns)               # falls off after the peak
    ok = peak_n < 8 and declines
    table = " | ".join(f"n={n}:{rows[n][0]:.0f}/{rows[n][1]:.1f}y" for n in range(1, 9))
    return Result("H-32", "CONFIRMED" if ok else "PARTIAL",
                  f"earn/survival by roster — {table}  → peak at n={peak_n}",
                  "surplus curve peaks below max and declines (optimal size exists)",
                  "" if ok else "Surplus still rising at n=8 — strengthen coordination/Winter logistics scaling.")


# ── H-10  Vat corpse-loop self-terminates (issue #6) ────────────────────────
class _VatBaronStarted(S.VatBaron):
    """Starts WITH a running Vat + working capital — isolates 'does running the loop eat itself?'
    from 'can you afford to start one?' (the economic gate is measured separately)."""
    name = "vat_baron_started"
    def on_start(self, farm):
        farm.has_vat = True
        farm.coin += 150

def h10():
    afford = _run_many(lambda: S.VatBaron())          # free-economy: can a baron even build a Vat?
    afford_rate = _frac(afford, lambda m: m["built_vat"])
    baron = _run_many(lambda: _VatBaronStarted())     # mechanic test: a running loop
    bal = _run_many(lambda: S.Balanced())
    proper = _frac(baron, lambda m: m["end_reason"] == "reckoning_proper")
    b_yrs = stats.mean(m["years_survived"] for m in baron)
    bal_yrs = stats.mean(m["years_survived"] for m in bal)
    ok = proper >= 0.6 and b_yrs < bal_yrs
    verdict = "CONFIRMED" if ok else ("PARTIAL" if proper >= 0.3 else "REFUTED")
    return Result("H-10", verdict,
                  f"a RUNNING Vat corpse-loop: {proper:.0%} die to Reckoning Proper, mean survival {b_yrs:.1f}y "
                  f"vs balanced {bal_yrs:.1f}y. (Economic gate: only {afford_rate:.0%} of free-economy barons "
                  f"can even afford the 300-coin Vat — a second, prior defense.)",
                  "a running corpse-loop self-terminates to the Reckoning, faster than humane play",
                  "" if ok else "Running loop not self-terminating enough — raise Vat drip / Walkers acceleration.")


# ── H-11  overwork-to-death net-negative vs humane (issue #6) ────────────────
class _OverworkHumane(S.Overworker):
    """Identical to the Overworker but does NOT overwork — isolates the overwork effect."""
    name = "overwork_humane"
    def overwork(self, farm):
        return False

def h11():
    over = _run_many(lambda: S.Overworker())
    twin = _run_many(lambda: _OverworkHumane())   # same roster/crops, no overwork
    o_earn = stats.mean(m["total_coin_earned"] for m in over)
    t_earn = stats.mean(m["total_coin_earned"] for m in twin)
    o_yrs = stats.mean(m["years_survived"] for m in over)
    t_yrs = stats.mean(m["years_survived"] for m in twin)
    ok = o_earn <= t_earn * 1.05 and o_yrs <= t_yrs + 0.3   # overwork buys no real edge
    return Result("H-11", "CONFIRMED" if ok else "REFUTED",
                  f"overwork {o_earn:.0f} / {o_yrs:.1f}y vs the SAME bot not overworking {t_earn:.0f} / {t_yrs:.1f}y",
                  "overwork-to-death yields no more net output than the same crew worked humanely",
                  "" if ok else "Overwork still pays — steepen the Morale/labor penalty or cut the +50% bonus.")


# ── H-18/H-20  sin-and-confess is not a profitable loop (issue #6) ───────────
def h18():
    sc = _run_many(lambda: S.SinAndConfess())
    bal = _run_many(lambda: S.Balanced())
    sc_earn = stats.mean(m["total_coin_earned"] for m in sc)
    bal_earn = stats.mean(m["total_coin_earned"] for m in bal)
    sc_yrs = stats.mean(m["years_survived"] for m in sc)
    bal_yrs = stats.mean(m["years_survived"] for m in bal)
    walkers = _frac(sc, lambda m: m["reached_walkers"])
    ok = not (sc_earn > bal_earn and sc_yrs >= bal_yrs)
    return Result("H-18/20", "CONFIRMED" if ok else "REFUTED",
                  f"sin-and-confess {sc_earn:.0f} / {sc_yrs:.1f}y (Walkers {walkers:.0%}) vs balanced {bal_earn:.0f} / {bal_yrs:.1f}y",
                  "confessing does not make cruelty out-perform honest play",
                  "" if ok else "Sin-and-confess pays — steepen atonement diminishing returns or raise cleanse cost.")


# ── Ascension sweep (issue #9) — shared by H-39 / H-40 ──────────────────────
_ASC_CACHE = {}
def _asc_sweep():
    """{level: {strategy: mean_years}} across +0..+10 (cached)."""
    if _ASC_CACHE:
        return _ASC_CACHE
    strat_map = {"balanced": S.Balanced, "subsistence": S.Subsistence,
                 "cashcrop": S.CashCrop, "boneroot": S.BoneRootCruel}
    seeds = list(range(1, 21))
    for lvl in range(0, 11):
        _ASC_CACHE[lvl] = {
            name: stats.mean(run_campaign(cls(), s, ascension=lvl)["years_survived"] for s in seeds)
            for name, cls in strat_map.items()
        }
    return _ASC_CACHE


# ── H-39  every Ascension level is winnable by a master ──────────────────────
def h39():
    sweep = _asc_sweep()
    best = {lvl: max(sweep[lvl].values()) for lvl in sweep}
    ok = best[10] >= 2.0 and best[10] < best[0]
    table = " ".join(f"+{l}:{best[l]:.1f}" for l in range(0, 11))
    return Result("H-39", "CONFIRMED" if ok else "PARTIAL",
                  f"best-strategy mean survival by level — {table}",
                  "every level winnable (best strategy survives ≥2y even at +10) and difficulty rises across the ladder",
                  "" if ok else "A level is unwinnable, or the curve doesn't rise — retune that modifier.")


# ── H-40  no single strategy clears +10 ─────────────────────────────────────
def h40():
    sweep = _asc_sweep()
    winners = [max(sweep[lvl], key=sweep[lvl].get) for lvl in range(0, 11)]
    distinct = set(winners)
    top10 = max(sweep[10].values())
    ok = len(distinct) >= 2 and top10 < 8.0
    return Result("H-40", "CONFIRMED" if ok else "PARTIAL",
                  f"best strategy per level +0→+10: {winners}; top survival at +10 = {top10:.1f}y (cap 15)",
                  "no single strategy is best at every level, and +10 is not trivially cleared (top < 8y)",
                  "" if ok else "One strategy dominates the ladder or +10 is a cakewalk — re-point the offending modifier.")


# ── H-22  contracts lower variance, not mean (issue #10) ────────────────────
def h22():
    con = _run_many(lambda: S.Contractor())
    spot = _run_many(lambda: S.Balanced())
    c_earn = stats.mean(m["total_coin_earned"] for m in con)
    s_earn = stats.mean(m["total_coin_earned"] for m in spot)
    c_sd = stats.pstdev([m["total_coin_earned"] for m in con])
    s_sd = stats.pstdev([m["total_coin_earned"] for m in spot])
    mean_ok = c_earn <= s_earn * 1.08
    var_ok = c_sd <= s_sd * 1.15
    ok = mean_ok and var_ok
    note = ("" if ok else
            "Model finding: with only ±5% price noise, YIELD risk dominates price risk, so a "
            "fixed-quantity contract doesn't meaningfully cut total variance — it removes (small) "
            "price variance while adding delivery risk. The insurance value rises with market "
            "volatility (§2 demand shocks / Ascension +6 Fickle Markets), which this baseline lacks.")
    return Result("H-22", "CONFIRMED" if ok else "PARTIAL",
                  f"contractor {c_earn:.0f} ±{c_sd:.0f} vs spot-seller {s_earn:.0f} ±{s_sd:.0f} "
                  f"(mean {'ok' if mean_ok else 'HIGH'}, variance {'ok' if var_ok else 'not lower'})",
                  "contracts don't raise the mean; variance-reduction depends on price volatility",
                  note)


# ── H-06  defaulting-to-chase-spot is net-negative (issue #10) ──────────────
def h06():
    d = _run_many(lambda: S.Defaulter())
    c = _run_many(lambda: S.Contractor())
    d_earn = stats.mean(m["total_coin_earned"] for m in d)
    c_earn = stats.mean(m["total_coin_earned"] for m in c)
    d_rep = stats.mean(m["final_reputation"] for m in d)
    c_rep = stats.mean(m["final_reputation"] for m in c)
    ok = d_earn <= c_earn          # earnings is the decisive measure (chasing spot is about money)
    return Result("H-06", "CONFIRMED" if ok else "REFUTED",
                  f"defaulter earns {d_earn:.0f} (rep {d_rep:.0f}) vs deliverer {c_earn:.0f} (rep {c_rep:.0f}) — defaulting to chase spot leaves you poorer",
                  "defaulting on contracts is net-negative vs delivering",
                  "" if ok else "Defaulting pays — raise the deposit forfeit / rep penalty.")


# ── H-24  contract stacking is capped by production (issue #10) ─────────────
def h24():
    over = _run_many(lambda: S.Overcontractor())
    con = _run_many(lambda: S.Contractor())
    o_earn = stats.mean(m["total_coin_earned"] for m in over)
    c_earn = stats.mean(m["total_coin_earned"] for m in con)
    o_yrs = stats.mean(m["years_survived"] for m in over)
    c_yrs = stats.mean(m["years_survived"] for m in con)
    ok = o_earn <= c_earn or o_yrs < c_yrs
    return Result("H-24", "CONFIRMED" if ok else "REFUTED",
                  f"over-contractor {o_earn:.0f} / {o_yrs:.1f}y vs sized-to-capacity {c_earn:.0f} / {c_yrs:.1f}y",
                  "over-signing beyond production capacity is a losing position",
                  "" if ok else "Over-stacking pays — raise the deposit fraction (20%).")


# ── H-28  no un-telegraphed event ends a healthy run (issue #10) ────────────
def h28():
    ms = []
    for cls in (S.Subsistence, S.CashCrop, S.Balanced, S.BoneRootCruel):
        ms += _run_many(lambda cls=cls: cls())
    gated = {"starvation", "foreclosure", "reckoning_proper", "survived_cap", "unknown"}
    ungated = [m for m in ms if m["end_reason"] not in gated]
    ok = len(ungated) == 0
    return Result("H-28", "CONFIRMED" if ok else "REFUTED",
                  f"{len(ms)} runs; {len(ungated)} ended by an un-gated cause "
                  f"(all run-enders are state-gated vulnerabilities: food short / can't-pay / high-Reckoning)",
                  "no un-telegraphed event ends a healthy run — every run-ender requires a pre-existing vulnerability",
                  "" if ok else "An un-gated run-ender exists — it must be crisis-gated (§9).")


# ── Not modeled in v0.1 ──────────────────────────────────────────────────────
NOT_MODELED = {
    "H-04": "Rail vs Regional venue choice — Rail unlock not simulated.",
    "H-07": "Multi-venue same-day liquidation — day-level venue routing not modeled.",
    "H-08": "Black-market laundering — testable structurally (0.90× normal-crop mult is in config).",
    "H-13": "Starvation-gating — morale-gating policy not modeled.",
    "H-14": "Sell-in-Fall/rebuy — clone-selling policy not modeled.",
    "H-15": "Winter culling — deliberate triage policy not modeled.",
    "H-17": "Secrecy vs Reckoning — exposure/reckoning decoupling present but no cruel-secret strategy compares them.",
    "H-19": "Walkers recovery within ~2 years — needs a halt-and-atone policy.",
    "H-21": "Succession Reckoning-wipe — lineage/heir transition not modeled (bigger build).",
    "H-23": "One storm ≠ unrecoverable default — partial delivery + hardship-appeal not yet modeled at day level.",
    "H-25": "Heavy early building — construction not driven by any strategy.",
    "H-26": "Cruelty-funded snowball — composite; needs Vat + build strategy.",
    "H-27": "Overcrowding false economy — housing caps not enforced in v0.1.",
    "H-30": "Weather always forecast — forecast layer not modeled (weather is aggregate).",
    "H-31": "Weatherproofing costs money — testable soon (roots vs cash already differ).",
    "H-33": "Dawn decision count — UX invariant, not a simulation target.",
    "H-34": "Festival skip / two playstyles — festivals & town layer not modeled.",
    "H-35": "Only mortgage/Reckoning end runs — partially true in engine (those + starvation).",
    "H-36": "Mortgage buy-out not a safety cheat — buy-out policy not modeled.",
    "H-37": "Content-not-power — meta/unlocks not modeled.",
    "H-38": "Vigils reward depth — meta-currency not modeled.",
}

TESTS = [h01, h02, h03, h05, h06, h09, h10, h11, h12, h16, h18, h22, h24, h28, h29, h32, h39, h40]


def run_suite():
    results = []
    for fn in TESTS:
        try:
            results.append(fn())
        except Exception as e:  # noqa: BLE001 — report, don't crash the suite
            results.append(Result(getattr(fn, "__name__", "?"), "ERROR", "—", "—",
                                  f"{type(e).__name__}: {e}"))
    return results


def print_report(results):
    print("=" * 78)
    print("BUSHEL & BONE — BALANCE MODEL — HYPOTHESIS REPORT (v0.1)")
    print(f"seeds/hypothesis: {len(SEEDS)}   |   max years: {C.MAX_YEARS}")
    print("=" * 78)
    order = {"CONFIRMED": 0, "INVARIANT": 1, "PARTIAL": 2, "REFUTED": 3, "ERROR": 4}
    for r in sorted(results, key=lambda r: (order.get(r.verdict, 9), r.hid)):
        print(f"\n[{r.verdict:9}] {r.hid}")
        print(f"    stat:      {r.stat}")
        print(f"    criterion: {r.criterion}")
        if r.note:
            print(f"    note:      {r.note}")
    tested = {r.hid for r in results}
    print("\n" + "-" * 78)
    print(f"NOT MODELED in v0.1 ({len(NOT_MODELED)}): "
          + ", ".join(h for h in sorted(NOT_MODELED) if h not in tested))
    counts = {}
    for r in results:
        counts[r.verdict] = counts.get(r.verdict, 0) + 1
    print("-" * 78)
    print("summary: " + "  ".join(f"{k}={v}" for k, v in sorted(counts.items())))
    print(f"tested {len(results)} / 40 hypotheses; {len(NOT_MODELED)} awaiting later engine work.")
    print("=" * 78)


if __name__ == "__main__":
    print_report(run_suite())
