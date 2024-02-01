export function getSexCategory(sexCategoryType: number): string | undefined {
  switch (sexCategoryType) {
    case -1: // NONE
      return 'having sex';
    case 0: // TEASING
      return 'foreplay';
    case 1: // HANDJOB
      return 'giving a handjob';
    case 2: // FOOTJOB
      return 'giving a footjob';
    case 3: // ORALJOB
      return 'performing oral sex';
    case 4: // VAGINAL
      return 'having sex';
    case 5: // ANAL
      return 'having anal sex';
    case 6: // CLIMAX
      return 'cumming';
    default:
      return undefined;
  }
}

export function getSexLocation(sexLocationType: number): string | undefined {
  switch (sexLocationType) {
    case 1: // FLOOR
      return 'on the floor';
    case 2: // UNDERWATER
      return 'underwater in the pool';
    case 3: // WALL
      return 'up against the wall';
    case 50: // TABLE_DINING_SHORT
      return 'on the short dining table';
    case 51: // TABLE_DINING_LONG
      return 'on the long dining table';
    case 52: // TABLE_TV_STAND
      return 'up against the tv stand';
    case 53: // TABLE_COFFEE
      return 'on the coffee table';
    case 54: // TABLE_ACCENT
      return 'on the accent table';
    case 55: // TABLE_PICNIC
      return 'on the picnic table';
    case 56: // TABLE_OUTDOOR
      return 'on the outdoor table';
    case 57: // TABLE_OUTDOOR_UMBRELLA
      return 'on the outdoor table under the umbrella';
    case 100: // DESK
      return 'on the desk';
    case 101: // BAR
      return 'on the bar';
    case 102: // COUNTER
      return 'on the counter';
    case 103: // COUNTER_ISLAND
      return 'on the island counter';
    case 104: // COUNTER_CORNER
      return 'on the counter';
    case 200: // SOFA
      return 'on the sofa';
    case 201: // LOVESEAT
    case 203: // CORNER_LOVESEAT
      return 'on the loveseat';
    case 202: // BENCH_OUTDOOR
      return 'on the outdoor bench';
    case 204: // MURPHY_LOVESEAT
      return 'on the murphy loveseat';
    case 205: // SECTIONAL_SOFA
      return 'on the sectional sofa';
    case 250: // WORKOUT_MACHINE
      return 'on the workout machine';
    case 251: // STOVE
      return 'against the stove';
    case 300: // CHAIR_LIVING
      return 'on the livingroom chair';
    case 301: // CHAIR_DINING
      return 'on the dining chair';
    case 302: // CHAIR_STOOL
      return 'on the stool';
    case 303: // CHAIR_DESK
      return 'on the desk chair';
    case 304: // CHAIR_LOUNGE
    case 305: // CHAIR_LOUNGE_FLOAT
      return 'on the lounge chair';
    case 307: // CHAIR_LOUNGE_SOFA
      return 'on the lounge sofa';
    case 400: // TOILET
      return 'on the toilet in the bathroom';
    case 401: // TOILET_STALL
      return 'in the bathroom stall';
    case 402: // PUBLIC_BATHROOM
      return 'in the public bathroom';
    case 450: // HOTTUB
      return 'in the hottub';
    case 451: // SHOWER_TUB
      return 'in the shower tub';
    case 452: // SHOWER
      return 'in the shower';
    case 453: // BATHTUB
    case 456: // CORNER_BATHTUB
      return 'in the bathtub';
    case 454: // OPEN_SHOWER
      return 'in the open showers';
    case 500: // DOUBLE_BED
      return 'in the double bed';
    case 501: // SINGLE_BED
      return 'in the single bed';
    case 502: // OTTOMAN
      return 'on the ottoman';
    case 503: // MURPHY_DOUBLE_BED
      return 'in the murphy double bed';
    case 504: // COFFIN
      return 'in the coffin';
    case 505: // BUNK_BED
      return 'on the bunk bed';
    case 506: // BED_ROLL
      return 'on the bed roll';
    case 600: // SAUNA
      return 'in the sauna';
    case 601: // YOGA_MAT
      return 'on the yoga mat';
    case 602: // MASSAGE_TABLE
      return 'on the massage table';
    case 603: // BEACH_TOWEL
      return 'on the a beach towel';
    case 604: // DANCE_FLOOR
      return 'on the dance floor';
    case 605: // MURPHY_CLOSED
      return 'in the closed murphy bed';
    case 700: // WINDOW
      return 'next to the window';
    case 701: // DOOR
      return 'next to the door';
    case 702: // MIRROR
      return 'next to the mirror';
    default:
      return undefined;
  }
}
