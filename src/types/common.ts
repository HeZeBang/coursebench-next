// Common API response types — matches backend models.OKResponse / models.ErrorResponse

export interface ApiResponse<T> {
  error: boolean;
  data: T;
}

export type SortOrder = "asc" | "desc";

export type SortKey = "score" | "count" | "credit";

/** Backend comment field names for sorting */
export type CommentSortKey = "post_time" | "update_time" | "like";

export interface SelectOption<T = string> {
  label: string;
  value: T;
}
