import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { tripReducer } from "@/features/setup";
import { groupReducer } from "@/features/avatars";
import { matchReducer } from "@/features/match";
import { decideReducer } from "@/features/decide";
import { planReducer } from "@/features/plan";
import { bookReducer } from "@/features/book";
import { liveReducer } from "@/features/trip";
import { myTribeReducer, startNewTrip } from "@/features/mytribe/slice";
import { loadState, saveState } from "./persistence";
import { services, type Services } from "./services";

const flowReducer = combineReducers({
  myTribe: myTribeReducer,
  trip: tripReducer,
  group: groupReducer,
  match: matchReducer,
  decide: decideReducer,
  plan: planReducer,
  book: bookReducer,
  live: liveReducer,
});

export type RootState = ReturnType<typeof flowReducer>;

/** "Start a new trip" keeps My Tribe's list and resets every flow slice. */
function rootReducer(state: RootState | undefined, action: Parameters<typeof flowReducer>[1]): RootState {
  if (startNewTrip.match(action) && state) {
    const myTribe = flowReducer(state, action).myTribe;
    return { ...flowReducer(undefined, { type: "@@reset" }), myTribe };
  }
  return flowReducer(state, action);
}

export function createStore(deps: Services = services, persist = true) {
  const initial = rootReducer(undefined, { type: "@@init" });
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: persist ? loadState(initial) : undefined,
    middleware: (getDefault) => getDefault({ thunk: { extraArgument: deps } }),
  });
  if (persist) store.subscribe(() => saveState(store.getState()));
  return store;
}

export type AppStore = ReturnType<typeof createStore>;
export type AppDispatch = AppStore["dispatch"];
