// Dynamic part of the Expo config. Everything static (name, identifiers, version, icons) lives in app.json.
//
// Two things are decided here, both for the builds that go to testers and the stores (EAS profiles `preview` and
// `production`), because the game makes no network request at all:
//
//   Android  the build carries no INTERNET permission. Development builds keep it: the dev client has to reach Metro.
//   iOS      the Info.plist carries no local-network keys. expo-dev-client adds NSLocalNetworkUsageDescription and
//            NSBonjourServices so that a development build can find Metro. Its own Xcode build phase strips them from
//            Release builds; removing them here as well means the generated Info.plist never contains a
//            usage-description string the shipped app does not need, whatever that build phase does.
//
// When adverts or purchases are added, delete the INTERNET line below (see README, "Adding adverts or a purchase").
const { withInfoPlist } = require('expo/config-plugins');

const DEV_ONLY_PLIST_KEYS = ['NSLocalNetworkUsageDescription', 'NSBonjourServices'];

const withoutDevOnlyPlistKeys = config =>
  withInfoPlist(config, cfg => {
    for (const key of DEV_ONLY_PLIST_KEYS) delete cfg.modResults[key];
    return cfg;
  });

module.exports = ({ config }) => {
  const profile = process.env.EAS_BUILD_PROFILE;
  const storeBuild = profile === 'preview' || profile === 'production';
  const blocked = new Set(config.android?.blockedPermissions ?? []);
  if (storeBuild) blocked.add('android.permission.INTERNET');
  const out = { ...config, android: { ...config.android, blockedPermissions: [...blocked] } };
  if (!storeBuild) return out;
  // Listed FIRST on purpose. Expo chains Info.plist modifiers so that the one registered first runs last; this entry
  // therefore sees the plist after every other plugin (including the automatically applied dev-client one) has
  // written to it. tests/shell.test.js compiles the config and checks the result rather than trusting the ordering.
  return { ...out, plugins: [withoutDevOnlyPlistKeys, ...(out.plugins ?? [])] };
};
