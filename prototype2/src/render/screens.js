import { el, clear } from "./dom.js";
import { seasonLabel, DAYS_PER_SEASON, livingHands } from "../core/state.js";
import { L } from "../content/script.js";
import { tok } from "../content/names.js";
import { choiceCard, fieldCard } from "./components.js";
import { CROPS, ripe } from "../core/crops.js";
import { fieldLabel, conditionOf, duskSummary, yearNeeds, townOffers, standingOf, standingWord, tirednessAdvice, talkIsDry, mortgageDue, hireCost, canHire, seedBundleCost, canBuySeed, interrupts, roleLabel, roleDesc, burnsFuel } from "../core/selectors.js";
import { SCENES, openingSceneId } from "../content/scenes.js";
import { counselFor } from "../content/counsel.js";
import { BALANCE } from "../core/balance.js";
import { LOCATIONS, TALKS } from "../core/town.js";

// Fleshed out across Tasks 8-12. Renders the active screen into the shell's stage.
export function renderScreen(stage, state, dispatch) {
  const view = state.screen === "home" ? state.phase : state.screen;
  const fn = SCREENS[view] || SCREENS.unknown;
  fn(stage, state, dispatch);
}

const SCREENS = {
  unknown: (stage, s) => stage.append(el("p", { class: "t-prose", text: `(${s.screen}/${s.phase})` })),

  brief: (stage, s, dispatch) => {
    const isFirst = s.year === 1 && s.seasonIndex === 0;
    const eyebrow = isFirst ? tok(L("spring_open.eyebrow")) : `${seasonLabel(s)} · a new season`;
    const title = isFirst ? tok(L("spring_open.title")) : "The season turns";
    const body = isFirst ? tok(L("spring_open.body")) : `<div class="prose"><p>The work of ${seasonLabel(s)} is on you now.</p></div>`;
    // If the season opens on a scripted scene (Year 1 → Ridley's call), Begin plays it
    // first; otherwise it drops straight into the season.
    const opener = openingSceneId(s);
    const begin = opener
      ? () => dispatch({ type: "OPEN_SCENE", id: opener })
      : () => dispatch({ type: "BEGIN_SEASON" });
    stage.append(
      el("div", { class: "eyebrow t-label", text: eyebrow }),
      el("h2", { class: "t-title", text: title }),
      htmlProse(body),
    );
    if (mortgageDue(s).total > 0) {
      stage.append(el("p", { class: "t-sub", text: "The bank's notes come due this winter." }));
    }
    stage.append(choiceCard({ text: "Begin", sub: "set the season to its work", primary: true }, begin));
  },

  // A scripted NPC scene: the speaker's beat, then either the choices or the chosen
  // result and a way on. Prose comes from content/script.yaml via L(id + ".field").
  scene: (stage, s, dispatch) => {
    const id = s.scene.id, sc = SCENES[id] || { choices: [] };
    stage.append(
      el("div", { class: "eyebrow t-label", text: tok(L(id + ".eyebrow")) }),
      el("h2", { class: "t-title", text: tok(L(id + ".title")) }),
    );
    if (!s.scene.result) {
      // the beat: the speaker's lines, then the choices.
      stage.append(htmlProse(tok(L(id + ".body"))));
      // A question scene is a prompt with a right answer: showing "+3 regard" on the correct
      // choice would spoil it, so question scenes carry no fx tag. Every other kind (payload,
      // moral, haggle, event) keeps its tag so the stake stays legible.
      const isQuestion = sc.kind === "question";
      for (const cid of sc.choices) {
        const t = fxTag((sc.fx && sc.fx[cid]) || {});
        stage.append(choiceCard(
          { text: tok(L(id + "." + cid + ".text")), sub: tok(L(id + "." + cid + ".sub")),
            tag: isQuestion ? null : t.text, tagValence: isQuestion ? "" : t.valence },
          () => dispatch({ type: "CHOOSE_SCENE", choiceId: cid }),
        ));
      }
    } else {
      // after a choice: only what came of it, not the whole beat again.
      stage.append(
        htmlProse(`<div class="prose"><p>${tok(L(id + "." + s.scene.result + ".result"))}</p></div>`),
        choiceCard({ text: "Go on", sub: "to the work of the year", primary: true },
          () => dispatch({ type: "CLOSE_SCENE" })),
      );
    }
  },
  planting: (stage, s, dispatch) => {
    // Only crops sown THIS dawn (progress still 0) count toward the spend; a 2-season crop
    // carried over from last season is still growing (progress > 0), not paid for again.
    const spent = s.fields.reduce((n, f) => n + (f.crop && f.progress < 1e-9 ? CROPS[f.crop].seed : 0), 0);
    stage.append(
      el("div", { class: "eyebrow t-label", text: "Dawn · Planting" }),
      el("h2", { class: "t-title", text: "Set the fields" }),
      ...counsel(s),
      el("div", { class: "plant-bar" }, [
        el("span", { class: "t-sub", text: `Seed ${s.seed} · Coin ${s.coin} · this planting costs ${spent}` }),
        choiceCard({ text: "Sow it so", sub: "put the season in the ground", primary: true }, () => dispatch({ type: "SOW" })),
      ]),
      el("p", { class: "t-sub plant-hint", text: "Set each field on the left, then sow." }),
    );
  },
  // The BEAT screen: shown only when the auto-run of days stops (interrupts()) or the season
  // ends. Short and scannable (the playtest complaint was scrolling): the beat itself, a
  // one-line resource status, the crew's role toggles, your season actions, and the way on.
  day: (stage, s, dispatch) => {
    const reasons = interrupts(s);
    // Day 1 with nothing pressing is the guaranteed opening beat: the player's first turn to set
    // the crew and spend an action before the days run on. Interrupts still win when present.
    const title = reasons.length ? reasons[0]
      : (s.day === 1 ? "A new season. Set your hands." : "A quiet stretch.");
    stage.append(
      el("div", { class: "eyebrow t-label", text: `Day ${s.day} of ${DAYS_PER_SEASON}` }),
      el("h2", { class: "t-title beat-title", text: title }),
    );
    for (const r of reasons.slice(1)) stage.append(el("p", { class: "beat-reason", text: r }));

    // Resource status, compact: a tinted strip of labeled cells. Larder + Fuel always; in the
    // cold months (or when short) the winter targets too, each cell reddening when it falls short.
    const n = yearNeeds(s);
    const woodShort = n.fuel.have < n.fuel.need;
    const foodShort = n.food.have < n.food.need;
    const strip = el("div", { class: "beat-strip" }, [
      beatCell("Larder", Math.floor(s.larder)),
      beatCell("Fuel", s.fuel),
    ]);
    if (burnsFuel(s) || woodShort || foodShort) {
      strip.append(
        beatCell("Wood for winter", `${n.fuel.have}/${n.fuel.need}`, woodShort),
        beatCell("Food for winter", `${n.food.have}/${n.food.need}`, foodShort),
      );
    }
    stage.append(strip);

    // The crew: name + Tiredness + a role toggle. Standing orders, so this is set-and-forget.
    const ROLES = ["field", "wood", "forage", "rest"];
    for (const h of livingHands(s)) {
      stage.append(el("div", { class: "crewbeat" }, [
        el("div", { class: "crewbeat-head" }, [
          el("span", { class: "hname t-choice", text: h.name }),
          el("span", { class: "strain-advice t-sub", text: tirednessAdvice(h) }),
        ]),
        el("div", { class: "rolerow" }, ROLES.map((r) =>
          el("button", { class: "rolebtn" + (h.role === r ? " sel" : ""), title: roleDesc(r),
            onClick: () => dispatch({ type: "SET_ROLE", handId: h.id, role: r }) }, [
            el("span", { text: roleLabel(r) }),
          ]))),
      ]));
    }

    // Your season: the shared action pool, spent at a beat.
    const growing = s.fields.filter((f) => f.crop && !ripe(f));
    const worn = livingHands(s).find((h) => h.strain >= BALANCE.strain.wornAt);
    const left = s.actions; // TASK 2: redesign this "your time" copy for the per-day action-point model
    stage.append(el("p", { class: "t-sub season-h", text: `Your own time this season: ${left} of ${BALANCE.actionsCarryCap} left.` }));
    stage.append(el("p", { class: "t-sub season-hint", text: "Spend it foraging, on a hand, or riding to town. It refills next season." }));
    const seasonOpts = [
      { kind: "forage", label: "Forage" },
      ...(growing.length ? [{ kind: "work", target: growing[0].id, label: "Work a field" }] : []),
      ...(worn ? [{ kind: "care", target: worn.id, label: `Sit with ${worn.name}` }] : []),
    ];
    // Two-tap confirm: a spend button is a real, one-tap commitment, so a stray tap must not
    // burn a season action. The first tap ARMS the option in place (no dispatch); a Yes then
    // spends, a Not yet restores the button. This transient armed state lives purely in the
    // render closure, since any real dispatch re-renders the whole beat screen. (The disabled
    // pool-empty case never arms; the free Ride-to-town button below gets no confirm.)
    const actRow = el("div", { class: "seasonact" });
    for (const o of seasonOpts) {
      const cell = el("span", { class: "seasonact-cell" });
      const spend = () => dispatch({ type: "SPEND_ACTION", kind: o.kind, target: o.target });
      const idle = () => {
        clear(cell);
        cell.append(el("button", { class: "seasonbtn" + (left <= 0 ? " disabled" : ""),
          ...(left <= 0 ? { disabled: true } : {}),
          onClick: left > 0 ? arm : undefined,
          text: o.label }));
      };
      const arm = () => {
        clear(cell);
        cell.append(
          el("span", { class: "season-ask t-sub", text: `Spend an action to ${o.label.toLowerCase()}?` }),
          el("button", { class: "seasonbtn yes", onClick: spend, text: "Yes" }),
          el("button", { class: "seasonbtn notyet", onClick: idle, text: "Not yet" }),
        );
      };
      idle();
      actRow.append(cell);
    }
    stage.append(actRow);
    stage.append(el("button", { class: "seasonbtn", text: "Ride to Marrow's Cross →",
      onClick: () => dispatch({ type: "SET_SCREEN", screen: "town" }) }));

    // The way on. A timing hint sits above it (except on the last day): the crew's standing
    // orders resolve as the days run on, so the player knows the Continue card is what enacts them.
    if (s.day < DAYS_PER_SEASON) {
      stage.append(el("p", { class: "t-sub runhint", text: "Your crew's orders take effect as the days run on." }));
    }
    stage.append(s.day >= DAYS_PER_SEASON
      ? choiceCard({ text: "Bring the season to a close", sub: "the day-book, and what comes next", primary: true },
          () => dispatch({ type: "CONTINUE" }))
      : choiceCard({ text: "Let the days run on", sub: "until something wants you", primary: true },
          () => dispatch({ type: "CONTINUE" })));
  },
  dusk: (stage, s, dispatch) => {
    const d = duskSummary(s);
    stage.append(el("div", { class: "eyebrow t-label", text: `Dusk · ${seasonLabel(s)}` }), el("h2", { class: "t-title", text: "The day-book, closed" }));
    const book = el("div", { class: "daybook" }, [
      line("Coin in hand", `${d.coin} m`, 0), line("Larder into next season", `${d.larder} food`, 1),
      line("Fuel laid by", `${d.fuel}`, 2), line("The crew that stands", d.crew.join(", ") || "only you", 3),
    ]);
    stage.append(book);
    // The crew snapshot: each living hand's end-of-season condition, worded and colored, so a
    // season spent on Rest or Care visibly pays off (steady green, worn neutral, failing red).
    const living = livingHands(s);
    if (living.length) {
      stage.append(el("div", { class: "eyebrow t-label crewsnap-h", text: "The crew" }));
      const condClass = { steady: "good", worn: "", failing: "bad", lost: "bad" };
      for (const h of living) {
        const cond = conditionOf(h);
        const cls = condClass[cond] || "";
        stage.append(el("p", { class: "crewsnap-line t-sub" }, [
          el("span", { class: "crewsnap-name", text: h.name }),
          document.createTextNode(", "),
          el("span", { class: "crewsnap-cond" + (cls ? " " + cls : ""), text: cond }),
          document.createTextNode("."),
        ]));
      }
    }
    for (const l of d.lostThisSeason) stage.append(el("p", { class: "omen t-sub", text: l }));
    for (const w of d.warnings) stage.append(el("p", { class: "warnline t-sub", text: w }));
    stage.append(choiceCard({ text: "Turn the page", sub: "on to what comes next", primary: true }, () => dispatch({ type: "END_SEASON" })));
  },
  settlement: (stage, s, dispatch) => {
    const due = mortgageDue(s);
    stage.append(
      el("div", { class: "eyebrow t-label", text: `Year ${s.year} · the accounts` }),
      el("h2", { class: "t-title", text: "The year, settled" }),
    );
    // the year's carried figures
    const book = el("div", { class: "daybook" }, [
      line("Coin in hand", `${s.coin} m`, 0),
      line("Larder", `${Math.floor(s.larder)} food`, 1),
      line("Fuel", `${s.fuel}`, 2),
      line("The crew that stands", livingHands(s).map((h) => h.name).join(", ") || "only you", 3),
    ]);
    stage.append(book);
    // the mortgage line
    if (due.total > 0) {
      stage.append(el("p", { class: "prose t-prose", text:
        `The bank wants ${due.payment}m against the mortgage this winter${due.upkeep ? `, and ${due.upkeep}m in upkeep` : ""}. ` +
        (s.coin >= due.total ? "You have it." : "You are short, and short is not a thing the bank forgets.") }));
    } else {
      stage.append(el("p", { class: "prose t-prose", text: "The bank asks nothing of you yet. Next year the notes come due." }));
    }
    if (s.mortgage.warned) stage.append(el("p", { class: "warnline t-sub", text: "You are behind on the mortgage. Fall behind again and the bank takes the land." }));
    stage.append(choiceCard({ text: "Turn the year", sub: "on into the next Spring", primary: true }, () => dispatch({ type: "TURN_YEAR" })));
  },
  foreclosed: (stage, s) => {
    stage.append(
      el("div", { class: "verdict t-label", text: `Year ${s.year} · the end of it` }),
      el("h2", { class: "t-title", text: "The bank has taken the land." }),
      el("p", { class: "prose t-prose", text: `Your line held the ${s.lineageName} place ${s.year - 1} full ${s.year - 1 === 1 ? "year" : "years"} before the notes came due for good. The ground goes back to the Company. Another family will work it now.` }),
      choiceCard({ text: "Begin a new line", sub: "a new name, a new ground", primary: true }, () => { try { location.reload && location.reload(); } catch { /* jsdom: no-op */ } }),
    );
  },
  // Read-only status tabs, open anytime. They read state and never dispatch a mutation.
  fields: (stage, s) => {
    stage.append(el("div", { class: "eyebrow t-label", text: "The fields" }), el("h2", { class: "t-title", text: "What is in the ground" }));
    for (const f of s.fields) {
      const row = el("div", { class: "fieldrow" }, [
        el("div", { class: "fieldname t-choice", text: fieldLabel(f) }),
        el("div", { class: "fert", text: "fert " + "●".repeat(f.fert) + "○".repeat(3 - f.fert) }),
      ]);
      if (f.crop) {
        const c = CROPS[f.crop];
        const pct = Math.min(100, Math.round((f.progress / c.seasons) * 100));
        row.append(el("div", { class: "t-sub", text: ripe(f) ? `${c.name}, ripe and waiting on the harvest` : `${c.name}, coming on (${pct}%)` }));
      } else {
        row.append(el("div", { class: "t-sub", text: "fallow, unplanted" }));
      }
      stage.append(row);
    }
  },
  hands: (stage, s) => {
    stage.append(el("div", { class: "eyebrow t-label", text: "The hands" }), el("h2", { class: "t-title", text: "Who stands, and how" }));
    for (const h of livingHands(s)) {
      const isForeman = s.foremanId === h.id;
      const row = el("div", { class: "handrow" }, [
        el("span", { class: "hname t-choice", text: h.name + (isForeman ? " · foreman" : "") }),
        el("span", { class: "hcond t-sub", text: conditionOf(h) }),
      ]);
      row.append(el("div", { class: "t-sub", text: "set to: " + roleLabel(h.role) }));
      stage.append(row);
    }
  },
  ledger: (stage) => {
    stage.append(el("div", { class: "eyebrow t-label", text: "The ledger" }), el("h2", { class: "t-title", text: "What the four figures mean" }));
    for (const [label, body] of LEDGER_ROWS) {
      stage.append(el("div", { class: "ledgerrow" }, [
        el("div", { class: "t-choice", text: label }),
        el("div", { class: "t-sub", text: body }),
      ]));
    }
  },
  town: (stage, s, dispatch) => {
    const canAct = s.phase === "day" && s.actions > 0; // TASK 2: redesign town copy for per-day action points
    const why = s.phase !== "day" ? "Come back during the day." : s.actions <= 0 ? "You are spent for the day." : null;
    const spent = !canAct;
    // Leaving town is always free; it never carries a cost tag.
    const homeCard = () => choiceCard({ text: "Head back to the farm", sub: "on to the day's work" },
      () => dispatch({ type: "LEAVE_TOWN" }));
    const spentNote = () => el("p", { class: "t-sub", text: "You are spent for the day. Head home to turn in." });

    if (!s.townAt) {
      const { jobs } = townOffers(s);
      stage.append(
        el("div", { class: "eyebrow t-label", text: "Marrow's Cross" }),
        el("h2", { class: "t-title", text: "Where to?" }),
        el("p", { class: "t-sub townhint", text: canAct ? `You have ${s.actions} to spend here.` : (why || "The town is quiet.") }),
      );
      if (spent) stage.append(homeCard(), spentNote());
      stage.append(el("div", { class: "eyebrow t-label townsub", text: "Work going" }));
      for (const j of jobs) {
        const blocked = !canAct || j.done;
        stage.append(choiceCard({
          text: j.line,
          sub: j.done ? "done today" : (why || `+${j.coin} coin · ${tok("{{npc." + j.giver + "}}")}`),
          tag: (canAct && !j.done) ? "-1 action" : null,
          tagValence: "bad",
          disabled: blocked,
          why: j.done ? "done today" : why,
        }, () => dispatch({ type: "ACCEPT_JOB", id: j.id })));
      }
      stage.append(el("div", { class: "eyebrow t-label townsub", text: "The town" }));
      for (const l of LOCATIONS) {
        // Walking to a place is free; it never carries a cost tag.
        stage.append(choiceCard({ text: tok("{{loc." + l.loc + ".sub}}"), sub: l.purpose },
          () => dispatch({ type: "WALK_TO", place: l.id })));
      }
      if (!spent) stage.append(homeCard());
      return;
    }

    const l = LOCATIONS.find((x) => x.id === s.townAt) || LOCATIONS[0];
    const canTalk = canAct;
    stage.append(
      el("div", { class: "eyebrow t-label", text: tok("{{loc." + l.loc + ".cap}}") }),
      el("h2", { class: "t-title", text: tok("{{loc." + l.loc + ".sub}}") }),
    );
    if (spent) stage.append(homeCard(), spentNote());
    stage.append(
      el("p", { class: "place-scene t-prose", text: tok("{{loc." + l.loc + ".desc}}") }),
      el("div", { class: "loc-standing t-label", text: `${tok("{{npc." + l.npc + "}}")} · ${standingWord(standingOf(s, l.npc))}` }),
      ...(TALKS[l.npc] ? [choiceCard({
        text: `Talk to ${tok("{{npc." + l.npc + "}}")}`,
        sub: "see what they have to say today",
        tag: canTalk ? (talkIsDry(s, l.npc) ? "free" : "-1 action") : null,
        tagValence: canTalk && talkIsDry(s, l.npc) ? "" : "bad",
        disabled: !canTalk,
        why,
      }, () => dispatch({ type: "VISIT", npc: l.npc }))] : []),
      ...(l.npc === "ambrose" ? (s.cloneRevealed === true
        ? [choiceCard({
            text: "Hire a hand", sub: "a clone from the wagon",
            tag: `${hireCost(s)}m`, tagValence: "", disabled: !canHire(s), why: "not enough coin",
          }, () => dispatch({ type: "HIRE" }))]
        // Before the reveal, the town gives nothing away: just an unopened wagon to approach.
        : [choiceCard({
            text: "Approach the wagon", sub: "lanterns, and the canvas drawn close",
          }, () => dispatch({ type: "REVEAL_WAGON" }))]) : []),
      ...(l.npc === "tolliver" ? [choiceCard({
        text: "Buy seed", sub: `${BALANCE.seedBundle} seed from the store`,
        tag: `${seedBundleCost()}m`, tagValence: "", disabled: !canBuySeed(s), why: "not enough coin",
      }, () => dispatch({ type: "BUY_SEED" }))] : []),
      choiceCard({ text: "Walk on", sub: "back to the crossroads" },
        () => dispatch({ type: "WALK_TO", place: null })),
    );
    if (!spent) stage.append(homeCard());
  },
  almanac: (stage) => {
    stage.append(el("div", { class: "eyebrow t-label", text: "The almanac" }), el("h2", { class: "t-title", text: "Not yet kept" }));
    stage.append(el("p", { class: "t-prose",
      text: "The almanac is not yet kept. In time it will hold the household's journals and the plain record of the year gone by. For now the fields, the hands, and the ledger will have to tell the story." }));
  },
};
export { SCREENS };

