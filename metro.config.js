const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Some packages (e.g. zustand's middleware) ship an ESM build containing
// `import.meta`, which Metro's classic (non-module) script output cannot
// execute. Disabling package-exports resolution falls back to the CJS
// build via the legacy "main" field, which has no import.meta usage.
config.resolver.unstable_enablePackageExports = false;

module.exports = withNativeWind(config, { input: './global.css' });
