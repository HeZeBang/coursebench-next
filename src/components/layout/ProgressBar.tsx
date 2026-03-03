"use client";

import { ProgressProvider } from '@bprogress/next/app';

/**
 * NProgress route-change indicator.
 * Placed in root layout to track App Router navigations.
 */
export default function ProgressBar() {
  return <ProgressProvider
    height="2px"
    color="#1976d2"
    options={{ showSpinner: false }}
    shallowRouting
  />;
}
