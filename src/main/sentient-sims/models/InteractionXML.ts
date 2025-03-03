export enum InteractionTargetType {
  ACTOR = 'ACTOR',
  TARGET = 'TARGET',
  GROUP = 'GROUP',
  FILTERED_TARGET = 'FILTERED_TARGET',
  TARGET_AND_GROUP = 'TARGET_AND_GROUP',
}

export function toInteractionTargetType(
  targetType?: string
): InteractionTargetType {
  if (
    Object.values(InteractionTargetType).includes(
      targetType as InteractionTargetType
    )
  ) {
    return targetType as InteractionTargetType;
  }

  throw Error(`Unknown InteractionTargetType ${targetType}`);
}

export type InteractionXML = {
  targetType?: InteractionTargetType;
};
