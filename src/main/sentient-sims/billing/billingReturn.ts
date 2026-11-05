export type BillingReturnKind = 'success' | 'canceled' | 'portal';

// The server sends the browser back to /billing/return with ?session_id= after a paid
// checkout, ?canceled=1 when the member backed out and ?portal=1 from the customer portal
export function billingReturnKind(query: { [key: string]: unknown }): BillingReturnKind {
  if (query.canceled !== undefined) {
    return 'canceled';
  }
  if (query.portal !== undefined) {
    return 'portal';
  }
  return 'success';
}
