export const LOCALES = { en: "en" } as const;
export const DEFAULT_LOCALE = LOCALES.en;

export const resources = {
  [LOCALES.en]: {
    translation: {
      main: {
        sc: "Speedcubing Canada",
      },
      routes: {
        home: "Home",
        about: "About",
        organization: "Organization",
        faq: "FAQ",
      },
      about: {
        title: "About",
        body:
          "Speedcubing Canada exists to promote and support the speedcubing community in Canada. Speedcubing is the act of solving twisty puzzles, such as the Rubik's Cube, as quickly as possible.\n\n" +
          "Globally, official speedcubing competition is governed by the <wca>World Cube Association</wca> (WCA). Since the WCA was founded in 2004, over 100,000 individuals from more than 140 countries have competed in official WCA competitions, including over 4,700 competitors representing the country of Canada. Almost 200 official WCA competitions have been held in Canada in seven provinces.\n\n" +
          "Speedcubing Canada contributes to the WCA’s mission to “have more competitions in more countries with more people and more fun, under fair and equal conditions” by running more competitions in Canada that are fun, fair and equitable. Speedcubing Canada also works to promote speedcubing in Canada by raising awareness for the sport and the speedcubing community and working to run competitions in more provinces and territories.\n\n" +
          "The speedcubing community is a positive and friendly environment for people of all ages, including youth, students, adults and families. All speedcubing activities globally are run by volunteers. The speedcubing community provides opportunities for competitors (known as “speedcubers”) and other members to engage in a positive, competitive community, build interpersonal and leadership skills, and achieve personal success by setting official national, continental and world records.",
      },
      history: {
        title: "History",
        body1:
          "Canada plays an important part in speedcubing history as host to one of the world’s earliest World Championships, <wc2003>World Rubik’s Games Championship 2003</wc2003>, held at the Ontario Science Centre in Toronto, Ontario.\n\n",
        quote:
          "“In 2003, Ron [van Bruchem] managed to get in touch with Dan Gosbee to organize a speedcubing World Championship in Toronto, Canada. The team managed to secure sponsors and get extensive media coverage for the event. With 89 competitors in total alongside a team of competition staff, the World Rubik’s Games Championship 2003 (WC2003) took place and was a major success, marking an incredible milestone since WC1982 [the world’s first major speedcubing competition].” (<wca>World Cube Association</wca>)",
        body2:
          "\nFollowing the success of WC2003 and several subsequent competitions, the World Cube Association was founded in 2004.\n\n" +
          "Speedcubing competition returned to Canada with <canadianOpen>Canadian Open 2007</canadianOpen>. Around this time, canadianCUBING was established and would become Canada’s first WCA regional organization. Through the hard work of dedicated volunteers, canadianCUBING led the growth of speedcubing in Canada for many years, holding competitions across the country, including in Vancouver, Calgary, Toronto, Ottawa, Montreal, Halifax and more.\n\n" +
          "In 2021, Speedcubing Canada was established as a not-for-profit organization and Canada’s new speedcubing organization, signalling further growth for speedcubing in Canada. Notably, Speedcubing Canada served to host the inaugural Rubik’s WCA North American Championship in Toronto, Ontario in July 2022.",
      },
      comps: {
        title: "Competitions",
        body: "Find all upcoming competitions in Canada on the World Cube Association website.",
        cta: "See All",
      },
      organization: {
        title: "Organization",
      },
      directors: {
        title: "Directors",
        boardMember: "Board Member",
      },
      documents: {
        title: "Documents",
        byLaws: "By-laws",
        minutes: "Meeting minutes",
        policies: "Policies",
        corporate: "Corporate documents",
      },
      faq: {
        title: "When is the next WCA competition in my area?",
        // Is Speedcubing Canada affiliated with the World Cube Association?
        // Speedcubing Canada operates independently of the World Cube Association, with a separate Board of Directors. Speedcubing Canada is recognized as Canada’s official WCA regional organization.
        "when-is-the-next-wca-competition-in-my-area": {
          q: "When is the next WCA competition in my area?",
          a: "You can find <wcaComps>a list of all upcoming competitions in Canada</wcaComps> on the World Cube Association website. Check back regularly and follow Speedcubing Canada on social media to be the first to know when competitions are announced!",
        },
        "im-going-to-my-first-wca-competition-what-do-i-need-to-know": {
          q: "",
          a: "We are so excited for you to experience your first competition! Please familiarize yourself with the <regs>WCA Regulations</reg> before the competition. You may also find this <tutorial>WCA Competitor Tutorial on YouTube</tutorial> helpful.",
        },
        "who-are-the-wca-delegates-in-my-area": {
          q: "",
          a: "You can find a list of all <delegates>WCA Delegates</delegates> on the World Cube Association website.",
        },
        "how-can-i-organize-a-wca-competition": {
          q: "",
          a:
            "Organizing a WCA competition requires several hours of volunteer work. Notably, organizers are responsible for securing a suitable venue for the competition. If you are interested in organizing a WCA competition, please get in touch with a <delegates>WCA Delegate</delegates> in your region." +
            "Read the <orgGuidelines>WCA Competition Organizer Guidelines</orgGuidelines> for more information.",
        },
        "how-can-i-volunteer-with-speedcubing-canada": {
          q: "How can I volunteer with Speedcubing Canada?",
          a: "We are always looking for volunteers to help our competitions run smoothly! To volunteer at a competition, contact the organizer or WCA Delegate. Alternatively, you can fill out a “staff” application form for a competition if there is one available.",
        },
        "why-the-change-from-canadiancubing-to-speedcubing-canada": {
          q: "Why the change from canadianCUBING to Speedcubing Canada?",
          a:
            "After many years of running canadianCUBING as a grassroots community organization, the need emerged for a regional speedcubing organization that is officially registered as a not-for-profit, in order to meet the growing needs of the speedcubing community in Canada. Due to busy schedules and other factors, the canadianCUBING team was not structured in a way that enabled the organization to register as a not-for-profit. As a result, Speedcubing Canada was established as a not-for-profit organization and Canada’s new speedcubing organization in 2021, with a new Board of Directors." +
            "The speedcubing community in Canada owes so much of its growth to canadianCUBING, and we are thankful to the many volunteers who invested into the community through canadianCUBING over many years. We are looking forward to the future of speedcubing in Canada!",
        },
      },
    },
  },
};
