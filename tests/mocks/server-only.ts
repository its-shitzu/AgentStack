// Vitest doesn't run inside the Next.js bundler, which is what normally
// makes the "server-only" package's import guard a no-op for server code.
// This stub stands in for it during tests.
export {};