// --- daily-work guidance: Reuben's counsel ---

// Reuben's counsel block (Year 1), or nothing. Returned as an array to spread into append.
function counsel(s) {
  const c = counselFor(s);
  if (!c) return [];
  return [el("div", { class: "counsel" }, [
    el("div", { class: "counsel-who t-label" }, [el("span", { class: "counsel-dot" }), document.createTextNode(" Reuben's counsel")]),
    el("p", { class: "counsel-text t-sub", text: c.text }),
  ])];
}

// The script bodies are HTML (from #46) and carry their own `.prose` wrapper; render
// them as real nodes in a plain typographic container (no second `.prose` to nest).
function htmlProse(html) { const d = el("div", { class: "t-prose" }); d.innerHTML = html; return d; }

// Every fx key a choice can carry, mapped to a player-facing label and a valence direction:
// `up:true` means a positive delta is GOOD (green); `up:false` means a positive delta is BAD (red).
// Tiredness and Dread rising are bad; the fix for "+16 strainOne" reading as green (Part A2).
const FX_META = {
  regard:    { label: "regard",             up: true  },
  coin:      { label: "coin",               up: true  },
  larder:    { label: "food",               up: true  },  // events use `larder`; players read "food"
  fuel:      { label: "fuel",               up: true  },
  seed:      { label: "seed",               up: true  },
  reckoning: { label: "dread",              up: false },  // more dread is bad
  strainOne: { label: "Tiredness · a hand", up: false },  // more tiredness is bad
  strainAll: { label: "Tiredness · the crew", up: false },
};

