/**
 * Comparator factory for sorting arrays of objects.
 */
export function sortCmp<T>(
  key: keyof T,
  order: "asc" | "desc" = "desc",
): (a: T, b: T) => number {
  return (a, b) => {
    const va = a[key] as unknown as number;
    const vb = b[key] as unknown as number;
    return order === "asc" ? va - vb : vb - va;
  };
}

export function sumOf<T>(arr: T[], key: keyof T): number {
  return arr.reduce((sum, item) => sum + (item[key] as unknown as number), 0);
}

export function averageOf<T>(arr: T[], key: keyof T): number {
  if (arr.length === 0) return 0;
  return sumOf(arr, key) / arr.length;
}

/**
 * Distribute count into percentage bins.
 * Returns an array of label-count pairs.
 */
export function toDistribute<T>(
  arr: T[],
  key: keyof T,
  labels: string[],
): { label: string; count: number }[] {
  const counts = new Array(labels.length).fill(0);
  arr.forEach((item) => {
    const val = Math.round(item[key] as unknown as number) - 1;
    if (val >= 0 && val < labels.length) counts[val]++;
  });
  return labels.map((label, i) => ({ label, count: counts[i] }));
}
