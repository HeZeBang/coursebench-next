"use client";

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from "react";
import type { SortKey, SortOrder } from "@/types";
import { instituteNames } from "@/constants";

// ── State ──
interface CourseFilterState {
  page: number;
  selected: string[]; // selected institute names
  sortKey: SortKey;
  order: SortOrder;
  includeDataInsufficient: boolean;
}

// ── Actions ──
type CourseFilterAction =
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_SELECTED"; payload: string[] }
  | { type: "SET_SORT_KEY"; payload: SortKey }
  | { type: "SET_ORDER"; payload: SortOrder }
  | { type: "SET_INCLUDE_DATA_INSUFFICIENT"; payload: boolean }
  | { type: "RESET" };

function courseFilterReducer(
  state: CourseFilterState,
  action: CourseFilterAction,
): CourseFilterState {
  switch (action.type) {
    case "SET_PAGE":
      return { ...state, page: action.payload };
    case "SET_SELECTED":
      return { ...state, selected: action.payload, page: 1 };
    case "SET_SORT_KEY":
      return { ...state, sortKey: action.payload, page: 1 };
    case "SET_ORDER":
      return { ...state, order: action.payload, page: 1 };
    case "SET_INCLUDE_DATA_INSUFFICIENT":
      return { ...state, includeDataInsufficient: action.payload, page: 1 };
    case "RESET":
      return {
        page: 1,
        selected: instituteNames,
        sortKey: "score",
        order: "desc",
        includeDataInsufficient: false,
      };
    default:
      return state;
  }
}

// ── Context ──
const CourseFilterContext = createContext<CourseFilterState>({
  page: 1,
  selected: instituteNames,
  sortKey: "score",
  order: "desc",
  includeDataInsufficient: false,
});

const CourseFilterDispatchContext = createContext<Dispatch<CourseFilterAction>>(
  () => {},
);

// ── Provider ──
export function CourseFilterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(courseFilterReducer, {
    page: 1,
    selected: instituteNames,
    sortKey: "score",
    order: "desc",
    includeDataInsufficient: false,
  });

  return (
    <CourseFilterContext.Provider value={state}>
      <CourseFilterDispatchContext.Provider value={dispatch}>
        {children}
      </CourseFilterDispatchContext.Provider>
    </CourseFilterContext.Provider>
  );
}

// ── Hooks ──
export function useCourseFilter() {
  return useContext(CourseFilterContext);
}

export function useCourseFilterDispatch() {
  return useContext(CourseFilterDispatchContext);
}
