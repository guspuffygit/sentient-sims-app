import { TraitDescription } from '../models/TraitDescription';

export enum PostureType {
  FINAL = 'FINAL',
}

export type PostureDescription = TraitDescription & {
  posture_type?: PostureType;
};

export const postureDescriptions: Record<string, PostureDescription> = {
  posture_PunchingBag: {
    name: 'posture_PunchingBag',
    description: 'punching the punching bag',
  },
  posture_Microscope: {
    name: 'posture_Microscope',
    ignored: true,
    description: '',
  },
  posture_BarMakeDrink: {
    name: 'posture_BarMakeDrink',
    description: 'making a drink',
  },
  posture_BathTubTakeBath: {
    name: 'posture_BathTubTakeBath',
    description: 'taking a bath',
  },
  posture_BedNap: {
    name: 'posture_BedNap',
    description: 'napping on the bed',
    posture_type: PostureType.FINAL,
  },
  posture_BedRelax: {
    name: 'posture_BedRelax',
    description: 'relaxing on the bed',
    posture_type: PostureType.FINAL,
  },
  posture_BedSleep: {
    name: 'posture_BedSleep',
    description: 'sleeping in the bed',
    posture_type: PostureType.FINAL,
  },
  posture_BedWoohoo: {
    name: 'posture_BedWoohoo',
    description: 'having sex in the bed',
    posture_type: PostureType.FINAL,
  },
  posture_CarryNothing: {
    name: 'posture_CarryNothing',
    ignored: true,
    description: '',
  },
  posture_CarryObject: {
    name: 'posture_CarryObject',
    ignored: true,
    description: '',
  },
  posture_Cook: {
    name: 'posture_Cook',
    description: 'cooking',
  },
  posture_Dance: {
    name: 'posture_Dance',
    description: 'dancing',
  },
  posture_Kneel: {
    name: 'posture_Kneel',
    description: 'kneeling',
  },
  posture_MonkeyBarsHangOut: {
    name: 'posture_MonkeyBarsHangOut',
    description: 'hanging on the monkey bars',
    posture_type: PostureType.FINAL,
  },
  posture_MonkeyBarsPlay: {
    name: 'posture_MonkeyBarsPlay',
    description: 'playing on the monkey bars',
    posture_type: PostureType.FINAL,
  },
  posture_RocketShipWoohoo: {
    name: 'posture_RocketShipWoohoo',
    description: 'having sex on the rocket ship',
    posture_type: PostureType.FINAL,
  },
  posture_Shower: {
    name: 'posture_Shower',
    description: 'showering',
    posture_type: PostureType.FINAL,
  },
  posture_ShowerClean: {
    name: 'posture_ShowerClean',
    description: 'cleaning the shower',
    posture_type: PostureType.FINAL,
  },
  posture_Sit: {
    name: 'posture_Sit',
    description: 'sitting',
  },
  posture_SitIntimate: {
    name: 'posture_SitIntimate',
    description: 'intimately sitting',
  },
  posture_Stand: {
    name: 'posture_Stand',
    description: 'standing',
  },
  posture_TelescopeWoohoo: {
    name: 'posture_TelescopeWoohoo',
    description: 'having sex in the telescope',
    posture_type: PostureType.FINAL,
  },
  posture_ToiletSit: {
    name: 'posture_ToiletSit',
    description: 'sitting on the toilet',
    posture_type: PostureType.FINAL,
  },
  posture_ToiletStand: {
    name: 'posture_ToiletStand',
    description: 'standing and using the toilet',
  },
  posture_Treadmill: {
    name: 'posture_Treadmill',
    description: 'on the treadmill',
    posture_type: PostureType.FINAL,
  },
  posture_WorkoutMachine: {
    name: 'posture_WorkoutMachine',
    description: 'on the workout machine',
    posture_type: PostureType.FINAL,
  },
  posture_StandExclusive: {
    name: 'posture_StandExclusive',
    description: 'standing',
  },
  posture_SofaNap: {
    name: 'posture_SofaNap',
    description: 'napping on the sofa',
    posture_type: PostureType.FINAL,
  },
  posture_MovingStand: {
    name: 'posture_MovingStand',
    ignored: true,
    description: '',
  },
  posture_BedUndercovers: {
    name: 'posture_BedUndercovers',
    description: 'under the bed covers',
    posture_type: PostureType.FINAL,
  },
  posture_Observatory: {
    name: 'posture_Observatory',
    ignored: true,
    description: '',
  },
  posture_Rocketship: {
    name: 'posture_Rocketship',
    ignored: true,
    description: '',
  },
  posture_Grill: {
    name: 'posture_Grill',
    description: 'grilling food on the grill',
    posture_type: PostureType.FINAL,
  },
  posture_BathTub_BubbleBath: {
    name: 'posture_BathTub_BubbleBath',
    description: 'in the bubble bath',
    posture_type: PostureType.FINAL,
  },
  posture_JungleGym: {
    name: 'posture_JungleGym',
    description: 'on the jungle gym',
    posture_type: PostureType.FINAL,
  },
  posture_MotionBasedGaming: {
    name: 'posture_MotionBasedGaming',
    description: 'on the motion based gaming machine',
    posture_type: PostureType.FINAL,
  },
  posture_PublicBathroom: {
    name: 'posture_PublicBathroom',
    description: 'using',
  },
  posture_Swim: {
    name: 'posture_Swim',
    description: 'swimming',
  },
  posture_RabbitHole_Tree: {
    name: 'posture_RabbitHole_Tree',
    ignored: true,
    description: '',
  },
  posture_RabbitHole_Cave: {
    name: 'posture_RabbitHole_Cave',
    ignored: true,
    description: '',
  },
  posture_TentWoohoo: {
    name: 'posture_TentWoohoo',
    description: 'having sex in the tent',
    posture_type: PostureType.FINAL,
  },
  posture_Tent: {
    name: 'posture_Tent',
    description: 'in the tent',
    posture_type: PostureType.FINAL,
  },
  posture_SitPoolEdge: {
    name: 'posture_SitPoolEdge',
    description: 'sitting on the pool edge',
    posture_type: PostureType.FINAL,
  },
  posture_Stargaze: {
    name: 'posture_Stargaze',
    description: 'laying on th',
  },
  posture_hospitalExamBed_Sit: {
    name: 'posture_hospitalExamBed_Sit',
    description: 'sitting on the hospital exam bed',
    posture_type: PostureType.FINAL,
  },
  posture_HoldingCellDoor: {
    name: 'posture_HoldingCellDoor',
    description: 'holding the cell door open',
    posture_type: PostureType.FINAL,
  },
  posture_hospitalExamBed_Stand: {
    name: 'posture_hospitalExamBed_Stand',
    description: 'standing at the hospital exam bed',
    posture_type: PostureType.FINAL,
  },
  posture_HotTubStand: {
    name: 'posture_HotTubStand',
    description: 'standing in the hot tub',
    posture_type: PostureType.FINAL,
  },
  posture_HotTubSit: {
    name: 'posture_HotTubSit',
    description: 'sitting in the hot tub',
    posture_type: PostureType.FINAL,
  },
  posture_HottubWoohoo: {
    name: 'posture_HottubWoohoo',
    description: 'having sex in the hot tub',
    posture_type: PostureType.FINAL,
  },
  posture_SteamRoomSit: {
    name: 'posture_SteamRoomSit',
    description: 'sitting in the steam room',
    posture_type: PostureType.FINAL,
  },
  posture_LayDownOnGround: {
    name: 'posture_LayDownOnGround',
    description: 'laying down on the ground',
    posture_type: PostureType.FINAL,
  },
  posture_InteractiveBush: {
    name: 'posture_InteractiveBush',
    ignored: true,
    description: '',
  },
  posture_BushWooHoo: {
    name: 'posture_BushWooHoo',
    description: 'having sex in the bush',
    posture_type: PostureType.FINAL,
  },
  posture_Bonfire_standIntimate: {
    name: 'posture_Bonfire_standIntimate',
    description: 'standing intimately near the bonfire',
  },
  posture_interactiveBush_FertilizeStanding: {
    name: 'posture_interactiveBush_FertilizeStanding',
    ignored: true,
    description: '',
  },
  posture_Dartboard: {
    name: 'posture_Dartboard',
    ignored: true,
    description: '',
  },
  posture_SitIntimateBooth: {
    name: 'posture_SitIntimateBooth',
    ignored: true,
    description: '',
  },
  posture_Fountain: {
    name: 'posture_Fountain',
    ignored: true,
    description: '',
  },
  posture_SitTogether: {
    name: 'posture_SitTogether',
    description: 'sitting',
  },
  posture_CarrySim: {
    name: 'posture_CarrySim',
    ignored: true,
    description: '',
  },
  posture_BeCarried: {
    name: 'posture_BeCarried',
    ignored: true,
    description: '',
  },
  posture_SitOnGround: {
    name: 'posture_SitOnGround',
    description: 'sitting on the ground',
    posture_type: PostureType.FINAL,
  },
  posture_SitInHighChair: {
    name: 'posture_SitInHighChair',
    description: 'sitting in the high chair',
    posture_type: PostureType.FINAL,
  },
  posture_Baththub_ToddlerInfantBath: {
    name: 'posture_Baththub_ToddlerInfantBath',
    ignored: true,
    description: '',
  },
  posture_PottyChairSit: {
    name: 'posture_PottyChairSit',
    ignored: true,
    description: '',
  },
  posture_CoffinSleep: {
    name: 'posture_CoffinSleep',
    description: 'sleeping in the coffin',
    posture_type: PostureType.FINAL,
  },
  posture_CoffinWooHoo: {
    name: 'posture_CoffinWooHoo',
    description: 'having sex in the coffin',
  },
  posture_Toddler_JungleGym_Slide: {
    name: 'posture_Toddler_JungleGym_Slide',
    description: 'sliding down the jungle gym slide',
    posture_type: PostureType.FINAL,
  },
  posture_SwingSet: {
    name: 'posture_SwingSet',
    description: 'swinging on the swing set',
    posture_type: PostureType.FINAL,
  },
  posture_floating: {
    name: 'posture_floating',
    description: 'floating',
  },
  posture_LoungeChair: {
    name: 'posture_LoungeChair',
    ignored: true,
    description: '',
  },
  posture_Vehicle_Bike_Sit: {
    name: 'posture_Vehicle_Bike_Sit',
    ignored: true,
    description: '',
  },
  posture_SitLoungeFloat: {
    name: 'posture_SitLoungeFloat',
    description: 'sitting on a lounge float in the water',
    posture_type: PostureType.FINAL,
  },
  posture_ToiletStand_Stall: {
    name: 'posture_ToiletStand_Stall',
    ignored: true,
    description: '',
  },
  posture_ToiletSit_Stall: {
    name: 'posture_ToiletSit_Stall',
    ignored: true,
    description: '',
  },
  posture_Sit_RockingChair: {
    name: 'posture_Sit_RockingChair',
    ignored: true,
    description: '',
  },
  posture_Sit_Chaise: {
    name: 'posture_Sit_Chaise',
    ignored: true,
    description: '',
  },
  posture_CarrySim_Back: {
    name: 'posture_CarrySim_Back',
    ignored: true,
    description: '',
  },
  posture_PairedDancing: {
    name: 'posture_PairedDancing',
    ignored: true,
    description: '',
  },
  posture_infant_layonback: {
    name: 'posture_infant_layonback',
    ignored: true,
    description: '',
  },
  posture_Infant_layontummy: {
    name: 'posture_Infant_layontummy',
    ignored: true,
    description: '',
  },
  posture_LayOnBackOnObject: {
    name: 'posture_LayOnBackOnObject',
    ignored: true,
    description: '',
  },
  posture_LayOnStomachOnObject: {
    name: 'posture_LayOnStomachOnObject',
    ignored: true,
    description: '',
  },
  posture_SitOnObject: {
    name: 'posture_SitOnObject',
    ignored: true,
    description: '',
  },
  posture_SitInHighChair_Feed: {
    name: 'posture_SitInHighChair_Feed',
    ignored: true,
    description: '',
  },
  posture_TableChangeDiaper: {
    name: 'posture_TableChangeDiaper',
    ignored: true,
    description: '',
  },
  posture_CrossLegged: {
    name: 'posture_CrossLegged',
    ignored: true,
    description: '',
  },
  posture_CribSleep: {
    name: 'posture_CribSleep',
    ignored: true,
    description: '',
  },
  posture_SmallTelescope: {
    name: 'posture_SmallTelescope',
    ignored: true,
    description: '',
  },
  posture_GroupDancing_BG: {
    name: 'posture_GroupDancing_BG',
    ignored: true,
    description: '',
  },
  posture_SleepingBagSleep: {
    name: 'posture_SleepingBagSleep',
    ignored: true,
    description: '',
  },
  posture_SleepingBagCrosslegged: {
    name: 'posture_SleepingBagCrosslegged',
    ignored: true,
    description: '',
  },
  posture_SleepingBagNap: {
    name: 'posture_SleepingBagNap',
    ignored: true,
    description: '',
  },
  posture_SleepingBagToddlerSit: {
    name: 'posture_SleepingBagToddlerSit',
    ignored: true,
    description: '',
  },
  posture_BirthdayCake: {
    name: 'posture_BirthdayCake',
    ignored: true,
    description: '',
  },
  posture_OuthouseWooHoo: {
    name: 'posture_OuthouseWooHoo',
    description: 'having sex in the outhouse',
    posture_type: PostureType.FINAL,
  },
  posture_Outhouse: {
    name: 'posture_Outhouse',
    ignored: true,
    description: '',
  },
  posture_RabbitHole_Bramble: {
    name: 'posture_RabbitHole_Bramble',
    ignored: true,
    description: '',
  },
  posture_XrayMachine_ScanPatient: {
    name: 'posture_XrayMachine_ScanPatient',
    ignored: true,
    description: '',
  },
  posture_hospitalExamBed_Recline: {
    name: 'posture_hospitalExamBed_Recline',
    description: 'reclined in the hospital exam bed',
    posture_type: PostureType.FINAL,
  },
  posture_BookingStation: {
    name: 'posture_BookingStation',
    ignored: true,
    description: '',
  },
  posture_XrayMachine_ScanDoctor: {
    name: 'posture_XrayMachine_ScanDoctor',
    ignored: true,
    description: '',
  },
  posture_SurgeryTable_Doctor_Stand: {
    name: 'posture_SurgeryTable_Doctor_Stand',
    ignored: true,
    description: '',
  },
  posture_SurgeryTable_Patient_Recline: {
    name: 'posture_SurgeryTable_Patient_Recline',
    ignored: true,
    description: '',
  },
  posture_AlienPortal: {
    name: 'posture_AlienPortal',
    ignored: true,
    description: '',
  },
  posture_HospitalTreadmill_Doctor: {
    name: 'posture_HospitalTreadmill_Doctor',
    ignored: true,
    description: '',
  },
  posture_HospitalTreadmill_PatientWait: {
    name: 'posture_HospitalTreadmill_PatientWait',
    ignored: true,
    description: '',
  },
  posture_Yoga: {
    name: 'posture_Yoga',
    ignored: true,
    description: '',
  },
  posture_MassageTableCustomer: {
    name: 'posture_MassageTableCustomer',
    ignored: true,
    description: '',
  },
  posture_Meditate_Meditation: {
    name: 'posture_Meditate_Meditation',
    ignored: true,
    description: '',
  },
  posture_Meditate_Levitation: {
    name: 'posture_Meditate_Levitation',
    ignored: true,
    description: '',
  },
  posture_MassageChair_Reclined: {
    name: 'posture_MassageChair_Reclined',
    description: 'in the reclined massage chair',
    posture_type: PostureType.FINAL,
  },
  posture_SteamRoomWooHoo: {
    name: 'posture_SteamRoomWooHoo',
    description: 'having sex in the steam room',
  },
  posture_MassageChair_FootMassage_Left: {
    name: 'posture_MassageChair_FootMassage_Left',
    ignored: true,
    description: '',
  },
  posture_MassageChair_FootMassage_Right: {
    name: 'posture_MassageChair_FootMassage_Right',
    ignored: true,
    description: '',
  },
  posture_MassageTableTherapist: {
    name: 'posture_MassageTableTherapist',
    ignored: true,
    description: '',
  },
  posture_RelaxingBath: {
    name: 'posture_RelaxingBath',
    ignored: true,
    description: '',
  },
  posture_DJBooth: {
    name: 'posture_DJBooth',
    ignored: true,
    description: '',
  },
  posture_FoosballTable: {
    name: 'posture_FoosballTable',
    ignored: true,
    description: '',
  },
  posture_Closet: {
    name: 'posture_Closet',
    ignored: true,
    description: '',
  },
  posture_ClosetWooHoo: {
    name: 'posture_ClosetWooHoo',
    description: 'having sex in the closet',
  },
  posture_Dancefloor: {
    name: 'posture_Dancefloor',
    ignored: true,
    description: '',
  },
  posture_RabbitHole_EuroBramble: {
    name: 'posture_RabbitHole_EuroBramble',
    ignored: true,
    description: '',
  },
  posture_ArcadeMachine: {
    name: 'posture_ArcadeMachine',
    ignored: true,
    description: '',
  },
  posture_JumpStand: {
    name: 'posture_JumpStand',
    ignored: true,
    description: '',
  },
  posture_GroupDance: {
    name: 'posture_GroupDance',
    ignored: true,
    description: '',
  },
  posture_WatchIntimate: {
    name: 'posture_WatchIntimate',
    ignored: true,
    description: '',
  },
  posture_PuppetTheater: {
    name: 'posture_PuppetTheater',
    ignored: true,
    description: '',
  },
  posture_KidTent: {
    name: 'posture_KidTent',
    ignored: true,
    description: '',
  },
  posture_KaraokeMachine: {
    name: 'posture_KaraokeMachine',
    ignored: true,
    description: '',
  },
  posture_StandOnObject: {
    name: 'posture_StandOnObject',
    ignored: true,
    description: '',
  },
  posture_LayDown: {
    name: 'posture_LayDown',
    ignored: true,
    description: '',
  },
  posture_PetIntimate: {
    name: 'posture_PetIntimate',
    ignored: true,
    description: '',
  },
  vet_ExamTable_Postures_Pet: {
    name: 'vet_ExamTable_Postures_Pet',
    ignored: true,
    description: '',
  },
  vet_ExamTable_Postures_Vet: {
    name: 'vet_ExamTable_Postures_Vet',
    ignored: true,
    description: '',
  },
  posture_Bathtub_PetBath: {
    name: 'posture_Bathtub_PetBath',
    ignored: true,
    description: '',
  },
  vet_Surgery_Postures_Vet: {
    name: 'vet_Surgery_Postures_Vet',
    ignored: true,
    description: '',
  },
  posture_Sit_RobotVacuum: {
    name: 'posture_Sit_RobotVacuum',
    ignored: true,
    description: '',
  },
  vet_Surgery_Postures_Pet: {
    name: 'vet_Surgery_Postures_Pet',
    ignored: true,
    description: '',
  },
  posture_LighthouseWooHoo: {
    name: 'posture_LighthouseWooHoo',
    description: 'having sex in the lighthouse',
    posture_type: PostureType.FINAL,
  },
  posture_HideUnderObject: {
    name: 'posture_HideUnderObject',
    ignored: true,
    description: '',
  },
  posture_IceSkate: {
    name: 'posture_IceSkate',
    description: 'ice skating',
  },
  posture_RollerSkate: {
    name: 'posture_RollerSkate',
    description: 'roller skating',
  },
  posture_LeafPileWoohoo: {
    name: 'posture_LeafPileWoohoo',
    description: 'having sex in the leaf pile',
    posture_type: PostureType.FINAL,
  },
  posture_KiddiePool_GivePool: {
    name: 'posture_KiddiePool_GivePool',
    ignored: true,
    description: '',
  },
  posture_KiddiePool_Lounge: {
    name: 'posture_KiddiePool_Lounge',
    ignored: true,
    description: '',
  },
  posture_HairMakeUpChair_Hair: {
    name: 'posture_HairMakeUpChair_Hair',
    ignored: true,
    description: '',
  },
  posture_HairMakeUpChair_MakeUp: {
    name: 'posture_HairMakeUpChair_MakeUp',
    ignored: true,
    description: '',
  },
  posture_WardrobePedestal: {
    name: 'posture_WardrobePedestal',
    ignored: true,
    description: '',
  },
  posture_WalkInSafeWooHoo: {
    name: 'posture_WalkInSafeWooHoo',
    description: 'having sex in the walk-in safe',
    posture_type: PostureType.FINAL,
  },
  SleepingPod_Sleep: {
    name: 'SleepingPod_Sleep',
    description: 'sleeping in the sleeping pod',
    posture_type: PostureType.FINAL,
  },
  posture_SleepingPodWooHoo: {
    name: 'posture_SleepingPodWooHoo',
    description: 'having sex in the sleeping pod',
    posture_type: PostureType.FINAL,
  },
  posture_DenizenSwims: {
    name: 'posture_DenizenSwims',
    ignored: true,
    description: '',
  },
  posture_WaterScooter: {
    name: 'posture_WaterScooter',
    description: '',
  },
  posture_IslandCanoe: {
    name: 'posture_IslandCanoe',
    description: 'sailing around on the island canoe',
    posture_type: PostureType.FINAL,
  },
  posture_IslandWaterfallWooHoo: {
    name: 'posture_IslandWaterfallWooHoo',
    description: 'having sex in the island waterfall',
    posture_type: PostureType.FINAL,
  },
  posture_IslandWaterfall_Play: {
    name: 'posture_IslandWaterfall_Play',
    description: 'playing in the island waterfall',
    posture_type: PostureType.FINAL,
  },
  posture_IslandCanoe_Sit: {
    name: 'posture_IslandCanoe_Sit',
    description: 'sitting in the island canoe',
    posture_type: PostureType.FINAL,
  },
  posture_IslandCanoe_Stand: {
    name: 'posture_IslandCanoe_Stand',
    description: 'standing in the island canoe',
    posture_type: PostureType.FINAL,
  },
  posture_BeachTowel: {
    name: 'posture_BeachTowel',
    description: 'laying on the beach towel',
    posture_type: PostureType.FINAL,
  },
  posture_BeachCave: {
    name: 'posture_BeachCave',
    ignored: true,
    description: '',
  },
  posture_JuiceKeg_KegStand: {
    name: 'posture_JuiceKeg_KegStand',
    ignored: true,
    description: '',
  },
  posture_PingPong_ReadyStance: {
    name: 'posture_PingPong_ReadyStance',
    ignored: true,
    description: '',
  },
  posture_PodiumPair_Debate: {
    name: 'posture_PodiumPair_Debate',
    ignored: true,
    description: '',
  },
  posture_Shower_WooHoo: {
    name: 'posture_Shower_WooHoo',
    description: 'having sex in the shower',
    posture_type: PostureType.FINAL,
  },
  Posture_HumanoidRobot_Broken: {
    name: 'Posture_HumanoidRobot_Broken',
    ignored: true,
    description: '',
  },
  posture_HumanoidRobot_Stasis_Stand: {
    name: 'posture_HumanoidRobot_Stasis_Stand',
    ignored: true,
    description: '',
  },
  posture_HumanoidRobot_Stasis_Sit: {
    name: 'posture_HumanoidRobot_Stasis_Sit',
    ignored: true,
    description: '',
  },
  posture_HumanoidRobot_Activate: {
    name: 'posture_HumanoidRobot_Activate',
    ignored: true,
    description: '',
  },
  posture_HumanoidRobot_PoweredDown: {
    name: 'posture_HumanoidRobot_PoweredDown',
    ignored: true,
    description: '',
  },
  posture_WooHoo_Dumpster: {
    name: 'posture_WooHoo_Dumpster',
    description: 'having sex in the dumpster',
    posture_type: PostureType.FINAL,
  },
  posture_Dumpster_Nap: {
    name: 'posture_Dumpster_Nap',
    description: 'napping in the dumpster',
    posture_type: PostureType.FINAL,
  },
  posture_SnowSportsSlope_Ski: {
    name: 'posture_SnowSportsSlope_Ski',
    description: 'skiing down the slop on a ski',
    posture_type: PostureType.FINAL,
  },
  posture_SnowSportsSlope_SledTogether: {
    name: 'posture_SnowSportsSlope_SledTogether',
    description: 'sledding down the slope in a sled',
    posture_type: PostureType.FINAL,
  },
  posture_SnowSportsSlope_Snowboard: {
    name: 'posture_SnowSportsSlope_Snowboard',
    description: 'snowboarding down the slope on a snowboard',
    posture_type: PostureType.FINAL,
  },
  posture_SnowSportsSlope_Sled: {
    name: 'posture_SnowSportsSlope_Sled',
    description: 'sledding down the slope in a sled',
    posture_type: PostureType.FINAL,
  },
  posture_HotSprings_Sit: {
    name: 'posture_HotSprings_Sit',
    description: 'sitting in the hot springs',
    posture_type: PostureType.FINAL,
  },
  mobilePosture_HotSprings_Stand: {
    name: 'mobilePosture_HotSprings_Stand',
    description: 'standing in the hot spring',
    posture_type: PostureType.FINAL,
  },
  posture_HotSprings_WooHoo: {
    name: 'posture_HotSprings_WooHoo',
    description: 'having sex in the hot springs',
    posture_type: PostureType.FINAL,
  },
  posture_Sit_Kotatsu: {
    name: 'posture_Sit_Kotatsu',
    ignored: true,
    description: '',
  },
  posture_WooHoo_Cave: {
    name: 'posture_WooHoo_Cave',
    description: 'having sex in the cave',
    posture_type: PostureType.FINAL,
  },
  posture_Group_WorkoutPowerSculpt: {
    name: 'posture_Group_WorkoutPowerSculpt',
    description: 'doing a power sculpt workout',
  },
  posture_Group_WorkoutDance: {
    name: 'posture_Group_WorkoutDance',
    description: 'doing a dance workout',
  },
  posture_Toddler_JungleGym_BallPit: {
    name: 'posture_Toddler_JungleGym_BallPit',
    description: 'in the jungle gym ball pit',
    posture_type: PostureType.FINAL,
  },
  posture_Toddler_JungleGym_Tunnels: {
    name: 'posture_Toddler_JungleGym_Tunnels',
    description: 'in the jungle gym tunnels',
    posture_type: PostureType.FINAL,
  },
  posture_WooHoo_LivestockPen: {
    name: 'posture_WooHoo_LivestockPen',
    description: 'having sex in the livestock pen',
    posture_type: PostureType.FINAL,
  },
  posture_AnimalObjects_LivestockPen: {
    name: 'posture_AnimalObjects_LivestockPen',
    ignored: true,
    description: '',
  },
  posture_Fox_StealEgg: {
    name: 'posture_Fox_StealEgg',
    ignored: true,
    description: '',
  },
  posture_BedCrossLegged: {
    name: 'posture_BedCrossLegged',
    description: 'sitting cross legged on the bed',
    posture_type: PostureType.FINAL,
  },
  posture_BedKneel: {
    name: 'posture_BedKneel',
    description: 'kneeling on the bed',
    posture_type: PostureType.FINAL,
  },
  posture_BedUpdates_PillowFight: {
    name: 'posture_BedUpdates_PillowFight',
    ignored: true,
    description: '',
  },
  posture_PierAttractionsWooHoo: {
    name: 'posture_PierAttractionsWooHoo',
    ignored: true,
    description: '',
  },
  posture_PhotoboothWooHoo: {
    name: 'posture_PhotoboothWooHoo',
    description: 'having sex in the photo booth',
    posture_type: PostureType.FINAL,
  },
  posture_Photobooth: {
    name: 'posture_Photobooth',
    description: 'in the photobooth',
  },
  posture_PierAttractions_RideWith: {
    name: 'posture_PierAttractions_RideWith',
    ignored: true,
    description: '',
  },
  posture_Photobooth_GroupPhoto: {
    name: 'posture_Photobooth_GroupPhoto',
    description: 'in the photobooth',
  },
  posture_CheerMat: {
    name: 'posture_CheerMat',
    ignored: true,
    description: '',
  },
  posture_PairedDancing_HSProm_Teens: {
    name: 'posture_PairedDancing_HSProm_Teens',
    description: 'paired dancing at prom',
  },
  posture_Treehouse: {
    name: 'posture_Treehouse',
    ignored: true,
    description: '',
  },
  posture_TreehouseWooHoo: {
    name: 'posture_TreehouseWooHoo',
    description: 'having sex in the treehouse',
    posture_type: PostureType.FINAL,
  },
  posture_PillowfightSleepingBag: {
    name: 'posture_PillowfightSleepingBag',
    ignored: true,
    description: '',
  },
  posture_RanchNectarMaker: {
    name: 'posture_RanchNectarMaker',
    ignored: true,
    description: '',
  },
  posture_RabbitHole_Cave_EP14World: {
    name: 'posture_RabbitHole_Cave_EP14World',
    ignored: true,
    description: '',
  },
  posture_CuddleOnBed: {
    name: 'posture_CuddleOnBed',
    description: 'cuddling',
  },
  posture_RomanticBlanket_CrossLegged: {
    name: 'posture_RomanticBlanket_CrossLegged',
    ignored: true,
    description: '',
  },
  posture_SitIntimate_RomanticBlanket: {
    name: 'posture_SitIntimate_RomanticBlanket',
    ignored: true,
    description: '',
  },
  posture_WooHoo_RomanticBlanket: {
    name: 'posture_WooHoo_RomanticBlanket',
    ignored: true,
    description: '',
  },
  posture_RomanticBlanket_Kneel: {
    name: 'posture_RomanticBlanket_Kneel',
    ignored: true,
    description: '',
  },
  posture_EP16World_Motel_Woohoo: {
    name: 'posture_EP16World_Motel_Woohoo',
    description: 'having sex in the motel',
    posture_type: PostureType.FINAL,
  },
  posture_closetVenue_woohoo: {
    name: 'posture_closetVenue_woohoo',
    ignored: true,
    description: '',
  },
  posture_GhostWoohoo_Possess: {
    name: 'posture_GhostWoohoo_Possess',
    ignored: true,
    description: '',
  },
  posture_WooHoo_Crypts: {
    name: 'posture_WooHoo_Crypts',
    description: 'having sex in the crypts',
    posture_type: PostureType.FINAL,
  },
  posture_BedSleepDeath: {
    name: 'posture_BedSleepDeath',
    ignored: true,
    description: '',
  },
  posture_WooHoo_Crypts_Human: {
    name: 'posture_WooHoo_Crypts_Human',
    ignored: true,
    description: '',
  },
  posture_TattooingTable_Artist: {
    name: 'posture_TattooingTable_Artist',
    ignored: true,
    description: '',
  },
  posture_TattooingTable_RecipientBack: {
    name: 'posture_TattooingTable_RecipientBack',
    ignored: true,
    description: '',
  },
  posture_TattooingTable_RecipientFront: {
    name: 'posture_TattooingTable_RecipientFront',
    ignored: true,
    description: '',
  },
  posture_CarryWingProxyObject_Back: {
    name: 'posture_CarryWingProxyObject_Back',
    ignored: true,
    description: '',
  },
  posture_FairyHome: {
    name: 'posture_FairyHome',
    ignored: true,
    description: '',
  },
  posture_NLS_MeditateInNature: {
    name: 'posture_NLS_MeditateInNature',
    description: 'meditating in nature',
    posture_type: PostureType.FINAL,
  },
  posture_NLS_SleepOnGround: {
    name: 'posture_NLS_SleepOnGround',
    description: 'sleeping on the ground',
    posture_type: PostureType.FINAL,
  },
  posture_Wedding_Aisle_Runner_Walk_Together: {
    name: 'posture_Wedding_Aisle_Runner_Walk_Together',
    description: 'walking down the wedding aisle',
  },
  posture_WeddingCake_CutTogether: {
    name: 'posture_WeddingCake_CutTogether',
    description: 'cutting the wedding cake',
  },
  posture_GroupDancing: {
    name: 'posture_GroupDancing',
    description: 'group dancing',
  },
  posture_StreetFoodTable_Tend: {
    name: 'posture_StreetFoodTable_Tend',
    ignored: true,
    description: '',
  },
};
