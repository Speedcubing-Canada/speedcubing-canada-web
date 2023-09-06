import englishMessages from "ra-language-english";
import frenchMessages from "ra-language-french";

export const LOCALES = {en: "en", fr: "fr"} as const;
export const INVERTED_LOCALES = {en: "fr", fr: "en"} as const;
export const LOCALE_TO_LANGUAGE = {en: "English", fr: "Français"} as const;
export const DEFAULT_LOCALE = LOCALES.en;
export const SAVED_LOCALE = "savedLocale";

const SUPPORTED_LOCALES = new Set<string>(Object.values(LOCALES));

export function getLocaleOrFallback(givenLocale: string): "en" | "fr" {
    return SUPPORTED_LOCALES.has(givenLocale)
        ? (givenLocale as "en" | "fr")
        : DEFAULT_LOCALE;
}

export const resources = {
    [LOCALES.en]: {
        translation: {
            main: {
                sc: "Speedcubing Canada",
                mailingList: "Mailing list",
                facebook: "Facebook",
                instagram: "Instagram",
                twitter: "Twitter",
            },
            routes: {
                home: "Home",
                about: "About",
                organization: "Organization",
                faq: "FAQ",
                account: "Account",
                rankings: "Rankings",
            },
            about: {
                title: "About",
                body:
                    "Speedcubing Canada exists to promote and support the speedcubing community in Canada. Speedcubing is the act of solving twisty puzzles, such as the Rubik's Cube, as quickly as possible.\n\n" +
                    "Globally, official speedcubing competitions are governed by the <wca>World Cube Association</wca> (WCA). Speedcubing Canada is Canada’s official <regionalOrg>WCA regional organization</regionalOrg>. Since the WCA was founded in 2004, over 100,000 individuals from more than 140 countries have competed in official WCA competitions, including over 4,700 competitors representing the country of Canada. Almost 200 official WCA competitions have been held in Canada across seven provinces.\n\n" +
                    "Speedcubing Canada contributes to the WCA’s mission to “have more competitions in more countries with more people and more fun, under fair and equal conditions” by running more competitions in Canada that are fun, fair and equitable. Speedcubing Canada also works to promote speedcubing in Canada by raising awareness for the sport and the speedcubing community.\n\n" +
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
                    "Speedcubing competitions returned to Canada with <canadianOpen>Canadian Open 2007</canadianOpen>. Around this time, canadianCUBING was established and would become Canada’s first WCA regional organization. Through the hard work of dedicated volunteers, canadianCUBING led the growth of speedcubing in Canada for many years, holding competitions across the country, including in Vancouver, Calgary, Toronto, Ottawa, Montreal, Halifax and more.\n\n" +
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
                title: "Frequently Asked Questions",
                "when-is-the-next-wca-competition-in-my-area": {
                    q: "When is the next WCA competition in my area?",
                    a: "You can find <wcaComps>a list of all upcoming competitions in Canada</wcaComps> on the World Cube Association website. Follow Speedcubing Canada on social media and <mailingList>join our mailing list</mailingList> to be the first to know when competitions are announced!",
                },
                "im-going-to-my-first-wca-competition-what-do-i-need-to-know": {
                    q: "I’m going to my first WCA competition! What do I need to know?",
                    a: "We are so excited for you to experience your first competition! Please familiarize yourself with the <regs>WCA Regulations</regs> before the competition. We also have two videos that we recommend watching before the competition: <firstComp>What to expect at your first competition</firstComp> and <compBasics>The basics of an official WCA competition</compBasics>.",
                },
                "who-are-the-wca-delegates-in-my-area": {
                    q: "Who are the WCA Delegates in my area?",
                    a: "You can find a list of all <delegates>WCA Delegates</delegates> on the World Cube Association website.",
                },
                "how-can-i-volunteer-with-speedcubing-canada": {
                    q: "How can I volunteer with Speedcubing Canada?",
                    a: "Speedcubing Canada and the World Cube Association are 100% volunteer-run organizations. We are always looking for volunteers to help our competitions run smoothly and welcome competitors, friends, family and community members to jump in and help. To learn more about volunteering at a competition, contact the organizer or WCA Delegate in advance or at the competition.",
                },
                "why-the-change-from-canadiancubing-to-speedcubing-canada": {
                    q: "Why the change from canadianCUBING to Speedcubing Canada?",
                    a:
                        "After many years of running canadianCUBING as a grassroots community organization, the need emerged for a regional speedcubing organization that is officially registered as a not-for-profit, in order to meet the growing needs of the speedcubing community in Canada. Due to busy schedules and other factors, the canadianCUBING team was not structured in a way that enabled the organization to register as a not-for-profit. As a result, Speedcubing Canada was established as a not-for-profit organization and Canada’s new speedcubing organization in 2021, with a new Board of Directors.\n\n" +
                        "The speedcubing community in Canada owes so much of its growth to canadianCUBING, and we are thankful to the many volunteers who invested into the community through canadianCUBING over many years. We are looking forward to the future of speedcubing in Canada!",
                },
                "affiliated-with-the-wca": {
                    q: "Is Speedcubing Canada affiliated with the World Cube Association?",
                    a: "Speedcubing Canada operates independently of the World Cube Association, with a separate Board of Directors. Speedcubing Canada is recognized as Canada’s official <regionalOrg>WCA regional organization</regionalOrg>.",
                },
                "why-doesnt-my-name-appear-on-the-rankings": {
                    q: "Why doesn’t my name appear on the rankings?",
                    a: "Province residence is self-reported, so you'll need to tell us your province:\n" +
                       "- Create an account on the <wca>WCA website</wca> and link it with your WCA ID.\n" +
                       "- Log in to the Speedcubing Canada website through the account tab.\n" +
                       "- Edit your profile and set your home province. Since this also affects Regional Championship eligibility, you can only do this once per year.",
                },
                "why-does-this-person-appear-in-my-province": {
                    q: "Why does this person appear in my province? They don’t live here!",
                    a: "Please <report>contact us</report> and we'll be happy to investigate. ",
                },
            },
            provinces: {
                ab: "Alberta",
                bc: "British Columbia",
                mb: "Manitoba",
                nb: "New Brunswick",
                nl: "Newfoundland and Labrador",
                ns: "Nova Scotia",
                nt: "Northwest Territories",
                nu: "Nunavut",
                on: "Ontario",
                pe: "Prince Edward Island",
                qc: "Quebec",
                sk: "Saskatchewan",
                yt: "Yukon",
                na: "N/A",
                null: "N/A",
            },
            province_with_pronouns: {
                ab: "Alberta",
                bc: "British Columbia",
                mb: "Manitoba",
                nb: "New Brunswick",
                nl: "Newfoundland and Labrador",
                ns: "Nova Scotia",
                nt: "Northwest Territories",
                nu: "Nunavut",
                on: "Ontario",
                pe: "Prince Edward Island",
                qc: "Quebec",
                sk: "Saskatchewan",
                yt: "Yukon",
                na: "N/A",
            },
            regions: {
                at: "Atlantic",
                bc: "British Columbia",
                qc: "Quebec",
                on: "Ontario",
                pr: "Prairies",
                te: "Territories",
                na: "N/A",
            },
            account: {
                title: "Account",
                hi: "Hi, ",
                policy: "Province determine your eligibility for Regional Championships. You may only represent a province where you live at least 50% of the year. We reserve the right to ask for proof of residency. If you are not a Canadian resident, or you would prefer not to list your home province, please select \"N/A\".",
                save: "Save",
                signin: "Sign in with the WCA",
                signout: "Sign Out",
                welcome: "Welcome to Speedcubing Canada account page. \n\n" +
                    "To access it, please sign in with your WCA account.",
                roles: "Roles",
                role: {
                    GLOBAL_ADMIN: "Global Admin",
                    DIRECTOR: "Director",
                    WEBMASTER: "Webmaster",
                    SENIOR_DELEGATE: "Senior Delegate",
                    DELEGATE: "Delegate",
                    CANDIDATE_DELEGATE: "Junior Delegate",
                },
                success: "Your account has been successfully updated.",
                error: "There was an error updating your account.",
                dob: "Date of Birth",
                region: "Region",
                admin: "Admin Section",
                email: "Email",
            },
            rankings: {
                title: "Rankings",
                single: "Single",
                average: "Average",
                rankfor: "Rankings for",
                event: "Event",
                unavailable: "Ranking Unavailable",
                choose: "Choose a province",
                in: "in",
                for: "for",
            },
            ranklist: {
                rank: "Rank",
                name: "Name",
                time: "Time",
            },
            events: {
                _333: "3x3x3",
                _222: "2x2x2",
                _444: "4x4x4",
                _555: "5x5x5",
                _666: "6x6x6",
                _777: "7x7x7",
                _333bf: "3x3x3 Blindfolded",
                _333oh: "3x3x3 One-Handed",
                _333fm: "3x3x3 Fewest Moves",
                _skewb: "Skewb",
                _pyram: "Pyraminx",
                _clock: "Clock",
                _minx: "Megaminx",
                _sq1: "Square-1",
                _444bf: "4x4x4 Blindfolded",
                _555bf: "5x5x5 Blindfolded",
                _333mbf: "3x3x3 Multi-Blind",
            },
            quebec: {
                body: "If you are not redirected automatically, click the link below.",
            }
        },
        ...englishMessages,
        resources: {
            Users: {
                name: 'User |||| Users',
                fields: {
                    id: 'Id',
                    name: 'Name',
                    province: 'Province',
                    roles: 'Role(s)',
                    wca_person: 'WCAID',
                    dob: 'Date of Birth',
                },
            },
        },
        admin: {
            title: "Welcome to the Admin Section",
            body: "Please note that you can filter users using the start of their first name. If you want to use the family name, you must write the first name first. You may also use exact WCAID to filter.\n" +
                " It's also important to know that you may move pages forward but not backwards. If you want to see a previous results, you need to go back to page one and then move forward again (or juste search the user).\n" +
                "Sorting or removing people does not work currently. If you want to make someone disappear from the rankings, put his/her province to N/A.",
        },
    },
    [LOCALES.fr]: {
        translation: {
            main: {
                sc: "Speedcubing Canada",
                mailingList: "Liste de diffusion",
                facebook: "Facebook",
                instagram: "Instagram",
                twitter: "Twitter",
            },
            routes: {
                home: "Accueil",
                about: "À propos",
                organization: "Organisation",
                faq: "FAQ",
                account: "Compte",
                rankings: "Classements",
            },
            about: {
                title: "À propos",
                body:
                    "Speedcubing Canada existe pour promouvoir et aider la communauté du speedcubing au Canada. Le speedcubing consiste à résoudre des casse-tête rotatifs, comme le Rubik's Cube, le plus rapidement possible.\n\n" +
                    "À l'échelle mondiale, les compétitions officielles de speedcubing sont régies par la <wca>World Cube Association</wca> (WCA). Speedcubing Canada est <regionalOrg>l'organisation régionale officielle de la WCA </regionalOrg>au Canada. Depuis la fondation de la WCA en 2004, plus de 100 000 personnes de plus de 140 pays ont participé aux compétitions officielles de la WCA, dont plus de 4 700 compétiteurs représentant le Canada. Près de 200 compétitions officielles de la WCA ont été organisées au Canada dans sept provinces.\n\n" +
                    "Speedcubing Canada contribue à la mission de la WCA qui est \"d'avoir plus de compétitions dans plus de pays avec plus de personnes et d'amusement, dans des conditions égales et équitables\" en organisant plus de compétitions au Canada qui sont amusantes, justes et équitables. Speedcubing Canada travaille également à la promotion du speedcubing au Canada en sensibilisant le public à ce sport et à la communauté du speedcubing.\n\n" +
                    "La communauté du speedcubing est un environnement positif et amical pour les personnes de tout âge, y compris les plus jeunes, les étudiants, les adultes et les familles. Toutes les activités de speedcubing dans le monde sont gérées par des bénévoles. La communauté du speedcubing offre aux compétiteurs (appelés \" speedcubeurs \") et aux autres membres la possibilité de s'engager dans une communauté positive et compétitive, de développer des compétences interpersonnelles et de leadership, et d'atteindre la réussite personnelle en établissant des records officiels nationaux, continentaux et mondiaux.",
            },
            history: {
                title: "Historique",
                body1:
                    "Le Canada a joué un rôle important dans l'histoire du speedcubing en accueillant l'un des premiers championnats mondiaux, le <wc2003>World Rubik's Games Championship 2003</wc2003>, qui s'est tenu au Centre des Sciences de l'Ontario à Toronto, en Ontario.\n\n",
                quote:
                    "\"En 2003, Ron [van Bruchem] a réussi à entrer en contact avec Dan Gosbee pour organiser un championnat du monde de speedcubing à Toronto, au Canada. L'équipe a réussi à trouver des sponsors et à obtenir une large couverture médiatique pour l'événement. Avec 89 concurrents au total aux côtés d'une équipe en charge d'aider au bon déroulement de la compétition, le Championnat du monde des jeux de Rubik 2003 (WC2003) a eu lieu et a été un succès majeur, marquant une étape incroyable depuis le WC1982 [la première grande compétition de speedcubing au monde].\" (<wca>World Cube Association</wca>)",
                body2:
                    "\nSuite au succès des Championnats du Monde 2003 et de plusieurs compétitions ultérieures, la World Cube Association a été fondée en 2004.\n\n" +
                    "Les compétitions de speedcubing sont revenues au Canada avec le <canadianOpen>Canadian Open 2007</canadianOpen>. À peu près à la même époque, canadianCUBING a été créé et est devenu la première organisation régionale de la WCA au Canada. Grâce au travail acharné de bénévoles dévoués, canadianCUBING a mené la croissance du speedcubing au Canada pendant de nombreuses années, organisant des compétitions à travers le pays, notamment à Vancouver, Calgary, Toronto, Ottawa, Montréal, Halifax et plus encore.\n\n" +
                    "En 2021, Speedcubing Canada a été créé en tant qu'organisme à but non lucratif et nouvelle organisation de speedcubing au Canada, signalant une nouvelle croissance pour le speedcubing au Canada. Notamment, Speedcubing Canada a servi à accueillir le premier championnat nord-américain Rubik's WCA à Toronto, en Ontario, en juillet 2022.",
            },
            comps: {
                title: "Compétitions",
                body: "Trouvez toutes les compétitions à venir au Canada sur le site Web de la World Cube Association.",
                cta: "Voir tout",
            },
            organization: {
                title: "Organisation",
            },
            directors: {
                title: "Directeurs",
                boardMember: "Membre du bureau",
            },
            documents: {
                title: "Documents",
                byLaws: "Règlement intérieur",
                minutes: "Compte rendu de réunion",
                policies: "Politiques",
                corporate: "Documents administratifs",
            },
            faq: {
                title: "Foire Aux Questions",
                "when-is-the-next-wca-competition-in-my-area": {
                    q: "Quand aura lieu la prochaine compétition de la WCA dans ma région ?",
                    a: "Vous pouvez trouver <wcaComps>une liste de toutes les compétitions à venir au Canada</wcaComps> sur le site Web de la World Cube Association. Suivez Speedcubing Canada sur les réseaux sociaux et <mailingList>inscrivez-vous sur notre liste de diffusion</mailingList> pour être les premiers à être informés de l'annonce des compétitions !",
                },
                "im-going-to-my-first-wca-competition-what-do-i-need-to-know": {
                    q: "Je vais participer à ma première compétition de la WCA ! Que dois-je savoir ?",
                    a: "Nous sommes très enthousiastes à l'idée de vous voir participer à votre première compétition ! Familiarisez-vous avec le <regs>règlement de la WCA</regs> avant la compétition. Nous avons également deux vidéos que nous recommandons de regarder avant la compétition : <firstComp>À quoi s'attendre lors de votre première compétition</firstComp> et <compBasics>Les bases d'une compétition officielle de la WCA</compBasics>.",
                },
                "who-are-the-wca-delegates-in-my-area": {
                    q: "Qui sont les délégués de la WCA dans ma région ?",
                    a: "Vous pouvez trouver une liste de tous les <delegates>Délégués de la WCA</delegates> sur le site de la World Cube Association.",
                },
                "how-can-i-volunteer-with-speedcubing-canada": {
                    q: "Comment puis-je devenir bénévole pour Speedcubing Canada ?",
                    a: "Speedcubing Canada et la World Cube Association sont des organisations gérées à 100% par des bénévoles. Nous sommes toujours à la recherche de bénévoles pour aider au bon déroulement de nos compétitions et nous invitons les compétiteurs, les amis, les familles et les membres de la communauté à se joindre à nous et à nous aider. Pour en savoir plus sur le bénévolat lors d'une compétition, contactez l'organisateur ou le délégué de la WCA à l'avance ou lors de la compétition.",
                },
                "why-the-change-from-canadiancubing-to-speedcubing-canada": {
                    q: "Pourquoi le changement de canadianCUBING à Speedcubing Canada ?",
                    a:
                        "Après de nombreuses années de fonctionnement de canadianCUBING en tant qu'organisation communautaire de proximité, le besoin est apparu d'une organisation régionale de speedcubing officiellement enregistrée en tant qu'organisme à but non lucratif, afin de répondre aux besoins croissants de la communauté du speedcubing au Canada. En raison d'un emploi du temps chargé et d'autres facteurs, l'équipe de canadianCUBING n'était pas structurée de manière à permettre à l'organisation de s'enregistrer en tant qu'organisme à but non lucratif. Par conséquent, Speedcubing Canada a été établi en tant qu'organisation à but non lucratif et nouvelle organisation de speedcubing au Canada en 2021, avec un nouveau conseil d'administration.\n\n" +
                        "La communauté du speedcubing au Canada doit une grande partie de sa croissance à canadianCUBING, et nous sommes reconnaissants aux nombreux bénévoles qui ont investi dans la communauté à travers canadianCUBING pendant de nombreuses années. Nous nous réjouissons de l'avenir du speedcubing au Canada !",
                },
                "affiliated-with-the-wca": {
                    q: "Speedcubing Canada est-elle affiliée à la World Cube Association ?",
                    a: "Speedcubing Canada fonctionne indépendamment de la World Cube Association, avec un conseil d'administration distinct. Speedcubing Canada est reconnue comme l'organisation régionale officielle du Canada par la <regionalOrg>WCA</regionalOrg>.",
                },
                "why-doesnt-my-name-appear-on-the-rankings": {
                    q : "Pourquoi mon nom n'apparaît-il pas dans les classements ?",
                    a: "La province de résidence est auto-déclarée, vous devez donc nous indiquer votre province:\n" +
                        "- Créez un compte sur le <wca>site de la WCA</wca> et reliez-le à votre WCAID.\n" +
                        "- Connectez-vous au site web de Speedcubing Canada via l'onglet compte.\n" +
                        "- Modifiez votre profil et définissez votre province d'origine. Comme cela affecte également l'éligibilité aux championnats régionaux, vous ne pouvez le faire qu'une seule fois par an.",
                },
                "why-does-this-person-appear-in-my-province": {
                    q : "Pourquoi cette personne apparaît-elle dans ma province ? Elle ne vit pas ici !",
                    a : "Veuillez <report>nous contacter</report> et nous nous ferons un plaisir d'enquêter. ",
                },
            },
            provinces: {
                ab: "Alberta",
                bc: "Colombie-Britannique",
                mb: "Manitoba",
                nb: "Nouveau-Brunswick",
                nl: "Terre-Neuve-et-Labrador",
                ns: "Nouvelle-Écosse",
                nt: "Territoires du Nord-Ouest",
                nu: "Nunavut",
                on: "Ontario",
                pe: "Île-du-Prince-Édouard",
                qc: "Québec",
                sk: "Saskatchewan",
                yt: "Yukon",
                na: "N/A",
                null: "N/A",
            },
            province_with_pronouns: {
                ab: "l'Alberta",
                bc: "la Colombie-Britannique",
                mb: "le Manitoba",
                nb: "le Nouveau-Brunswick",
                nl: "Terre-Neuve-et-Labrador",
                ns: "la Nouvelle-Écosse",
                nt: "les Territoires du Nord-Ouest",
                nu: "le Nunavut",
                on: "l'Ontario",
                pe: "l'Île-du-Prince-Édouard",
                qc: "le Québec",
                sk: "la Saskatchewan",
                yt: "le Yukon",
                na: "N/A",
            },
            regions: {
                at: "Atlantique",
                bc: "Colombie-Britannique",
                qc: "Québec",
                on: "Ontario",
                pr: "Prairies",
                te: "Territoires",
                na: "N/A",
            },
            account: {
                title: "Compte",
                hi: "Salut, ",
                policy: "Votre province détermine votre admissibilité aux championnats régionaux. Vous ne pouvez représenter qu'une province où vous résidez au moins 50 % de l'année. Nous nous réservons le droit de demander une preuve de résidence. Si vous n'êtes pas résident canadien ou si vous préférez ne pas indiquer votre province de résidence, veuillez sélectionner \"N/A\".",
                save: "Sauvegarder",
                signin: "Se connecter avec la WCA",
                signout: "Déconnexion",
                welcome: "Bienvenue sur la page du compte de Speedcubing Canada. \n" +
                    "Pour y accéder, veuillez vous connecter avec votre compte WCA.",
                roles: "Rôles",
                role: {
                    GLOBAL_ADMIN: "Administrateur.ice global",
                    DIRECTOR: "Directeur.ice",
                    WEBMASTER: "Webmaster",
                    SENIOR_DELEGATE: "Délégué.e senior",
                    DELEGATE: "Délégué.e",
                    CANDIDATE_DELEGATE: "Délégué.e junior",
                },
                success: "Votre compte a été mis à jour avec succès.",
                error: "Une erreur s'est produite lors de la mise à jour de votre compte.",
                dob: "Date de naissance",
                region: "Région",
                admin: "Section d'administration",
                email: "Courriel",
            },
            rankings: {
                title: "Classements",
                single: "Single",
                average: "Moyenne",
                rankfor: "Classement pour",
                event: "Épreuve",
                unavailable: "Classement indisponible",
                choose: "Choisissez une province",
                in: "au",
                for: "en",
            },
            ranklist: {
                rank: "Rang",
                name: "Nom",
                time: "Temps",
            },
            events: {
                _333: "3x3x3",
                _222: "2x2x2",
                _444: "4x4x4",
                _555: "5x5x5",
                _666: "6x6x6",
                _777: "7x7x7",
                _333bf: "3x3x3 à l'aveugle",
                _333oh: "3x3x3 à une main",
                _333fm: "3x3x3 résolution optimisée",
                _skewb: "Skewb",
                _pyram: "Pyraminx",
                _clock: "Clock",
                _minx: "Mégaminx",
                _sq1: "Square-1",
                _444bf: "4x4x4 à l'aveugle",
                _555bf: "5x5x5 à l'aveugle",
                _333mbf: "3x3x3 Multi-Blind",
            },
            quebec: {
                body: "Si vous n'êtes pas redirigés, cliquez sur le lien ci-dessous."
            }
        },
        ...frenchMessages,
        resources: {
            Users: {
                name: 'Utilisateur |||| Utilisateurs',
                fields: {
                    id: 'Id',
                    name: 'Nom',
                    province: 'Province',
                    roles: 'Rôle(s)',
                    wca_person: 'WCAID',
                    dob: 'Date de naissance',
                },
            },
        },
        admin: {
            title: "Bienvenue dans la section d'administration",
            body: "Veuillez noter que vous pouvez filtrer les utilisateurs en utilisant le début de leur prénom. Si vous voulez utiliser le nom de famille, vous devez écrire le prénom en premier. Vous pouvez également utiliser le WCAID exact pour filtrer.\n" +
                " Il est également important de savoir que vous pouvez avancer dans les pages mais pas aller en arrière. Si vous voulez voir un résultat précédent, vous devez revenir à la page une et avancer à nouveau (ou simplement rechercher l'utilisateur)." +
                " Il n'est pas possible d'utiliser la fonctionnalité permettant de ranger les colonnes ni de supprimer des utilisateurs. Si vous voulez faire disparaitre un utilisateur des classements, changez sa province pour N/A.",
        },
    },
};