export type RelationshipBitDescription = {
  name: string;
  description?: string;
  ignored?: boolean;
};

export const defaultRelationshipBitDescriptions: Map<string, RelationshipBitDescription> = new Map(
  Object.entries({
    'relBit_Attraction_SuppressChangeBehavior': {
      name: 'relBit_Attraction_SuppressChangeBehavior',
      ignored: true,
    },
    // The sims have greeted each other
    // This also shows even on first greeting
    'SpecialBits_Greeted': {
      name: 'SpecialBits_Greeted',
      ignored: true,
    },
    // This shows after the first greeting or interaction
    'has_met': {
      name: 'has_met',
      ignored: true,
    },
    'sentient_sims_have_not_interacted_relationship_bit': {
      name: 'sentient_sims_have_not_interacted_relationship_bit',
      description:
        'This is the first interaction between {actor.0} and {actor.1}, the very first time that {actor.0} and {actor.1} have met.',
    },
    'family_Target_IsAuntUncleOf_Actor': {
      name: 'family_Target_IsAuntUncleOf_Actor',
      description: '{actor.1} is the {actor.1.uncle/aunt} of {actor.0}.',
    },
    'family_Target_IsBrotherSisterOf_Actor': {
      name: 'family_Target_IsBrotherSisterOf_Actor',
      description: '{actor.1} is the {actor.1.brother/sister} of {actor.0}.',
    },
    'family_Target_IsCousinOf_Actor': {
      name: 'family_Target_IsCousinOf_Actor',
      description: '{actor.1} is the cousin of {actor.0}.',
    },
    'family_Target_IsGrandchildOf_Actor': {
      name: 'family_Target_IsGrandchildOf_Actor',
      description: '{actor.1} is the grandchild of {actor.0}.',
    },
    'family_Target_IsGrandparentOf_Actor': {
      name: 'family_Target_IsGrandparentOf_Actor',
      description: '{actor.1} is the grandparent of {actor.0}.',
    },
    'family_Target_IsHusbandWifeOf_Actor': {
      name: 'family_Target_IsHusbandWifeOf_Actor',
      description: '{actor.1} is the {actor.1.husband/wife} of {actor.0}, they are married.',
    },
    'family_Target_IsNieceNephewOf_Actor': {
      name: 'family_Target_IsNieceNephewOf_Actor',
      description: '{actor.1} is the {actor.1.nephew/niece} of {actor.0}.',
    },
    'family_Target_IsParentOf_Actor': {
      name: 'family_Target_IsParentOf_Actor',
      description: '{actor.1} is the parent and {actor.1.father/mother} of {actor.0}.',
    },
    'family_Target_IsSonOrDaughterOf_Actor': {
      name: 'family_Target_IsSonOrDaughterOf_Actor',
      description: '{actor.1} is the {actor.1.son/daughter} of {actor.0}.',
    },
    'family_Target_IsStepsiblingOf_Actor': {
      name: 'family_Target_IsStepsiblingOf_Actor',
      description: '{actor.1} and {actor.0} are step siblings.',
    },
    'relationshipbit_CoWorkers': {
      name: 'relationshipbit_CoWorkers',
      description: '{actor.1} and {actor.0} are CoWorkers.',
    },
    'sentimentBit_Actor_FuriousAt_Target_ST_generic': {
      name: 'sentimentBit_Actor_FuriousAt_Target_ST_generic',
      description: "Just the sight of {actor.1} gets on {actor.0}'s nerves these days.",
    },
    'sentimentBit_Actor_BitterAt_Target_LT_grudge': {
      name: 'sentimentBit_Actor_BitterAt_Target_LT_grudge',
      description: '{actor.0} has a deep-seated grudge against {actor.1}.',
    },
    'sentimentBit_Actor_CloseTo_Target_LT_generic': {
      name: 'sentimentBit_Actor_CloseTo_Target_LT_generic',
      description: '{actor.0} has a powerful bond with {actor.1} that is a source of strength and comfort.',
    },
    'sentimentBit_Actor_EnamoredBy_Target_ST_generic': {
      name: 'sentimentBit_Actor_EnamoredBy_Target_ST_generic',
      description: '{actor.0} is really enamored with {actor.1}',
    },
    'sentimentBit_Actor_BitterAt_Target_ST_breakup': {
      name: 'sentimentBit_Actor_BitterAt_Target_ST_breakup',
      description: "{actor.0} can't shake resentment towards {actor.1} about how their romantic relationship ended.",
    },
    'sentimentBit_Actor_BitterAt_Target_ST_divorce': {
      name: 'sentimentBit_Actor_BitterAt_Target_ST_divorce',
      description: '{actor.0} has some resentment leftover from their divorce with {actor.1}.',
    },
    'sentimentBit_Actor_CloseTo_Target_ST_qualityTime': {
      name: 'sentimentBit_Actor_CloseTo_Target_ST_qualityTime',
      description: '{actor.0} appreciates that {actor.1} makes time for {actor.0}.',
    },
    'sentimentBit_Actor_CloseTo_Target_ST_generic': {
      name: 'sentimentBit_Actor_CloseTo_Target_ST_generic',
      description: '{actor.0} feels close to {actor.1} from good times and happy memories.',
    },
    'sentimentBit_Actor_FuriousAt_Target_ST_cheating': {
      name: 'sentimentBit_Actor_FuriousAt_Target_ST_cheating',
      description: '{actor.0} is furious at {actor.1} for cheating on them in their relationship.',
    },
    'sentimentBit_Actor_FuriousAt_Target_ST_wedding': {
      name: 'sentimentBit_Actor_FuriousAt_Target_ST_wedding', // Cancelled wedding
      description: '{actor.1} humiliated {actor.0} in front of everyone at their wedding by cancelling it!',
    },
    'sentimentBit_Actor_HurtBy_Target_LT_generic': {
      name: 'sentimentBit_Actor_HurtBy_Target_LT_generic', // Deeply Wounded
      description: '{actor.1} hurt {actor.0} in their relationship.',
    },
    'sentimentBit_Actor_HurtBy_Target_ST_romantic': {
      name: 'sentimentBit_Actor_HurtBy_Target_ST_romantic', // Heartbroken
      description: '{actor.0} is reminded of heatbreak with {actor.1}.',
    },
    'sentimentBit_Actor_AdoringTo_Target_ST_generic': {
      name: 'sentimentBit_Actor_AdoringTo_Target_ST_generic', // adores
      description: '{actor.0} just wants the best for {actor.1} and thinks {actor.1} is so wonderful!',
    },
    'sentimentBit_Actor_AdoringTo_Target_ST_impressed': {
      name: 'sentimentBit_Actor_AdoringTo_Target_ST_impressed',
      description: '{actor.0} is impressed by {actor.1}.',
    },
    'sentimentBit_Actor_BitterAt_Target_LT_cheating': {
      name: 'sentimentBit_Actor_BitterAt_Target_LT_cheating', // Betrayed by Cheating
      description: '{actor.0} is bitter at {actor.1} because {actor.1} cheated on {actor.0}.',
    },
    'sentimentBit_Actor_BitterAt_Target_ST_fight': {
      name: 'sentimentBit_Actor_BitterAt_Target_ST_fight', // Grudging after a Fight
      description: '{actor.0} and {actor.1} are bitter at each other after a fight.',
    },
    'sentimentBit_Actor_CloseTo_Target_ST_adoption': {
      name: 'sentimentBit_Actor_CloseTo_Target_ST_adoption', // Open-Hearted from adoption
      description: '{actor.0} feels close to a recent adopted addition to the family, {actor.1}.',
    },
    'sentimentBit_Actor_EnamoredBy_Target_LT_generic': {
      name: 'sentimentBit_Actor_EnamoredBy_Target_LT_generic', // Deeply in Love
      description:
        'Some romantic moments leave a powerful impression, and {actor.0} will never forget how they fell even deeper in love with {actor.1}.',
    },
    'sentimentBit_Actor_GuiltyAt_Target_ST_generic': {
      name: 'sentimentBit_Actor_GuiltyAt_Target_ST_generic',
      description:
        "{actor.0} feels bad about something that happened with {actor.1} but doesn't know how to make it right.",
    },
    'sentimentBit_Actor_GuiltyAt_Target_ST_awkwardDate': {
      name: 'sentimentBit_Actor_GuiltyAt_Target_ST_awkwardDate',
      description: '{actor.0} just had an awkward and bad date with {actor.1}.',
    },
    'sentimentBit_Actor_GuiltyAt_Target_ST_badParty': {
      name: 'sentimentBit_Actor_GuiltyAt_Target_ST_badParty',
      description:
        '{actor.0} threw a terrible party and worries that {actor.1} must think {actor.0} is no fun and that {actor.1} probably never wants to hang out again.',
    },
    'sentimentBit_Actor_HurtBy_Target_ST_rejection': {
      name: 'sentimentBit_Actor_HurtBy_Target_ST_rejection',
      description: '{actor.0} is feeling rejected romantically by {actor.1}.',
    },
    'sentimentBit_Actor_HurtBy_Target_ST_saddened': {
      name: 'sentimentBit_Actor_HurtBy_Target_ST_saddened',
      description: '{actor.0} is sad and hurt about their relationship with {actor.1}.',
    },
    'sentimentBit_Actor_HurtBy_Target_ST_generic': {
      name: 'sentimentBit_Actor_HurtBy_Target_ST_generic',
      description:
        '{actor.0} feels wronged by {actor.1}, and being around {actor.1} will remind {actor.0} of that pain.',
    },
    'sentimentBit_Actor_AdoringTo_Target_LT_lifesaver': {
      name: 'sentimentBit_Actor_AdoringTo_Target_LT_lifesaver',
      description: '{actor.1} literally saved {actor.0} from the clutches of death.',
    },
    'sentimentBit_Actor_CloseTo_Target_ST_nearDeath': {
      name: 'sentimentBit_Actor_CloseTo_Target_ST_nearDeath',
      description: "{actor.1} almost dying has endeared to {actor.0} after {actor.0} saved {actor.1}'s life.", // Huh
    },
    'friendship-acquaintances': {
      name: 'friendship-acquaintances',
      description: '{actor.0} and {actor.1} are acquaintances.',
    },
    'friendship-bff': {
      name: 'friendship-bff',
      description: '{actor.0} and {actor.1} are the best of friends with a nearly unbreakable bond.',
    },
    'friendship-bff_Evil': {
      name: 'friendship-bff_Evil',
      description: '{actor.0} and {actor.1} are evil best friends and henchmen to each other.',
    },
    'friendship-despised': {
      name: 'friendship-despised',
      description: '{actor.0} and {actor.1} despise each other.',
    },
    'friendship-friend': {
      name: 'friendship-friend',
      description: '{actor.0} and {actor.1} are friends.',
    },
    'friendship-friend_Evil': {
      name: 'friendship-friend_Evil',
      description: '{actor.0} and {actor.1} are friends pretending to be enemies.',
    },
    'friendship-good_friends': {
      name: 'friendship-good_friends',
      description: '{actor.0} and {actor.1} are good friends.',
    },
    'friendship-good_friends_Evil': {
      name: 'friendship-good_friends_Evil',
      description: '{actor.0} and {actor.1} are good friends.',
    },
    'friendship-nemesis': {
      name: 'friendship-nemesis',
      description: '{actor.0} and {actor.1} are nemisis to each other.',
    },
    'friendship-disliked': {
      name: 'friendship-disliked',
      description: '{actor.0} and {actor.1} dislike each other.',
    },
    'relationshipBits_Friendship_NeutralBit': {
      name: 'relationshipBits_Friendship_NeutralBit',
      description: '{actor.0} and {actor.1} are impartial to each other.',
    },
    'romantic-Broken_Up': {
      name: 'romantic-Broken_Up',
      description: '{actor.0} and {actor.1} are broken up and exes to each other.',
    },
    'romantic-Broken_Up_Engaged': {
      name: 'romantic-Broken_Up_Engaged',
      description: '{actor.0} and {actor.1} were once engaged but broke it off before the wedding.',
    },
    'romantic-Despised_Ex': {
      name: 'romantic-Despised_Ex',
      description: '{actor.0} and {actor.1} were once in a relationship, but now despise each other.',
    },
    'romantic-Divorced': {
      name: 'romantic-Divorced',
      description: '{actor.0} and {actor.1} were once married but are now divorced.',
    },
    'romantic-Engaged': {
      name: 'romantic-Engaged',
      description: '{actor.0} and {actor.1} are engaged to be wed.',
    },
    'romantic-Frustrated_Ex': {
      name: 'romantic-Frustrated_Ex',
      description: '{actor.0} and {actor.1} are exes and frusted with each other.',
    },
    'romantic-GettingMarried': {
      name: 'romantic-GettingMarried',
      description: '{actor.0} and {actor.1} are getting married.',
    },
    'romantic_Target_GotColdFeetOf_Actor': {
      name: 'romantic_Target_GotColdFeetOf_Actor',
      description: '{actor.0} and got cold feet at the alar and left {actor.1} at the altar.',
    },
    'romantic_Target_LeftTheAlterOf_Actor': {
      name: 'romantic_Target_LeftTheAlterOf_Actor',
      description: '{actor.1} left {actor.0} at the altar, leaving {actor.0} with utter humiliation.',
    },
    'romantic-Married': {
      name: 'romantic-Married',
      description: '{actor.1} and {actor.0} are married.',
    },
    'romantic-Significant_Other': {
      name: 'romantic-Significant_Other',
      description: '{actor.1} and {actor.0} are dating each other.',
    },
    'RomanticCombo_AwkwardFriends': {
      name: 'RomanticCombo_AwkwardFriends',
      description: '{actor.1} and {actor.0} are awkward friends.',
    },
    'RomanticCombo_AwkwardLovers': {
      name: 'RomanticCombo_AwkwardLovers',
      description: '{actor.1} and {actor.0} are awkward lovers.',
    },
    'RomanticCombo_BadMatch': {
      name: 'RomanticCombo_BadMatch',
      description: '{actor.1} and {actor.0} are a bad match romantically.',
    },
    'RomanticCombo_Lovebirds': {
      name: 'RomanticCombo_Lovebirds',
      description: '{actor.1} and {actor.0} are romantic love birds.',
    },
    'RomanticCombo_EnemiesWithBenefits': {
      name: 'RomanticCombo_EnemiesWithBenefits',
      description: '{actor.1} and {actor.0} hate each other, but are friends with benefits.',
    },
    'RomanticCombo_Frenemies': {
      name: 'RomanticCombo_Frenemies',
      description: '{actor.1} and {actor.0} are romantic frenemies.',
    },
    'RomanticCombo_HotAndCold': {
      name: 'RomanticCombo_HotAndCold',
      description: '{actor.1} and {actor.0} have a hot and cold romantic relationship.',
    },
    'RomanticCombo_ItsAwkward': {
      name: 'RomanticCombo_ItsAwkward',
      description: '{actor.1} and {actor.0} have an awkward romantic relationship.',
    },
    'RomanticCombo_ItsVeryAwkward': {
      name: 'RomanticCombo_ItsVeryAwkward',
      description: '{actor.1} and {actor.0} have a very awkward romantic relationship.',
    },
    'RomanticCombo_ItsComplicated': {
      name: 'RomanticCombo_ItsComplicated',
      description: '{actor.1} and {actor.0} have a complicated romantic relationship.',
    },
    'RomanticCombo_ItsVeryComplicated': {
      name: 'RomanticCombo_ItsVeryComplicated',
      description: '{actor.1} and {actor.0} have a veru complicated romantic relationship.',
    },
    'RomanticCombo_Lovers': {
      name: 'RomanticCombo_Lovers',
      description: '{actor.1} and {actor.0} are romantic lovers.',
    },
    'RomanticCombo_RomanticInterest': {
      name: 'RomanticCombo_RomanticInterest',
      description: 'Its too early to tell, but {actor.1} and {actor.0} could have a budding romantic interest.',
    },
    'RomanticCombo_Soulmates': {
      name: 'RomanticCombo_Soulmates',
      description: '{actor.1} and {actor.0} are romantic soulmates.',
    },
    'RomanticCombo_Sweethearts': {
      name: 'RomanticCombo_Sweethearts',
      description: '{actor.1} and {actor.0} are romantic sweethearts.',
    },
    'RomanticCombo_TerribleMatch': {
      name: 'RomanticCombo_TerribleMatch',
      description: '{actor.1} and {actor.0} dislike each other and are a terrible romantic match.',
    },
    'RomanticCombo_TotalOpposites': {
      name: 'RomanticCombo_TotalOpposites',
      description: '{actor.1} and {actor.0} are complete opposites in a romantic relationship.',
    },
    'RomanticCombo_BadRomance': {
      name: 'RomanticCombo_BadRomance',
      description: '{actor.1} and {actor.0} have a "bad romance".',
    },
    'ShortTerm_InFightWith': {
      name: 'ShortTerm_InFightWith',
      description: '{actor.1} and {actor.0} are in a fight.',
    },
    'ShortTerm_InQuarrelWith': {
      name: 'ShortTerm_InQuarrelWith',
      description: '{actor.1} and {actor.0} are in a quarrel.',
    },
    'relbit_AdoptedBySim': {
      name: 'relbit_AdoptedBySim',
      description: '{actor.1} is the adopted {actor.1.father/mother} of {actor.0}.',
    },
    'relbit_AdoptedSim': {
      name: 'relbit_AdoptedSim',
      description: '{actor.1} is the adopted {actor.0.father/mother} of {actor.1}.',
    },
    'sentimentBit_Actor_EnamoredBy_Target_LT_Loyal_SecondChance': {
      name: 'sentimentBit_Actor_EnamoredBy_Target_LT_Loyal_SecondChance',
      description: '{actor.1} and {actor.0} are taking a second chance at their relationship.',
    },
    'sentimentBit_Actor_CloseTo_Target_LT_Loyal_RegainedTrust': {
      name: 'sentimentBit_Actor_CloseTo_Target_LT_Loyal_RegainedTrust',
      description: "{actor.1} worked hard to regain {actor.0}'s trust in their relationship.",
    },
    'ShortTerm_RecentFirstKiss': {
      name: 'ShortTerm_RecentFirstKiss',
      description: '{actor.1} and {actor.0} just shared their first kiss recently.',
    },
    'RomanticCombo_Disliked': {
      name: 'RomanticCombo_Disliked',
      description: '{actor.1} and {actor.0} dislike each other in their relationship.',
    },
    'RomanticCombo_Acquaintances': {
      name: 'RomanticCombo_Acquaintances',
      description: '{actor.1} and {actor.0} are acquaintances.',
    },
    'RomanticCombo_JustFriends': {
      name: 'RomanticCombo_JustFriends',
      description: '{actor.1} and {actor.0} are just friends, and are not romantically involved.',
    },
    'RomanticCombo_JustGoodFriends': {
      name: 'RomanticCombo_JustGoodFriends',
      description: '{actor.1} and {actor.0} are good friends.',
    },
    'RomanticCombo_Despised': {
      name: 'RomanticCombo_Despised',
      description: '{actor.1} and {actor.0} despise each other in their romantic relationship.',
    },
    'romantic-HaveDoneWooHoo_Recently': {
      name: 'romantic-HaveDoneWooHoo_Recently',
      description: '{actor.1} and {actor.0} recently had sex.',
    },
    'ShortTerm_JustBrokeUpOrDivorced': {
      name: 'ShortTerm_JustBrokeUpOrDivorced',
      description: '{actor.1} and {actor.0} just recently broke up.',
    },
    'romantic-Widow': {
      name: 'romantic-Widow',
      description: '{actor.0} is a widow from losing their love, {actor.1}.',
    },
    'romantic-Widower': {
      name: 'romantic-Widower',
      description: '{actor.0} is a widower from losing their love, {actor.1}.',
    },

    'toddler_notParent_Actor_IsCareGiverOf_Target': {
      name: 'toddler_notParent_Actor_IsCareGiverOf_Target',
      description: '{actor.0} is not a parent, but is a caregiver to {actor.1}.',
    },
    'object-friendship-acquaintances': {
      name: 'object-friendship-acquaintances',
      description: '{actor.0} and {actor.1} are acquaintances.',
    },
    'object-friendship-despised': {
      name: 'object-friendship-despised',
      description: '{actor.0} and {actor.1} despise each other.',
    },
    'object-friendship-disliked': {
      name: 'object-friendship-disliked',
      description: '{actor.0} and {actor.1} dislike each other.',
    },
    'object-friendship-friend': {
      name: 'object-friendship-friend',
      description: '{actor.0} and {actor.1} are friends.',
    },
    'object-friendship-good_friends': {
      name: 'object-friendship-good_friends',
      description: '{actor.0} and {actor.1} are good friends.',
    },
    'object-friendship-nemesis': {
      name: 'object-friendship-nemesis',
      description: '{actor.0} and {actor.1} are nemesis to each other.',
    },
    'bit_NoLongerFriends': {
      name: 'bit_NoLongerFriends',
      description: '{actor.0} and {actor.1} were once friends but are no longer friends.',
    },
    'sentimentBit_Actor_MotivatedBy_Target_ST_FriendlyAdvice': {
      name: 'sentimentBit_Actor_MotivatedBy_Target_ST_FriendlyAdvice',
      description:
        "{actor.0} remembers when {actor.1} listened to {actor.0}'s problems and shared some thoughtful advice.",
    },
    'sentimentBit_Actor_AdoringTo_Target_ST_consoleDeath': {
      name: 'sentimentBit_Actor_AdoringTo_Target_ST_consoleDeath',
      description:
        '{actor.0} has formed a bond with {actor.1}, the kind that can only come from the profound grief of death.',
    },
    'sentimentBit_Actor_AdoringTo_Target_ST_newborn': {
      name: 'sentimentBit_Actor_AdoringTo_Target_ST_newborn',
      description: '{actor.0} adores their new baby, {actor.1}.',
    },
    'sentimentBit_Actor_AdoringTo_Target_ST_infantPreferredSim': {
      name: 'sentimentBit_Actor_AdoringTo_Target_ST_infantPreferredSim',
      description: '{actor.0} adores {actor.1}.',
    },
    'sentimentBit_Actor_BitterAt_Target_ST_SiblingJealousy': {
      name: 'sentimentBit_Actor_BitterAt_Target_ST_SiblingJealousy',
      description: '{actor.0} is jealous of {actor.1}.',
    },
    'sentimentBit_Actor_HurtBy_Target_ST_attentioJealousy': {
      name: 'sentimentBit_Actor_HurtBy_Target_ST_attentioJealousy',
      description: '{actor.0} is feeling overshadowed by their sibling, {actor.1}.',
    },
    'multi_unit_neighbor': {
      name: 'multi_unit_neighbor',
      description: '{actor.0} and {actor.1} are neighbors.',
    },
    'SpecialBits_Enemy': {
      name: 'SpecialBits_Enemy',
      description: '{actor.0} and {actor.1} are enemies.',
    },
    'SpecialBits_ArchEnemies': {
      name: 'SpecialBits_ArchEnemies',
      description: '{actor.0} and {actor.1} are arch enemies.',
    },
    'SpecialBits_DeclaredArchEnemy': {
      name: 'SpecialBits_DeclaredArchEnemy',
      description: '{actor.0} and {actor.1} have declared each other arch enemies.',
    },
    'friendship-bff_BromanticPartner': {
      name: 'friendship-bff_BromanticPartner',
      description: '{actor.0} and {actor.1} have a bromance.',
    },
    'romantic_Target_LeavedAlterOf_Actor': {
      name: 'romantic_Target_LeavedAlterOf_Actor',
      description: '{actor.1} had left {actor.0} at the altar while they were getting married.',
    },
    'romantic_Target_IsDeadSpouseOf_Actor': {
      name: 'romantic_Target_IsDeadSpouseOf_Actor',
      description: '{actor.1} is the dead spouse of {actor.0}.',
    },
    'living_roommate': {
      name: 'living_roommate',
      description: '{actor.1} and {actor.0} are roommates.',
    },
    'sentimentBit_Actor_CloseTo_Target_ST_GroupCooking_CookingTogether': {
      name: 'sentimentBit_Actor_CloseTo_Target_ST_GroupCooking_CookingTogether',
      description: '{actor.1} and {actor.0} like cooking together.',
    },
    'romantic-HaveDoneWooHoo': {
      name: 'romantic-HaveDoneWooHoo',
      description: '{actor.1} and {actor.0} have had sex before.',
    },
    'romantic-HasBeenUnfaithful': {
      name: 'romantic-HasBeenUnfaithful',
      description: '{actor.1} and {actor.0} have been unfaithful to each other.',
    },
    'neighbor': {
      name: 'neighbor',
      description: '{actor.1} and {actor.0} are neighbors.',
    },
    'relBit_SexualORientation_WooHooPartners': {
      name: 'relBit_SexualORientation_WooHooPartners',
      description: '{actor.1} and {actor.0} are sexual partners.',
    },
    'romantic_Target_CheatedWith_Actor': {
      name: 'romantic_Target_CheatedWith_Actor',
      description: '{actor.0} cheated on their partner with {actor.1}.',
    },
    'date_situation_bit': {
      name: 'date_situation_bit',
      description: '{actor.0} and {actor.1} are on a date with each other.',
    },
    'situation_bit_BirthdayGuest': {
      name: 'situation_bit_BirthdayGuest',
      description: "{actor.1} is {actor.0}'s birthday guest.",
    },
    'situation_bit_WeddingGuest': {
      name: 'situation_bit_WeddingGuest',
      description: "{actor.1} is {actor.0}'s wedding guest.",
    },
    'situation_bit_WeddingCouple': {
      name: 'situation_bit_WeddingCouple',
      description: '{actor.1} and {actor.0} are the wedding couple.',
    },
    'romantic-Promised': {
      name: 'romantic-Promised',
      description: '{actor.1} and {actor.0} have promised each other they will be a romantic couple forever.',
    },
    'romantic-RenewingVows': {
      name: 'romantic-RenewingVows',
      description: '{actor.1} and {actor.0} are renewing their vows.',
    },
    'ShortTerm_RecentNegativeSocial': {
      name: 'ShortTerm_RecentNegativeSocial',
      description: '{actor.1} and {actor.0} recently had a negative social interaction.',
    },
    'relationshipBit_Matchmaking_AddedOnMatchmakingApp': {
      name: 'relationshipBit_Matchmaking_AddedOnMatchmakingApp',
      description: '{actor.1} and {actor.0} added each other and met on a matchmaking app.',
    },
  }),
);
