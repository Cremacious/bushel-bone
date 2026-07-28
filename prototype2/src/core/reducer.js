import { SEASONS, WEEKS_PER_SEASON, season } from "./state.js";
import { CROPS } from "./crops.js";

// Pure: (state, action) => nextState. Never mutates the input.
// Later plans add cases (resolveEvent, ...). For now: theme + the week/season/year
// clock (ADVANCE_WEEK, superseded in play by RESOLVE_WEEK), plus the weekly-loop
// phase machine (season open, planting, assignment, resolution, season close).
export function reduce(state, action) {
  switch (action.type) {
    case "SET_THEME":
      return { ...state, theme: action.theme === "day" ? "day" : "night" };
    case "ADVANCE_WEEK":
      return advanceWeek(state);
    case "SET_SCREEN":
      return { ...state, screen: action.screen };
    case "BEGIN_SEASON":
      return { ...state, phase: season(state) === "winter" ? "week" : "planting", week: 1 };
    case "PLANT":
      return plant(state, action.fieldId, action.crop);
    case "FALLOW":
      return mapField(state, action.fieldId, (f) => ({ ...f, crop: null, progress: 0 }));
    case "SOW":
      return { ...state, phase: "week", week: 1 };
    default:
      return state;
  }
}

function advanceWeek(s) {
  let { week, seasonIndex, year } = s;
  week += 1;
  if (week > WEEKS_PER_SEASON) {
    week = 1;
    seasonIndex += 1;
    if (seasonIndex > SEASONS.length - 1) { seasonIndex = 0; year += 1; }
  }
  return { ...s, week, seasonIndex, year };
}

function mapField(s, id, fn) {
  return { ...s, fields: s.fields.map((f) => (f.id === id ? fn(f) : f)) };
}

function plant(s, id, cropKey) {
  const field = s.fields.find((f) => f.id === id);
  const crop = CROPS[cropKey];
  if (!field || field.crop || !crop) return s;           // taken or unknown crop
  const seedSpent = Math.min(s.seed, crop.seed);
  const coinSpent = crop.seed - seedSpent;               // seed first, then coin
  if (coinSpent > s.coin) return s;                      // cannot afford
  return {
    ...mapField(s, id, (f) => ({ ...f, crop: cropKey, progress: 0, tended: false })),
    seed: s.seed - seedSpent,
    coin: s.coin - coinSpent,
  };
}
