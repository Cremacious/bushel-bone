import { el } from "./dom.js";
import { seasonLabel, DAYS_PER_SEASON, livingHands } from "../core/state.js";
import { L } from "../content/script.js";
import { tok } from "../content/names.js";
import { choiceCard, fieldCard } from "./components.js";
import { CROPS, ripe } from "../core/crops.js";
import { fieldLabel, conditionOf, ripeFields, duskSummary, fieldProjection, yearNeeds, townOffers, standingOf, standingWord, tirednessAdvice, actionEffects, playerActionEffects } from "../core/selectors.js";
import { SCENES, openingSceneId } from "../content/scenes.js";
import { counselFor } from "../content/counsel.js";
import { BALANCE } from "../core/balance.js";
import { TALKS } from "../core/town.js";

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
      choiceCard({ text: "Begin", sub: "set the season to its work", primary: true }, begin),
    );
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
      for (const cid of sc.choices) {
        const t = fxTag((sc.fx && sc.fx[cid]) || {});
        stage.append(choiceCard(
          { text: tok(L(id + "." + cid + ".text")), sub: tok(L(id + "." + cid + ".sub")), tag: t.text, tagValence: t.valence },
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
  day: (stage, s, dispatch) => {
    stage.append(
      el("div", { class: "eyebrow t-label", text: `Day ${s.day} of ${DAYS_PER_SEASON}` }),
      el("h2", { class: "t-title", text: "Set the crew, and spend your day" }),
    );
    stage.append(goalPanel(s));                // what the cold months will want (foreshadowing)
    const plantedFields = s.fields.filter((f) => f.crop);
    const ripeList = ripeFields(s);
    const living = livingHands(s);
    // A task is offered only when there is something to do it to; otherwise disabled with a
    // plain reason, so a hand is never quietly tired for empty motion (D-039).
    const why = { tend: plantedFields.length ? null : "no crop is in the ground to tend",
      harvest: ripeList.length ? null : "nothing is ripe to bring in" };
    const TASKS = [["rest", "Rest"], ["tend", "Tend"], ["harvest", "Harvest"], ["forage", "Forage"], ["chop", "Chop wood"]];
    for (const h of living) {
      const row = el("div", { class: "handrow" }, [
        el("span", { class: "hname t-choice", text: h.name }),
        strainMeter(h),
      ]);
      const sel = el("div", { class: "taskpick" }, TASKS.map(([task, label]) => {
        const blocked = !!why[task];
        const tags = blocked ? [] : actionEffects(task).map((e) =>
          el("span", { class: "efftag " + e.valence, text: e.label }));
        return el("button", { class: "taskbtn t-sub" + (h.task === task ? " sel" : "") + (blocked ? " disabled" : ""),
          ...(blocked ? { disabled: true, title: why[task] } : {}),
          onClick: blocked ? undefined : () => dispatch({ type: "ASSIGN", handId: h.id, task,
            targetFieldId: task === "tend" ? plantedFields[0].id : task === "harvest" ? ripeList[0].id : undefined }) },
          [el("span", { class: "tb-label", text: label }), ...tags]);
      }));
      row.append(sel);
      stage.append(row);
    }
    stage.append(personalActions(s, dispatch));
  },
  dusk: (stage, s, dispatch) => {
    const d = duskSummary(s);
    stage.append(el("div", { class: "eyebrow t-label", text: `Dusk · ${seasonLabel(s)}` }), el("h2", { class: "t-title", text: "The day-book, closed" }));
    const book = el("div", { class: "daybook" }, [
      line("Coin in hand", `${d.coin} m`, 0), line("Larder into next season", `${d.larder} food`, 1),
      line("Fuel laid by", `${d.fuel}`, 2), line("The crew that stands", d.crew.join(", ") || "only you", 3),
    ]);
    stage.append(book);
    for (const l of d.lostThisSeason) stage.append(el("p", { class: "omen t-sub", text: l }));
    for (const w of d.warnings) stage.append(el("p", { class: "warnline t-sub", text: w }));
    stage.append(choiceCard({ text: "Turn the page", sub: "on to what comes next", primary: true }, () => dispatch({ type: "END_SEASON" })));
  },
  yearend: (stage, s, dispatch) => {
    stage.append(el("div", { class: "verdict t-label", text: "Year One · closed" }),
      el("h2", { class: "t-title", text: "“I survived another year.”" }),
      el("p", { class: "prose t-prose", text: "The Winter broke, and the household woke to the thaw. You made it. Not everyone does." }),
      choiceCard({ text: "Play another first year", sub: "a new seed, a new weather", primary: true }, () => { try { location.reload && location.reload(); } catch { /* jsdom: no-op */ } }));
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
      row.append(el("div", { class: "t-sub", text: "at task: " + (TASK_LABEL[h.task] || h.task) }));
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
    const { jobs, locations } = townOffers(s);
    const canAct = s.phase === "day" && s.playerActionsLeft > 0;
    const why = s.phase !== "day" ? "Come back during the day." : s.playerActionsLeft <= 0 ? "You are spent for the day." : null;
    stage.append(
      el("div", { class: "eyebrow t-label", text: "Marrow's Cross" }),
      el("h2", { class: "t-title", text: "The town at the crossroads" }),
      el("p", { class: "t-sub townhint", text: canAct
        ? `You have ${s.playerActionsLeft} of the day to spend here.`
        : (why || "The town is quiet.") }),
    );
    stage.append(el("div", { class: "eyebrow t-label townsub", text: "Work going" }));
    for (const j of jobs) {
      const blocked = !canAct || j.done;
      const sub = j.done ? "done today" : (why || `+${j.coin} coin · ${tok("{{npc." + j.giver + "}}")}`);
      stage.append(el("div", { class: "jobcard" }, [
        el("div", { class: "jobline t-choice", text: j.line }),
        el("div", { class: "jobmeta t-sub", text: sub }),
        el("button", { class: "jobtake t-label" + (blocked ? " disabled" : ""), ...(blocked ? { disabled: true } : {}),
          text: j.done ? "done" : `Take it (+${j.coin})`,
          onClick: blocked ? undefined : () => dispatch({ type: "ACCEPT_JOB", id: j.id }) }),
      ]));
    }
    stage.append(el("div", { class: "eyebrow t-label townsub", text: "The town" }));
    for (const l of locations) {
      const hasTalk = !!TALKS[l.npc];
      const canTalk = hasTalk && canAct;
      stage.append(el("div", { class: "townloc" }, [
        el("div", { class: "loc-head" }, [
          el("span", { class: "loc-who t-choice", text: tok("{{npc." + l.npc + "}}") }),
          el("span", { class: "loc-why t-sub", text: l.purpose }),
        ]),
        el("div", { class: "loc-right" }, [
          hasTalk ? el("span", { class: "loc-standing t-label", text: standingWord(standingOf(s, l.npc)) }) : null,
          hasTalk
            ? el("button", { class: "loc-talk t-label" + (canTalk ? "" : " disabled"), ...(canTalk ? {} : { disabled: true }),
                text: "Call on them", onClick: canTalk ? () => dispatch({ type: "VISIT", npc: l.npc }) : undefined })
            : el("span", { class: "loc-soon t-sub", text: "not today" }),
        ].filter(Boolean)),
      ]));
    }
  },
  almanac: (stage) => {
    stage.append(el("div", { class: "eyebrow t-label", text: "The almanac" }), el("h2", { class: "t-title", text: "Not yet kept" }));
    stage.append(el("p", { class: "t-prose",
      text: "The almanac is not yet kept. In time it will hold the household's journals and the plain record of the year gone by. For now the fields, the hands, and the ledger will have to tell the story." }));
  },
};
export { SCREENS };

// --- daily-work guidance: the Tiredness read, Reuben's counsel, the goal foreshadowing ---

// A hand's condition, made legible: a labeled Tiredness meter (colored by band) plus a plain
// verdict, so the player can SEE when a hand is wearing down and rest or care actually
// matters (D-039).
function strainMeter(h) {
  const cond = conditionOf(h);
  const pct = Math.min(100, Math.round((h.strain / BALANCE.strain.lostAt) * 100));
  return el("div", { class: "strain cond-" + cond }, [
    el("span", { class: "strain-word t-label", text: "Tiredness" }),
    el("div", { class: "strain-bar" }, [el("div", { class: "strain-fill", style: `width:${Math.max(3, pct)}%` })]),
    el("span", { class: "strain-advice t-sub", text: tirednessAdvice(h) }),
  ]);
}

// Your own day: spend up to playerActionsPerDay actions. Applied at once (instant feedback).
function personalActions(s, dispatch) {
  const left = s.playerActionsLeft;
  const growing = s.fields.filter((f) => f.crop && !ripe(f));
  const worn = livingHands(s).find((h) => h.strain >= BALANCE.strain.wornAt);
  // Prefer a field no one has worked yet today, so the player's labor visibly adds a push.
  const workTarget = growing.find((f) => !f.tended) || growing[0];
  const opts = [
    { kind: "forage", label: "Forage", desc: `+${BALANCE.forageFood} food to the larder` },
    ...(growing.length ? [{ kind: "work", target: workTarget.id,
      label: "Work a field", desc: `tend ${fieldLabel(workTarget).toLowerCase()} yourself — a day's growth toward harvest` }] : []),
    ...(worn ? [{ kind: "care", target: worn.id,
      label: `Sit with ${worn.name}`, desc: `ease a ${conditionOf(worn)} hand — brings their strain down` }] : []),
    { kind: "rest", label: "Rest", desc: "a quiet day; keep your own strength" },
  ];
  return el("div", { class: "personal" }, [
    el("div", { class: "personal-h t-label", text: `Your day — ${left} of ${BALANCE.playerActionsPerDay} actions left` }),
    el("button", { class: "ridebtn t-label", text: "Ride to Marrow's Cross →",
      onClick: () => dispatch({ type: "SET_SCREEN", screen: "town" }) }),
    el("div", { class: "ridehint t-sub", text: "or spend the day here:" }),
    el("div", { class: "pa-grid" }, opts.map((o) =>
      el("button", { class: "pa-action" + (left <= 0 ? " disabled" : ""), ...(left <= 0 ? { disabled: true } : {}),
        onClick: left > 0 ? () => dispatch({ type: "DO_PLAYER_ACTION", kind: o.kind, target: o.target }) : undefined }, [
        el("span", { class: "pa-label t-choice", text: o.label }),
        el("span", { class: "pa-desc t-sub", text: o.desc }),
        ...playerActionEffects(o.kind).map((e) => el("span", { class: "efftag " + e.valence, text: e.label })),
      ]))),
    el("div", { class: "day-cta" }, [
      choiceCard({ text: "Turn in for the night", sub: "the day resolves — crops grow, the crew eats", primary: true }, () => dispatch({ type: "TURN_IN" })),
      el("button", { class: "runbtn t-label", text: "Let the days run →", onClick: () => dispatch({ type: "RUN_DAYS" }) }),
    ]),
  ]);
}

// Reuben's counsel block (Year 1), or nothing. Returned as an array to spread into append.
function counsel(s) {
  const c = counselFor(s);
  if (!c) return [];
  return [el("div", { class: "counsel" }, [
    el("div", { class: "counsel-who t-label" }, [el("span", { class: "counsel-dot" }), document.createTextNode(" Reuben's counsel")]),
    el("p", { class: "counsel-text t-sub", text: c.text }),
  ])];
}

// The cold-months targets, read plainly: have / need with a bar, green when met, amber short.
function goalPanel(s) {
  const n = yearNeeds(s);
  const row = (label, have, need) => {
    const met = have >= need;
    const pct = Math.max(2, Math.min(100, Math.round((have / (need || 1)) * 100)));
    return el("div", { class: "goalrow2" }, [
      el("div", { class: "goal-line" }, [
        el("span", { class: "goal-k t-choice", text: label }),
        el("span", { class: "goal-fig t-sub" + (met ? " good" : " warn") }, [
          document.createTextNode(`${have} / ${need} `),
          el("span", { class: "goal-note", text: met ? "✓ laid in" : `(${need - have} to go)` }),
        ]),
      ]),
      el("div", { class: "goalbar" }, [el("div", { class: "goalbar-fill" + (met ? " good" : " warn"), style: `width:${pct}%` })]),
    ]);
  };
  return el("div", { class: "goals" }, [
    el("div", { class: "goals-h t-label", text: "To last the winter, lay in:" }),
    row("Wood", n.fuel.have, n.fuel.need),
    row("Food", n.food.have, n.food.need),
  ]);
}

// The script bodies are HTML (from #46) and carry their own `.prose` wrapper; render
// them as real nodes in a plain typographic container (no second `.prose` to nest).
function htmlProse(html) { const d = el("div", { class: "t-prose" }); d.innerHTML = html; return d; }

// Turn a choice's state deltas into a player-facing stat tag ("+2 regard", "−3 regard",
// "−60 coin"), colored by valence, so a choice's cost/benefit is legible up front (D-039).
// This is the general grammar for any choice with mechanical stakes, not just scenes.
const STAT_LABEL = { regard: "regard", coin: "coin", food: "food", fuel: "fuel", seed: "seed", reckoning: "dread" };
export function fxTag(fx = {}) {
  const parts = [];
  let good = false, bad = false;
  for (const [k, v] of Object.entries(fx)) {
    if (!v) continue;
    parts.push(`${v > 0 ? "+" : "−"}${Math.abs(v)} ${STAT_LABEL[k] || k}`);
    const positive = k === "reckoning" ? v < 0 : v > 0; // more dread is bad; more of anything else is good
    if (positive) good = true; else bad = true;
  }
  return { text: parts.join(" · "), valence: bad && !good ? "bad" : good && !bad ? "good" : "" };
}

// A day-book line; `i` staggers the Dusk "Rule" reveal (reference §7), 160ms apart.
function line(label, value, i = 0) {
  return el("div", { class: "bookline m-line", style: `--i:${i}` },
    [el("span", { class: "t-sub", text: label }), el("span", { class: "t-choice", text: value })]);
}

// Plain-language task words for the Hands tab (the day screen's own TASKS array is
// choice-button labels, not read-only prose, so this is a small, separate map).
const TASK_LABEL = { rest: "resting", tend: "tending a field", harvest: "bringing in the harvest", chop: "chopping wood" };

// The Ledger tab explains the four figures the masthead only shows as numbers.
const LEDGER_ROWS = [
  ["Coin", "Marks in the strongbox. Coin buys seed, settles what is owed the bank, and is the only figure the wider world will take in trade."],
  ["Larder", "Food laid by. Every mouth on the place, yours and each living hand's, eats from the larder every day. Let it run thin and hunger starts to wear on the household."],
  ["Fuel", "Wood cut and stacked. It sits idle through spring and summer, then is burned each day of fall and winter to keep the cold off the household."],
  ["Seed", "Stock for the planting. Spend it at dawn to set a field, or hold it back and it carries forward to the next season's sowing."],
];
