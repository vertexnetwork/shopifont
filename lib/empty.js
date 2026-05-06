// Empty module used by next.config.ts to webpack-replace Next.js's
// hardcoded polyfill-module. Our browserslist target only includes
// browsers that have all the polyfilled APIs natively (Array.at,
// Object.hasOwn, String.prototype.trim*, Promise.finally, etc.), so
// shipping the polyfills costs ~12 KiB for zero benefit.
module.exports = {};
