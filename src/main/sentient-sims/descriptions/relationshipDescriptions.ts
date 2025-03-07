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
    family_Target_IsAuntUncleOf_Actor: {
      name: 'family_Target_IsAuntUncleOf_Actor',
      description: '{actor.1} is the {actor.1.uncle/aunt} of {actor.0}.',
    },
    family_Target_IsBrotherSisterOf_Actor: {
      name: 'family_Target_IsBrotherSisterOf_Actor',
      description: '{actor.1} is the {actor.1.brother/sister} of {actor.0}.',
    },
    family_Target_IsCousinOf_Actor: {
      name: 'family_Target_IsCousinOf_Actor',
      description: '{actor.1} is the cousin of {actor.0}.',
    },
    family_Target_IsGrandchildOf_Actor: {
      name: 'family_Target_IsGrandchildOf_Actor',
      description: '{actor.1} is the grandchild of {actor.0}.',
    },
    family_Target_IsGrandparentOf_Actor: {
      name: 'family_Target_IsGrandparentOf_Actor',
      description: '{actor.1} is the grandparent of {actor.0}.',
    },
    family_Target_IsHusbandWifeOf_Actor: {
      name: 'family_Target_IsHusbandWifeOf_Actor',
      description:
        '{actor.1} is the {actor.1.husband/wife} of {actor.0}, they are married.',
    },
    family_Target_IsNieceNephewOf_Actor: {
      name: 'family_Target_IsNieceNephewOf_Actor',
      description: '{actor.1} is the {actor.1.nephew/niece} of {actor.0}.',
    },
    family_Target_IsParentOf_Actor: {
      name: 'family_Target_IsParentOf_Actor',
      description:
        '{actor.1} is the parent and {actor.1.father/mother} of {actor.0}.',
    },
    family_Target_IsSonOrDaughterOf_Actor: {
      name: 'family_Target_IsSonOrDaughterOf_Actor',
      description: '{actor.1} is the {actor.1.son/daughter} of {actor.0}.',
    },
    family_Target_IsStepsiblingOf_Actor: {
      name: 'family_Target_IsStepsiblingOf_Actor',
      description: '{actor.1} and {actor.0} are step siblings.',
    },
  }),
);
