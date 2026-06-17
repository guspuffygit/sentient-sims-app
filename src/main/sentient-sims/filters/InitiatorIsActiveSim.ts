export type InitiatorIsActiveSimFilter = {
  type: 'InitiatorIsActiveSim';
};

export function InitiatorIsActiveSim(): InitiatorIsActiveSimFilter {
  return { type: 'InitiatorIsActiveSim' };
}
