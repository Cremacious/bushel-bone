// A state seed for tests that exercise the day/season/year phase machine but are not
// themselves about the event system (daily-loop, resolve-day, town, shell, season, dusk,
// beat-loop, flow, standing, screens...). Event beats now fire probabilistically off the
// seeded PRNG (reducer.maybeEvent), so a hardcoded small seed can no longer be trusted to
// land a fixed number of TURN_IN/SOW/CONTINUE dispatches on a specific phase. Marking every
// event id "already seen" makes maybeEvent's eligible list empty, so it never interrupts the
// run here: no balance numbers change, only these tests' event exposure. Real event-firing
// behavior (seeded, no-repeat, eligible) is covered by tests/events.test.mjs.
//
// Likewise, the scripted Year-1-Spring "reuben_hands" nudge (reducer.maybeScript) now opens
// on the first SOW; marking it already-seen keeps SOW landing straight on the day beat for
// these phase-machine tests, which are not about the nudge. Its own behavior is covered by
// tests/clone-reveal.test.mjs.
import { initialState as baseInitialState } from "../../src/core/state.js";
import { EVENTS } from "../../src/core/events.js";

export function initialState(seed = 1, lineageName = "Crane") {
  return { ...baseInitialState(seed, lineageName), eventsSeen: EVENTS.map((e) => e.id), scriptSeen: ["reuben_hands"] };
}
