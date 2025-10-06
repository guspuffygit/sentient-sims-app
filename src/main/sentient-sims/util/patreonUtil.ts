import { AuthUserAttributes } from 'renderer/providers/AuthProvider';
import { PatreonUser } from '../wrappers/PatreonUser';

export function GetPatreonDebugText(userAttributes: AuthUserAttributes): string[] {
  const patreonUser = new PatreonUser(userAttributes);

  return [
    `User: ${userAttributes?.email ?? 'Not found'}`,
    `Sub: ${userAttributes?.sub}`,
    `Is Patreon Linked: ${patreonUser.isPatreonLinked() ? 'Yes' : 'No'}`,
    `Patreon ID: ${patreonUser.getPatreonId()}`,
    `custom:subscription_level: ${patreonUser.getSubscriptionLevel()}`,
    `custom:founderstatus: ${patreonUser.getFounderStatus()}`,
  ];
}
