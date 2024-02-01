import PatreonUser from '../../../renderer/wrappers/PatreonUser';

export function getNightlyAccess(patreonUser: PatreonUser) {
  const disableNightly = !patreonUser.isMember();
  let nightlyText = 'Patreon Early Access';
  if (patreonUser.isFounder()) {
    nightlyText = 'Founder Early Access';
  }
  return { disableNightly, nightlyText };
}
