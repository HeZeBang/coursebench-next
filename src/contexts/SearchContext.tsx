"use client";

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from "react";

// ── State ──
interface SearchState {
  isRegexp: boolean;
  keys: string;
}

// ── Actions ──
type SearchAction =
  | { type: "SET_KEYS"; payload: string }
  | { type: "TOGGLE_REGEXP" }
  | { type: "CLEAR" };

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case "SET_KEYS":
      return { ...state, keys: action.payload };
    case "TOGGLE_REGEXP":
      return { ...state, isRegexp: !state.isRegexp };
    case "CLEAR":
      return { isRegexp: false, keys: "" };
    default:
      return state;
  }
}

// ── Context ──
const SearchContext = createContext<SearchState>({
  isRegexp: false,
  keys: "",
});
const SearchDispatchContext = createContext<Dispatch<SearchAction>>(() => {});

// ── Provider ──
export function SearchProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(searchReducer, {
    isRegexp: false,
    keys: "",
  });

  return (
    <SearchContext.Provider value={state}>
      <SearchDispatchContext.Provider value={dispatch}>
        {children}
      </SearchDispatchContext.Provider>
    </SearchContext.Provider>
  );
}

// ── Hooks ──
export function useSearch() {
  return useContext(SearchContext);
}

export function useSearchDispatch() {
  return useContext(SearchDispatchContext);
}
