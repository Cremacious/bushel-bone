import { SEASONS, WEEKS_PER_SEASON } from "./state.js";

// Pure: (state, action) => nextState. Never mutates the input.
// Later plans add cases (assign, plant, resolveEvent, ...). For now: theme + the
// week/season/year clock, which the shell needs to render and advance.
export function reduce(state, action) {
  switch (action.type) {
    case "SET_THEME":
      return { ...state, theme: action.theme === "day" ? "day" : "night" };
    case "ADVANCE_WEEK":
      return advanceWeek(state);
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
