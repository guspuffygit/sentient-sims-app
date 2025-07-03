import { AmplifyUser } from '@aws-amplify/ui';
import { PatreonUser } from '../wrappers/PatreonUser';

export function GetPatreonDebugText(user: AmplifyUser): string[] {
  const patreonUser = new PatreonUser(user);

  return [
    `User: ${user?.attributes?.email ?? 'Not found'}`,
    `Is Patreon Linked: ${patreonUser.isPatreonLinked() ? 'Yes' : 'No'}`,
    `Patreon ID: ${patreonUser.getPatreonId()}`,
    `custom:subscription_level: ${patreonUser.getSubscriptionLevel()}`,
    `custom:founderstatus: ${patreonUser.getFounderStatus()}`,
  ];
}
