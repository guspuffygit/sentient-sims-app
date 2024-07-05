import { HasNotHappened } from '../filters/HasNotHappened';
import { InitiatorIsActiveSim } from '../filters/InitiatorIsActiveSim';

export type InteractionDescription = {
  pre_actions?: string[];
  ignored?: boolean;
  filters?: any[];
  always_run?: boolean;
};

export const interactionDescriptions: Map<String, InteractionDescription> =
  new Map(
    Object.entries({
      mixer_Baby_ShowOff: {
        pre_actions: [
          '{actor.0} is excitingly showing their new baby to {actor.1}.',
        ],
      },
      mixer_ScienceTable_Empty: {
        pre_actions: [
          '{actor.0} is preparing a scientific experiment with {actor.1} using an empty flask.',
        ],
      },
      mixer_Social_GetToKnow_Friendly_STC: {
        pre_actions: [
          '{actor.0} is asking {actor.1} to talk to about themselves.',
        ],
      },
      mixer_social_AttemptToScare_targeted_mischief_skills: {
        pre_actions: [
          '{actor.0} is playing a prank on {actor.1}, {actor.0} is jump scaring {actor.1}',
        ],
      },
      mixer_social_AskDueDate_targeted_mischief_skills: {
        pre_actions: [
          '{actor.0} is asking {actor.1} cruelly about their due date, even though they are not pregnant.',
        ],
      },
      mixer_social_NoxiousCloud_targeted_mischief_skills: {
        pre_actions: ['{actor.0} is rudely farting near {actor.1} as a prank.'],
      },
      mixer_social_SlapEmSilly_targeted_mischief_skills: {
        pre_actions: ['{actor.0} is mischievously slapping {actor.1} silly.'],
      },
      mixer_social_AirHorn_targeted_mischief_skills: {
        pre_actions: [
          '{actor.0} is playfully pranking {actor.1} by continuously blasting an air horn in their face.',
        ],
      },
      mixer_social_GossipAbout_targeted_friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is engaging in friendly gossip with {actor.1}, discussing various topics and sharing information.',
        ],
      },
      mixer_social_ShareConspiracyTheory_targeted_mischief_alwaysOn: {
        pre_actions: [
          '{actor.0} is sharing a conspiracy theory with {actor.1} in a mischievous manner.',
        ],
      },
      mixer_social_RevealEvilPlans_targeted_mischief_traits: {
        pre_actions: [
          '{actor.0} is mischievously revealing their evil plans to {actor.1}.',
        ],
      },
      mixer_socials_TellJoke_group_Funny_alwaysOn: {
        pre_actions: ['{actor.0} is telling a funny joke to {actor.1}.'],
      },
      mixer_social_DoAnImpression_targeted_funny_alwaysOn: {
        pre_actions: [
          '{actor.0} is doing a hilarious impression for {actor.1}.',
        ],
      },
      mixer_social_PlayAPrank_targeted_mischief_skills: {
        pre_actions: [
          '{actor.0} is playfully pranking {actor.1} with a hand buzzer.',
        ],
      },
      mixer_social_Insult_Mean_STC: {
        pre_actions: [
          '{actor.0} is hurling mean, hurtful insults at {actor.1}.',
        ],
      },
      mixer_social_OfferRose_targeted_romance_emotionSpeficic: {
        pre_actions: [
          '{actor.0} is offering a rose to {actor.1}, expressing their romantic interest.',
        ],
      },
      mixer_social_PassionateKiss_targeted_romance_emotionSpecific: {
        pre_actions: [
          '{actor.0} is leaning in, passionately kissing {actor.1}.',
        ],
      },
      mixer_social_BeEnticing_targeted_romance_emotionSpecific: {
        pre_actions: [
          '{actor.0} is flirting with {actor.1} in an attempt to be sexually enticing.',
        ],
      },
      mixer_social_SexyPose_targeted_romance_emotionSpecific: {
        pre_actions: [
          '{actor.0} is striking a sexy pose, trying to impress and seduce {actor.1}.',
        ],
      },
      mixer_social_SweetTalk_targeted_romance_skills: {
        pre_actions: [
          '{actor.0} is sweet talking {actor.1}, trying to ignite a romantic spark between them.',
        ],
      },
      mixer_social_BoldPickUpLine_targeted_romance_emotionSpecific: {
        pre_actions: [
          '{actor.0} confidently presents a bold pick-up line to {actor.1} to ignite romance.',
        ],
      },
      mixer_social_SuaveKiss_targeted_romance_emotionSpecific: {
        pre_actions: [
          '{actor.0} is confidently leaning in and kissing {actor.1} in a suave and romantic gesture.',
        ],
      },
      mixer_social_FrenziedKiss_targeted_romance_emotionSpecific: {
        pre_actions: [
          '{actor.0} is passionately kissing {actor.1} in a moment of frenzy.',
        ],
      },
      mixer_social_ReciteLovePoetry_targeted_romance_emotionSpecific: {
        pre_actions: [
          '{actor.0} is passionately reciting love poetry to {actor.1}.',
        ],
      },
      mixer_social_Serenade_targeted_romance_emotionSpecific: {
        pre_actions: [
          '{actor.0} is serenading {actor.1} with a romantic song.',
        ],
      },
      mixer_social_MakeAFlirtatiousJoke_targeted_romance_emotionSpecific: {
        pre_actions: [
          '{actor.0} is playfully making a flirtatious joke with {actor.1}.',
        ],
      },
      mixer_social_DenounceFriendship_targeted_mean_emotionSpecific: {
        pre_actions: [
          '{actor.0} is confronting {actor.1} and cruelly denouncing their friendship.',
        ],
      },
      mixer_social_ChewOut_targeted_mean_emotionSpecific: {
        pre_actions: [
          '{actor.0} is confronting {actor.1} and giving them a harsh scolding.',
        ],
      },
      mixer_social_Provoke_targeted_mean_emotionSpecific: {
        pre_actions: [
          '{actor.0} is deliberately trying to upset {actor.1} by provoking them.',
        ],
      },
      mixer_social_ThrowDrink_targeted_mean_emotionSpecific: {
        pre_actions: ['{actor.0} is spitefully throwing a drink at {actor.1}.'],
      },
      mixer_social_InsultFace_targeted_mean_emotionSpecific: {
        pre_actions: ["{actor.0} is insulting {actor.1}'s face."],
      },
      mixer_social_ImpishlyPester_targeted_mean_emotionSpecific: {
        pre_actions: [
          '{actor.0} is playfully pestering {actor.1} in a mischievous and somewhat mean-spirited manner.',
        ],
      },
      mixer_social_TellDirtyJoke_targeted_funny_emotionSpecific: {
        pre_actions: [
          '{actor.0} is reciting a dirty joke to {actor.1}. {actor.1} is listening as {actor.0} begins.',
        ],
      },
      mixer_social_FlashCrazyEyes_targeted_funny_emotionSpecific: {
        pre_actions: [
          '{actor.0} is playfully flashing crazy eyes at {actor.1}.',
        ],
      },
      mixer_social_Vent_targeted_friendly_emotionSpecific: {
        pre_actions: [
          '{actor.0} is venting to {actor.1} about their frustrations or concerns.',
        ],
      },
      mixer_social_ComplainAboutProblems_targeted_friendly_emotionSpecific: {
        pre_actions: [
          '{actor.0} is expressing their concerns and complaining about their problems to {actor.1}.',
        ],
      },
      mixer_social_AskForAdvice_targeted_friendly_emotionSpecific: {
        pre_actions: ['{actor.0} is asking {actor.1} for advice.'],
      },
      mixer_social_ProposeCrazyScheme_targeted_friendly_emotionSpecific: {
        pre_actions: ['{actor.0} is proposing a crazy scheme to {actor.1}.'],
      },
      mixer_social_PitchStoryIdea_targeted_friendly_emotionSpecific: {
        pre_actions: [
          '{actor.0} is pitching a story idea to {actor.1}, hoping to spark their interest.',
        ],
      },
      mixer_social_DescribeNewInvention_targeted_friendly_emotionSpecific: {
        pre_actions: [
          '{actor.0} is excitedly describing their new invention to {actor.1}.',
        ],
      },
      mixer_social_SelfDeprecatingJoke_group_funny_emotionSpecific: {
        pre_actions: [
          '{actor.0} is telling a self-deprecating joke about themselves to {actor.1}.',
        ],
      },
      mixer_social_AskAboutCareer_friendly_STC: {
        pre_actions: ['{actor.0} is asking {actor.1} about their career.'],
      },
      mixer_social_DiscussInterests_friendly_STC: {
        pre_actions: [
          '{actor.0} and {actor.1} are having a friendly conversation about their interests.',
        ],
      },
      mixer_social_HeartfeltCompliment_targeted_friendly_emotionSpecific: {
        pre_actions: [
          '{actor.0} is complimenting {actor.1} in a sincere and friendly manner.',
        ],
      },
      mixer_social_BrightenDay_targeted_friendly_emotionSpecific: {
        pre_actions: [
          '{actor.0} is interacting with {actor.1} in a friendly manner, trying to brighten their day.',
        ],
      },
      mixer_social_CheerUp_targeted_friendly_emotionSpecific: {
        pre_actions: [
          '{actor.0} is attempting to cheer up {actor.1} in a friendly manner.',
        ],
      },
      mixer_social_GushAboutPartner_targeted_friendly_emotionSpecific: {
        pre_actions: [
          '{actor.0} is excitedly talking about their partner with {actor.1}, expressing their love and admiration.',
        ],
      },
      mixer_social_GiveRelationshipAdvice_targeted_friendly_emotionSpecific: {
        pre_actions: [
          '{actor.0} is offering relationship advice to {actor.1} in a friendly manner.',
        ],
      },
      mixer_social_AskAboutLoveLife_targeted_friendly_emotionSpecific: {
        pre_actions: ['{actor.0} is asking {actor.1} about their love life.'],
      },
      mixer_social_EnthuseAboutInterests_targeted_friendly_emotionSpecific: {
        pre_actions: [
          '{actor.0} is enthusiastically talking to {actor.1} about their shared interests.',
        ],
      },
      mixer_social_HipBump_targeted_friendly_emotionSpecific: {
        pre_actions: [
          '{actor.0} is playfully bumping hips with {actor.1} in a friendly manner.',
        ],
      },
      mixer_social_GivePepTalk_targeted_friendly_emotionSpecific: {
        pre_actions: [
          "{actor.0} is boosting {actor.1}'s morale with a friendly pep talk.",
        ],
      },
      mixer_social_ShowOffMuscles_targeted_friendly_emotionSpecific: {
        pre_actions: [
          '{actor.0} is flexing their muscles to impress {actor.1}.',
        ],
      },
      mixer_social_RantAndRave_targeted_friendly_emotionSpecific: {
        pre_actions: [
          '{actor.0} is expressing their frustrations and opinions to {actor.1}, in a friendly manner.',
        ],
      },
      mixer_social_Seduce_targeted_romance_emotionSpecific: {
        pre_actions: [
          '{actor.0} is attempting to seduce {actor.1} in a romantic way.',
        ],
      },
      mixer_social_Apologize_targeted_friendly_lowScore: {
        pre_actions: ['{actor.0} is apologizing to {actor.1}.'],
      },
      mixer_social_AskToBeBoyfriend_targeted_romance_relationship: {
        pre_actions: [
          '{actor.0} is asking {actor.1} to be their boyfriend/girlfriend.',
        ],
      },
      mixer_social_AskToBeGirlfriend_targeted_romance_relationship: {
        pre_actions: [
          '{actor.0} is asking {actor.1} to be their girlfriend, expressing their romantic interest.',
        ],
      },
      mixer_social_FirstKiss_targeted_romance_STC: {
        pre_actions: [
          '{actor.0} is leaning in and sharing their first kiss with {actor.1}.',
        ],
      },
      mixer_social_BreakUp_targeted_mean_relationship: {
        pre_actions: [
          '{actor.0} is breaking up with {actor.1} to end their relationship.',
        ],
      },
      mixer_social_Divorce_targeted_mean_relationship: {
        pre_actions: [
          '{actor.0} and {actor.1} are deciding to end their marriage and get a divorce.',
        ],
      },
      mixer_social_DeclareEnemy_targeted_mean_relationship: {
        pre_actions: [
          '{actor.0} is confronting {actor.1} and declaring them an enemy, negatively affecting their relationship.',
        ],
      },
      mixer_social_Fight_targeted_mean: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a heated argument, exchanging insults and trading blows.',
        ],
      },
      mixer_social_Propose_targeted_romance_relationship: {
        pre_actions: [
          '{actor.0} is proposing to {actor.1}, taking their relationship to the next level.',
        ],
      },
      mixer_social_WooHoo_targeted_romance_transition: {
        pre_actions: [
          "{actor.0} is taking {actor.1}'s hand to go have sex in the bedroom.",
        ],
      },
      mixer_social_WooHooInRocketShip_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} is leading {actor.1} to the rocket ship to go have sex.',
        ],
      },
      mixer_social_WooHooInObservatory_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} is leading {actor.1} to the Observatory to go have sex.',
        ],
      },
      mixer_social_TryForBaby_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} is beginning a conversation about trying to have a baby with {actor.1}.',
        ],
      },
      mixer_social_ProfessUndyingLove_targeted_romance_highScore: {
        pre_actions: [
          '{actor.0} is expressing their love for {actor.1} in a heartfelt declaration.',
        ],
      },
      mixer_social_TalkAboutDreams_targeted_friendly_emotionSpecific: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1}, discussing their dreams and aspirations.',
        ],
      },
      mixer_social_ShareInsecurities_targeted_friendly_emotionSpecific: {
        pre_actions: [
          '{actor.0} is sharing their insecurities with {actor.1}.',
        ],
      },
      mixer_social_BrushOff_targeted_mean_emotionSpecific: {
        pre_actions: ['{actor.0} is rudely brushing off {actor.1}.'],
      },
      mixer_social_YellAT_targeted_mean: {
        pre_actions: ['{actor.0} is starting a conversation with {actor.1}.'],
      },
      mixer_social_TryToChat_targeted_friendly_lowScore: {
        pre_actions: [
          '{actor.0} is attempting to chat with {actor.1} in a friendly manner.',
        ],
      },
      mixer_social_FindCommonGround_targeted_friendly_lowScore: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1}, trying to find common ground.',
        ],
      },
      mixer_social_BegForgiveness_targeted_friendly_lowScore: {
        pre_actions: ["{actor.0} is begging for {actor.1}'s forgiveness."],
      },
      mixer_social_DescribeRobotInvasion_group_funny_highScore: {
        pre_actions: ['{actor.0} is starting a conversation with {actor.1}.'],
      },
      mixer_social_AskForReassurance_targeted_romance_emotionSpecific: {
        pre_actions: [
          '{actor.0} is asking {actor.1} for reassurance, seeking emotional support in their relationship.',
        ],
      },
      mixer_social_RekindleTheRomance_targeted_romance_lowScore: {
        pre_actions: [
          '{actor.0} is trying to rekindle the romance with {actor.1} due to their low relationship score.',
        ],
      },
      mixer_social_WhisperSeductively_targeted_romance_middleScore: {
        pre_actions: ['{actor.0} is whispering seductively to {actor.1}.'],
      },
      mixer_social_AskIfSingle_targeted_romance_alwaysOn: {
        pre_actions: ["{actor.0} is asking {actor.1} if they're single."],
      },
      mixer_social_HoldHands_targeted_romance_middleScore: {
        pre_actions: [
          '{actor.0} is reaching out to {actor.1} and they are holding hands, deepening their romantic bond.',
        ],
      },
      mixer_social_Embrace_targeted_romance_middleScore_STC: {
        pre_actions: [
          '{actor.0} is embracing {actor.1} in a romantic gesture.',
        ],
      },
      mixer_social_Flirt_targeted_romance_alwaysOn: {
        pre_actions: ['{actor.0} is starting to flirt with {actor.1}.'],
      },
      mixer_social_ComplimentAppearance_targeted_romance_alwaysOn: {
        pre_actions: [
          '{actor.0} is beginning complimenting {actor.1} on their appearance.',
        ],
      },
      mixer_social_PickupLine_targeted_romance_alwaysOn: {
        pre_actions: ['{actor.0} is using a pick-up line on {actor.1}.'],
      },
      mixer_social_ConfessAttraction_targeted_romance_middleScore: {
        pre_actions: ['{actor.0} is confessing their attraction to {actor.1}.'],
      },
      mixer_social_CaressCheek_targeted_romance_highScore: {
        pre_actions: ["{actor.0} is gently caressing {actor.1}'s cheek."],
      },
      mixer_social_BlowAKiss_targeted_romance_highScore: {
        pre_actions: ['{actor.0} is blowing a kiss to {actor.1}.'],
      },
      mixer_social_RememberCommonInterests_targeted_romance_lowScore: {
        pre_actions: [
          '{actor.0} is discussing with {actor.1} to remember their common interests as romantic partners.',
        ],
      },
      mixer_social_FriendlyIntroduction_greetings: {
        pre_actions: [
          '{actor.0} is greeting {actor.1} with a friendly introduction.',
        ],
      },
      mixer_social_FunnyIntroduction_greetings: {
        pre_actions: [
          '{actor.0} is introducing themselves to {actor.1} in a funny and lighthearted way.',
        ],
      },
      mixer_social_RudeIntroduction_greetings: {
        pre_actions: [
          '{actor.0} is rudely introducing themselves to {actor.1} with a cold and unfriendly greeting.',
        ],
      },
      mixer_social_FlirtyIntroduction_greetings_skills: {
        pre_actions: ['{actor.0} is greeting {actor.1} in a flirty manner.'],
      },
      mixer_social_CheerfulIntroduction_greetings_skills: {
        pre_actions: ['{actor.0} is enthusiastically greeting {actor.1}.'],
      },
      mixer_social_EnchantingIntroduction_greetings_skills: {
        pre_actions: [
          '{actor.0} is introducing themselves to {actor.1} in a friendly and enchanting manner.',
        ],
      },
      mixer_social_DescribeApocalypse_group_mischief_skills: {
        pre_actions: ['{actor.0} is describing the apocalypse to {actor.1}.'],
      },
      mixer_social_TellUnbelievableStory_group_friendly_emotionspecific: {
        pre_actions: [
          '{actor.0} is enthusiastically telling {actor.1} an unbelievable story, keeping the conversation light and friendly.',
        ],
      },
      mixer_socials_TellFunnyStory_group_Funny_alwaysOn: {
        pre_actions: ['{actor.0} is telling a funny story to {actor.1}.'],
      },
      mixer_socials_GoofAround_targeted_Funny_alwaysOn: {
        pre_actions: ['{actor.0} is playfully goofing around with {actor.1}.'],
      },
      mixer_social_TellOutrageousStory_group_Funny_HighScore: {
        pre_actions: ['{actor.0} is telling an outrageous story to {actor.1}.'],
      },
      mixer_social_InsideJoke_group_Funny_MediumScore: {
        pre_actions: ['{actor.0} is telling {actor.1} an inside joke.'],
      },
      mixer_social_JokeAboutPoliticians_group_Funny_MediumScore: {
        pre_actions: [
          '{actor.0} is telling {actor.1} a joke about politicians.',
        ],
      },
      mixer_social_ImpersonateCelebrity_group_Funny_MediumScore: {
        pre_actions: [
          '{actor.0} is attempting to impersonate a celebrity in a funny way, entertaining the group.',
        ],
      },
      mixer_social_JokeAboutOldTimes_group_Funny_MediumScore: {
        pre_actions: [
          '{actor.0} is reminiscing about old times with {actor.1}, sharing some funny and nostalgic memories.',
        ],
      },
      mixer_social_Intimidate_targeted_mean_middleScore: {
        pre_actions: [
          '{actor.0} is confronting {actor.1} in a mean-spirited attempt to intimidate them.',
        ],
      },
      mixer_social_MockOutfit_targeted_Mean_middleScore: {
        pre_actions: [
          "{actor.0} is mocking {actor.1}'s outfit, being mean-spirited.",
        ],
      },
      mixer_social_ImplyMotherIsLlama_targeted_mean_highScore: {
        pre_actions: [
          "{actor.0} is implying that {actor.1}'s mother is a llama, in a mean-spirited manner.",
        ],
      },
      mixer_social_SitIntimate_MakeAMove_targeted_romance_alwaysOn: {
        pre_actions: [
          '{actor.0} is sitting with {actor.1} and making a sexual advance on them.',
        ],
      },
      mixer_social_SitIntimate_Kiss_targeted_romance_emotionSpecific: {
        pre_actions: [
          '{actor.0} is leaning in and giving {actor.1} a passionate kiss.',
        ],
      },
      mixer_social_SitIntimate_MakeOut_targeted_romance_highScore: {
        pre_actions: [
          '{actor.0} is sitting with {actor.1} and passionately making out with them.',
        ],
      },
      mixer_social_SitIntimate_GiveMassage_targeted_romance_highScore: {
        pre_actions: ['{actor.0} is giving {actor.1} a relaxing massage.'],
      },
      mixer_social_SitIntimate_GiveVigorousMassage_targeted_romance_highScore: {
        pre_actions: [
          '{actor.0} is giving {actor.1} a vigorous massage, providing a moment of intimate connection.',
        ],
      },
      mixer_social_SitIntimate_AskForMassage_targeted_romance_highScore: {
        pre_actions: [
          '{actor.0} is politely asking for a massage from {actor.1}.',
        ],
      },
      mixer_social_SitIntimate_WhisperSweetNothings_targeted_romance_middleScore:
        {
          pre_actions: [
            '{actor.0} is leaning in close to {actor.1}, whispering sweet nothings in their ear, creating a romantic atmosphere.',
          ],
        },
      mixer_social_SitIntimate_TickleMercilessly_targeted_romance_middleScore: {
        pre_actions: [
          '{actor.0} is sitting with {actor.1} and tickling them mercilessly.',
        ],
      },
      mixer_social_SitIntimate_MakeAMove_targeted_looping: {
        pre_actions: [
          '{actor.0} is making a romantic move towards {actor.1} while sitting together.',
        ],
      },
      mixer_social_SitIntimate_Kiss_targeted_looping: {
        pre_actions: [
          '{actor.0} is leaning in and passionately kissing {actor.1}.',
        ],
      },
      mixer_social_SitIntimate_MakeOut_targeted_looping: {
        pre_actions: [
          '{actor.0} is engaging in an intimate make out session with {actor.1} while sitting together.',
        ],
      },
      mixer_social_PretendToBeSlapped_targeted_mischief_skills: {
        pre_actions: ['{actor.0} is pretending to be slapped by {actor.1}.'],
      },
      mixer_social_ClaimCriminalMastermind_targeted_mischief_skills: {
        pre_actions: [
          '{actor.0} is jokingly claiming to be a criminal mastermind, playfully mischieving with {actor.1}.',
        ],
      },
      mixer_social_StartPreposterousRumor_group_mischief_skills: {
        pre_actions: [
          '{actor.0} is starting a conversation with {actor.1} in order to start a preposterous rumor.',
        ],
      },
      mixer_social_InstillWithFalseConfidence_targeted_mischief_skills: {
        pre_actions: [
          '{actor.0} is instilling false confidence into {actor.1} with a mischievous motive.',
        ],
      },
      mixer_social_LieAboutCareer_group_mischief_skills: {
        pre_actions: [
          '{actor.0} is telling {actor.1} a false story about their career.',
        ],
      },
      mixer_social_GiveFakeBadNews_targeted_mischief_skills: {
        pre_actions: [
          '{actor.0} is lying to {actor.1} by telling them fake bad news.',
        ],
      },
      mixer_social_DareToStreak_targeted_mischief_skills: {
        pre_actions: ['{actor.0} is daring {actor.1} to streak naked.'],
      },
      mixer_social_AskAboutDay_targeted_Friendly_alwaysOn: {
        pre_actions: ['{actor.0} is asking {actor.1} about their day.'],
      },
      mixer_social_DeepConversation_targeted_Friendly_MiddleScore: {
        pre_actions: [
          '{actor.0} is engaging in a deep conversation with {actor.1}, exchanging their thoughts and opinions.',
        ],
      },
      mixer_social_ExpressAdmiration_targeted_Friendly_MiddleScore: {
        pre_actions: [
          '{actor.0} is expressing their admiration for {actor.1}.',
        ],
      },
      mixer_social_ShareSecret_targeted_Friendly_HighScore: {
        pre_actions: [
          '{actor.0} is sharing personal life goals with {actor.1}.',
        ],
      },
      mixer_social_Flatter_targeted_Friendly_alwaysOn: {
        pre_actions: ['{actor.0} is beginning to flatter {actor.1}.'],
      },
      mixer_social_Hug_targeted_Friendly_MiddleScore: {
        pre_actions: ['{actor.0} is beginning to hug {actor.1}.'],
      },
      mixer_social_TellEngagingStory_group_Friendly_MiddleScore: {
        pre_actions: [
          '{actor.0} is captivating {actor.1} with an engaging story now.',
        ],
      },
      mixer_social_TellDramaticStory_group_Friendly_MiddleScore: {
        pre_actions: [
          '{actor.0} is captivating {actor.1} with a dramatic story, captivating everyone in the group.',
        ],
      },
      // # Talk about treasure memory interaction
      mixer_social_RevealDeepSecret_targeted_Friendly_HighScore: {
        pre_actions: [
          '{actor.0} is beginning to share a treasured memory they remember to {actor.1}.',
        ],
      },
      mixer_social_ExpressFondness_targeted_Romance_alwaysOn: {
        pre_actions: [
          '{actor.0} is expressing their fondness for {actor.1} in a romantic way.',
        ],
      },
      mixer_social_BecomePartnersInCrime_targeted_friendly_highScore: {
        pre_actions: [
          '{actor.0} and {actor.1} are becoming partners in crime.',
        ],
      },
      mixer_social_ComplainAboutBoredom_targeted_friendly_emotionSpecific: {
        pre_actions: [
          '{actor.0} is complaining to {actor.1} about feeling bored.',
        ],
      },
      mixer_social_SuggestFunActivities_targeted_friendly_emotionSpecific: {
        pre_actions: [
          '{actor.0} is suggesting fun activities to {actor.1}, hoping to have some fun together.',
        ],
      },
      mixer_social_DiscussFavoriteRecipes_targeted_Friendly_MiddleScore: {
        pre_actions: [
          '{actor.0} and {actor.1} are discussing their favorite recipes.',
        ],
      },
      mixer_social_DebateBestCaptains_targeted_Friendly_HighScore: {
        pre_actions: [
          '{actor.0} is engaging in a friendly debate with {actor.1} about who the best captains are.',
        ],
      },
      mixer_social_EnthuseAboutNewShow_targeted_Friendly_MiddleScore: {
        pre_actions: [
          '{actor.0} is excitedly telling {actor.1} about a new TV show they just discovered.',
        ],
      },
      mixer_social_DiscussFineCuisine_targeted_Friendly_MiddleScore: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a friendly conversation about fine cuisine.',
        ],
      },
      mixer_social_PumpUp_targeted_friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is enthusiastically motivating {actor.1}, pumping up their self esteem.',
        ],
      },
      mixer_social_RileUp_targeted_mean_alwaysOn: {
        pre_actions: [
          '{actor.0} is agitating {actor.1}, trying to make them upset.',
        ],
      },
      mixer_social_ShareMelancholyThoughts_tag_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is opening up to {actor.1} about their melancholic thoughts, seeking comfort and understanding.',
        ],
      },
      mixer_social_ShareIdeas_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is excitedly sharing some brilliant ideas with {actor.1}.',
        ],
      },
      mixer_social_EnthuseAboutSpace_targeted_friendly_alwaysOn_career: {
        pre_actions: [
          '{actor.0} is beginning to enthuse about space to {actor.1}.',
        ],
      },
      mixer_social_TalkAboutArt_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1} about art.',
        ],
      },
      mixer_social_DiscussFavoriteBand_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is engaging {actor.1} in a friendly conversation about their favorite band.',
        ],
      },
      mixer_social_EnhuseAboutNewAlbums_targeted_Friendly_alwaysOn: {
        pre_actions: [
          "{actor.0} is excitedly talking to {actor.1} about new albums they've discovered.",
        ],
      },
      mixer_social_DismissGoodness_targeted_mean_alwaysOn: {
        pre_actions: [
          '{actor.0} is dismissing {actor.1} with a mean attitude.',
        ],
      },
      mixer_social_BoastAboutFamily_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is proudly talking about their family to {actor.1}.',
        ],
      },
      mixer_social_BroHug_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is giving {actor.1} a warm and friendly bro hug.',
        ],
      },
      mixer_social_BroBump_targeted_Friendly_alwaysOn: {
        pre_actions: ['{actor.0} is giving {actor.1} a friendly bro bump.'],
      },
      mixer_social_DiscussFavoriteArtist_targeted_Friendly_MiddleScore: {
        pre_actions: [
          '{actor.0} and {actor.1} are having a friendly conversation about their favorite artist.',
        ],
      },
      mixer_social_RevealBrilliantInvention_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is excitedly showing {actor.1} their brilliant invention.',
        ],
      },
      mixer_social_DiscussLatestBook_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is engaging in a friendly discussion with {actor.1} about the latest book they are reading.',
        ],
      },
      mixer_social_DiscussFavoriteAuthors_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} and {actor.1} are having a friendly discussion about their favorite authors.',
        ],
      },
      mixer_social_DiscussWorldPeace_targeted_Friendly_alwaysOn: {
        pre_actions: ['{actor.0} is discussing world peace with {actor.1}.'],
      },
      mixer_social_DismissEvilWays_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is trying to convince {actor.1} to dismiss their evil ways and choose a more friendly path.',
        ],
      },
      mixer_socail_DiscussFearOfCommitment_targeted_romance_alwaysOn: {
        pre_actions: [
          '{actor.0} is discussing their fear of commitment with {actor.1}.',
        ],
      },
      mixer_social_EnthuseAboutOutdoors_targeted_Friendly_MiddleScore: {
        pre_actions: [
          '{actor.0} is sharing their excitement and passion for the great outdoors with {actor.1}.',
        ],
      },
      mixer_social_BragAboutPossesions_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is showing off their impressive possessions to {actor.1}, boasting and bragging about their belongings.',
        ],
      },
      mixer_social_ComplainAboutTvSize_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is expressing their dissatisfaction about the size of the TV to {actor.1}.',
        ],
      },
      mixer_social_DiscussGourmetDishes_targeted_Friendly_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} and {actor.1} are having a friendly conversation about gourmet dishes.',
        ],
      },
      mixer_social_ShareCookingSecrets_targeted_Friendly_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} is excitedly sharing some cooking secrets with {actor.1}.',
        ],
      },
      mixer_social_TalkAboutCooking_targeted_Friendly_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} is beginning to enthuse about the hobby of cooking to {actor.1}.',
        ],
      },
      mixer_social_GiveCookingTips_targeted_Friendly_alwaysOn_skills: {
        pre_actions: ['{actor.0} is sharing some cooking tips with {actor.1}.'],
      },
      mixer_social_Kiss_targeted_romance_middleScore: {
        pre_actions: [
          '{actor.0} is leaning in and kissing {actor.1} passionately, expressing their deep romantic feelings.',
        ],
      },
      mixer_social_AskAboutFood_targeted_Friendly_alwaysOn_Event: {
        pre_actions: [
          '{actor.0} is asking {actor.1} about their favorite foods.',
        ],
      },
      mixer_social_InviteToFakeParty_targeted_mischief_alwaysOn: {
        pre_actions: [
          '{actor.0} is inviting {actor.1} to a fake party as a mischievous prank.',
        ],
      },
      mixer_social_ShareBigNews_targeted_Friendly_alwaysOn_pregnancy: {
        pre_actions: [
          '{actor.0} is excitedly sharing some big news with {actor.1}.',
        ],
      },
      mixer_social_DiscussFitnessTechniques_targeted_Friendly_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} and {actor.1} are having a friendly conversation about fitness techniques.',
        ],
      },
      mixer_social_PracticeFighting_targeted_Friendly_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a friendly practice fight, honing their combat skills together.',
        ],
      },
      mixer_social_AskForLargeLoan_targeted_friendly_alwaysOn: {
        pre_actions: ['{actor.0} is asking {actor.1} for a large loan.'],
      },
      mixer_social_AskForSmallLoan_targeted_friendly_alwaysOn: {
        pre_actions: ['{actor.0} is asking {actor.1} for a small loan.'],
      },
      mixer_social_RepayLoanSmall_targeted_Friendly_alwaysOn: {
        pre_actions: ['{actor.0} is repaying a small loan to {actor.1}.'],
      },
      mixer_social_RepayLoanLargeAndSmall_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is repaying a loan they received from {actor.1} in a friendly interaction.',
        ],
      },
      mixer_social_RepayLoanLarge_targeted_Friendly_alwaysOn_Copy: {
        pre_actions: [
          '{actor.0} is kindly giving {actor.1} money, paying back a large loan.',
        ],
      },
      mixer_social_TalkAboutHandiness_targeted_Friendly_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1} discussing the topic of handiness.',
        ],
      },
      mixer_social_BragAboutHandiness_targeted_Friendly_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} is proudly bragging to {actor.1} about their impressive handiness skills.',
        ],
      },
      mixer_social_MentorHandiness_targeted_Friendly_HighScore: {
        pre_actions: [
          '{actor.0} is sharing some repair tips with {actor.1} to help them improve their handiness skill.',
        ],
      },
      mixer_social_CalmDown_friendly_emotionSpecific: {
        pre_actions: [
          '{actor.0} is attempting to calm down {actor.1} by engaging in a friendly conversation.',
        ],
      },
      mixer_social_AskRisqueQuestion_targeted_romance_alwaysOn: {
        pre_actions: ['{actor.0} is asking {actor.1} a risqué question.'],
      },
      mixer_social_AskAboutDrink_targeted_Friendly_alwaysOn_Event: {
        pre_actions: [
          '{actor.0} is asking {actor.1} about their preferred drinks during a friendly conversation.',
        ],
      },
      mixer_social_DiscussColorTheory_targeted_Friendly_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} is engaging in a friendly discussion with {actor.1} about color theory.',
        ],
      },
      mixer_social_ComplimentArt_targeted_Friendly_alwaysOn_skills: {
        pre_actions: ['{actor.0} is complimenting {actor.1} on their art.'],
      },
      mixer_social_DescribeAesthetics_group_Friendly_alwaysOn_skills: {
        pre_actions: [
          "{actor.0} is complimenting {actor.1}'s sense of aesthetics, discussing their favorite designs and styles.",
        ],
      },
      mixer_social_ProvideLogicalSolution_targeted_Friendly_alwaysOn_skills: {
        pre_actions: [
          "{actor.0} is suggesting a logical solution to {actor.1}'s problem.",
        ],
      },
      mixer_social_DiscussLogicalPuzzles_targeted_Friendly_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} is engaging in a friendly discussion with {actor.1} about logic puzzles.',
        ],
      },
      mixer_social_RantLogically_targeted_mean_emotionSpecific: {
        pre_actions: [
          '{actor.0} is passionately declaring their thoughts to {actor.1}, explaining their logical viewpoint.',
        ],
      },
      mixer_social_AskToCleanUpToys_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is politely asking {actor.1} to help clean up the toys.',
        ],
      },
      mixer_social_DontTalkAboutCrimeClub_targeted_Friendly_alwaysOn_career: {
        pre_actions: [
          '{actor.0} is avoiding discussing the Crime Club with {actor.1} in a friendly conversation.',
        ],
      },
      mixer_social_Pickpocket_targeted_mischief_career: {
        pre_actions: [
          '{actor.0} is attempting to pickpocket {actor.1} as a mischievous act, possibly related to their career.',
        ],
      },
      mixer_social_Threaten_targeted_mean_career: {
        pre_actions: [
          '{actor.0} is confronting {actor.1} and threatening them, possibly due to a conflict in their careers.',
        ],
      },
      mixer_social_TalkAboutDrinkMaking_targeted_Friendly_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1} about mixology.',
        ],
      },
      mixer_social_ShareBartendingSecrets_targeted_Friendly_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} and {actor.1} are sharing mixology secrets in a friendly conversation.',
        ],
      },
      mixer_social_NPC_AskToHangOut_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is inviting {actor.1} to hang out and spend some time together.',
        ],
      },
      mixer_social_TryOutMaterial_targeted_funny_alwaysOn: {
        pre_actions: [
          '{actor.0} is playfully trying out a new material with {actor.1}.',
        ],
      },
      mixer_social_DiscussTheBestViolinist_targeted_Friendly_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} is engaging {actor.1} in a friendly discussion about the best violinist.',
        ],
      },
      mixer_social_PraisePianoSonatas_targeted_Friendly_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} is enthusiastically talking to {actor.1} about their love for piano sonatas.',
        ],
      },
      mixer_social_EnthuseAboutGuitarSolos_targeted_Friendly_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} is excitedly talking to {actor.1} about amazing guitar solos.',
        ],
      },
      mixer_social_PromisetoDedicateSong_targeted_romance_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} is promising to dedicate a song to {actor.1} as a romantic gesture.',
        ],
      },
      mixer_social_KnockKnockJoke_targeted_funny_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} is telling a knock knock joke to {actor.1}. {actor.1} is listening as {actor.0} begins.',
        ],
      },
      mixer_social_AskAboutFavoriteAuthor_targeted_Friendly_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1} and asking them about their favorite author.',
        ],
      },
      mixer_social_EnthuseAboutLambicPentameter_group_Friendly_MiddleScore_skills:
        {
          pre_actions: [
            '{actor.0} is excitedly sharing their passion for iambic pentameter with {actor.1}.',
          ],
        },
      mixer_social_TellCrowdPleasingStory_group_funny_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} is captivating the group with a funny and crowd-pleasing story.',
        ],
      },
      mixer_social_JokeAboutFashion_targeted_funny_alwaysOn_Skills: {
        pre_actions: [
          '{actor.0} is beginning to tell a joke about fashion to {actor.1}.',
        ],
      },
      mixer_social_InterviewForStory_targeted_Friendly_alwaysOn_career: {
        pre_actions: [
          '{actor.0} is conducting an interview with {actor.1} to gather information for a news story.',
        ],
      },
      mixer_social_InterviewAboutLife_targeted_Friendly_alwaysOn_career: {
        pre_actions: [
          '{actor.0} is interviewing {actor.1} about their life, possibly discussing their career or aspirations.',
        ],
      },
      mixer_social_ThankForComing_targeted_Friendly_alwaysOn_Event: {
        pre_actions: [
          '{actor.0} is thanking {actor.1} for coming to the event.',
        ],
      },
      mixer_social_PointOutConstellations_targeted_Friendly_alwaysOn_careers: {
        pre_actions: [
          '{actor.0} is excitedly pointing out constellations to {actor.1}, sharing their knowledge and sparking a friendly conversation.',
        ],
      },
      mixer_social_AskForTypingTips_targeted_Friendly_alwaysOn_child_skill: {
        pre_actions: [
          '{actor.0} is asking {actor.1} for tips on typing, in a friendly manner.',
        ],
      },
      mixer_social_TalkAboutSchool_targeted_Friendly_alwaysOn_child_skills: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a friendly conversation about school.',
        ],
      },
      mixer_socials_GoofAround_targeted_Funny_alwaysOn_child_skills: {
        pre_actions: [
          '{actor.0} and {actor.1} are playfully joking around and having a good time together.',
        ],
      },
      mixer_social_PopCultureReference_tareted_Friendly_alwaysOn_child_skills: {
        pre_actions: [
          '{actor.0} is excitedly sharing a pop culture reference with {actor.1}, sparking a friendly conversation.',
        ],
      },
      mixer_social_TalkAboutFractions_targeted_Friendly_alwaysOn_child_skills: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1} about fractions.',
        ],
      },
      mixer_social_TellMakeBelieveStory_targeted_Friendly_alwaysOn_child_skills:
        {
          pre_actions: [
            '{actor.0} is telling {actor.1} a fun and imaginative story, creating a friendly and playful atmosphere.',
          ],
        },
      mixer_social_DescribeImaginayFriend_Friendly_alwaysOn_child_skills: {
        pre_actions: [
          '{actor.0} is explaining to {actor.1} about their imaginary friend, sharing their excitement and childlike imagination with each other.',
        ],
      },
      mixer_social_AskImpossibleRiddle_targeted_mischief_alwaysOn_child_skills:
        {
          pre_actions: [
            '{actor.0} is playfully asking {actor.1} an impossible riddle, mischievously teasing them.',
          ],
        },
      mixer_social_DiscussLatestGames_targeted_Friendly_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1}, discussing the latest games.',
        ],
      },
      mixer_social_MockSimsMood_targeted_mean_alwaysOn_child_skills: {
        pre_actions: [
          "{actor.0} is mocking {actor.1}'s mood, being mean and insensitive.",
        ],
      },
      mixer_social_DebateGameStrategy_targeted_Friendly_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} is engaging in a friendly debate with {actor.1} about game strategy.',
        ],
      },
      mixer_social_BragAboutSkillz_targeted_Friendly_alwaysOn_career: {
        pre_actions: [
          '{actor.0} is proudly showing off their impressive skills to {actor.1}, in a friendly manner.',
        ],
      },
      mixer_social_TalkAboutNewApp_targeted_Friendly_alwaysOn_career: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a friendly conversation about a new app.',
        ],
      },
      mixer_social_BragAboutStartup_targeted_Friendly_alwaysOn_career: {
        pre_actions: [
          '{actor.0} is proudly talking about their successful startup to {actor.1}, sharing their accomplishments and career aspirations.',
        ],
      },
      mixer_social_SecretVillainHandshake_targeted_mean_alwaysOn_career: {
        pre_actions: [
          '{actor.0} is doing a secret villain handshake with {actor.1}.',
        ],
      },
      mixer_social_TranquilizingHandshake_targeted_mischief_alwaysOn_career: {
        pre_actions: [
          '{actor.0} is playfully tricking {actor.1} with a tranquilizing handshake.',
        ],
      },
      mixer_social_HeckleMicrophonePerformance_alwaysOn: {
        pre_actions: [
          '{actor.0} is playfully heckling {actor.1} during their microphone performance.',
        ],
      },
      mixer_social_GossipAboutVideoGamePros_targeted_friendly_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1} about video game pros.',
        ],
      },
      mixer_social_ImpressWithVideoGameProwess_targeted_romance_alwaysOn_skills:
        {
          pre_actions: [
            '{actor.0} is impressing {actor.1} with their video game prowess.',
          ],
        },
      mixer_social_MakeFunOfNoobs_targeted_funny_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} is teasing {actor.1} in a playful manner, making fun of their lack of experience.',
        ],
      },
      mixer_social_HilariousIcebreaker_greetings: {
        pre_actions: [
          '{actor.0} is using a hilarious greeting with {actor.1} to break the ice.',
        ],
      },
      mixer_social_FunniestJokeInTheWorld_group_Funny_HighScore: {
        pre_actions: [
          '{actor.0} is sharing the funniest joke in the world with {actor.1}.',
        ],
      },
      mixer_social_ComplainAboutBills_targeted_Friendly_alwaysOn_bills: {
        pre_actions: [
          '{actor.0} is complaining to {actor.1} about the high cost of bills.',
        ],
      },
      mixer_social_ComplainAboutLackOfWater_targeted_friendly_alwaysOn_bills: {
        pre_actions: [
          "{actor.0} is expressing frustration to {actor.1} about the lack of water due to {actor.0}'s unpaid water bill.",
        ],
      },
      mixer_social_ComplainAboutLackOfPower_targeted_friendly_alwaysOn_billsLack:
        {
          pre_actions: [
            "{actor.0} is voicing their frustration to {actor.1} about the lack of power due to {actor.0}'s unpaid water bill.",
          ],
        },
      mixer_social_SitIntimate_Cuddle_targeted_friendly_alwaysOn: {
        pre_actions: ['{actor.0} is sitting and cuddling {actor.1}.'],
      },
      mixer_social_SitIntimate_Cuddle_targeted_looping: {
        pre_actions: ['{actor.0} is sitting and cuddling {actor.1}.'],
      },
      mixer_social_WeaponizedJoke_targeted_funny_alwaysOn: {
        pre_actions: ['{actor.0} is telling a weaponized joke to {actor.1}.'],
      },
      mixer_social_HorrifyingJoke_targeted_funny_alwaysOn: {
        pre_actions: ['{actor.0} is telling a horrifying joke to {actor.1}.'],
      },
      mixer_social_WritingJournalism_ArticleNegative_YellAT_targeted_mean: {
        pre_actions: [
          '{actor.0} is confronting {actor.1} about a negative article, angrily expressing their dissatisfaction.',
        ],
      },
      mixer_social_WritingJournalism_ArticlePositive_Thanks_targeted_Friendly_alwaysOn:
        {
          pre_actions: [
            '{actor.0} is complimenting {actor.1} on their recent article, expressing gratitude and positivity.',
          ],
        },
      mixer_social_AskOnDateEvent_targeted_romance_alwaysOn: {
        pre_actions: [
          '{actor.0} is asking {actor.1} on a date, hoping to spend some romantic time together.',
        ],
      },
      mixer_social_CriticizeWooHooTechniques_targeted_mean_middleScore: {
        pre_actions: ['{actor.0} is criticizing {actor.1}.'],
      },
      mixer_social_Congratulate_targeted_Friendly_alwaysOn_event: {
        pre_actions: [
          '{actor.0} is congratulating {actor.1} on [keyword that triggered the congratulation].',
        ],
      },
      mixer_social_ShareBurden_targeted_Friendly_alwaysOn_trait: {
        pre_actions: [
          '{actor.0} is opening up to {actor.1} and sharing their burden, seeking comfort and support.',
        ],
      },
      mixer_social_Beguile_targeted_romance_alwaysOn_trait: {
        pre_actions: [
          '{actor.0} is charming {actor.1} with their flirtatious words and captivating personality.',
        ],
      },
      mixer_social_LendEmotionalSupportNEW_targeted_Friendly_alwaysOn_trait: {
        pre_actions: [
          '{actor.0} is showing kindness and offering emotional support to {actor.1}.',
        ],
      },
      mixer_social_PlantSeedsOfDoubt_targeted_mischief_alwaysOn_trait: {
        pre_actions: [
          "{actor.0} is mischievously trying to plant doubts in {actor.1}'s mind about something.",
        ],
      },
      mixer_social_TellAViciousRumor_targeted_mischief_alwaysOn_trait: {
        pre_actions: [
          '{actor.0} is spreading a malicious rumor about {actor.1}, causing mischief and potentially damaging their reputation.',
        ],
      },
      mixer_social_SubtleyDebase_targeted_mischief_alwaysOn_trait: {
        pre_actions: [
          '{actor.0} is slyly insulting {actor.1} as a mischievous act.',
        ],
      },
      mixer_social_Sabotage_targeted_mischief_alwaysOn_trait: {
        pre_actions: [
          "{actor.0} is trying to sabotage {actor.1}'s plans, using mischief to disrupt their progress.",
        ],
      },
      mixer_social_ComplimentColorChoices_targeted_Friendly_alwaysOn_situation_Day1DLC:
        {
          pre_actions: [
            '{actor.0} is complimenting {actor.1} on their beautiful color choices.',
          ],
        },
      mixer_social_DiscussZebras_targeted_Friendly_alwaysOn_situation_Day1DLC: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1} discussing zebras.',
        ],
      },
      mixer_social_JokeAboutPenguins_targeted_Friendly_alwaysOn_situation_Day1DLC:
        {
          pre_actions: [
            '{actor.0} is playfully joking about penguins with {actor.1} in a light-hearted conversation.',
          ],
        },
      mixer_social_DiscussLackOfNewspapers_targeted_Friendly_alwysOn_situation_Day1DLC:
        {
          pre_actions: [
            '{actor.0} is expressing their concern to {actor.1} about the lack of newspapers in a friendly conversation due to the always-on situation.',
          ],
        },
      mixer_social_ComplimentCostume_targeted_Friendly_alwaysOn_situation_Day1DLC:
        {
          pre_actions: [
            "{actor.0} is admiring {actor.1}'s costume and complimenting them.",
          ],
        },
      mixer_social_InsultCostume_targeted_mean_alwaysOn_situation_Day1DLC: {
        pre_actions: [
          "{actor.0} is insulting {actor.1}'s costume, causing an unpleasant situation.",
        ],
      },
      mixer_social_WrapBaconAroundEverything_targeted_friendly_alwaysOn_prank: {
        pre_actions: [
          '{actor.0} is excitedly sharing their prank idea with {actor.1}, suggesting they should be wrapping bacon around everything as a friendly joke.',
        ],
      },
      mixer_social_BarricadeClassroomWithWaterCups_targeted_friendly_alwaysOn_prank:
        {
          pre_actions: [
            '{actor.0} is playfully suggesting to {actor.1} that they should be pranking their classmates by barricading the classroom with water cups.',
          ],
        },
      mixer_social_StartAFoodFight_targeted_Friendly_alwaysOn_prank: {
        pre_actions: [
          '{actor.0} is suggesting to {actor.1} that they should start a food fight, in a playful and lighthearted manner.',
        ],
      },
      mixer_social_UnleashTheGerbils_targeted_Friendly_alwaysOn_prank: {
        pre_actions: [
          '{actor.0} is enthusiastically suggesting to {actor.1} that they should be planning to unleash the gerbils, in a friendly and mischievous manner.',
        ],
      },
      mixer_social_SellTestAnswers_targeted_Friendly_alwaysOn_prank: {
        pre_actions: [
          '{actor.0} is suggesting to {actor.1} that selling test answers could be a lucrative prank.',
        ],
      },
      mixer_social_StuffGeeksInLocker_targeted_Friendly_alwaysOn_prank: {
        pre_actions: [
          '{actor.0} is playfully planning to stuff geeks in the locker with {actor.1}.',
        ],
      },
      mixer_social_StuffJocksInLocker_targeted_Friendly_alwaysOn_prank: {
        pre_actions: [
          '{actor.0} is playfully suggesting a prank to {actor.1}, involving stuffing jocks in lockers.',
        ],
      },
      mixer_AtWork_FoodFight_Prank: {
        pre_actions: [
          '{actor.0} is playfully throwing food at {actor.1}, starting a fun food fight.',
        ],
      },
      mixer_social_LureLlamaInoTheWorkplace_targeted_friendly_alwaysOn_prank: {
        pre_actions: [
          '{actor.0} is planning to lure a llama into the workplace as a friendly prank on {actor.1}.',
        ],
      },
      mixer_social_FakeAlienContact_targeted_friendly_alwaysOn_prank: {
        pre_actions: [
          '{actor.0} and {actor.1} are playfully planning to prank others by faking an alien contact.',
        ],
      },
      mixer_social_FillBosssOfficeWithBalloons_targeted_friendly_alwaysOn_prank:
        {
          pre_actions: [
            "{actor.0} is playfully suggesting to {actor.1} the idea of filling their boss' office with balloons as a prank.",
          ],
        },
      mixer_social_FreeTheFrogs_targeted_friendly_alwaysOn_prank: {
        pre_actions: [
          '{actor.0} is excitedly sharing their plans to free the frogs with {actor.1}, hoping to find an ally in their mission.',
        ],
      },
      mixer_social_SillyPuddyInTheMic_targeted_friendly_alwaysOn_prank: {
        pre_actions: [
          '{actor.0} is planning a silly prank involving sticking clay in the mic to play on {actor.1}.',
        ],
      },
      mixer_social_MustachesForArt_targeted_friendly_alwaysOn_prank: {
        pre_actions: [
          '{actor.0} and {actor.1} are planning a friendly art prank involving mustaches.',
        ],
      },
      mixer_social_MakeAllInvisibleInkVisible_targeted_friendly_alwaysOn_prank:
        {
          pre_actions: [
            '{actor.0} is playfully suggesting to {actor.1} that they should be working together to make all invisible ink visible, as a playful prank.',
          ],
        },
      mixer_social_HackIntoCoworkersEmail_targeted_friendly_alwaysOn_prank: {
        pre_actions: [
          "{actor.0} is planning to hack into their co-worker, {actor.1}'s email as a friendly prank.",
        ],
      },
      mixer_social_RearrangeKeysOnTheKeyboard_targeted_friendly_alwaysOn_prank:
        {
          pre_actions: [
            '{actor.0} is playfully suggesting to {actor.1} that they should prank someone by rearranging the keys on a keyboard.',
          ],
        },
      mixer_AtWork_FakeAlienContact: {
        pre_actions: [
          '{actor.0} is pretending to make contact with aliens, leaving {actor.1} bewildered at work.',
        ],
      },
      mixer_AtWork_FillBosssOfficeWithBalloons: {
        pre_actions: [
          "{actor.0} is deciding to play a prank on {actor.1} by filling their boss' office with balloons.",
        ],
      },
      mixer_AtWork_FreeTheFrogs: {
        pre_actions: [
          '{actor.0} is working diligently to free the frogs from captivity.',
        ],
      },
      mixer_AtWork_HackIntoCoworkersEmail: {
        pre_actions: [
          "{actor.0} is sneakily hacking into {actor.1}'s work email.",
        ],
      },
      mixer_AtWork_LureLlamaIntoOffice: {
        pre_actions: [
          '{actor.0} is convincing {actor.1} to come into the office by luring them with the promise of a llama.',
        ],
      },
      mixer_AtWork_MakeAllInvisibleInkVisible: {
        pre_actions: [
          '{actor.0} is discovering a way to make all invisible ink visible, allowing {actor.1} to see the previously hidden messages.',
        ],
      },
      mixer_AtWork_MustachesForArt: {
        pre_actions: [
          '{actor.0} and {actor.1} are chatting about their artistic skills, particularly focusing on their love for mustaches.',
        ],
      },
      mixer_AtWork_RearrangeKeysOnTheKeyboard: {
        pre_actions: [
          "{actor.0} is mischievously rearranging the keys on {actor.1}'s keyboard while at work.",
        ],
      },
      mixer_AtWork_SillyPuddyInTheMic: {
        pre_actions: [
          '{actor.0} is accidentally putting sticky clay in the mic, causing a silly mess at work with {actor.1}.',
        ],
      },
      mixer_social_SmoothRecovery_targeted_romance_alwaysOn_topic: {
        pre_actions: [
          '{actor.0} is trying to smooth things over with {actor.1} after an awkward moment.',
        ],
      },
      mixer_social_TalkAboutBestsellers_targeted_Friendly_alwaysOn_career: {
        pre_actions: [
          '{actor.0} and {actor.1} are having a friendly conversation about their favorite books and bestsellers.',
        ],
      },
      mixer_social_MockMusicTaste_targeted_mean_trait: {
        pre_actions: [
          "{actor.0} is mocking {actor.1}'s music taste, displaying their mean trait.",
        ],
      },
      mixer_social_AskDueDate_targeted_friendly_alwaysOn_Pregnancy: {
        pre_actions: [
          '{actor.0} is asking {actor.1} about their due date, showing friendliness and interest in their pregnancy.',
        ],
      },
      mixer_social_OfferToFeelBaby_targeted_Friendly_alwaysOn_Pregnancy: {
        pre_actions: [
          '{actor.0} is asking {actor.1} if they can feel their baby bump.',
        ],
      },
      mixer_social_AskToBeBestFriends_targeted_Friendly_HighScore: {
        pre_actions: ['{actor.0} is asking {actor.1} to become best friends.'],
      },
      mixer_social_DiscussConquests_targeted_Friendly_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1}, discussing their conquests.',
        ],
      },
      mixer_social_ComplimentOutfit_targeted_Friendly_alwaysOn_skills: {
        pre_actions: [
          "{actor.0} is complimenting {actor.1}'s outfit, showing appreciation for their sense of style.",
        ],
      },
      mixer_social_ApologizeInBed_targeted_romance_transition: {
        pre_actions: ['{actor.0} is apologizing to {actor.1} in bed.'],
      },
      mixer_social_SitIntimate_WooHoo_targeted_romance_HighScore: {
        pre_actions: [
          '{actor.0} is sitting and asking {actor.1} if they want to go have sex.',
        ],
      },
      mixer_social_SitIntimate_TryForBaby_targeted_romance_HighScore: {
        pre_actions: [
          '{actor.0} is sitting and asking {actor.1} if they want to have a baby together.',
        ],
      },
      mixer_social_OfferFriendlyMassage_targeted_Friendly_MiddleScore: {
        pre_actions: ['{actor.0} is asking {actor.1} if they want a massage.'],
      },
      mixer_social_ExposeSupervillain_targeted_mean_career: {
        pre_actions: [
          '{actor.0} is confronting {actor.1} about their secret identity as a Supreme Villain!',
        ],
      },
      mixer_social_FightSupervillain_targeted_mean_career: {
        pre_actions: [
          '{actor.0} is confronting {actor.1}, who is a supreme villain, in an intense battle due to their mean career.',
        ],
      },
      mixer_social_BegForNewToys_targeted_friendly_alwaysOn_child: {
        pre_actions: ['{actor.0} is begging {actor.1} to buy new toys.'],
      },
      mixer_social_ExpressLove_targeted_friendly_AlwaysOn_child: {
        pre_actions: [
          '{actor.0} is affectionately telling {actor.1} that they love them, showing their friendly bond.',
        ],
      },
      mixer_social_TellJoke_group_Funny_alwaysOn_child: {
        pre_actions: [
          '{actor.0} is telling a funny joke to {actor.1} and anyone else listening.',
        ],
      },
      mixer_social_MakeFunOfAdults_targeted_funny_alwaysOn_child: {
        pre_actions: [
          '{actor.0}, a funny child, is making fun of adults, including {actor.1}.',
        ],
      },
      mixer_social_MakeSillyFace_targeted_funny_alwaysOn_child: {
        pre_actions: ['{actor.0} is making a silly face at {actor.1}.'],
      },
      mixer_social_TellGrossJoke_group_funny_MediumScore_child: {
        pre_actions: ['{actor.0} is telling a potty joke to {actor.1}.'],
      },
      mixer_social_CallNames_targeted_mean_child: {
        pre_actions: [
          '{actor.0} is insulting {actor.1} by calling them mean names.',
        ],
      },
      mixer_social_MonkeyAround_targeted_mischief_alwaysOn_child: {
        pre_actions: [
          '{actor.0} is playfully starting to monkey around with {actor.1}.',
        ],
      },
      mixer_social_Annoy_targeted_mean_alwaysOn_childANDteen: {
        pre_actions: [
          '{actor.0} is purposefully annoying {actor.1}, acting mean and childish, possibly as a teenager.',
        ],
      },
      mixer_social_LectureAboutMisbehavior_mean_targeted_alwaysOn_child: {
        pre_actions: [
          '{actor.0} is lecturing {actor.1} about their misbehavior, being mean to them for being a child.',
        ],
      },
      mixer_social_MakeBelieve_targeted_friendly_alwaysOn_child: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a friendly game of make believe, pretending to be characters from their favorite stories.',
        ],
      },
      mixer_social_AskToStayTheNight_targeted_romance_highScore: {
        pre_actions: [
          '{actor.0} is asking {actor.1} if they would like to stay the night, hinting at a romantic interest.',
        ],
      },
      mixer_social_AskAboutSchool_targeted_friendly_alwaysOn_child: {
        pre_actions: ['{actor.0} is asking {actor.1} about how school was.'],
      },
      mixer_social_InviteTo_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is inviting {actor.1} to join them in a friendly activity.',
        ],
      },
      mixer_social_TeachValuableLesson_targeted_Friendly_HighScore_child: {
        pre_actions: [
          '{actor.0} is patiently teaching {actor.1}, a child Sim, a valuable lesson in a friendly manner.',
        ],
      },
      mixer_Fireplace_WarmSelf: {
        pre_actions: [
          '{actor.0} is sitting in front of the fireplace, enjoying the warmth.',
        ],
      },
      mixer_social_AttemptToSeduce_targeted_romance_middleScore_teenMale: {
        pre_actions: ['{actor.0} is trying to seduce {actor.1}.'],
      },
      mixer_social_AttemptToSeduce_targeted_romance_MiddleScore_teenFemale: {
        pre_actions: ['{actor.0} is trying to seduce {actor.1}.'],
      },
      mixer_social_KissNeck_targeted_romance_relationship_teen: {
        pre_actions: ["{actor.0} is leaning in and kissing {actor.1}'s neck."],
      },
      mixer_social_Flirt_targeted_romance_alwaysOn_teen: {
        pre_actions: ['{actor.0} is playfully flirting with {actor.1}.'],
      },
      mixer_social_OfferToFeelBaby_Invite_targeted_Friendly_alwaysOn_Pregnancy:
        {
          pre_actions: [
            '{actor.0} is pregnant and is asking {actor.1} if they want to feel the baby.',
          ],
        },
      mixer_social_SitIntimate_Snuggle_targeted_looping: {
        pre_actions: [
          '{actor.0} is sitting down next to {actor.1} and is pulling them into a warm and intimate snuggle.',
        ],
      },
      mixer_social_SitIntimate_Snuggle_targeted_romance_alwaysOn: {
        pre_actions: [
          '{actor.0} is sitting close to {actor.1} and affectionately snuggling up to them, deepening the romantic connection between them.',
        ],
      },
      mixer_social_DemandIndependence_targeted_mean_teen: {
        pre_actions: [
          '{actor.0} is confronting {actor.1}, demanding their independence as a mean teen.',
        ],
      },
      mixer_social_TeaseMercilessly_targeted_mean_teen: {
        pre_actions: [
          '{actor.0} is mercilessly teasing {actor.1}, being particularly mean about it.',
        ],
      },
      mixer_social_ComplainAboutParents_targeted_Friendly_alwaysOn_teen: {
        pre_actions: [
          '{actor.0} is expressing their frustration about their parents to {actor.1}, hoping for some understanding and support.',
        ],
      },
      mixer_social_AskAboutWooHoo_targeted_Friendly_alwaysOn_teen: {
        pre_actions: ['{actor.0} is asking {actor.1} about sex.'],
      },
      mixer_social_HighFive_targeted_friendly_alwaysOn_teen: {
        pre_actions: [
          '{actor.0} is giving props to {actor.1}, offering a high five as a friendly gesture.',
        ],
      },
      mixer_social_ShowOffOutfit_targeted_friendly_alwaysOn_teen: {
        pre_actions: [
          '{actor.0} is enthusiastically showing off their new outfit to {actor.1}, hoping to impress them with their style.',
        ],
      },
      mixer_social_GiveTheWooHooTalk_targeted_friendly_alwaysOn_teen: {
        pre_actions: [
          '{actor.0} is sitting down with {actor.1} for a friendly conversation about the birds and the bees.',
        ],
      },
      mixer_social_Gossip_targeted_friendly_alwaysOn_teen: {
        pre_actions: [
          '{actor.0} is excitedly sharing some juicy gossip with {actor.1}, hoping to strengthen their friendship.',
        ],
      },
      mixer_social_TalkAboutBestBait_targeted_Friendly_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1}, discussing the best bait to use.',
        ],
      },
      mixer_social_BoastAboutBiggestCatch_targeted_Friendly_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} is excitedly telling {actor.1} about their biggest catch, bragging about their fishing skills.',
        ],
      },
      mixer_social_ShareFishingTips_targeted_Friendly_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} and {actor.1} are having a friendly conversation, sharing fishing tips.',
        ],
      },
      mixer_social_AskOnDateEvent_targeted_romance_alwaysOn_Teen: {
        pre_actions: [
          '{actor.0} is nervously asking {actor.1} on a date, hoping to spend more time together and explore their romantic feelings.',
        ],
      },
      mixer_social_GiveColdShoulder_targeted_mean_Female: {
        pre_actions: [
          '{actor.0}, a mean Sim, is purposefully ignoring {actor.1} and giving them the cold shoulder.',
        ],
      },
      mixer_social_GiveColdShoulder_targeted_mean_Male: {
        pre_actions: [
          '{actor.0} is purposefully ignoring {actor.1}, acting in a mean and unfriendly manner.',
        ],
      },
      mixer_social_KissCheek_targeted_romance_alwaysOn: {
        pre_actions: [
          '{actor.0} is leaning in and gently kissing {actor.1} on the cheek.',
        ],
      },
      mixer_social_TakePictureTogether_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is inviting {actor.1} to take a picture together, creating a friendly and fun moment.',
        ],
      },
      mixer_social_EnthuseAboutCelebrations_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} and {actor.1} are having a friendly conversation about various celebrations, enthusiastically discussing their favorite aspects.',
        ],
      },
      mixer_social_EnthuseAboutCakes_targeted_Friendly_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} is excitedly talking to {actor.1} about their love for cakes.',
        ],
      },
      mixer_social_AskAboutBeingOld_targeted_Friendly_alwaysOn_child: {
        pre_actions: [
          '{actor.0} is asking {actor.1} about the experience of being old.',
        ],
      },
      mixer_social_Jeer_targeted_mean_middleScore: {
        pre_actions: [
          '{actor.0} is mocking {actor.1} in a mean-spirited manner.',
        ],
      },
      mixer_social_ComplainAboutEverything_targeted_Friendly_alwaysOn_teen: {
        pre_actions: [
          '{actor.0} is expressing their discontent about everything to {actor.1}, venting their frustrations and sharing their grievances.',
        ],
      },
      mixer_social_KissHands_targeted_romance_emotionSpecific: {
        pre_actions: [
          "{actor.0} is taking {actor.1}'s hands and gently kissing them.",
        ],
      },
      mixer_social_AskMoveIn_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is asking {actor.1} if they would like to join their household.',
        ],
      },
      mixer_social_GossipAboutNeighbors_targeted_friendly_alwaysOn_neighbor: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1} about the neighbors, sharing juicy gossip.',
        ],
      },
      mixer_social_ComplainAboutLocalYouths_targeted_friendly_alwaysOn_neighbor:
        {
          pre_actions: [
            '{actor.0} is complaining to {actor.1}, their neighbor, about the behavior of some local youths.',
          ],
        },
      mixer_social_DiscussNeighborhoodChanges_targeted_friendly_alwaysOn_neighbor:
        {
          pre_actions: [
            '{actor.0} is discussing recent changes in the neighborhood with {actor.1}.',
          ],
        },
      mixer_social_ChatAboutPropertyVaules_targeted_friendly_alwaysOn_neighbor:
        {
          pre_actions: [
            '{actor.0} is discussing property values with {actor.1}.',
          ],
        },
      mixer_social_DiscussLocalFishingSpots_targeted_friendly_alwaysOn_neighbor:
        {
          pre_actions: [
            '{actor.0} is discussing local fishing spots with {actor.1}.',
          ],
        },
      mixer_social_ComplimentHouse_targeted_friendly_alwaysOn_neighbor: {
        pre_actions: ["{actor.0} is complimenting {actor.1}'s house."],
      },
      mixer_social_InsultHouse_targeted_mean_alwaysOn_neighbor: {
        pre_actions: [
          "{actor.0} is making a mean comment about {actor.1}'s house.",
        ],
      },
      mixer_social_InsultYard_targeted_mean_alwaysOn_neighbor: {
        pre_actions: [
          "{actor.0} is angrily insulting {actor.1}'s yard, causing tension between the two neighbors.",
        ],
      },
      mixer_social_TryToPickFight_targeted_mean_middleScore_child: {
        pre_actions: [
          '{actor.0} is attempting to start an argument with {actor.1}, displaying mean and aggressive behavior.',
        ],
      },
      mixer_social_BragAboutGrades_targeted_Friendly_alwaysOn_child_teen: {
        pre_actions: [
          '{actor.0} is excitedly telling {actor.1} about their impressive grades, hoping to impress them.',
        ],
      },
      mixer_social_ComplainAboutClasses_targeted_Friendly_alwaysOn_child_teen: {
        pre_actions: ['{actor.0} is complaining about classes to {actor.1}.'],
      },
      mixer_social_LectureAboutGrades_targeted_Friendly_alwaysOn_child_teen: {
        pre_actions: [
          '{actor.0} is giving a friendly lecture to {actor.1} about the importance of grades.',
        ],
      },
      mixer_social_PraiseForGoodGrades_targeted_Friendly_alwaysOn_child_teen: {
        pre_actions: [
          '{actor.0} is praising {actor.1} for their good grades, showing their friendly and supportive nature.',
        ],
      },
      mixer_social_KissCheek_targeted_Friendly_MiddleScore_child: {
        pre_actions: [
          '{actor.0} is leaning in and giving {actor.1} a friendly kiss on the cheek.',
        ],
      },
      mixer_social_EnthuseAboutCandy_targeted_Friendly_alwaysOn_child: {
        pre_actions: [
          '{actor.0} is excitedly talking to {actor.1} about their love for candy.',
        ],
      },
      mixer_social_QuoteCartoonCharacter_targeted_Funny_alwaysOn_child: {
        pre_actions: [
          '{actor.0} is impersonating a funny cartoon character to {actor.1}.',
        ],
      },
      mixer_social_TalkAboutToys_targeted_Friendly_alwaysOn_child: {
        pre_actions: [
          '{actor.0} is excitedly talking to {actor.1} about their favorite toys, sharing playful stories and bonding over shared interests.',
        ],
      },
      mixer_social_TalkAboutFavoriteAnimal_targeted_Friendly_alwaysOn_child: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1}, discussing their favorite animals.',
        ],
      },
      mixer_social_LectureAboutResponsibilities_targeted_Friendly_alwaysOn_teen:
        {
          pre_actions: [
            '{actor.0} is giving a friendly lecture to {actor.1} about responsibilities, hoping to guide them in the right direction as a teen.',
          ],
        },
      mixer_social_ExchangePromiseRings_targeted_romance_relationship_teen: {
        pre_actions: [
          '{actor.0} and {actor.1} are exchanging promise rings, symbolizing their commitment to each other in their teenage relationship.',
        ],
      },
      mixer_social_ConvinceToLeaveSpouse_targeted_romance_relationship: {
        pre_actions: [
          '{actor.0} is trying to convince {actor.1} to leave their spouse and pursue a romantic relationship.',
        ],
      },
      mixer_social_SayGoodbye_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is giving a friendly goodbye to {actor.1} as they are parting ways.',
        ],
      },
      mixer_social_BanterWithOldFriend_targeted_Friendly_alwaysOn: {
        pre_actions: [
          "{actor.0} is engaging in lighthearted banter with {actor.1}, reminiscing about old times and catching up on each other's lives.",
        ],
      },
      mixer_social_SitIntimate_LookDeeplyIntoEyes_targeted_romance_middleScore:
        {
          pre_actions: [
            '{actor.0} and {actor.1} are sitting closely together, locking eyes with a deep intensity, and fostering a moment of intimate connection.',
          ],
        },
      mixer_social_SitIntimate_TeaseFlirtatiously_targeted_romance_middleScore:
        {
          pre_actions: [
            '{actor.0} is sitting next to {actor.1} and playfully teasing them in a flirtatious manner, creating an intimate atmosphere.',
          ],
        },
      mixer_social_AskWhatHappened_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0}, with a friendly concern, is asking {actor.1} what happened.',
        ],
      },
      mixer_socials_GoofAround_teen_targeted_Funny_alwaysOn: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a lighthearted and funny interaction, goofing around and having a good time.',
        ],
      },
      mixer_social_SitIntimate_LookDeeplyIntoEyes_targeted_looping: {
        pre_actions: [
          "{actor.0} and {actor.1} are sitting together, sharing an intimate moment as they are gazing deeply into each other's eyes.",
        ],
      },
      mixer_Baby_ShowOff_Wait: {
        pre_actions: [
          '{actor.0} is proudly showing off their cute baby to {actor.1} while waiting for something.',
        ],
      },
      mixer_Social_Sim_Ghost_Ask_About_Being_Dead: {
        pre_actions: [
          "{actor.0} is asking {actor.1} what it's like to be a dead ghost.",
        ],
      },
      mixer_social_Ghost_ConsoleAboutDeath_targeted_friendly_emotionSpecific: {
        pre_actions: [
          '{actor.0} is consoling {actor.1} about the topic of death, offering a friendly understanding and support.',
        ],
      },
      mixer_social_Ghost_Invite_to_Household_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is warmly inviting {actor.1} to join their household, despite {actor.1} being a ghost.',
        ],
      },
      mixer_Campfire_WarmSelf: {
        pre_actions: [
          '{actor.0} is sitting close to the campfire, basking in the warmth and enjoying their own company.',
        ],
      },
      mixer_social_WooHoo_targeted_romance_transition_Tent: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a romantic encounter inside a tent.',
        ],
      },
      mixer_social_TryForBaby_targeted_romance_transition_Tent: {
        pre_actions: [
          '{actor.0} and {actor.1} are sharing an intimate moment in the tent, hoping to conceive a baby together.',
        ],
      },
      mixer_Campfire_StareIntoFlames: {
        pre_actions: [
          '{actor.0} is sitting beside {actor.1} at the campfire and both of them are gazing into the flames, enjoying the warmth and peaceful atmosphere.',
        ],
      },
      mixer_Campfire_RoastMarshmallows: {
        pre_actions: [
          '{actor.0} is sitting by the campfire and enjoying roasting marshmallows.',
        ],
      },
      mixer_social_GoAway_targeted_mean_alwaysOn: {
        pre_actions: ['{actor.0} is rudely telling {actor.1} to go away.'],
      },
      mixer_social_DiscussHydration_targeted_Friendly_Athlete_AlwaysOn_STC: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1} about the importance of hydration, especially for athletes.',
        ],
      },
      mixer_social_DiscusssSportsStatistics_targeted_Friendly_Athlete_AlwaysOn_STC:
        {
          pre_actions: [
            '{actor.0} is engaging in a friendly conversation with {actor.1} about sports statistics, possibly bonding over their shared interest in athletic endeavors.',
          ],
        },
      mixer_social_OffertoPumpup_targeted_Friendly_Athlete_AlwaysOn_STC: {
        pre_actions: ['{actor.0} is offering to pump up {actor.1}.'],
      },
      mixer_social_SuggestWorkingOut_targeted_Friendly_Athlete_AlwaysOn_STC: {
        pre_actions: [
          '{actor.0} is suggesting to {actor.1} that they should be working out together, considering their shared interest in fitness.',
        ],
      },
      mixer_social_MakeFunOfCorporateGoons_Targeted_Funny_AlwaysOn_Career: {
        pre_actions: [
          '{actor.0} is humorously mocking {actor.1}, who is a corporate goon, playing off their career.',
        ],
      },
      mixer_social_ImitateBoss_Targeted_Funny_AlwaysOn_Career: {
        pre_actions: [
          '{actor.0} is playfully imitating their boss to {actor.1} in a funny way, in order to bring some humor to the workplace.',
        ],
      },
      mixer_social_GossipAboutOfficeRomance_Targeted_Friendly_AlwaysOn_Career: {
        pre_actions: [
          '{actor.0} is casually bringing up the topic of office romances while chatting with {actor.1} in a friendly and non-judgmental way, they are genuinely showing interest in this juicy gossip.',
        ],
      },
      mixer_social_Pool_Splash_targeted_alwaysOn: {
        pre_actions: [
          '{actor.0} is jumping into the pool and splashing {actor.1} playfully.',
        ],
      },
      mixer_social_GiveFakeInvestmentTips_Targeted_Mischief_AlwaysOn_career: {
        pre_actions: [
          '{actor.0} is mischievously giving {actor.1} fake investment tips, likely causing chaos and mischief.',
        ],
      },
      mixer_social_OfferCareerAdvice_Targeted_Friendly_AlwaysOn_career: {
        pre_actions: [
          '{actor.0} is offering some career advice to {actor.1} in a friendly and targeted manner.',
        ],
      },
      mixer_social_BragAboutJobTitle_Targeted_Friendly_AlwaysOn_career: {
        pre_actions: [
          '{actor.0} is excitedly bragging about their impressive job title to {actor.1}, hoping to impress them with their career success.',
        ],
      },
      mixer_social_Pickpocket_targeted_mischief_career_household: {
        pre_actions: [
          '{actor.0} is attempting to pickpocket {actor.1} as part of their mischief career or for personal gain.',
        ],
      },
      mixer_social_WooHooInHottub_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are sneaking into the hot tub to have sex together.',
        ],
      },
      mixer_social_HotTub_Splash_targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is playfully splashing {actor.1} in the hot tub, creating a friendly and fun atmosphere.',
        ],
      },
      mixer_social_EnthuseAboutFruitcake_trageted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is excitedly talking to {actor.1} about their love for fruitcake.',
        ],
      },
      mixer_social_ComplainAbout_Fruitcake_targeted_alwayson: {
        pre_actions: [
          '{actor.0} is expressing their discontent about fruitcake to {actor.1}.',
        ],
      },
      mixer_social_TryForBabyInHottub_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are sharing a romantic moment in the hot tub as they are trying for a baby.',
        ],
      },
      mixer_social_TryForBabyInObservatory_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are heading to the observatory for some romantic time together, as they are transitioning into trying for a baby.',
        ],
      },
      mixer_social_TryForBabyInRocketShip_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are passionately entering their rocket ship, ready to try for a baby as their relationship is taking a romantic turn.',
        ],
      },
      mixer_social_TryForBabyinHotTub_targeted_stand_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a romantic encounter in the hot tub, attempting to try for a baby together.',
        ],
      },
      mixer_social_WooHooinHotTub_targeted_Stand_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a passionate sex session in the hot tub, their romantic feelings are transitioning to a new level.',
        ],
      },
      mixer_social_WooHooInBush_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a romantic encounter in the bushes.',
        ],
      },
      mixer_social_GoingOutSocials_Matchmake: {
        pre_actions: [
          '{actor.0} is making a move on {actor.1} while going out, hoping to ignite a romantic connection.',
        ],
      },
      mixer_social_TryForBabyInBush_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are sneaking into a bush, hoping to start a family together.',
        ],
      },
      mixer_social_GoingOutSocials_TalkUpSim: {
        pre_actions: [
          '{actor.0} is enthusiastically talking up {actor.1} to others, highlighting their positive attributes and achievements.',
        ],
      },
      mixer_social_GoingOutSocials_BreakUpSims: {
        pre_actions: [
          '{actor.0} is confronting {actor.1} in an attempt to break up their relationship.',
        ],
      },
      mixer_social_GoingOutSocials_TrashAnotherSim: {
        pre_actions: [
          '{actor.0} is engaging in trash talk with {actor.1} while socializing at a gathering.',
        ],
      },
      mixer_social_ComplainAboutLackofLoveLife_Targeted_Friendly_AlwaysOn_Jealous_Trait:
        {
          pre_actions: [
            '{actor.0} is venting to {actor.1} about their lack of a love life.',
          ],
        },
      mixer_social_Trick_Targeted_Mischief_AlwaysOn_STC: {
        pre_actions: ['{actor.0} is playing a mischievous trick on {actor.1}.'],
      },
      mixer_social_Treat_Targeted_Friendly_AlwaysOn_STC: {
        pre_actions: [
          '{actor.0} is giving {actor.1} a treat, being friendly and showing kindness.',
        ],
      },
      mixer_social_ConsoleAboutDeath_Targeted_Friendly_EmotionSpecific: {
        pre_actions: [
          '{actor.0} is consoling {actor.1} about the topic of death, showing empathy and offering comfort.',
        ],
      },
      mixer_social_EnthuseAbout_ThrillOfTheSteal_friendly_Klepto: {
        pre_actions: [
          '{actor.0} is excitedly sharing their love for the thrill of stealing with {actor.1}, in a friendly conversation.',
        ],
      },
      mixer_social_TalkAboutGrilledCheese_targeted_Friendly_alwaysOn_aspiration:
        {
          pre_actions: [
            '{actor.0} is engaging in a friendly conversation with {actor.1} about Grilled Cheese, as part of their aspiration.',
          ],
        },
      mixer_social_EvangelizeGrilledCheese_Friendly_alwaysOn_Trait: {
        pre_actions: [
          '{actor.0} is enthusiastically sharing their love for grilled cheese with {actor.1}, trying to convince them to also become a grilled cheese enthusiast.',
        ],
      },
      mixer_social_AskAbout_PrizedPossessions_mischief_alwaysOn_trait: {
        pre_actions: [
          '{actor.0} is mischievously asking {actor.1} about their prized possessions.',
        ],
      },
      mixer_VegetarianTrait_EvangelizeVegetarianBenefits: {
        pre_actions: [
          '{actor.0} is trying to convince {actor.1}, who also has the Vegetarian trait, of the various benefits of following a vegetarian lifestyle.',
        ],
      },
      mixer_VegetarianTrait_EnthuseAboutVegetarianism: {
        pre_actions: [
          '{actor.0} is excitedly talking to {actor.1} about their shared vegetarianism and the benefits of a plant-based diet.',
        ],
      },
      mixer_VegetarianTrait_ComplainAboutFlavorlessMeatSubstitutes: {
        pre_actions: [
          '{actor.0} is expressing their dissatisfaction about flavorless meat substitutes to {actor.1}, sharing their frustration as a vegetarian.',
        ],
      },
      mixer_social_AskToSprayForMonsterUnderBed_Friendly_AlwaysOn_Child: {
        pre_actions: [
          '{actor.0} is asking {actor.1} in a friendly manner if they can help spray the monster under the bed.',
        ],
      },
      mixer_social_AskToJustBeFriends_Targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is asking {actor.1} if they can just be friends, wanting to maintain a friendly relationship.',
        ],
      },
      mixer_AskToSpray_MonsterUnder_Bed: {
        pre_actions: [
          '{actor.0} is asking {actor.1} to spray for the monster under the bed to keep it away.',
        ],
      },
      mixer_social_CheerUp_targeted_Friendly_alwaysOn_TragicClown: {
        pre_actions: [
          'Tragically, {actor.0} is trying to cheer up {actor.1} by being friendly and engaging in conversation.',
        ],
      },
      mixer_social_Toddler_Mean_Yell_At: {
        pre_actions: [
          '{actor.0} is angrily yelling at the {actor.1} toddler in a mean manner.',
        ],
      },
      mixer_social_Toddler_Funny_Say_NonSense: {
        pre_actions: [
          '{actor.0} is starting to babble nonsense to {actor.1}, trying to be funny and entertain them.',
        ],
      },
      mixer_social_Toddler_Funny_Tell_Knock_Knock_Joke: {
        pre_actions: [
          '{actor.0} is telling a knock knock joke to {actor.1}. {actor.1} is listening as {actor.0} begins.',
        ],
      },
      mixer_socials_Toddler_Ask_Why_Friendly: {
        pre_actions: [
          '{actor.0} is asking {actor.1} why, in a friendly manner, as part of their social interaction with a toddler Sim.',
        ],
      },
      mixer_social_Toddler_TalkAbout_Favorite_Color: {
        pre_actions: [
          '{actor.0} is engaging in a conversation with {actor.1} about their favorite color.',
        ],
      },
      mixer_socials_Toddler_TalkAbout_Favorite_Animal: {
        pre_actions: [
          '{actor.0} is engaging in a conversation with {actor.1} about their favorite animal.',
        ],
      },
      mixer_socials_Toddler_TalkAbouts_Party: {
        pre_actions: [
          '{actor.0} is engaging in a conversation with {actor.1} about parties.',
        ],
      },
      mixer_social_Toddler_TalkAbout_Art: {
        pre_actions: [
          '{actor.0} is attempting to talk to {actor.1} about art, but it may be proving difficult for a toddler to engage in such a conversation.',
        ],
      },
      mixer_social_Toddler_TalkAbout_Day: {
        pre_actions: [
          '{actor.0} is trying to engage {actor.1} in a conversation about their day.',
        ],
      },
      mixer_social_Toddler_TalkAbout_Dinosaurs: {
        pre_actions: [
          '{actor.0}, a toddler, is excitedly talking to {actor.1} about dinosaurs.',
        ],
      },
      mixer_social_Toddler_TalkAbout_Superheroes: {
        pre_actions: [
          '{actor.0} is excitedly talking to {actor.1} about their favorite superheroes.',
        ],
      },
      mixer_social_Toddler_TalkAbout_Princesses: {
        pre_actions: [
          '{actor.0} is excitedly talking to {actor.1} about princesses, sharing their favorite stories and Disney movies.',
        ],
      },
      mixer_social_Toddler_TalkAbout_Tell_Story: {
        pre_actions: [
          '{actor.0} is engaging in a conversation with {actor.1} and is beginning to tell a story.',
        ],
      },
      mixer_social_Toddler_Friendly_TalkTo_Stranger: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with a stranger, {actor.1}.',
        ],
      },
      mixer_social_Toddler_TalkAbout_Tell_Goofy_Story: {
        pre_actions: [
          '{actor.0} is excitedly telling a goofy story to {actor.1} during their conversation.',
        ],
      },
      mixer_social_toddler_Funny_JokeAboutChickenButt: {
        pre_actions: [
          '{actor.0}, a toddler, is telling a funny joke to {actor.1} about chicken butts.',
        ],
      },
      mixer_socials_Toddler_Ask_AboutWorld_Friendly_Inquisitive: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1}, asking about the world and showing genuine curiosity.',
        ],
      },
      mixer_social_Targeted_Mean_AlwaysOn_STC_Toddler_Scold: {
        pre_actions: [
          '{actor.0} is scolding {actor.1} for misbehaving, using a harsh tone.',
        ],
      },
      mixer_social_Targeted_Mean_AlwaysOn_STC_Toddler_YellAt: {
        pre_actions: [
          '{actor.0} is directing their anger towards {actor.1}, yelling at them in a mean-spirited manner, even though {actor.1} is just a toddler.',
        ],
      },
      mixer_social_Targeted_Mean_AlwaysOn_STC_Toddler_CrushDreams: {
        pre_actions: [
          '{actor.0} is cruelly targeting {actor.1} by crushing their dreams, displaying mean behavior towards them, despite {actor.1} being just a toddler.',
        ],
      },
      mixer_socials_Toddler_TalkAbouts_Trucks: {
        pre_actions: [
          '{actor.0} is engaging in a conversation with {actor.1} about trucks.',
        ],
      },
      mixer_social_AskAboutDay_targeted_Friendly_alwaysOn_Toddler: {
        pre_actions: [
          '{actor.0}, a friendly toddler, is asking {actor.1} about their day.',
        ],
      },
      mixer_Social_GetToKnow_Friendly_STC_TargetToddler: {
        pre_actions: [
          '{actor.0} is asking {actor.1} to talk to about themselves.',
        ],
      },
      mixer_socials_TellFunnyStory_group_Funny_alwaysOn_toddler: {
        pre_actions: [
          '{actor.0} is joining a group and is telling a funny story to entertain everyone, including the toddler.',
        ],
      },
      mixer_social_BrightenDay_targeted_friendly_emotionSpecific_toddlerOnly: {
        pre_actions: ["{actor.0} is trying to brighten {actor.1}'s day."],
      },
      mixer_social_MakePeaceAfterFight: {
        pre_actions: [
          '{actor.0} is apologizing and trying to make peace with {actor.1} after their fight.',
        ],
      },
      mixer_social_CheerUp_targeted_friendly_emotionSpecific_c2a: {
        pre_actions: [
          '{actor.0} is attempting to cheer up {actor.1} by engaging in a friendly conversation and offering support.',
        ],
      },
      mixer_social_ConsoleAboutDeath_Targeted_Friendly_EmotionSpecific_c2a: {
        pre_actions: [
          '{actor.0} is consoling {actor.1} about death, offering their support and comforting words.',
        ],
      },
      mixer_social_DiscussCostume_targeted_Friendly: {
        pre_actions: [
          '{actor.0} is beginning a friendly conversation with {actor.1} to discuss their costume.',
        ],
      },
      mixer_social_ComplimentCostume_Targeted_Friendly: {
        pre_actions: [
          "{actor.0} is complimenting {actor.1}'s costume, giving them a friendly and targeted compliment.",
        ],
      },
      mixer_social_QuestionCostume_Targeted_Mean: {
        pre_actions: [
          '{actor.0} is confronting {actor.1} about their costume, in a mean-spirited way.',
        ],
      },
      mixer_social_SayGoodbye_targeted_Friendly_alwaysOn_Toddler: {
        pre_actions: [
          '{actor.0} is waving and saying goodbye to {actor.1} in a friendly manner.',
        ],
      },
      mixer_social_WhatsYourProblem_Targeted_Mean_Sentiments: {
        pre_actions: [
          '{actor.0} is confronting {actor.1} and asking what their problem is, expressing mean sentiments towards them.',
        ],
      },
      mixer_social_AskForAdvice_targeted_friendly_emotionSpecific_Scared: {
        pre_actions: ['{actor.0} is scaredly asking {actor.1} for advice.'],
      },
      mixer_social_GoodTrait_HelpOut: {
        pre_actions: [
          '{actor.0} is using their good trait to offer help to {actor.1}.',
        ],
      },
      mixer_social_TalkItOut_targeted_romance_alwaysOn_JealousTrait: {
        pre_actions: [
          '{actor.0} and {actor.1} are having a sit-down conversation to talk through their issues, possibly addressing any romantic tensions or jealousy that may arise due to certain traits.',
        ],
      },
      mixer_socials_BragAboutBaby_Targeted_Friendly_AlwaysOn_STC: {
        pre_actions: [
          '{actor.0} is excitedly talking to {actor.1} about their adorable baby, wanting to share their joy and pride.',
        ],
      },
      mixer_socials_GossipAboutOtherParents_Targeted_Friendly_AlwaysOn_STC: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1} about other parents, sharing some gossip and juicy stories.',
        ],
      },
      mixer_social_ShareBabyPictures_Targeted_Friendly_AlwaysOn_STC: {
        pre_actions: [
          '{actor.0} is excitedly showing {actor.1} adorable pictures of their baby, hoping to share the joy and create a friendly connection.',
        ],
      },
      mixer_social_DiscussExpandingTheFamily_Targeted_Friendly_AlwaysOn: {
        pre_actions: ['{actor.0} is discussing having a baby with {actor.1}.'],
      },
      mixer_social_AskSimToPursueDreamJob_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is encouraging {actor.1} to pursue their dream job, showing support and offering words of encouragement.',
        ],
      },
      mixer_social_Fight_targeted_mean_Ghost: {
        pre_actions: [
          '{actor.0} and {actor.1} are getting into a heated battle, exchanging blows and insults. The tension is thickening as they are fighting to assert their dominance.',
        ],
      },
      mixer_Social_TalkRelationshipFears_Romance: {
        pre_actions: [
          '{actor.0} is opening up to {actor.1} about their fears and concerns regarding their relationship.',
        ],
      },
      mixer_Social_Romance_AskAboutSexualOrientation: {
        pre_actions: [
          '{actor.0} is asking {actor.1} about their romantic interests, in order to gain more insight into their potential compatibility.',
        ],
      },
      mixer_social_Targeted_Friendly_DiscussFears: {
        pre_actions: ['{actor.0} is discussing their fears with {actor.1}.'],
      },
      mixer_social_MeetInfant_Child_Greetings: {
        pre_actions: [
          '{actor.0} is walking up to {actor.1} and warmly greeting them, eager to meet the newest addition to the family.',
        ],
      },
      mixer_Social_Friendly_FigureOutDifferences: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1} to figure out their differences and understand them better.',
        ],
      },
      mixer_social_IsTheMoonCheese_targeted_Friendly_alwaysOn_child_skills: {
        pre_actions: [
          '{actor.0} is playfully asking {actor.1} if the moon is made of cheese, sparking a lighthearted conversation between the two.',
        ],
      },
      mixer_social_IsTheMoonABanana_targeted_Friendly_alwaysOn_child_skills: {
        pre_actions: [
          '{actor.0} is playfully asking {actor.1} if the moon is a banana, showing their friendly and childlike nature.',
        ],
      },
      mixer_social_IsTheMoonASponge_targeted_Friendly_alwaysOn_child_skills: {
        pre_actions: [
          "{actor.0} is playfully asking {actor.1}, 'Do you think the Moon is a sponge?' in a friendly manner, engaging their imagination.",
        ],
      },
      mixer_social_WhereDidTheMoonGo_Friendly_alwaysOn_child_skills: {
        pre_actions: [
          '{actor.0} is innocently asking {actor.1} where moon went.',
        ],
      },
      mixer_social_IsTheMoonAnEgg_Friendly_alwaysOn_child_skills: {
        pre_actions: [
          '{actor.0} is playfully asking {actor.1} if the moon is actually an egg.',
        ],
      },
      mixer_Social_SexualOrientation_AskAboutWooHooInterests: {
        pre_actions: [
          '{actor.0} is asking {actor.1} about their interests in sex, in a social and curious manner.',
        ],
      },
      mixer_Social_SexualOrientation_AskToBeWooHooPartners: {
        pre_actions: [
          '{actor.0} is asking {actor.1} if they would like to become sexual partners, hinting at a potential intimate relationship.',
        ],
      },
      mixer_Social_SexualOrientation_EndWooHooPartners: {
        pre_actions: [
          '{actor.0} and {actor.1} are agreeing to end their sexual relationship, deciding to remain friends instead.',
        ],
      },
      mixer_social_SharePhoto: {
        pre_actions: [
          '{actor.0} is excitedly showing {actor.1} some pictures from their phone.',
        ],
      },
      mixer_Social_Targeted_Friendly_Loyal_ConfessTrashTalk: {
        pre_actions: [
          '{actor.0} is confessing to {actor.1} that they talked trash about them and wanted to amend things.',
        ],
      },
      mixer_Social_Targeted_Romance_Loyal_ConfessCheating: {
        pre_actions: [
          '{actor.0} is bravely admitting to cheating on {actor.1} in their relationship.',
        ],
      },
      mixer_Social_Targeted_Mean_Loyal_ConfrontAboutBullying: {
        pre_actions: [
          '{actor.0} is confronting {actor.1} about their bullying behavior, showing their loyalty to the victim.',
        ],
      },
      mixer_Social_Targeted_Romance_Loyal_RebuildTrust: {
        pre_actions: [
          '{actor.0} is rebuilding the trust in their romantic relationship with {actor.1} after infidelity.',
        ],
      },
      mixer_social_Romance_HighScore_Loyal_ExpressDevotion: {
        pre_actions: [
          '{actor.0} is expressing their deep love and devotion to {actor.1} in a romantic gesture.',
        ],
      },
      mixer_social_Hug_Friendly_Middlescore_NoMoodTest: {
        pre_actions: [
          '{actor.0} is warmly embracing {actor.1} in a friendly hug.',
        ],
      },
      mixer_social_TalkAboutHerbalism_targeted_Friendly_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1} about herbalism.',
        ],
      },
      mixer_social_EnthuseAboutHerbalism_targeted_Friendly_alwaysOn_trait: {
        pre_actions: [
          '{actor.0} is excitedly talking to {actor.1} about their love for herbalism.',
        ],
      },
      mixer_social_LearnHerbalismRecipe_targeted_Friendly_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} is asking {actor.1} if they can teach them a new herbalism recipe.',
        ],
      },
      mixer_social_DiscussAddingLog_targeted_friendly_situation_GP01: {
        pre_actions: [
          '{actor.0} is discussing with {actor.1} adding a log to the property.',
        ],
      },
      mixer_social_ComplainAboutMosquitoes_targeted_Friendly_situation_GP01: {
        pre_actions: [
          '{actor.0} is complaining about the mosquitos to {actor.1}.',
        ],
      },
      mixer_social_EnthuseAboutWildlifeEncounter_targeted_Friendly_situation_GP01:
        {
          pre_actions: [
            '{actor.0} is excitedly recounting a recent encounter with wildlife to {actor.1}, hoping to share their enthusiasm.',
          ],
        },
      mixer_social_PhilosophizeAboutLife_targeted_Friendly_situation_GP01: {
        pre_actions: [
          '{actor.0} is engaging in a deep conversation with {actor.1}, pondering the meaning of life.',
        ],
      },
      mixer_social_InsultFireBuildingSkills_targeted_mean_situation_GP01: {
        pre_actions: [
          "{actor.0} is rudely criticizing {actor.1}'s ability to build fires.",
        ],
      },
      mixer_social_AskToStargaze_targeted_Friendly_alwaysOn: {
        pre_actions: ['{actor.0} is inviting {actor.1} to stargaze together.'],
      },
      mixer_Campfire_PlayWith: {
        pre_actions: [
          '{actor.0} is warming themselves by the campfire, enjoying some time alone.',
        ],
      },
      mixer_horseShoes_Discuss_Game: {
        pre_actions: [
          '{actor.0} and {actor.1} are discussing the game of horse shoes.',
        ],
      },
      mixer_social_ShareAstronomyKnowledge_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is enthusiastically sharing their knowledge about astronomy with {actor.1}, sparking an engaging conversation.',
        ],
      },
      mixer_social_Fight_targeted_mean_bear: {
        pre_actions: [
          '{actor.0} is challenging {actor.1} to a wrestle, with a mean and bear-like demeanor.',
        ],
      },
      mixer_social_GossipAboutBear: {
        pre_actions: [
          '{actor.0} is engaging in a conversation with {actor.1} to gossip about Bear.',
        ],
      },
      mixer_social_horseshoe_mean_heckle: {
        pre_actions: [
          '{actor.0} is using a mean approach and is starting to heckle {actor.1} while playing horseshoes.',
        ],
      },
      mixer_social_horseshoe_friendly_cheer: {
        pre_actions: [
          '{actor.0} is cheering for {actor.1} in a friendly and supportive manner.',
        ],
      },
      mixer_social_RantAboutBear: {
        pre_actions: [
          '{actor.0} is starting a passionate rant about an obnoxious bear to {actor.1}.',
        ],
      },
      mixer_social_BearRoar: {
        pre_actions: [
          'The bear is letting out a powerful roar, showcasing its dominance.',
        ],
      },
      mixer_social_BearRoar_Imitate: {
        pre_actions: [
          "{actor.0} is playfully imitating a bear's roar, causing {actor.1} to be surprised and amused.",
        ],
      },
      mixer_social_AskAboutCamping_targeted_Friendly_alwaysOn: {
        pre_actions: ['{actor.0} is asking {actor.1} about camping.'],
      },
      mixer_social_GiveHerbalismAdvice_Targeted_Friendly_AlwaysOn_skills: {
        pre_actions: [
          '{actor.0} is sharing some valuable herbalism tips with {actor.1}, in a friendly and targeted way.',
        ],
      },
      mixer_social_MakeSmallTalk_InterrogationTable_GoodCop: {
        pre_actions: [
          '{actor.0} is engaging in casual conversation with {actor.1}, trying to make small talk.',
        ],
      },
      mixer_social_AskPolitelyForInformation_InterrogationTable_GoodCop: {
        pre_actions: [
          '{actor.0} is using a good cop approach and politely asking {actor.1} for information at the interrogation table.',
        ],
      },
      mixer_social_DiscussVictim_InterrogationTable_GoodCop: {
        pre_actions: [
          '{actor.0} is using a good cop approach and discussing the victim with {actor.1} at the interrogation table.',
        ],
      },
      mixer_social_DiscussPleaDeal_InterrogationTable_GoodCop: {
        pre_actions: [
          '{actor.0} is using a good cop approach and discussing a plea deal with {actor.1} at the interrogation table.',
        ],
      },
      mixer_social_AskAboutCrime_InterrogationTable_GoodCop: {
        pre_actions: [
          '{actor.0} is using a good cop approach and asking {actor.1} about the crime at the interrogation table.',
        ],
      },
      mixer_social_TellPersonalStory_InterrogationTable_GoodCop: {
        pre_actions: [
          '{actor.0} is using a good cop approach and telling a personal story to {actor.1} at the interrogation table.',
        ],
      },
      mixer_social_PretendToBeFriends_InterrogationTable_GoodCop: {
        pre_actions: [
          '{actor.0} is using a good cop approach and pretending to be friends with {actor.1} at the interrogation table.',
        ],
      },
      mixer_social_DescribePrisonHorrors_InterrogationTable_GoodCop: {
        pre_actions: [
          '{actor.0} is using a good cop approach and describing the horrors of prison to {actor.1} at the interrogation table.',
        ],
      },
      mixer_social_MakeFalsePromises_InterrogationTable_GoodCop: {
        pre_actions: [
          '{actor.0} is using a good cop approach and making flakes promises to {actor.1} at the interrogation table.',
        ],
      },
      mixer_social_OfferCandyBar_InterrogationTable_GoodCop: {
        pre_actions: [
          '{actor.0} is using a good cop approach and offering a candy bar to {actor.1} at the interrogation table.',
        ],
      },
      mixer_social_PromiseTastyMeal_InterrogationTable_GoodCop: {
        pre_actions: [
          '{actor.0} is using a good cop approach and promising {actor.1} a tasty meal as they are sitting at the interrogation table.',
        ],
      },
      mixer_social_PretendToCheckPhone_InterrogationTable_GoodCop: {
        pre_actions: [
          '{actor.0} is using a good cop approach and pretending to check their phone while they secretly observe {actor.1}.',
        ],
      },
      mixer_social_SlamCaseFile_InterrogationTable_BadCop_Emotion: {
        pre_actions: [
          '{actor.0} is using a bad cop approach and slamming the case files down on the table in front of {actor.1}.',
        ],
      },
      mixer_social_AskStressfulRiddles_InterrogationTable_BadCop_Emotion: {
        pre_actions: [
          '{actor.0} is using a bad cop approach and asking stressful riddles to {actor.1}.',
        ],
      },
      mixer_social_Intimidate_InterrogationTable_BadCop_: {
        pre_actions: [
          '{actor.0} is using a bad cop approach and is intimidating {actor.1}.',
        ],
      },
      mixer_social_AskTrickQuestion_InterrogationTable_BadCop_Emotion: {
        pre_actions: [
          '{actor.0} is using a bad cop approach and is asking trick questions to {actor.1}.',
        ],
      },
      mixer_social_ThreatenWithSpiders_InterrogationTable_BadCop: {
        pre_actions: [
          '{actor.0} is using a bad cop approach and is menacingly waving a jar of spiders in front of {actor.1}.',
        ],
      },
      mixer_social_ThreatenWithTickleTorture_InterrogationTable_BadCop: {
        pre_actions: [
          '{actor.0} is using a bad cop approach and threating to torture {actor.1} with tickles.',
        ],
      },
      mixer_social_TellStoryAboutPrison_InterrogationTable_BadCop: {
        pre_actions: [
          '{actor.0} is using a bad cop approach and telling {actor.1} the horrors of prison.',
        ],
      },
      mixer_social_GoOnTirade_InterrogationTable_BadCop: {
        pre_actions: [
          '{actor.0} is using a bad cop approach and is unleashing a furious tirade, interrogating {actor.1}.',
        ],
      },
      mixer_social_PlayCrazyCop_InterrogationTable_BadCop: {
        pre_actions: [
          '{actor.0} is using a bad cop approach and is playing a game of Crazy Cop with {actor.1}.',
        ],
      },
      mixer_social_DemandAnswers_InterrogationTable_BadCop_Emotion: {
        pre_actions: [
          '{actor.0} is using a bad cop approach and is demanding answers from {actor.1}.',
        ],
      },
      mixer_social_GlareColdly_InterrogationTable_BadCop: {
        pre_actions: [
          '{actor.0} is using a bad cop approach and is glaring coldly at {actor.1}.',
        ],
      },
      mixer_social_Ignore_InterrogationTable_BadCop: {
        pre_actions: [
          '{actor.0} is using a bad cop approach and is deliberately ignoring {actor.1}, giving them the cold shoulder.',
        ],
      },
      mixer_social_DangleHandcuffs_InterrogationTable_BadCop: {
        pre_actions: [
          '{actor.0} is using a bad cop approach and is dangling a pair of handcuffs in front of {actor.1}.',
        ],
      },
      mixer_social_AskForBribe_InterrogationTable_BadCop: {
        pre_actions: [
          '{actor.0} is using a bad cop approach and asking {actor.1} for a bribe.',
        ],
      },
      mixer_social_ShowCrimePictures_InterrogationTable_Evidence: {
        pre_actions: [
          '{actor.0} is using a bad cop approach and is showing {actor.1} a collection of pictures from the crime scene on the interrogation table.',
        ],
      },
      mixer_social_ReviewCaseFile_InterrogationTable_Evidence: {
        pre_actions: [
          '{actor.0} is carefully examining the case file on the interrogation table, analyzing the gathered evidence.',
        ],
      },
      mixer_social_ShowWitnessStatement_InterrogationTable_Evidence: {
        pre_actions: [
          '{actor.0} is presenting a witness statement to {actor.1} at the interrogation table.',
        ],
      },
      mixer_social_BluffEvidence_InterrogationTable_Evidence: {
        pre_actions: [
          '{actor.0} is presenting the evidence to {actor.1} in an attempt to bluff and manipulate them during the interrogation.',
        ],
      },
      mixer_social_RevealCallingCard_InterrogationTable_Evidence: {
        pre_actions: [
          '{actor.0} is using the Interrogation Table to reveal a calling card as evidence to {actor.1}.',
        ],
      },
      mixer_social_ShowFingerprintEvidence_InterrogationTable_Evidence: {
        pre_actions: [
          '{actor.0} is presenting fingerprint evidence on the interrogation table to support their case.',
        ],
      },
      mixer_social_ReleaseInnocentSuspect_InterrogationTable_Special: {
        pre_actions: [
          '{actor.0} is releasing {actor.1}, who is being found innocent after an interrogation at the special interrogation table.',
        ],
      },
      mixer_social_GetConfession_InterrogationTable_Special: {
        pre_actions: [
          '{actor.0} is taking {actor.1} to the Interrogation Table in order to extract a confession.',
        ],
      },
      mixer_social_EndInterrogation_InterrogationTable_Special: {
        pre_actions: [
          '{actor.0} is finishing interrogating {actor.1}, bringing an end to the intense questioning.',
        ],
      },
      mixer_social_Retail_Upsell_Targeted_Retail_HighScore: {
        pre_actions: [
          '{actor.0} is using their retail knowledge to recommend and endorse products to {actor.1}, hoping to increase sales.',
        ],
      },
      mixer_social_Retail_Targeted_AnswerQuestions_Retail_MiddleScore: {
        pre_actions: [
          '{actor.0} is assisting {actor.1} with their shopping by answering their questions about the retail products available.',
        ],
      },
      mixer_social_Retail_Targeted_PushCheaperItems_Retail_HighScore: {
        pre_actions: [
          '{actor.0} is offering {actor.1} information about some cheaper items in the retail store.',
        ],
      },
      mixer_social_Retail_CloseTheDeal_Targeted_Friendly_AlwaysOn_STC: {
        pre_actions: [
          '{actor.0} is engaging in a friendly and targeted conversation with {actor.1} in order to close the deal in a retail setting.',
        ],
      },
      mixer_social_Retail_BegForSale_Targeted_Friendly_AlwaysOn_STC: {
        pre_actions: [
          '{actor.0} is begging {actor.1} to make a sale in the retail store.',
        ],
      },
      mixer_social_Retail_PressureIntoSale_Targeted_Mean_EmotionSpecific: {
        pre_actions: [
          '{actor.0} is using targeted and forceful tactics to pressure {actor.1} into making a purchase.',
        ],
      },
      mixer_social_DetermineBabyGender_targeted_Friendly_alwaysOn_ActiveCareer_Doctor:
        {
          pre_actions: [
            "The active career doctor {actor.0} is using their friendly attitude to determine the gender of {actor.1}'s baby.",
          ],
        },
      mixer_social_CheckForFever_targeted_romance_alwaysOn_ActiveCareer_Doctor:
        {
          pre_actions: [
            '{actor.0}, being a doctor, is performing a check-up on {actor.1} to assess their heat and symptoms of fever.',
          ],
        },
      mixer_social_GiveMedicalAdvice_targeted_Friendly_alwaysOn_ActiveCareer_Doctor:
        {
          pre_actions: [
            '{actor.0} is using their medical expertise to give {actor.1} some friendly advice on their health.',
          ],
        },
      mixer_social_GiveBadMedicalAdvice_targeted_Mischief_alwaysOn_ActiveCareer_Doctor:
        {
          pre_actions: [
            "{actor.0} is playfully giving {actor.1} some bad medical advice, causing them to question {actor.0}'s expertise as a doctor in their active career.",
          ],
        },
      mixer_social_Targeted_AnalyzePersonality_Friendly_AlwaysOn_Alien: {
        pre_actions: [
          "{actor.0} is taking a friendly approach and analyzing {actor.1}'s personality, especially since {actor.1} is an alien.",
        ],
      },
      mixer_social_SecretHandshake_Targeted_Friendly_AlwaysOn_Alien: {
        pre_actions: ['{actor.0} is doing a secret handshake with {actor.1}.'],
      },
      mixer_social_Targeted_Empathize_Friendly_AlwaysOn_Alien: {
        pre_actions: [
          '{actor.0} is empathizing with {actor.1} who seems upset.',
        ],
      },
      mixer_social_Targeted_TalkAboutHome_Friendly_AlwaysOn_Alien: {
        pre_actions: [
          '{actor.0} is telling {actor.1} about their alien home world.',
        ],
      },
      mixer_social_DiscussWork_Targeted_Friendly_AlwaysOn_coworkers: {
        pre_actions: [
          '{actor.0} is discussing work-related matters with {actor.1}.',
        ],
      },
      mixer_social_GossipAboutCoworkers_Targeted_Friendly_AlwaysOn_coworkers: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1}, gossiping about their coworkers.',
        ],
      },
      mixer_social_ComplainAboutWork_Targeted_Friendly_AlwaysOn_coworkers: {
        pre_actions: [
          '{actor.0} is complaining to {actor.1} about work, in a friendly and targeted manner, possibly discussing their shared frustrations with coworkers.',
        ],
      },
      mixer_social_Scientist_AccuseAlien: {
        pre_actions: ['The scientist is accusing {actor.1} of being an alien.'],
      },
      mixer_social_ScareWithProbe_Targeted_Mischief_AlwaysOn_Alien: {
        pre_actions: [
          '{actor.0} is scaring {actor.1} with a probe by using their mischievous alien powers.',
        ],
      },
      mixer_hospitalExamBed_Exam_TakeTemp: {
        pre_actions: [
          '{actor.0} is placing {actor.1} on the hospital examination bed and taking their temperature.',
        ],
      },
      mixer_hospitalExamBed_Exam_CheckEyes: {
        pre_actions: [
          '{actor.0} is leading {actor.1} to the hospital exam bed to check their eyes.',
        ],
      },
      mixer_hospitalExamBed_Exam_CheckEar: {
        pre_actions: [
          '{actor.0} is lying down on the hospital examination bed and {actor.1} is checking their ears to perform an examination.',
        ],
      },
      mixer_hospitalExamBed_Exam_ProbeChest: {
        pre_actions: [
          "{actor.0} is carefully scanning {actor.1}'s chest using an exam probe while {actor.1} is lying on the hospital exam bed.",
        ],
      },
      mixer_social_MemoryErase_Targeted_Mischief_AlwaysOn_Alien: {
        pre_actions: [
          '{actor.0} is using their advanced alien abilities to target {actor.1}, erasing a specific memory from their mind.',
        ],
      },
      mixer_socials_AskForDNA_targeted_Friendly_alwaysOn_career: {
        pre_actions: [
          '{actor.0} is politely asking {actor.1} for a DNA sample, as part of their career research.',
        ],
      },
      mixer_social_YellAtAngrily_InterrogationTable_SuspectActions: {
        pre_actions: [
          "{actor.0} is angrily yelling at {actor.1} while they are both at the interrogation table, possibly due to {actor.1}'s suspect actions.",
        ],
      },
      mixer_social_ShareMemory_InterrogationTable_SuspectActions: {
        pre_actions: [
          '{actor.0} is sharing a memory with {actor.1}, hoping to gather information for an ongoing investigation.',
        ],
      },
      mixer_social_Decline_InterrogationTable_SuspectActions: {
        pre_actions: [
          "{actor.0} is firmly declining {actor.1}'s request to be interrogated at the interrogation table, suspecting their actions.",
        ],
      },
      mixer_social_PlayMirrorGame_Targeted_Funny_AlwaysOn_clone: {
        pre_actions: [
          '{actor.0} is playing a mirror game with {actor.1} where they mimick each others actions.',
        ],
      },
      mixer_social_DiscussSimilarities_Targeted_Friendly_AlwaysOn_clone: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1}, discussing their similarities.',
        ],
      },
      mixer_social_CallInferiorVersion_Targeted_Mean_AlwaysOn_clone: {
        pre_actions: [
          '{actor.0} is calling {actor.1} an inferior version of themselves.',
        ],
      },
      mixer_social_InterrogationFinish_InterrogationTable_Special_hidden: {
        pre_actions: [
          '{actor.0} is concluding an intense interrogation at the specialized interrogation table with {actor.1}.',
        ],
      },
      mixer_social_Freakout_InterrogationTable_SuspectActions: {
        pre_actions: [
          '{actor.0} is freaking out as they discover {actor.1} interacting suspiciously with an interrogation table, suspecting their actions.',
        ],
      },
      mixer_hospitalExamBed_Seated_social_DiscussHealth: {
        pre_actions: [
          '{actor.0} and {actor.1} are sitting down on a hospital examination bed and having a discussion about general health.',
        ],
      },
      mixer_hospitalExamBed_Seated_social_TakeSample: {
        pre_actions: [
          '{actor.0} is sitting down on the hospital examination bed and asking {actor.1} to swab for a sample.',
        ],
      },
      mixer_hospitalExamBed_Seated_Social_Diagnosis_0_displayOnly: {
        pre_actions: [
          '{actor.0} is leading {actor.1} to a hospital exam bed and they are both taking a seat. {actor.0} is beginning to diagnose {actor.1} for any illnesses.',
        ],
      },
      mixer_hospitalExamBed_Seated_social_Diagnosis_BloatyHead: {
        pre_actions: [
          '{actor.1} is sitting on the hospital exam bed while {actor.0} is examining them for a diagnosis of Bloaty Head.',
        ],
      },
      mixer_hospitalExamBed_Seated_social_Diagnosis_BurningTummy: {
        pre_actions: [
          '{actor.0} is sitting on the hospital examination bed, getting diagnosed for their burning tummy.',
        ],
      },
      mixer_hospitalExamBed_Seated_social_Diagnosis_GasAndGiggles: {
        pre_actions: [
          '{actor.0} and {actor.1} are finding themselves in the hospital exam bed, both seated. The interaction is being filled with laughter as they are sharing silly jokes and engaging in light-hearted banter.',
        ],
      },
      mixer_hospitalExamBed_Seated_social_Diagnosis_ItchyPlumbob: {
        pre_actions: [
          '{actor.0} is sitting on the hospital examination bed, experiencing an itchy plumbob. They are seeking a diagnosis from {actor.1}.',
        ],
      },
      mixer_hospitalExamBed_Seated_social_Diagnosis_LlamaFlu: {
        pre_actions: [
          '{actor.0} is sitting on the hospital exam bed while the doctor is diagnosing them with Llama Flu.',
        ],
      },
      mixer_hospitalExamBed_Seated_social_Diagnosis_StarryEyes: {
        pre_actions: [
          '{actor.1} is sitting on the hospital examination bed while {actor.0} is examining their starry eyes, trying to make a diagnosis.',
        ],
      },
      mixer_hospitalExamBed_Seated_social_Diagnosis_SweatyShivers: {
        pre_actions: [
          '{actor.0} is sitting on the hospital examination bed, experiencing sweaty shivers, while waiting for a diagnosis.',
        ],
      },
      mixer_hospitalExamBed_Seated_social_Diagnosis_TripleThreat: {
        pre_actions: [
          '{actor.0} is sitting on the hospital examination bed, while {actor.1} is standing nearby. They are discussing the medical symptoms and making a diagnosis together, forming a "Triple Threat" team.',
        ],
      },
      mixer_hospitalExamBed_Seated_social_Diagnosis_X_None: {
        pre_actions: [
          '{actor.0} and {actor.1} are both staying healthy and are not requiring any medical examinations or treatment.',
        ],
      },
      mixer_hospitalExamBed_Seated_social_StartGiveExam_thorough: {
        pre_actions: [
          '{actor.0} is carefully examining {actor.1} while they are seated on the hospital examination bed, ensuring a thorough examination.',
        ],
      },
      mixer_hospitalExamBed_Seated_social_StartGiveExam_quick: {
        pre_actions: [
          '{actor.0} is sitting down on the hospital examination bed and quickly starting to examine {actor.1}.',
        ],
      },
      mixer_hospitalExamBed_Reclined_social_DiscussHealth: {
        pre_actions: [
          '{actor.0} and {actor.1} are reclining on hospital exam beds, discussing their general health.',
        ],
      },
      mixer_hospitalExamBed_Reclined_social_GiveShot: {
        pre_actions: [
          '{actor.0} is laying {actor.1} down on the hospital examination bed and administering a shot.',
        ],
      },
      mixer_hospitalExamBed_Reclined_social_DeliverTakeMeds: {
        pre_actions: [
          '{actor.0} is treating {actor.1} with medication while they are laying on the hospital exam bed, reclined. {actor.0} is delivering and {actor.1} is taking the prescribed meds.',
        ],
      },
      mixer_hospitalExamBed_Reclined_social_DeliverEatFood: {
        pre_actions: [
          '{actor.0} is bringing a tray of food to the hospital exam bed where {actor.1} is reclining, delivering a meal for them to eat.',
        ],
      },
      mixer_hospitalExamBed_Exam_CheckEar_hidden: {
        pre_actions: [
          '{actor.0} is inviting {actor.1} to the hospital exam bed in order to check their ears.',
        ],
      },
      mixer_hospitalExamBed_Exam_CheckEyes_hidden: {
        pre_actions: [
          '{actor.0} is bringing {actor.1} to the hospital examination bed to check their eyes.',
        ],
      },
      mixer_hospitalExamBed_Exam_ProbeChest_hidden: {
        pre_actions: [
          '{actor.0} is laying {actor.1} down on the hospital exam bed and is beginning to scan their body with a probe, paying special attention to their chest.',
        ],
      },
      mixer_hospitalExamBed_Exam_TakeTemp_hidden: {
        pre_actions: [
          '{actor.0} is leading {actor.1} to the hospital exam bed and is taking their temperature.',
        ],
      },
      mixer_social_CustomerIntroduction_greetings: {
        pre_actions: [
          '{actor.0} is warmly greeting the customer, extending a friendly welcome.',
        ],
      },
      mixer_social_Retail_SureSale_Targeted_Friendly_AlwaysOn_STC: {
        pre_actions: ['{actor.0} is finalizing a sure deal with {actor.1}.'],
      },
      mixer_social_AskAboutPriceRange_Targeted_Retail_AlwaysOn: {
        pre_actions: [
          '{actor.0} is asking {actor.1} about the price ranges of the retail items.',
        ],
      },
      mixer_social_EnthuseAboutStore_Targeted_Retail_AlwaysOn: {
        pre_actions: [
          '{actor.0} is excitedly telling {actor.1} all about the amazing items and deals at the store.',
        ],
      },
      mixer_social_DiscussShoppingPreferences_Targeted_Retail_AlwaysOn: {
        pre_actions: [
          '{actor.0} is engaging in a conversation with {actor.1}, discussing their shopping preferences, potentially focusing on a specific retail store or brand.',
        ],
      },
      mixer_social_EnthuseAboutPrices_Targeted_Retail_MiddleScore: {
        pre_actions: [
          '{actor.0} is excitedly talking to {actor.1}, sharing their enthusiasm about prices at the retail store.',
        ],
      },
      mixer_social_SuggestOptions_Targeted_Retail_MiddleScore: {
        pre_actions: [
          '{actor.0} is suggesting various options for {actor.1} to consider, specifically related to retail.',
        ],
      },
      mixer_social_GossipAboutOfficeRomance_Targeted_Friendly_AlwaysOn_ActiveCareer:
        {
          pre_actions: [
            '{actor.0} is engaging in a targeted and friendly conversation with {actor.1}, gossiping about office romances.',
          ],
        },
      mixer_social_PraiseWorkEthic_Targeted_Friendly_AlwaysOn_ActiveCareer: {
        pre_actions: [
          '{actor.0} is complimenting {actor.1} on their strong work ethic, showing appreciation for their dedication and hard work in their active career.',
        ],
      },
      mixer_social_ComplainAboutWorkload_Targeted_Friendly_AlwaysOn_ActiveCareer:
        {
          pre_actions: [
            '{actor.0} is venting to {actor.1} about their overwhelming workload, seeking empathy and understanding.',
          ],
        },
      mixer_social_BragAboutPromotion_Targeted_Friendly_AlwaysOn_ActiveCareer: {
        pre_actions: [
          '{actor.0} is bragging to {actor.1} about their recent promotion in their career.',
        ],
      },
      mixer_social_CongratulateOnPromotion_Targeted_Friendly_AlwaysOn_ActiveCareer:
        {
          pre_actions: [
            '{actor.0} is giving heartfelt congratulations to {actor.1} on their promotion.',
          ],
        },
      mixer_social_AskAboutSalary_Targeted_Friendly_AlwaysOn_ActiveCareer: {
        pre_actions: ['{actor.0} is asking {actor.1} about their salary.'],
      },
      mixer_social_DiscussCase_Targeted_Friendly_AlwaysOn_ActiveCareer: {
        pre_actions: [
          '{actor.0} is discussing a career-related case with {actor.1}.',
        ],
      },
      mixer_Social_EnthuseAboutSolvingCase_targeted_Friendly_alwaysOn_ActiveCareer:
        {
          pre_actions: [
            '{actor.0} is excitedly talking to {actor.1} about their latest case and how they are determined to solve it.',
          ],
        },
      mixer_Social_EnthuseAboutInventions_targeted_Friendly_alwaysOn_ActiveCareer:
        {
          pre_actions: [
            '{actor.0} is excitedly talking to {actor.1} about their latest inventions.',
          ],
        },
      mixer_Social_EnthuseAboutDeliveringBaby_targeted_Friendly_alwaysOn_ActiveCareer:
        {
          pre_actions: [
            "{actor.0} is enthusiastically talking to {actor.1} about their experience delivering a baby, showing support and excitement for {actor.1}'s active career.",
          ],
        },
      mixer_social_InsultWorkEthic_Targeted_Mean_AlwaysOn_ActiveCareer: {
        pre_actions: ["{actor.0} is insulting {actor.1}'s work ethic."],
      },
      mixer_social_SpoilLatestEpisode_Targeted_Mean_AlwaysOn_ActiveCareer: {
        pre_actions: [
          '{actor.0} is maliciously spoiling the latest episode of a season for {actor.1}.',
        ],
      },
      mixer_social_PretendToFire_Targeted_Mean_AlwaysOn_ActiveCareer: {
        pre_actions: [
          '{actor.0} is pretending to fire {actor.1} from their job.',
        ],
      },
      mixer_social_FlirtCovertly_Targeted_Romance_AlwaysOn_ActiveCareer: {
        pre_actions: [
          '{actor.0} is covertly flirting with {actor.1} in a subtle and discreet manner.',
        ],
      },
      mixer_social_JokeAboutCoworkers_Targeted_Funny_AlwaysOn_ActiveCareer: {
        pre_actions: [
          '{actor.0} is telling a joke about co-workers to {actor.1}.',
        ],
      },
      mixer_social_TellNSFWJoke_Targeted_Funny_AlwaysOn_ActiveCareer: {
        pre_actions: [
          '{actor.0} is telling a joke that would be inappropriate for work to {actor.1}.',
        ],
      },
      mixer_hospitalExamBed_Seated_social_TreatPatient_display: {
        pre_actions: [
          '{actor.0} is treating {actor.1}, who is seated on the hospital examination bed.',
        ],
      },
      mixer_social_Targeted_AskAboutParty_Friendly_AlwaysOn_Alien: {
        pre_actions: ['{actor.0} is asking {actor.1} about partying.'],
      },
      mixer_social_Clone_Greeting: {
        pre_actions: [
          '{actor.0} is greeting their clone self with a friendly hello.',
        ],
      },
      mixer_social_DebateMedicalTheory_targeted_Friendly_alwaysOn_activeCareer_doctor:
        {
          pre_actions: [
            '{actor.0} is engaging in a friendly debate with {actor.1} regarding medical theory, as part of their active career as a doctor.',
          ],
        },
      mixer_hospitalExamBed_Seated_social_TalkAboutHealthcare: {
        pre_actions: [
          '{actor.0} and {actor.1} are sitting on a hospital exam bed and discussing healthcare.',
        ],
      },
      mixer_hospitalExamBed_Reclined_social_TalkAboutHealthcare: {
        pre_actions: [
          '{actor.0} and {actor.1} are having a conversation while reclining on the hospital examination bed, discussing healthcare.',
        ],
      },
      mixer_hospitalExamBed_Doctor_TransferPatientCase: {
        pre_actions: [
          "{actor.0}, a doctor, is transferring a patient's case to {actor.1} at the hospital exam bed.",
        ],
      },
      mixer_yogaMat_GreetingPose: {
        pre_actions: [
          '{actor.0} is stretching out on their yoga mat in a greeting pose, welcoming {actor.1}.',
        ],
      },
      mixer_yogaMat_HalfMoonPose: {
        pre_actions: [
          '{actor.0} is gracefully standing on one leg on the yoga mat, perfectly executing the Half Moon Pose.',
        ],
      },
      mixer_yogaMat_DownwardFacingDog: {
        pre_actions: [
          '{actor.0} is gracefully stretching into a downward facing dog pose on the yoga mat.',
        ],
      },
      mixer_yogaMat_TrianglePose: {
        pre_actions: [
          '{actor.0} is finding a yoga mat and performing the Triangle Pose.',
        ],
      },
      mixer_yogaMat_TreePose: {
        pre_actions: [
          '{actor.0} is striking a balanced Tree Pose on the yoga mat.',
        ],
      },
      mixer_yogaMat_DancePose: {
        pre_actions: [
          '{actor.0} is striking a Lord of the Dance Pose on their yoga mat.',
        ],
      },
      mixer_yogaMat_BridgePose: {
        pre_actions: [
          '{actor.0} is performing the Bridge Pose on the yoga mat.',
        ],
      },
      mixer_yogaMat_Corpse: {
        pre_actions: [
          '{actor.0} is lying down on the yoga mat in a corpse pose.',
        ],
      },
      mixer_yogaMat_BridgePose_Practice: {
        pre_actions: [
          '{actor.0} is positioning themselves on a yoga mat and starting to practice the Bridge Pose.',
        ],
      },
      mixer_yogaMat_DancePose_Practice: {
        pre_actions: [
          '{actor.0} is gracefully striking the Lord of the Dance pose on their yoga mat, practicing their dance moves.',
        ],
      },
      mixer_yogaMat_DownwardFacingDog_Practice: {
        pre_actions: [
          '{actor.0} is getting on a yoga Mat and starting to practice the Downward Facing Dog pose.',
        ],
      },
      mixer_yogaMat_HalfMoonPose_Practice: {
        pre_actions: [
          '{actor.0} is gracefully moving into the Half Moon Pose on the yoga mat, focusing on their practice.',
        ],
      },
      mixer_yogaMat_TreePose_Practice: {
        pre_actions: [
          '{actor.0} is gracefully balancing on one leg in the Tree Pose on a yoga mat, practicing their yoga skills.',
        ],
      },
      mixer_yogaMat_TrianglePose_Practice: {
        pre_actions: [
          '{actor.0} is demonstrating the Triangle Pose on their yoga yoga mat, practicing their yoga skills.',
        ],
      },
      mixer_social_GiveMassage_Swedish_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is offering to give {actor.1} a soothing Swedish massage as a friendly gesture.',
        ],
      },
      mixer_social_GiveMassage_DeepTissue_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is offering a friendly deep tissue massage to {actor.1}.',
        ],
      },
      mixer_social_GiveMassage_StoneMassage_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is offering to give {actor.1} a relaxing stone massage.',
        ],
      },
      mixer_social_GiveMassage_SportsMassage_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is giving {actor.1} a friendly sports massage.',
        ],
      },
      mixer_social_GiveMassage_Fertility_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is giving {actor.1} a fertility massage to help increase their chances of getting pregnant.',
        ],
      },
      mixer_social_GiveMassage_Aromatherapy_YlangYlang_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is giving {actor.1} a relaxing aromatherapy massage using Ylang Ylang oil.',
        ],
      },
      mixer_social_GiveMassage_Aromatherapy_Mint_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is giving {actor.1} a relaxing aromatherapy massage using mint and rosemary oils.',
        ],
      },
      mixer_social_GiveMassage_Aromatherapy_LotusBlossom_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is giving {actor.1} a soothing aromatherapy massage using Lotus Blossom oil.',
        ],
      },
      mixer_social_GiveMassage_Aromatherapy_Lavender_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is giving {actor.1} a soothing aromatherapy massage using lavender oil.',
        ],
      },
      mixer_social_AskForMassage_Swedish_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is politely asking {actor.1} if they can give them a Swedish massage.',
        ],
      },
      mixer_social_AskForMassage_DeepTissue_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is politely asking {actor.1} if they would be willing to give them a deep tissue massage.',
        ],
      },
      mixer_social_AskForMassage_SportsMassage_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is politely asking {actor.1} if they could give them a sports massage.',
        ],
      },
      mixer_social_AskForMassage_StoneMassage_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is asking {actor.1} if they would like a stone massage.',
        ],
      },
      mixer_social_AskForMassage_Fertility_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is politely asking {actor.1} if they would be willing to give them a fertility massage.',
        ],
      },
      mixer_social_AskForMassage_Aromatherapy_Ylang_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is politely asking {actor.1} if they would be willing to give them a relaxing Ylang Ylang aromatherapy massage.',
        ],
      },
      mixer_social_AskForMassage_Aromatherapy_Mint_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is asking {actor.1} if they can have a Mint and Rosemary Aromatherapy Massage.',
        ],
      },
      mixer_social_AskForMassage_Aromatherapy_Lavender_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is politely asking {actor.1} if they could give them a lavender aromatherapy massage.',
        ],
      },
      mixer_social_AskForMassage_Aromatherapy_LotusBlossom_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is politely asking {actor.1} if they could give them a Lotus Blossom Aromatherapy Massage.',
        ],
      },
      mixer_social_ShareDetoxSecrets_targeted_Friendly_alwaysOn_skill: {
        pre_actions: [
          '{actor.0} is sharing their detox secrets with {actor.1}.',
        ],
      },
      mixer_social_OfferMentalRelaxationTips_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is offering {actor.1} some tips on how to relax mentally.',
        ],
      },
      mixer_social_DiscussCognitiveFocusingMethods_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is engaging in a friendly discussion with {actor.1} about cognitive focusing methods.',
        ],
      },
      mixer_social_SuggestVisualizationTechniques_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is kindly suggesting some visualization techniques to {actor.1} that could help them.',
        ],
      },
      mixer_social_RecommendSelfEsteemExercises_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is suggesting some self-esteem exercises to {actor.1} in a friendly manner.',
        ],
      },
      mixer_social_CompareEssentialOils_Targeted_Friendly_AlwaysOn_MassageTherapist:
        {
          pre_actions: [
            '{actor.0}, a massage therapist, is engaging in a friendly conversation with {actor.1} to compare different essential oils.',
          ],
        },
      mixer_social_DiscussPressurePoints_Targeted_Friendly_AlwaysOn_MassageTherapist:
        {
          pre_actions: [
            '{actor.0} is discussing pressure points with {actor.1}.',
          ],
        },
      mixer_social_AskAboutMassageBenefits_Targeted_Friendly_AlwaysOn_MassageTherapist:
        {
          pre_actions: [
            '{actor.0} is asking {actor.1} about the benefits of a massage.',
          ],
        },
      mixer_social_AskForFlexibilityTips_Targeted_Friendly_AlwaysOn_YogaInstructor:
        {
          pre_actions: [
            '{actor.0} is asking {actor.1} for tips on improving flexibility in yoga.',
          ],
        },
      mixer_social_ChatAboutYogaClass_Targeted_Friendly_AlwaysOn_Yoga: {
        pre_actions: ['{actor.0} is discussing yoga class with {actor.1}.'],
      },
      mixer_social_ComplimentYogaPants_targeted_romance_alwaysOn_YogaInstructor:
        {
          pre_actions: [
            "{actor.0} is complimenting {actor.1}'s yoga pants, showing romantic interest in the yoga instructor.",
          ],
        },
      mixer_social_GetAMassage_DeepTissue_targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is requesting a deep tissue massage from {actor.1}, seeking relief and relaxation.',
        ],
      },
      mixer_Social_RequestHandMassage_Targeted_Friendly_AlwaysOn_Reflexologist:
        {
          pre_actions: [
            '{actor.0} is requesting a hand massage from {actor.1}.',
          ],
        },
      mixer_social_GetAMassage_SwedishMassage_targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is requesting a Swedish massage from {actor.1} in a friendly manner.',
        ],
      },
      mixer_social_GetAMassage_SportsMassage_targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is requesting a sports massage from {actor.1}, seeking their friendly and skillful touch.',
        ],
      },
      mixer_social_GetAMassage_StoneMassage_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is scheduling a targeted stone massage for {actor.1} in order to help them relax and unwind.',
        ],
      },
      mixer_social_GetAMassage_FertilityMassage_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is asking {actor.1} if they would like to get a fertility massage, a targeted and friendly interaction to promote fertility.',
        ],
      },
      mixer_social_GetAMassage_Aromatherapy_Mint_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is inviting {actor.1} to receive a relaxing aromatherapy massage using mint and rosemary scented oils.',
        ],
      },
      mixer_social_GetAMassage_Aromatherapy_YlangYlang_targeted_Friendly_alwaysOn:
        {
          pre_actions: [
            '{actor.0} is enjoying a Ylang Ylang aromatherapy massage from {actor.1}.',
          ],
        },
      mixer_social_GetAMassage_Aromatherapy_Lavender_targeted_Friendly_alwaysOn:
        {
          pre_actions: [
            '{actor.0} is inviting {actor.1} to come over and receive a relaxing lavender aromatherapy massage.',
          ],
        },
      mixer_social_GetAMassage_Aromatherapy_LotusBlossom_targeted_Friendly_alwaysOn:
        {
          pre_actions: [
            '{actor.0} is requesting a Lotus Blossom Aromatherapy Massage from {actor.1} in a friendly manner.',
          ],
        },
      mixer_social_DiscussReflexologyTheory_targeted_Friendly_alwaysOn_reflexologist:
        {
          pre_actions: [
            '{actor.0} is engaging in a friendly discussion about reflexology theory with {actor.1}, a fellow reflexologist.',
          ],
        },
      mixer_social_AskAboutReflexPoints_Targeted_Friendly_alwaysOn_reflexologist:
        {
          pre_actions: ['{actor.0} is asking {actor.1} about reflex points.'],
        },
      mixer_social_WooHooInSteamRoom_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are unable to resist the steamy atmosphere of the sauna and are deciding to engage in a passionate WooHoo session.',
        ],
      },
      mixer_social_TryForBabyInSteamRoom_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are sneaking into the sauna for some private time and are trying for a baby.',
        ],
      },
      mixer_Social_RequestFootMassage_Targeted_Friendly_AlwaysOn_Reflexologist:
        {
          pre_actions: [
            '{actor.0} is kindly asking {actor.1} for a foot massage, knowing that they have skills in reflexology.',
          ],
        },
      mixer_yogaMat_WarriorPose: {
        pre_actions: ['{actor.0} is striking a Warrior Pose on the yoga mat.'],
      },
      mixer_yogaMat_WarriorPose_Practice: {
        pre_actions: [
          '{actor.0} is striking a Warrior Pose on their yoga mat, practicing their yoga moves.',
        ],
      },
      mixer_yogaMat_BoatPose: {
        pre_actions: [
          '{actor.0} is demonstrating the Boat Pose on a yoga mat.',
        ],
      },
      mixer_yogaMat_BoatPose_Practice: {
        pre_actions: [
          '{actor.0} is getting onto a yoga mat and starting to practice the Boat Pose.',
        ],
      },
      mixer_yogaMat_HandStand: {
        pre_actions: [
          '{actor.0} is showing off their impressive handstand skills on a yoga mat.',
        ],
      },
      mixer_yogaMat_HandStand_Practice: {
        pre_actions: [
          '{actor.0} is setting up a yoga mat and beginning to practice handstands.',
        ],
      },
      mixer_Social_AskForHandMassage_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is politely asking {actor.1} for a hand massage, hoping they can provide some relaxation.',
        ],
      },
      mixer_Social_AskForFootMassage_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is politely asking {actor.1} if they would be willing to give them a foot massage.',
        ],
      },
      mixer_YogaClass_ClassMember_CorpsePose: {
        pre_actions: [
          '{actor.0} is lying down on the yoga mat and is beginning to perform the Corpse Pose during the yoga class, alongside {actor.1} who is also participating in the class.',
        ],
      },
      mixer_Social_OfferFootMassage_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is kindly offering {actor.1} a foot massage as a friendly gesture.',
        ],
      },
      mixer_Social_OfferHandMassage_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is offering a hand massage to {actor.1}, aiming to provide relaxation and show kindness.',
        ],
      },
      mixer_YogaMat_Corpse_SleepExit: {
        pre_actions: [
          '{actor.0} is lying down on a YogaMat in the Corpse Pose, appearing to be asleep.',
        ],
      },
      mixer_YogaMat_Corpse_NormalExit: {
        pre_actions: [
          '{actor.0} is lying down in the Corpse Pose on a Yoga Mat and peacefully exiting the pose.',
        ],
      },
      mixer_YogaMat_Corpse_NormalExit_YogaClass: {
        pre_actions: [
          '{actor.0} is lying down on the YogaMat in a Corpse Pose, as part of a normal exit from a Yoga Class.',
        ],
      },
      mixer_YogaMat_Corpse_SleepExit_YogaClass: {
        pre_actions: [
          '{actor.0} is lying down in the Corpse Pose on the Yoga Mat.',
        ],
      },
      mixer_YogaClass_Instructor_CorpsePose: {
        pre_actions: [
          '{actor.0} is guiding the yoga class and instructing {actor.1} to get into the Corpse Pose.',
        ],
      },
      mixer_YogaMat_Corpse_NormalExit_YogaClass_Mirrored: {
        pre_actions: [
          '{actor.0} is lying down on a yoga mat in a corpse pose during a normal exit from a yoga class.',
        ],
      },
      mixer_YogaMat_Corpse_SleepExit_YogaClass_Mirrored: {
        pre_actions: [
          '{actor.0} is lying down in the Corpse Pose on a Yoga Mat, appearing as if they are sleeping.',
        ],
      },
      mixer_Social_AskForManicure_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is politely asking {actor.1} if they can do their manicure.',
        ],
      },
      mixer_Social_AskForPedicure_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is politely asking {actor.1} if they would be willing to give them a pedicure.',
        ],
      },
      mixer_Social_OfferManicure_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is offering to give {actor.1} a manicure, in a friendly and targeted social interaction.',
        ],
      },
      mixer_Social_OfferPedicure_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is offering {actor.1} a pedicure as a friendly gesture.',
        ],
      },
      mixer_social_BragAboutNails: {
        pre_actions: [
          '{actor.0} is excitedly showing off their beautifully manicured nails to {actor.1}, bragging about how amazing they look.',
        ],
      },
      mixer_social_ComplainAboutNails: {
        pre_actions: [
          '{actor.0} is being irritated with the state of their nails and is beginning to complain to {actor.1} about them.',
        ],
      },
      mixer_social_RequestManicure_Targeted_Friendly_AlwaysOn_Reflexologist: {
        pre_actions: [
          '{actor.0} is asking {actor.1} in a friendly manner if they would be willing to give them a manicure, knowing that {actor.1} is a skilled reflexologist.',
        ],
      },
      mixer_social_RequestPedicure_Targeted_Friendly_AlwaysOn_Reflexologist: {
        pre_actions: [
          '{actor.0} is kindly asking {actor.1} if they can give them a pedicure, as they are a skilled reflexologist.',
        ],
      },
      mixer_social_HighMaintenance_ComplainAboutDailyStruggles_Trait: {
        pre_actions: [
          '{actor.0} is complaining to {actor.1} about the uncomfortable seats, due to their High Maintenance trait and tendency to complain about daily struggles.',
        ],
      },
      mixer_social_HighMaintenance_ShareCatharsisMoment_Trait: {
        pre_actions: [
          '{actor.0}, being a High Maintenance Sim, is sharing a cathartic moment with {actor.1}.',
        ],
      },
      mixer_social_FacialMask_OfferMask: {
        pre_actions: [
          "{actor.0} is kindly offering to apply a facial mask to {actor.1}'s face for a pampering session.",
        ],
      },
      mixer_social_ChillingTouch_targeted_mischief_skills: {
        pre_actions: [
          '{actor.0} is mischievously using a chilling touch on {actor.1}, giving them a cold, spooky sensation.',
        ],
      },
      mixer_social_AskforPartyTreat_targeted_Friendly_AlwaysOn_STC: {
        pre_actions: [
          '{actor.0} is politely asking {actor.1} if they could please give them a party treat.',
        ],
      },
      mixer_social_RequestSimCarvePumpkin_targeted_Friendly_AlwaysOn_STC: {
        pre_actions: [
          '{actor.0} is kindly asking {actor.1} if they would be willing to carve a pumpkin for them.',
        ],
      },
      mixer_foosball_DiscussGame: {
        pre_actions: [
          '{actor.0} and {actor.1} are discussing their recent foosball game, sharing strategies and highlights.',
        ],
      },
      mixer_Social_Clubs_NT_InviteToClub: {
        pre_actions: [
          '{actor.0} is inviting {actor.1} to join the {0.String} club.',
        ],
      },
      mixer_Social_Clubs_NT_AskToJoin: {
        pre_actions: [
          '{actor.0} is asking {actor.1} if they can join the {0.String} club.',
        ],
      },
      mixer_Social_Clubs_NT_TalkAbout: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a conversation about {0.String}.',
        ],
      },
      mixer_Social_Clubs_NT_PraiseClubLeader: {
        pre_actions: [
          "{actor.0} is complimenting {actor.1}'s leadership skills and is praising them for their role as the leader of the club.",
        ],
      },
      mixer_Social_Clubs_NT_ComplainAboutClubLeader: {
        pre_actions: [
          '{actor.0} is expressing their dissatisfaction about the current leader of the club to {actor.1}.',
        ],
      },
      mixer_Social_Clubs_NT_OverthrowClubLeader: {
        pre_actions: [
          "{actor.0} is gathering members of the Overthrow Club to plot and overthrow {actor.1}'s leader.",
        ],
      },
      mixer_Social_Clubs_NT_ConvinceLeaderToStepDown: {
        pre_actions: [
          '{actor.0} is using their social influence within the {0.String} club to convince {actor.1} to step down as their leader.',
        ],
      },
      mixer_social_WooHoo_targeted_romance_transition_Closet: {
        pre_actions: [
          '{actor.0} and {actor.1} are sneaking into a closet together for a steamy and intimate encounter.',
        ],
      },
      mixer_social_TryForBaby_targeted_romance_transition_Closet: {
        pre_actions: [
          '{actor.0} and {actor.1} are sneaking into a closet for a private moment and trying for a baby together.',
        ],
      },
      sim_Kiss_QuickSocial: {
        pre_actions: ['{actor.0} is quickly kissing {actor.1}.'],
      },
      mixer_social_ScoldClubMember_Targeted_Mean_AlwaysOn: {
        pre_actions: [
          '{actor.0} is scolding {actor.1}, who is a fellow club member, for breaking the rules.',
        ],
      },
      mixer_social_GoingOutSocials_AskAboutAnotherSim: {
        pre_actions: [
          '{actor.0} is asking {actor.1} about another Sim, wanting to know more information about them.',
        ],
      },
      mixer_social_Closet_MakeOut_targeted_romance_highScore: {
        pre_actions: [
          '{actor.0} and {actor.1} are passionately making out in the closet.',
        ],
      },
      mixer_social_targeted_friendly_MiddleScore_SeeOutfit_Everyday: {
        pre_actions: [
          '{actor.0} is complimenting {actor.1} on their everyday outfit.',
        ],
      },
      mixer_social_targeted_friendly_MiddleScore_SeeOutfit_Formal: {
        pre_actions: ["{actor.0} is complimenting {actor.1}'s formal outfit."],
      },
      mixer_social_targeted_friendly_MiddleScore_SeeOutfit_Athletic: {
        pre_actions: ["{actor.0} is complimenting {actor.1}'s workout outfit."],
      },
      mixer_social_targeted_friendly_MiddleScore_SeeOutfit_Swim: {
        pre_actions: ["{actor.0} is complimenting {actor.1}'s swimwear."],
      },
      mixer_social_targeted_friendly_MiddleScore_SeeOutfit_Sleep: {
        pre_actions: ["{actor.0} is complimenting {actor.1}'s sleepwear."],
      },
      mixer_social_targeted_friendly_MiddleScore_SeeOutfit_Party: {
        pre_actions: ['{actor.0} is complimenting {actor.1} party outfit.'],
      },
      mixer_social_DiscussDJMusic_targeted_Friendly_alwaysOn_STC: {
        pre_actions: [
          '{actor.0} and {actor.1} are discussing DJ techniques and music.',
        ],
      },
      mixer_Social_Clubs_NT_AskToStartClubGathering: {
        pre_actions: [
          '{actor.0} is asking {actor.1} to start a social club gathering.',
        ],
      },
      mixer_Social_Clubs_NT_DiscussLeadersFeelings: {
        pre_actions: [
          '{actor.0} and {actor.1} are being part of the same social club and are engaging in a discussion about their feelings regarding their leader.',
        ],
      },
      mixer_social_GoingOutSocials_ExchangeNumbers: {
        pre_actions: [
          '{actor.0} is asking to exchange phone numbers with {actor.1}.',
        ],
      },
      mixer_Social_Clubs_NT_QuitClub: {
        pre_actions: [
          '{actor.0} is deciding to quit the club, in order to pursue other interests.',
        ],
      },
      mixer_Social_Clubs_NT_KickOut: {
        pre_actions: [
          '{actor.0} is using their authority in the club to kick {actor.1} out.',
        ],
      },
      mixer_social_AskAboutClubs_Targeted_Friendly_AlwaysOn_Clubs: {
        pre_actions: [
          '{actor.0} is asking {actor.1} about clubs clubs they are in.',
        ],
      },
      mixer_social_targeted_TalkAboutParty_Trait_DanceMachine: {
        pre_actions: [
          '{actor.0}  is discussing the latest party with a dance machine with {actor.1}.',
        ],
      },
      mixer_Social_Clubs_NT_ConviceToLeaveClub: {
        pre_actions: [
          '{actor.0} is trying to convince {actor.1} to quit the {0.String} social club.',
        ],
      },
      mixer_Social_Clubs_NT_ResignFromClub: {
        pre_actions: [
          '{actor.0} is deciding to resign from the {0.String} social club, no longer wanting to be a part of it.',
        ],
      },
      mixer_social_InsiderTrait_TellInsiderStory_Friendly_MiddleScore: {
        pre_actions: [
          '{actor.0} is sharing an insider story with {actor.1}, creating a friendly and engaging conversation.',
        ],
      },
      mixer_DJBooth_GiveTipToPlayer: {
        pre_actions: ['{actor.0} is giving a tip to {actor.1}, the DJ.'],
      },
      mixer_social_DiscussDanceTechnique_targeted_Friendly_alwaysOn_STC: {
        pre_actions: [
          '{actor.0} is discussing dance techniques with {actor.1}.',
        ],
      },
      mixer_Social_Dartboard_DiscussGame_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is inviting {actor.1} to discuss the game while playing a friendly game of darts.',
        ],
      },
      mixer_social_targeted_friendly_MiddleScore_SeeOutfit_ColdOutfit: {
        pre_actions: [
          '{actor.0} is complimenting {actor.1} on their cold weather outfit.',
        ],
      },
      mixer_social_targeted_friendly_MiddleScore_SeeOutfit_HotOutfit: {
        pre_actions: [
          '{actor.0} is complimenting {actor.1} on their hot weather outfit.',
        ],
      },
      mixer_socials_EnthuseAboutMeal_Targeted_Friendly_AlwaysOn_DiningSocials: {
        pre_actions: [
          '{actor.0} is enthusiastically talking to {actor.1} about a delicious meal, engaging in a friendly and targeted conversation.',
        ],
      },
      mixer_socials_ComplainAboutDish_Targeted_Friendly_AlwaysOn_DiningSocials:
        {
          pre_actions: [
            '{actor.0} is complaining about the dish they are eating to {actor.1}.',
          ],
        },
      mixer_socials_DiscussFoodFlavors_Targeted_Friendly_AlwaysOn_DiningSocials:
        {
          pre_actions: [
            '{actor.0} is engaging in a friendly discussion with {actor.1} about different food flavors.',
          ],
        },
      mixer_social_SitIntimate_FeedABite_targeted_romance_alwaysOn: {
        pre_actions: [
          '{actor.0} is sitting closely next to {actor.1} and is feeding them a bite of food, creating an intimate and romantic moment.',
        ],
      },
      mixer_socials_EnthuseAboutExperimentalFood_Targeted_Friendly_AlwaysOn_DiningSocials:
        {
          pre_actions: [
            '{actor.0} is excitedly talking to {actor.1} about their experimental meal, hoping to share their passion for unique and delicious food.',
          ],
        },
      mixer_socials_ComplainAboutExperimentalFood_Targeted_Friendly_AlwaysOn_DiningSocials:
        {
          pre_actions: [
            '{actor.0} is targeting {actor.1} and is expressing their dissatisfaction with the experimental dish they were served during the meal in a friendly manner.',
          ],
        },
      mixer_socials_DiscussExperimentalFood_Targeted_Friendly_AlwaysOn_DiningSocials:
        {
          pre_actions: [
            '{actor.0} and {actor.1} are sitting down to discuss experimental food flavors, sharing their thoughts and opinions in a friendly and engaging conversation.',
          ],
        },
      mixer_social_ComplainAboutFoodPoisoning_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is complaining to {actor.1} about experiencing food poisoning.',
        ],
      },
      mixer_social_BragAboutFoodPoisoning_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is excitedly telling {actor.1} about surviving food poisoning, eager to impress them with their resilience and strength.',
        ],
      },
      mixer_social_AskToDeliverCompliment_Targeted_Friendly_AlwaysOn_WaitStaff:
        {
          pre_actions: [
            '{actor.0} is asking {actor.1} to deliver a compliment to the chefs.',
          ],
        },
      mixer_social_AskToDeliverInsult_Targeted_Friendly_AlwaysOn_WaitStaf: {
        pre_actions: [
          '{actor.0} is requesting {actor.1} and the wait staff to deliver an insult to the chefs.',
        ],
      },
      mixer_social_ChatAboutActors_targeted_Friendly_Movie_AlwaysOn_STC: {
        pre_actions: [
          '{actor.0} and {actor.1} are having a friendly conversation about their favorite actors and movies.',
        ],
      },
      mixer_socials_EnthuseAboutMovie_targeted_Friendly_Movie_AlwaysOn_STC: {
        pre_actions: [
          '{actor.0} is excitedly talking to {actor.1} about a movie they recently watched and enjoyed.',
        ],
      },
      mixer_socials_AskQuestionAboutPlot_targeted_Friendly_Movie_AlwaysOn_STC: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1}, asking them about the plot of a movie.',
        ],
      },
      mixer_socials_DiscussScene_targeted_Friendly_Movie_AlwaysOn_STC: {
        pre_actions: [
          '{actor.0} is discussing the movie scene with {actor.1}.',
        ],
      },
      mixer_socials_DeclareFavoriteGenre_targeted_Friendly_Movie_AlwaysOn_STC: {
        pre_actions: [
          '{actor.0} is excitedly telling {actor.1} their favorite movie genre, hoping to spark a conversation about their shared interest in movies.',
        ],
      },
      mixer_socials_SpreadFakeSpoilers_targeted_Mischief_AlwaysOn_STC: {
        pre_actions: [
          '{actor.0} is mischievously spreading fake spoilers to {actor.1} during their conversation.',
        ],
      },
      mixer_socials_ComplainAboutActor_targeted_Friendly_Movie_AlwaysOn_STC: {
        pre_actions: [
          '{actor.0} is complaining about an actor in the movie to {actor.1}.',
        ],
      },
      mixer_socials_ComplainAboutDirector_targeted_Friendly_Movie_AlwaysOn_STC:
        {
          pre_actions: [
            '{actor.0} is complaining about the director in the movie to {actor.1}.',
          ],
        },
      mixer_social_UltimatePickUp_targeted_romance_AlwaysOn: {
        pre_actions: [
          '{actor.0} is confidently using the ultimate pick-up line with {actor.1}.',
        ],
      },
      mixer_social_UltimatePickUp_targeted_romance_AlwaysOn_teen: {
        pre_actions: [
          '{actor.0} is confidently using the ultimate pick-up line on {actor.1}.',
        ],
      },
      mixer_social_Blackmail_targeted_mean_alwaysOn: {
        pre_actions: [
          '{actor.0} is threatening {actor.1} with some incriminating information, in an attempt to control or manipulate them.',
        ],
      },
      mixer_social_AskToPlayInFountain_targeted_friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is asking {actor.1} if they want to play in the fountain together.',
        ],
      },
      mixer_socials_AskToTrade_Targeted_Friendly_AlwaysOn_STC: {
        pre_actions: ['{actor.0} is asking {actor.1} to trade Voidcritters.'],
      },
      mixer_socials_AskToTrade_FromPicker_Friendly_AlwaysOn_STC: {
        pre_actions: [
          '{actor.0} is asking {actor.1} if they want to trade Voidcritters.',
        ],
      },
      mixer_social_PraiseVampireLifestyle_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is complimenting {actor.1} on their vampire lifestyle, showing sincere admiration.',
        ],
      },
      mixer_social_EnthuseAboutVampires_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is excitedly talking to {actor.1} about vampires, expressing their enthusiasm for the topic.',
        ],
      },
      mixer_social_ConfessFearOfVampires_Targeted_Friendly_AlwaysOn_STC: {
        pre_actions: [
          '{actor.0} is reaching out to {actor.1} and confessing their fear of vampires, hoping to receive support and understanding.',
        ],
      },
      mixer_social_DebateExistenceOfVampires_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is debating the existence of vampires with {actor.1}.',
        ],
      },
      mixer_social_InsultFangSize_Targeted_Mean_AlwaysOn_Vampire: {
        pre_actions: [
          "{actor.0} is rudely insulting {actor.1}'s fang size, aiming to be mean and hurtful.",
        ],
      },
      mixer_social_DeclareEternalLove_Targeted_Romance_HighScore: {
        pre_actions: [
          '{actor.0} is declaring eternal love to {actor.1}, expressing their deep romantic feelings.',
        ],
      },
      mixer_social_DiscussPlasmaFlavors_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1}, discussing different flavors of plasma.',
        ],
      },
      mixer_social_GossipAboutVampires_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is excitedly sharing some juicy gossip about ancient vampires with {actor.1}, sparking a friendly conversation.',
        ],
      },
      mixer_social_BroodAboutBeingAVampire_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is confiding in {actor.1} about the struggles of being a vampire, seeking friendly support.',
        ],
      },
      mixer_social_OfferAdviceOnVampireLife_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is offering {actor.1} advice on how to navigate the vampire life, sharing tips and experiences.',
        ],
      },
      mixer_social_MockLackOfPower_Targeted_Mean_AlwaysOn: {
        pre_actions: [
          "{actor.0} is making fun of {actor.1}'s lack of power, being mean-spirited.",
        ],
      },
      mixer_social_LectureAboutSunlight_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is delivering a targeted and friendly lecture to {actor.1} about the importance of sunlight.',
        ],
      },
      mixer_social_ShareAncientLore_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1}, sharing ancient lore and stories.',
        ],
      },
      mixer_social_VampireCreation_AskToTurn: {
        pre_actions: [
          '{actor.0} is asking {actor.1} if they would like to be turned into a vampire.',
        ],
      },
      mixer_social_AskForAdviceOnBitingTechnique_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is asking {actor.1} for advice on improving their biting technique.',
        ],
      },
      mixer_social_VampireCreation_OfferToTurn: {
        pre_actions: [
          '{actor.0} is offering to turn {actor.1} into a vampire.',
        ],
      },
      mixer_Vampire_Thirst_RemarkOnLoudHeartbeat: {
        pre_actions: [
          "{actor.0} is noticing {actor.1}'s loud heartbeat and remarking on it, signaling their vampire thirst.",
        ],
      },
      mixer_Vampire_Thirst_ComplimentNeck: {
        pre_actions: [
          '{actor.0} is leaning towards {actor.1} and complimenting their neck, perhaps with a hint of vampire thirst.',
        ],
      },
      mixer_Vampire_Thirst_InquireAboutCardiovascularHealth: {
        pre_actions: [
          '{actor.0}, who is a vampire, is asking {actor.1} about their cardiovascular health.',
        ],
      },
      mixer_social_OfferToCureVampirism_Targeted_Friendly: {
        pre_actions: ["{actor.0} is offering to cure {actor.1}'s vampirism."],
      },
      mixer_social_ThrowVampireCure_Targeted_Mean_AlwaysOn: {
        pre_actions: [
          '{actor.0} is throwing a vampire cure at {actor.1}, with the intention of causing harm or discomfort.',
        ],
      },
      mixer_social_Fight_targeted_mean_SimAndVampire_Duel_WithGarlic: {
        pre_actions: [
          '{actor.0} is confronting {actor.1}, who is a vampire, and is starting a fight with them. Armed with garlic, {actor.0} is intending to fend off the vampire and assert their dominance.',
        ],
      },
      mixer_social_Fight_targeted_mean_SimAndVampire_Duel_WithoutGarlic: {
        pre_actions: [
          '{actor.0} is angrily confronting {actor.1} who is revealing themselves as a vampire. A heated battle between them is ensuing, with neither of them holding back.',
        ],
      },
      mixer_social_Fight_targeted_mean_VampireAndSim_Duel_WithGarlic: {
        pre_actions: [
          '{actor.0} is fighting with {actor.1}, armed with garlic and ready to dual a vampire.',
        ],
      },
      mixer_social_Fight_targeted_mean_VampireAndSim_Duel_WithoutGarlic: {
        pre_actions: [
          '{actor.0} is engaging in a mean fight with {actor.1}, who is a vampire. The fight is turning into a duel without the use of garlic.',
        ],
      },
      mixer_social_VampiricDuel_Targeted_Mean_VampireToVampire: {
        pre_actions: [
          '{actor.0} is challenging {actor.1} to a vampiric duel, using their powers to engage in a heated confrontation.',
        ],
      },
      mixer_social_Fight_targeted_mean_SimAndVampire_Slay_WithGarlic: {
        pre_actions: [
          '{actor.0} is bravely confronting {actor.1}, who is a mean Sim and a Vampire, armed with garlic to slay them.',
        ],
      },
      mixer_social_Fight_targeted_mean_SimAndVampire_Slay_WithoutGarlic: {
        pre_actions: [
          '{actor.0} is engaging in a fierce battle with {actor.1}, an aggressive vampire. Despite not having any garlic, {actor.0} is bravely attempting to slay the vampire.',
        ],
      },
      mixer_social_OfferVampiricTraining_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is extending a friendly offer to {actor.1}, offering to provide them with vampiric training.',
        ],
      },
      mixer_social_RequestVampiricTraining_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          "{actor.0} is requesting {actor.1}'s assistance in vampiric training.",
        ],
      },
      mixer_Vampire_Mentor_MindPower_Generic: {
        pre_actions: [
          '{actor.0} is showing off their mind power skills to {actor.1}, acting as a mentor and demonstrating the impressive abilities of being a vampire.',
        ],
      },
      mixer_Vampire_Mentor_MindPower_Generic_Target: {
        pre_actions: [
          '{actor.0} is using their vampire mind power to teach and guide {actor.1} in practicing mind control techniques.',
        ],
      },
      mixer_Vampire_Mentor_SpiritPower_DrawIn: {
        pre_actions: [
          '{actor.0}, as a vampire mentor, is showing their spirit power to {actor.1} in order to draw them in.',
        ],
      },
      mixer_Vampire_Mentor_SpiritPower_DrawIn_Target: {
        pre_actions: [
          '{actor.0} is acting as a mentor to {actor.1} and is guiding them in practicing their Spirit Power abilities.',
        ],
      },
      mixer_social_VampiricSlay_Targeted_Mean_VampireToVampire_NoDarkForms: {
        pre_actions: [
          '{actor.0} is confronting {actor.1}, a vampire, with the intention to slay them. This interaction is being ruthlessly carried out and is meant specifically for vampires. No dark forms are being involved.',
        ],
      },
      mixer_social_VampiricDuel_Targeted_Mean_VampireToVampire_ActorOnlyDarkForm:
        {
          pre_actions: [
            '{actor.0} is challenging {actor.1} to a vampiric duel, fueled by their dark vampire forms. This confrontation is being targeted and mean, as the two vampires are battling it out.',
          ],
        },
      mixer_social_VampiricDuel_Targeted_Mean_VampireToVampire_TargetOnlyDarkForm:
        {
          pre_actions: [
            '{actor.0}, in their dark vampire form, is targeting {actor.1} for a vampiric duel.',
          ],
        },
      mixer_social_VampiricDuel_Targeted_Mean_VampireToVampire_ActorTargetDarkForm:
        {
          pre_actions: [
            '{actor.0}, in their dark vampire form, is challenging {actor.1}, another vampire, to a fierce and intense duel.',
          ],
        },
      mixer_social_VampiricSlay_Targeted_Mean_VampireToVampire_ActorOnlyDarkForm:
        {
          pre_actions: [
            '{actor.0}, in their dark form, is viciously attacking {actor.1}, a vampire, with the intent to slay them.',
          ],
        },
      mixer_social_VampiricSlay_Targeted_Mean_VampireToVampire_ActorTargetDarkForm:
        {
          pre_actions: [
            '{actor.0} is aggressively attacking {actor.1}, intending to slay them as they are a vampire in their dark form.',
          ],
        },
      mixer_social_VampiricSlay_Targeted_Mean_VampireToVampire_TargetOnlyDarkForm:
        {
          pre_actions: [
            '{actor.0} is aggressively confronting {actor.1} and engaging in a fierce battle to slay them, utilizing their vampiric abilities. This interaction is only possible when both Sims are in their dark vampire forms and can only be performed against other vampires.',
          ],
        },
      mixer_social_Fight_targeted_mean_VampireAndSim_Duel_DarkForm_WithGarlic: {
        pre_actions: [
          '{actor.0} is engaging in a fight with {actor.1}, resulting in a mean and intense confrontation. {actor.0}, being a vampire, is transforming into their dark form and is challenging {actor.1} to a duel. However, {actor.1} is coming prepared with garlic to defend themselves.',
        ],
      },
      mixer_social_Fight_targeted_mean_VampireAndSim_Duel_DarkForm_WithoutGarlic:
        {
          pre_actions: [
            '{actor.0} is confronting {actor.1} in a heated fight, showing no mercy. In a dark and intense duel, {actor.0} is revealing their vampire form, overpowering {actor.1} without the use of garlic.',
          ],
        },
      mixer_social_Fight_targeted_mean_SimAndVampire_Duel_DarkForm_WithGarlic: {
        pre_actions: [
          '{actor.0} is confronting {actor.1}, who is a vampire. They are engaging in a heated fight, using mean actions to defend themselves. {actor.0} is even transforming into their dark form and bringing out garlic to ward off the vampire.',
        ],
      },
      mixer_social_Fight_targeted_mean_SimAndVampire_Slay_DarkForm_WithGarlic: {
        pre_actions: [
          '{actor.0} is bravely confronting the mean Sim in vampire form, armed with garlic, in a fierce battle to slay the vampire.',
        ],
      },
      mixer_social_Fight_targeted_mean_SimAndVampire_Duel_DarkForm_WithoutGarlic:
        {
          pre_actions: [
            "{actor.0} is confronting {actor.1}, who is a vampire, in a fierce battle. This heated fight between them is being fueled by {actor.0}'s mean-spiritedness and {actor.1}'s dark form. Interestingly, {actor.0} isn't even having garlic to use against {actor.1}.",
          ],
        },
      mixer_social_Fight_targeted_mean_SimAndVampire_Slay_DarkForm_WithoutGarlic:
        {
          pre_actions: [
            '{actor.0} is bravely confronting the mean Sim and vampire {actor.1}, ready to fight and slay them in their dark form, without the need for garlic.',
          ],
        },
      mixer_Vampire_Mentor_SpiritPower_PushOut: {
        pre_actions: [
          '{actor.0}, a Vampire Mentor, is demonstrating their spirit power to {actor.1} by forcefully pushing them out of their way.',
        ],
      },
      mixer_Vampire_Mentor_SpiritPower_PushOut_Target: {
        pre_actions: [
          '{actor.0}, a vampire mentor, is pushing {actor.1} out of their comfort zone as they are practicing their spirit power skills.',
        ],
      },
      mixer_Vampire_Mentor_Instructions_AskQuestions: {
        pre_actions: [
          '{actor.0}, the vampire mentor, is giving instructions to {actor.1} and encouraging them to ask questions.',
        ],
      },
      mixer_Vampire_Mentor_Instructions_PepTalk: {
        pre_actions: [
          '{actor.0} is engaging in an Invisible Mixer with {actor.1}, providing instructions and a pep talk for their vampire mentorship.',
        ],
      },
      mixer_Vampire_Mentor_Instructions_Lecture: {
        pre_actions: [
          '{actor.0} is secretly guiding {actor.1} through a series of instructions and lectures, sharing their wisdom as a vampire mentor.',
        ],
      },
      mixer_social_BatWooHoo_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are transforming into bats and engaging in a romantic WooHoo.',
        ],
      },
      mixer_social_ShowOffPowers_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is using their powers to impress {actor.1}, creating a friendly and targeted interaction.',
        ],
      },
      mixer_social_BatTryForBaby_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are embracing the Bat Try for Baby interaction, as their romance is taking a new and exciting turn.',
        ],
      },
      mixer_Vampire_ShowOffPowers_Actor: {
        pre_actions: [
          '{actor.0} is using their vampire powers to impress and entertain {actor.1}, showing off their abilities like an actor on stage.',
        ],
      },
      mixer_Vampire_ShowOffPowers_Target: {
        pre_actions: [
          '{actor.0}, a vampire, is showing off their powers to {actor.1}.',
        ],
      },
      mixer_social_ShareVampireSecret_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is sharing their knowledge about vampires with {actor.1} in a friendly and targeted conversation.',
        ],
      },
      mixer_Social_VampiricSpar_Targeted_Friendly: {
        pre_actions: [
          '{actor.0} is engaging in a friendly battle of sparring with {actor.1}, using their vampiric powers.',
        ],
      },
      mixer_Social_VampiricSpar_Targeted_Friendly_ActorOnlyDarkForm: {
        pre_actions: [
          '{actor.0} is engaging in a vampiric spar with {actor.1}, using their dark form, in a friendly manner.',
        ],
      },
      mixer_Social_VampiricSpar_Targeted_Friendly_ActorTargetDarkForm: {
        pre_actions: [
          '{actor.0}, in their dark form, is playfully engaging in a friendly spar with {actor.1}, using their vampire powers.',
        ],
      },
      mixer_Social_VampiricSpar_Targeted_Friendly_TargetOnlyDarkForm: {
        pre_actions: [
          '{actor.0} is engaging in a friendly spar with {actor.1} in their dark form, showcasing their vampire skills.',
        ],
      },
      mixer_social_Vampire_MockMortality_Targeted_Mean_AlwaysOn: {
        pre_actions: [
          "{actor.0}, a vampire, is cruelly mocking {actor.1}'s mortality.",
        ],
      },
      mixer_social_Vampire_MockPlasmaThirst_Targeted_Mean_AlwaysOn: {
        pre_actions: [
          "{actor.0} is cruelly mocking {actor.1}'s thirst for plasma, deliberately trying to upset them.",
        ],
      },
      mixer_social_Vampire_AskAboutVampireHistory_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is engaging in a targeted friendly conversation with {actor.1}, asking them about vampire history.',
        ],
      },
      mixer_social_Vampire_ComplainAboutSunlight_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          'As a vampire, {actor.0} is complaining to {actor.1} about the harsh effects of sunlight, seeking understanding and sympathy in a friendly way.',
        ],
      },
      mixer_social_Vampire_RecallMortalLife_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is sharing stories from their mortal life with {actor.1}, as they are recalling the memories together.',
        ],
      },
      mixer_social_Vampire_ClaimToBeMasterVampire_Targeted_Mischief_AlwaysOn: {
        pre_actions: [
          '{actor.0} is mischievously claiming to be the Master Vampire to {actor.1}, targeting their knowledge of vampires.',
        ],
      },
      mixer_social_Vampire_LieAboutBadPlasma_Targeted_Mischief_AlwaysOn: {
        pre_actions: [
          '{actor.0}, a vampire, is telling a targeted lie to {actor.1} about bad plasma as a mischievous act.',
        ],
      },
      mixer_social_Vampire_CompareToLongLostLove_Targeted_Romance_MiddleScore: {
        pre_actions: [
          '{actor.0}, a vampire, is comparing {actor.1} to a long-lost love, sparking a romantic interest.',
        ],
      },
      mixer_social_Vampire_MakeVampirePun_Targeted_Funny_AlwaysOn: {
        pre_actions: [
          '{actor.0} is playfully making a vampire pun, targeting {actor.1}.',
        ],
      },
      mixer_social_Vampire_PretendToBite_Targeted_Mischief_AlwaysOn: {
        pre_actions: [
          '{actor.0} is pretending to be a vampire and is playfully lunging towards {actor.1} as if to bite them, causing mischief.',
        ],
      },
      mixer_social_TryForBabyInCoffin_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are deciding to take their relationship to the next level by trying for a baby inside a coffin.',
        ],
      },
      mixer_social_WooHooInCoffin_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a romantic WooHoo interaction inside a coffin, transitioning into a more intimate relationship.',
        ],
      },
      mixer_Argument_Start_Politics: {
        pre_actions: [
          '{actor.0} and {actor.1} are starting a heated argument about politics.',
        ],
      },
      mixer_social_Families_Shove: {
        pre_actions: [
          '{actor.0} is forcefully shoving {actor.1}, indicating a tense moment between family members.',
        ],
      },
      mixer_Argument_Start_Careers: {
        pre_actions: [
          '{actor.0} and {actor.1} are getting into a heated argument about their career choices.',
        ],
      },
      mixer_Argument_Start_LifeOutlook: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a heated argument about their different outlooks on life.',
        ],
      },
      mixer_Argument_Start_Morals: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a heated argument about their differing morals.',
        ],
      },
      mixer_Argument_Start_Kindness: {
        pre_actions: [
          '{actor.0} is beginning to argue with {actor.1} about the importance of kindness.',
        ],
      },
      mixer_Argument_Start_Humor: {
        pre_actions: [
          '{actor.0} and {actor.1} are getting into an argument about humor.',
        ],
      },
      mixer_Argument_Start_SocialAnxiety: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a heated argument about social anxiety.',
        ],
      },
      mixer_Argument_Start_NatureWonders: {
        pre_actions: [
          '{actor.0} and {actor.1} are getting into a heated argument about the wonders of nature.',
        ],
      },
      mixer_Argument_Start_Cleanliness: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a heated argument about cleanliness and the state of their surroundings.',
        ],
      },
      mixer_Argument_Start_Romance: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a heated argument about their differing opinions on romance.',
        ],
      },
      mixer_Argument_Start_Music: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a heated argument about music preferences.',
        ],
      },
      mixer_Argument_Start_Sharing: {
        pre_actions: [
          '{actor.0} and {actor.1} are getting into a heated argument about sharing.',
        ],
      },
      mixer_Argument_Start_Arguments: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a heated argument about arguing and its place in their relationship.',
        ],
      },
      mixer_Argument_Start_School: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a heated argument about school.',
        ],
      },
      mixer_Argument_Start_Job: {
        pre_actions: [
          '{actor.0} and {actor.1} are getting into a heated argument about their jobs.',
        ],
      },
      mixer_Argument_Start_Parenting: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a heated argument about parenting methods.',
        ],
      },
      mixer_Argument_Start_HouseRules: {
        pre_actions: [
          '{actor.0} and {actor.1} are getting into a heated argument about the house rules.',
        ],
      },
      mixer_Argument_Start_WhosBetter: {
        pre_actions: [
          '{actor.0} and {actor.1} are starting to argue about who is better.',
        ],
      },
      mixer_Argument_Start_Exercising: {
        pre_actions: [
          '{actor.0} and {actor.1} are getting into a heated argument about exercising and the importance of staying active.',
        ],
      },
      mixer_Argument_Start_LifeGoals: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a heated argument about their different perspectives on life goals.',
        ],
      },
      mixer_Argument_Start_Children: {
        pre_actions: [
          '{actor.0} and {actor.1} are starting to argue about children.',
        ],
      },
      mixer_Argument_Start_Food: {
        pre_actions: [
          '{actor.0} and {actor.1} are having a heated argument about food preferences and tastes.',
        ],
      },
      mixer_social_Families_Shove_Cont: {
        pre_actions: [
          '{actor.0} is aggressively pushing {actor.1} in a display of hostility.',
        ],
      },
      mixer_social_TalkAboutJournal_targeted_Friendly_HighScore: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1} to discuss their journal entries.',
        ],
      },
      mixer_social_MakeFunOfJournal_targeted_mean_highScore: {
        pre_actions: [
          '{actor.0} is mocking {actor.1} for their journal entries, being mean and hurtful.',
        ],
      },
      mixer_social_PoliteIntroduction_greetings_skills: {
        pre_actions: [
          '{actor.0} is introducing themselves to {actor.1} with a polite greeting.',
        ],
      },
      mixer_social_OfferGratitude_Targeted_Friendly_AlwaysOn_invited: {
        pre_actions: [
          '{actor.0} is expressing gratitude towards {actor.1} for their help, in a friendly and inviting manner.',
        ],
      },
      mixer_social_PointOutFlaws_targeted_friendly_alwaysFail: {
        pre_actions: [
          '{actor.0} is kindly pointing out some flaws to {actor.1}, but unfortunately, their attempts are always failing.',
        ],
      },
      mixer_social_CommentOnAppearance_targeted_Friendly_alwaysFail: {
        pre_actions: [
          "{actor.0} is attempting to compliment {actor.1}'s appearance, but it isn't going over well and is always failing.",
        ],
      },
      mixer_social_UnintentionallyCrushDreams_targeted_friendly_alwaysFail: {
        pre_actions: [
          "{actor.0} is unknowingly shattering {actor.1}'s dreams, despite their friendly intentions. Unfortunately, {actor.0} is always seeming to fail at this interaction.",
        ],
      },
      mixer_social_AccidentlyInsultInterests_targeted_friendly_alwaysFail: {
        pre_actions: [
          "{actor.0} is unintentionally insulting {actor.1}'s interests, but is quickly trying to rectify the situation with friendly conversation, though their attempt is falling flat and they are continuing to fail to connect.",
        ],
      },
      mixer_social_WhisperAboutCrush_Targeted_Friendly_alwaysOn_Teen: {
        pre_actions: [
          '{actor.0} is discreetly whispering to {actor.1} about their crush, hoping to confide in them and deepen their friendship.',
        ],
      },
      mixer_social_BoastAboutMessingAround_Targeted_Friendly_AlwaysOn_teen: {
        pre_actions: [
          '{actor.0} is proudly boasting to {actor.1} about their adventures in causing mischief, in a friendly and playful manner.',
        ],
      },
      mixer_social_WhineAboutUnfairLife_Targeted_friendly_AlwaysOn_teen: {
        pre_actions: [
          '{actor.0} is complaining to {actor.1} about the unfairness of life.',
        ],
      },
      mixer_social_ObsessAboutFavorite_Targeted_Friendly_AlwaysOn_Teen: {
        pre_actions: [
          '{actor.0} is excitedly talking to {actor.1} about their favorite show, obsessing over every detail.',
        ],
      },
      mixer_social_ShowOffApp_Targeted_Friendly_AlwaysOn_Teen: {
        pre_actions: [
          '{actor.0} is using the Show Off App to show {actor.1} their selfies, in a friendly and targeted manner, particularly appealing to teens.',
        ],
      },
      mixer_social_RaveAboutGrowingUp_targeted_Friendly_AlwaysOn_Teen: {
        pre_actions: [
          '{actor.0} is excitedly raving to {actor.1} about their experiences and memories of growing up as a teen.',
        ],
      },
      mixer_social_PressureToConform_Mean_AlwaysOn_TEen: {
        pre_actions: [
          '{actor.0} is pressuring {actor.1} to conform to societal expectations, using mean-spirited tactics. This interaction is especially common between teenagers.',
        ],
      },
      mixer_social_MockUncoolAdult_Mean_AlwaysOn_Teen: {
        pre_actions: [
          '{actor.0} is mocking {actor.1}, a so-called uncool adult, in a mean-spirited way, displaying their teenage attitude.',
        ],
      },
      mixer_social_ThrowShade_Mean_AlwaysOn_Teen: {
        pre_actions: ['{actor.0} is throwing shade at {actor.1}.'],
      },
      mixer_social_ActTough_Mean_AlwaysOn_Teen: {
        pre_actions: [
          '{actor.0} is trying to act tough in front of {actor.1}, perhaps behaving meanly because they are a teenager.',
        ],
      },
      mixer_social_TellUrbanLegend_Mischief_AlwaysOn_Teen: {
        pre_actions: [
          '{actor.0} is sharing a thrilling urban legend with {actor.1}, causing mischief and excitement among the teens.',
        ],
      },
      mixer_social_SpreadRumorsAboutWoohoo_Mischief_AlwaysOn_Teen: {
        pre_actions: [
          '{actor.0} is mischievously spreading rumors about {actor.1} engaging in woohoo, causing potential gossip and controversy among their peers.',
        ],
      },
      mixer_Social_AccuseOfTouchingPossessions_SiblingRivalry_AlwaysOn: {
        pre_actions: [
          '{actor.0} is confronting {actor.1}, accusing them of touching their possessions, fueling their ongoing sibling rivalry.',
        ],
      },
      mixer_Social_BlameForBadMood_SiblingRivalry_AlwaysOn: {
        pre_actions: [
          '{actor.0} is confronting {actor.1} and blaming them for being in a bad mood, possibly due to a sibling rivalry.',
        ],
      },
      mixer_Social_TrickIntoBelieving_SiblingRivalry_AlwaysOn: {
        pre_actions: [
          '{actor.0} is trying to trick {actor.1} into believing in vampires, perhaps as part of a sibling rivalry or playful prank.',
        ],
      },
      mixer_Social_InsultExistence_SiblingRivalry_AlwaysOn: {
        pre_actions: [
          "{actor.0} is spitefully insulting {actor.1}'s very existence, fueling their ongoing sibling rivalry.",
        ],
      },
      mixer_Social_ConvinceMonsterAreReal_SiblingRivalry_AlwaysOn: {
        pre_actions: [
          '{actor.0} is engaging in a social interaction with {actor.1}, attempting to convince them that monsters are real, possibly fueling a sibling rivalry.',
        ],
      },
      mixer_Social_Tease_SiblingRivalry_AlwaysOn: {
        pre_actions: [
          '{actor.0} is playfully teasing {actor.1} about their face, showcasing a bit of sibling rivalry.',
        ],
      },
      mixer_Social_FlickNose_SiblingRivalry_AlwaysOn: {
        pre_actions: [
          "{actor.0} is playfully flicking {actor.1}'s nose, adding to the sibling rivalry between them.",
        ],
      },
      mixer_social_AskAboutNegativeMood_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is asking {actor.1} about their mood with genuine concern.',
        ],
      },
      mixer_social_TalkAboutMoodiness_TeenMoodSwing: {
        pre_actions: [
          '{actor.0} is engaging in a conversation with {actor.1} to talk about their moodiness and helping them through a teen mood swing.',
        ],
      },
      mixer_social_CriticizeMoodSwing_TeenMoodSwing: {
        pre_actions: [
          '{actor.0} is criticizing {actor.1} for their mood swing, questioning their behavior as a teenager.',
        ],
      },
      mixer_social_EncourageRedirect_TeenMoodSwing: {
        pre_actions: [
          '{actor.0} is trying to encourage {actor.1} to redirect their mood, especially since {actor.1} is a teenager experiencing mood swings.',
        ],
      },
      mixer_Social_Toddler_Bite: {
        pre_actions: [
          '{actor.0}, a toddler, is playfully biting {actor.1} during a social interaction.',
        ],
      },
      mixer_social_AskAboutFuturePlans_targeted_friendly_alwayson: {
        pre_actions: [
          '{actor.0} is curiously asking {actor.1} about their future plans, in a friendly conversation.',
        ],
      },
      mixer_social_GiveFamilyAdvice_targeted_friendly_alwayson: {
        pre_actions: [
          '{actor.0} is offering some helpful family advice to {actor.1} during their conversation.',
        ],
      },
      mixer_social_BringUpChildhoodMoment_targeted_friendly_alwayson: {
        pre_actions: [
          '{actor.0} is bringing up an embarrassing childhood moment to {actor.1} in a friendly manner.',
        ],
      },
      mixer_social_SecretHandshake_targeted_friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} and {actor.1} are exchanging a secret handshake, solidifying their friendship.',
        ],
      },
      mixer_social_DeepPersonalConversation_targeted_friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is engaging in a deep and personal conversation with {actor.1}.',
        ],
      },
      mixer_social_BackInMyDay_targeted_friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is reminiscing about the past with {actor.1}, sharing stories and memories in a friendly conversation.',
        ],
      },
      mixer_social_LovingHug: {
        pre_actions: [
          '{actor.0} is lovingly embracing {actor.1} in a warm hug.',
        ],
      },
      mixer_social_AssertCorrectness_targeted_friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is confidently asserting their correctness to {actor.1}, in a friendly manner.',
        ],
      },
      mixer_social_MendDifferences_targeted_friendly_alwaysOn: {
        pre_actions: ['{actor.0} is mending any differences with {actor.1}.'],
      },
      mixer_social_TeachAboutResponsibility_Targeted_Friendly_AlwaysOn_Responsible:
        {
          pre_actions: [
            '{actor.0} is taking the time to teach {actor.1} about responsibility in a friendly and targeted manner.',
          ],
        },
      mixer_social_WhineAboutGrounding_targeted_friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is complaining to {actor.1} about being grounded, hoping for sympathy or leniency.',
        ],
      },
      mixer_social_SincereApology_targeted_friendly_lowScore: {
        pre_actions: ['{actor.0} is sincerely apologizing to {actor.1}.'],
      },
      mixer_social_FamilyBulletinBoard_WhineAboutCurfew: {
        pre_actions: [
          '{actor.0} is complaining to {actor.1} about their curfew, expressing their frustration.',
        ],
      },
      mixer_UnempatheticSocials_MockMood: {
        pre_actions: [
          "{actor.0} is laughing at {target's} embarrassment, displaying an unempathetic behavior.",
        ],
      },
      mixer_UnempatheticSocials_ScoffMood: {
        pre_actions: [
          '{actor.0} is belittling {actor.1} in a fit of anger, showing no empathy for their feelings. {actor.0} is scoffing at {actor.1}.',
        ],
      },
      mixer_social_OtherSims_FixBadRelationship: {
        pre_actions: [
          '{actor.0} is intervening to help fix the strained relationship between {actor.1} and another Sim.',
        ],
      },
      mixer_social_ChildhoodPhases_EncourageEating_targeted_Friendly: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1} about encouraging better eating habits, especially during childhood phases.',
        ],
      },
      mixer_social_BlameForSchoolProjectDestruction_Targeted_Mean_AlwaysOn: {
        pre_actions: [
          '{actor.0} is confronting {actor.1} and blaming them for the destroyed school project in a mean-spirited manner.',
        ],
      },
      mixer_social_MakeFunnyFaces: {
        pre_actions: ['{actor.0} is making funny faces at {actor.1}.'],
      },
      mixer_social_ShareSecret_targeted_Friendly_HighScore_ChildhoodPhase_Clingy:
        {
          pre_actions: [
            '{actor.0} is sharing a secret with {actor.1}, as part of their friendly interaction. The content of the secret may be related to their childhood phase or it could be something that {actor.0} is finding clingy.',
          ],
        },
      mixer_social_TakePictureTogether_targeted_Friendly_alwaysOn_ChildhoodPhase_Clingy:
        {
          pre_actions: [
            '{actor.0} is asking {actor.1} if they want to take a picture together. They are both striking a friendly pose, capturing a sweet moment of their childhood phase. {actor.0} is seeming a bit clingy, wanting to hold onto this memory tightly.',
          ],
        },
      mixer_social_LovingHug_ChildhoodPhase_Clingy: {
        pre_actions: [
          '{actor.0} is giving {actor.1} a loving hug, reminiscent of their childhood phase when they were especially clingy.',
        ],
      },
      mixer_social_Hug_targeted_Friendly_MiddleScore_ChildhoodPhase_Clingy: {
        pre_actions: [
          '{actor.0} is giving {actor.1} a warm hug, showing their friendly and clingy nature, especially during their childhood phase.',
        ],
      },
      mixer_social_BackInMyDay_targeted_friendly_alwaysOn_ParentOnly: {
        pre_actions: [
          '{actor.0} is affectionately reminiscing about the past, sharing stories and experiences with {actor.1} in a friendly manner. This interaction is being exclusively shared between parents.',
        ],
      },
      mixer_social_BlameForSchoolProjectDestruction_Targeted_Mean_AlwaysOn_toddler:
        {
          pre_actions: [
            '{actor.0} is confronting {actor.1} and blaming them for destroying the school project, using mean and targeted language.',
          ],
        },
      mixer_Argument_Start_Curfew: {
        pre_actions: [
          '{actor.0} and {actor.1} are getting into a heated argument about curfew.',
        ],
      },
      mixer_social_MakeFunnyFaces_Toddler: {
        pre_actions: ['{actor.0} making funny faces with {actor.1}.'],
      },
      mixer_social_DiscussAncientHistory_targeted_Friendly_ArchaeologySkill: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1} about ancient history, showcasing their knowledge in archaeology skill.',
        ],
      },
      mixer_TellFolkTale_Loop: {
        pre_actions: [
          '{actor.0} is gathering a group around {actor.1} and is beginning to tell a captivating Omiscan folk tale, mesmerizing them with the enchanting story.',
        ],
      },
      mixer_TellFolkTale_Listen: {
        pre_actions: [
          '{actor.0} is telling an Omiscan folk tale to {actor.1}, who is listening intently.',
        ],
      },
      mixer_TellFolkTale_Waiting: {
        pre_actions: [
          '{actor.0} is waiting for an audience to share a captivating folk tale.',
        ],
      },
      mixer_social_CraftSalesTable_Purchase_ArchaeologyTable: {
        pre_actions: [
          '{actor.0} is purchasing an Archaeology Table to craft sales items.',
        ],
      },
      mixer_social_AirKissCheekIntroduction: {
        pre_actions: [
          '{actor.0} is warmly greeting {actor.1} with an air kiss on the cheek, signaling their introduction.',
        ],
      },
      mixer_social_CraftSalesTable_AskAboutNewStock: {
        pre_actions: [
          '{actor.0} is asking {actor.1} about the new stock at the Craft Sales Table.',
        ],
      },
      mixer_social_CraftSalesTable_Purchase_JungleSupplies: {
        pre_actions: [
          '{actor.0} is visiting the Craft Sales Table to purchase Jungle Supplies.',
        ],
      },
      mixer_Social_Investigation_Act1_QuestionAboutLab: {
        pre_actions: [
          '{actor.0} is requesting evidence from {actor.1} about the secret lab for their investigation.',
        ],
      },
      mixer_Social_Investigation_Act1_RequestKeycard: {
        pre_actions: [
          '{actor.0} is politely asking {actor.1} to borrow a keycard for an investigation.',
        ],
      },
      mixer_Social_Investigation_Act1_QuestionAboutBase: {
        pre_actions: [
          '{actor.0} is requesting evidence from the military base for their investigation.',
        ],
      },
      mixer_Social_Investigation_Act1_ShareConspiracyTheories: {
        pre_actions: [
          '{actor.0} is excitedly sharing conspiracy theories with {actor.1}, hoping to engage them in an investigation into these mysterious theories.',
        ],
      },
      mixer_Social_Investigation_Act1_QuestionAboutMilitaryOperations: {
        pre_actions: [
          '{actor.0} is requesting evidence from {actor.1} about the StrangerVille mystery and inquiring about the military operations in Act 1.',
        ],
      },
      mixer_Social_Investigation_AllActs_AskAboutStrangerville: {
        pre_actions: [
          '{actor.0} is engaging in a social conversation with {actor.1} to investigate the mysteries of StrangerVille and is asking about the strange happenings in town.',
        ],
      },
      mixer_Social_Investigation_Act2_TalkAboutSpores: {
        pre_actions: [
          '{actor.0} is discussing spores with {actor.1} in the lab.',
        ],
      },
      mixer_Social_Investigation_Act2_AskToCraftFilter: {
        pre_actions: [
          '{actor.0} is requesting {actor.1} to craft a Spore Filter for an investigation.',
        ],
      },
      mixer_Social_Investigation_Act2_SeduceForScanner: {
        pre_actions: [
          '{actor.0} is attempting to seduce {actor.1} as part of an investigation for the infection scanner.',
        ],
      },
      mixer_Social_Investigation_Act2_PullRank: {
        pre_actions: [
          '{actor.0} is pulling rank on {actor.1} in order to request their assistance with the investigation and use their infection scanner.',
        ],
      },
      mixer_Social_Investigation_Act3_Recruit: {
        pre_actions: [
          '{actor.0} is recruiting {actor.1} for the fight against the Mother Plant.',
        ],
      },
      mixer_Social_Possessed_ChatP2P_MakeHumanSound: {
        pre_actions: [
          '{actor.0} is moving their lips to make human sounds while chatting with {actor.1}.',
        ],
      },
      mixer_Social_Possessed_ChatP2N_TalkAboutPlants: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1} about plants.',
        ],
      },
      mixer_Social_Possessed_ChatP2N_PraisetheMother: {
        pre_actions: [
          '{actor.0} is engaging in a possessed chat with {actor.1} and is praising the Great Mother.',
        ],
      },
      mixer_Social_Possessed_ChatP2N_EnthuseHumanHobbies: {
        pre_actions: [
          '{actor.0} is engaging in a possessed chat with {actor.1}, enthusing about various human hobbies.',
        ],
      },
      mixer_Social_Possessed_ChatP2N_ComplainHumanProblems: {
        pre_actions: [
          '{actor.0} is engaging in a chat with {actor.1} and is beginning to complain about everyday human issues they are facing.',
        ],
      },
      mixer_Social_Possessed_ChatP2N_DiscussHumanThings: {
        pre_actions: [
          '{actor.0} is engaging {actor.1} in a social conversation, discussing various human topics and exchanging thoughts.',
        ],
      },
      mixer_Social_Possessed_ChatP2P_EnthuseMotherPlant: {
        pre_actions: [
          '{actor.0} is engaging in a conversation with {actor.1} to discuss The Great Mother, both being possessed and enthusing about the Mother Plant.',
        ],
      },
      mixer_Social_Possessed_ChatP2P_ConfessFearOfHumans: {
        pre_actions: [
          '{actor.0} is confessing their fear of humans with {actor.1}.',
        ],
      },
      mixer_Social_Possessed_ChatP2P_EmulateHumanLaugh: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a possessed chat, where they both are trying to emulate human laughter.',
        ],
      },
      mixer_Social_Possessed_ChatP2P_Chat: {
        pre_actions: ['{actor.0} is chatting wwith {actor.1}.'],
      },
      mixer_Social_Investigation_Act1_GiveKeycard: {
        pre_actions: [
          '{actor.0} is discreetly passing a secret lab keycard to {actor.1} as part of their ongoing investigation in Act 1.',
        ],
      },
      mixer_Social_Investigation_Act2_FightForScanner: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a heated argument over who gets to use the infection scanner.',
        ],
      },
      mixer_social_AccuseOfSpying: {
        pre_actions: [
          '{actor.0} is confronting {actor.1} and accusing them of spying on them.',
        ],
      },
      mixer_social_ShareConspiracyTheories: {
        pre_actions: [
          '{actor.0} is excitedly sharing a wild conspiracy theory with {actor.1}.',
        ],
      },
      mixer_Social_Investigation_Act2_ImpressWithPhysicalProwess: {
        pre_actions: [
          '{actor.0} is trying to impress {actor.1} by showing off their physical prowess, in order to demonstrate their capabilities for the Infection Scanner investigation.',
        ],
      },
      mixer_Social_MilitaryCareer_Salute: {
        pre_actions: [
          '{actor.0} is saluting {actor.1} as a sign of respect, reflecting their military career.',
        ],
      },
      mixer_Social_MilitaryCareer_Recruit: {
        pre_actions: ['{actor.0} is recruiting {actor.1} into the military.'],
      },
      mixer_Social_MilitaryCareer_Spar: {
        pre_actions: [
          '{actor.0} is challenging {actor.1} to a friendly spar, testing their combat skills.',
        ],
      },
      mixer_Social_MilitaryCareer_OrderTo_DropAndGive20: {
        pre_actions: [
          '{actor.0} is giving a military order to {actor.1} to drop and give them 20 push-ups.',
        ],
      },
      mixer_Social_MilitaryCareer_OrderTo_RunALap: {
        pre_actions: [
          '{actor.0} is giving {actor.1} the order to run a lap as part of their military career training.',
        ],
      },
      mixer_Social_MilitaryCareer_OrderTo_Attention: {
        pre_actions: [
          '{actor.0} is calling out to {actor.1}, commanding them to pay attention immediately.',
        ],
      },
      mixer_Social_MilitaryCareer_OrderTo_CleanThisPlaceUp: {
        pre_actions: [
          '{actor.0} is instructing {actor.1}, who is in the military career, to clean up the place.',
        ],
      },
      mixer_Social_MilitaryCareer_OrderTo_Spar: {
        pre_actions: [
          '{actor.0} is challenging {actor.1} to a friendly spar, in order to test their combat skills.',
        ],
      },
      mixer_Social_MilitaryCareer_ShareWarStories: {
        pre_actions: [
          '{actor.0} and {actor.1}, both with military careers, are engaging in a conversation and sharing war stories.',
        ],
      },
      mixer_Social_MilitaryCareer_Spar_NoTests: {
        pre_actions: [
          '{actor.0} is engaging in a spar with {actor.1} as part of their military career, without any tests involved.',
        ],
      },
      mixer_social_BragAboutBeatingMotherPlant: {
        pre_actions: [
          '{actor.0} is excitedly telling a story to {actor.1} about their epic victory over the Mother Plant.',
        ],
      },
      mixer_Social_MilitaryCareer_Interrogate: {
        pre_actions: [
          '{actor.0} is questioning {actor.1} with a serious tone, as part of their military career training.',
        ],
      },
      mixer_Social_MilitaryCareer_GiveInspirationalSpeech: {
        pre_actions: [
          '{actor.0} is giving an inspirational speech to motivate {actor.1} in their military career.',
        ],
      },
      mixer_Social_Investigation_Act1_QuestionAboutBaseOrLab: {
        pre_actions: [
          '{actor.0} is questioning {actor.1} about the military base to gather information for an investigation.',
        ],
      },
      mixer_Social_Investigation_Act3_Recruit_DisplayOnly: {
        pre_actions: [
          "{actor.0} is investigating {actor.1}'s skills and abilities for potential recruitment against the Mother Plant.",
        ],
      },
      mixer_Social_Investigation_Act2_BribeForScanner: {
        pre_actions: [
          '{actor.0} is attempting to bribe {actor.1} in order to obtain a scanner for their investigation in Act 2.',
        ],
      },
      mixer_social_MilitaryIntroduction_greetings: {
        pre_actions: [
          '{actor.0}, in their military uniform, is formally introducing and greeting {actor.1}.',
        ],
      },
      mixer_social_Fight_targeted_mean_PunchableFace: {
        pre_actions: [
          '{actor.0} is confronting {actor.1}, ready to fight and exchange punches due to a mean comment or appearance that provoked them.',
        ],
      },
      mixer_social_Fight_targeted_SummonGhost_Fail: {
        pre_actions: [
          '{actor.0} is trying to start a fight with {actor.1}, but is failing to summon a ghost.',
        ],
      },
      mixer_Socials_WitchPerks_Socialite_EnthuseAboutMagic: {
        pre_actions: [
          '{actor.0} is excitedly talking to {actor.1} about magic, sharing their enthusiasm for all things witchy.',
        ],
      },
      mixer_Socials_WitchPerks_Socialite_DiscussOverchargeRisks: {
        pre_actions: [
          '{actor.0}, a Witch, is engaging in a conversation with {actor.1} to discuss the risks of overcharging spells.',
        ],
      },
      mixer_Socials_WitchPerks_Socialite_TalkAboutPotionMishaps: {
        pre_actions: [
          '{actor.0}, a witch with Socialite perks, is engaging in a conversation with {actor.1} to discuss their various mishaps with potions.',
        ],
      },
      mixer_Social_WitchOccult_MagicTraining_Offer: {
        pre_actions: [
          '{actor.0} is offering {actor.1} magical training, recognizing their interest in the occult and knowledge of magic.',
        ],
      },
      mixer_Social_WitchOccult_MagicTraining_Request: {
        pre_actions: [
          '{actor.0} is asking {actor.1} an experienced witch, for magical training.',
        ],
      },
      mixer_Social_WitchOccult_RiteOfDissolution_Request: {
        pre_actions: [
          '{actor.0} is asking {actor.1} for the Rite of Dissolution.',
        ],
      },
      mixer_Social_WitchOccult_RiteOfAscension_Request: {
        pre_actions: [
          '{actor.0} is asking {actor.1} about the Rite of Ascension.',
        ],
      },
      mixer_Social_WitchOccult_RiteOfAscension_Offer: {
        pre_actions: [
          '{actor.0} is offering {actor.1} the Rite of Ascension, a special ritual known only to witches in the occult community.',
        ],
      },
      mixer_Sabacc_Cheat: {
        pre_actions: [
          '{actor.0} is attempting to cheat at a game of Sabacc with {actor.1}.',
        ],
      },
      mixer_social_Batuu_Reputation_EnthuseAbout_CrushingResistance: {
        pre_actions: [
          '{actor.0} is excitedly talking to {actor.1} about their reputation on Batuu and is enthusing about crushing the resistance.',
        ],
      },
      mixer_social_Batuu_Reputation_EnthuseAbout_StoppingFirstOrder: {
        pre_actions: [
          '{actor.0} is excitedly talking to {actor.1} about their reputation and their shared goal of stopping the First Order.',
        ],
      },
      mixer_social_Batuu_Reputation_EnthuseAbout_GalacticSkimmers: {
        pre_actions: [
          '{actor.0} is excitedly talking to {actor.1} about Galactic Credit Skimmers, showcasing their knowledge of Batuu and trying to impress them with their enthusiasm for the topic.',
        ],
      },
      mixer_social_Batuu_Reputation_TellTalesofGalacticConquest: {
        pre_actions: [
          '{actor.0} is excitedly sharing stories of their exploits in galactic conquest with {actor.1}, hoping to build their reputation and impress them.',
        ],
      },
      mixer_social_Batuu_Reputation_TellTalesofSmuggling: {
        pre_actions: [
          '{actor.0} is sharing exciting stories of smuggling with {actor.1}, using their Batuu reputation to capture their interest.',
        ],
      },
      mixer_social_Batuu_Reputation_TellTalesOfGalacticAdventure: {
        pre_actions: [
          '{actor.0} is excitedly recounting thrilling tales of their adventures on Batuu to {actor.1}, hoping to impress them and enhance their own reputation.',
        ],
      },
      mixer_social_Batuu_Reputation_HatchElaboratePlan: {
        pre_actions: [
          '{actor.0} and {actor.1} are hatching an elaborate plan together to improve their reputation on Batuu.',
        ],
      },
      mixer_social_Batuu_Reputation_Recruit_FirstOrder: {
        pre_actions: [
          '{actor.0} is trying to convince {actor.1} to enlist in the First Order, leveraging their reputation on Batuu as a recruit.',
        ],
      },
      mixer_social_Batuu_Reputation_Recruit_Resistance: {
        pre_actions: [
          '{actor.0} is passionately speaking to {actor.1}, urging them to join the Resistance in Batuu.',
        ],
      },
      mixer_Social_Batuu_Hondo_DiscussShippingCompany: {
        pre_actions: [
          '{actor.0} is engaging in a conversation with {actor.1} about a legitimate shipping company, possibly involving Hondo, on Batuu.',
        ],
      },
      mixer_Social_Batuu_Hondo_AskAboutMissingCredits: {
        pre_actions: ['{actor.0} is asking {actor.1} about missing credits.'],
      },
      mixer_Social_Batuu_Vi_Distraction: {
        pre_actions: [
          '{actor.0} is attempting to distract {actor.1} while visiting Batuu to divert their attention from something.',
        ],
      },
      mixer_Social_Batuu_Vi_ShareRumors: {
        pre_actions: [
          '{actor.0} is sharing some interesting rumors that they overheard on Batuu with {actor.1}.',
        ],
      },
      mixer_Social_Batuu_Vi_DiscussStrategy: {
        pre_actions: [
          '{actor.0} and {actor.1}, both from Batuu Vi, are discussing their recruitment strategy.',
        ],
      },
      mixer_Social_Batuu_Vi_DiscussFO: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a social conversation, discussing the movements of the First Order on Batuu.',
        ],
      },
      mixer_Social_Batuu_Agnon_DiscussIndividuals: {
        pre_actions: [
          '{actor.0} is engaging in a social conversation with {actor.1} about suspicious individuals they are encountering on Batuu, specifically discussing Agnon.',
        ],
      },
      mixer_Social_Batuu_Agnon_QuestionLoyalty: {
        pre_actions: [
          '{actor.0} is engaging in a conversation with {actor.1} on Batuu, asking about their loyalty.',
        ],
      },
      mixer_Social_Batuu_Agnon_DebateLocation: {
        pre_actions: [
          '{actor.0} is engaging in a social debate with {actor.1} on the Batuu planet, discussing the location of the Resistance base.',
        ],
      },
      mixer_social_Fight_targeted_Intimidate_For_Info: {
        pre_actions: [
          '{actor.0} is confronting {actor.1} in a heated argument, attempting to intimidate them into revealing information.',
        ],
      },
      mixer_Social_Batuu_SNPC_Kylo_QuestionLoyalty: {
        pre_actions: ['{actor.0} is questioning the loyalty of Kylo.'],
      },
      mixer_social_Fight_targeted_CheckID_CriminalFight: {
        pre_actions: [
          '{actor.0} is confronting {actor.1} in a heated argument, resulting in a physical fight.',
        ],
      },
      mixer_social_Fight_targeted_mean_SabaccCheater: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a heated fight after suspecting {actor.1} of cheating during a game of Sabacc.',
        ],
      },
      mixer_social_Fight_Batuu_Inspection_ActorIsFO: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a fight, using batuus as weapons. It appears that the fight is part of an inspection and the initiator might be an actor portraying a character.',
        ],
      },
      mixer_social_Batuu_Mission_RS7_Fight_For_FirstOrder_Uniform: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in an intense fight for the First Order uniform during the Batuu Mission RS7.',
        ],
      },
      mixer_Social_Batuu_Mission_ShareTalesOfMisdeeds_SS10: {
        pre_actions: [
          '{actor.0} is sharing tales of their misdeeds with {actor.1}, recounting their adventures during a Batuu mission.',
        ],
      },
      mixer_social_Batuu_Mission_SS17_Fight_For_Valuable_Information: {
        pre_actions: [
          '{actor.0} is confronting {actor.1} in a heated argument, desperately trying to extract valuable information for their Batuu mission.',
        ],
      },
      mixer_social_Fight_targeted_Rich_Scoundrel_Valuable: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a heated fight over a valuable item, as both Sims are rich scoundrels.',
        ],
      },
      mixer_social_Fight_targeted_mean_RecruitToFO_ResistanceTarget_FR3: {
        pre_actions: [
          '{actor.0} is fighting with {actor.1}, using mean tactics in an attempt to recruit them to the Freelancer Resistance Faction.',
        ],
      },
      mixer_social_WooHooDwelling_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are sneaking off to a private place in the dwelling to engage in a romantic encounter, taking their relationship to the next level.',
        ],
      },
      mixer_social_Fight_targeted_mean_FS6_IntimidateFight: {
        pre_actions: [
          '{actor.0} is aggressively confronting {actor.1} in a heated exchange, attempting to intimidate them into submission.',
        ],
      },
      mixer_social_Fight_targeted_mean_FS4_ThreatenArrest: {
        pre_actions: [
          '{actor.0} and {actor.1} are getting into a heated argument and are ending up in a physical fight. {actor.0} is threatening {actor.1} with arrest.',
        ],
      },
      mixer_Social_Batuu_EnthuseAbout_Droids: {
        pre_actions: [
          '{actor.0} is excitedly talking to {actor.1} about their love for droids on Batuu.',
        ],
      },
      mixer_Social_Batuu_EnthuseAbout_Wookiees: {
        pre_actions: [
          '{actor.0} is engaging in a conversation with {actor.1} about Wookiees, expressing enthusiasm and interest in the topic.',
        ],
      },
      mixer_Social_Batuu_EnthuseAbout_Lightsabers: {
        pre_actions: [
          '{actor.0} is excitedly talking to {actor.1} about Lightsabers, expressing their love and enthusiasm for them, particularly during their visit to Batuu.',
        ],
      },
      mixer_Social_Batuu_EnthuseAbout_Batuu: {
        pre_actions: [
          '{actor.0} is excitedly talking to {actor.1} about their recent trip to Batuu, enthusing about their experiences on the planet.',
        ],
      },
      mixer_Social_Batuu_EnthuseAbout_Sabacc: {
        pre_actions: [
          '{actor.0} and {actor.1} are chatting about Sabacc, enthusiastically discussing their favorite strategies and experiences on Batuu.',
        ],
      },
      mixer_Social_Batuu_EnthuseAbout_TheForce: {
        pre_actions: [
          '{actor.0} is engaging in a conversation with {actor.1} about The Force, expressing enthusiasm and sharing knowledge about it.',
        ],
      },
      mixer_Social_Batuu_EnthuseAbout_Datapads: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a social conversation about Datapads, expressing enthusiasm and sharing knowledge about this topic on Batuu.',
        ],
      },
      mixer_Social_Batuu_EnthuseAbout_Starships: {
        pre_actions: [
          '{actor.0} and {actor.1} are chatting animatedly about Starfighters on Batuu, passionately discussing their favorite starships and their features.',
        ],
      },
      mixer_social_BrightenDay_targeted_friendly_emotionSpecific_Batuu_SNPC: {
        pre_actions: [
          '{actor.0} is performing a friendly gesture to {actor.1} in an effort to brighten their day, like those interactions with Batuu Star Wars non-playable characters (SNPCs).',
        ],
      },
      mixer_social_DeclareEnemy_targeted_mean_relationship_Batuu_SNPC: {
        pre_actions: [
          '{actor.0} is declaring {actor.1} as their enemy, solidifying their mean relationship. This interaction is taking place in Batuu with an SNPC.',
        ],
      },
      mixer_social_SuggestBoldHomeMakeoverIdeas_targeted_Friendly_alwaysOn_career_InteriorDecorator:
        {
          pre_actions: [
            '{actor.0}, who is an Interior Decorator, is friendly suggesting some bold home makeover ideas to {actor.1}.',
          ],
        },
      mixer_social_DiscussLatestTrends_targeted_Friendly_alwaysOn_career_InteriorDecorator:
        {
          pre_actions: [
            '{actor.0} is engaging in a friendly conversation with {actor.1} about the latest trends, particularly in the field of interior decorating.',
          ],
        },
      mixer_social_DiscussLatestTrends_targeted_Friendly_alwaysOn_career_InteriorDecorator_Interview:
        {
          pre_actions: [
            '{actor.0} is engaging in a friendly conversation with {actor.1} to discuss the latest trends in the interior decorating industry, as part of an interview.',
          ],
        },
      mixer_social_SuggestBoldHomeMakeoverIdeas_targeted_Friendly_alwaysOn_career_InteriorDecorator_Interview:
        {
          pre_actions: [
            '{actor.0} is excitedly suggesting bold home makeover ideas to {actor.1}, sharing their expertise as an interior decorator during a friendly conversation, possibly for an interview.',
          ],
        },
      mixer_social_UnflirtyTrait_GiveColdShoulder_Targeted_Mean_AlwaysOn: {
        pre_actions: [
          '{actor.0}, who has the Unflirty trait, is intentionally ignoring {actor.1} and giving them the cold shoulder as a mean gesture.',
        ],
      },
      mixer_social_UnflirtyTrait_ReprimandPublicIntimacy_Targeted_Mean_AlwaysOn:
        {
          pre_actions: [
            '{actor.0}, with their unflirty trait, is reprimanding {actor.1} for engaging in public intimacy.',
          ],
        },
      mixer_social_MakeSmallTalk_targeted_Friendly_alwaysOn: {
        pre_actions: ['{actor.0} is engaging in small talk with {actor.1}.'],
      },
      mixer_PerformanceSpace_solicitTip: {
        pre_actions: [
          '{actor.0} is soliciting tips from {actor.1} for their performance.',
        ],
      },
      mixer_social_AskAboutCulturalFoods_targeted_Friendly: {
        pre_actions: [
          '{actor.0} is asking {actor.1} about local cuisine and is showing a friendly interest in learning more about different cultural foods.',
        ],
      },
      mixer_social_RecommendLocalBar_friendly_NT: {
        pre_actions: [
          '{actor.0} is suggesting to {actor.1} that they should check out a local bar together, in a friendly and non-threatening manner.',
        ],
      },
      mixer_social_ComplainAboutLoudNoises_targeted_Mean_alwaysOn_apartmentNeighbor:
        {
          pre_actions: [
            '{actor.0} is angrily complaining to {actor.1} about the loud noises they are making as a neighbor.',
          ],
        },
      mixer_social_RecommendLocalMuseum_friendly_NT: {
        pre_actions: [
          '{actor.0} is recommending a local museum to {actor.1}, while engaging in a friendly conversation.',
        ],
      },
      mixer_social_RecommendLocalClub_friendly_NT: {
        pre_actions: [
          '{actor.0} is suggesting to {actor.1} that they should check out a local nightclub. They are coming across as friendly and easygoing.',
        ],
      },
      mixer_social_RaveAboutFamousSingers_targeted_Friendly_alwaysOn_skills: {
        pre_actions: [
          '{actor.0} is excitedly raving to {actor.1} about their favorite singers.',
        ],
      },
      mixer_social_RecommendLocalRestaurant_friendly_NT: {
        pre_actions: [
          '{actor.0} is enthusiastically recommending a local restaurant to {actor.1} during a friendly conversation.',
        ],
      },
      mixer_social_Fight_targeted_ApartmentNeighborSituation_LoudNoises: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a heated argument, causing loud noises in their apartment neighbor situation.',
        ],
      },
      mixer_Shower_SingInShower: {
        pre_actions: ['{actor.0} is happily singing in the shower.'],
      },
      mixer_Social_Friendly_VideoGameConsole_Win2Win: {
        pre_actions: [
          '{actor.0} is excitedly talking to {actor.1} about winning a game on the video game console, engaging in a friendly conversation.',
        ],
      },
      mixer_Social_Friendly_VideoGameConsole_Win2Lose: {
        pre_actions: [
          '{actor.0} is excitedly telling {actor.1} about their recent win in a video game, eager to share their victory.',
        ],
      },
      mixer_Social_Friendly_VideoGameConsole_Lose2Lose: {
        pre_actions: [
          '{actor.0} and {actor.1} are sitting down together on the couch, commiserating about their recent losses in the video game console tournament.',
        ],
      },
      mixer_Social_Friendly_VideoGameConsole_Lose2Win: {
        pre_actions: [
          '{actor.0} is congratulating {actor.1} on their joint victory on the video game console.',
        ],
      },
      mixer_social_Propose_targeted_romance_relationship_BlossomFestival: {
        pre_actions: [
          '{actor.0} is getting caught up in the heat of the moment during the Blossom Festival and is deciding to propose a romantic relationship to {actor.1}.',
        ],
      },
      mixer_social_MentionFlirtyVibe_Festival_Blossom_targeted_romance: {
        pre_actions: [
          '{actor.0} is mentioning the flirty festival vibe to {actor.1}, hinting at a potential romantic connection that is blooming between them.',
        ],
      },
      mixer_social_JokeGettingTogether_Festival_Blossom_targeted_romance: {
        pre_actions: [
          '{actor.0} is playfully joking with {actor.1} about them getting together, possibly during the Festival of Blossoms, adding a touch of romance to the conversation.',
        ],
      },
      mixer_social_FlirtyDream_Festival_Blossom_targeted_romance: {
        pre_actions: [
          '{actor.0} is sharing a flirty dream about {1.SimFirstName}, inspired by the festival and the essence of blossoming romance.',
        ],
      },
      mixer_social_HeatofMomentPassion_Festival_Blossom_targeted_romance: {
        pre_actions: [
          '{actor.0} is confessing their feelings to {actor.1} in the heat of the moment at the Festival of Blossom, igniting a passionate romance between them.',
        ],
      },
      mixer_bubbleBottle_BlowBubbles: {
        pre_actions: [
          '{actor.0} is taking out a bubble bottle and starting to blow bubbles in front of {actor.1}, hoping to create a playful and lighthearted atmosphere.',
        ],
      },
      mixer_social_BragCurryContest_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} excitedly brags to {actor.1} about being the reigning Curry Champion.',
        ],
      },
      mixer_social_AskAboutRomanticDestiny_targeted_Friendly_AlwaysOn_LoveGuru:
        {
          pre_actions: [
            '{actor.0} is asking {actor.1} about their romantic destiny, seeking guidance from a Love Guru.',
          ],
        },
      mixer_social_RequestGuruLoveWisdom_targeted_Friendly_AlwaysOn_LoveGuru: {
        pre_actions: [
          '{actor.0} is requesting wisdom and advice on love matters from {actor.1}, the Romance Guru.',
        ],
      },
      mixer_social_AskGuruAboutCurrentRelationship_targeted_Friendly_AlwaysOn_LoveGuru:
        {
          pre_actions: [
            '{actor.0} is asking Love Guru {actor.1} for advice on their current relationship.',
          ],
        },
      mixer_social_AskAboutRomanticDestiny_Targeted_Friendly_AlwaysOn_LoveGuru_Initiate:
        {
          pre_actions: [
            '{actor.0} is asking {actor.1} about their romantic destiny and seeking advice from the Love Guru.',
          ],
        },
      mixer_social_RequestGuruLoveWisdom_Targeted_Friendly_AlwaysOn_STC_LoveGuru_Initiate:
        {
          pre_actions: [
            "{actor.0} is seeking {actor.1}'s wisdom as a Love Guru.",
          ],
        },
      mixer_social_AskGuruAboutCurrentRelationship_Targeted_Friendly_AlwaysOn_STC_LoveGuru_Initiate:
        {
          pre_actions: [
            '{actor.0} is asking the Love Guru {actor.1} for advice on their current relationship.',
          ],
        },
      mixer_Social_RantAboutShow_Targeted_Friendly_AlwaysOn_STC_LogicFestival: {
        pre_actions: [
          '{actor.0} is ranting about the show with {actor.1} at the logic festival.',
        ],
      },
      mixer_Social_TalkAboutCosplayers_Targeted_Friendly_AlwaysOn_STC_LogicFestival:
        {
          pre_actions: [
            '{actor.0} is engaging in a friendly conversation with {actor.1}, discussing their admiration for cosplayers at the logic festival.',
          ],
        },
      mixer_Social_ArgueGif_Targeted_Friendly_AlwaysOn_STC_LogicFestival: {
        pre_actions: [
          "{actor.0} and {actor.1} are engaging in a heated argument about the pronunciation of 'Gif' during the Logic Festival event.",
        ],
      },
      mixer_Social_DebateAntBears_Targeted_Friendly_AlwaysOn_STC_LogicFestival:
        {
          pre_actions: [
            '{actor.0} is engaging in a friendly debate with {actor.1} about the hypothetical scenario of 1000 ant-sized bears versus 1 bear-sized ant, using logical arguments. This is taking place at a logic festival.',
          ],
        },
      mixer_Socials_JokeAboutPi_Targeted_Funny_AlwaysOn_STC_LogicFestival: {
        pre_actions: [
          '{actor.0} is telling a hilarious joke about Pi to {actor.1} during the Logic Festival.',
        ],
      },
      mixer_Socials_JokeAboutRocketWoohoo_Targeted_Funny_AlwaysOn_STC_LogicFestival:
        {
          pre_actions: [
            '{actor.0} is playfully telling a hilarious joke to {actor.1} about sex on a rocket ship.',
          ],
        },
      mixer_social_Career_Activist_MakeEmptyPromises_alwaysOn: {
        pre_actions: [
          '{actor.0} making empty promises as an activist to {actor.1}.',
        ],
      },
      mixer_Social_SelfieWithCosplayer_Targeted_Friendly_AlwaysOn_STC_LogicFestival:
        {
          pre_actions: [
            '{actor.0} is asking {actor.1} the cosplayer if they can take a selfie together.',
          ],
        },
      mixer_social_GossipSakuraTea_Festival_Blossom_targeted_friendly: {
        pre_actions: [
          '{actor.0} is excitedly sharing some gossip with {actor.1} about the effects of Sakura Tea at the festival. They are engaging in a friendly conversation about the blossoms and the positive effects of the tea.',
        ],
      },
      mixer_social_Festival_Blossom_TransitionToIntimate_Sleaze_KissCheek: {
        pre_actions: [
          "{actor.0} is leaning in and planting a gentle kiss on {actor.1}'s cheek during the festival, a sweet gesture that is signaling a transition to a more intimate level of the relationship.",
        ],
      },
      mixer_social_Festival_Blossom_TransitionToIntimate_Sleaze_DipKiss: {
        pre_actions: [
          '{actor.0} and {actor.1} are sharing an intimate moment at the festival by exchanging a sweet and romantic kiss, allowing their relationship to transition to a more intimate level.',
        ],
      },
      mixer_social_Festival_Blossom_TransitionToIntimate_Sleaze_Whisper: {
        pre_actions: [
          '{actor.0} is leaning close to {actor.1} during the festival, whispering sweet nothings in their ear.',
        ],
      },
      mixer_social_Festival_Blossom_TransitionToIntimate_Sleaze_ShowGuns: {
        pre_actions: [
          '{actor.0} is attending the Festival of Blossom and flirting with {actor.1} in a somewhat sleazy manner, showcasing their impressive gun handling skills.',
        ],
      },
      mixer_DogLoverTrait_EnthuseAboutDogs: {
        pre_actions: [
          '{actor.0}, who has the Dog Lover trait, is excitedly talking to {actor.1} about dogs and sharing their love for them.',
        ],
      },
      mixer_CatLoverTrait_EnthuseAboutCats: {
        pre_actions: [
          '{actor.0}, who has the Cat Lover trait, is enthusiastically talking to {actor.1} about cats.',
        ],
      },
      mixer_DogLoverTrait_ShareLoveOfDogs: {
        pre_actions: [
          '{actor.0} is excitedly telling {actor.1} about their love for dogs, bonding over their shared passion.',
        ],
      },
      mixer_CatLoverTrait_ShareLoveOfCats: {
        pre_actions: [
          '{actor.0}, possessing the Cat Lover trait, is sharing their love of cats with {actor.1}, discussing their favorite breeds and funny cat videos.',
        ],
      },
      mixer_Social_Targeted_PetToPet_Greeting_Hostile: {
        pre_actions: ['{actor.0} is greeting {actor.1} in a hostile manner.'],
      },
      mixer_Dog_Training_Human_Heel: {
        pre_actions: [
          'The human is instructing the dog to walk beside them, using the command "heel."',
        ],
      },
      mixer_Dog_Training_Human_Sit: {
        pre_actions: [
          '{actor.0} is commanding {actor.1} to sit during a dog training session.',
        ],
      },
      mixer_Dog_Training_Human_Speak: {
        pre_actions: [
          '{actor.0} is training the dog to respond to verbal commands by teaching it to speak on command.',
        ],
      },
      mixer_Dog_Training_Human_LieDown: {
        pre_actions: [
          '{actor.0} is commanding {actor.1} to lie down as part of dog training.',
        ],
      },
      mixer_Dog_Training_Human_RollOver: {
        pre_actions: [
          'The human is commanding the dog to roll over and the dog is obediently performing the trick.',
        ],
      },
      mixer_Dog_Training_Human_Fetch: {
        pre_actions: [
          '{actor.0} is throwing a ball and instructing {actor.1} to fetch it as part of their dog training.',
        ],
      },
      mixer_Dog_Training_Human_PlayDead: {
        pre_actions: [
          'The human is instructing the dog to play dead during a training session.',
        ],
      },
      mixer_Dog_Training_Human_Shake: {
        pre_actions: ['{actor.0} is teaching {actor.1} how to do a shake.'],
      },
      mixer_Social_Targeted_PetToPet_Greeting_Friendly: {
        pre_actions: ['{actor.0} is greeting {actor.1} in a friendly manner.'],
      },
      mixer_Social_Targeted_PetToPet_Greeting_Neutral: {
        pre_actions: ['{actor.0} is greeting {actor.1}.'],
      },
      mixer_Dog_Training_Human_Shake_Command: {
        pre_actions: [
          "{actor.0} is training {actor.1} to shake hands using the command 'shake'.",
        ],
      },
      mixer_Dog_Training_Human_Practice: {
        pre_actions: [
          '{actor.0} is engaging in dog training with {actor.1}, practicing tricks and commands.',
        ],
      },
      mixer_social_IntroDog_greetings: {
        pre_actions: [
          '{actor.0} is introducing {2.SimFirstName} to {actor.1} by allowing them to exchange friendly greetings.',
        ],
      },
      mixer_social_WooHooLighthouse_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are sneaking off to the lighthouse for a romantic encounter and a transition into a new level of intimacy.',
        ],
      },
      mixer_social_TryForBabyLighthouse_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are sneaking off to the lighthouse for a romantic moment, hoping to try for a baby.',
        ],
      },
      mixer_Dog_Training_Human_Shake_Demo: {
        pre_actions: [
          '{actor.0} is teaching {actor.1} how to shake hands as a demonstration of dog training.',
        ],
      },
      mixer_Social_Friendly_DeclareTemperaturePreference_Cool: {
        pre_actions: [
          '{actor.0} is expressing their preference for cool temperatures to {actor.1}, in a friendly conversation.',
        ],
      },
      mixer_Social_Friendly_DeclareTemperaturePreference_Warm: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1}, expressing their preference for warmer temperatures.',
        ],
      },
      mixer_Social_Friendly_DeclareTemperaturePreference_None: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1}, without discussing any specific temperature preference.',
        ],
      },
      mixer_Social_Friendly_DeclareWeatherHate_Sun: {
        pre_actions: [
          '{actor.0} is expressing their annoyance to {actor.1} about the intense heat of the sun.',
        ],
      },
      mixer_Social_Friendly_DeclareWeatherHate_Wind: {
        pre_actions: [
          '{actor.0} is expressing their dislike for the wind to {actor.1} in a friendly manner.',
        ],
      },
      mixer_Social_Friendly_DeclareWeatherHate_Rain: {
        pre_actions: [
          '{actor.0} and {actor.1} are bonding over their dislike for rainy weather.',
        ],
      },
      mixer_Social_Friendly_DeclareWeatherHate_Snow: {
        pre_actions: [
          '{actor.0} is playfully throwing a snowball at {actor.1}, expressing their dislike for the snow.',
        ],
      },
      mixer_Social_Friendly_DeclareWeatherHate_None: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a friendly conversation, expressing their dislike for any particular weather.',
        ],
      },
      mixer_Social_Friendly_DeclareWeatherLove_None: {
        pre_actions: [
          '{actor.0} and {actor.1} are having a friendly conversation about their love for weather, without any particular weather in mind.',
        ],
      },
      mixer_Social_Friendly_DeclareWeatherLove_Rain: {
        pre_actions: [
          '{actor.0} and {actor.1} are enjoying the rain together, declaring their love for the weather.',
        ],
      },
      mixer_Social_Friendly_DeclareWeatherLove_Snow: {
        pre_actions: [
          '{actor.0} is declaring their love for the snow to {actor.1}.',
        ],
      },
      mixer_Social_Friendly_DeclareWeatherLove_Sun: {
        pre_actions: [
          '{actor.0} and {actor.1} are enjoying a friendly conversation under the warm sun, expressing their love for the beautiful weather.',
        ],
      },
      mixer_Social_Friendly_DeclareWeatherLove_Wind: {
        pre_actions: [
          '{actor.0} is embracing the windy weather and joyfully declaring their love for it to {actor.1}, engaging in a friendly conversation.',
        ],
      },
      mixer_social_Targeted_Friendly_TalkAboutClimateChange: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1} to talk about climate change.',
        ],
      },
      mixer_social_WeatherTemperatureSocials_TalkAboutWeather: {
        pre_actions: [
          '{actor.0} is engaging in a conversation with {actor.1} about the current weather.',
        ],
      },
      mixer_social_WeatherTemperatureSocials_TalkAboutTemperature: {
        pre_actions: [
          '{actor.0} is engaging in a conversation with {actor.1}, discussing the current temperature.',
        ],
      },
      mixer_social_WeatherTemperatureSocials_ComplainAboutRain: {
        pre_actions: ['{actor.0} is complaining to {actor.1} about the rain.'],
      },
      mixer_social_WeatherTemperatureSocials_ComplainAboutSnow: {
        pre_actions: [
          '{actor.0} is expressing their frustration about the snow to {actor.1}.',
        ],
      },
      mixer_social_WeatherTemperatureSocials_ComplainAboutCloudyWeather: {
        pre_actions: [
          '{actor.0} is complaining to {actor.1} about the cloudy weather.',
        ],
      },
      mixer_social_WeatherTemperatureSocials_ComplainAboutSunnyWeather: {
        pre_actions: [
          '{actor.0} is complaining to {actor.1} about the sunny weather.',
        ],
      },
      mixer_social_WeatherTemperatureSocials_ComplainAboutWindyWeather: {
        pre_actions: [
          '{actor.0} is grumbling to {actor.1} about the windy weather.',
        ],
      },
      mixer_social_WeatherTemperatureSocials_ComplainAboutThunderstorms: {
        pre_actions: [
          '{actor.0} is complaining to {actor.1} about the thunderstorms and is expressing their dislike for them.',
        ],
      },
      mixer_social_WeatherTemperatureSocials_ComplainAboutFreezingTemperature: {
        pre_actions: [
          '{actor.0} is complaining to {actor.1} about the freezing temperature and how cold it is.',
        ],
      },
      mixer_social_WeatherTemperatureSocials_ComplainAboutHotTemperature: {
        pre_actions: [
          '{actor.0} is expressing their frustration about the heat to {actor.1}, complaining about the hot temperature.',
        ],
      },
      mixer_social_WeatherTemperatureSocials_ComplainAboutBurningTemperature: {
        pre_actions: [
          '{actor.0} is complaining to {actor.1} about the heatwave and how hot it is.',
        ],
      },
      mixer_social_WeatherTemperatureSocials_HugOutCold: {
        pre_actions: [
          '{actor.0} is seeing that {actor.1} is feeling cold due to the weather and is offering a warm hug to help them feel better.',
        ],
      },
      mixer_social_WeatherTemperatureSocials_WarmUp: {
        pre_actions: [
          '{actor.0} is suggesting {actor.1} to warm up together with their body heat, given the weather and temperature.',
        ],
      },
      mixer_social_Fight_targeted_SurpriseHoliday_BattleRoyale: {
        pre_actions: [
          '{actor.0} and {actor.1} are unexpectedly engaging in a fierce battle, turning a holiday gathering into a surprise-filled battle royale.',
        ],
      },
      mixer_social_DiscussTVPremiere_Targeted_Friendly: {
        pre_actions: [
          '{actor.0} is engaging in a targeted and friendly conversation with {actor.1} to discuss the details of the season premiere of their favorite TV show.',
        ],
      },
      mixer_Social_TVPremiere_SpoilEpisode: {
        pre_actions: [
          '{actor.0} is excitedly talking to {actor.1} about the latest season premiere of a TV show, unknowingly spoiling the episode.',
        ],
      },
      mixer_social_Fight_targeted_SurpriseHoliday_BattleRoyale_Transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a surprise holiday battle royale, resulting in a fierce fight.',
        ],
      },
      mixer_social_WooHooInLeafPile_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a romantic WooHoo session in a leaf pile, transitioning from casual conversation to more intimate activities.',
        ],
      },
      mixer_social_TryForBabyInLeafPile_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are deciding to try for a baby together, while having a romantic interaction in a leaf pile.',
        ],
      },
      mixer_social_Mistletoe_kiss: {
        pre_actions: [
          '{actor.0} is trying to steal a kiss from {actor.1} under the mistletoe.',
        ],
      },
      mixer_Social_ShareResolution_targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is sharing a resolution with {actor.1}, fostering a friendly and social interaction.',
        ],
      },
      mixer_social_EnthuseAboutGardenerCareer_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is excitedly sharing their love for gardening with {actor.1}, discussing tips and tricks for a successful garden.',
        ],
      },
      mixer_social_Fight_targeted_mean_FatherWinter: {
        pre_actions: [
          '{actor.0} is engaging in a fierce battle with mean Father Winter, fighting for presents!',
        ],
      },
      mixer_BeeBox_Bond: {
        pre_actions: [
          '{actor.0} is spending time bonding with the bees in the BeeBox.',
        ],
      },
      mixer_BeeBox_MiteTreatment: {
        pre_actions: [
          '{actor.0} is applying mite treatment to the BeeBox to protect against mites.',
        ],
      },
      mixer_BeeBox_Disturb: {
        pre_actions: [
          '{actor.0} is accidentally disturbing the beebox, causing the bees to become agitated and swarm around {actor.1}.',
        ],
      },
      mixer_BeeBox_CollectSwarm: {
        pre_actions: [
          '{actor.0} is collecting a swarm of bees from the BeeBox.',
        ],
      },
      mixer_BeeBox_CollectHoney: {
        pre_actions: ['{actor.0} is collecting honey from the Bee Box.'],
      },
      mixer_social_Fight_targeted_mean_FlowerBunny: {
        pre_actions: [
          '{actor.0} is engaging in a heated battle with the mean Flower Bunny to claim the Easter eggs.',
        ],
      },
      mixer_BeeBox_SellHoney: {
        pre_actions: [
          '{actor.0} is harvesting honey from the BeeBox to sell to {actor.1}.',
        ],
      },
      mixer_social_AttemptIntroduction_greetings: {
        pre_actions: [
          '{actor.0} is trying to introduce themselves to {actor.1}, perhaps with a friendly greeting.',
        ],
      },
      mixer_social_FeudBringer_BeginFued_targered_mean_alwaysOn: {
        pre_actions: [
          '{actor.0} is deciding to start a celebrity feud with {actor.1}, targeting them with mean and provocative remarks.',
        ],
      },
      mixer_social_FeudBringer_BlameForFeud_targered_mean_alwaysOn: {
        pre_actions: [
          '{actor.0} is confronting {actor.1} and accusing them of being the one who started the feud.',
        ],
      },
      mixer_social_FeudBringer_EndFeud_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is declaring an end to the feud with {actor.1}.',
        ],
      },
      mixer_social_WooHooInWalkInSafe_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are sneaking into a walk-in safe filled with money, and are engaging in a passionate romance transition known as WooHoo.',
        ],
      },
      mixer_social_TryForBabyInWalkInSafe_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are sneaking into the walk-in safe, covering themselves in a pile of money and transitioning into a romantic moment, trying to conceive a baby.',
        ],
      },
      mixer_social_FamePerk_InstantBesties_FriendlyIntroduction_greetings: {
        pre_actions: [
          '{actor.0}, with their Fame Perk, is instantly becoming best friends with {actor.1} as they are warmly greeting each other.',
        ],
      },
      mixer_social_FamePerk_InstantBesties_RomanceIntroduction_greetings: {
        pre_actions: [
          '{actor.0} is using their fame perk to instantly become besties with {actor.1}, starting off with a romantic introduction and friendly greetings.',
        ],
      },
      mixer_MusicProductionStation_Remix: {
        ignored: true,
      },
      mixer_MusicProductionStation_Idle: {
        ignored: true,
      },
      mixer_MusicProductionStation_HeadphoneIdles: {
        ignored: true,
      },
      mixer_MusicProductionStation_BurnTrack: {
        ignored: true,
      },
      mixer_social_Squad_SaySomethingFunny_targered_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is asking {actor.1} to tell a joke to the squad, hoping to hear something funny.',
        ],
      },
      mixer_social_Squad_TalkMeDown_targered_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is using their friendly approach to talk {actor.1} down and provide support during a challenging situation.',
        ],
      },
      mixer_social_Squad_AskForCompliment_targered_Friendly_alwaysOn: {
        pre_actions: ['{actor.0} is asking {actor.1} for a compliment.'],
      },
      mixer_Social_LifestyleBrand_Enthuse: {
        pre_actions: [
          '{actor.0} is excitedly talking to {actor.1} about {2.String}, showing their enthusiasm for the lifestyle brand.',
        ],
      },
      mixer_Social_LifestyleBrand_Chat: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1} about their preferred lifestyle brand.',
        ],
      },
      mixer_MusicProductionStation_RemixIdle: {
        ignored: true,
      },
      mixer_social_Fame_Quirk_ASeriousActor_Targeted_Mean_EmotionSpecific_Rant:
        {
          pre_actions: [
            '{actor.0}, a famous actor with a serious demeanor, is targeting {actor.1} to express their frustrations about the lack of professionalism in their industry, in a mean and ranting manner.',
          ],
        },
      mixer_social_Fight_targeted_mean_Paparazzi: {
        pre_actions: [
          '{actor.0} is confronting the paparazzi and engaging in a physical altercation, with aggressive and mean intentions.',
        ],
      },
      mixer_socials_TellJoke_group_Funny_alwaysOn_WittyTakedown: {
        pre_actions: [
          '{actor.0} is telling a joke to {actor.1} and the group, leaving everyone in stitches with their funny and witty takedown.',
        ],
      },
      mixer_social_WooHooInSleepingPod_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a romantic interaction, transitioning to WooHoo in the Sleeping Pod.',
        ],
      },
      mixer_social_TryForBabyInSleepingPod_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are getting into a sleeping pod and trying for a baby, marking a special moment in their romantic relationship.',
        ],
      },
      mixer_Dolphin_Pet_autonmous: {
        pre_actions: [
          '{actor.0} is petting the dolphin, who seems to be enjoying the interaction.',
        ],
      },
      mixer_Dolphin_Feed: {
        pre_actions: ['{actor.0} is offering a fish to feed the dolphin.'],
      },
      mixer_Dolphin_Dismiss: {
        pre_actions: [
          '{actor.0} is dismissing {actor.1} as if they are just an insignificant dolphin.',
        ],
      },
      mixer_social_Mermaid_AskIfMerfolk_Friendly: {
        pre_actions: ['{actor.0} is asking {actor.1} if they are a merfolk.'],
      },
      mixer_social_Mermaid_AskAboutReaction_Friendly: {
        pre_actions: [
          "{actor.0} is noticing {actor.1}'s strange reaction and is deciding to ask them about it, in a friendly manner.",
        ],
      },
      mixer_social_Mermaid_MerfolkKiss_targeted_alwaysOn: {
        pre_actions: [
          "{actor.0}, a mermaid, is leaning in and kissing {actor.1}, a fellow merfolk, with a magical Mermaid's Kiss.",
        ],
      },
      mixer_social_Mermaid_ImpersonateMerfolk_Mischief_alwaysOn: {
        pre_actions: [
          '{actor.0} is using Mischief to impersonate a mermaid in front of {actor.1}.',
        ],
      },
      mixer_Dolphin_TrickRequest_RubBelly: {
        pre_actions: [
          '{actor.0} is playfully asking {actor.1} if they would like a belly rub, using their trick request to communicate.',
        ],
      },
      mixer_Dolphin_Trick_RubBelly: {
        pre_actions: [
          '{actor.0} is performing a trick and {actor.1} is rewarding them with a belly rub.',
        ],
      },
      mixer_Dolphin_TrickRequest_Dance: {
        pre_actions: [
          '{actor.0} is doing a dolphin trick and inviting {actor.1} to dance together.',
        ],
      },
      mixer_Dolphin_Trick_Dance: {
        pre_actions: [
          '{actor.0} is directing {actor.1}, a trained dolphin, to do a dance.',
        ],
      },
      mixer_Dolphin_TrickRequest_Fetch: {
        pre_actions: [
          '{actor.0} is directing {actor.1}, a trained dolphin, to fetch an object.',
        ],
      },
      mixer_Dolphin_Trick_Fetch: {
        pre_actions: [
          '{actor.0} is throwing a toy for {actor.1} to fetch, and {actor.1} is eagerly retrieving it as a dolphin trick.',
        ],
      },
      mixer_Dolphin_TrickRequest_Kiss: {
        pre_actions: [
          '{actor.0} is directing {actor.1}, a dolphin, to request a kiss from them.',
        ],
      },
      mixer_Dolphin_Trick_Kiss: {
        pre_actions: [
          '{actor.0} is directing {actor.1}, a dolphin, to give them a kiss.',
        ],
      },
      mixer_Dolphin_Talk: {
        pre_actions: [
          '{actor.0} is engaging in conversation with {actor.1}, a trained dolphin, in an attempt to communicate.',
        ],
      },
      mixer_Dolphin_AskForSquirt: {
        pre_actions: [
          '{actor.0} is playfully asking {actor.1}, a trained dolphin, to squirt water out of their blowhole as a trick.',
        ],
      },
      mixer_social_AskToPlayInIslandWaterfall_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is asking {actor.1} if they would like to join them in playing in the island waterfall.',
        ],
      },
      mixer_social_TryForBabyInIslandWaterfall_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are deciding to try for a baby by having sex in an island waterfall.',
        ],
      },
      mixer_social_WooHooInIslandWaterfall_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are sneaking into the secluded island waterfall to have sex.',
        ],
      },
      mixer_Dolphin_Pat_userDirected: {
        pre_actions: [
          '{actor.0} is gently patting {actor.1}, a trained dolphin, on its head.',
        ],
      },
      mixer_Dolphin_TrickRequest_Jump: {
        pre_actions: [
          '{actor.0} is asking {actor.1}, a trained dolphin, to perform a jump, wanting to witness their amazing dolphin tricks.',
        ],
      },
      mixer_Dolphin_Trick_Jump: {
        pre_actions: [
          '{actor.0} is directing {actor.1}, a trained dolphin, to perform a jump as an impressive trick.',
        ],
      },
      mixer_Dolphin_SimSplash_Playful: {
        pre_actions: [
          '{actor.0} is playfully splashing {actor.1}, a dolphin, with water.',
        ],
      },
      mixer_Dolphin_SimSplash_Mean: {
        pre_actions: [
          '{actor.0} is spitefully splashing {actor.1}, a dolphin, with water.',
        ],
      },
      mixer_social_Mermaid_KissinWater: {
        pre_actions: [
          '{actor.0}, a mermaid, and {actor.1} are sharing a passionate kiss under the water.',
        ],
      },
      mixer_social_Mermaid_KissinWater_Mermaid: {
        pre_actions: [
          '{actor.0} and {actor.1}, both merfolk, are sharing a magical kiss underwater.',
        ],
      },
      mixer_social_ShareMerfolkLore_target_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is excitedly sharing their recent discovery about merfolk lore with {actor.1}, hoping to spark an interesting conversation.',
        ],
      },
      mixer_social_JuiceKeg_AskToDoKegStand_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is asking {actor.1} in a friendly manner if they want to do a keg stand with some juice.',
        ],
      },
      mixer_social_JuiceKeg_ImTheBest_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is confidently boasting about being the best while enjoying a drink from the Juice Keg to {actor.1}.',
        ],
      },
      mixer_social_JuiceKeg_LetsBeFriends_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is excitedly offering {actor.1} a drink from the juice keg and suggesting becoming friends.',
        ],
      },
      mixer_social_JuiceKeg_WantToMakeOut_Flirty_alwaysOn: {
        pre_actions: [
          '{actor.0} is asking {actor.1} if they want to make out, while both of them are under the influence of the Juice Keg and feeling flirty.',
        ],
      },
      mixer_social_JuiceKeg_CheckThisNoise_Mischief_alwaysOn: {
        pre_actions: [
          '{actor.0} is noticing a strange noise and is excitedly inviting {actor.1} to come investigate with them, eager to uncover the source of the sound.',
        ],
      },
      mixer_social_JuiceKeg_MakeOut_Flirty_AlwaysOn: {
        pre_actions: [
          '{actor.0} is leaning in and giving {actor.1} a passionate kiss, as they are both enjoying the flirty atmosphere from the juice keg.',
        ],
      },
      mixer_CollegeOrganizations_AskToJoinOrQuit: {
        pre_actions: [
          '{actor.0} is politely asking {actor.1} to join a college organization.',
        ],
      },
      mixer_Social_Education_Teach_Fitness: {
        pre_actions: [
          '{actor.0} is taking on the role of a fitness instructor and is teaching {actor.1} about fitness.',
        ],
      },
      mixer_Social_Education_AskDonation: {
        pre_actions: [
          '{actor.0} is politely asking {actor.1} for a donation to support education.',
        ],
      },
      mixer_Social_Education_AskVolunteer: {
        pre_actions: [
          '{actor.0} is asking {actor.1} if they would like to volunteer their time for an educational cause.',
        ],
      },
      mixer_Social_Education_Teach_Handiness: {
        pre_actions: [
          '{actor.0} is engaging in a conversation with {actor.1} to educate them about handiness skills.',
        ],
      },
      mixer_Social_Education_Teach_Research: {
        pre_actions: [
          '{actor.0} is engaging in a conversation with {actor.1} to educate them about research and debate.',
        ],
      },
      mixer_Social_Education_Teach_Writing: {
        pre_actions: [
          '{actor.0} is engaging in a social interaction with {actor.1} to educate them about writing.',
        ],
      },
      mixer_Social_Education_Teach_Programming: {
        pre_actions: [
          '{actor.0} is engaging in a social interaction with {actor.1} to teach them about programming.',
        ],
      },
      mixer_Social_Education_Teach_Robotics: {
        pre_actions: [
          '{actor.0} is engaging in a conversation with {actor.1} to teach them about robotics.',
        ],
      },
      mixer_Social_Education_Teach_RocketScience: {
        pre_actions: [
          '{actor.0} is engaging in a social interaction with {actor.1}, attempting to teach them about rocket science.',
        ],
      },
      mixer_Social_Education_Teach_Videogaming: {
        pre_actions: [
          '{actor.0} is engaging in a social interaction with {actor.1} to educate them about video gaming.',
        ],
      },
      mixer_Social_Education_Teach_Acting: {
        pre_actions: [
          '{actor.0} is engaging in a social interaction with {actor.1} to educate them about the art of acting.',
        ],
      },
      mixer_Social_Education_Teach_Charisma: {
        pre_actions: [
          '{actor.0} is teaching {actor.1} about charisma, sharing tips and tricks to improve their social skills.',
        ],
      },
      mixer_Social_Education_Teach_Comedy: {
        pre_actions: [
          '{actor.0} is engaging in a social interaction with {actor.1}, teaching them about comedy.',
        ],
      },
      mixer_Social_Education_Teach_Painting: {
        pre_actions: [
          '{actor.0} is engaging in a social interaction with {actor.1} in order to teach them about painting.',
        ],
      },
      mixer_Social_Education_Teach_Cooking: {
        pre_actions: [
          '{actor.0} is taking the opportunity to teach {actor.1} about cooking, sharing their knowledge and tips.',
        ],
      },
      mixer_Social_Education_Teach_Gardening: {
        pre_actions: [
          '{actor.0} is taking the opportunity to educate {actor.1} about the art of gardening.',
        ],
      },
      mixer_Social_Education_Teach_Logic: {
        pre_actions: [
          '{actor.0} is taking the opportunity to teach {actor.1} about logic, engaging in a social and educational interaction.',
        ],
      },
      mixer_Social_Education_Teach_Photography: {
        pre_actions: [
          '{actor.0} is engaging in a social interaction with {actor.1} to educate and teach them about photography.',
        ],
      },
      mixer_Social_DiscussStrategy_Targeted_Friendly_AlwaysOn_SoccerTeam: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1}, discussing soccer strategies, aimed at their shared interest in the sport.',
        ],
      },
      mixer_CollegeOrganizations_AskToJoinOrQuit_Art: {
        pre_actions: [
          '{actor.0} is asking {actor.1} to join the College Art Society.',
        ],
      },
      mixer_CollegeOrganizations_AskToJoinOrQuit_Debate: {
        pre_actions: [
          '{actor.0} is asking {actor.1} about joining the Debate Guild.',
        ],
      },
      mixer_CollegeOrganizations_AskToJoinOrQuit_Honor: {
        pre_actions: [
          '{actor.0} is asking {actor.1} if they would like to join The Brainiacs, a college organization known for its academic prowess and dedication to honor.',
        ],
      },
      mixer_CollegeOrganizations_AskToJoinOrQuit_Prank: {
        pre_actions: [
          '{actor.0} is asking {actor.1} if they would like to join the Britechester Spirit Corps, a college organization known for their pranks.',
        ],
      },
      mixer_CollegeOrganizations_AskToJoinOrQuit_Robotics: {
        pre_actions: ['{actor.0} is asking {actor.1} to join the Bot Savants.'],
      },
      mixer_social_DiscussFavoriteArtPieces_targeted_Friendly_alwaysOn_STC: {
        pre_actions: [
          '{actor.0} is discussing favorite art pieces with {actor.1}.',
        ],
      },
      mixer_social_YellAT_targeted_mean_StudentCommons_GrumpyProfessor: {
        pre_actions: [
          '{actor.0} is yelling at {actor.1} angrily in the Student Commons, possibly because {actor.0} is being a grumpy professor.',
        ],
      },
      mixer_social_CollegeOrganizations_SchoolSpirit_Prank_AskToPaint: {
        pre_actions: [
          "{actor.0} is encouraging {actor.1} to paint murals as part of a college organization's initiative to promote school spirit and pull off a prank.",
        ],
      },
      mixer_social_DiscussPaintingStyle_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1} to discuss their painting style.',
        ],
      },
      mixer_social_AskToBeBoyfriend_targeted_romance_relationship_RoommateNPC: {
        pre_actions: [
          '{actor.0} is mustering up the courage to ask {actor.1} if they want to take their relationship to the next level and become boyfriends.',
        ],
      },
      mixer_social_AskToBeGirlfriend_targeted_romance_relationship_RoommateNPC:
        {
          pre_actions: [
            '{actor.0} is mustering up the courage to ask {actor.1} if they would like to become their official girlfriend and take their relationship to the next level.',
          ],
        },
      mixer_social_CollegeOrganizations_SchoolSpirit_Prank_HeckleArtsMascot: {
        pre_actions: [
          '{actor.0} is joining a group of college students at a school spirit event and playfully heckling the arts mascot.',
        ],
      },
      mixer_social_CollegeOrganizations_SchoolSpirit_Prank_HeckleScienceMascot:
        {
          pre_actions: [
            '{actor.0} is playfully heckling the college mascot, showing off their school spirit and adding some humor to the atmosphere.',
          ],
        },
      mixer_social_CollegeOrganizations_SchoolSpirit_Prank_TellJokeAboutScienceUniversity:
        {
          pre_actions: [
            '{actor.0} is telling a joke about Foxbury Institute to {actor.1}, sparking a playful conversation about college organizations and school spirit.',
          ],
        },
      mixer_social_AskAboutInspiration_Friendly: {
        pre_actions: ['{actor.0} is asking {actor.1} about their inspiration.'],
      },
      mixer_social_DiscussScrapCollectionStrategy_targeted_friendly: {
        pre_actions: [
          '{actor.0} and {actor.1} are having a friendly discussion about their scrap collection strategy.',
        ],
      },
      mixer_social_EnthuseAboutRobotics_targeted_friendly: {
        pre_actions: [
          '{actor.0} is enthusiastically talking to {actor.1} about robotics, sharing their knowledge and passion for the subject.',
        ],
      },
      mixer_social_DiscussFavoriteBots_targeted_friendly: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a friendly discussion about their favorite Utili-Bots.',
        ],
      },
      mixer_social_Friendly_CollegeOrganizations_Debate_DiscussDebate: {
        pre_actions: [
          '{actor.0} is engaging in a friendly debate with {actor.1} about college organizations.',
        ],
      },
      mixer_social_Friendly_CollegeOrganizations_Debate_Inquire: {
        pre_actions: [
          '{actor.0} is asking {actor.1} about their debate strategy, as they are both members of college debate organizations.',
        ],
      },
      mixer_social_Friendly_CollegeOrganizations_Debate_OfferFeedback: {
        pre_actions: [
          '{actor.0} is offering {actor.1} friendly feedback on their debate performance.',
        ],
      },
      mixer_social_SchoolSpirit_Prank_greetings: {
        pre_actions: [
          '{actor.0} is enthusiastically greeting {actor.1} with a playful prank, showcasing their school spirit.',
        ],
      },
      mixer_social_Fight_targeted_mean_Mascot: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a heated fight, fueled by their mean and Mascot traits.',
        ],
      },
      mixer_social_SchoolSpirit_Party_greetings: {
        pre_actions: [
          '{actor.0}, filled with school spirit, is greeting {actor.1} at the party.',
        ],
      },
      mixer_social_CollegeOrganizations_SchoolSpirit_Prank_ThrowConfetti: {
        pre_actions: [
          '{actor.0} is engaging in a spirited prank with {actor.1}, throwing confetti in celebration of their college organizations and school spirit.',
        ],
      },
      'mixer_Social_E-Sports_DiscussStrategies': {
        pre_actions: [
          '{actor.0} is engaging in a discussion with {actor.1} to share and learn strategies to improve their SimScuffle performance in the world of e-sports.',
        ],
      },
      'mixer_Social_E-Sports_ComplimentSkills': {
        pre_actions: [
          '{actor.0} is complimenting {actor.1} on their impressive SimScuffle skills, recognizing their talent in the field of E-Sports.',
        ],
      },
      mixer_Social_UniversityRivalry_TauntAboutUniversitySuperiority: {
        pre_actions: [
          '{actor.0} is confronting {actor.1} about the superiority of their university, taunting them in a competitive manner.',
        ],
      },
      mixer_CollegeOrganizations_AskToJoinOrQuit_Party: {
        pre_actions: [
          '{actor.0} is asking {actor.1}, a member of the Foxbury Spirit Squad, to join the college organization.',
        ],
      },
      mixer_social_TryForBabyInShower_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are sneaking into the shower together, hoping to start a family.',
        ],
      },
      mixer_social_WooHooInShower_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a romantic WooHoo session together in the shower.',
        ],
      },
      mixer_social_ProfessOnFabrication_targetted_friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} is taking {actor.1} aside and excitedly talking about the wonders of fabrication, sharing their passion and knowledge.',
        ],
      },
      mixer_Social_CivicPolicy_ConvinceToSupportPolicy: {
        pre_actions: [
          '{actor.0} is engaging in a social conversation with {actor.1} in an attempt to convince them to support a specific civic policy.',
        ],
      },
      mixer_Social_CivicPolicy_ConvinceToInstall_Recycler: {
        pre_actions: [
          '{actor.0} is engaging in a conversation with {actor.1}, trying to convince them to buy a recycler for their home as part of the civic policy.',
        ],
      },
      mixer_Social_CivicPolicy_RepealPolicy_GetSignature: {
        pre_actions: [
          '{actor.0} is politely asking {actor.1} to sign a petition.',
        ],
      },
      mixer_Social_CivicPolicy_ConvinceToInstall_Fabricator: {
        pre_actions: [
          '{actor.0} is engaging in a social conversation with {actor.1}, trying to convince them to buy and install a fabricator for civic policy reasons.',
        ],
      },
      mixer_social_TryForBabyInDumpster_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a romantic interaction and trying for a baby in a dumpster.',
        ],
      },
      mixer_social_WooHooInDumpster_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} is climbing into a dumpster with {actor.1} to have sex.',
        ],
      },
      mixer_Social_RecyclingGuru_AskForTips: {
        pre_actions: [
          '{actor.0} is asking the Recycling Guru, {actor.1}, for some recycling tips.',
        ],
      },
      mixer_Social_RecyclingGuru_AskForMaterials: {
        pre_actions: [
          '{actor.0} is asking {actor.1}, a known recycling guru, for any extra recycling materials to spare.',
        ],
      },
      mixer_social_Fight_targeted_mean_CommunityCloseness: {
        pre_actions: [
          '{actor.0} is forcefully arguing with {actor.1} in order to end their association, displaying hostility and a lack of community closeness.',
        ],
      },
      mixer_Social_CivicPolicy_ConvinceToInstall_GreenGardening_BeeBox: {
        pre_actions: [
          '{actor.0} is educating {actor.1} about the benefits of installing a Bee Box as part of a green gardening initiative.',
        ],
      },
      mixer_Social_CivicPolicy_ConvinceToInstall_GreenGardening_InsectFarm: {
        pre_actions: [
          '{actor.0} is trying to convince {actor.1} to install an insect farm as part of a green gardening initiative.',
        ],
      },
      mixer_Social_CivicPolicy_ConvinceToInstall_GreenGardening_Planter: {
        pre_actions: [
          '{actor.0} is discussing civic policies with {actor.1} and convincing them to install planters for green gardening.',
        ],
      },
      mixer_Social_CivicPolicy_ConvinceToInstall_GreenGardening_VerticalGarden:
        {
          pre_actions: [
            '{actor.0} is discussing the benefits of installing a vertical garden with {actor.1}, in an effort to convince them to adopt green gardening practices and implement a vertical garden.',
          ],
        },
      mixer_Social_CivicPolicy_ConvinceToInstall_UtilityProduction_DewCollector:
        {
          pre_actions: [
            '{actor.0} is engaging in a social interaction with {actor.1}, convincing them to install a dew collector for utility production as part of the civic policy.',
          ],
        },
      mixer_Social_CivicPolicy_ConvinceToInstall_UtilityProduction_SolarPanel: {
        pre_actions: [
          '{actor.0} is discussing the benefits of installing solar panels with {actor.1} as part of a civic policy to promote utility production.',
        ],
      },
      mixer_Social_CivicPolicy_ConvinceToInstall_UtilityProduction_WindTurbine:
        {
          pre_actions: [
            '{actor.0} is discussing the benefits of installing wind turbines with {actor.1}, in order to convince them to consider implementing them for utility production.',
          ],
        },
      mixer_Social_CivicPolicy_BragAbout_Beebox: {
        pre_actions: [
          '{actor.0} is excitedly telling {actor.1} about their new bee box, highlighting the benefits of having bees and how it aligns with their civic policy.',
        ],
      },
      mixer_Social_CivicPolicy_BragAbout_WindTurbine: {
        pre_actions: [
          '{actor.0} is enthusiastically discussing the benefits of wind turbines with {actor.1}, showing off their knowledge on the topic.',
        ],
      },
      mixer_Social_CivicPolicy_BragAbout_SolarPanel: {
        pre_actions: [
          '{actor.0} is engaging in a social conversation with {actor.1} and is taking the opportunity to brag about their solar panel installation.',
        ],
      },
      mixer_Social_CivicPolicy_BragAbout_DewCollector: {
        pre_actions: [
          '{actor.0} is engaging in a social interaction with {actor.1} where they are proudly bragging about their implementation of the Dew Collector civic policy.',
        ],
      },
      mixer_Social_CivicPolicy_BragAbout_Recycler: {
        pre_actions: [
          '{actor.0} is engaging in a persuasive conversation with {actor.1}, emphasizing the benefits of buying a recycler and how it aligns with their civic policies. They are also proudly mentioning their own use of a recycler.',
        ],
      },
      mixer_Social_CivicPolicy_BragAbout_Fabricator: {
        pre_actions: [
          '{actor.0} is trying to convince {actor.1} to buy a fabricator, while bragging about its benefits and discussing how it aligns with their civic policy.',
        ],
      },
      mixer_Social_CivicPolicy_BragAbout_VerticalGarden: {
        pre_actions: [
          '{actor.0} is enthusiastically showing off their impressive vertical garden to {actor.1}, while also discussing the benefits of incorporating more green spaces in the city.',
        ],
      },
      mixer_Social_CivicPolicy_BragAbout_Planter: {
        pre_actions: [
          '{actor.0} is bragging to {actor.1} about their impressive collection of planters.',
        ],
      },
      mixer_Social_CivicPolicy_BragAbout_InsectFarm: {
        pre_actions: [
          '{actor.0} is excitedly talking to {actor.1} about their successful insect farm, bragging about their insect collection and discussing the benefits of implementing insect farming as a civic policy.',
        ],
      },
      mixer_Social_ShareIdeasAboutMaking_targetted_friendly_NPCOnly: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1} about crafting, exchanging ideas and tips.',
        ],
      },
      mixer_social_Fight_targeted_CivicPolicy_Aggression: {
        pre_actions: [
          '{actor.0} is fighting with {actor.1} expressing their differing opinions on civil policy.',
        ],
      },
      mixer_social_Fight_targeted_CivicPolicy_Aggression_Transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a heated argument, fueled by differing opinions on civic policy.',
        ],
      },
      mixer_social_Targeted_Romance_CivicPolicy_FreeLove_NT_AskRisqueQuestion: {
        pre_actions: [
          '{actor.0} is boldly asking {actor.1} a risqué question, pushing the boundaries of their conversation.',
        ],
      },
      mixer_social_Targeted_Romance_CivicPolicy_FreeLove_NT_BlowAKiss: {
        pre_actions: ['{actor.0} is blowing a kiss towards {actor.1}.'],
      },
      mixer_social_Targeted_Romance_CivicPolicy_FreeLove_T_CaressCheek: {
        pre_actions: ["{actor.0} is gently caressing {actor.1}'s cheek."],
      },
      mixer_social_Targeted_Romance_CivicPolicy_FreeLove_T_Embrace: {
        pre_actions: [
          '{actor.0} is passionately embracing {actor.1} as a romantic gesture, expressing their love and support. Their embrace is representing their belief in free love and their commitment to the civic policy of embracing all forms of love equally.',
        ],
      },
      mixer_social_Targeted_Romance_CivicPolicy_FreeLove_NT_Flirt: {
        pre_actions: [
          '{actor.0} is targeting {actor.1} and using flirtatious comments to express romantic interest, in accordance with the Free Love civic policy and the concepts of non-traditional romance.',
        ],
      },
      mixer_social_Targeted_Romance_CivicPolicy_FreeLove_T_HoldHands: {
        pre_actions: [
          '{actor.0} is reaching out to {actor.1} and suggesting holding hands, expressing their affection and closeness.',
        ],
      },
      mixer_social_Targeted_Romance_CivicPolicy_FreeLove_T_KissNeck: {
        pre_actions: [
          "{actor.0} is passionately kissing {actor.1}'s neck, expressing their love and affection in a moment of intimacy.",
        ],
      },
      mixer_social_Targeted_Romance_CivicPolicy_FreeLove_T_OfferMassage: {
        pre_actions: [
          '{actor.0} is offering to give {actor.1} a relaxing massage, as an expression of their affection.',
        ],
      },
      mixer_social_Targeted_Romance_CivicPolicy_FreeLove_T_WhisperSeductively: {
        pre_actions: [
          '{actor.0} is leaning in close to {actor.1} and whispering seductively, enticing them with their romantic charm.',
        ],
      },
      mixer_Social_Skiing_InquireAboutPowderConditions_Friendly_NT: {
        pre_actions: [
          '{actor.0} is asking {actor.1} about the current conditions on the slopes, curious about the quality of the powder for skiing.',
        ],
      },
      mixer_Social_Skiing_DeliberateSkiStyle_Friendly_NT: {
        pre_actions: [
          '{actor.0} and {actor.1} are discussing their favorite ski styles and are deliberating on the technique they use while skiing, in a friendly and non-threatening manner.',
        ],
      },
      mixer_Social_Skiing_GiveAdviceOnAvoidingWipeouts_Friendly_NT: {
        pre_actions: [
          '{actor.0} is offering some friendly advice to {actor.1} on how to avoid wipeouts while skiing.',
        ],
      },
      mixer_Socials_RevokeSnowBro_Targeted_Friendly_Snowboarding: {
        pre_actions: [
          "{actor.0} is playfully revoking {actor.1}'s 'Snow Bro' status during a friendly conversation about snowboarding.",
        ],
      },
      mixer_socials_EndureTheBurn_Targeted_Friendly_Snowboarding: {
        pre_actions: [
          '{actor.0} is bravely encouraging {actor.1} to endure the burn while they are snowboarding together, showcasing their friendly and supportive side.',
        ],
      },
      mixer_socials_BragAboutShredding_Targeted_Friendly_Snowboarding: {
        pre_actions: [
          '{actor.0} is excitedly bragging to {actor.1} about their shredding skills on the slopes, bonding over their shared love for snowboarding.',
        ],
      },
      mixer_socials_DareToAttemptRiskySlope_Targeted_Mischief_Snowboarding: {
        pre_actions: [
          '{actor.0} is daring {actor.1} to attempt a risky slope while snowboarding, adding a touch of mischief to their interaction.',
        ],
      },
      mixer_socials_ChatAboutRadSlope_Targeted_Friendly_Snowboarding: {
        pre_actions: [
          '{actor.0} is discussing the rad slope they just went down with {actor.1} while snowboarding.',
        ],
      },
      mixer_socials_Coach_Targeted_Friendly_Snowboarding: {
        pre_actions: [
          '{actor.0} is offering to coach {actor.1} in the art of snowboarding, providing guidance and support.',
        ],
      },
      mixer_socials_ProvideTips_Targeted_Friendly_Snowboarding: {
        pre_actions: [
          '{actor.0} is offering {actor.1} some friendly snowboarding tips during their conversation.',
        ],
      },
      mixer_Social_Skiing_CoachSimNameInSkiing_Friendly_NT: {
        pre_actions: [
          '{actor.0} is offering to coach {actor.1} in skiing, providing guidance and support to help them improve their skills on the slopes.',
        ],
      },
      mixer_Social_Skiing_OfferSkiExpertise_NPCSims_Friendly_NT: {
        pre_actions: [
          '{actor.0} is offering their expertise in skiing to {actor.1}, hoping to help them improve their skills on the slopes.',
        ],
      },
      mixer_Social_Skiing_OfferSkiExpertise_HHSims_Friendly_NT: {
        pre_actions: [
          '{actor.0} is offering to share their skiing expertise with {actor.1} for free, in a friendly and helpful manner.',
        ],
      },
      mixer_Lifestyles_FrequentTraveler_ShareTravelStories_Listening: {
        pre_actions: [
          "{actor.0} and {actor.1} are discussing their careers, sharing stories about their frequent travels and listening to each other's experiences.",
        ],
      },
      mixer_Social_Skiing_OfferSkiExpertise_Continued_Friendly_NT: {
        pre_actions: [
          '{actor.0} is offering their ski expertise to {actor.1} in a friendly and ongoing conversation.',
        ],
      },
      mixer_Lifestyles_FrequentTraveler_AskAboutHomeRegion: {
        pre_actions: [
          "{actor.0} is inquiring about {actor.1}'s home region, curious to learn more about their travels and lifestyle.",
        ],
      },
      mixer_Social_Skiing_DiscussPastSkiExperiences_Friendly_NT: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a friendly conversation about their past skiing experiences.',
        ],
      },
      mixer_Social_Lifestyles_CoffeeFanatic_TalkAboutCoffee_Positive: {
        pre_actions: [
          '{actor.0} is engaging {actor.1} in a conversation about the benefits of coffee, discussing their shared interest in the topic.',
        ],
      },
      mixer_Social_Lifestyles_CoffeeFanatic_TalkAboutCoffee_Negative: {
        pre_actions: [
          '{actor.0} is expressing their displeasure with the negative effects of coffee to {actor.1}, who is a coffee fanatic.',
        ],
      },
      mixer_Social_AskToBeConfidant: {
        pre_actions: [
          '{actor.0} is asking {actor.1} if they can be their confidant, seeking a deeper level of trust and intimacy in their relationship.',
        ],
      },
      mixer_social_WooHooInHotSprings_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are sneaking off to the hot springs for a steamy night of romance, transitioning into a passionate woohoo session.',
        ],
      },
      mixer_social_TryForBabyInHotSprings_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are sharing a romantic moment in the hot springs, trying to start a family together.',
        ],
      },
      mixer_Social_Lifestyles_ShareLifestyleTips_Techie: {
        pre_actions: [
          '{actor.0} is sharing some techie tips with {actor.1}, discussing their knowledge and expertise in the tech field.',
        ],
      },
      mixer_Social_Lifestyles_ShareLifestyleTips_Technophobe: {
        pre_actions: [
          '{actor.0}, who is a technophobe, is sharing tips with {actor.1} about how to avoid technology.',
        ],
      },
      mixer_Social_Lifestyles_ShareLifestyleTips_Workaholic: {
        pre_actions: [
          '{actor.0} is engaging in a conversation with {actor.1}, sharing tips on how to balance work and personal life as a workaholic.',
        ],
      },
      mixer_Social_Lifestyles_ShareLifestyleTips_FrequentTravleer: {
        pre_actions: [
          '{actor.0} is sharing frequent traveler lifestyle tips with {actor.1}.',
        ],
      },
      mixer_Social_Lifestyles_ShareLifestyleTips_Sedentary: {
        pre_actions: [
          '{actor.0} is sharing sedentary tips with {actor.1}, discussing ways to stay comfortable and relax while leading a less active lifestyle.',
        ],
      },
      mixer_Social_Lifestyles_ShareLifestyleTips_Energetic: {
        pre_actions: [
          '{actor.0} is sharing some energetic tips with {actor.1} during their conversation about lifestyles.',
        ],
      },
      mixer_Social_Lifestyles_ShareLifestyleTips_Indoorsy: {
        pre_actions: [
          '{actor.0} is engaging in a social interaction with {actor.1} to share tips and advice on living an indoorsy lifestyle.',
        ],
      },
      mixer_Social_Lifestyles_ShareLifestyleTips_Outdoorsy: {
        pre_actions: [
          '{actor.0}, who loves being outdoors, is sharing outdoorsy lifestyle tips with {actor.1}.',
        ],
      },
      mixer_Social_Lifestyles_ShareLifestyleTips_CloseKnit: {
        pre_actions: [
          '{actor.0}, who enjoys close-knit relationships, is sharing tips with {actor.1} about their lifestyle.',
        ],
      },
      mixer_Social_Lifestyles_ShareLifestyleTips_Networker: {
        pre_actions: [
          '{actor.0}, an avid networker, is sharing some tips with {actor.1} on how to connect with people.',
        ],
      },
      mixer_Social_Lifestyles_ShareLifestyleTips_JunkFood: {
        pre_actions: [
          '{actor.0} and {actor.1} are sharing tips on indulging in their love for junk food, bonding over their similar lifestyles.',
        ],
      },
      mixer_Social_Lifestyles_ShareLifestyleTips_HealthNut: {
        pre_actions: [
          '{actor.0} and {actor.1} are having a social interaction where they are sharing health food nut tips to promote a healthier lifestyle.',
        ],
      },
      mixer_Social_Lifestyles_ShareLifestyleTips_NoRomance: {
        pre_actions: [
          '{actor.0} is sharing some tips on enjoying being single with {actor.1}, emphasizing the importance of embracing the single lifestyle without any romantic involvement.',
        ],
      },
      mixer_Social_Lifestyles_ShareLifestyleTips_HungryLove: {
        pre_actions: [
          '{actor.0} is engaging in a social conversation with {actor.1}, sharing helpful tips and advice on how to find love when feeling hungry for it.',
        ],
      },
      mixer_Social_Lifestyles_ShareLifestyleTips_AdrenalineJunkie: {
        pre_actions: [
          '{actor.0} is excitedly sharing adrenaline seeker tips with {actor.1}, discussing their adventurous lifestyle.',
        ],
      },
      mixer_Social_Lifestyles_ShareLifestyleTips_CoffeeFanatic: {
        pre_actions: [
          '{actor.0} is engaging in a social interaction with {actor.1}, sharing coffee fanatic tips and discussing their shared passion for coffee.',
        ],
      },
      mixer_Social_Lifestyles_Techie_EnthuseAboutProcessingPower: {
        pre_actions: [
          '{actor.0} is engaging in a conversation with {actor.1}, enthusiastically discussing their passion for processing power.',
        ],
      },
      mixer_Social_Lifestyles_Technophobe_ComplainAboutTechnology: {
        pre_actions: [
          '{actor.0} is expressing their frustration about the technological apocalypse to {actor.1}, who might be sharing their dislike for technology.',
        ],
      },
      mixer_Social_Lifestyles_Technophobe_InsultRoboticExistence: {
        pre_actions: [
          "{actor.0} is openly expressing their dislike for {actor.1}'s mechanical existence, insulting their robotic nature and lifestyle choices.",
        ],
      },
      mixer_Social_Lifestyles_Technophobe_ThreatenRobotUprising: {
        pre_actions: [
          '{actor.0} is confronting {actor.1}, expressing their fear and disapproval of technology and warning about a potential robot uprising.',
        ],
      },
      mixer_social_Targeted_TalkAboutNewAdventure_Lifestyles_AdrenalineSeeker: {
        pre_actions: [
          '{actor.0} is engaging in a conversation with {actor.1}, specifically discussing their love for new adventures and seeking out adrenaline-filled experiences.',
        ],
      },
      mixer_social_Fight_targeted_mean_Lifestyles_AdrenalineSeeker: {
        pre_actions: [
          '{actor.0} is challenging {actor.1} to a fight, fueled by their competitive and thrill-seeking nature.',
        ],
      },
      mixer_social_RespectfulIntroduction_greetings: {
        pre_actions: [
          '{actor.0} is respectfully introducing themselves to {actor.1}.',
        ],
      },
      mixer_social_WooHoo_targeted_romance_transition_InteractableCave: {
        pre_actions: [
          '{actor.0} and {actor.1} are sneaking off to a hidden cave for a romantic rendezvous, engaging in some intimate WooHoo.',
        ],
      },
      mixer_social_TryForBabyInCave_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are sneaking into the private cave to try for a baby.',
        ],
      },
      mixer_social_TreadMill_Rock_ClimbingWall_BragAboutBeatingHighScore_Targeted_Friendly_AlwaysOn:
        {
          pre_actions: [
            '{actor.0} is excitedly telling {actor.1} about their recent achievement of beating a climbing time on the rock climbing wall at the gym.',
          ],
        },
      mixer_social_TreadMill_Rock_ClimbingWall_BragAbout_ClimbingProwess_Targeted_Friendly_AlwaysOn:
        {
          pre_actions: [
            '{actor.0} is proudly boasting about their impressive climbing skills to {actor.1}, showing off their strength and agility.',
          ],
        },
      mixer_social_Laundry_Targeted_EmotionSpecific_SmellGood: {
        pre_actions: [
          "{actor.0} is exploring {actor.1}'s fresh laundry, taking a moment to sniff the clothes and enjoy the pleasant scent.",
        ],
      },
      mixer_social_Laundry_Targeted_EmotionSpecific_SmellFoul: {
        pre_actions: [
          "{actor.0} is sniffing {actor.1}'s foul-smelling laundry.",
        ],
      },
      mixer_social_Targeted_Friendly_MiddleScore_STC_WhatsThatSpot_Child: {
        pre_actions: [
          "{actor.0} is inquiring about a spot on {actor.1}'s clothing.",
        ],
      },
      mixer_social_Targeted_Friendly_AlwaysOn_STC_AskAbout_RodentDisease: {
        pre_actions: [
          '{actor.0} is asking {actor.1} about Rabid Rodent Fever.',
        ],
      },
      mixer_social_BragAboutTinyHome: {
        pre_actions: [
          '{actor.0} is proudly showing off their small home to {actor.1}, bragging about how cozy and efficient it is.',
        ],
      },
      mixer_social_Knitting_ShowOff: {
        pre_actions: [
          '{actor.0} is proudly showing off their knitted clothing to {actor.1}, displaying their knitting skills.',
        ],
      },
      mixer_social_YellAT_targeted_mean_Knitting_SweaterCurse: {
        pre_actions: [
          '{actor.0} is angrily yelling at {actor.1} while they are knitting a sweater, using mean and curse words.',
        ],
      },
      mixer_social_Mean_Dust_DemandClean: {
        pre_actions: [
          '{actor.0} is ordering {actor.1} to clean, in a demanding and mean tone.',
        ],
      },
      mixer_social_Mean_Dust_Argue: {
        pre_actions: [
          '{actor.0} is confronting {actor.1} about the dirty surroundings, resulting in an argument.',
        ],
      },
      mixer_Social_Dust_AskClean: {
        pre_actions: [
          '{actor.0} is politely asking {actor.1} for help with cleaning, as there is a lot of dust around.',
        ],
      },
      mixer_social_TryForBabyInLivestockPen_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are sneaking into the animal shed together, hoping to start a family.',
        ],
      },
      mixer_social_WooHooInLivestockPen_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are sneaking off to the animal shed for a secret rendezvous, engaging in a passionate WooHoo session.',
        ],
      },
      mixer_social_CottageWorld_NPC_GossipAboutVillage_Targeted_Friendly_AlwaysOn:
        {
          pre_actions: [
            '{actor.0} is taking {actor.1} aside in the charming village of Henford-on-Bagley to have a heart-to-heart conversation about the happenings in the village.',
          ],
        },
      mixer_AnimalEnthusiastTrait_DiscussIfChicken: {
        pre_actions: [
          '{actor.0} with the Animal Enthusiast Trait is engaging in a discussion with {actor.1} about the age-old question of whether the chicken or the egg came first.',
        ],
      },
      mixer_AnimalEnthusiastTrait_ShareDelight: {
        pre_actions: [
          '{actor.0}, an animal enthusiast, is excitedly sharing their delight about animals with {actor.1}.',
        ],
      },
      mixer_AnimalEnthusiastTrait_MopeMissingAnimals: {
        pre_actions: [
          '{actor.0}, an Animal Enthusiast, is sadly moping about the missing animals with {actor.1}.',
        ],
      },
      mixer_LactoseIntolerantTrait_ComplainAboutBloating: {
        pre_actions: [
          '{actor.0}, who is lactose intolerant, is complaining to {actor.1} about feeling bloated after consuming dairy products.',
        ],
      },
      mixer_LactoseIntolerantTrait_ShareWondersOfDairyFree: {
        pre_actions: [
          '{actor.0} with the Lactose Intolerant Trait is sharing the wonders of living a dairy-free life with {actor.1}.',
        ],
      },
      mixer_LactoseIntolerantTrait_TheorizeAboutMilkyWay: {
        pre_actions: [
          '{actor.0}, who is lactose intolerant, is engaging in a lively conversation with {actor.1} about their shared interest in theorizing about the Milky Way conspiracy.',
        ],
      },
      mixer_Social_HighSchool_Active_GetClassList: {
        pre_actions: [
          '{actor.0} is asking {actor.1} about their new school, hoping to learn more about it. They are discussing classes and activities that are available.',
        ],
      },
      mixer_Social_HighSchool_Active_TalkToTeacher: {
        pre_actions: ['{actor.0} is talking to their teacher, {actor.1}.'],
      },
      mixer_social_Targeted_Mean_AlwaysOn_Teens_MockRival: {
        pre_actions: [
          '{actor.0} is purposely targeting {actor.1} and engaging in mean-spirited behavior, mocking them as a rival.',
        ],
      },
      mixer_social_ConvinceToJoinTeam_Targeted_Friendly_AlwaysOn_Teens: {
        pre_actions: ['{actor.0} is convincing {actor.1} to join their team.'],
      },
      mixer_Social_HighSchoolFestival_TauntRival: {
        pre_actions: [
          '{actor.0} is attending the High School Festival and is deciding to taunt {actor.1}, their rival, in a social interaction.',
        ],
      },
      mixer_Social_Fight_HighSchool_Active_SchoolFight: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a heated fight at the high school, causing a scene and attracting attention from others.',
        ],
      },
      mixer_Social_BedUpdates_AskToPillowFight: {
        pre_actions: [
          '{actor.0} is playfully challenging {actor.1} to a pillow fight, asking them to indulge in some friendly fun on the bed.',
        ],
      },
      mixer_Social_Targeted_Friendly_OpenableWindow_AskForPermission: {
        pre_actions: [
          '{actor.0} is asking {actor.1} for permission to attend an event.',
        ],
      },
      mixer_social_HighSchoolFestival_RequestScienceFair: {
        pre_actions: [
          '{actor.0} is requesting {actor.1} to participate in the Science Fair at the High School Festival.',
        ],
      },
      mixer_HighSchool_Active_HSExit_Principal_Dropout: {
        pre_actions: [
          '{actor.0} is deciding to drop out of high school and is informing the principal of their decision.',
        ],
      },
      mixer_HighSchool_Active_HSExit_Principal_GraduateEarly: {
        pre_actions: [
          '{actor.0} is successfully completing all their high school requirements and is receiving approval from the principal to graduate early.',
        ],
      },
      mixer_social_Targeted_Friendly_SetExpectations: {
        pre_actions: [
          '{actor.0} is having a friendly conversation with {actor.1}, discussing their expectations for the future.',
        ],
      },
      mixer_social_Overachiever_HumbleBrag: {
        pre_actions: [
          '{actor.0} is subtly boasting about their many achievements to {actor.1} while maintaining a modest demeanor.',
        ],
      },
      mixer_social_Overachiever_AskforExtraCredit: {
        pre_actions: [
          '{actor.0}, the overachiever, is asking {actor.1} for extra, extra credit.',
        ],
      },
      mixer_social_Overachiever_EnthuseAboutLearning: {
        pre_actions: [
          '{actor.0} is excitedly talking to {actor.1} about learning additional skills, showing their overachiever spirit.',
        ],
      },
      mixer_social_PartyAnimal_EnthuseAboutParties: {
        pre_actions: [
          '{actor.0} is excitedly talking to {actor.1} about their love for parties, gushing about the fun and excitement they bring.',
        ],
      },
      mixer_social_PartyAnimal_VibeCheck: {
        pre_actions: ['{actor.0} is giving {actor.1} a vibe check.'],
      },
      mixer_social_PartyAnimal_TalkAboutPastParties: {
        pre_actions: [
          '{actor.0} is excitedly discussing past parties with {actor.1}, showcasing their party animal side.',
        ],
      },
      mixer_social_Targeted_TeenPranks_UrbanMyth: {
        pre_actions: [
          '{actor.0} is playing a prank on {actor.1}, telling them an urban myth specifically targeted at teens.',
        ],
      },
      mixer_Shower_Shave_Arms: {
        pre_actions: [
          '{actor.0} is hopping into the shower and proceeding to shave their arm hair.',
        ],
      },
      mixer_Shower_Shave_Face: {
        pre_actions: [
          '{actor.0} is lathering up in the shower and proceeding to carefully shave off their facial hair.',
        ],
      },
      mixer_Shower_Shave_Legs: {
        pre_actions: [
          '{actor.0} is taking a shower and then proceeding to shave their leg hair.',
        ],
      },
      mixer_Shower_Shave_Torso: {
        pre_actions: [
          '{actor.0} is taking a shower and deciding to shave their chest hair.',
        ],
      },
      mixer_Shower_Shave_Arms_Passive: {
        pre_actions: [
          '{actor.0} is deciding to shave their arm hair while taking a shower, using a passive approach.',
        ],
      },
      mixer_Shower_Shave_Face_Passive: {
        pre_actions: [
          '{actor.0} is taking a shower and shaving their face, in a passive manner.',
        ],
      },
      mixer_Shower_Shave_Legs_Passive: {
        pre_actions: [
          '{actor.0} is in the shower and is casually shaving their legs.',
        ],
      },
      mixer_Shower_Shave_Torso_Passive: {
        pre_actions: [
          '{actor.0} is shaving their chest hair while they are taking a shower, concentrating on the torso area, in a serene and passive manner.',
        ],
      },
      mixer_HSGraduation_AskAboutGraduation: {
        pre_actions: [
          '{actor.0} is asking {actor.1} about their graduation from high school.',
        ],
      },
      mixer_HSGraduation_ReminisceAboutSchoolYear: {
        pre_actions: [
          '{actor.0} and {actor.1} are taking a moment to reminisce about their high school graduation and the memories from their school year.',
        ],
      },
      mixer_HSGraduation_Congratulate: {
        pre_actions: [
          '{actor.0} is congratulating {actor.1} on their high school graduation.',
        ],
      },
      mixer_HSGraduation_FakeCongratulate: {
        pre_actions: [
          '{actor.0} is sarcastically congratulating {actor.1} on their high school graduation.',
        ],
      },
      mixer_HSGraduation_ThankForSchoolYear: {
        pre_actions: [
          '{actor.0} is expressing gratitude to {actor.1} for their support throughout the school year.',
        ],
      },
      mixer_Shower_Shave_Torso_Preferred: {
        pre_actions: [
          '{actor.0} is going to the shower and shaving the hair on their torso to their preferred length.',
        ],
      },
      mixer_Shower_Shave_Torso_Preferred_Passive: {
        pre_actions: [
          '{actor.0} is entering the shower and proceeding to shave their chest hair to their preferred length in a passive manner.',
        ],
      },
      mixer_Shower_Shave_Legs_Preferred: {
        pre_actions: [
          '{actor.0} is stepping into the shower and carefully shaving their leg hair to their preferred length.',
        ],
      },
      mixer_Shower_Shave_Legs_Preferred_Passive: {
        pre_actions: [
          '{actor.0} is taking a shower and shaving their leg hair to their preferred length.',
        ],
      },
      mixer_Shower_Shave_Face_Preferred: {
        pre_actions: [
          '{actor.0} is taking a shower and then shaving their face to their preferred length.',
        ],
      },
      mixer_Shower_Shave_Face_Preferred_Passive: {
        pre_actions: [
          "{actor.0} is using the shower to shave {actor.0}'s facial hair to the preferred length in a passive manner.",
        ],
      },
      mixer_Shower_Shave_Arms_Preferred: {
        pre_actions: [
          '{actor.0} is taking a shower and deciding to shave their arm hair to their preferred length.',
        ],
      },
      mixer_Shower_Shave_Arms_Preferred_Passive: {
        pre_actions: [
          '{actor.0} is calmly shaving their arm hair to their preferred length while in the shower.',
        ],
      },
      mixer_social_WooHooFerrisWheel_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a romantic and intimate activity as they are WooHooing on the Ferris Wheel, taking their relationship to a new level.',
        ],
      },
      mixer_social_WooHooHauntedHouse_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a passionate encounter in the haunted house, as they are taking their relationship to the next level.',
        ],
      },
      mixer_social_WooHooTunnelLove_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are passionately engaging in a romantic rendezvous, embracing in the Tunnel of Love.',
        ],
      },
      mixer_Social_Fear_Failing_Class_AskForExtraCredit: {
        pre_actions: [
          '{actor.0} is nervously asking {actor.1} about the possibility of extra credit to prevent class failure.',
        ],
      },
      mixer_social_WooHooPhotobooth_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are sneaking into a photo booth together and engaging in a steamy WooHoo session.',
        ],
      },
      mixer_Shower_Shave_Back: {
        pre_actions: [
          '{actor.0} is asking {actor.1} for help to shave their back hair while they are in the shower.',
        ],
      },
      mixer_Shower_Shave_Back_Passive: {
        pre_actions: [
          '{actor.0} is asking {actor.1} for help in shaving their back hair while they are both taking a shower.',
        ],
      },
      mixer_Shower_Shave_Back_Preferred: {
        pre_actions: [
          '{actor.0} is going into the shower and shaving their back hair to their preferred length.',
        ],
      },
      mixer_Shower_Shave_Back_Preferred_Passive: {
        pre_actions: [
          '{actor.0} is using a shower to shave their back hair to their preferred length in a passive manner.',
        ],
      },
      mixer_Social_TryForBabyInPhotobooth_targeted_romance_transition: {
        pre_actions: [
          '{actor.0} and {actor.1} are sneaking into the photo booth together, hoping to start a family and take their relationship to the next level.',
        ],
      },
      mixer_socials_SwapBabyMilestoneStories_Targeted_Friendly_AlwaysOn_STC: {
        pre_actions: [
          '{actor.0} is excitedly swapping baby milestone stories with {actor.1}.',
        ],
      },
      mixer_socials_TalkAboutSibling_Targeted_Friendly_AlwaysOn_STC_Child: {
        pre_actions: [
          '{actor.0} is engaging in a friendly conversation with {actor.1}, talking about their siblings.',
        ],
      },
      mixer_Social_BabyShower_AskIfExcitedToBeSibling: {
        pre_actions: [
          '{actor.0} is asking {actor.1} at the baby shower if they are excited to become a big sibling.',
        ],
      },
      mixer_social_BayArea_NPC_baygossip_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is taking {actor.1} aside and sharing some juicy secrets about San Sequoia, a popular destination in the Bay Area.',
        ],
      },
      mixer_Social_BabyShower_CongratulateHost: {
        pre_actions: [
          '{actor.0} is attending the baby shower and congratulating the host, {actor.1}.',
        ],
      },
      mixer_Social_BabyShower_SuggestBabyName: {
        pre_actions: [
          '{actor.0} is suggesting a baby name {actor.1} at the baby shower.',
        ],
      },
      mixer_Social_BabyShower_Gush: {
        pre_actions: [
          '{actor.0} is excitedly gushing to {actor.1} about the new baby and their upcoming baby shower.',
        ],
      },
      mixer_Social_BabyShower_GuessBabyFuture: {
        pre_actions: [
          '{actor.0} is attending a baby shower and engaging in conversation, guessing what future career the new baby may have.',
        ],
      },
      mixer_Social_BabyShower_OfferParentAdvice: {
        pre_actions: [
          '{actor.0} is attending a baby shower and offering the new parents some parenting advice.',
        ],
      },
      mixer_Social_BabyShower_AskIfExcitedToBeSibling_Toddler: {
        pre_actions: [
          '{actor.0} is asking {actor.1} at the baby shower if they are excited to be a big sibling.',
        ],
      },
      mixer_social_ComplainAboutBurnout: {
        pre_actions: [
          '{actor.0} is venting to {actor.1} about feeling burnt out and overwhelmed.',
        ],
      },
      mixer_social_ComplainAboutBurnout_Fog: {
        pre_actions: [
          '{actor.0} is voicing their frustration to {actor.1} about feeling burnt out, feeling overwhelmed by the fog.',
        ],
      },
      mixer_Social_JobLoss_AskAboutJobLoss: {
        pre_actions: [
          '{actor.0} is asking {actor.1} about their recent job loss.',
        ],
      },
      mixer_Social_JobLoss_ConsoleAboutJobLoss: {
        pre_actions: [
          '{actor.0} is consoling {actor.1} about their recent job loss, offering support and understanding during this difficult time.',
        ],
      },
      mixer_Social_JobLoss_CongratulateOnNewJob: {
        pre_actions: [
          '{actor.0} is congratulating {actor.1} on their new job.',
        ],
      },
      mixer_social_LifeMilestone_TellEpicTales: {
        pre_actions: [
          "{actor.0} is regaling {actor.1} with epic tales from {actor.0}'s life, sharing memorable experiences and achievements.",
        ],
      },
      mixer_social_WelcomeToHousehold_Friendly: {
        pre_actions: [
          '{actor.0} is warmly welcoming {actor.1} to the household.',
        ],
      },
      mixer_Social_TryForBabyAsk_Treehouse: {
        pre_actions: [
          '{actor.0} is inviting {actor.1} into the treehouse and suggesting they try for a baby together.',
        ],
      },
      mixer_Social_WooHooAsk_Treehouse: {
        pre_actions: [
          '{actor.0} is asking {actor.1} if they want to have some fun and WooHoo in the treehouse.',
        ],
      },
      mixer_social_familytrope_CheerUp_targeted_friendly_emotionSpecific: {
        pre_actions: [
          '{actor.0} is trying to cheer up their family member, {actor.1}, by offering words of encouragement and support.',
        ],
      },
      mixer_Social_SleepingBag_AskToPillowFight: {
        pre_actions: [
          '{actor.0} is inviting {actor.1} to a pillow fight, playfully challenging them to a friendly and fun competition.',
        ],
      },
      mixer_social_Toddler_Mean_CrossAge_Interactions_Kick: {
        pre_actions: [
          '{actor.0} is kicking {actor.1} in a mean-spirited act, despite the age difference.',
        ],
      },
      mixer_socials_Toddler_TalkAbouts_CrossAge_Interactions_FavoriteShow: {
        pre_actions: [
          '{actor.0} is engaging in a conversation with {actor.1} about their favorite show, bridging the age gap between them.',
        ],
      },
      mixer_socials_Toddler_TalkAbouts_CrossAge_Interactions_FavoriteGame: {
        pre_actions: [
          '{actor.0} is talking about their favorite games with {actor.1}.',
        ],
      },
      mixer_socials_Toddler_TalkAbouts_CrossAge_Interactions_FavoriteFood: {
        pre_actions: [
          '{actor.0} is engaging in a conversation with {actor.1} to discuss their favorite foods.',
        ],
      },
      mixer_socials_Toddler_Friendly_CrossAge_Interactions_SingSong: {
        pre_actions: ['{actor.0} is singing a song with {actor.1}.'],
      },
      mixer_socials_Toddler_Friendly_CrossAge_Interactions_Reassure: {
        pre_actions: [
          '{actor.0} is offering words of comfort and reassurance to {actor.1} in a friendly and supportive manner, bridging the age gap.',
        ],
      },
      mixer_Social_MidlifeCrisis_StressAboutLostTime_SadTalk: {
        pre_actions: [
          '{actor.0} is expressing their concern about lost time to {actor.1}, feeling stressed about reaching midlife and having a sad talk.',
        ],
      },
      mixer_Social_MidlifeCrisis_StressAboutLostTime_SadReact: {
        pre_actions: [
          '{actor.0} is expressing their stress about lost time to {actor.1}, possibly due to a midlife crisis, resulting in a sad reaction.',
        ],
      },
      mixer_Social_FriendshipBracelet_FistBump: {
        pre_actions: [
          '{actor.0} and {actor.1} are exchanging a friendly fist bump, solidifying their friendship.',
        ],
      },
      mixer_social_Fight_targeted_TemporaryStay: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a heated argument, resulting in a fight.',
        ],
      },
      mixer_Social_FriendshipBracelet_DemandBack: {
        pre_actions: [
          '{actor.0} is confronting {actor.1} and demanding their friendship bracelet back.',
        ],
      },
      mixer_infant_WiggleToMusic_Anticipation_Big: {
        pre_actions: [
          '{actor.0}, an infant, is wiggling in anticipation as they are reaching a milestone, under the watchful eye of {actor.1}.',
        ],
      },
      mixer_infant_WiggleToMusic_Anticipation_Small: {
        pre_actions: [
          'The infant is wiggling to the music with anticipation, reaching a milestone.',
        ],
      },
      mixer_social_Hug_Friendly_Middlescore_BestHugEver: {
        pre_actions: [
          '{actor.0} is giving {actor.1} the best hug ever, showing their friendly and affectionate nature.',
        ],
      },
      mixer_social_Hug_Friendly_Middlescore_AdoptionContinuation_CT: {
        pre_actions: [
          '{actor.0} is embracing {actor.1} in a warm and friendly hug, deepening their bond.',
        ],
      },
      mixer_social_trait_HorseLover_ShareDetailedHorseFacts_targeted_Friendly_alwaysOn_child:
        {
          pre_actions: [
            '{actor.0} enthusiastically shares detailed horse facts with {actor.1}.',
          ],
        },
      mixer_socials_TellJoke_group_Funny_alwaysOn_TellJokeAboutHorseOfCourse_trait_HorseLover:
        {
          pre_actions: [
            '{actor.0} is telling a funny joke about horses to a group, particularly targeting {actor.1}, who is known to be a horse lover.',
          ],
        },
      Mixer_social_TellJoke_group_Funny_alwaysOn_child_HorseLover_TellJokeAboutHorseButts:
        {
          pre_actions: [
            '{actor.0} is telling a joke about horse butts to {actor.1}.',
          ],
        },
      mixer_social_BragAboutRanching_Targeted_Friendly_AlwaysOn_STC: {
        pre_actions: [
          '{actor.0} is excitedly talking about their ranch to {actor.1}, wanting to share their accomplishments and knowledge in a friendly manner.',
        ],
      },
      mixer_social_HeartfeltCompliment_targeted_friendly_RanchNectar_werewolfTrash:
        {
          pre_actions: [
            '{actor.0} is kindly complimenting {actor.1} on their unique taste in trash nectar, despite the strong odor.',
          ],
        },
      mixer_Social_CountryDancing_AskToDance: {
        pre_actions: [
          '{actor.0} is asking {actor.1} if they want to join them in a country dance.',
        ],
      },
      mixer_social_HowdyIntroduction_greetings: {
        pre_actions: [
          "{actor.0} is greeting {actor.1} with a friendly 'Howdy' to introduce themselves.",
        ],
      },
      mixer_social_ShareStableGossip: {
        pre_actions: [
          '{actor.0} is sharing a juicy piece of gossip about the stable with {actor.1}.',
        ],
      },
      mixer_Social_Toddler_BabbleToHorse: {
        pre_actions: [
          '{actor.0} is excitedly babbling to {actor.1}, pretending to be having a conversation with a horse.',
        ],
      },
      mixer_Push_HorseToHorse_Touching_Groom: {
        pre_actions: [
          '{actor.0} is carefully pushing the horse closer to {actor.1} and is beginning to groom it, gently touching and caring for its coat.',
        ],
      },
      mixer_Push_HorseToHorse_Touching_Sniff: {
        pre_actions: ['{actor.0} is sniffing {actor.1}.'],
      },
      mixer_Push_HorseToHorse_Touching_Nuzzle: {
        pre_actions: [
          '{actor.0} is playfully nudging {actor.1} with their nose in a friendly and affectionate manner.',
        ],
      },
      mixer_social_AnnounceEngagement: {
        pre_actions: [
          '{actor.0} is excitedly announcing their engagement to {actor.1}.',
        ],
      },
      mixer_social_EnthuseAboutWedding: {
        pre_actions: [
          '{actor.0} is excitedly talking to {actor.1} about an upcoming wedding, sharing all the details and expressing their enthusiasm.',
        ],
      },
      mixer_social_ExpressDoubtsMarriage: {
        pre_actions: [
          '{actor.0} is expressing doubts about their impending marriage to {actor.1}.',
        ],
      },
      mixer_social_CongratulateEngagement: {
        pre_actions: [
          '{actor.0} is congratulating {actor.1} on their engagement.',
        ],
      },
      mixer_social_CongratulateMarriage: {
        pre_actions: [
          '{actor.0} is congratulating {actor.1} on their recent marriage.',
        ],
      },
      mixer_social_JokeAboutMarriage: {
        pre_actions: [
          '{actor.0} is making a playful joke about marriage to {actor.1}.',
        ],
      },
      mixer_social_AdmireNewlyweds: {
        pre_actions: [
          '{actor.0} is admiring the newlyweds, expressing their happiness for their union.',
        ],
      },
      mixer_social_GazeLovinglyNewlywed: {
        pre_actions: [
          '{actor.0} is lovingly gazing at their new spouse, admiring them with affection.',
        ],
      },
      mixer_social_AskToBeHonorAttendant: {
        pre_actions: [
          '{actor.0} is asking {actor.1} if they can be the Sim of Honor at their wedding.',
        ],
      },
      mixer_social_AskForBlessingToMarry: {
        pre_actions: [
          '{actor.0} is gathering the courage to approach {actor.1} and ask for their blessing to marry.',
        ],
      },
      mixer_social_Wedding_WeddingTradition_AskWeddingParty: {
        pre_actions: [
          '{actor.0} is asking {actor.1} to be their Sim of Honor for the wedding, following the wedding tradition of asking close friends or family members to join the wedding party.',
        ],
      },
      mixer_social_Wedding_WeddingTradition_AskToComeToWedding: {
        pre_actions: [
          '{actor.0} is asking {actor.1} if they want to come to the wedding.',
        ],
      },
      mixer_social_Wedding_Bouquet_AskAbout: {
        pre_actions: [
          '{actor.0} is asking {actor.1} about the flower bouquet.',
        ],
      },
      mixer_social_Wedding_Bouquet_AngerOverToss: {
        pre_actions: [
          '{actor.0} is confronting {actor.1} in anger over the bouquet toss incident on their wedding day.',
        ],
      },
      mixer_social_Wedding_Bouquet_JoyOverToss: {
        pre_actions: [
          '{actor.0} is excitedly cheering as {actor.1} is catching the bouquet during the wedding day bouquet toss, expressing joy over the moment.',
        ],
      },
      mixer_social_WeddingToast_AskToMakeToast: {
        pre_actions: ['{actor.0} is asking {actor.1} to make a wedding toast.'],
      },
      mixer_social_WeddingWorld_NPC_GrapevineGossip_Targeted_Friendly_AlwaysOn:
        {
          pre_actions: [
            '{actor.0} is excitedly sharing some wedding-related gossip with {actor.1}, hoping to spread the news and engage in a friendly conversation.',
          ],
        },
      mixer_Social_PurchaseWeddingCake: {
        pre_actions: [
          '{actor.0} is going to the bakery to purchase a wedding cake for their upcoming nuptials.',
        ],
      },
      mixer_social_AskToBeFlowerSpreader: {
        pre_actions: [
          '{actor.0} is asking {actor.1} if they can be the flower spreader at the wedding.',
        ],
      },
      mixer_social_AskToBeRingBearer: {
        pre_actions: [
          '{actor.0} is asking {actor.1} to be the ring bearer at the wedding.',
        ],
      },
      mixer_social_AskToBeOfficiant: {
        pre_actions: [
          '{actor.0} is asking {actor.1} if they can officiate at their wedding.',
        ],
      },
      mixer_social_ReminisceAboutWedding_targeted_Friendly_alwaysOn: {
        pre_actions: [
          '{actor.0} and {actor.1} are sharing memories and reminiscing about their wedding day.',
        ],
      },
      mixer_social_AskToBeFlowerSpreader_ChildTarget: {
        pre_actions: [
          '{actor.0} is excitedly asking the child, {actor.1}, if they can be the flower spreader at the wedding.',
        ],
      },
      mixer_social_AskToBeRingBearer_ChildTarget: {
        pre_actions: [
          '{actor.0} is excitedly asking {actor.1} if they can be the ring bearer at the wedding.',
        ],
      },
      mixer_social_EnthuseAboutWedding_ActorEngaged: {
        pre_actions: [
          '{actor.0} is excitedly talking to {actor.1} about their upcoming wedding, sharing all the details and expressing their joy.',
        ],
      },
      mixer_social_JokeAboutMarriage_ActorEngaged: {
        pre_actions: [
          '{actor.0} is playfully making a joke about marriage to {actor.1}.',
        ],
      },
      mixer_social_FriendlyIntroduction_greetings_Werewolf: {
        pre_actions: [
          '{actor.0} is sniffing {actor.1} curiously and introducing themselves.',
        ],
      },
      mixer_social_GossipAbout_targeted_friendly_alwaysOn_Werewolf: {
        pre_actions: [
          "{actor.0} is engaging in friendly conversation with {actor.1}, but can't help but is spreading beastly rumors about the target being a werewolf.",
        ],
      },
      mixer_socials_TellJoke_group_Funny_alwaysOn_Werewolf: {
        pre_actions: [
          '{actor.0} is telling a joke about werewolves to {actor.1} and anyone else listening.',
        ],
      },
      mixer_social_WhisperSeductively_targeted_romance_middleScore_Werewolf: {
        pre_actions: ['{actor.0} is whispering seductively to {actor.1}.'],
      },
      mixer_social_Insult_Mean_STC_Werewolf: {
        pre_actions: [
          "{actor.0} is mocking {actor.1}'s feeble nature, making mean-spirited comments about their weakness.",
        ],
      },
      mixer_social_YellAT_targeted_mean_Werewolf: {
        pre_actions: [
          '{actor.0}, a mean Werewolf, is aggressively snarling at {actor.1} and yelling at them.',
        ],
      },
      mixer_Social_WerewolfPack_Discuss_PackA: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a discussion about the Moonwood Collective, a topic of interest within their werewolf pack.',
        ],
      },
      mixer_Social_WerewolfPack_PraiseValue_PackA: {
        pre_actions: [
          '{actor.0} is complimenting {actor.1} on their successful career in the werewolf pack, expressing admiration for their valued contributions.',
        ],
      },
      mixer_Social_WerewolfPack_ShareConcernsAboutGreg: {
        pre_actions: [
          "{actor.0} is confiding in {actor.1} about their concerns regarding Greg's behavior within the Werewolf Pack.",
        ],
      },
      mixer_Social_WerewolfPack_DeclareSuperior_PackA: {
        pre_actions: [
          '{actor.0} is confidently declaring the Moonwood Collective as the superior werewolf pack to {actor.1}, sparking a discussion about their respective strengths and abilities.',
        ],
      },
      mixer_Social_WerewolfPack_ComplainAbout_PackA: {
        pre_actions: [
          '{actor.0} is complaining to {actor.1} about the Moonwood Collective, expressing frustration as a member of the Werewolf Pack.',
        ],
      },
      mixer_Social_WerewolfPack_ComplainAbout_PackB: {
        pre_actions: [
          '{actor.0} is complaining to {actor.1} about The Wildfangs, expressing their displeasure about the werewolf pack.',
        ],
      },
      mixer_Social_WerewolfPack_DeclareSuperior_PackB: {
        pre_actions: [
          '{actor.0} is confidently declaring the Wildfangs as the superior werewolf pack to {actor.1} during a spirited discussion.',
        ],
      },
      mixer_Social_WerewolfPack_PraiseValue_PackB: {
        pre_actions: [
          '{actor.0} is complimenting {actor.1} on their career choice in the Werewolf Pack, showing appreciation for their value and dedication.',
        ],
      },
      mixer_Social_WerewolfPack_Discuss_PackB: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a discussion about the Wildfangs, sharing stories and information about their werewolf pack.',
        ],
      },
      mixer_Social_WerewolfPack_Mock_PackA: {
        pre_actions: [
          '{actor.0} is teasingly mocking the Moonwood Collective, likely provoking a reaction from them within their werewolf pack.',
        ],
      },
      mixer_Social_WerewolfPack_Mock_PackB: {
        pre_actions: [
          '{actor.0} is playfully mocking the Wildfangs, a friendly gesture among members of the Werewolf Pack.',
        ],
      },
      mixer_Social_WerewolfPack_AskAboutPacks_Region: {
        pre_actions: [
          '{actor.0} is asking {actor.1} about the werewolf packs in the region.',
        ],
      },
      mixer_Social_WerewolfPack_AskAboutPacks_Member: {
        pre_actions: [
          '{actor.0} is asking {actor.1} about werewolf packs and if they are a member of any.',
        ],
      },
      mixer_social_Fight_targeted_mean_WerewolfToSim: {
        pre_actions: ['{actor.0} is fighting with {actor.1}.'],
      },
      mixer_social_Fight_targeted_mean_SimToWerewolf: {
        pre_actions: [
          '{actor.0} is harshly confronting {actor.1}, engaging in a fierce fight due to {actor.0} being mean and {actor.1} being a Werewolf.',
        ],
      },
      mixer_Social_Targeted_Friendly_AlwaysOn_Werewolf_AskToSpar: {
        pre_actions: ['{actor.0} asking {actor.1} if they want to spar.'],
      },
      mixer_Social_Targeted_Friendly_AlwaysOn_Werewolf_AskToSpar_AtRing: {
        pre_actions: [
          '{actor.0} is asking {actor.1} if they want to spar in the ring.',
        ],
      },
      mixer_social_Fight_targeted_mean_WerewolfToWerewolf_Start: {
        pre_actions: [
          '{actor.0} and {actor.1}, both werewolves, are engaging in a fierce brawl, fueled by their mean temperament and their werewolf nature.',
        ],
      },
      mixer_social_Fight_targeted_mean_WerewolfToVampire_Start: {
        pre_actions: [
          '{actor.0}, a mean Werewolf, is starting a Supernatural Smackdown with {actor.1}, a Vampire.',
        ],
      },
      mixer_social_Fight_targeted_mean_VampireToWerewolf_Start: {
        pre_actions: [
          '{actor.0}, a mean Vampire, is starting a supernatural smackdown with {actor.1}, a Werewolf.',
        ],
      },
      mixer_social_WolfTown_TellAboutUnderground_Friendly_MiddleScore: {
        pre_actions: [
          '{actor.0} is excitedly telling {actor.1} about the secret underground tunnels in WolfTown.',
        ],
      },
      mixer_social_AskAboutWolfTown_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is asking {actor.1} about Moonwood Mill, in a friendly and interested manner.',
        ],
      },
      mixer_Social_Targeted_Friendly_AlwaysOn_WerewolfPack_JoinTrial_AskToSpar:
        {
          pre_actions: [
            '{actor.0}, a member of the Werewolf Pack, is asking {actor.1} to participate in a trial spar.',
          ],
        },
      mixer_Social_WerewolfPack_EndFeud: {
        pre_actions: [
          '{actor.0}, from the Werewolf Pack, is asking {actor.1} to end their feud.',
        ],
      },
      mixer_Social_WerewolfPack_EndAlliance: {
        pre_actions: [
          '{actor.0} is confronting {actor.1} and declaring that their alliance with the Werewolf Pack is over.',
        ],
      },
      mixer_social_Fight_targeted_mean_WerewolfToSim_Start: {
        pre_actions: [
          '{actor.0} is starting a fight with {actor.1}, being mean and aggressive like a werewolf.',
        ],
      },
      mixer_social_Fight_targeted_mean_SimToWerewolf_Start: {
        pre_actions: [
          '{actor.0} is starting a fight with {actor.1}, being mean towards them in order to assert dominance.',
        ],
      },
      mixer_social_WhisperSeductively_targeted_romance_middleScore_Werewolf_F: {
        pre_actions: [
          '{actor.0} is whispering seductively to {actor.1}, using a low, growling tone.',
        ],
      },
      mixer_Social_Targeted_Friendly_AlwaysOn_Werewolf_AskToSpar_Commanded: {
        pre_actions: ['{actor.0} is asking {actor.1} they would like to spar.'],
      },
      mixer_Social_WerewolfPack_PackMentor: {
        pre_actions: [
          '{actor.0} is offering to provide mentorship to {actor.1} within their werewolf pack.',
        ],
      },
      mixer_social_AskAboutWerewolfInterest_Targeted_Friendly_AlwaysOn: {
        pre_actions: [
          '{actor.0} is asking {actor.1} if they are interested in becoming a werewolf.',
        ],
      },
      mixer_socials_GiveTheWerewolfTalk_Targeted_Friendly_AlwaysOn_STC: {
        pre_actions: ['{actor.0} is giving the werewolf talk with {actor.1}.'],
      },
      mixer_socials_AskAboutWerewolf_Targeted_Friendly_AlwaysOn_STC: {
        pre_actions: [
          '{actor.0} is engaging {actor.1} in a friendly conversation and is asking them about their experience being a werewolf.',
        ],
      },
      mixer_Social_WerewolfPack_DisciplineMember: {
        pre_actions: [
          '{actor.0} is assertively disciplining {actor.1}, reminding them of their responsibilities as a member of the werewolf pack.',
        ],
      },
      mixer_Social_WerewolfPack_AskAboutRank: {
        pre_actions: [
          '{actor.0} is asking {actor.1} about their pack rank to understand their status within the werewolf pack.',
        ],
      },
      mixer_Social_WerewolfPack_AskToBePackMentored: {
        pre_actions: [
          '{actor.0} is asking {actor.1} for mentorship to become a member of the werewolf pack.',
        ],
      },
      mixer_Social_Targeted_Friendly_AlwaysOn_Werewolf_AskToTugOfWar: {
        pre_actions: [
          '{actor.0} is cheerfully asking {actor.1} if they want to engage in a friendly game of Tug of War, attempting to socialize and bond with them.',
        ],
      },
      mixer_social_Fight_targeted_mean_WerewolfToSim_Start_Rampage: {
        pre_actions: [
          '{actor.0} is starting a fight with {actor.1}, unleashing their mean side and causing chaos as a werewolf.',
        ],
      },
      mixer_social_Fight_targeted_mean_WerewolfToVampire_Start_Rampage: {
        pre_actions: [
          '{actor.0} and {actor.1} are engaging in a supernatural smackdown, as the werewolf and vampire are starting a rampage, fighting each other with a mean and aggressive attitude.',
        ],
      },
      mixer_social_Fight_targeted_mean_WerewolfToWerewolf_Start_Rampage: {
        pre_actions: [
          '{actor.0} and {actor.1}, both werewolves, are starting a brutal fight, unleashing their rage and causing chaos.',
        ],
      },
      touching_RoommateKey_Socials_GiveKey: {
        pre_actions: ['{actor.0} is giving {actor.1} a key to the residence.'],
      },
      // # This is the interaction that runs right when a Sim starts to walk away towards an exit
      NPCLeaveLotNow_NPC_WaveGoodBye: {
        always_run: true,
        observations: ['{actor.0} waves goodbye and leaves {location}.'],
        // "filters": [
        //     SimInMemories({ memoryDepth:30 }),
        //     HasNotHappened({ memoryDepth:5 }),
        // ],
      },
      // # This is the interaction that runs right when a Sim leaves a lot
      NPCLeaveLot_Player_WaveGoodBye: {
        ignored: true,
      },
      npc_leave_lot_now: {
        ignored: true,
      },
      bar_OrderDrink: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} orders a drink from {actor.1} at the bar.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      'sim-stand': {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} stands up.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      seating_sit_CTYAE: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} sits down.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      Drink_Active: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} takes a swig their drink.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      Drink_Passive: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} takes a swig their drink.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      bar_OrderChips: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} orders some chips from {actor.1} at the bar.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:2 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      'toilet-use-sitting': {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} uses the toilet.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      Toilet_Use_Action: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} uses the toilet.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      sim_TalkToSelf: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} talks to themself.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      autonomous_ObjectPicker_Insane_TalkToObjects: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} talks to objects in the room like a crazy person.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      sink_washHands: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} washes their hands in the sink.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:2 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      sink_create: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} grabs some water from the sink.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:2 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      sink_BrushTeeth: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} brushes their teeth in the sink.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      mirror_GussyUp: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} freshens up in the mirror.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:2 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      'toilet-use-standing': {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} uses the toilet while standing up.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      super_SitOnGround_CrossLegged: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} sits on the ground cross legged.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:2 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      Collect_Dish: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} picks up a dish.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      sink_washDishes: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} washes a dish in the sink.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      coffeeMaker_MakeRecipe_Start_OneShot_Basic: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} starts to a make a single serve cup of coffee.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      brew_WaitFor_Pot: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} waits for the coffee to brew.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      coffeeMaker_Grab: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} grabs a cup of coffee.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      drink_Coffee_Generic_Consume: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} takes a sip from their coffee.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      stereo_danceActive: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} dances.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      stereo_Dance: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} dances.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      generic_Dance: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} dances.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      stereo_dancePassive: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} dances.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      stereo_Dance_WallSpeaker: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} dances.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      'terrain-jog': {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} starts jogging around.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      WorkoutMachine_legLifts: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} does leg lifts on the workout machine.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:2 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      WorkoutMachine_pullDowns: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} does some pulldowns on the workout machine.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:2 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      WorkoutMachine_flys: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} does some flys on the workout machine.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:2 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      sim_DrinkEnergyJuice: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} takes a sip of energy juice.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:2 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      treadmill_action1: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} runs on the treadmill.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      treadmill_action2: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} runs on the treadmill.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      sim_HygieneDistress: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} starts to feel uncomfortable because they haven't showered and they are stinky.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      punchingBag_Passive: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} punches the punching bag.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      dresser_ChangeIntoTowel: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} removes their clothes and wraps a towel around their waist.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      dresser_ChangeOutOfTowel: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} removes the towel from their waist and changes back into their clothes.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      shower_TakeShower_Steamy: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} takes a steamy shower and feels flirty when they get out.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      object_Repair_Shower: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} grabs some tools and fixes the issue with the shower.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      trash_salvage_scavenge: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} scavanges the trash pile looking for parts.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      shower_TakeShower_ColdShower: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} takes a cold shower.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      shower_TakeShower_Brisk: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} takes a brisk shower.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      shower_TakeShower_Energized: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} takes a speedy energizing shower.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      shower_TakeShower_Thoughtful: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} takes a thoughtful shower and feels inspired when they get out.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      seating_Sit: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} sits down.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      sim_doSitUpsAutonomously: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} does situps.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      sim_doPushUpsAutonomously: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} does pushups.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      sim_doPushUps_NPCSituation: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} does pushups.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      socialMixer_Greetings_Wave: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} waves at {actor.1}.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      Idle_Chatting_STC: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} idly chats with {actor.1}.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:8 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      Emotion_Idle: {
        ignored: true,
      },
      SocialPickerSI: {
        ignored: true,
      },
      social_adjustment: {
        ignored: true,
      },
      mixer_treadmill_idle: {
        ignored: true,
      },
      mixer_social_NPC_greetings: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} greets {actor.1}.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      idle_Buff_EnvironmentScore_Positive: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} is enjoying themselves being here.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      sim_Chat: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} chats with {actor.1}.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      idle_Chatting_ListenWithPhone_STC: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} messes with their phone while idly chatting with {actor.1}.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      sim_doStretching: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} stretches.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      phone_BrowseWebsites: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} browses the internet on their phone.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      phone_BrowseWebsites_AutonomousOnly: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} browses the internet on their phone.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      bar_StartPracticeTricks_CreateShaker: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} grabs a cocktail shaker to practice bar tricks.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      si_touching_Greeting_Handshake: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} shakes hands with {actor.1}.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      sit_Passive: {
        ignored: true,
      },
      bar_Tend_Passive: {
        ignored: true,
      },
      bar_Tend_Active: {
        ignored: true,
      },
      bar_CreateGlass: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} grabs a glass to make a drink.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:3 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      Bar_Pour_Basic: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} pours some liquid in the glass.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:3 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      Bar_Add_Ice: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} adds ice to the glass.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:3 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      Bar_Crafting_MakeDrink_Idles: {
        ignored: true,
      },
      Bar_EmotionResponse: {
        ignored: true,
      },
      Bar_Stir_Basic: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} stirs the drink.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:3 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      bar_ServerToSitDrinkSlot: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} sets the drink on the counter to serve it.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:3 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      bar_WaitForDrink: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} waits for their drink to be made.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:3 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      mirror_SelfPepTalk: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} gives themselves a pep talk in the mirror.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      mirror_SelfPepTalk1: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} gives themselves a pep talk in the mirror.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      mirror_SelfPepTalk2: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} gives themselves a pep talk in the mirror.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      mirror_SelfPepTalk3: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} gives themselves a pep talk in the mirror.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      mirror_SelfPepTalk4: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} gives themselves a pep talk in the mirror.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      mirror_SelfPepTalk5: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} gives themselves a pep talk in the mirror.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      bar_NonCrafting_Passive: {
        ignored: true,
      },
      generic_BarMakeDrink: {
        ignored: true,
      },
      GoHomeAndAttendWork: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} leaves to go home to attend work.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      phone_PlayGames_AutonomousOnly: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} idly plays a game on their phone.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      stand_Passive: {
        ignored: true,
      },
      bar_PushOrderDrink_Autonomous: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} walks to the bar and orders a drink.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      Bar_BottleStack_Basic: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} does a bar trick stacking multiple bottles on top of each other.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      socials_Romance_AutonomousOnly_STC: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} romantically chats with {actor.1}.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      bar_ChooseDelivery: {
        ignored: true,
      },
      generic_consume_drink_bar: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} sitting at the bar takes a swig of their drink.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      NPC_WalkBys_LeaveArea: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} walks by as they leave the area.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      sim_Carry_Object_Book: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} picks up a book.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      GoHomeAndAttendSchool: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} heads home so they can attend school.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      mixer_AtWork_SocializeWithCoworkers: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} socializes with some coworkers at work.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      mixer_AtWork_EatMeal: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} eats a meal at work.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      bed_Autonomous_SingleBed_Nap: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} jumps in the narrow single bed to take a nap.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      npc_leave_lot_now_must_run_ss3_request: {
        ignored: true,
      },
      bed_Nap: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} continues to nap on the bed.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      fridge_CookAutonomously: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} opens the fridge to make something.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      fridge_CreateTray: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} creates a tray of items from the fridge.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      Counter_CuttingBoard_Chop_Tomato: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} chops up a tomato.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      Counter_MixingBowl_Toss_Basic: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} tosses the food in the mixing bowl.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      counter_MakeFood_Staging_Basic: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} tosses the food in the mixing bowl.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      Food_Eat_Active: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} eats their food.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      Food_Eat_Passive: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} eats their food.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      Cooking_Shared_Passive_Basic: {
        ignored: true,
      },
      generic_cook: {
        ignored: true,
      },
      generic_consume_food: {
        ignored: true,
      },
      SleepMixer_Dream: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} has a dream while they are sleeping.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      sleep_Passive: {
        ignored: true,
      },
      generic_Bed_Sleep: {
        ignored: true,
      },
      bed_sleep: {
        ignored: true,
      },
      generic_ToiletSit: {
        ignored: true,
      },
      autonomous_ObjectPicker_CollectDishes: {
        ignored: true,
        // observations: ['{actor.0} picks up the dishes left out.'],
        // filters: [HasNotHappened({ memoryDepth: 10 }), InitiatorIsActiveSim()],
      },
      fridge_GrabSnackAutonomously: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} grabs a snack out of the fridge.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      fridge_CreateSnackAndConsume_Generic: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} eats their snack out of the fridge.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      reaction_SmellBad: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} smells a bad smell.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      autonomous_bookshelf_read_picker: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} grabs a book off the bookshelf to read.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      Book_Read_Active: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} reads a book.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      Book_Read_Passive: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} reads a book.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      Autonomous_Generic_Book_Read_TYAE: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} reads a book.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      mixer_AtWork_Default: {
        ignored: true,
      },
      npc_leave_lot_now_must_run: {
        ignored: true,
      },
      si_Career_Astronaut: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} finishes their day at work.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      'sim-standExclusive': {
        ignored: true,
      },
      idle_Fun: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} feels like they could use some fun.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      idle_Hygiene: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} feels dirty and wants to freshen up.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      autonomous_Bookshelf_Browse_Picker: {
        ignored: true,
      },
      FishingLocation_Cast_Dock: {
        ignored: true,
        observations: [
          '{actor.0} is on the dock and casts their fishing line.',
        ],
        filters: [HasNotHappened({ memoryDepth: 10 }), InitiatorIsActiveSim()],
      },
      Idle_Age_Teen: {
        ignored: true,
      },
      // # # TODO: Special consideration here
      // # # "door_RingDoorbell": {
      // # #     "observations": [
      // # #         "{actor.0} rings the doorbell.",
      // # #     ],
      // # #     "filters": [
      // # #         HasNotHappened({ memoryDepth:10 }),
      // # #         InitiatorIsActiveSim(),
      // # #     ],
      // # # },
      Put_Away_Books: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} puts away the books.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      book_read_browse: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} flips through the book quickly and skims the pages.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      idle_Buff_SimPreference_Likes_Activities_Cooking: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} is enjoying cooking.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      seating_sit_Bed_SitOnly_NotVisible: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} sits down on the bed.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      seating_Sit_Bed_YAE: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} sits down on the bed.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      sim_BeAffectionate: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} is affectionate to {actor.1}.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      Collect_Dish_As_Trash: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} picks up a dish and throws it in the trash.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      Collect_Dish_As_Trash_Continuation: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} picks up a dish and throws it in the trash.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      autonomous_ObjectPicker_CollectDishesAsTrash: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} picks up a dish and throws it in the trash.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      Throw_Away_Indoor: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} throws the trash in the wastebasket.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:5 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      Idle_Trait_Romantic: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} is enjoying being romantic.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      Empty_Trash: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} empties the wastebasket.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      Throw_Away_Outdoor: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} throws the trash in the outdoor garbage bin.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      tv_ChannelSurf: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} surfs the channels on tv.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      'watch-passive': {
        ignored: true,
      },
      'tv-watch-sports': {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} watches sports on tv.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      'watch-passive-withphone': {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} watches tv while on their phone.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      TV_WatchRandomChannel: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} watches a random channel on tv.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      'terrain-gohere': {
        ignored: true,
      },
      NPCLeaveLotNow_NPC_MustRun_WaveGoodBye: {
        ignored: true,
      },
      put_down_anywhere: {
        ignored: true,
      },
      si_moveAwayCircle: {
        ignored: true,
      },
      bar_NonCrafting_BottleStack: {
        ignored: true,
      },
      object_Insane_TalkToObjects: {
        ignored: true,
        observations: [
          '{actor.0} is insane and talks to the inanimate objects.',
        ],
        filters: [HasNotHappened({ memoryDepth: 10 }), InitiatorIsActiveSim()],
      },
      generic_JungleGym: {
        ignored: true,
      },
      toilet_preFlush: {
        ignored: true,
      },
      jungleGymBoat_Play: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} plays around on the jungle gym boat that has cannons and a pirate flag.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      jungleGymBoat_Active: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} plays around on the jungle gym boat that has cannons and a pirate flag.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      jungleGymBoat_Passive: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} plays around on the jungle gym boat that has cannons and a pirate flag.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      bar_PracticeTricks_DestroyShaker: {
        ignored: true,
      },
      Bar_Juggle_Basic: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} juggles the cocktail shaker as a bar trick.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      bar_Tendbar: {
        ignored: true,
      },
      bar_Clean: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} cleans up the bar and wipes it down.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      terrain_putdown: {
        ignored: true,
      },
      // # TODO: How do we figure out which object was picked up?
      carry_holdobject: {
        ignored: true,
      },
      // # TODO: How do we figure out which object was put down?
      putdownchooser: {
        ignored: true,
      },
      bar_PracticeTricks: {
        ignored: true,
      },
      reaction_AnnoyedByMess: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} looks around at the mess and feels annoyed.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      '[Join]stereo_Dance': {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} walks up to the stereo and starts dancing.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      bar_MakeDrink_Staging_basic: {
        ignored: true,
      },
      Push_Leave_Lot: {
        ignored: true,
      },
      Bar_Shake_Basic: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} shakes the drink shaker at the bar.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      bar_DestroyShaker: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} puts the bar shaker away.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      Bar_BehindTheBack_Basic: {
        ignored: true,
        // # "observations": [
        // #     "{actor.0} does a bar trick throwing the shaker behind their back.",
        // # ],
        // # "filters": [
        // #     HasNotHappened({ memoryDepth:10 }),
        // #     InitiatorIsActiveSim(),
        // # ],
      },
      social_Funny_PubertyChanges_Joke_Hair_Body: {
        pre_actions: [
          '{actor.0} is telling a joke about puberty and body hair to {non_initiator_participants}',
        ],
      },
      grill_StartCraftingAutonomously: {
        ignored: true,
      },
      grill_CreateFood: {
        ignored: true,
      },
      generic_grill: {
        ignored: true,
      },
      Idle_Buff_Pregnant: {
        ignored: true,
      },
      skatingRink_AutonomousChooser_Routine: {
        ignored: true,
      },
      skatingRink_Tricks_Stationary_Routine: {
        ignored: true,
      },
      skatingRink_AutonomousChooser_Skate: {
        ignored: true,
      },
      idle_Buff_SimPreference_Likes_Activities_Fitness: {
        ignored: true,
      },
      jungleGymBoat_Slide: {
        ignored: true,
      },
      crafting_resume: {
        ignored: true,
      },
      bar_StartCraftingAutonomously: {
        ignored: true,
      },
      FishingLocation_Catch: {
        ignored: true,
      },
      idle_Buff_EnvironmentScore_Negative: {
        ignored: true,
      },
      Grill_Flip_Bottom_Middle: {
        ignored: true,
      },
      Grill_Flip_Bottom_Left: {
        ignored: true,
      },
      Grill_Flip_Bottom_Right: {
        ignored: true,
      },
      Grill_Flip_Top_Right: {
        ignored: true,
      },
      grill_MakeRecipe_Staging: {
        ignored: true,
      },
      grill_CreateFinalFood: {
        ignored: true,
      },
      idle_Bladder: {
        ignored: true,
      },
      idle_Buff_SimPreference_DecorReaction_GothicFarmhouse: {
        ignored: true,
      },
      sim_BladderDistress: {
        ignored: true,
      },
      generic_food_Grab: {
        ignored: true,
      },
      idle_Buff_SimPreference_DecorReaction_FrenchCountry: {
        ignored: true,
      },
      werewolf_Reactions_Disgust: {
        ignored: true,
      },
      cancel_replacement_eat_to_clean: {
        ignored: true,
      },
      werewolf_Idles_NearTransformedWerewolf: {
        ignored: true,
      },
      idle_Buff_LunarCycle_3_WaxingGibbous: {
        ignored: true,
      },
      solo_Swear: {
        ignored: true,
      },
      ForceSatisfyConstraintSuperInteraction: {
        ignored: true,
      },
      werewolf_Abilities_Scavenge_Self: {
        ignored: true,
      },
      sim_TellStoryToSelf: {
        ignored: true,
      },
      BuildAndForceSatisfyShooConstraintInteraction: {
        ignored: true,
      },
      grill_Clean: {
        ignored: true,
      },
      generic_vehicle_bike_sit: {
        ignored: true,
      },
      si_SwipeIntoSimInventory: {
        ignored: true,
      },
      eat_to_clean_from_sit: {
        ignored: true,
      },
      werewolf_Idles_Greg: {
        ignored: true,
      },
      reactions_Trait_Ambitious_MischiefNearby: {
        ignored: true,
      },
      si_Touching_TwoSim_Generic: {
        ignored: true,
      },
      idle_Buff_SimPreference_DecorReaction_Luxe: {
        ignored: true,
      },
      bar_ServeDrink: {
        ignored: true,
      },
      generic_consume_drink_nonbar: {
        ignored: true,
      },
      idle_Buff_SimPreference_Likes_Activities_Mischief: {
        ignored: true,
      },
      mixer_AlienAbduction_TrackerIdle_VeryLow: {
        ignored: true,
      },
      Werewolf_Idles: {
        ignored: true,
      },
      idle_Buff_SimPreference_Likes_Activities_Comedy: {
        ignored: true,
      },
      autonomousSimPicker_Werewolf_Greg_FightAWolf: {
        ignored: true,
      },
      nonTouching_Unpaired_Greetings_Howdy: {
        pre_actions: ['{actor.0} is greeting {actor.1} with a Howdy'],
      },
      mirror_PracticeSpeech5: {
        ignored: true,
      },
      mirror_PracticeSpeech1: {
        ignored: true,
      },
      mirror_PracticeSpeech3: {
        ignored: true,
      },
      mixer_social_RegionalIntroduction_greetings: {
        ignored: true,
      },
      nonTouching_Unpaired_Greetings_RegionalIntroduction: {
        ignored: true,
      },
      celebrity_InciteCheers_Autonomous: {
        ignored: true,
      },
      celebrity_Fan_Reaction_InciteCheers: {
        ignored: true,
      },
      celebrity_Mixers_InciteCheers_Hype: {
        ignored: true,
      },
      celebrity_Mixers_InciteCheers_FistPump: {
        ignored: true,
      },
      celebrity_Self_InciteCheers: {
        ignored: true,
      },
      socialMixer_Greetings_Dismiss: {
        ignored: true,
      },
      celebrity_Mixers_InciteCheers_Point: {
        ignored: true,
      },
      Idle_Trait_Paranoid: {
        ignored: true,
      },
      idle_Trait_Paranoid_FromBuff: {
        ignored: true,
      },
      super_Bed_CrossLegged: {
        ignored: true,
      },
      reactions_Trait_Mean_InteractionFailsNearby: {
        ignored: true,
      },
      Idle_Vampire: {
        ignored: true,
      },
      idle_Buff_SimPreference_DecorReaction_Contemporary: {
        ignored: true,
      },
      Bed_Undercovers_Cry: {
        ignored: true,
      },
      generic_BedUndercovers: {
        ignored: true,
      },
      mirror_PracticeSpeech2: {
        ignored: true,
      },
      Stomp_Trash_Pile: {
        ignored: true,
      },
      Idle_Buff_Pregnant_InLabor: {
        ignored: true,
      },
      Idle_Trait_Hotheaded: {
        ignored: true,
      },
      idle_Buff_SimPreference_Likes_Activities_Fishing: {
        ignored: true,
      },
      Idle_Trait_Cheerful: {
        ignored: true,
      },
      fishingLocation_GoFishing_Spot: {
        ignored: true,
      },
      simPreference_Characteristic_Discovery_Idealist_Like: {
        ignored: true,
      },
      simPreference_Characteristic_Discovery_RomanceEnthusiast_Like: {
        ignored: true,
      },
      simPreference_Characteristic_Discovery_NatureEnthusiast_Like: {
        ignored: true,
      },
      simPreference_Characteristic_Discovery_HardWorker_Like: {
        ignored: true,
      },
      si_SwipeAddToWorld: {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_AffSuper_StripClub_Employee_ClockIn': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_AffMixer_StripClub_Customer_Mixer_Bored': {
        ignored: true,
      },
      idle_Buff_SimPreference_DecorReaction_Modern: {
        ignored: true,
      },
      Cooking_Shared_Passive_Emotion: {
        ignored: true,
      },
      Grill_Flip_FryPan: {
        ignored: true,
      },
      Cooking_Shared_AddSpice_Basic: {
        ignored: true,
      },
      sim_LaughManiacally: {
        ignored: true,
      },
      grill_MakeRecipe_FryingPan_Staging_Basic: {
        ignored: true,
      },
      idle_Buff_LunarCycle_4_FullMoon: {
        ignored: true,
      },
      reaction_Mixer_Watch_Fight_Idle: {
        ignored: true,
      },
      idle_Buff_MinorInjury: {
        ignored: true,
      },
      greetingReactionMixer_Wave: {
        ignored: true,
      },
      idle_Buff_SimPreference_DecorReaction_Patio: {
        ignored: true,
      },
      idle_Buff_SimPreference_DecorReaction_Industrial: {
        ignored: true,
      },
      idle_Buff_SimPreference_DecorReaction_Cute: {
        ignored: true,
      },
      dance_skill_action_1_seeSaw: {
        ignored: true,
      },
      dance_skill_Passive_1_Low: {
        ignored: true,
      },
      marketStalls_Open: {
        ignored: true,
      },
      idle_Buff_SimPreference_DecorReaction_Island: {
        ignored: true,
      },
      idle_Buff_SimPreference_Likes_Music_Blues: {
        ignored: true,
      },
      Foodball_Eat_Active: {
        ignored: true,
      },
      FoodBall_Eat_LastBite: {
        ignored: true,
      },
      generic_consume_foodBall: {
        ignored: true,
      },
      Idle_Trait_Active: {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_AffSuper_StripClub_Customer_ThrowMoney': {
        pre_actions: [
          '{actor.1} is dancing on the stripper pole at the strip club while {actor.0} is throwing money at {actor.1}.',
        ],
      },
      // # TODO: This is the beginning
      // # "TURBODRIVER:WickedWhims_PregnancyTermination_Init": {
      // #
      // # },
      // # TODO: This is the end
      // # "TURBODRIVER:WickedWhims_PregnancyTermination_Perform": {
      // #
      // # },
      'TURBODRIVER:WickedWhims_AffSocial_StripClub_Owner_Instruct_ToCharm': {
        pre_actions: [
          '{actor.0} is the owner of the strip club and {actor.1} is a Dancer, {actor.0} is asking {actor.1} to go welcome and talk to clients',
        ],
      },
      'TURBODRIVER:WickedWhims_AffSocial_StripClub_Owner_Socials_FireEmployee':
        {
          pre_actions: [
            '{actor.0} is the owner of the strip club and {actor.1} is a Dancer, {actor.0} is firing {actor.1} and telling them to go home',
          ],
        },
      'TURBODRIVER:WickedWhims_AffSocial_StripClub_Owner_Instruct_ToPublicDance':
        {
          pre_actions: [
            '{actor.0} is the owner of the strip club and {actor.1} is a Dancer, {actor.0} is asking {actor.1} to go dance for clients',
          ],
        },
      'TURBODRIVER:WickedWhims_AffSuper_StripClub_Employee_Shoo': {
        pre_actions: [
          '{actor.0} is firmly telling {actor.1} to leave the strip club immediately',
        ],
      },
      'TURBODRIVER:WickedWhims_AffSocial_StripClub_Owner_Instruct_ToBartender':
        {
          pre_actions: [
            '{actor.0} is the owner of the strip club and {actor.1} is a Dancer, {actor.0} is asking {actor.1} to go tend to the bar and serve drinks',
          ],
        },
      'TURBODRIVER:WickedWhims_AffSocial_StripClub_Owner_Socials_CheckUpOnEmployee':
        {
          pre_actions: [
            '{actor.0} is the owner of the strip club and {actor.1} is a Dancer, {actor.0} is checking up on {actor.1} asking how work is going',
          ],
        },
      'TURBODRIVER:WickedWhims_AffSocial_StripClub_Owner_Socials_PraiseEmployee':
        {
          pre_actions: [
            '{actor.0} is the owner of the strip club and {actor.1} is a Dancer, {actor.0} is telling {actor.1} what a great job they are doing as an employee',
          ],
        },
      'TURBODRIVER:WickedWhims_AffMixer_StripClub_Employee_SocialMixer_ClientIntroduction_Greeting':
        {
          pre_actions: [
            '{actor.1} has just entered the strip club, {actor.0} is welcoming {actor.1} to the strip club',
          ],
        },
      'TURBODRIVER:WickedWhims_Reaction_Sex_Neutral': {
        pre_actions: [
          '{actor.0} sees {actor.1} having sex and is neutrally reacting',
        ],
      },
      'TURBODRIVER:WickedWhims_Reaction_Nudity_Shock': {
        pre_actions: [
          '{actor.0} sees {actor.1} is naked and is reacting with shock',
        ],
      },
      'TURBODRIVER:WickedWhims_Attractiveness_SuggestiveLook_Look_SI': {
        pre_actions: ['{actor.0} is giving a suggestive look to {actor.1}.'],
      },
      'TURBODRIVER:WickedWhims_AffSuper_PornWatching_Computer_Masturbation_Climax':
        {
          pre_actions: [
            '{actor.0} is using the computer and watching porn and masturbating and cumming',
          ],
        },
      'TURBODRIVER:WickedWhims_AffSuper_PornWatching_Computer_Masturbation': {
        pre_actions: [
          '{actor.0} is using the computer and watching porn and masturbating.',
        ],
      },
      'TURBODRIVER:WickedWhims_AffSocial_Peeping_BeatUpSim': {
        pre_actions: [
          '{actor.0} notices {actor.1} is inappropriately peeping through the windows and {actor.0} starts physically fighting {actor.1}.',
        ],
      },
      'TURBODRIVER:WickedWhims_Mixer_Social_AskAboutHealth_STD': {
        pre_actions: ['{actor.0} is asking {actor.1} about their STD health.'],
      },
      'TURBODRIVER:WickedWhims_AffMixer_PornWatching_TV_Masturbate': {
        pre_actions: ['{actor.0} is masturbating watching porn on TV.'],
      },
      'TURBODRIVER:WickedWhims_AffSuper_Flash_Social_Boobs': {
        pre_actions: ['{actor.0} is flashing their boobs at {actor.1}.'],
      },
      'TURBODRIVER:WickedWhims_AffSocialMixer_Nudity_DiscussInterestInNudism': {
        pre_actions: [
          '{actor.0} discusses their interest in nudism with {actor.1}.',
        ],
      },
      'TURBODRIVER:WickedWhims_Vampires_MindPowers_Command_Undress': {
        pre_actions: [
          '{actor.0} uses their mind powers to command {actor.1} to undress.',
        ],
      },
      'TURBODRIVER:WickedWhims_AffMixer_BirthControl_AskResumeUseProtection': {
        pre_actions: ['{actor.0} is asking {actor.1} to use birth control.'],
      },
      'TURBODRIVER:WickedWhims_AffSuper_Flash_Social_Butt': {
        pre_actions: ['{actor.0} flashes {actor.1} with their ass cheeks.'],
      },
      TURBORIVER_WickedWhims_AffSocialMixer_LewdDream_TellAboutLewdDream: {
        pre_actions: [
          '{actor.0} is discussing their lewd dream with {actor.1}.',
        ],
      },
      'TURBODRIVER:WickedWhims_Social_Mixer_Talk_About_Fertility': {
        pre_actions: ['{actor.0} is talking to {actor.1} about fertility.'],
      },
      'TURBODRIVER:WickedWhims_Social_Mixer_Talk_About_Sex_Fantasies': {
        pre_actions: [
          "{actor.0} is talking to {actor.1} about {actor.0}'s sex fantasies.",
        ],
      },
      'TURBODRIVER:WickedWhims_AffSuper_AskForSex_Default_Standing': {
        pre_actions: [
          '{actor.0} is asking {actor.1} if they want to find somewhere to have sex right now.',
        ],
      },
      'TURBODRIVER:WickedWhims_Social_AskAboutAttractivenessPreferences': {
        pre_actions: [
          '{actor.0} is beginning asking {actor.1} about what kind of attractiveness preferences {actor.1} has.',
        ],
      },
      'TURBODRIVER:WickedWhims_AffSuper_StripClub_Employee_Dancing_Pole_Start':
        {
          ignored: true,
        },
      'TURBODRIVER:WickedWhims_Nudity_Undress_Top': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_Sex_LeaveSex': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_InstantUndress_Outfit': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_Sex_Start_Anal': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_Autonomy_Ask_For_Sex_Default': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_Apply_BackLower_Cum': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_Sex_ChangeAnimation_Oraljob': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_Sex_Start_Handjob': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_Sex_Start_Playlist': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_Sex_Start_Footjob': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_Sex_NPC_JoinSex_InviteIn': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_Apply_Feet_Cum': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_Sex_Start_Vaginal': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_Routing_GoToSexDestination': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_Apply_Vagina_Cum': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_Change_NPC_Sex_Climax': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_Nudity_Put_On_Underwear': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_Use_Period_Pad': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_AffSuper_BirthControl_TakeBirthControlPill': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_Use_Period_Tampon_Toilet': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_Sex_Positioning_Core_RotationIncrement_Custom': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_Sex_NPC_LeaveSex': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_AffSuper_Strapon_ToggleEquipState': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_Nudity_Undress_Underwear_Bottom': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_Sex_Positioning_Core_AxisIncrement_Custom': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_Sex_Positioning_EnableDisable': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_AffSuper_SexControl_AdjustSexAutonomyProbability':
        {
          ignored: true,
        },
      'TURBODRIVER:WickedWhims_AffSuper_StripClub_Owner_Phone_BuyLot': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_AffSuper_StripClub_Employee_Dancing_RouteToDestination':
        {
          ignored: true,
        },
      'TURBODRIVER:WickedWhims_AffSuper_StripClub_Customer_Visit': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_Go_Home': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_AffSuper_StripClub_Employee_Dancing_Spot_Start':
        {
          ignored: true,
        },
      'TURBODRIVER:WickedWhims_AffSuper_StripClub_Animation_Default': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_AffMixer_StripClub_Customer_Mixer_Cheer': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_AffSuper_StripClub_Customer_WatchDancer_Transition':
        {
          ignored: true,
        },
      'TURBODRIVER:WickedWhims_AffMixer_StripClub_Employee_Mixer_Slacking_Phone':
        {
          ignored: true,
        },
      'TURBODRIVER:WickedWhims_AffMixer_StripClub_Employee_Mixer_SexyPose': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_AffSuper_StripClub_Customer_ComplainAtBar': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_AffSuper_StripClub_Customer_WatchDancer': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_AffMixer_StripClub_Customer_SocialMixer_ClientIntroduction_Greeting':
        {
          ignored: true,
        },
      'TURBODRIVER:WickedWhims_AffSuper_StripClub_Customer_WaitForDancer': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_AffSuper_StripClub_Employee_ChangeIntoCareerOutfit':
        {
          ignored: true,
        },
      WickedWhims_AffMixer_StripClub_Employee_TiredFromDancing: {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_Sex_Animation_Default': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_Sex_Animation_Default_Puppet': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_AffSuper_StripClub_Customer_Puke': {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_AffSuper_Mop_Vomit_Puddle': {
        ignored: true,
      },
      sim_Carry_OpenUmbrella: {
        observations: ['{actor.0} is opening {actor.0.him/her} umbrella'],
        ignored: true,
      },
      Sim_RainStart_Reaction: {
        ignored: true,
      },
      computer_AnimalObject_GoatSheep_Purchase: {
        ignored: true,
      },
      Computer_Browse_Mouse: {
        ignored: true,
      },
      computer_Browse_ParentingSkill_BrowseForums: {
        ignored: true,
      },
      Computer_Use_PlayGame_Mild: {
        ignored: true,
      },
      cancelReplacements_ReadtoCarry: {
        ignored: true,
      },
      Computer_Use_PlayGame_Intense: {
        ignored: true,
      },
      Computer_Use_React_Positive: {
        ignored: true,
      },
      Computer_Use_React_Negative: {
        ignored: true,
      },
      waypoint_Rain_Outside_Play: {
        ignored: true,
      },
      book_read: {
        ignored: true,
      },
      Computer_Chat_Keyboard: {
        ignored: true,
      },
      computer_Postcards_FindNewPenpal: {
        ignored: true,
      },
      computer_Recreation_Autonomous_PseudoAggregate_PlayGame: {
        ignored: true,
      },
      'computer_PlayGame_SimScuffle_E-Sports': {
        ignored: true,
      },
      Computer_Use_Type: {
        ignored: true,
      },
      idle_Buff_SimPreference_Likes_Activities_VideoGaming: {
        ignored: true,
      },
      chess_setup: {
        ignored: true,
      },
      chess_practice: {
        ignored: true,
      },
      chess_idle_solo: {
        ignored: true,
      },
      computer_PlayGame_Blicblock: {
        ignored: true,
      },
      computer_PlayGame_SimsForeverRenamed: {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_Idle_Cramps_Pain': {
        ignored: true,
      },
      autonomous_ObjectPicker_Computer_NPCUse: {
        ignored: true,
      },
      computer_PracticeWritingSkill: {
        ignored: true,
      },
      'toilet-flush': {
        ignored: true,
      },
      computer_PlayGame_Hillock: {
        ignored: true,
      },
      computer_UseFromInventory_NPC: {
        ignored: true,
      },
      computer_Browse_Web: {
        ignored: true,
      },
      Computer_Browse_Keyboard: {
        ignored: true,
      },
      idle_Hunger: {
        ignored: true,
      },
      tableDining_Clean: {
        ignored: true,
      },
      toilet_Clean: {
        ignored: true,
      },
      social_Funny_PubertyChanges_Joke_Hair_Face: {
        pre_actions: [
          '{actor.0} is making a puberty joke about facial hair with {non_initiator_participants}',
        ],
      },
      marketStalls_Mixers_Wave: {
        ignored: true,
      },
      Mirror_CalmSelfDown2: {
        ignored: true,
      },
      Mirror_CalmSelfDown3: {
        ignored: true,
      },
      marketStalls_Mixers_Tend: {
        ignored: true,
      },
      marketStalls_Mixers_Passive: {
        ignored: true,
      },
      mirror_CalmSelfDown: {
        ignored: true,
      },
      marketStalls_Mixers_ShowOff: {
        ignored: true,
      },
      generic_Consume_Drink_marketStall: {
        ignored: true,
      },
      marketStalls_Browse: {
        ignored: true,
      },
      marketStalls_ChooseFoodDelivery: {
        ignored: true,
      },
      MarketStalls_CreateAndServeFoodToSlot: {
        ignored: true,
      },
      Mirror_CalmSelfDown1: {
        ignored: true,
      },
      Earbuds_Jogger_GiveEarBuds_Mixer: {
        ignored: true,
      },
      si_marketStalls_OrderDrink: {
        ignored: true,
      },
      si_MarketStalls_WaitForDrink: {
        ignored: true,
      },
      sink_Clean: {
        ignored: true,
      },
      paparazzi_Idle: {
        ignored: true,
      },
      marketStalls_PushOrderDrink_Autonomous_Seasonal_Fall: {
        ignored: true,
      },
      idle_Buff_SimPreference_DecorReaction_Tutor: {
        ignored: true,
      },
      marketStalls_PushOrderFood_Autonomous_Seasonal_Fall: {
        ignored: true,
      },
      paparazzi_Reaction_Positive: {
        ignored: true,
      },
      idle_Buff_SimPreference_DecorReaction_ScandinavianContemporary: {
        ignored: true,
      },
      autonomous_ObjectPicker_SimPreference_Decor_FrenchCountry: {
        ignored: true,
      },
      simPreference_DecorReaction_FrenchCountry: {
        ignored: true,
      },
      idle_Buff_SimPreference_DecorReaction_Shabby: {
        ignored: true,
      },
      idle_Buff_SimPreference_DecorReaction_Boho: {
        ignored: true,
      },
      sim_Umbrella_CloseUmbrella: {
        ignored: true,
      },
      goHomeForRabbitHoleInteraction_generic: {
        ignored: true,
      },
      mixer_AtWork_SolveBladder: {
        ignored: true,
      },
      idle_Energy: {
        ignored: true,
      },
      bed_Autonomous_DoubleBed_Sleep: {
        ignored: true,
      },
      si_Rabbithole_CommunityCloseness_TheMotiveGames: {
        ignored: true,
      },
      'TURBODRIVER:WickedWhims_AffSuper_Peeping_FindWindow_Trigger': {
        ignored: true,
      },
    })
  );
