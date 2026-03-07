const { withXcodeProject } = require("@expo/config-plugins");
const IOSConfig = require("@expo/config-plugins/build/ios");

/**
 * Expo config plugin that sets GENERATE_MAC_CATALYST = NO for the iOS app target.
 * This prevents building/running the app for Mac Catalyst, avoiding TurboModule
 * crashes on macOS 26 (e.g. convertNSExceptionToJSError SIGSEGV).
 */
function withNoMacCatalyst(config) {
  return withXcodeProject(config, async (config) => {
    const project = config.modResults;
    const [, nativeTarget] = IOSConfig.Target.findFirstNativeTarget(project);
    const buildConfigurations = IOSConfig.XcodeUtils.getBuildConfigurationsForListId(
      project,
      nativeTarget.buildConfigurationList
    );
    for (const [, item] of buildConfigurations) {
      if (item.buildSettings) {
        item.buildSettings.GENERATE_MAC_CATALYST = "NO";
      }
    }
    config.modResults = project;
    return config;
  });
}

module.exports = withNoMacCatalyst;
