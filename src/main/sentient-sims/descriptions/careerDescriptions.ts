import { SentientSimCareer } from '../models/SentientSimCareer';

export type CareerTrackLevel = {
  name: string;
  description?: string;
  sentient_sims_description: string;
};

export type CareerTrack = {
  [key: number]: CareerTrackLevel;
};

export type Career = {
  [key: string]: CareerTrack;
};

export type CareerDescriptions = {
  [key: string]: Career;
};

export const careerDescriptions: CareerDescriptions = {
  careers_Adult_Freelancer_Agency_Programmer: {
    careerTracks_Freelancer_Programmer: {
      1: {
        name: 'Freelance Programmer',
        description:
          "Why sit in an office filled with coworkers talking about their kids? {0.SimFirstName} just wants to focus up and get some coding done in the comfort of wherever {F0.she}{M0.he} desires. No boss is going to tell {0.SimPronounObjective} what to work on. From spreadsheets to videogames, it's all {F0.her}{M0.his} choice!",
        sentient_sims_description: '{sim_name} works as a freelance programmer.',
      },
    },
  },
  career_Child_GradeSchool: {
    GradeSchool_Track: {
      1: {
        name: 'Grade School F Student',
        description:
          "Let's not sugar coat things.  You're failing.  But you've still got time to turn it around!  Do some homework - any homework - and go to school.",
        sentient_sims_description: '{sim_name} is a student in grade school and currently failing classes.',
      },
      2: {
        name: 'Grade School D Student',
        description:
          "When Ds are the norm, things aren't bleak quite yet, but the teacher has called home a few times and you're right on the edge of failing out of school.",
        sentient_sims_description: '{sim_name} is a student in grade school and currently failing classes.',
      },
      3: {
        name: 'Grade School C Student',
        description:
          "The middle of the pack is the most popular place to be, as evidenced by the other C students that surround you.  It's like a club!  A non-exclusive mediocre club.",
        sentient_sims_description: '{sim_name} is a student in grade school and barely passing classes with Cs.',
      },
      4: {
        name: 'Grade School B Student',
        sentient_sims_description: '{sim_name} is a student in grade school and are passing classes with Bs.',
      },
      5: {
        name: 'Grade School A Student',
        description:
          'It must be hard to be an A student.  All that time studying, feeling superior, and studying some more.',
        sentient_sims_description: '{sim_name} is a student in grade school and are exceeding in classes with As.',
      },
    },
  },
  career_Adult_Astronaut: {
    Astronaut_Track1: {
      1: {
        name: 'Astronaut Intern',
        description:
          "{0.SimFirstName}'s always had dreams about exploring the cosmos, walking among the stars, and discovering places unknown. {M0.His}{F0.Her} journey begins here, in the file room, categorizing expense reports.",
        sentient_sims_description: '{sim_name} works as an Astronaut Intern.',
      },
      2: {
        name: 'Module Cleaner',
        description:
          'Little-known fact: Space is an absolutely filthy place. When the shuttles return, guess who gets to hose them down and scrub off the gunk? {0.SimFirstName} hopes the goo is just dirt and not some incurable form of Oozing Space Measles.',
        sentient_sims_description:
          '{sim_name} works at a space facility where they clean space shuttles that have returned from space.',
      },
      3: {
        name: 'Technician',
        description:
          "{0.SimFirstName} doesn't think of {M0.himself}{F0.herself} as just a glorified mechanic. The shuttle costs billions of Simoleons, and any screw-ups would cost lives. {M0.He's}{F0.She's} more like a glorified engineer.",
        sentient_sims_description: '{sim_name} works as an astronaut technician working on space shuttles.',
      },
      4: {
        name: 'Command Center Lead',
        description:
          'Guiding virtual rockets into place, analyzing the movements of blinking dots on a computer screen, running simulations.... Looks like all those hours {0.SimFirstName} spent playing video games are paying off!',
        sentient_sims_description:
          '{sim_name} works with astronauts at the space center as a command center lead, helping guide rockets in space.',
      },
      5: {
        name: 'Low-Orbit Specialist',
        description:
          "Low orbit is where the real action is-satellites, space stations, space walks, daredevils attempting to break the world record for high-altitude parachuting. If something goes wrong, it's also the closest place to breathable air, which is why {0.SimFirstName} likes it.",
        sentient_sims_description:
          '{sim_name} works as a low-orbit specialist, piloting planes into low-orbit and helping guide satellites.',
      },
      6: {
        name: 'Space Cadet',
        description:
          '{0.SimFirstName} was hoping that if {M0.he}{F0.she} "accidentally" derailed a shuttle-board "simulation" {M0.he}{F0.she} might be able to launch the shuttle and get to space\u00e2\u0080\u00a6but it turns out that actual spacecraft are pretty well-secured. That\'s good, because {0.SimFirstName} is still learning how to space brake and star park.',
        sentient_sims_description: '{sim_name} works as a space cadet, training to become a full blown astronaut.',
      },
      7: {
        name: 'Astronaut',
        description:
          'This is it: Astronaut. The best of the best. The heroic few. The job kids want to be when they grow up that they still want to be as adults. {0.SimFirstName} will now go boldly into that great beyond to explore the secrets of the universe and eat weird freeze-dried ice cream.',
        sentient_sims_description:
          '{sim_name} works as an astronaut, they are at the top of their field, exploring space in space shuttles.',
      },
    },
    Astronaut_Track2_SpaceRanger: {
      8: {
        name: 'Planet Patrol',
        description:
          "{0.SimFirstName}'s drawn a pretty good beat. {M0.He's}{F0.She's} patrolling planet Illustria, which is scenic and upscale, with nice shops and restaurants. Luckily, {M0.he}{F0.she} didn't get the Bloodwar planet, which is also pretty scenic but has fewer restaurants.",
        sentient_sims_description:
          '{sim_name} works as planet patrol, a job for astronauts. {sim_name} patrols the planet Illustria, which is scenic and upscale.',
      },
      9: {
        name: 'Sheriff of the Stars',
        description:
          "This here galaxy's {0.SimFirstName}'s jurisdiction now. Even-handed with the punishment and generous with the attitude, {M0.he}{F0.she} don't take no nonsense from alien punks, no matter now many tentacles or ocular cavities or rows of teeth they have. Also, {M0.he}{F0.she} gets to talk like a sheriff!",
        sentient_sims_description:
          '{sim_name} works as sheriff of the stars, patrolling the galaxy and securing it from alien threats.',
      },
      10: {
        name: 'Space Ranger',
        description:
          'When the universe is in danger, one {M0.man}{F0.woman} gets the call: {0.SimFirstName}, Space Ranger! With {M0.his}{F0.her} stout heart, keen wits, and a phozoplasmic Warp Pack strapped to {M0.his}{F0.her} back, Ranger {0.SimFirstName} defends the known galaxies from evil!',
        sentient_sims_description:
          '{sim_name} works as THE space ranger, when the universe is in danger, only one person gets the call, {sim_name}, defends the known galaxies from evil.',
      },
    },
    Astronaut_Track3_Smuggler: {
      8: {
        name: 'Moon Mercenary',
        description:
          "Any ranger who's quick with a laser can make more Simoleons in private security than serving the public good. {0.SimFirstName} protects galactic warlords, exterminates cabals of tribal terrorists, and helps corrupt governments maintain plausible deniability.",
        sentient_sims_description:
          '{sim_name} works as a moon mercenary, {sim_name} works as private security protecting galactic warlords, exterminating cabals of tribal terrorists, and helps corrupt governments.',
      },
      9: {
        name: 'Alien Goods Trader',
        description:
          "Want the horn of an endangered zygax? How about a quilt handmade from 2,000 tiny Q505Bs? Maybe just a few Gibsonian chill-out pods for the big party next weekend? {0.SimFirstName} doesn't ask questions. {M0.He}{F0.She} just makes it happen.",
        sentient_sims_description:
          '{sim_name} works as an alien goods trader, buys and sells legal and illegal alien goods across the galaxy.',
      },
      10: {
        name: 'Interstellar Smuggler',
        description:
          "There's no trade route too treacherous, no cargo too controversial for {0.SimFirstName} to covertly ship across the universe and into {M0.his}{F0.her} customers' covetous hands. Capitalism is capitalism. And a 2000% markup is a 2000% markup.",
        sentient_sims_description:
          '{sim_name} works as an interstellar smuggler, covertly shipping illegal goods across the galaxy.',
      },
    },
  },
  career_Teen_Retail: {
    Teen_Retail_Track1: {
      1: {
        name: 'Shelf Stocker',
        description:
          '{0.SimFirstName} is ready to take {M0.his}{F0.her} part in the global economy. People need to buy things to make the economy happen, and that means that people need retailers to sell them things, and THAT means that someone needs to stock a bunch of shelves. Guess what {0.SimFirstName}\u00e2\u0080\u0099s part is?',
        sentient_sims_description: '{sim_name} works as a shelf stocker at a department store.',
      },
      2: {
        name: 'Sales Floor Clerk',
        description:
          '{0.SimFirstName} has been promoted to Sales Floor Clerk! Now {M0.he}{F0.she} can interact directly with the customers and brush up on vital salesmanship skills! And between customers {M0.he}{F0.she} can sweep floors, scrape off gum, heft boxes and restock store displays.',
        sentient_sims_description: '{sim_name} works as a sales floor clerk at a department store.',
      },
      3: {
        name: 'Customer Support',
        description:
          '\u00e2\u0080\u009cHappy customers, healthy business!\u00e2\u0080\u009d At least, that\u00e2\u0080\u0099s what {0.SimFirstName}\u00e2\u0080\u0099s training manual says. {M0.He}{F0.She} might be earning a healthier wage, manning the support desk with a smile, but the only customers who get sent {M0.his}{F0.her} way are not happy, not at all.',
        sentient_sims_description: '{sim_name} works as a customer service representative at a department store.',
      },
    },
  },
  career_Adult_Painter: {
    Painter_Track1: {
      1: {
        name: 'Palette Cleaner',
        description:
          'To create great art, one must suffer. {0.SimFirstName} is well on {M0.his}{F0.her} way to greatness, as {M0.he}{F0.she} will be asked to create floor-based installations using a water-based medium (i.e. mopping the floor).',
        sentient_sims_description:
          '{sim_name} works at an art studio cleaning and organizing palettes used for mixing paint.',
      },
      2: {
        name: 'Art Book Collator',
        description:
          'Saving up for art school supplies means working at the art school library. Unfortunately, the books must be re-shelved by number, and no one sees the genius in {0.SimFirstName} re-shelving them by complementary color. Visionaries are often misunderstood.',
        sentient_sims_description: '{sim_name} works at an art gallery arranging and categorizing art books.',
      },
      3: {
        name: 'Hungry Artist',
        description:
          "Being a hungry artist isn't about literal hunger. It's about {0.SimFirstName}'s burning passion to create an artistic expression that can change people's lives! (It's also about literal hunger.)",
        sentient_sims_description: '{sim_name} works for little pay as a new artist.',
      },
      4: {
        name: 'Watercolor Dabbler',
        description:
          '{0.SimFirstName} is now a working artist! At least {M0.he}{F0.she}\'s working a booth at a local art fair, where patrons are haggling down the price of {M0.his}{F0.her} watercolored landscapes. But the words "work" and "artist" are coming closer together. And that\'s a good sign!',
        sentient_sims_description: '{sim_name} works at an art gallery arranging and categorizing art books.',
      },
      5: {
        name: 'Canvas Creator',
        sentient_sims_description:
          '{sim_name} works as an independent artist, creating and selling original canvas paintings.',
      },
      6: {
        name: 'Imaginative Imagist',
        description:
          '{0.SimFirstName} has boldly painted {M0.his}{F0.her} way into a career in studio art\u00e2\u0080\u0094mastering still life, figure study, interior space, and the fine art of disdain for anyone living in mainstream society.',
        sentient_sims_description:
          '{sim_name} works as a studio artist, focusing on a variety of themes and styles in his paintings.',
      },
    },
    Painter_Track2_Artist: {
      7: {
        name: 'Artist en Residence',
        description:
          'Winning this artist residency is a true honor! Not everyone gets to work in an unheated barn loft for free. What a great way for {0.SimFirstName} to experience a slice of life {M0.he}{F0.she} would never actually choose!',
        sentient_sims_description:
          '{sim_name} has been honored with an artist residency, providing him an exclusive space to create and exhibit his work.',
      },
      8: {
        name: 'Professional Painter',
        description:
          "{0.SimFirstName} just hung some work in the hottest gallery in town! And it's actually {M0.his}{F0.her} work this time! This is a wonderful achievement for any artist.",
        sentient_sims_description:
          '{sim_name} is a professional artist whose work is exhibited in one of the hottest galleries in town.',
      },
      9: {
        name: 'Illustrious Illustrator',
        description:
          "Professional illustrator is a challenging role. {0.SimFirstName} controls the final visual, but does not control the subject matter. Whether it's a famous historical figure or a cartoon squirrel, {M0.he}{F0.she} is up to the task!",
        sentient_sims_description:
          '{sim_name} works as a professional illustrator, using his artistic skills to visually represent a variety of subjects.',
      },
      10: {
        name: 'Master of the Real',
        description:
          'Students now flock to {0.SimFirstName}, hoping to glean even a bit of the technique that has made {M0.his}{F0.her} artwork so popular. Time to pass on what {M0.he}{F0.she} has learned to the next generation, or just wave {M0.his}{F0.her} paintbrush and sigh, "Hopeless!"',
        sentient_sims_description:
          '{sim_name} is a well-respected artist and mentor, sharing his artistic knowledge and expertise with aspiring artists.',
      },
    },
    Painter_Track3_Critic: {
      7: {
        name: 'Color Theory Critic',
        description:
          '{0.SimFirstName} now spends equal amounts of time improving {M0.his}{F0.her} own technique and politely suggesting how other artists can improve theirs. It allows interaction with the greatest talents of this generation, even if those interactions are sometimes prickly.',
        sentient_sims_description:
          '{sim_name} works as a critic, analyzing and giving constructive criticism on the techniques of other artists.',
      },
      8: {
        name: 'Fine-Art Aficionado',
        description:
          'Beauty is in the eye of the beholder, but money is in the eye of the appraiser. {0.SimFirstName} draws on {M0.his}{F0.her} significant training to determine the value of fine art, letting others know that not every paint-covered canvas is created equal.',
        sentient_sims_description:
          '{sim_name} is an art appraiser, using his knowledge and experience to evaluate the monetary value of fine art.',
      },
      9: {
        name: 'Composition Curator',
        sentient_sims_description:
          '{sim_name} works as a curator, managing the acquisition and display of various art collections.',
      },
      10: {
        name: 'Patron of the Arts',
        description:
          '{0.SimFirstName}\'s private collection has gained such widespread fame that {M0.he}{F0.she} now spends {M0.his}{F0.her} days negotiating with museums that want to display it. As long as they each build the "{0.SimFirstName} Wing", with a bronze plaque of {0.SimFirstName}\'s face, no problem!',
        sentient_sims_description:
          '{sim_name} has become a patron of the arts, lending his valuable art collection to museums and contributing to the promotion of art in society.',
      },
    },
  },
  career_Adult_PartTime_Barista: {
    PartTime_Barista_Track1: {
      1: {
        name: 'Coffee Stain Remover',
        description:
          'This is {0.SimFirstName}\u00e2\u0080\u0099s first step into the exciting world of caffeine distribution systems. But of course {M0.he}{F0.she} can\u00e2\u0080\u0099t be responsible for pouring coffee until {M0.he}{F0.she} proves {M0.he}{F0.she} can handle mopping floors, setting up chairs, scrubbing mugs and keeping those frothers and foamers shiny!',
        sentient_sims_description:
          '{sim_name} recently started a new job at starbucks part-time and is responsible for cleaning.',
      },
      2: {
        name: 'Bean Blender',
        description:
          'At last, {0.SimFirstName} can drop the dishrags and become one with the art of fine coffee! Grinding together the finest organic beans from around the globe, {0.SimFirstName} is now a master bean blender, a true mixologist whose arresting combinations of aggressively bold aromas and subtly nutty undertones please every palate.',
        sentient_sims_description:
          '{sim_name} works at starbucks part-time and is responsible for helping prep drinks.',
      },
      3: {
        name: 'Latte Artiste',
        description:
          'Bravo! {0.SimFirstName} has ascended the barista ranks and seized control of the frother. Now in charge of crafting sumptuous espresso drinks, adorned with a dollop of feather-light froth which {M0.he}{F0.she} arranges in cute patterns, {0.SimFirstName} knows {M0.he}{F0.she}\u00e2\u0080\u0099s a true artiste.',
        sentient_sims_description: '{sim_name} works at starbucks part-time as a barista.',
      },
    },
  },
  career_Teen_ManualLabor: {
    Teen_ManualLabor_Track1: {
      1: {
        name: 'Lawn Mower',
        description:
          'For once, being young and inexperienced will work in {0.SimFirstName}\u00e2\u0080\u0099s favor! After all, {M0.he}{F0.she} is strong, energetic, and less likely to sue for hearing loss. In fact, the adults in the neighborhood will almost feel like they are doing {0.SimFirstName} a favor by letting {M0.him}{F0.her} push heavy equipment!',
        sentient_sims_description: '{sim_name} works as a lawn mower, mowing peoples yards.',
      },
      2: {
        name: 'Landscaper',
        description:
          '{0.SimFirstName} is working {M0.his}{F0.her} way up the ladder in the landscaping world, flexing not just {M0.his}{F0.her} muscles, but {M0.his}{F0.her} artistry as well. Sure, {0.SimFirstName} is mostly working off other people\u00e2\u0080\u0099s designs-planting, digging, raking, mowing-but every so often {M0.he}{F0.she} gets to make a fleeting mark on {M0.his}{F0.her} clients\u00e2\u0080\u0099 verdant tableaux.',
        sentient_sims_description: '{sim_name} works as a landscaper.',
      },
      3: {
        name: 'Backhoe Operator',
        description:
          'Every kid goes through a digging phase, but no tiny scoop and plastic pail on the beach can ever compare to the sheer awesomeness of breaking into the earth with a backhoe! This is a big promotion to operate a big machine, and {0.SimFirstName} is hoping the big responsibility will translate into big Simoleons!',
        sentient_sims_description: '{sim_name} works as a backhoe operator in construction.',
      },
    },
  },
  careers_Adult_Freelancer_Agency_Writer: {
    careerTracks_Freelancer_Writer: {
      1: {
        name: 'Freelance Writer',
        description:
          "Climbing the ladder in a writing firm only to be assigned boring projects just isn't for {0.SimFirstName}. Neither is working unpaid and hoping to publish something that catches on. All {F0.she}{M0.he} wants to do is put {F0.her}{M0.his} prose to the paper and be rewarded for {F0.her}{M0.his} efforts. Being able to work wherever {F0.she}{M0.he} wants is a great bonus, too.",
        sentient_sims_description: '{sim_name} works as a freelance writer.',
      },
    },
  },
  career_Adult_Freelancer_Artist: {
    careerTracks_Freelancer_Artist: {
      1: {
        name: 'Freelance Artist',
        description:
          "Spec art is for starving artists; corporate art is for those who have sacrificed their creative soul. Surely there's a better way to earn a living wage without abdicating one's creative freedom? Such is the path of a freelancer, who possesses the temerity to pick and choose from those seeking {M0.his}{F0.her} artistic talents. With Digitalistic Sketchpad in hand; go forth and add beauty to the world on your own terms.",
        sentient_sims_description:
          '{sim_name} works as a freelance artist, painting murals and art installations for hire.',
      },
    },
  },
  career_Adult_Writer: {
    Writer_Track1: {
      1: {
        name: "Writer's Assistant",
        description:
          '{0.SimFirstName} is about to learn what it means to pay {M0.his}{F0.her} dues as an assistant-assistant coffee-getter, assistant fact-looker-upper, and assistant paperwork-filer. After a while, {M0.he}{F0.she} may even get to do some writing, although {M0.his}{F0.her} boss will take the credit.',
        sentient_sims_description: '{sim_name} works as writer intern, getting coffee and helping fill paperwork.',
      },
      2: {
        name: 'Blogger',
        description:
          'It\u00e2\u0080\u0099s more important to write fast than to write well\u00e2\u0080\u00a6does {0.SimFirstName} have what it takes? Bloggers only get paid if they get clicks, so {M0.he\u00e2\u0080\u0099d}{F0.she\u00e2\u0080\u0099d} better study the things people like to click on. (Cat videos and numbered lists.) ',
        sentient_sims_description: '{sim_name} works as a blog writer, getting paid for clicks online.',
      },
      3: {
        name: 'Freelance Article Writer',
        description:
          'Now {0.SimFirstName}\u00e2\u0080\u0099s working for {M0.himself}{F0.herself}, writing what {M0.he}{F0.she} wants\u00e2\u0080\u00a6or at least what paying clients want. Unfortunately, paying clients want articles about \u00e2\u0080\u009c10 Creative Ways to Eat Mushrooms\u00e2\u0080\u009d or \u00e2\u0080\u009cHot Tips to Drive Your Dog Wild.\u00e2\u0080\u009d It\u00e2\u0080\u0099s not glamorous, but it\u00e2\u0080\u0099s a living!',
        sentient_sims_description: '{sim_name} works as a writer, writing articles for websites online.',
      },
      4: {
        name: 'Advice Columnist',
        description:
          '{M0.He\u00e2\u0080\u0099s}{F0.She\u00e2\u0080\u0099s} always thought of {M0.himself}{F0.herself} as a know-it-all, but now {0.SimFirstName} is a professional know-it-all. The life of an advice columnist is full of deranged in-laws, mailmen without personal boundaries, and secret second families. But only if {M0.he}{F0.she}\u00e2\u0080\u0099s lucky.',
        sentient_sims_description: '{sim_name} works as a writer for the advice column in the paper.',
      },
      5: {
        name: 'Regular Contributor',
        description:
          'It\u00e2\u0080\u0099s important to have a beat. {0.SimFirstName} didn\u00e2\u0080\u0099t actually have any knowledge of {M0.his}{F0.her} beat before {M0.he}{F0.she} started writing about it, but if you sound convincing, you are convincing. The readers will never catch on! The secret? Use lots of big words.',
        sentient_sims_description: '{sim_name} works as a writer for the the paper, writing articles.',
      },
    },
    Writer_Track2_Author: {
      6: {
        name: 'Short Story Writer',
        description:
          'It\u00e2\u0080\u0099s not like {0.SimFirstName} can\u00e2\u0080\u0099t write longer stories, it\u00e2\u0080\u0099s just that {M0.he}{F0.she} doesn\u00e2\u0080\u0099t want to! Long stories are overrated. Who has the attention span for all that? And novels just end up getting adapted into movies anyway, and {0.SimFirstName}\u00e2\u0080\u0099s pretty busy already, so....',
        sentient_sims_description: '{sim_name} works as a writer writing short stories.',
      },
      7: {
        name: 'Novelist',
        description:
          'Most novelists don\u00e2\u0080\u0099t go crazy alone in deserted hotels in the winter. Most novelists don\u00e2\u0080\u0099t die penniless in the streets. Most novelists are happy, well-adjusted, and creatively satisfied people! {0.SimFirstName} keeps telling {M0.himself}{F0.herself} that....',
        sentient_sims_description: '{sim_name} works as a writer writing novels.',
      },
      8: {
        name: 'Fan Favorite',
        description:
          'The fans love {0.SimPronounObjective}. The critics hate {0.SimPronounObjective}. {0.SimFirstName} might be churning out sub-literate dreck, but {M0.his}{F0.her} books sell like crazy, so {M0.his}{F0.her} publisher keeps paying {0.SimPronounObjective}. And that\u00e2\u0080\u0099s the real measure of literary success. Right?  ',
        sentient_sims_description:
          '{sim_name} works as a writer writing novels, and has written a few semi successful novels.',
      },
      9: {
        name: 'Bestselling Author',
        description:
          'Bestselling authors have a tough life-going from talk show to talk show, receiving honors, counting endless stacks of money-but {0.SimFirstName} has worked hard to join their ranks. Of course if the critics don\u00e2\u0080\u0099t like {M0.his}{F0.her} next book {M0.his}{F0.her} career will be over, but no pressure. ',
        sentient_sims_description:
          "{sim_name} works as a writer writing bestselling novels, people know {sim_name}'s books.",
      },
      10: {
        name: 'Creator of Worlds',
        description:
          'The hardest part about creating a sprawling, multi-volume fantasy epic? Thinking up all those crazy names like Cloydon DeBarboot and Frimzy Peppernoodle. Definitely the names. Oh, and also dealing with the really strange, inappropriate fanfic.',
        sentient_sims_description:
          '{sim_name} works as a writer and is a household name creating multi-volume fantasy epics and consistently has books on the bestselling authors list.',
      },
    },
    Writer_Track3_Journalist: {
      6: {
        name: 'Page Two Journalist',
        description:
          'Municipal rezoning? Dog-catcher elections? The local beat isn\u00e2\u0080\u0099t always glamorous, but at least {0.SimFirstName} can use the power of {M0.his}{F0.her} job to crush {M0.his}{F0.her} enemies. Now {M0.he}{F0.she} gets the best restaurant tables and the cleaners never shrink {M0.his}{F0.her} sweaters. ',
        sentient_sims_description: '{sim_name} works as a journalist writing articles on page 2 of the newspaper.',
      },
      7: {
        name: 'Front Page Writer',
        description:
          '{M0.His}{F0.Her} crack reporting skills and snappy writing have landed {0.SimFirstName} a plum assignment covering breaking news. Toppling governments! Catastrophic natural disasters! A pop star with a new haircut! {0.SimFirstName}\u00e2\u0080\u0099s on the big stories now. ',
        sentient_sims_description:
          '{sim_name} works as a journalist writing articles that make it on the front page of the newspaper.',
      },
      8: {
        name: 'Investigative Journalist',
        description:
          'If {M0.he}{F0.she}\u00e2\u0080\u0099s lucky, {M0.he\u00e2\u0080\u0099ll}{F0.she\u00e2\u0080\u0099ll} be the reporter who cracked the biggest scandal ever. Someone, somewhere is up to no good, and {0.SimFirstName}\u00e2\u0080\u0099s determined to find them. {0.SimFirstName} loves revealing wrongdoing and making the big money, not always in that order. ',
        sentient_sims_description:
          '{sim_name} works as an investigative journalist, cracking open big scandals and digging up dirt.',
      },
      9: {
        name: 'Editor-in-Chief',
        sentient_sims_description: '{sim_name} works as the editor-in-chief for the newspaper.',
      },
      10: {
        name: 'Scribe of History',
        description:
          '{0.SimFirstName} has transcended day-to-day news and now spends {M0.his}{F0.her} time looking backward\u00e2\u0080\u00a6studying what has been, and what it all means. Future generations will study {M0.his}{F0.her} works, and many more will use them as very fancy doorstops. ',
        sentient_sims_description:
          '{sim_name} works as a scribe of history, transcending the day-to-day news and writing articles that transcend time.',
      },
    },
  },
  career_Adult_Athletic: {
    Athletic_Track1: {
      1: {
        name: 'Waterperson',
        description:
          "Delivering liquid nourishment to the world's biggest sports stars. {0.SimFirstName} will have to be fast on {M0.his}{F0.her} feet to replenish their thirst. If {M0.he}{F0.she} fails, the team will fail.",
        sentient_sims_description: '{sim_name} works as a waterperson for athletes, on the sidelines at big games.',
      },
      2: {
        name: 'Locker Room Attendant',
        description:
          "This is not just about picking up jock-straps. {0.SimFirstName} will need a positive attitude and to execute on {M0.his}{F0.her} duties with competence. {M0.His}{F0.Her} responsibilities include keeping the locker room clean, supplying players with clean towels, and organizing the team's equipment.",
        sentient_sims_description: '{sim_name} works as a locker room attendant for athletes.',
      },
      3: {
        name: 'Team Mascot',
        description:
          'A Team Mascot knows how to keep a crowd excited. Through a variety of expressions and body movements, {0.SimFirstName} will bring the fans to their feet to cheer the team on.',
        sentient_sims_description: '{sim_name} works as a team mascot for the sports team.',
      },
      4: {
        name: 'Dance Team Captain',
        description:
          'Through hard work and unparalleled leadership, {0.SimFirstName} will deliver remarkable choreographed dance routines. Fans will watch {M0.his}{F0.her} team with amazement.',
        sentient_sims_description: '{sim_name} works as the dance team captain for the sports team.',
      },
    },
    Athletic_Track2_ProfessionalAthlete: {
      5: {
        name: 'Minor Leaguer',
        description:
          "It is time for {0.SimFirstName} to show them what {M0.he}{F0.she}'s got! {0.SimFirstName} will learn from {M0.his}{F0.her} coaches, develop {M0.his}{F0.her} skills and perform because {M0.he}{F0.she} will need to impress the scouts to get to the next level.",
        sentient_sims_description: '{sim_name} works as a minor leaguer in sports.',
      },
      6: {
        name: 'Rookie',
        description:
          '{0.SimFirstName} is finally playing in the big leagues! Now {M0.he}{F0.she} is going to need to work harder than ever to stay there. {M0.He}{F0.She} needs to keep up on {M0.his}{F0.her} fitness and study the game tape. {0.SimFirstName} will get {M0.his}{F0.her} shot to make an impact!',
        sentient_sims_description: '{sim_name} works as a professional athlete in sports as a backup.',
      },
      7: {
        name: 'Starter',
        description:
          'No longer a bench warmer, now {0.SimFirstName} is playing with the big boys and earning the big bucks. Fans know who {M0.he}{F0.she} is now and are recognizing {0.SimFirstName} on the street. Keep up the hard work!',
        sentient_sims_description: '{sim_name} works as a professional athlete in sports as a starter.',
      },
      8: {
        name: 'All-Star',
        description:
          "{0.SimFirstName} has been selected to the All Star team! People from everywhere are asking for {M0.his}{F0.her} autograph. {M0.He}{F0.She}'s elite on and off the field.",
        sentient_sims_description: '{sim_name} works as a professional athlete in sports as an all-start athlete.',
      },
      9: {
        name: 'MVP',
        description:
          "{0.SimFirstName} is the most valuable player! The whole world knows it and it doesn't hurt that {M0.he}{F0.she} is booked on every talk show to discuss how {M0.he}{F0.she} achieved success. Everyone is wearing {0.SimFirstName}'s jersey and {M0.he}{F0.she} is getting tons of endorsement deals.",
        sentient_sims_description:
          '{sim_name} works as a professional athlete in sports as an all-start athlete that has been nominated as MVP.',
      },
      10: {
        name: 'Hall of Famer',
        description:
          '{0.SimFirstName} finally made it to the Hall of Fame! {M0.His}{F0.Her} name will live on forever as being the best of the best. Record books will contain {M0.his}{F0.her} athletic feats. Invitations to speaking engagements and book deals are rolling in\u00e2\u0080\u00a6in other words {M0.he}{F0.she} finally made it to the top of the mountain.',
        sentient_sims_description:
          '{sim_name} works as a professional athlete in sports as an all-start athlete that has been nominated as MVP, and inducted into the hall of fame.',
      },
    },
    Athletic_Track3_BodyBuilder: {
      5: {
        name: 'Personal Trainer',
        description:
          '{0.SimFirstName} will now help clients to achieve their personal fitness and weight goals. Using the tools of fitness, from different ways to exercise to better ways to eat, {M0.he}{F0.she} will pump them up! They will only go as far as {M0.he}{F0.she} pushes them!',
        sentient_sims_description: '{sim_name} works as a professional trainer at the gym.',
      },
      6: {
        name: 'Professional Bodybuilder',
        description:
          "Say goodbye to that puny body! {0.SimFirstName} needs to work on {M0.his}{F0.her} fitness to reach the next level. Don't wimp out! Train, train, train. Only then will {0.SimFirstName} become the Sim {M0.he}{F0.she} wants to be!",
        sentient_sims_description: '{sim_name} works as a professional bodybuilder.',
      },
      7: {
        name: 'Champion Bodybuilder',
        description:
          '{0.SimFirstName} is starting to establish {M0.his}{F0.her} name in the body building circuit. {0.SimFirstName} has to continue to work out and eat right and before {M0.he}{F0.she} knows it, {M0.he}{F0.she} will reach {M0.his}{F0.her} ultimate goal! There is no stopping {0.SimPronounObjective} now.',
        sentient_sims_description: '{sim_name} works as a professional bodybuilder, and has won championships.',
      },
      8: {
        name: 'Trainer to the Stars',
        description:
          'Time to step up and help out the stars. They will need your assistance to maintain their looks. A star cannot be flabby or a skinny minny. They need to look fit and healthy when walking down the red carpet or auditioning for a role.',
        sentient_sims_description:
          '{sim_name} works as a professional trainer, training celebrities and high profile individuals.',
      },
      9: {
        name: 'Celebrity Bodybuilder',
        description:
          "You are on the cover of all of the fitness and bodybuilding magazines. Sims want to know how {0.SimFirstName} got those rock hard abs and tight butt. {M0.His}{F0.Her} chiseled body didn't come easy. It took tons of work and there is still room to grow. Keep it up!",
        sentient_sims_description:
          '{sim_name} works as a celebrity bodybuilder, making money by being on the cover of magazines.',
      },
      10: {
        name: '{M0.Mr}{F0.Ms}. Solar System',
        description:
          'You reached the top of the mountain and have become {M0.Mr}{F0.Ms}. Solar System. Your body is your shrine and now you have the trophy and accolades to go along with it. Congratulations!',
        sentient_sims_description:
          '{sim_name} works as the best body builder in the world, their body has become world renowned.',
      },
    },
  },
  career_Adult_SecretAgent: {
    SecretAgent_Track1: {
      1: {
        name: 'Agency Clerk',
        description:
          'Before {0.SimFirstName} can conduct international espionage and eliminate targets, {M0.he\u00e2\u0080\u0099s}{F0.she\u00e2\u0080\u0099s} got to process some expense reports. And answer some phones. The occasional bagel run.... Exciting stuff!',
        sentient_sims_description:
          '{sim_name} works as an intern for a secret agent agency, doing paperwork and getting coffee.',
      },
      2: {
        name: 'Intelligence Researcher',
        description:
          "{M0.His}{F0.Her} security clearance is pretty low, but {0.SimFirstName}'s still learning some cool secrets. Since {0.SimFirstName}'s been analyzing intelligence, {0.SimFirstName}'s learned the real speed limit, a code word that allows {0.SimPronounObjective} to use any employees-only restroom, and the truth about the moon landing in the 30\u00e2\u0080\u0099s.",
        sentient_sims_description: '{sim_name} works as an intelligence researcher for a secret agency.',
      },
      3: {
        name: 'Agent Handler',
        description:
          'Run. Duck. JUDO CHOP THAT BAD GUY RIGHT NOW. {0.SimFirstName} loves giving orders. {M0.His}{F0.Her} agents will feel safe in {M0.his}{F0.her} capable hands, and {M0.he}{F0.she} can feel fulfilled being able to live {M0.his}{F0.her} spy fantasies vicariously through their adventures.',
        sentient_sims_description: '{sim_name} works as an agent handler for a secret agency.',
      },
      4: {
        name: 'Field Agent',
        description:
          'According to movies, as a field agent {0.SimFirstName} should immediately expect to go undercover to infiltrate a religious cult, street racing ring, or beauty pageant. Until then {M0.he\u00e2\u0080\u0099ll}{F0.she\u00e2\u0080\u0099ll} be interviewing a lot of tinfoil hat-wearers about the radio transmitters implanted in their teeth. Allegedly.',
        sentient_sims_description: '{sim_name} works as a field agent for a secret agency.',
      },
      5: {
        name: 'Lead Detective',
        description:
          'Running major cases is just like running any mid-size organization. It\u00e2\u0080\u0099s all about managing personnel, budgets, and the bottom line. The big difference is that if {0.SimFirstName} fails, the world blows up.  Other than that, it\u00e2\u0080\u0099s pretty much the same.',
        sentient_sims_description: '{sim_name} works as a lead detective for a secret agency.',
      },
      6: {
        name: 'Government Agent',
        description:
          '{0.SimFirstName} feels a deep sense of patriotism serving the greater good. {M0.He\u00e2\u0080\u0099s}{F0.She\u00e2\u0080\u0099s} protecting {M0.his}{F0.her} countrymen from harm, performing a vital public service. Once these feelings wear off, {M0.he}{F0.she} can head back into the private sector and actually make some money.',
        sentient_sims_description: '{sim_name} works as a government agent for a secret agency.',
      },
      7: {
        name: 'Secret Agent',
        description:
          'In the world of a spy, every stranger is a potential assassin. Every situation is a potential ambush. Fueled with adrenaline, {0.SimFirstName} lives fast and lives dangerously. {M0.He}{F0.She} also wears a lot of cool disguises.',
        sentient_sims_description: '{sim_name} works as a secret agent for a secret agency.',
      },
    },
    SecretAgent_Track2_DiamondAgent: {
      8: {
        name: 'Spy Captain',
        sentient_sims_description: '{sim_name} works as a spy captain for a secret agency, one of the top spies.',
      },
      9: {
        name: 'Shadow Agent',
        description:
          'The day that {0.SimFirstName} made Shadow Agent, they took away {M0.his}{F0.her} thumbprints and driver\u00e2\u0080\u0099s license. {M0.He\u00e2\u0080\u0099s}{F0.She\u00e2\u0080\u0099s} a ghost, a specter, a silent entity slipping through motion-detecting security systems and floating through embassies. And sometimes doing a little light paperwork.',
        sentient_sims_description:
          "{sim_name} works as a shadow agent for a secret agency, they don't exist according to some governments.",
      },
      10: {
        name: 'Double Diamond Agent',
        description:
          'Besides getting to wear a ton of incredible formalwear and sip drinks with perilously attractive strangers, {0.SimFirstName} also gets to gamble at foreign casinos with agency money. Being an international superspy is exactly as amazing as it sounds.',
        sentient_sims_description:
          '{sim_name} works as a double diamond agent for a secret agency, they are basically James Bond.',
      },
    },
    SecretAgent_Track3_Villain: {
      8: {
        name: 'Double Agent',
        description:
          'After hitting a ceiling with the Good Guys, {0.SimFirstName}\u00e2\u0080\u0099s trying {M0.his}{F0.her} hand at some Evil. Hey, that\u00e2\u0080\u0099s where the real money is! If it works out, {M0.he}{F0.she} may switch over to Evil full time....',
        sentient_sims_description:
          "{sim_name} works as a double agent for a secret agency, they didn't make enough money and wanted to try their hand at some evil.",
      },
      9: {
        name: '[Redacted]',
        description:
          'Working for [redacted], {0.SimFirstName} does a lot of [redacted] and [redacted]. Sometimes {M0.he}{F0.she} has to [redacted], but [redacted]. Soon {M0.he\u00e2\u0080\u0099ll}{F0.she\u00e2\u0080\u0099ll} [redacted] his medication for poison [redacted] before [redacted] spinning class and [redacted] steel drums.',
        sentient_sims_description:
          '{sim_name} works as a [redacted], {sim_name} also does a lot of [redacted] and [redacted].',
      },
      10: {
        name: 'Supreme Villain',
        description:
          'As a villain, {0.SimFirstName} is pretty super! You might even say {M0.he\u00e2\u0080\u0099s}{F0.she\u00e2\u0080\u0099s} a..."Supreme" Villain. But that doesn\u00e2\u0080\u0099t mean every day is just stroking hairless cats and coining catchphrases. There\u00e2\u0080\u0099s a surprising amount of paperwork involved! Paperwork and torture. Some days it\u00e2\u0080\u0099s more paperwork, some days it\u00e2\u0080\u0099s more torture. Just depends.',
        sentient_sims_description: '{sim_name} works as a supreme super villain, very evil.',
      },
      11: {
        name: 'Triple Agent',
        description:
          'After serving Good, then Evil, {0.SimFirstName} has decided to return to the Good side, to help crime-fighters get into the minds of the truly deranged. But is {M0.he}{F0.she} really helping, or leading them into a trap? Can {M0.his}{F0.her} true allegiance ever be known...?',
        sentient_sims_description:
          '{sim_name} works as a triple agent, they have decided to to help crime-fighters get into the minds of the truly deranged.',
      },
    },
  },
  career_Adult_TechGuru: {
    TechGuru_Track1: {
      1: {
        name: 'Live Chat Support Agent',
        description:
          'Welcome to Babysitting 101! {0.SimFirstName} will be using {M0.his}{F0.her} above-average intelligence for hours of gentle guidance and virtual handholding, exploring brave new limits on just how thinly one can veil sarcasm.',
        sentient_sims_description: '{sim_name} works as a live chat support agent.',
      },
      2: {
        name: 'Quality Assurance',
        description:
          '{0.SimFirstName} has entered the exciting world of QA, the unsung heroes of software development. It\u00e2\u0080\u0099s the perfect job for people who feel like they break everything they touch! But hey, better they break it than the customer, right? Right??',
        sentient_sims_description: '{sim_name} works as a QA tested in software development.',
      },
      3: {
        name: 'Code Monkey',
        description:
          'Congrats to {0.SimFirstName}! Now, instead of risking life, limb, and job pointing out the gaping holes in someone else\u00e2\u0080\u0099s code, {M0.he}{F0.she} gets to put all semblance of a life aside to program code based on someone else\u00e2\u0080\u0099s deadlines. At least there\u00e2\u0080\u0099s a benefits package!',
        sentient_sims_description: '{sim_name} works as a code monkey.',
      },
      4: {
        name: 'Ace Engineer',
        sentient_sims_description: '{sim_name} works as a software engineer.',
      },
      5: {
        name: 'Project Manager',
        description:
          '{0.SimFirstName} has finally achieved the glory of middle management! {M0.He}{F0.She} gets to drive the schedule, squeeze hundreds of programming hours out of each week, work magic with budgets and play the {M0.jerk}{F0.ice queen} everyone else gets to whine about.',
        sentient_sims_description: '{sim_name} works as a project manager for software engineers.',
      },
      6: {
        name: 'Development Captain',
        description:
          '{0.SimFirstName}\u00e2\u0080\u0099s got real power now. {M0.He}{F0.She} doesn\u00e2\u0080\u0099t just manage measly one-off projects, {M0.he}{F0.she} is in charge of the development process for several groundbreaking products. Aye, aye, this is going to be fun!',
        sentient_sims_description: '{sim_name} works as a lead developer for software engineers.',
      },
    },
    TechGuru_Track2_Gaming: {
      7: {
        name: 'eSports Competitor',
        description:
          'As an amateur cyberathlete, {0.SimFirstName}\u00e2\u0080\u0099s world is about to change. After a lifetime of training within the dimly lit confines of bedrooms and basements, {0.SimFirstName} is ready to travel the world and go head-to-head in dimly lit indoor stadiums. {M0.His}{F0.Her} time is now.',
        sentient_sims_description: '{sim_name} works as an esports competitor.',
      },
      8: {
        name: 'Pro Gamer',
        description:
          'Fantasy, meet reality. {0.SimFirstName} is actually making a living playing games competitively. Sure, {M0.he}{F0.she} isn\u00e2\u0080\u0099t exactly pulling in six figures yet, but the bounty\u00e2\u0080\u0099s getting bigger, and the sponsors are taking note. Time to invest in media training!',
        sentient_sims_description: '{sim_name} works as a pro gamer.',
      },
      9: {
        name: 'APM {F0.Queen}{M0.King}',
        description:
          'With practice comes speed, and {0.SimFirstName}\u00e2\u0080\u0099s real-time strategy skills are living proof. With APM climbing past the 400 mark, {0.SimFirstName} has been known to assemble an army, equip it, construct an impenetrable base and annihilate at least one other race in the time it takes most people to tie their shoes.',
        sentient_sims_description: '{sim_name} works as a world renowned pro gamer with an APM above 400.',
      },
      10: {
        name: 'Champion Gamer',
        description:
          'WOOT! {0.SimFirstName} is now rolling in dough, and {M0.he}{F0.she} doesn\u00e2\u0080\u0099t have too many complaints about being famous either. Sponsors are picking up tabs left and right, there are Simoleons to be made by streaming {M0.his}{F0.her} practice sessions, and the tournament prizes are nothing to sneeze at. This is the dream of gamers everywhere!',
        sentient_sims_description:
          '{sim_name} works as a world renowned pro championship gamer, having won many world titles.',
      },
    },
    TechGuru_Track3_StartUp: {
      7: {
        name: 'The Next Big Thing?',
        description:
          'At last, {0.SimFirstName} has ditched big company bureaucracy to launch {M0.his}{F0.her} very own company, founded on {M0.his}{F0.her} very own ideals, to build {M0.his}{F0.her} very own innovative solution. The only hitch? {M0.His}{F0.Her} very own money is not quite enough to get this thing off the ground.',
        sentient_sims_description: '{sim_name} works as a startup that they founded themselves, barely scraping by.',
      },
      8: {
        name: 'Independent Consultant',
        description:
          '{0.SimFirstName} is making a name for {M0.himself}{F0.herself} in the tech world, but the cash from selling off {M0.his}{F0.her} first company is already getting thin. Instead of bowing to someone else\u00e2\u0080\u0099s vision, {M0.he}{F0.she} decides to earn money as a consultant for private investors.',
        sentient_sims_description:
          '{sim_name} works as an independent consultant in software engineering, the money from previously selling off their first company is wearing thin.',
      },
      9: {
        name: 'Dot-Com Pioneer',
        description:
          'With an impressive track record for successfully launching companies, {0.SimFirstName} is always on the go and never off the grid, making split-second decisions by text on everything from development to creative to UI. Remarkably, people listen!',
        sentient_sims_description:
          '{sim_name} works as a Serial Entrepreneur and Visionary Leader, consulting for top tech companies.',
      },
      10: {
        name: 'Start-up Genius',
        description:
          'Whiz kid. Wonder. Visionary. {0.SimFirstName} has been called them all, and {M0.he}{F0.she} is confident {M0.he}{F0.she} deserves it. Everything {M0.he}{F0.she} touches turns to gold. Doors open when {M0.he}{F0.she} so much as glances at them. And technologies only emerge with {M0.his}{F0.her} permission.',
        sentient_sims_description:
          '{sim_name} works as a Startup Genius, consulting for top leaders in tech helping grow startups.',
      },
    },
  },
  career_Deliveries_FoodDeliveryNPC: {
    careerTrack_Deliveries_FoodDeliveryNPC: {
      1: {
        name: 'Zoomers Food DeliveryPerson',
        sentient_sims_description: '{sim_name} works as a food delivery person.',
      },
    },
  },
  career_Adult_Entertainer: {
    Entertainer_Track1: {
      1: {
        name: 'Amateur Entertainer',
        description:
          'If a joke is told in a comedy club, and nobody\u00e2\u0080\u0099s there to hear it, does it make a sound? As an amateur entertainer, {0.SimFirstName} is about to find out. At least there are no hisses or projectiles!',
        sentient_sims_description: '{sim_name} writes jokes in their free time as an amateur entertainer.',
      },
      2: {
        name: 'Open Mic Seeker',
        description:
          '{0.SimFirstName} was born to perform. It\u00e2\u0080\u0099s written in the stars! Of course, with the stars as {M0.his}{F0.her} only reference, open mics are {0.SimFirstName}\u00e2\u0080\u0099s only viable path to discovery and fame. The hardest part is suffering all these amateurs who can only book open mics!',
        sentient_sims_description: '{sim_name} does open-mic standup.',
      },
      3: {
        name: 'C-Lister',
        description:
          'C-List is better than no list at all! Why, {0.SimFirstName} is even starting to book a few gigs. At this point, {M0.his}{F0.her} ability to shamelessly promote {M0.himself}{F0.herself} may be a greater asset than any true talent!',
        sentient_sims_description: '{sim_name} works as a C-list standup artist, getting small gigs in clubs.',
      },
      4: {
        name: 'Opening Act',
        description:
          'Doors are starting to open for {0.SimFirstName}. And {M0.he}{F0.she} is starting to open for some pretty cool acts. Audiences actually laugh when they\u00e2\u0080\u0099re supposed to. Applause is not unheard of (or unheard). It may not be time to try the old \u00e2\u0080\u009cDon\u00e2\u0080\u0099t you know who I am?\u00e2\u0080\u009d trick yet, but it\u00e2\u0080\u0099s coming....',
        sentient_sims_description:
          '{sim_name} works as a standup comedian and has started opening for bigger named comedians as the opening act.',
      },
    },
    Entertainer_Track2_Music: {
      5: {
        name: 'Jingle Jammer',
        description:
          'Who needs name recognition when everyone recognizes your song? {0.SimFirstName} will be busy creating jingles that lodge themselves into people\u00e2\u0080\u0099s brains so tightly, it would take highly invasive surgery to get them back out. So what if they\u00e2\u0080\u0099re about cat food, or toilet cleaner? No one can flush them away, not ever!',
        sentient_sims_description:
          '{sim_name} works as a music artist creating jingles for commercials and radio commercials.',
      },
      6: {
        name: 'Serious Musician',
        description:
          '{0.SimFirstName} has always known that {M0.he}{F0.she} is more than just a {M0.hunk of love}{F0.pretty face}. {M0.He\u00e2\u0080\u0099s}{F0.She\u00e2\u0080\u0099s} got TALENT. And the instant {M0.his}{F0.her} fingers touch the keys of a piano or the strings of a guitar, everyone in the room knows it. These days, {M0.he\u00e2\u0080\u0099s}{F0.she\u00e2\u0080\u0099s} even got gigs to prove it.',
        sentient_sims_description: '{sim_name} works as a serious musician, booking small gigs.',
      },
      7: {
        name: 'Professional Pianist',
        description:
          "From posh private parties to shopping mall foyers to weddings for the web-date weary, {0.SimFirstName} is in high demand. Whether {M0.his}{F0.her} client wants guests to dance, buy hopelessly expensive trinkets, or pipe down until they say their vows, {0.SimFirstName}'s got the tunes to get results.",
        sentient_sims_description:
          '{sim_name} works as a professional pianist, from post parties to shoping mall foyers or weddings, {sim_name} is in high demand.',
      },
      8: {
        name: 'Symphonic String Player',
        description:
          'All the world\u00e2\u0080\u0099s a stage, and {0.SimFirstName} has earned {M0.his}{F0.her} place upon it. {M0.He}{F0.She} is still putting bread in {M0.his}{F0.her} jar playing weddings and private parties, but the guest list and grub is getting better every time, and {M0.he}{F0.she} occasionally lifts {M0.his}{F0.her} spirits with satisfying stints in lesser-known symphony orchestras.',
        sentient_sims_description: '{sim_name} works as a professional musician in less known symphony orchestras.',
      },
      9: {
        name: 'Instrumental Wonder',
        description:
          "Strings, winds, woods, brass. {0.SimFirstName} has mastered them all, and {M0.his}{F0.her} remarkable gifts are remarked upon quite often. Fame is {0.SimPronounPossessiveIndependent}, and {0.SimFirstName}'s working on fortune. Just not enough fortune for {0.SimPronounObjective} to say no to that web startup launch party.",
        sentient_sims_description:
          '{sim_name} works as a professional musician, knowing many and all instruments, their remarkable gifts are remarked upon quite often.',
      },
      10: {
        name: 'Concert Virtuoso',
        description:
          'Bravo, {0.SimFirstName}! {M0.He}{F0.She} will bring the crowd to its feet at nearly every sold-out performance. Applause? Roses? Room keys? These things are offered up to {0.SimFirstName} on a regular basis now. Encore!',
        sentient_sims_description:
          '{sim_name} works as a professional musician who has mastered their craft, they are known to bring the crowd to its feet at nearly every sold out performance.',
      },
    },
    Entertainer_Track3_Comedy: {
      5: {
        name: 'Jokesmith',
        description:
          'The ideas are really flowing for {0.SimFirstName} now. On stage, off stage, at weddings, at funerals. Everything is a source for hilarious new material! And who doesn\u00e2\u0080\u0099t like a good joke?',
        sentient_sims_description: '{sim_name} works as a standup comedian and comedy writer of jokes.',
      },
      6: {
        name: 'Solid Storyteller',
        description:
          'Wow, {0.SimFirstName} can really keep a crowd captive, no handcuffs required! {M0.He}{F0.She} is spending less time peddling business cards and more time practicing one-liners, \u00e2\u0080\u009csquirrel walks into a bar\u00e2\u0080\u009d jokes, and impressions that people actually recognize.',
        sentient_sims_description: '{sim_name} works as a standup comedian and is great at telling comedic stories.',
      },
      7: {
        name: 'Rising Comedian',
        description:
          '{0.SimFirstName} is doing a stand-up job with {M0.his}{F0.her} stand-up routine, and people are starting to stand up and take notice. Good thing {0.SimFirstName} can cut them back down with a few quick jokes! ({M0.His}{F0.Her} jokes are better than these.)',
        sentient_sims_description: '{sim_name} works as a standup comedian and is rising to fame.',
      },
      8: {
        name: 'Roast Master',
        description:
          '{0.SimFirstName} is done flying under the radar. {M0.He}{F0.She} is making some serious dough hosting charity events, awards ceremonies, roasts, and pretty much any other kind of party no one actually wants to attend. {M0.He}{F0.She} may even be Sim of Honor at a cheapskate celebrity wedding!',
        sentient_sims_description:
          '{sim_name} works as a standup comedian and roast master, reaching fame and participating in award ceremonies, roasts and other celebrity events.',
      },
      9: {
        name: 'Stand up Star',
        description:
          'Just like that, {0.SimFirstName} is the big name on the marquee! Up-and-coming acts are excited to open for {0.SimPronounObjective}. The work is steady, pays well, and {0.SimFirstName} has even caught a few people on the street referencing {M0.his}{F0.her} material and cracking each other up. Not bad!',
        sentient_sims_description:
          '{sim_name} works as a big name famous comedian selling out shows across tours in the country.',
      },
      10: {
        name: 'Show Stopper',
        description:
          'Joke by joke, {0.SimFirstName} has climbed the ranks of comedy, and now {M0.his}{F0.her} sets are setting new standards in the industry. An entire generation of comics will one day point back to {0.SimFirstName} as their inspiration. {0.SimFirstName} is rolling in dough, fame, and fans.',
        sentient_sims_description:
          '{sim_name} works as a world renowned famous comedian selling out stadiums across the country and is a household name in comedy in TV, movies and pop culture.',
      },
    },
  },
  career_Teen_FastFood: {
    Teen_FastFood_Track1: {
      1: {
        name: 'Table Cleaner',
        description:
          'Everyone has to start somewhere, and this won\u00e2\u0080\u0099t be so bad. I mean sure, {0.SimFirstName} will come home smelling like fried\u00e2\u0080\u00a6something\u00e2\u0080\u00a6and {M0.his}{F0.her} hands will reek of mildewed rags, but at least {M0.he\u00e2\u0080\u0099ll}{F0.she\u00e2\u0080\u0099ll}  get to see {M0.his}{F0.her} friends! Sort of. While {M0.he\u00e2\u0080\u0099s}{F0.she\u00e2\u0080\u0099s} wearing a paper hat.',
        sentient_sims_description: '{sim_name} works at a fast food chain cleaning tables.',
      },
      2: {
        name: 'Fry Cook',
        description:
          'Congratulations, {0.SimFirstName} has moved up in the world and is earning a smidge more every hour! A whole smidge! Now, instead of just being treated like {M0.he}{F0.she} is invisible, {M0.he}{F0.she} really is out of sight of the customers, focusing {M0.his}{F0.her} attention solely on hot grease and triple orders.',
        sentient_sims_description: '{sim_name} works at a fast food chain as a fry cook.',
      },
      3: {
        name: 'Food Service Cashier',
        description:
          'Sweet, sweet Simoleons! \u00c2\u00a7\u00c2\u00a7\u00c2\u00a7! {0.SimFirstName} has earned enough trust to handle the Simoleons and the people who spend them. "Service with a smile," {M0.his}{F0.her} manager always says, so {0.SimFirstName} takes orders, presses buttons, and grins until {M0.his}{F0.her} cheeks hurt.',
        sentient_sims_description: '{sim_name} works at a fast food chain as a cashier.',
      },
    },
  },
  career_Adult_Business: {
    Business_Track1: {
      1: {
        name: 'Mailroom Technician',
        description:
          "Far from the days when postal correspondence was the lifeblood of a thriving business, today's mailrooms have been made all but obsolete with the rise of email. Still, somebody's gotta distribute all the online shopping deliveries! {0.SimFirstName} will have to keep {M0.his}{F0.her} energy level up to get noticed... and elevated from the mailroom. {M0.He}{F0.She} can now Fill Out Reports on the computer and Gossip About Office Romances.",
        sentient_sims_description: '{sim_name} works as a mail room technician at a business.',
      },
      2: {
        name: 'Office Assistant',
        description:
          "It's amazing how much assistance an office needs. The more energy {0.SimFirstName} has, the more {M0.he}{F0.she}'ll get done. The better {M0.his}{F0.her} social skills, the more recognition {M0.he}{F0.she}'ll receive.",
        sentient_sims_description: '{sim_name} works as an office assistant.',
      },
      3: {
        name: 'Assistant to the Manager',
        description:
          "It's not quite management track, but it's the next best thing, isn't it? After all, the manager only has one assistant...",
        sentient_sims_description: '{sim_name} works as an assistant to the manager in a business.',
      },
      4: {
        name: 'Assistant Manager',
        description:
          "This is it... almost. Ok, so {0.SimFirstName}'s not a manager, yet. Surely {M0.he}{F0.she}'s next in line for the position. It's time to build those people skills for when {M0.he}{F0.she} has people to boss about, er... manage.",
        sentient_sims_description: '{sim_name} works as an assistant manager in a business.',
      },
      5: {
        name: 'Regional Manager',
        description:
          "{0.SimFirstName}'s the {M0.man}{F0.woman} now! ... Or at least the manager of a region of the company. That means {M0.he}{F0.she}'s got to keep working on {M0.his}{F0.her} people skills if {M0.he}{F0.she} wants an even bigger slice of the pie.",
        sentient_sims_description: '{sim_name} works as a regional manager in a business.',
      },
      6: {
        name: 'Senior Manager',
        description:
          "{0.SimFirstName} has proved {M0.himself}{F0.herself} as a manager, but {M0.he}{F0.she}'s got {M0.his}{F0.her} sights set on the next level. Whether {M0.he}{F0.she} wants to be an executive or a financial whiz, it's time to put the effort in and make it happen.",
        sentient_sims_description: '{sim_name} works as a senior manager in a business, managing multiple regions',
      },
    },
    Business_Track2_Management: {
      7: {
        name: 'Vice-President',
        sentient_sims_description: '{sim_name} works as the vice-president in a business.',
      },
      8: {
        name: 'President',
        description:
          "The corner office is {0.SimFirstName}'s. Everyone looks to {M0.him}{F0.her} for leadership. Too bad the CEO still calls the shots, but someday...",
        sentient_sims_description: '{sim_name} works as the president in a business.',
      },
      9: {
        name: 'CEO',
        description:
          "This is it: the big chair. {0.SimFirstName} makes the moves and {M0.he}{F0.she} calls the shots. It feels good to be the {M0.king}{F0.queen}, doesn't it? Well, it probably would if {M0.he}{F0.she} didn't have the board of shareholders breathing down {M0.his}{F0.her} neck for results all day.",
        sentient_sims_description: '{sim_name} works as the CEO in a business.',
      },
      10: {
        name: 'Business Tycoon',
        description:
          "{0.SimFirstName} used to run a company, and now {0.SimFirstName} runs several. Fortunately, {M0.he}{F0.she}'s got smart folks in key positions, so {M0.he}{F0.she}'s got more free time to enjoy life... and the private jet.",
        sentient_sims_description: '{sim_name} works on the boards of multiple fortune 500 businesses.',
      },
    },
    Business_Track3_Investor: {
      7: {
        name: 'Futures Trader',
        description:
          "BLT season coming up? Time to invest in pork belly futures. Commodities are the name of the game, and it's {0.SimFirstName}'s job to know what's going to be hot tomorrow. Keeping an eye on the stock market will help {0.SimPronounObjective} make {M0.his}{F0.her} mark.",
        sentient_sims_description: '{sim_name} works as a futures trader.',
      },
      8: {
        name: 'Hedge Fund Manager',
        description:
          "It's not actually about hedging; it's about leverage: maximizing returns on your clients' investments. If {0.SimFirstName} maximizes enough, there's a sizeable chunk in it for {M0.him}{F0.her}.",
        sentient_sims_description: '{sim_name} works as a hedge fund manager.',
      },
      9: {
        name: 'Corporate Raider',
        description:
          '{0.SimFirstName} is a big game hunter, and corporations are {M0.his}{F0.her} prey. Mergers and acquisitions are {M0.his}{F0.her} weapons, and good luck to any straggling executives or minority shareholders that wander into {M0.his}{F0.her} sights.',
        sentient_sims_description: '{sim_name} works as a corporate raider, making hostile takeover bids of companies.',
      },
      10: {
        name: 'Angel Investor',
        description:
          "{0.SimFirstName}'s made {M0.his}{F0.her} mark on the business world. Now, all {M0.he}{F0.she} has to do is find the next guy or gal about to make his or her mark, back them, and wait for their hard work to pay off.",
        sentient_sims_description: '{sim_name} works as an angel investor.',
      },
    },
  },
  career_Adult_Culinary: {
    Culinary_Track1: {
      1: {
        name: 'Assistant Dishwasher',
        description:
          "Time to do the work of a common household appliance! {0.SimFirstName} will be scrubbing plates, ensuring crystal glasses have no leftover lipstick residue, and striking up conversations with Sims who couldn't pay their tab!",
        sentient_sims_description: '{sim_name} works as an assistant dishwasher in a restaurant.',
      },
      2: {
        name: 'Head Dishwasher',
        description:
          'As the Head Dishwasher, {0.SimFirstName} can choose which dishes {M0.he}{F0.she} wants to wash. Hard to scrub pots and pans are no longer an issue, unless {0.SimFirstName} wants them to be. Only the most beautiful china are now placed in {0.SimFirstName}\u00e2\u0080\u0099s hands.',
        sentient_sims_description: '{sim_name} works as the head dishwasher in a restaurant.',
      },
      3: {
        name: 'Caterer',
        description:
          "Standing behind food stations unable to eat the food is never easy, but it's the new reality for {0.SimFirstName}. {M0.His}{F0.Her} days will now be filled with ridiculous dancing at weddings, failed team-building exercises, and really weird baby shower games.",
        sentient_sims_description: '{sim_name} works as a caterer server at a restaurant.',
      },
      4: {
        name: 'Mixologist',
        description:
          "The secret to Mixology is proportion. How much sweet juice? How much sour juice? Does this troubled patron want {0.SimFirstName}'s advice, or just for someone to listen? Is this a real job, or just something people do for money until they find a real job?",
        sentient_sims_description: '{sim_name} works as a mixologist and bartender at a restaurant.',
      },
      5: {
        name: 'Line Cook',
        description:
          "{0.SimFirstName} is now a Line Cook! {M0.His}{F0.Her} duties include station setup, prepping food, cleaning up and stocking. Basically everything the real cooks don't want to do!",
        sentient_sims_description: '{sim_name} works as a line cook at a restaurant.',
      },
    },
    Culinary_Track2_Chef: {
      6: {
        name: 'Head Caterer',
        description:
          'The world of private parties now belongs to {0.SimFirstName}! Forget the small-time events, now {M0.he}{F0.she} gets to enjoy short-deadline corporate events, birthday parties for children with more money than {M0.he}{F0.she} has, and incredibly particular brides!',
        sentient_sims_description:
          '{sim_name} works as a head caterer at a restaurant, servicing small and corporate events.',
      },
      7: {
        name: 'Pastry Chef',
        description:
          "Pastries are a tricky thing to master. They must be delicious enough to justify the calories, but also beautiful enough to catch the customer's eye. {0.SimFirstName} is branching out into real food artistry!",
        sentient_sims_description: '{sim_name} works as a pastry chef.',
      },
      8: {
        name: 'Sous Chef',
        description:
          "Second-in-command isn't bad at all! Now {0.SimFirstName} can do some REAL work without getting any of the credit. But hey, with a little time and a lot of effort {0.SimFirstName} will be the one running things around here!",
        sentient_sims_description: '{sim_name} works as a sous chef at a restaurant.',
      },
      9: {
        name: 'Executive Chef',
        description:
          "Congratulations to {0.SimFirstName}! {M0.He}{F0.She} is now the master of the kitchen. Yelling at underlings, demanding things be re-cooked, screaming at underlings, reprimanding underlings -- it's all possible now!",
        sentient_sims_description: '{sim_name} works as an executive chef at a restaurant.',
      },
      10: {
        name: 'Celebrity Chef',
        description:
          'Some might say {0.SimFirstName} has sold out to gain mainstream status, but {0.SimFirstName} cannot hear them. {M0.He}{F0.She} is relaxing in {M0.his}{F0.her} private\u00c2\u00a0office, eating hors d\u00e2\u0080\u0099oeurves in front of the fireplace, and considering the latest contract for a new TV show, cook book, and servingware line.',
        sentient_sims_description: '{sim_name} works as a celebrity chef, opening restaurants and appearing on TV.',
      },
    },
    Culinary_Track3_Bartender: {
      6: {
        name: 'Head Mixologist',
        description:
          'A master of doling out advice and a master of mixing fruity drinks, {0.SimFirstName} is now the Head Mixologist! It might be time to start charging therapist rates...',
        sentient_sims_description: '{sim_name} works as the head bartender at a restaurant.',
      },
      7: {
        name: 'Juice Boss',
        description:
          'A drink specialist at a nearly divine level, {0.SimFirstName} will be helping clients pair mixed drinks with a variety of meals and desserts. They may swoon as their tastebuds are overwhelmed by a culinary WooHoo of flavors.',
        sentient_sims_description:
          '{sim_name} works as the juice boss, the head bartender helping clients pair mixed drinks with a variety of meals and desserts.',
      },
      8: {
        name: 'Chief Drink Operator',
        description:
          'Coordinating orders at a corporate level is no easy feat, but {0.SimFirstName} is ready to be the next big CDO. {M0.His}{F0.Her} high-demand drinks are now made in large batches and are then shipped out to various restaurants.',
        sentient_sims_description:
          '{sim_name} works distributing their custom cocktails and selling them to restaurants, bars and corporate events.',
      },
      9: {
        name: 'Drinkmaster',
        description:
          '{0.SimFirstName} has really proven {M0.himself}{F0.herself} when it comes to concocting amazing drinks. Students from all over the world will flock to {M0.his}{F0.her} side, eager to learn from The Great Drinkmaster! There will be magic. Oh yes.\\nThere will be magic.',
        sentient_sims_description:
          '{sim_name} works distributing their name brand cocktails and selling them in big box stores.',
      },
      10: {
        name: 'Celebrity Mixologist',
        description:
          'Some might say {0.SimFirstName} has sold out to gain mainstream status, but {0.SimFirstName} cannot hear them. {M0.He}{F0.She} is relaxing in {M0.his}{F0.her} private\u00c2\u00a0office, sipping an amazing drink in front of the fireplace, and considering the latest contract for a new TV show, cook book, and glassware line.',
        sentient_sims_description:
          '{sim_name} works as a celebrity mixologist, advertising their celebrity hard alcohol in mainstream media.',
      },
    },
  },
  career_Adult_StyleInfluencer: {
    careerTracks_StyleInfluencer_Track1: {
      1: {
        name: 'Rag Reviewer',
        description:
          'Every fashion journey begins somewhere, and for you, it\'s the first stitch. While more prestigious individuals will cover the clothing of the "haute couture," you\'ll be tasked with words regarding the "not for sure."',
        sentient_sims_description:
          '{sim_name} works as a youtube commentator with a very small channel, commenting on anything they can talk about.',
      },
      2: {
        name: 'Consignment Commentator',
        description:
          "Items must find new homes and all parties must be contended with the arrangment. You've been consigned to consult, critique, and clarify the needs of clothes seeking new persons to adorn.",
        sentient_sims_description:
          '{sim_name} works as a consignment commentator, sorting through consignment clothes and finding them new homes.',
      },
      3: {
        name: 'Wearable Wordsmith',
        description:
          "Everything that adorns must be reviewed as it's worn. Your task as you type is to concisely or verbosely describe every thread and button as it pertains to your ever growing audience.",
        sentient_sims_description:
          '{sim_name} works as a Fashion Descriptive Analyst, writing the descriptions for clothing online to be sold and writing clothing reviews online for a growing audence.',
      },
      4: {
        name: 'Ensemble Author',
        description:
          "It isn't just the top, the bottom, the shoes, or the accessories, but how it all arrives and sits together. You're now focused on the meta appearance and it's the right outfit for you.",
        sentient_sims_description:
          '{sim_name} works as an Ensemble Author, writing about meta appearance and fashion online for a growing audience.',
      },
      5: {
        name: 'Culture Columnist',
        description:
          "As clothing ascends beyond material warmth and personal style, it enhances the cultural notes of its bearer. You've come to capture that, at this precise moment, for all to read!",
        sentient_sims_description:
          '{sim_name} works as a culture columnist, writing about cultural notes and fashion online for a fairly large audience.',
      },
    },
    careerTracks_StyleInfluencer_Track2_TrendSetter: {
      6: {
        name: 'Posh Profiler',
        description:
          "It's key to deeply understand the fundamentals of poshness in order to profile prodigiously for a plethora of potential clients, patrons, and avid fashionistas.",
        sentient_sims_description:
          '{sim_name} works as a Posh Profiler, writing about poshness in order to profile prodigiously for a plethora of potential clients, patrons, and avid fashionistas.',
      },
      7: {
        name: 'Fashion Figure',
        description:
          'As a stand out in the fashion forward industry, the principals of fashion, first, and always, has never been more pertinent. These trends begin and end with quality threads.',
        sentient_sims_description:
          '{sim_name} works as a Fashion Figure, as a stand out in the fashion forward industry, the principals of fashion, first, and always, has never been more pertinent.',
      },
      8: {
        name: 'Best-Self-Helper',
        description:
          'The superlative is wielded cautiously in this case, as the task of helping others with clear, concise, and insightful guidance is not something a merely comparative title can entertain.',
        sentient_sims_description:
          '{sim_name} works as a trend recommender, recommending fashion and helping others with clear, concise and insightful guidance to a large social media following.',
      },
      9: {
        name: 'It Sim',
        description:
          "Who? What? It's neither of these, but simply It. The one to whom others look for information, inspiration, and tantalization, an It Sim is THE Sim all about...it.",
        sentient_sims_description:
          '{sim_name} works as a fashionista, they are IT in fashion, the one to whom others look for information, inspiration, and tantalization.',
      },
      10: {
        name: "Icon O'Class",
        description:
          "After years of work, it's come to this. Being it, being best, figuring into things, as an Icon O'Class, the session has begun and this world will never be the same.",
        sentient_sims_description:
          '{sim_name} works as a fashionista icon, they are the best, and are a world trendsetter in fashion.',
      },
    },
    careerTracks_StyleInfluencer_Track3_Stylist: {
      6: {
        name: 'Dedicated Dresser',
        description:
          'A good day begins with the right clothes and a great night kicks off with serious duds. Pontificating seriously about each button and wily zipper is the dedicated pursuit of a Dedicated Dresser.',
        sentient_sims_description: '{sim_name} works as a dedicated dresser, helping dress and suggest fashion online.',
      },
      7: {
        name: 'Textile Tactician',
        description:
          "There are surface level considerations, but then there are also ones that go deeper. It's key to thread that needle and dip just beneath the surface to learn to mastery the ways of the textiles.",
        sentient_sims_description: '{sim_name} works as a textile tactician, helping dress and suggest fashion online.',
      },
      8: {
        name: 'Wardrobe Wiz',
        description:
          "True magic doesn't require a wand, but a coat hanger in either hand holding a carefully considered piece of attire. Bring a spell to every wardrobe!",
        sentient_sims_description: '{sim_name} works as a Wardrobe Wiz, helping dress and suggest fashion online.',
      },
      9: {
        name: 'Make-Over Miracle Worker',
        description:
          "When others need help, you're tasked to the cause. With emergent attire suggestions and ad hoc advice, you'll need to Make-Over any material need.",
        sentient_sims_description:
          '{sim_name} works as a Make-Over Miracle Worker, helping dress and suggest fashion and making over clients.',
      },
      10: {
        name: 'Persona Re-Imager',
        description:
          "Who is someone? Does it boil down to their essence of dress? Or their stint of thought? All of that will ultimately come down to you as you re-imagine one's re-emergent needs.",
        sentient_sims_description:
          '{sim_name} works as a Persona Re-Imager, helping dress and completely make over clients.',
      },
    },
  },
  career_Teen_Barista: {
    Teen_Barista_Track1: {
      1: {
        name: 'Coffee Stain Remover',
        description:
          'This is {0.SimFirstName}\u00e2\u0080\u0099s first step into the exciting world of caffeine distribution systems. But of course {M0.he}{F0.she} can\u00e2\u0080\u0099t be responsible for pouring coffee until {M0.he}{F0.she} proves {M0.he}{F0.she} can handle mopping floors, setting up chairs, scrubbing mugs and keeping those frothers and foamers shiny!',
        sentient_sims_description: '{sim_name} recently started work at starbucks and is responsible for cleaning.',
      },
      2: {
        name: 'Bean Blender',
        description:
          'At last, {0.SimFirstName} can drop the dishrags and become one with the art of fine coffee! Grinding together the finest organic beans from around the globe, {0.SimFirstName} is now a master bean blender, a true mixologist whose arresting combinations of aggressively bold aromas and subtly nutty undertones please every palate.',
        sentient_sims_description: '{sim_name} works at starbucks and is responsible for helping prep drinks.',
      },
      3: {
        name: 'Latte Artiste',
        description:
          'Bravo! {0.SimFirstName} has ascended the barista ranks and seized control of the frother. Now in charge of crafting sumptuous espresso drinks, adorned with a dollop of feather-light froth which {M0.he}{F0.she} arranges in cute patterns, {0.SimFirstName} knows {M0.he}{F0.she}\u00e2\u0080\u0099s a true artiste.',
        sentient_sims_description: '{sim_name} works at starbucks as a barista.',
      },
    },
  },
  careers_Adult_Freelancer_No_Agency: {
    careerTracks_Freelancer_No_Agency: {
      1: {
        name: 'Freelancer',
        description:
          "{0.SimFirstName} has made the decision to be a freelancer. As nice as that sounds, {M0.he}{F0.she} won't be able to find gigs or get paid until {M0.he}{F0.she} selects a trade, and an agency to represent {M0.him}{F0.her}.",
        sentient_sims_description: '{sim_name} works as a freelancer, picking up odd jobs here and there.',
      },
    },
  },
  career_Adult_PartTime_Babysitter: {
    PartTime_Babysitter_Track1: {
      1: {
        name: 'Babysitter',
        description:
          '{0.SimFirstName} can\u00e2\u0080\u0099t wait to finally earn some dough-and what could be more fun than getting paid to play with kids? Besides, the kids are asleep half the time, right? So it\u00e2\u0080\u0099s basically getting paid to couch-sit and text all {M0.his}{F0.her} friends. Cake!',
        sentient_sims_description: '{sim_name} works as a part-time baby sitter.',
      },
      2: {
        name: 'Nanny',
        description:
          'At last, {0.SimFirstName} has landed a steady nanny job with a nearby family. No more searching or scheduling-just one family with one sweet kid, who {M0.he}{F0.she} only has to win over once. {0.SimFirstName} doesn\u00e2\u0080\u0099t remember signing up for cleaning, toilet scrubbing, or laundry, but as the mother said, since {M0.he\u00e2\u0080\u0099s}{F0.she\u00e2\u0080\u0099s} there and getting paid\u00e2\u0080\u00a6',
        sentient_sims_description: '{sim_name} works as a part-time nanny.',
      },
      3: {
        name: 'Daycare Admin',
        description:
          "{0.SimFirstName} is continuing their babysitting adventure by securing a job at The Munchkin Menagerie's Holding Hands Daycare. Working with a loving, experienced team of childcare professionals, {F0.she}{M0.he} will help provide a gentle, caring and stimulating environment that honors the genius in every child.",
        sentient_sims_description:
          "{sim_name} works as a part-time daycare administrator at The Munchkin Menagerie's Holding Hands Daycare.",
      },
    },
  },
  career_Adult_PartTime_Retail: {
    PartTime_Retail_Track1: {
      1: {
        name: 'Shelf Stocker',
        description:
          '{0.SimFirstName} is ready to take {M0.his}{F0.her} part in the global economy. People need to buy things to make the economy happen, and that means that people need retailers to sell them things, and THAT means that someone needs to stock a bunch of shelves. Guess what {0.SimFirstName}\u00e2\u0080\u0099s part is?',
        sentient_sims_description: '{sim_name} works part-time as a shelf stocker at a department store.',
      },
      2: {
        name: 'Sales Floor Clerk',
        description:
          '{0.SimFirstName} has been promoted to Sales Floor Clerk! Now {M0.he}{F0.she} can interact directly with the customers and brush up on vital salesmanship skills! And between customers {M0.he}{F0.she} can sweep floors, scrape off gum, heft boxes and restock store displays.',
        sentient_sims_description: '{sim_name} works part-time as a sales floor clerk at a department store.',
      },
      3: {
        name: 'Customer Support',
        description:
          '\u00e2\u0080\u009cHappy customers, healthy business!\u00e2\u0080\u009d At least, that\u00e2\u0080\u0099s what {0.SimFirstName}\u00e2\u0080\u0099s training manual says. {M0.He}{F0.She} might be earning a healthier wage, manning the support desk with a smile, but the only customers who get sent {M0.his}{F0.her} way are not happy, not at all.',
        sentient_sims_description:
          '{sim_name} works part-time as a customer service representative at a department store.',
      },
    },
  },
  career_Teen_Babysitter: {
    Teen_Babysitter_Track1: {
      1: {
        name: 'Baby Sitter',
        description:
          '{0.SimFirstName} can\u00e2\u0080\u0099t wait to finally earn some dough-and what could be more fun than getting paid to play with kids? Besides, the kids are asleep half the time, right? So it\u00e2\u0080\u0099s basically getting paid to couch-sit and text all {M0.his}{F0.her} friends. Cake!',
        sentient_sims_description: '{sim_name} works as a baby sitter.',
      },
      2: {
        name: 'Nanny',
        description:
          'At last, {0.SimFirstName} has landed a steady nanny job with a nearby family. No more searching or scheduling-just one family with one sweet kid, who {M0.he}{F0.she} only has to win over once. {0.SimFirstName} doesn\u00e2\u0080\u0099t remember signing up for cleaning, toilet scrubbing, or laundry, but as the mother said, since {M0.he\u00e2\u0080\u0099s}{F0.she\u00e2\u0080\u0099s} there and getting paid\u00e2\u0080\u00a6',
        sentient_sims_description: '{sim_name} works as a nanny.',
      },
      3: {
        name: 'Daycare Assistant',
        description:
          '{0.SimFirstName} has earned back {M0.his}{F0.her} weekend nights by securing a job at Holding Hands Daycare. Working with a loving, experienced team of childcare professionals, {0.SimFirstName} will help provide a gentle, caring and stimulating environment that honors the genius in every child.',
        sentient_sims_description: '{sim_name} works as a daycare administrator at Holding Hands Daycare.',
      },
    },
  },
  career_Adult_PartTime_ManualLabor: {
    PartTime_ManualLabor_Track1: {
      1: {
        name: 'Lawn Mower',
        description:
          '{0.SimFirstName} has always loved being under the sun! After all, {F0.she}{M0.he} is strong, energetic, and loves the smell of freshly cut grass. And grass is green, so simoleons must smell like grass! That, or lawnmower exhaust. Either way, mowing lawns is a great work out for {F0.her}{M0.him}!',
        sentient_sims_description: '{sim_name} works as a lawn mower, mowing peoples yards.',
      },
      2: {
        name: 'Landscaper',
        description:
          '{0.SimFirstName} is working {M0.his}{F0.her} way up the ladder in the landscaping world, flexing not just {M0.his}{F0.her} muscles, but {M0.his}{F0.her} artistry as well. Sure, {0.SimFirstName} is mostly working off other people\u00e2\u0080\u0099s designs-planting, digging, raking, mowing-but every so often {M0.he}{F0.she} gets to make a fleeting mark on {M0.his}{F0.her} clients\u00e2\u0080\u0099 verdant tableaux.',
        sentient_sims_description: '{sim_name} works as a landscaper.',
      },
      3: {
        name: 'Backhoe Operator',
        description:
          'Every kid goes through a digging phase, but no tiny scoop and plastic pail on the beach can ever compare to the sheer awesomeness of breaking into the earth with a backhoe! This is a big promotion to operate a big machine, and {0.SimFirstName} is hoping the big responsibility will translate into big Simoleons!',
        sentient_sims_description: '{sim_name} works as a backhoe operator in construction.',
      },
    },
  },
  career_Adult_Criminal: {
    Criminal_Track1: {
      1: {
        name: 'Tough {M0.Guy}{F0.Gal}',
        description:
          'Every criminal mastermind needs an entry-level bodyguard with irrational anger issues. {0.SimFirstName} will beef up doorways and rumble through dark alleys, keeping rivals at bay with those three little words, "Whaddayou lookin\' at?"',
        sentient_sims_description: '{sim_name} works as an entry-level body guard for a local criminal.',
      },
      2: {
        name: 'Petty Thief',
        description:
          'Are those candy bars in your pocket? Where did you get that lovely old-lady-style purse? {0.SimFirstName} is now in charge of outfitting the bosses with snacks for the interrogation room and birthday gifts for their mother-in-laws, using {M0.his}{F0.her} five finger discount.',
        sentient_sims_description: '{sim_name} works as a criminal as a petty thief.',
      },
      3: {
        name: 'Ringleader',
        description:
          "Switching to management is never easy. Will your gang remember to rob the bank before it closes? Can the goon have a sick day when he's scheduled to work the riot? Fortunately, {0.SimFirstName} knows how to lead a ring of delinquents into trouble, like a total boss.",
        sentient_sims_description: '{sim_name} works as a ringleader for a local criminal gang.',
      },
      4: {
        name: 'Felonius Monk',
        description:
          "It's time for {0.SimFirstName} to give up the misdemeanors. What is {M0.he}{F0.she}, a baby? Time to put on the big {M0.boy}{F0.girl} pants and pull the big {M0.boy}{F0.girl} crimes: felonies. Maybe {M0.he'll}{F0.she'll} even plan a heist!",
        sentient_sims_description: '{sim_name} works as a ringleader for a local criminal gang.',
      },
      5: {
        name: 'Minor Crimelord',
        description:
          "Wanna make a deal in this 'hood? You gotta go through {0.SimFirstName}. {M0.He}{F0.She} worked {M0.his}{F0.her} way up to running the racket on this turf, from that botanical garden over there, all the way down to the new organic grocery store.",
        sentient_sims_description: '{sim_name} works as a minor crimelord in the local area.',
      },
    },
    Criminal_Track2_Boss: {
      6: {
        name: 'The Muscle',
        description:
          "From knocking out armed guards to intimidating rival gangs with a single arched eyebrow, {0.SimFirstName} is now the brawn behind the brains.  And {M0.he's}{F0.she's} closer to the action than ever. Don't mess with {M0.him}{F0.her}!",
        sentient_sims_description:
          '{sim_name} works as The Muscle for the local crime gang, taking part in the action of intimidating rival gangs and knocking out armed guards.',
      },
      7: {
        name: 'Getaway Driver',
        description:
          '{0.SimFirstName} has taken {M0.his}{F0.her} talents into the mean streets, rocking getaway cars up on two wheels, hugging corners, running from cops. This stuff would make a pretty exciting video game!',
        sentient_sims_description: '{sim_name} works as the getaway driver for the local crime gang.',
      },
      8: {
        name: 'Safe Cracker',
        description:
          '{0.SimFirstName} has proven {M0.his}{F0.her} strength and dexterity. Now, the big bosses have given {0.SimPronounObjective} a stethoscope, a drill, and a map of target banks. Doors are finally opening for {0.SimFirstName}. Literally.',
        sentient_sims_description:
          '{sim_name} works as the safe cracker for the local crime gang, helping to break into banks.',
      },
      9: {
        name: 'The Brains',
        description:
          '{0.SimFirstName} has finally earned {M0.his}{F0.her} PhD... from the STREETS. As the brains of {M0.his}{F0.her} own organization, {0.SimFirstName} will plan the big jobs, make the big scores, and bring home the big Simoleons.',
        sentient_sims_description:
          '{sim_name} works as the brains of the local crime gang, planning heists and bringing home big scores.',
      },
      10: {
        name: 'The Boss',
        description:
          "What's even better than being The Brains of the organization? Being The Brains' boss! Now {0.SimFirstName}'s crew can do all the work, while {M0.he}{F0.she} takes a bath in \u00c2\u00a71000 bills. Who cares if it's dirty money when there's so much of it?",
        sentient_sims_description: '{sim_name} works as the boss of the local crime gang, the head running everything.',
      },
    },
    Criminal_Track3_Oracle: {
      6: {
        name: 'DigiThief',
        sentient_sims_description:
          '{sim_name} works as a thief on the internet, using petty scams and scripts to make money.',
      },
      7: {
        name: 'Elite Hacker',
        description:
          '{0.SimFirstName} has managed to earn the respect of other hackers, a group not valued for an overabundance of respect! They look to {M0.him}{F0.her} for advice on how to work around the toughest security measures while covering their tracks.',
        sentient_sims_description: '{sim_name} works as an elite hacker, working for a crime group on the internet.',
      },
      8: {
        name: 'Anonymous Ghost',
        sentient_sims_description:
          '{sim_name} works as the Anonymous Ghost, a mysterious figure on the internet who operates in the shadows of the internet targeting online media, controlling it for a price.',
      },
      9: {
        name: 'Net Demon',
        description:
          '{0.SimFirstName} has really stepped up {M0.his}{F0.her} game.{M0.He}{F0.She} creates viruses that topple international corporations and incites civil wars by releasing sensitive government documents (okay, that second one might have been an accident).',
        sentient_sims_description:
          '{sim_name} works as the Net Demon, a powerful hacker who wreaks havoc on the internet, targeting both corporate entities and government organizations.',
      },
      10: {
        name: 'The Oracle',
        description:
          'Bent on taking down the old world order, a team of top hackers, ghosts, and demons takes cues from a single source. {0.SimFirstName} has become the chosen one. {M0.His}{F0.Her} army of angsty teens and disgruntled introverts has its finger on the red button controlling everything.',
        sentient_sims_description:
          '{sim_name} works as The Oracle, the enigmatic leader of a formidable hacker group, orchestrating operations that challenge the existing power structures and manipulate global events.',
      },
    },
  },
  career_Teen_HighSchool: {
    HighSchool_Track: {
      1: {
        name: 'High School F Student',
        description:
          'Okay, so... Not every child is going to get school right away. Don\u00e2\u0080\u0099t worry! Every student starts somewhere, and with a little effort {0.SimFirstName} will bring those grades up in no time. Even writing {M0.his}{F0.her} name on the test is worth a few points!',
        sentient_sims_description: '{sim_name} is a highschool student failing their classes.',
      },
      2: {
        name: 'High School D Student',
        description:
          'It\u00e2\u0080\u0099s a proud moment in any kid\u00e2\u0080\u0099s life when they make the transition from \u00e2\u0080\u009cfailing student\u00e2\u0080\u009d to \u00e2\u0080\u009cbarely passing student.\u00e2\u0080\u009d With enough effort, {0.SimFirstName} will claw {M0.his}{F0.her} way up to \u00e2\u0080\u009caverage\u00e2\u0080\u009d in no time. And THAT\u00e2\u0080\u0099S when doors start to open...',
        sentient_sims_description: '{sim_name} is a highschool student failing their classes with Ds.',
      },
      3: {
        name: 'High School C Student',
        description:
          "{0.SimFirstName} can now earn passing grades in all of {M0.his}{F0.her} subjects easily. But {M0.he}{F0.she} doesn\u00e2\u0080\u0099t want to stop there! Now that {0.SimFirstName}'s discovered an aptitude for learning, it\u00e2\u0080\u0099s time to see how far {M0.he}{F0.she} can go!",
        sentient_sims_description: '{sim_name} is a highschool student barely passing their classes with Cs.',
      },
      4: {
        name: 'High School B Student',
        sentient_sims_description: '{sim_name} is a highschool student passing their classes with Bs.',
      },
      5: {
        name: 'High School A Student',
        description:
          "It took a lot of work, but {0.SimFirstName} has turned {M0.himself}{F0.herself} into an honor-rolling, test-acing, A-plussing machine. {M0.He}{F0.She}'ll forget more over lunch than some students will learn in a lifetime. For {M0.him}{F0.her}, the future is limitless!",
        sentient_sims_description:
          '{sim_name} is a highschool student doing exceptionally well in their classes with As.',
      },
    },
  },
  career_Adult_PartTime_FastFood: {
    PartTime_FastFood_Track1: {
      1: {
        name: 'Table Cleaner',
        description:
          'Everyone has to start somewhere, and this won\u00e2\u0080\u0099t be so bad. I mean sure, {0.SimFirstName} will come home smelling like fried\u00e2\u0080\u00a6something\u00e2\u0080\u00a6and {M0.his}{F0.her} hands will reek of mildewed rags, but at least {M0.he\u00e2\u0080\u0099ll}{F0.she\u00e2\u0080\u0099ll}  get to see {M0.his}{F0.her} friends! Sort of. While {M0.he\u00e2\u0080\u0099s}{F0.she\u00e2\u0080\u0099s} wearing a paper hat.',
        sentient_sims_description: '{sim_name} works part-time at a fast food chain cleaning tables.',
      },
      2: {
        name: 'Fry Cook',
        description:
          'Congratulations, {0.SimFirstName} has moved up in the world and is earning a smidge more every hour! A whole smidge! Now, instead of just being treated like {M0.he}{F0.she} is invisible, {M0.he}{F0.she} really is out of sight of the customers, focusing {M0.his}{F0.her} attention solely on hot grease and triple orders.',
        sentient_sims_description: '{sim_name} works part-time at a fast food chain as a fry cook.',
      },
      3: {
        name: 'Food Service Cashier',
        description:
          'Sweet, sweet Simoleons! \u00c2\u00a7\u00c2\u00a7\u00c2\u00a7! {0.SimFirstName} has earned enough trust to handle the Simoleons and the people who spend them. "Service with a smile," {M0.his}{F0.her} manager always says, so {0.SimFirstName} takes orders, presses buttons, and grins until {M0.his}{F0.her} cheeks hurt.',
        sentient_sims_description: '{sim_name} works part-time at a fast food chain as a cashier.',
      },
    },
  },
  career_Adult_NPC_Firefighter: {
    careerTrack_NPC_Firefighter: {
      1: {
        name: 'Firefighter',
        sentient_sims_description: '{sim_name} works as a firefighter.',
      },
    },
  },
  career_Adult_NPC_Gardener: {
    careerTrack_NPC_Gardener: {
      1: {
        name: 'Community Gardener',
        sentient_sims_description: '{sim_name} works as a community gardener.',
      },
    },
  },
  career_Adult_NPC_Mailman: {
    careerTrack_NPC_Mailman: {
      1: {
        name: 'Mail Carrier',
        sentient_sims_description: '{sim_name} works as a mail person.',
      },
    },
  },
  career_Adult_NPC_Maid: {
    careerTrack_NPC_Maid: {
      1: {
        name: 'Maid',
        sentient_sims_description: '{sim_name} works as a maid.',
      },
    },
  },
  career_Adult_NPC_Fisherman: {
    careerTrack_NPC_Fisherman: {
      1: {
        name: 'Fisherman',
        sentient_sims_description: '{sim_name} works as a fisherman.',
      },
    },
  },
  career_Adult_NPC_Bartender: {
    careerTrack_NPC_Bartender: {
      1: {
        name: 'Mixologist',
        sentient_sims_description: '{sim_name} works as a mixologist and bartender.',
      },
    },
  },
  career_Adult_NPC_Gym_Trainer: {
    careerTrack_NPC_GymTrainer: {
      1: {
        name: 'Gym Trainer',
        sentient_sims_description: '{sim_name} works as a trainer at the gym.',
      },
    },
  },
  career_Adult_NPC_TragicClown: {
    careerTrack_NPC_TragicClown: {
      1: {
        name: 'Tragic Clown',
        sentient_sims_description: '{sim_name} works as a tragic clown.',
      },
    },
  },
  career_Adult_NPC_Nanny: {
    careerTrack_NPC_Nanny: {
      1: {
        name: 'Nanny',
        sentient_sims_description: '{sim_name} works as a nanny.',
      },
    },
  },
  career_Adult_NPC_Gardener_Service: {
    careerTrack_NPC_Gardener_Service: {
      1: {
        name: 'Professional Gardener',
        sentient_sims_description: '{sim_name} works as a professional landscaper and gardener.',
      },
    },
  },
  career_Adult_NPC_PizzaDelivery: {
    careerTrack_NPC_PizzaDelivery: {
      1: {
        name: 'Pizza Delivery {M0.Guy}{F0.Girl}',
        sentient_sims_description: '{sim_name} works as a pizza delivery driver.',
      },
    },
  },
  career_Adult_NPC_RestaurantCritic: {
    careerTrack_NPC_RestaurantCritic: {
      1: {
        name: 'Restaurant Critic',
        sentient_sims_description: '{sim_name} works as a professional restaurant critic.',
      },
    },
  },
  career_Adult_NPC_GrimReaper: {
    careerTrack_NPC_GrimReaper: {
      1: {
        name: 'Soul Reaper',
        sentient_sims_description: '{sim_name} works as the Grim Reaper and reaps Souls.',
      },
    },
  },
  career_Adult_NPC_Repair: {
    careerTrack_NPC_Repair: {
      1: {
        name: 'Repair Technician',
        sentient_sims_description: '{sim_name} works as a repair technician for appliances.',
      },
    },
  },
  career_Adult_NPC_Bartender_company: {
    careerTrack_NPC_Bartender: {
      1: {
        name: 'Mixologist',
        sentient_sims_description: '{sim_name} works as a mixologist and bartender.',
      },
    },
  },
  career_Adult_NPC_Librarian: {
    careerTrack_NPC_Librarian: {
      1: {
        name: 'Librarian',
        sentient_sims_description: '{sim_name} works as a librarian.',
      },
    },
  },
  career_Adult_NPC_StallVendor: {
    careerTrack_NPC_StallVendor: {
      1: {
        name: 'Vendor',
        sentient_sims_description: '{sim_name} works as a stall vendor at the festival.',
      },
    },
  },
  career_Adult_NPC_HomeChef: {
    careerTrack_NPC_Chef: {
      1: {
        name: 'Home Chef',
        sentient_sims_description: '{sim_name} works as a home chef.',
      },
    },
  },
  career_Adult_NPC_OwnableRestaurant_Host: {
    careerTrack_NPC_OwnableRestaurant_Host: {
      1: {
        name: 'Restaurant Host',
        sentient_sims_description: '{sim_name} just started work as a host at a restaurant.',
      },
      2: {
        name: 'Restaurant Host',
        sentient_sims_description: '{sim_name} works as a host at a restaurant.',
      },
      3: {
        name: 'Restaurant Host',
        sentient_sims_description: '{sim_name} works as a host at a restaurant.',
      },
      4: {
        name: 'Restaurant Host',
        sentient_sims_description: '{sim_name} works as a host at a restaurant.',
      },
      5: {
        name: 'Head Restaurant Host',
        sentient_sims_description: '{sim_name} works as the head host at a restaurant.',
      },
    },
  },
  career_Adult_NPC_OwnableRestaurant_Waiter: {
    careerTrack_NPC_OwnableRestaurant_Waiter: {
      1: {
        name: 'Restaurant Waiter',
        sentient_sims_description: '{sim_name} just started work as a waiter at a restaurant.',
      },
      2: {
        name: 'Restaurant Waiter',
        sentient_sims_description: '{sim_name} works as a waiter at a restaurant.',
      },
      3: {
        name: 'Restaurant Waiter',
        sentient_sims_description: '{sim_name} works as a waiter at a restaurant.',
      },
      4: {
        name: 'Restaurant Waiter',
        sentient_sims_description: '{sim_name} works as a waiter at a restaurant.',
      },
      5: {
        name: 'Head of Waitstaff',
        sentient_sims_description: '{sim_name} works as the head of waitstaff at a restaurant.',
      },
    },
  },
  career_Adult_NPC_OwnableRestaurant_Chef: {
    careerTrack_NPC_OwnableRestaurant_Chef: {
      1: {
        name: 'Line Cook',
        sentient_sims_description: '{sim_name} works as a line cook at a restaurant.',
      },
      2: {
        name: 'Demi Chef De Partie',
        sentient_sims_description: '{sim_name} works as a demi chef de partie at a restaurant.',
      },
      3: {
        name: 'Demi Chef De Partie',
        sentient_sims_description: '{sim_name} works as a chef de partie at a restaurant.',
      },
      4: {
        name: 'Sous Chef',
        sentient_sims_description: '{sim_name} works as a sous chef at a restaurant.',
      },
      5: {
        name: 'Executive Chef',
        sentient_sims_description: '{sim_name} works as an executive chef at a restaurant.',
      },
    },
  },
  // TODO: Not sure if this should be used
  // "career_Adult_NPC_Venue_BarRegular": {
  //     "careerTrack_NPC_Venue_BarRegular": {
  //         1: {
  //             "name": "Bar Regular",
  //             "sentient_sims_description": "{sim_name} is a bar regular.",
  //         }
  //     }
  // },
};

export function getCareerTrackLevel(sentientSimCareer: SentientSimCareer): CareerTrackLevel | undefined {
  if (careerDescriptions[sentientSimCareer.name]) {
    const careerTrack = careerDescriptions[sentientSimCareer.name];

    if (careerTrack[sentientSimCareer.track_name]) {
      const careerTrackLevel = careerTrack[sentientSimCareer.track_name];

      return careerTrackLevel[sentientSimCareer.level];
    }
  }

  return undefined;
}
