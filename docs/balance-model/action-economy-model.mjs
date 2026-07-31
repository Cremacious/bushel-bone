// Action-economy design model for Bushel & Bone (#49 pacing + #50 action economy).
//
// PURPOSE: not the game sim. This is an abstract, transparent model of ONE question:
// given D days in a season and some rule for how many "player action points" you get,
// how often does the player face a real choice (more worthwhile things to do than points),
// how often are they idle (a point but nothing worth doing), and how varied is play?
//
// It models DEMAND (worthwhile things the player alone can do on a given day) vs SUPPLY
// (action points, under different renewal rules). All demand parameters are explicit
// constants below so Chris can see and tune the assumptions. Deterministic (seeded).
//
// The target feel ("wiggle room, but must strategize"): oversubscription R = demand/supply
// in a tight-but-fair band (deckbuilder/roguelite norm ~1.3 to 2.0), a LOW idle rate
// (rarely nothing to do), and HIGH action diversity (no single repeated dominant move).

// ---- seeded PRNG (stable results) ----
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

// ---- DEMAND MODEL (the assumptions; tune these) ----
// Each day, the player MAY have these "only-the-player" opportunities. Values: 3=essential
// (skip it and you risk losing food or a hand), 2=strong (coin, pushing a crop), 1=nicety
// (a social call, relationship). Crew tasks (tend/chop/forage-as-a-hand) are standing orders,
// NOT player points, so they are out of this model. This is the PLAYER's own time only.
const DEMAND = {
  // Forage (food): an essential appears more often as the larder tightens later in a season.
  forageBase: 0.20, forageRampPerDay: 0.06,   // p(day 1)=0.20 ... p(day 10)=0.74
  // Care (a worn hand): more likely the longer the crew has been worked, and with more hands.
  careBase: 0.10, careRampPerDay: 0.05,
  // A town JOB (coin): only if jobs remain this season and no cooldown is active.
  jobValue: 2,
  // A town TALK / social nicety: essentially always available, low value.
  talkValue: 1, talkProb: 0.9,
  // Work-a-field (push a crop that wants it): mostly mid-season while crops are growing.
  fieldProb: 0.45, fieldValue: 2,
  forageValue: 3, careValue: 3,
};

// A season's worth of days, generating that day's opportunity list. `jobsLeft`/`jobCooldownUntil`
// are carried across days by the caller so job rules (scarcity + respawn) are testable.
function dayOpportunities(rng, day, D, ctx) {
  const ops = [];
  const pForage = Math.min(0.95, DEMAND.forageBase + DEMAND.forageRampPerDay * (day - 1));
  const pCare   = Math.min(0.9,  DEMAND.careBase   + DEMAND.careRampPerDay   * (day - 1));
  if (rng() < pForage) ops.push({ type: "forage", value: DEMAND.forageValue });
  if (rng() < pCare)   ops.push({ type: "care",   value: DEMAND.careValue });
  if (rng() < DEMAND.fieldProb && day < D) ops.push({ type: "field", value: DEMAND.fieldValue });
  // A job is on offer only if there are jobs left and the respawn cooldown has elapsed.
  if (ctx.jobsLeft > 0 && day >= ctx.jobCooldownUntil) ops.push({ type: "job", value: DEMAND.jobValue });
  if (rng() < DEMAND.talkProb) ops.push({ type: "talk", value: DEMAND.talkValue });
  return ops;
}

// ---- SUPPLY RULES (the configs we are testing) ----
// Each returns, for a given day, how many points are available to spend THIS day.
// - pool: A points for the whole season, usable any day until gone (the current design).
// - daily: A points every day, do NOT carry over (renew each day) -> Slay-the-Spire / Stardew.
// - weekly: A points every `period` days.
const CONFIGS = [
  { name: "current: 5/season pool",        rule: "pool",  A: 5 },
  { name: "8/season pool",                 rule: "pool",  A: 8 },
  { name: "1/day renewing",                rule: "daily", A: 1 },
  { name: "2/day renewing",                rule: "daily", A: 2 },
  { name: "3/day renewing",                rule: "daily", A: 3 },
  { name: "2/day renew + job 3d cooldown", rule: "daily", A: 2, jobCooldown: 3 },
  { name: "1/day + carryover cap 2",       rule: "carry", A: 1, cap: 2 },
  { name: "3 per 2 days (=1.5/day)",       rule: "weekly",A: 3, period: 2 },
  { name: "1/day + carry cap2 + job 3d cd",rule: "carry", A: 1, cap: 2, jobCooldown: 3 },
];

const D = 10;              // days per season
const JOBS_PER_SEASON = 3; // town jobs available across a season
const SEASONS = 4000;      // Monte Carlo seasons per config

