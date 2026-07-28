import { el, clear } from "./render/dom.js";
import { tok } from "./content/names.js";

// The pre-game front porch: the title menu, the New Game lineage-naming step, and the
// two-page inheritance letter (design reference §9 Screens 01-02; canon copy from #44).
// When New Game finishes it calls onStart(lineageName) to boot the real game. The test
// harness boots the game directly, skipping this, exactly as year1.html does.

const MAX = 18;
export function normLineage(name) {
  let s = (name == null ? "" : String(name)).replace(/\s+/g, " ").trim().slice(0, MAX);
  if (!s) s = "Crane";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function startFront(root, { onStart } = {}) {
  const ui = { view: "title", lineage: "Crane", page: 0 };
  const set = (patch) => { Object.assign(ui, patch); render(); };

  function render() {
    document.documentElement.setAttribute("data-theme", "night");
    document.documentElement.setAttribute("data-season", "spring");
    clear(root);
    root.className = "front";
    const view = VIEWS[ui.view] || VIEWS.title;
    root.append(view(ui, set, onStart));
  }
  render();
  return { getUI: () => ui };
}

const VIEWS = {
  title: (ui, set) => screen("title", [
    el("div", { class: "fr-hero" }, [
      crow(),
      el("div", { class: "fr-herotext" }, [
        el("div", { class: "fr-eyebrow t-label", text: "A Dark Homestead Survival Game" }),
        wordmark(),
        el("div", { class: "fr-rule rule-double" }),
        el("div", { class: "fr-tagline", text: "You inherit a plot of land and a promise. The land keeps its own ledger." }),
        el("div", { class: "fr-menu" }, [
          menuItem("New Game", "▶", { primary: true, onClick: () => set({ view: "name" }) }),
          menuItem("Continue", null, { disabled: true, aside: "no game in progress" }),
          el("div", { class: "fr-menu-row" }, [
            menuItem("How to Play", null, { half: true, onClick: () => set({ view: "howto" }) }),
            menuItem("Settings", null, { half: true, onClick: () => set({ view: "settings" }) }),
          ]),
        ]),
      ]),
    ]),
    el("div", { class: "fr-foot t-label", text: "Sallows Charter Company · MDCCCLXXXIV" }),
  ]),

  name: (ui, set) => {
    const input = el("input", { class: "fr-input t-title", type: "text", maxlength: String(MAX),
      autocomplete: "off", spellcheck: "false", value: ui.lineage });
    input.addEventListener("input", () => { ui.lineage = input.value; toggleContinue(); });
    const cont = el("button", { class: "choicecard primary fr-btn",
      onClick: () => { if (input.value.trim()) set({ view: "letter", page: 0, lineage: input.value }); } },
      [el("span", { class: "ctitle t-choice", text: "Continue" })]);
    function toggleContinue() { cont.toggleAttribute("disabled", !input.value.trim()); }
    const node = screen("name", [
      el("div", { class: "fr-narrow" }, [
        el("div", { class: "fr-eyebrow t-label", text: "Before the letter comes" }),
        el("h2", { class: "t-title", text: "Name your line" }),
        el("p", { class: "fr-body", text: "A family holds this land, season on season, and gives it their name. What is the name they will carry?" }),
        el("div", { class: "fr-rule rule-hatch" }),
        el("label", { class: "fr-label t-label", text: "Family surname" }),
        input,
        el("p", { class: "fr-hint t-sub", text: "This is the name over the door for as long as your line holds the land." }),
        el("div", { class: "fr-nav" }, [
          el("button", { class: "linkbtn fr-back", text: "Back", onClick: () => set({ view: "title" }) }),
          cont,
        ]),
      ]),
    ]);
    return node;
  },

  letter: (ui, set, onStart) => {
    const pages = letterPages(ui.lineage);
    const p = Math.max(0, Math.min(ui.page, pages.length - 1));
    const last = p === pages.length - 1;
    return screen("letter", [
      el("div", { class: "fr-letterwrap" }, [
        pages[p],
        el("div", { class: "fr-paging" }, [
          el("button", { class: "linkbtn fr-prev" + (p === 0 ? " off" : ""), text: "Previous",
            ...(p === 0 ? { disabled: true } : {}), onClick: () => set({ page: p - 1 }) }),
          el("span", { class: "fr-pageno t-label", text: `Page ${p + 1} of ${pages.length}` }),
          el("button", { class: "choicecard primary fr-btn fr-next" },
            [el("span", { class: "ctitle t-choice", text: last ? "Begin" : "Next" })]),
        ]),
      ]),
    ], (node) => {
      node.querySelector(".fr-next").addEventListener("click", () => {
        if (last) { onStart && onStart(normLineage(ui.lineage)); } else set({ page: p + 1 });
      });
    });
  },

  howto: (ui, set) => infoScreen("How to Play", HOWTO, set),
  settings: (ui, set) => infoScreen("Settings", SETTINGS_COPY, set),
};

// ---- the two-page letter (canon #44 copy, tokenized) ----
function letterPages(lineage) {
  const lp = normLineage(lineage), lu = lp.toUpperCase();
  const malachi = tok("{{npc.malachi}}").toUpperCase();
  const page1 = el("div", { class: "fr-page" });
  page1.innerHTML = tok(
    '<div class="fr-letter-h">A letter reaches you, back east</div>' +
    '<div class="fr-letter">' +
      '<div class="fr-letter-head">' +
        '<div class="fr-co">The {{place.region}} Charter Company</div>' +
        '<div class="fr-office">Land Office at Marrow’s Cross</div>' +
        '<div class="fr-date">March 3rd, 1884</div>' +
      '</div>' +
      `<p>To the next of kin of <b>${malachi} ${lu}</b>, holder of the ${lp} place:</p>` +
      '<p>The above holder is entered in the Charter rolls as deceased, this past winter. No remains were recovered.</p>' +
      '<p>A holding left without a resident heir reverts to the Company after one full year. Our records name you his nearest blood. Should you take up the parcel, you take up its obligations, and the mortgage against the land passes to you entire.</p>' +
      '<p>The Company makes no representation as to the condition of the ground, the buildings, or the season.</p>' +
      '<p>We do not advise. We record.</p>' +
      '<p class="fr-signoff">Clerk of the Rolls, Marrow’s Cross</p>' +
    '</div>');
  const page2 = el("div", { class: "fr-page fr-narration" });
  page2.innerHTML = tok(
    '<p>You had never met the man. You went anyway.</p>' +
    `<p>The {{place.region}} lies a long way past where the rail gives out: low country, pale and wet, the grass the color of old bone. Folk you asked for the way went quiet when you named the place. You came to the ${lp} place at dusk, to a house with dark windows, four small fields gone to seed, and crows that did not startle when you passed.</p>` +
    '<p>At first light, an old man was waiting at the fence. <span class="said">“You’ll be the blood, then,”</span> he said. <span class="said">“{{npc.reuben}}. I worked this ground for your uncle, near twenty year. There’s a deal wants doing before winter. Best we start.”</span></p>');
  return [page1, page2];
}

// ---- small builders ----
function screen(name, children, after) {
  const s = el("section", { class: "fr-screen fr-" + name + " m-turn" }, children);
  if (after) after(s);
  return s;
}
function wordmark() {
  const w = el("div", { class: "fr-wordmark t-plate" });
  w.innerHTML = 'Bushel<span class="amp">&amp;</span>Bone';
  return w;
}
function crow() {
  // A simple engraved crow-on-a-sun mark until real logo art drops in.
  const c = el("div", { class: "fr-crow" });
  c.innerHTML = '<svg viewBox="0 0 200 200" width="180" height="180" aria-hidden="true">' +
    '<circle cx="100" cy="96" r="66" fill="var(--lamp)" opacity="0.9"/>' +
    '<path d="M62 150 q20-70 58-86 q-6 16 -2 24 q18-6 30-2 q-26 10 -34 30 q-4 30 -18 40 q-16 4 -34-6 Z" fill="#0d0b07"/>' +
    '<path d="M64 150 h72 l-6 14 h-60 Z" fill="#0d0b07"/></svg>';
  return c;
}
function menuItem(label, glyph, { primary, disabled, half, aside, onClick } = {}) {
  const cls = "fr-menuitem" + (primary ? " primary" : "") + (disabled ? " disabled" : "") + (half ? " half" : "");
  const kids = [el("span", { class: "fr-mi-label t-plate", text: label })];
  if (aside) kids.push(el("span", { class: "fr-mi-aside t-sub", text: aside }));
  else if (glyph) kids.push(el("span", { class: "fr-mi-glyph", text: glyph }));
  return el(disabled ? "div" : "button", { class: cls, ...(onClick && !disabled ? { onClick } : {}) }, kids);
}
function infoScreen(title, paras, set) {
  return screen("info", [
    el("div", { class: "fr-narrow" }, [
      el("h2", { class: "t-title", text: title }),
      el("div", { class: "fr-rule rule-hatch" }),
      ...paras.map((t) => el("p", { class: "fr-body", text: t })),
      el("div", { class: "fr-nav" }, [
        el("button", { class: "choicecard primary fr-btn", onClick: () => set({ view: "title" }) },
          [el("span", { class: "ctitle t-choice", text: "Back" })]),
      ]),
    ]),
  ]);
}

const HOWTO = [
  "You have inherited a homestead worked by farmhand clones. Each season you plant your fields, set your crew to their week's work, and spend your own week alongside them.",
  "Keep the larder full and the woodpile high, and keep your people whole: a hand worked to the bone in the cold does not last the winter. Kindness costs yield. Cruelty is paid back in ways the land remembers.",
  "Survive the year, then the next. You do not beat this land. You pass the watch on.",
];
const SETTINGS_COPY = [
  "Settings are not yet wired in this prototype. Motion honors your system's reduced-motion preference automatically.",
  "Day and night, sound, and accessibility options arrive as the prototype grows.",
];
