import api from "./api";

/**
 * SWR fetcher — performs GET request and returns data field.
 */
export const fetcher = (url: string) => api.get(url).then((r) => r.data);