// Turn a choice's state deltas into player-facing stat tags, colored by MEANING (not sign):
// tiredness/dread rising is bad, everything else rising is good. `loseHand` is a boolean stake.
export function fxTag(fx = {}) {
  const parts = [];
  let good = false, bad = false;
  for (const [k, v] of Object.entries(fx)) {
    if (!v) continue;
    if (k === "loseHand") { parts.push("a hand may be lost"); bad = true; continue; }
    const meta = FX_META[k];
    if (!meta) { parts.push(`${v > 0 ? "+" : "−"}${Math.abs(v)} ${k}`); continue; } // unknown: raw, uncolored
    parts.push(`${v > 0 ? "+" : "−"}${Math.abs(v)} ${meta.label}`);
    const isGood = meta.up ? v > 0 : v < 0;
    if (isGood) good = true; else bad = true;
  }
  return { text: parts.join(" · "), valence: bad && !good ? "bad" : good && !bad ? "good" : "" };
}

// One cell of the beat resource strip: a figure over a small label, reddening when short.
function beatCell(label, value, warn = false) {
  return el("div", { class: "beat-cell" + (warn ? " warn" : "") }, [
    el("span", { class: "beat-cell-v", text: String(value) }),
    el("span", { class: "beat-cell-k", text: label }),
  ]);
}

// A day-book line; `i` staggers the Dusk "Rule" reveal (reference §7), 160ms apart.
function line(label, value, i = 0) {
  return el("div", { class: "bookline m-line", style: `--i:${i}` },
    [el("span", { class: "t-sub", text: label }), el("span", { class: "t-choice", text: value })]);
}

// The Ledger tab explains the four figures the masthead only shows as numbers.
const LEDGER_ROWS = [
  ["Coin", "Marks in the strongbox. Coin buys seed, settles what is owed the bank, and is the only figure the wider world will take in trade."],
  ["Larder", "Food laid by. Every mouth on the place, yours and each living hand's, eats from the larder every day. Let it run thin and hunger starts to wear on the household."],
  ["Fuel", "Wood cut and stacked. It sits idle through spring and summer, then is burned each day of fall and winter to keep the cold off the household."],
  ["Seed", "Stock for the planting. Spend it at dawn to set a field, or hold it back and it carries forward to the next season's sowing."],
];
