// Dynamic part of the Expo config. Everything static (name, package, version, icons) lives in app.json.
//
// The only thing decided here: the store build carries no INTERNET permission, because the game makes no network
// request at all. Development builds keep it, since the dev client has to reach Metro.
// When adverts or purchases are added, delete the INTERNET line below (see README, "Adding adverts or a purchase").
module.exports = ({ config }) => {
  const profile = process.env.EAS_BUILD_PROFILE;
  const offlineBuild = profile === 'preview' || profile === 'production';
  const blocked = new Set(config.android?.blockedPermissions ?? []);
  if (offlineBuild) blocked.add('android.permission.INTERNET');
  return { ...config, android: { ...config.android, blockedPermissions: [...blocked] } };
};