function simulate(cfg) {
  let sumChoiceDays = 0, sumIdlePoints = 0, sumPointsUsed = 0, sumEssMissed = 0, sumOps = 0, sumStrongOps = 0;
  const typeCounts = {};
  let sumDistinct = 0;
  for (let s = 0; s < SEASONS; s++) {
    const rng = mulberry32(0x9e3779b9 ^ (s * 2654435761));
    let pool = cfg.rule === "pool" ? cfg.A : 0;
    let carry = 0;
    const ctx = { jobsLeft: JOBS_PER_SEASON, jobCooldownUntil: 1 };
    const seasonTypes = new Set();
    for (let day = 1; day <= D; day++) {
      // points available today under this config's rule
      let pts;
      if (cfg.rule === "pool")   pts = pool;
      else if (cfg.rule === "daily") pts = cfg.A;
      else if (cfg.rule === "carry") pts = Math.min(cfg.cap, carry + cfg.A);
      else if (cfg.rule === "weekly") pts = (day % cfg.period === 1 || cfg.period === 1) ? cfg.A + carry : carry;
      const ops = dayOpportunities(rng, day, D, ctx).sort((a, b) => b.value - a.value);
      const strong = ops.filter(o => o.value >= 2);
      sumOps += ops.length; sumStrongOps += strong.length;
      // A real choice-day = more worthwhile (value>=2) options than points can cover.
      if (strong.length > pts && pts > 0) sumChoiceDays++;
      // Greedy spend: take the highest-value ops up to points available.
      let spent = 0;
      const canSpendToday = cfg.rule === "pool" ? pool : pts;
      for (const o of ops) {
        if (spent >= canSpendToday) break;
        // Only spend on a nicety (value 1) if nothing better remains AND we have a point to spare.
        spent++;
        seasonTypes.add(o.type);
        typeCounts[o.type] = (typeCounts[o.type] || 0) + 1;
        if (o.type === "job") { ctx.jobsLeft--; ctx.jobCooldownUntil = day + (cfg.jobCooldown || 0); }
      }
      sumPointsUsed += spent;
      // Idle points: points available but no worthwhile (value>=1) op to use them on.
      const idle = Math.max(0, canSpendToday - ops.length);
      sumIdlePoints += idle;
      // Essentials missed: value-3 ops we could not take.
      const essentials = ops.filter(o => o.value === 3).length;
      sumEssMissed += Math.max(0, essentials - Math.min(spent, essentials));
      if (cfg.rule === "pool") pool -= spent;
      if (cfg.rule === "carry") carry = Math.min(cfg.cap, Math.max(0, pts - spent));   // bank unspent, up to the cap
      if (cfg.rule === "weekly") carry = Math.max(0, pts - spent);
    }
    sumDistinct += seasonTypes.size;
  }
  const perDayOps = (sumOps / SEASONS / D);
  const perDayStrong = (sumStrongOps / SEASONS / D);
  const supplyPerDay = cfg.rule === "pool" ? cfg.A / D : cfg.rule === "weekly" ? cfg.A / cfg.period : cfg.A;
  return {
    name: cfg.name,
    R: (perDayStrong / supplyPerDay),                 // oversubscription (strong demand / supply)
    choiceDayRate: sumChoiceDays / SEASONS / D,        // fraction of days you must drop something worthwhile
    idlePerSeason: sumIdlePoints / SEASONS,            // wasted points per season (boredom signal)
    pointsUsed: sumPointsUsed / SEASONS,               // engagement (actions taken per season)
    essMissedPerSeason: sumEssMissed / SEASONS,        // essentials you had to skip (too tight?)
    diversity: sumDistinct / SEASONS,                  // distinct action types used per season (dominant-strategy inverse)
  };
}

const pad = (s, n) => String(s).padEnd(n);
const num = (x, n = 2) => x.toFixed(n);
console.log(`Model: D=${D} days, ${JOBS_PER_SEASON} jobs/season, ${SEASONS} seasons/config\n`);
console.log(pad("config", 34), pad("R", 6), pad("must-choose", 12), pad("idle/season", 12), pad("actions", 8), pad("ess.missed", 11), "diversity");
console.log("-".repeat(100));
for (const cfg of CONFIGS) {
  const r = simulate(cfg);
  console.log(
    pad(r.name, 34),
    pad(num(r.R), 6),
    pad(num(r.choiceDayRate * 100, 0) + "%", 12),
    pad(num(r.idlePerSeason), 12),
    pad(num(r.pointsUsed, 1), 8),
    pad(num(r.essMissedPerSeason), 11),
    num(r.diversity, 2),
  );
}
console.log(`
Legend:
  R            oversubscription = strong demand / supply per day. Target ~1.3 to 2.0 (must choose, not paralyzed).
  must-choose  % of days you have MORE worthwhile options than points (the "strategize" signal). Higher = more decisions.
  idle/season  points with nothing worthwhile to spend on (the BOREDOM signal). Target near 0.
  actions      player actions actually taken per season (engagement). Current pool front-loads then goes quiet.
  ess.missed   essentials (food/care) you were forced to skip. Should be low but not always 0 (some real risk).
  diversity    distinct action TYPES used per season, out of 5 (forage/care/field/job/talk). Low = dominant-strategy risk.`);
