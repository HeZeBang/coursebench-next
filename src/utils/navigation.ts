/**
 * Navigate to a URL in the current tab.
 */
export function openInplace(url: string): void {
  window.location.href = url;
}

/**
 * Open a URL in a new tab.
 */
export function openInNewTab(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}
