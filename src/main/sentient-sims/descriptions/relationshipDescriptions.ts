export type RelationshipBitDescription = {
  name: string;
  description?: string;
  ignored?: boolean;
};

export const defaultRelationshipBitDescriptions: Map<
  String,
  RelationshipBitDescription
> = new Map(
  Object.entries({
    relBit_Attraction_SuppressChangeBehavior: {
      name: 'relBit_Attraction_SuppressChangeBehavior',
      ignored: true,
    },
    // The sims have greeted each other
    // This also shows even on first greeting
    SpecialBits_Greeted: {
      name: 'SpecialBits_Greeted',
      ignored: true,
    },
    // This shows after the first greeting or interaction
    has_met: {
      name: 'has_met',
      ignored: true,
    },
    sentient_sims_have_not_interacted_relationship_bit: {
      name: 'sentient_sims_have_not_interacted_relationship_bit',
      description:
        'This is the first interaction between {actor.0} and {actor.1}, the very first time that {actor.0} and {actor.1} have met.',
    },
  })
);
