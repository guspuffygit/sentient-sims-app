import { AuthUserAttributes } from 'renderer/providers/AuthProvider';
import { MembershipInfo } from '../models/UserInfo';
import { Membership } from '../wrappers/Membership';
import { UsageHeader } from '../billing/usageHeader';

// The usage line prefers the /me block; the last response header stands in when /me is unreachable
function usageText(info?: MembershipInfo, usage?: UsageHeader): string {
  if (info) {
    return `${info.usage.percent}% ${info.usage.state}, ${info.lane} lane`;
  }
  if (usage) {
    return `${usage.percent}% ${usage.state}, ${usage.lane ?? 'unknown'} lane (last header)`;
  }
  return 'Not loaded';
}

export function getMembershipDebugText(
  userAttributes: AuthUserAttributes,
  info?: MembershipInfo,
  usage?: UsageHeader,
): string[] {
  const membership = new Membership(userAttributes, info);

  return [
    `User: ${userAttributes.email ?? 'Not found'}`,
    `Sub: ${userAttributes.sub}`,
    `Membership: ${membership.isMember() ? 'Yes' : 'No'} (${membership.getSource()}, ${membership.getTier()})`,
    `Usage: ${usageText(info, usage)}`,
    `Is Patreon Linked: ${membership.isPatreonLinked() ? 'Yes' : 'No'}`,
    `Patreon ID: ${membership.getPatreonId()}`,
    `custom:subscription_level: ${membership.getSubscriptionLevel()}`,
    `custom:founderstatus: ${membership.getFounderStatus()}`,
    `cognito:groups: ${membership.getGroups().join(', ') || 'None'}`,
  ];
}
