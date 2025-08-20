const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Ensure this points to your Tailwind global stylesheet in assets (if used)
module.exports = withNativeWind(config, { input: "./assets/css/global.css" });
