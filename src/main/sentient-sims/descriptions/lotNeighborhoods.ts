// The neighborhood and world of every lot that ships with the game, by lot id (stable for
// shipped lots in every save). Generated from the lot sheet's World and Neighborhood columns
// (Sims Wiki lot lists, 2026-10-16); a lot that is its own neighborhood (a secret lot, a
// world's lone park) has the world only. The description writer names the place by it.

export type LotNeighborhood = { neighborhood?: string; world: string };

export const LOT_NEIGHBORHOODS: Record<string, LotNeighborhood> = {
  // Bedlington Boathouse
  '1187053577': { neighborhood: 'Cavalier Cove', world: 'Brindleton Bay' },
  // Chateau Frise
  '3421044741': { neighborhood: 'Cavalier Cove', world: 'Brindleton Bay' },
  // Dachshund's Creek
  '1192493066': { neighborhood: 'Cavalier Cove', world: 'Brindleton Bay' },
  // Hindquarter Hideaway
  '1162739717': { neighborhood: 'Cavalier Cove', world: 'Brindleton Bay' },
  // Hound's Head
  '2064580676': { neighborhood: 'Cavalier Cove', world: 'Brindleton Bay' },
  // Deadgrass Discoveries
  '1287389190': { neighborhood: 'Deadgrass Isle', world: 'Brindleton Bay' },
  // Brindleton Pawspital
  '587399173': { neighborhood: 'Sable Square', world: 'Brindleton Bay' },
  // Domus Familiaris
  '2886467601': { neighborhood: 'Sable Square', world: 'Brindleton Bay' },
  // It's A Good House
  '2473787395': { neighborhood: 'Sable Square', world: 'Brindleton Bay' },
  // Pupperstone Park
  '3081175056': { neighborhood: 'Sable Square', world: 'Brindleton Bay' },
  // Sporting Space
  '3041853450': { neighborhood: 'Sable Square', world: 'Brindleton Bay' },
  // Catscratch Cottage
  '397672454': { neighborhood: "Whiskerman's Wharf", world: 'Brindleton Bay' },
  // Club Calico
  '1430847506': { neighborhood: "Whiskerman's Wharf", world: 'Brindleton Bay' },
  // Ragdoll Refurb
  '422707207': { neighborhood: "Whiskerman's Wharf", world: 'Brindleton Bay' },
  // Salty Paws Saloon
  '390791172': { neighborhood: "Whiskerman's Wharf", world: 'Brindleton Bay' },
  // Tail's End
  '1435500562': { neighborhood: "Whiskerman's Wharf", world: 'Brindleton Bay' },
  // Torres Amanecer
  '3664445447': { neighborhood: 'Nuevo Corazón', world: 'Ciudad Enamorada' },
  // La Suite del Flechazo
  '3656581125': { neighborhood: 'Nuevo Corazón', world: 'Ciudad Enamorada' },
  // Mirador del Amor
  '2919170055': { neighborhood: 'Nuevo Corazón', world: 'Ciudad Enamorada' },
  // SUDOR
  '2922315784': { neighborhood: 'Nuevo Corazón', world: 'Ciudad Enamorada' },
  // Avenida de la Eternidad
  '3347709962': { neighborhood: 'Plaza Mariposa', world: 'Ciudad Enamorada' },
  // Calle del Ensueño
  '1539899495': { neighborhood: 'Plaza Mariposa', world: 'Ciudad Enamorada' },
  // Media Naranja
  '3316908039': { neighborhood: 'Plaza Mariposa', world: 'Ciudad Enamorada' },
  // Villa Cálida
  '3338338313': { neighborhood: 'Plaza Mariposa', world: 'Ciudad Enamorada' },
  // Calle de la Promesa
  '1239220332': { neighborhood: 'Vista Hermosa', world: 'Ciudad Enamorada' },
  // Caminito del Deseo
  '401473685': { neighborhood: 'Vista Hermosa', world: 'Ciudad Enamorada' },
  // Casita del Amor
  '1228931179': { neighborhood: 'Vista Hermosa', world: 'Ciudad Enamorada' },
  // Laguna del Abrazo
  '1050673249': { neighborhood: 'Vista Hermosa', world: 'Ciudad Enamorada' },
  // Mansión de la Pasión
  '1087373410': { neighborhood: 'Vista Hermosa', world: 'Ciudad Enamorada' },
  // Inner Circle
  '3031564292': { neighborhood: 'Mirage Park', world: 'Del Sol Valley' },
  // Vacuous Green
  '3067215877': { neighborhood: 'Mirage Park', world: 'Del Sol Valley' },
  // Upland Place
  '2099838979': { neighborhood: 'Mirage Park', world: 'Del Sol Valley' },
  // Studio
  '284033049': { neighborhood: 'Plumbob Pictures', world: 'Del Sol Valley' },
  // Orchid a Go Go
  '2311979033': { neighborhood: 'Starlight Boulevard', world: 'Del Sol Valley' },
  // Pectoral Fitness
  '2841378864': { neighborhood: 'Starlight Boulevard', world: 'Del Sol Valley' },
  // Plumbob Pictures Museum
  '3058499610': { neighborhood: 'Starlight Boulevard', world: 'Del Sol Valley' },
  // Studio PBP
  '579403848': { neighborhood: 'Starlight Boulevard', world: 'Del Sol Valley' },
  // Ward Park
  '562561093': { neighborhood: 'Starlight Boulevard', world: 'Del Sol Valley' },
  // Bailey-Moon Manor
  '1642594307': { neighborhood: 'The Pinnacles', world: 'Del Sol Valley' },
  // Chateau Peak
  '1300824067': { neighborhood: 'The Pinnacles', world: 'Del Sol Valley' },
  // The Ward Den
  '1556217859': { neighborhood: 'The Pinnacles', world: 'Del Sol Valley' },
  // Forgotten Grotto
  '1733679520': { world: 'Forgotten Grotto' },
  // Granite Falls Forest
  '1554644996': { world: 'Granite Falls' },
  // Campground
  '2359099399': { neighborhood: 'Campground', world: 'Granite Falls' },
  // Forest Hideaway
  '3075014661': { neighborhood: 'Campground', world: 'Granite Falls' },
  // Green Getaway
  '1885929476': { neighborhood: 'Campground', world: 'Granite Falls' },
  // Lakeside Retreat
  '3073376260': { neighborhood: 'Campground', world: 'Granite Falls' },
  // Riverside Retreat
  '1942880262': { neighborhood: 'Campground', world: 'Granite Falls' },
  // Hermit's House
  '1958215685': { neighborhood: 'Granite Falls Forest', world: 'Granite Falls' },
  '3891462150': { world: 'Henford-on-Bagley' },
  // 3 Cobblebottom Street
  '2794127375': { neighborhood: 'Finchwick', world: 'Henford-on-Bagley' },
  // 5 Cobblebottom Street
  '3887857669': { neighborhood: 'Finchwick', world: 'Henford-on-Bagley' },
  // The Gnome's Arms
  '3455909904': { neighborhood: 'Finchwick', world: 'Henford-on-Bagley' },
  // 2 Olde Mill Lane
  '3886481414': { neighborhood: 'Old New Henford', world: 'Henford-on-Bagley' },
  // 3 Olde Mill Lane
  '3886743559': { neighborhood: 'Old New Henford', world: 'Henford-on-Bagley' },
  // 4 Olde Mill Lane
  '3887071240': { neighborhood: 'Old New Henford', world: 'Henford-on-Bagley' },
  // Olde Mill Hill
  '3885563909': { neighborhood: 'Old New Henford', world: 'Henford-on-Bagley' },
  // 13 Nettle Lane
  '1180958725': { neighborhood: 'The Bramblewood', world: 'Henford-on-Bagley' },
  // 14 Nettle Lane
  '1182334983': { neighborhood: 'The Bramblewood', world: 'Henford-on-Bagley' },
  // Cordelia's Secret Cottage
  '1199570952': { neighborhood: 'The Bramblewood', world: 'Henford-on-Bagley' },
  // Isle of Volpe Park
  '1177419780': { neighborhood: 'The Bramblewood', world: 'Henford-on-Bagley' },
  // 1 Mari Shores Road
  '980090978': { neighborhood: 'Coast of Adhmor', world: 'Innisgreen' },
  // 42 Normfair Drive
  '219807785': { neighborhood: 'Coast of Adhmor', world: 'Innisgreen' },
  // 8 Gnome Coast Street
  '183894035': { neighborhood: 'Coast of Adhmor', world: 'Innisgreen' },
  // The GNOM Exhibit
  '213712936': { neighborhood: 'Coast of Adhmor', world: 'Innisgreen' },
  // Bard Boulevard
  '2026701128': { neighborhood: 'Everdew', world: 'Innisgreen' },
  // Crannamor Residential
  '313458714': { neighborhood: 'Everdew', world: 'Innisgreen' },
  // Puckitt Hall
  '2259157008': { neighborhood: 'Everdew', world: 'Innisgreen' },
  // Starsong Lounge
  '1509425336': { neighborhood: 'Everdew', world: 'Innisgreen' },
  // The Watering Hole
  '1556218060': { neighborhood: 'Everdew', world: 'Innisgreen' },
  // Fern & Frond Wading Pond
  '2262171653': { neighborhood: 'Sprucederry Grove', world: 'Innisgreen' },
  // Gimmley Gardensbrook
  '395313183': { neighborhood: 'Sprucederry Grove', world: 'Innisgreen' },
  // Greenwood Hamlet Residence
  '270073869': { neighborhood: 'Sprucederry Grove', world: 'Innisgreen' },
  // Gringle's
  '584187924': { neighborhood: 'Sprucederry Grove', world: 'Innisgreen' },
  // Whistling Thistle Gardens
  '3491102727': { neighborhood: 'Sprucederry Grove', world: 'Innisgreen' },
  // JF&S Clothiers
  '1593901060': { world: 'Magnolia Promenade' },
  // Paddywack's Emporium
  '1592328195': { world: 'Magnolia Promenade' },
  // The Roadstead
  '1597833223': { world: 'Magnolia Promenade' },
  '1603600392': { neighborhood: 'Magnolia Promenade', world: 'Magnolia Promenade' },
  // 5-3-1 Shinrinyoku
  '4056219655': { neighborhood: 'Senbamachi', world: 'Mt. Komorebi' },
  // 5-6-1 Shinrinyoku
  '4055105540': { neighborhood: 'Senbamachi', world: 'Mt. Komorebi' },
  // 6-4-1 Hanamigawa
  '4054450179': { neighborhood: 'Senbamachi', world: 'Mt. Komorebi' },
  // Hanamigawa Koen
  '4055433221': { neighborhood: 'Senbamachi', world: 'Mt. Komorebi' },
  // Izakaya Ippai
  '4055957510': { neighborhood: 'Senbamachi', world: 'Mt. Komorebi' },
  // 2-4-1 Wakabamori
  '2191917059': { neighborhood: 'Wakaba', world: 'Mt. Komorebi' },
  // 2-4-2 Wakabamori
  '2226126854': { neighborhood: 'Wakaba', world: 'Mt. Komorebi' },
  // 2-4-3 Wakabamori
  '2197487620': { neighborhood: 'Wakaba', world: 'Mt. Komorebi' },
  // 2-5-1 Wakabamori
  '2754674701': { neighborhood: 'Wakaba', world: 'Mt. Komorebi' },
  // Hazakura Lounge
  '2230845447': { neighborhood: 'Wakaba', world: 'Mt. Komorebi' },
  // 5-1-1 Kiyomatsu
  '3429957684': { neighborhood: 'Yukimatsu', world: 'Mt. Komorebi' },
  // 5-1-2 Kiyomatsu
  '3428188211': { neighborhood: 'Yukimatsu', world: 'Mt. Komorebi' },
  // Kiyomatsu Point
  '558628916': { neighborhood: 'Yukimatsu', world: 'Mt. Komorebi' },
  // Stutefani Onsen Bathhouse
  '1851654149': { neighborhood: 'Yukimatsu', world: 'Mt. Komorebi' },
  // Mt. Komorebi Base Camp
  '2366832680': { neighborhood: 'the mountain above Yukimatsu', world: 'Mt. Komorebi' },
  // Mt. Komorebi Peak
  '1831469061': { neighborhood: 'the mountain above Yukimatsu', world: 'Mt. Komorebi' },
  // The Croft Icefall
  '3718447143': { neighborhood: 'the mountain above Yukimatsu', world: 'Mt. Komorebi' },
  // Beech Byway
  '3142582277': { neighborhood: 'Bridgeview', world: 'Newcrest' },
  // Comfy Cubby
  '3154640904': { neighborhood: 'Bridgeview', world: 'Newcrest' },
  // Fern Park
  '3137142788': { neighborhood: 'Bridgeview', world: 'Newcrest' },
  // Midtown Meadows
  '3146711046': { neighborhood: 'Bridgeview', world: 'Newcrest' },
  // Oak Alcove
  '3149332487': { neighborhood: 'Bridgeview', world: 'Newcrest' },
  '1636761611': { neighborhood: 'Llama Lagoon', world: 'Newcrest' },
  // Asphalt Abodes
  '2903179269': { neighborhood: 'Llama Lagoon', world: 'Newcrest' },
  // Avarice Acres
  '1564934148': { neighborhood: 'Llama Lagoon', world: 'Newcrest' },
  // Tranquil Crescent
  '1568800773': { neighborhood: 'Llama Lagoon', world: 'Newcrest' },
  // Twin Oracle Point
  '1648099341': { neighborhood: 'Llama Lagoon', world: 'Newcrest' },
  // Civic Cliffs
  '3469606917': { neighborhood: 'Ridgeline Drive', world: 'Newcrest' },
  // Cookout Lookout
  '3477340166': { neighborhood: 'Ridgeline Drive', world: 'Newcrest' },
  // Hillside Highlands
  '3461873668': { neighborhood: 'Ridgeline Drive', world: 'Newcrest' },
  // Optimist's Outlook
  '3073835011': { neighborhood: 'Ridgeline Drive', world: 'Newcrest' },
  // Sandy Run
  '3482058759': { neighborhood: 'Ridgeline Drive', world: 'Newcrest' },
  // The Rogue Note
  '434896998': { neighborhood: 'Gammelvik', world: 'Nordhaven' },
  // New Harbor Park
  '3993632859': { neighborhood: 'Iverstad', world: 'Nordhaven' },
  '581238932': { neighborhood: 'Iverstad', world: 'Nordhaven' },
  // The Inked Inlet
  '3996254301': { neighborhood: 'Iverstad', world: 'Nordhaven' },
  // The Lighthouse Lookout
  '3998875742': { neighborhood: 'Iverstad', world: 'Nordhaven' },
  // Desert Bloom
  '89245504': { world: 'Oasis Springs' },
  // Affluista Mansion
  '2484376288': { neighborhood: 'Acquisition Butte', world: 'Oasis Springs' },
  // Yuma Heights
  '687165520': { neighborhood: 'Acquisition Butte', world: 'Oasis Springs' },
  // Agave Abode
  '1662145536': { neighborhood: 'Bedrock Strait', world: 'Oasis Springs' },
  // Nookstone
  '1662175776': { neighborhood: 'Bedrock Strait', world: 'Oasis Springs' },
  // Pebble Burrow
  '2896445168': { neighborhood: 'Bedrock Strait', world: 'Oasis Springs' },
  // Sandtrap Flat
  '2891968416': { neighborhood: 'Bedrock Strait', world: 'Oasis Springs' },
  // Slipshod Mesquite
  '2880306736': { neighborhood: 'Bedrock Strait', world: 'Oasis Springs' },
  // Burners & Builders
  '254175856': { neighborhood: 'Mirage Canyon', world: 'Oasis Springs' },
  // Rattlesnake Juice
  '254075440': { neighborhood: 'Mirage Canyon', world: 'Oasis Springs' },
  // The Futures Past
  '254110336': { neighborhood: 'Mirage Canyon', world: 'Oasis Springs' },
  // The Solar Flare
  '254126448': { neighborhood: 'Mirage Canyon', world: 'Oasis Springs' },
  // Cacti Casa
  '2984780224': { neighborhood: 'Parched Prospect', world: 'Oasis Springs' },
  // Dusty Turf
  '1802561584': { neighborhood: 'Parched Prospect', world: 'Oasis Springs' },
  // Raffia Quinta
  '1802576896': { neighborhood: 'Parched Prospect', world: 'Oasis Springs' },
  // Springscape
  '1802486336': { neighborhood: 'Parched Prospect', world: 'Oasis Springs' },
  // Vista Quarry
  '1802450800': { neighborhood: 'Parched Prospect', world: 'Oasis Springs' },
  // Arid Ridge
  '2860935856': { neighborhood: 'Skyward Palms', world: 'Oasis Springs' },
  // Granada Place
  '1804118928': { neighborhood: 'Skyward Palms', world: 'Oasis Springs' },
  // Rio Verde
  '1804000064': { neighborhood: 'Skyward Palms', world: 'Oasis Springs' },
  // Sultry Springside
  '1804109472': { neighborhood: 'Skyward Palms', world: 'Oasis Springs' },
  // HeadlessQuarters
  '3207856134': { world: 'Ravenwood' },
  // Crow's Perch
  '3175284742': { neighborhood: "Crow's Crossing", world: 'Ravenwood' },
  // Eternal Hollow
  '3630170219': { neighborhood: "Crow's Crossing", world: 'Ravenwood' },
  // Moppy Manor
  '2219311191': { neighborhood: "Crow's Crossing", world: 'Ravenwood' },
  // Old Ravenwood Estate
  '3407872018': { neighborhood: "Crow's Crossing", world: 'Ravenwood' },
  // Specter Family Manor
  '3165585413': { neighborhood: "Crow's Crossing", world: 'Ravenwood' },
  // Club Eternity
  '2366570552': { neighborhood: 'Mourningvale', world: 'Ravenwood' },
  // Mourning Mist Manor
  '2178482227': { neighborhood: 'Mourningvale', world: 'Ravenwood' },
  // Mystic Crossroads
  '2050359393': { neighborhood: 'Mourningvale', world: 'Ravenwood' },
  // The Cozy Casket House
  '1792802856': { neighborhood: 'Mourningvale', world: 'Ravenwood' },
  // Hay Hill Landing
  '2142634071': { neighborhood: 'Whispering Glen', world: 'Ravenwood' },
  // Teardrop Cottage
  '2523725892': { neighborhood: 'Whispering Glen', world: 'Ravenwood' },
  // The Final Draught
  '2463432763': { neighborhood: 'Whispering Glen', world: 'Ravenwood' },
  // The Marigold Chateau
  '2512977983': { neighborhood: 'Whispering Glen', world: 'Ravenwood' },
  // Myshuno Meadows
  '653328387': { world: 'San Myshuno' },
  // Casbah Gallery
  '1706622979': { neighborhood: 'Arts Quarter', world: 'San Myshuno' },
  // Planet Honey Pop
  '1464926213': { neighborhood: 'Fashion District', world: 'San Myshuno' },
  // Waterside Warble
  '727449603': { neighborhood: 'Spice Market', world: 'San Myshuno' },
  // Skye Fitness & Spa
  '1521615080': { neighborhood: 'Uptown', world: 'San Myshuno' },
  // Stargazer Lounge
  '3708747783': { neighborhood: 'Uptown', world: 'San Myshuno' },
  // Anchorpoint Abode
  '3857973253': { neighborhood: 'Anchorpoint Wharf', world: 'San Sequoia' },
  // Anchorpoint Library
  '3860004870': { neighborhood: 'Anchorpoint Wharf', world: 'San Sequoia' },
  // Manzanita Terrace
  '3860398087': { neighborhood: 'Anchorpoint Wharf', world: 'San Sequoia' },
  // Robles Point
  '1359609861': { neighborhood: 'Anchorpoint Wharf', world: 'San Sequoia' },
  // 13 Acacia Avenue
  '2703097870': { neighborhood: 'Gilbert Gardens', world: 'San Sequoia' },
  // 18 Celebration Way
  '2711814161': { neighborhood: 'Gilbert Gardens', world: 'San Sequoia' },
  // Celebration Center
  '2690383881': { neighborhood: 'Gilbert Gardens', world: 'San Sequoia' },
  // Parkside Place
  '2205351941': { neighborhood: 'Gilbert Gardens', world: 'San Sequoia' },
  // 23 Eucalyptus Lane
  '149028869': { neighborhood: 'Hopewell Hills', world: 'San Sequoia' },
  // 36 Bayani Place
  '154140678': { neighborhood: 'Hopewell Hills', world: 'San Sequoia' },
  // 7 Eucalyptus Lane
  '4137287685': { neighborhood: 'Hopewell Hills', world: 'San Sequoia' },
  // Sequoia Cottage
  '157614088': { neighborhood: 'Hopewell Hills', world: 'San Sequoia' },
  // Sylvan Glade
  '1001644480': { world: 'Sylvan Glade' },
  // Magnolia Blossom
  '64101728': { world: 'Willow Creek' },
  // Brook Bungalow
  '1087874032': { neighborhood: 'Courtyard Lane', world: 'Willow Creek' },
  // Pique Hearth
  '573143552': { neighborhood: 'Courtyard Lane', world: 'Willow Creek' },
  // Potters Splay
  '571964304': { neighborhood: 'Courtyard Lane', world: 'Willow Creek' },
  // Rindle Rose
  '572688432': { neighborhood: 'Courtyard Lane', world: 'Willow Creek' },
  // Riverside Roost
  '573229280': { neighborhood: 'Courtyard Lane', world: 'Willow Creek' },
  // Movers & Shakers
  '90336000': { neighborhood: 'Crawdad Quarter', world: 'Willow Creek' },
  // Municipal Muses
  '90404736': { neighborhood: 'Crawdad Quarter', world: 'Willow Creek' },
  // The Blue Velvet
  '90369424': { neighborhood: 'Crawdad Quarter', world: 'Willow Creek' },
  // Willow Creek Archive
  '90243216': { neighborhood: 'Crawdad Quarter', world: 'Willow Creek' },
  '994677120': { neighborhood: 'Foundry Cove', world: 'Willow Creek' },
  '1064509568': { neighborhood: 'Foundry Cove', world: 'Willow Creek' },
  // Daisy Hovel
  '961654864': { neighborhood: 'Foundry Cove', world: 'Willow Creek' },
  // Garden Essence
  '961473792': { neighborhood: 'Foundry Cove', world: 'Willow Creek' },
  // Streamlet Single
  '994751168': { neighborhood: 'Foundry Cove', world: 'Willow Creek' },
  // Hallow Slough
  '1544807168': { neighborhood: 'Pendula View', world: 'Willow Creek' },
  // Ophelia Villa
  '1989072208': { neighborhood: 'Pendula View', world: 'Willow Creek' },
  // Parkshore
  '1073501008': { neighborhood: 'Pendula View', world: 'Willow Creek' },
  // Umbrage Manor
  '2085060112': { neighborhood: 'Pendula View', world: 'Willow Creek' },
  // Cypress Terrace
  '7505088': { neighborhood: 'Sage Estates', world: 'Willow Creek' },
  // Oakenstead
  '4267281792': { neighborhood: 'Sage Estates', world: 'Willow Creek' },
  // Ancient Ruins
  '1391722499': { world: 'Windenburg' },
  // The Bluffs
  '674955270': { world: 'Windenburg' },
  // Von Haunt Estate
  '996802565': { world: 'Windenburg' },
  // Bathe De Rill
  '504889347': { neighborhood: 'Lykke Centre', world: 'Windenburg' },
  // Discotheque Pan Europa
  '4137877509': { neighborhood: 'Lykke Centre', world: 'Windenburg' },
  // Harbor Quarter Gym
  '1993998339': { neighborhood: 'Lykke Centre', world: 'Windenburg' },
  // Hare Square
  '4125622276': { neighborhood: 'Lykke Centre', world: 'Windenburg' },
  // Hare and Hedgehog
  '1995309060': { neighborhood: 'Lykke Centre', world: 'Windenburg' },
  // Waterlock Redoubt
  '4282253317': { neighborhood: 'Olde Platz', world: 'Windenburg' },
  // Factory One
  '162529387': { neighborhood: 'Olde Platz', world: 'Windenburg' },
  // Old Quarter Inn
  '3771138057': { neighborhood: 'Olde Platz', world: 'Windenburg' },
  // Proprietor’s Square
  '3407880': { neighborhood: 'Olde Platz', world: 'Windenburg' },
  // Quad Manor
  '3329884165': { neighborhood: 'Olde Platz', world: 'Windenburg' },
  // South Square Coffee
  '3304849411': { neighborhood: 'Olde Platz', world: 'Windenburg' },
  // The Narwhal Arms
  '3318415364': { neighborhood: 'Olde Platz', world: 'Windenburg' },
  // Dock Den
  '3377201155': { neighborhood: 'The Crumbling Isle', world: 'Windenburg' },
  // Mid-Nowhere
  '2506358787': { neighborhood: 'The Crumbling Isle', world: 'Windenburg' },
  // Pier Palace
  '2514681861': { neighborhood: 'The Crumbling Isle', world: 'Windenburg' },
  // The Lighthouse
  '2478374916': { neighborhood: 'The Crumbling Isle', world: 'Windenburg' },
  // Von-Windenburg Estate
  '2463563779': { neighborhood: 'The Crumbling Isle', world: 'Windenburg' },
  // Coorinberg Cottage
  '1975058435': { neighborhood: 'Windslar', world: 'Windenburg' },
  // Cottage Am See
  '1871314947': { neighborhood: 'Windslar', world: 'Windenburg' },
  // Dresden House
  '2057895943': { neighborhood: 'Windslar', world: 'Windenburg' },
  // Havisham House
  '64094310': { neighborhood: 'Olde Platz', world: 'Windenburg' },
  // Rustic Residence
  '2046492677': { neighborhood: 'Windslar', world: 'Windenburg' },
  // The Shrieking Llama
  '2061565955': { neighborhood: 'Windslar', world: 'Windenburg' },
  // The Summer Home
  '2062221320': { neighborhood: 'Windslar', world: 'Windenburg' },
};

export function lotNeighborhood(lotId: number | string): LotNeighborhood | undefined {
  return LOT_NEIGHBORHOODS[String(lotId)];
}

// "Starlight Boulevard, Del Sol Valley", or the world alone
export function neighborhoodLabel(lotId: number | string): string | undefined {
  const where = lotNeighborhood(lotId);
  if (!where) {
    return undefined;
  }
  return where.neighborhood ? `${where.neighborhood}, ${where.world}` : where.world;
}
