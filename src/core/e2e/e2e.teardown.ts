// Session storage state files are intentionally cached in RESULTS_DIR across runs
// (see setup.ts) — do not delete them here, or every run has to re-authenticate.
export default async function globalTeardown() {}
