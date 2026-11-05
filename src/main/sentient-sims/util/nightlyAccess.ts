import { Membership } from '../wrappers/Membership';

export function getNightlyAccess(membership: Membership) {
  const disableNightly = !membership.isMember();
  let nightlyText = 'Member Early Access';
  if (membership.isFounder()) {
    nightlyText = 'Founder Early Access';
  }
  return { disableNightly, nightlyText };
}
