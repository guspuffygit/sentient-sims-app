import PatreonUser from '../wrappers/PatreonUser';

export function getNightlyAccess(patreonUser: PatreonUser) {
  const disableNightly =
    !patreonUser.isDevOrSubscriber() && !patreonUser.isFounder();
  let nightlyText = 'Patreon Early Access';
  if (patreonUser.isFounder()) {
    nightlyText = 'Founder Early Access';
  }
  return { disableNightly, nightlyText };
}
