// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-17 22:41:50
// Current User's Login: NUbivek




// Platform-specific handle prefixes and URL generators
export const PLATFORMS = {
    x: {
        prefix: '@',
        urlPrefix: 'https://twitter.com/',
        getUrl: (handle) => `https://twitter.com/${handle.replace('@', '')}`
    },
    linkedin: {
        prefix: '/in/',
        urlPrefix: 'https://linkedin.com/',
        getUrl: (handle) => `https://linkedin.com${handle}`
    },
    reddit: {
        prefix: 'u/',
        urlPrefix: 'https://reddit.com/user/',
        getUrl: (handle) => `https://reddit.com/user/${handle.replace('u/', '')}`
    },
    substack: {
        prefix: '',
        urlPrefix: 'https://',
        getUrl: (handle) => `https://${handle}`
    }
};

// Top-tier VC Firms (Part 1)
export const VC_FIRMS = {
    // Andreessen Horowitz (a16z)
    'a16z': {
        name: 'Andreessen Horowitz',
        handles: {
            x: '@a16z',
            linkedin: 'company/andreessen-horowitz',
            substack: 'future.a16z.com'
        },
        aum: '35B+',
        tier: 1,
        focus: ['Software', 'Crypto', 'BioTech', 'FinTech'],
        partners: [
            {
                name: 'Marc Andreessen',
                handles: {
                    x: '@pmarca',
                    linkedin: '/in/mandreessen',
                    substack: 'pmarca.substack.com'
                },
                focus: ['Enterprise', 'Software', 'Fintech'],
                verified: true
            },
            {
                name: 'Ben Horowitz',
                handles: {
                    x: '@bhorowitz',
                    linkedin: '/in/benhorowitz'
                },
                focus: ['Enterprise', 'Crypto', 'Culture'],
                verified: true
            },
            {
                name: 'Chris Dixon',
                handles: {
                    x: '@cdixon',
                    linkedin: '/in/chrisdixon',
                    substack: 'cdixon.org'
                },
                focus: ['Crypto', 'Web3', 'AI'],
                verified: true
            },
            {
                name: 'Martin Casado',
                handles: {
                    x: '@martin_casado',
                    linkedin: '/in/martincasado'
                },
                focus: ['Enterprise', 'Infrastructure', 'AI'],
                verified: true
            },
            {
                name: 'Katherine Boyle',
                handles: {
                    x: '@KTmBoyle',
                    linkedin: '/in/katherineboyle'
                },
                focus: ['Defense', 'Space', 'AI'],
                verified: true
            }
        ]
    },
    // Sequoia Capital
    'sequoia': {
        name: 'Sequoia Capital',
        handles: {
            x: '@sequoia',
            linkedin: 'company/sequoia-capital',
            substack: 'sequoia.substack.com'
        },
        aum: '85B+',
        tier: 1,
        focus: ['Enterprise', 'Consumer', 'Deep Tech'],
        partners: [
            {
                name: 'Roelof Botha',
                handles: {
                    x: '@roelofbotha',
                    linkedin: '/in/roelofbotha'
                },
                focus: ['Enterprise', 'Fintech', 'AI'],
                verified: true
            },
            {
                name: 'Alfred Lin',
                handles: {
                    x: '@Alfred_Lin',
                    linkedin: '/in/alfredlin'
                },
                focus: ['Consumer', 'Marketplaces'],
                verified: true
            },
            {
                name: 'Pat Grady',
                handles: {
                    x: '@gradypat',
                    linkedin: '/in/pat-grady-7b0978'
                },
                focus: ['Enterprise', 'SaaS'],
                verified: true
            },
            {
                name: 'Michelle Bailhe',
                handles: {
                    x: '@mbailhe',
                    linkedin: '/in/michelle-bailhe'
                },
                focus: ['AI', 'Enterprise', 'Infrastructure'],
                verified: true
            }
        ]
    },

    // Accel
    'accel': {
        name: 'Accel',
        handles: {
            x: '@accel',
            linkedin: 'company/accel-partners',
            substack: 'accel.substack.com'
        },
        aum: '50B+',
        tier: 1,
        focus: ['Enterprise', 'Consumer', 'Infrastructure'],
        partners: [
            {
                name: 'Rich Wong',
                handles: {
                    x: '@rwong',
                    linkedin: '/in/richwong'
                },
                focus: ['Enterprise', 'Mobile'],
                verified: true
            },
            {
                name: 'Dan Levine',
                handles: {
                    x: '@dlevine',
                    linkedin: '/in/danlevine'
                },
                focus: ['Enterprise', 'Security'],
                verified: true
            },
            {
                name: 'Steve Loughlin',
                handles: {
                    x: '@sjloughlin',
                    linkedin: '/in/steveloughlin'
                },
                focus: ['AI', 'Enterprise', 'SaaS'],
                verified: true
            },
            {
                name: 'Amit Kumar',
                handles: {
                    x: '@amitkumar',
                    linkedin: '/in/amitkumar'
                },
                focus: ['Infrastructure', 'Developer Tools'],
                verified: true
            }
        ]
    },

    // Greylock
    'greylock': {
        name: 'Greylock Partners',
        handles: {
            x: '@greylock',
            linkedin: 'company/greylock-partners',
            substack: 'greylock.substack.com'
        },
        aum: '45B+',
        tier: 1,
        focus: ['Enterprise', 'Consumer', 'AI', 'Security'],
        partners: [
            {
                name: 'Reid Hoffman',
                handles: {
                    x: '@reidhoffman',
                    linkedin: '/in/reidhoffman',
                    substack: 'reidhoffman.substack.com'
                },
                focus: ['AI', 'Marketplaces', 'Networks'],
                verified: true
            },
            {
                name: 'Sarah Guo',
                handles: {
                    x: '@saranormous',
                    linkedin: '/in/sarahguo',
                    substack: 'sarahguo.substack.com'
                },
                focus: ['AI', 'Security', 'Enterprise'],
                verified: true
            },
            {
                name: 'David Thacker',
                handles: {
                    x: '@dthacker',
                    linkedin: '/in/davidthacker'
                },
                focus: ['Enterprise', 'SaaS'],
                verified: true
            },
            {
                name: 'Mike Duboe',
                handles: {
                    x: '@mduboe',
                    linkedin: '/in/mduboe'
                },
                focus: ['Growth', 'Marketplaces'],
                verified: true
            }
        ]
    },
    // Benchmark
    'benchmark': {
        name: 'Benchmark',
        handles: {
            x: '@benchmark',
            linkedin: 'company/benchmark'
        },
        aum: '30B+',
        tier: 1,
        focus: ['Consumer', 'Enterprise', 'Infrastructure'],
        partners: [
            {
                name: 'Bill Gurley',
                handles: {
                    x: '@bgurley',
                    linkedin: '/in/billgurley',
                    substack: 'abovethecrowd.com'
                },
                focus: ['Marketplaces', 'Enterprise'],
                verified: true
            },
            {
                name: 'Sarah Tavel',
                handles: {
                    x: '@sarahtavel',
                    linkedin: '/in/sarahtavel'
                },
                focus: ['Consumer', 'Marketplaces'],
                verified: true
            },
            {
                name: 'Peter Fenton',
                handles: {
                    x: '@peterfenton',
                    linkedin: '/in/peter-fenton-1b9614'
                },
                focus: ['Enterprise', 'Open Source'],
                verified: true
            },
            {
                name: 'Chetan Puttagunta',
                handles: {
                    x: '@chetanp',
                    linkedin: '/in/chetanputtagunta'
                },
                focus: ['Enterprise', 'Infrastructure'],
                verified: true
            }
        ]
    },

    // Lightspeed
    'lightspeed': {
        name: 'Lightspeed Venture Partners',
        handles: {
            x: '@lightspeedvp',
            linkedin: 'company/lightspeed-venture-partners',
            substack: 'lightspeed.substack.com'
        },
        aum: '25B+',
        tier: 1,
        focus: ['Enterprise', 'Consumer', 'Crypto', 'Healthcare'],
        partners: [
            {
                name: 'Arif Janmohamed',
                handles: {
                    x: '@arifj',
                    linkedin: '/in/arifjanmohamed'
                },
                focus: ['Enterprise', 'Security'],
                verified: true
            },
            {
                name: 'Nicole Quinn',
                handles: {
                    x: '@nicolequinnvc',
                    linkedin: '/in/nicole-quinn-2b557b1'
                },
                focus: ['Consumer', 'Creator Economy'],
                verified: true
            },
            {
                name: 'Ravi Mhatre',
                handles: {
                    x: '@ravimhatre',
                    linkedin: '/in/ravi-mhatre-a57b'
                },
                focus: ['Enterprise', 'Infrastructure'],
                verified: true
            },
            {
                name: 'Mercedes Bent',
                handles: {
                    x: '@mercebent',
                    linkedin: '/in/mercedesbent'
                },
                focus: ['Fintech', 'Consumer', 'Web3'],
                verified: true
            }
        ]
    },

    // NEA
    'nea': {
        name: 'New Enterprise Associates',
        handles: {
            x: '@nea',
            linkedin: 'company/nea',
            substack: 'nea.substack.com'
        },
        aum: '25B+',
        tier: 1,
        focus: ['Enterprise', 'Healthcare', 'Technology'],
        partners: [
            {
                name: 'Scott Sandell',
                handles: {
                    x: '@scottsandell',
                    linkedin: '/in/scottsandell'
                },
                focus: ['Enterprise', 'Cloud'],
                verified: true
            },
            {
                name: 'Tony Florence',
                handles: {
                    x: '@tonyflorence',
                    linkedin: '/in/tony-florence-96b2632'
                },
                focus: ['Consumer', 'Enterprise'],
                verified: true
            },
            {
                name: 'Mohamad Makhzoumi',
                handles: {
                    x: '@mmakhzoumi',
                    linkedin: '/in/mohamadmakhzoumi'
                },
                focus: ['Healthcare', 'Technology'],
                verified: true
            },
            {
                name: 'Ann Bordetsky',
                handles: {
                    x: '@annbordetsky',
                    linkedin: '/in/annbordetsky'
                },
                focus: ['Consumer', 'Climate'],
                verified: true
            }
        ]
    },
    // Bessemer Venture Partners
    'bessemer': {
        name: 'Bessemer Venture Partners',
        handles: {
            x: '@bvp',
            linkedin: 'company/bessemer-venture-partners',
            substack: 'bvp.substack.com'
        },
        aum: '20B+',
        tier: 1,
        focus: ['Enterprise', 'Healthcare', 'Consumer', 'Space'],
        partners: [
            {
                name: 'Byron Deeter',
                handles: {
                    x: '@bdeeter',
                    linkedin: '/in/byrondeeter'
                },
                focus: ['Cloud', 'SaaS'],
                verified: true
            },
            // Update the problematic section (around line 415-425)
            {
                name: "Mary D\u2019Onofrio",  // Using Unicode escape for apostrophe
                // OR
                name: 'Mary D\'Onofrio',      // Using escaped apostrophe
                handles: {
                    x: '@mary_donofrio',
                    linkedin: '/in/mary-d-onofrio-96a3802b'
                },
                focus: ['Cloud', 'Infrastructure'],
                verified: true
            },
            {
                name: 'Ethan Kurzweil',
                handles: {
                    x: '@ethankurz',
                    linkedin: '/in/ethankurzweil'
                },
                focus: ['Developer Tools', 'Infrastructure'],
                verified: true
            },
            {
                name: 'Talia Goldberg',
                handles: {
                    x: '@taliagoldberg',
                    linkedin: '/in/taliagoldberg'
                },
                focus: ['Consumer', 'Marketplaces'],
                verified: true
            }
        ]
    },

    // Index Ventures
    'index': {
        name: 'Index Ventures',
        handles: {
            x: '@indexventures',
            linkedin: 'company/index-ventures',
            substack: 'indexventures.substack.com'
        },
        aum: '18B+',
        tier: 1,
        focus: ['Enterprise', 'Consumer', 'Fintech', 'Gaming'],
        partners: [
            {
                name: 'Danny Rimer',
                handles: {
                    x: '@dannyrimer',
                    linkedin: '/in/dannyrimer'
                },
                focus: ['Consumer', 'Gaming'],
                verified: true
            },
            {
                name: 'Mike Volpi',
                handles: {
                    x: '@mavolpi',
                    linkedin: '/in/mikevolpi'
                },
                focus: ['Enterprise', 'Infrastructure'],
                verified: true
            },
            {
                name: 'Nina Achadjian',
                handles: {
                    x: '@nina_achadjian',
                    linkedin: '/in/ninaachadjian'
                },
                focus: ['Enterprise', 'AI'],
                verified: true
            },
            {
                name: 'Sarah Cannon',
                handles: {
                    x: '@sarahcannon',
                    linkedin: '/in/sarah-cannon-85aa8b33'
                },
                focus: ['Fintech', 'Consumer'],
                verified: true
            }
        ]
    },

    // General Catalyst
    'generalcatalyst': {
        name: 'General Catalyst',
        handles: {
            x: '@gcvp',
            linkedin: 'company/general-catalyst-partners',
            substack: 'generalcatalyst.substack.com'
        },
        aum: '22B+',
        tier: 1,
        focus: ['Enterprise', 'Healthcare', 'Consumer', 'Deep Tech'],
        partners: [
            {
                name: 'Hemant Taneja',
                handles: {
                    x: '@htaneja',
                    linkedin: '/in/hemanttaneja',
                    substack: 'tantacost.substack.com'
                },
                focus: ['Healthcare', 'Climate'],
                verified: true
            },
            {
                name: 'Deep Nishar',
                handles: {
                    x: '@deepnishar',
                    linkedin: '/in/deepnishar'
                },
                focus: ['Enterprise', 'AI'],
                verified: true
            },
            {
                name: 'Katherine Boyle',
                handles: {
                    x: '@ktboyle',
                    linkedin: '/in/katherine-boyle-6591853'
                },
                focus: ['Defense', 'Space'],
                verified: true
            },
            {
                name: 'Paul Kwan',
                handles: {
                    x: '@paulkwan',
                    linkedin: '/in/pkwan'
                },
                focus: ['Fintech', 'Enterprise'],
                verified: true
            }
        ]
    },
    // Khosla Ventures
    'khosla': {
        name: 'Khosla Ventures',
        handles: {
            x: '@khoslaventures',
            linkedin: 'company/khosla-ventures',
            substack: 'khoslaventures.substack.com'
        },
        aum: '15B+',
        tier: 1,
        focus: ['Deep Tech', 'Climate', 'AI', 'Healthcare'],
        partners: [
            {
                name: 'Vinod Khosla',
                handles: {
                    x: '@vkhosla',
                    linkedin: '/in/vinodkhosla'
                },
                focus: ['Climate', 'Deep Tech'],
                verified: true
            },
            {
                name: 'Samir Kaul',
                handles: {
                    x: '@samirkaul',
                    linkedin: '/in/samir-kaul-139b85'
                },
                focus: ['Healthcare', 'Biotech'],
                verified: true
            },
            {
                name: 'Sven Strohband',
                handles: {
                    x: '@sstrohband',
                    linkedin: '/in/sven-strohband-81b095'
                },
                focus: ['Robotics', 'Deep Tech'],
                verified: true
            },
            {
                name: 'Alex Morgan',
                handles: {
                    x: '@alexmorgan',
                    linkedin: '/in/alex-morgan-md-phd-1b9a316'
                },
                focus: ['Healthcare', 'Bio'],
                verified: true
            }
        ]
    },

    // Founders Fund
    'foundersfund': {
        name: 'Founders Fund',
        handles: {
            x: '@foundersfund',
            linkedin: 'company/founders-fund',
            substack: 'foundersfund.substack.com'
        },
        aum: '11B+',
        tier: 1,
        focus: ['Deep Tech', 'Space', 'Biotech', 'Software'],
        partners: [
            {
                name: 'Keith Rabois',
                handles: {
                    x: '@rabois',
                    linkedin: '/in/keith-rabois-27015613'
                },
                focus: ['Consumer', 'Enterprise'],
                verified: true
            },
            {
                name: 'Brian Singerman',
                handles: {
                    x: '@briansingerman',
                    linkedin: '/in/brian-singerman-a263733'
                },
                focus: ['Deep Tech', 'Healthcare'],
                verified: true
            },
            {
                name: 'Napoleon Ta',
                handles: {
                    x: '@napoleonta',
                    linkedin: '/in/napoleonta'
                },
                focus: ['Enterprise', 'AI'],
                verified: true
            },
            {
                name: 'Trae Stephens',
                handles: {
                    x: '@traestephens',
                    linkedin: '/in/traestephens'
                },
                focus: ['Defense', 'GovTech'],
                verified: true
            }
        ]
    },

    // Tiger Global
    'tigerglobal': {
        name: 'Tiger Global Management',
        handles: {
            x: '@tigerglobal',
            linkedin: 'company/tiger-global-management'
        },
        aum: '95B+',
        tier: 1,
        focus: ['Global', 'Technology', 'Software', 'Internet'],
        partners: [
            {
                name: 'Chase Coleman',
                handles: {
                    x: '@colemanctc',
                    linkedin: '/in/chase-coleman-iii-ab45362'
                },
                focus: ['Global Technology'],
                verified: true
            },
            {
                name: 'Scott Shleifer',
                handles: {
                    x: '@sshleifer',
                    linkedin: '/in/scott-shleifer-94362'
                },
                focus: ['Global Internet'],
                verified: true
            },
            {
                name: 'John Curtius',
                handles: {
                    x: '@johncurtius',
                    linkedin: '/in/john-curtius-6305543'
                },
                focus: ['Enterprise Software'],
                verified: true
            },
            {
                name: 'Griffin Schroeder',
                handles: {
                    x: '@griffschroeder',
                    linkedin: '/in/griffin-schroeder-2a85382'
                },
                focus: ['Global Markets'],
                verified: true
            }
        ]
    },
    // First Round Capital
    'firstround': {
        name: 'First Round Capital',
        handles: {
            x: '@firstround',
            linkedin: 'company/first-round-capital',
            substack: 'firstround.substack.com'
        },
        aum: '3B+',
        tier: 1,
        focus: ['Seed', 'Consumer', 'Enterprise', 'Healthcare'],
        partners: [
            {
                name: 'Josh Kopelman',
                handles: {
                    x: '@joshk',
                    linkedin: '/in/joshkopelman'
                },
                focus: ['Consumer', 'Marketplaces'],
                verified: true
            },
            {
                name: 'Bill Trenchard',
                handles: {
                    x: '@btrenchard',
                    linkedin: '/in/billtrenchard'
                },
                focus: ['Enterprise', 'SaaS'],
                verified: true
            },
            {
                name: 'Hayley Barna',
                handles: {
                    x: '@hayleybarna',
                    linkedin: '/in/hayleybarna'
                },
                focus: ['Consumer', 'Healthcare'],
                verified: true
            },
            {
                name: 'Todd Jackson',
                handles: {
                    x: '@tjackson',
                    linkedin: '/in/toddjackson'
                },
                focus: ['Product', 'Consumer'],
                verified: true
            }
        ]
    },

    // Union Square Ventures
    'usv': {
        name: 'Union Square Ventures',
        handles: {
            x: '@usv',
            linkedin: 'company/union-square-ventures',
            substack: 'usv.substack.com'
        },
        aum: '4.5B+',
        tier: 1,
        focus: ['Networks', 'Crypto', 'Climate', 'Education'],
        partners: [
            {
                name: 'Fred Wilson',
                handles: {
                    x: '@fredwilson',
                    linkedin: '/in/fredwilson',
                    substack: 'avc.com'
                },
                focus: ['Networks', 'Crypto'],
                verified: true
            },
            {
                name: 'Albert Wenger',
                handles: {
                    x: '@albertwenger',
                    linkedin: '/in/albertwenger',
                    substack: 'continuations.com'
                },
                focus: ['Climate', 'Web3'],
                verified: true
            },
            {
                name: 'Rebecca Kaden',
                handles: {
                    x: '@rebeccakaden',
                    linkedin: '/in/rebecca-kaden-2379544'
                },
                focus: ['Consumer', 'Healthcare'],
                verified: true
            },
            {
                name: 'Nick Grossman',
                handles: {
                    x: '@nickgrossman',
                    linkedin: '/in/nickgrossman'
                },
                focus: ['Crypto', 'Networks'],
                verified: true
            }
        ]
    },

    // Kleiner Perkins
    'kleinerperkins': {
        name: 'Kleiner Perkins',
        handles: {
            x: '@kleinerperkins',
            linkedin: 'company/kleiner-perkins',
            substack: 'kleinerperkins.substack.com'
        },
        aum: '19B+',
        tier: 1,
        focus: ['Consumer', 'Enterprise', 'Fintech', 'Healthcare'],
        partners: [
            {
                name: 'Mamoon Hamid',
                handles: {
                    x: '@mamoonha',
                    linkedin: '/in/mamoonha'
                },
                focus: ['Enterprise', 'SaaS'],
                verified: true
            },
            {
                name: 'Ilya Fushman',
                handles: {
                    x: '@ilyaf',
                    linkedin: '/in/ilyaf'
                },
                focus: ['Enterprise', 'Infrastructure'],
                verified: true
            },
            {
                name: 'Bucky Moore',
                handles: {
                    x: '@buckymoore',
                    linkedin: '/in/buckymoore'
                },
                focus: ['Infrastructure', 'Developer Tools'],
                verified: true
            },
            {
                name: 'Annie Case',
                handles: {
                    x: '@anniecase',
                    linkedin: '/in/annie-case'
                },
                focus: ['Consumer', 'Marketplaces'],
                verified: true
            }
        ]
    },
    // Insight Partners
    'insight': {
        name: 'Insight Partners',
        handles: {
            x: '@insightpartners',
            linkedin: 'company/insight-partners',
            substack: 'insight.substack.com'
        },
        aum: '65B+',
        tier: 1,
        focus: ['Software', 'ScaleUp', 'Enterprise', 'Data'],
        partners: [
            {
                name: 'Deven Parekh',
                handles: {
                    x: '@devenparekh',
                    linkedin: '/in/devenparekh'
                },
                focus: ['Enterprise', 'Software'],
                verified: true
            },
            {
                name: 'Lonne Jaffe',
                handles: {
                    x: '@lonnejaffe',
                    linkedin: '/in/lonnejaffe'
                },
                focus: ['Software', 'AI'],
                verified: true
            },
            {
                name: 'Nikhil Sachdev',
                handles: {
                    x: '@nikhilsachdev',
                    linkedin: '/in/nikhil-sachdev-96b4582'
                },
                focus: ['Enterprise', 'Fintech'],
                verified: true
            },
            {
                name: 'Rebecca Liu-Doyle',
                handles: {
                    x: '@rebeccaliudoyle',
                    linkedin: '/in/rebecca-liu-doyle-4a933639'
                },
                focus: ['Enterprise', 'Data'],
                verified: true
            }
        ]
    },

    // GGV Capital
    'ggv': {
        name: 'GGV Capital',
        handles: {
            x: '@ggvcapital',
            linkedin: 'company/ggv-capital',
            substack: 'ggv.substack.com'
        },
        aum: '9.2B+',
        tier: 1,
        focus: ['Global', 'Consumer', 'Enterprise', 'Crypto'],
        partners: [
            {
                name: 'Hans Tung',
                handles: {
                    x: '@hanstung',
                    linkedin: '/in/hanstung',
                    substack: 'hans.substack.com'
                },
                focus: ['Global', 'Consumer'],
                verified: true
            },
            {
                name: 'Glenn Solomon',
                handles: {
                    x: '@glennsolomon',
                    linkedin: '/in/glenn-solomon-a29b2'
                },
                focus: ['Enterprise', 'Cloud'],
                verified: true
            },
            {
                name: 'Jeff Richards',
                handles: {
                    x: '@jrichlive',
                    linkedin: '/in/jeffrichards'
                },
                focus: ['Enterprise', 'SaaS'],
                verified: true
            },
            {
                name: 'Robin Li',
                handles: {
                    x: '@robinliggv',
                    linkedin: '/in/robinli'
                },
                focus: ['Consumer', 'EdTech'],
                verified: true
            }
        ]
    },

    // Coatue Management
    'coatue': {
        name: 'Coatue Management',
        handles: {
            x: '@coatue',
            linkedin: 'company/coatue-management'
        },
        aum: '50B+',
        tier: 1,
        focus: ['Technology', 'Consumer', 'Enterprise', 'AI'],
        partners: [
            {
                name: 'Philippe Laffont',
                handles: {
                    x: '@philippelaffont',
                    linkedin: '/in/philippe-laffont-92385'
                },
                focus: ['Technology', 'Global'],
                verified: true
            },
            {
                name: 'Caryn Marooney',
                handles: {
                    x: '@carynm',
                    linkedin: '/in/carynmarooney'
                },
                focus: ['Enterprise', 'AI'],
                verified: true
            },
            {
                name: 'Matt Mazzeo',
                handles: {
                    x: '@mazzeo',
                    linkedin: '/in/mazzeo'
                },
                focus: ['Consumer', 'Creator Economy'],
                verified: true
            },
            {
                name: 'Lucas Swisher',
                handles: {
                    x: '@lucasswisher',
                    linkedin: '/in/lucas-swisher-8b397645'
                },
                focus: ['Enterprise', 'Software'],
                verified: true
            }
        ]
    },
    // Battery Ventures
    'battery': {
        name: 'Battery Ventures',
        handles: {
            x: '@batteryventures',
            linkedin: 'company/battery-ventures',
            substack: 'battery.substack.com'
        },
        aum: '13B+',
        tier: 1,
        focus: ['Enterprise', 'Infrastructure', 'Consumer', 'Industrial Tech'],
        partners: [
            {
                name: 'Neeraj Agrawal',
                handles: {
                    x: '@neerajVC',
                    linkedin: '/in/neerajagrawal'
                },
                focus: ['Enterprise', 'Cloud'],
                verified: true
            },
            {
                name: 'Dharmesh Thakker',
                handles: {
                    x: '@dthakker',
                    linkedin: '/in/dharmeshthakker'
                },
                focus: ['Infrastructure', 'Cloud'],
                verified: true
            },
            {
                name: 'Chelsea Stoner',
                handles: {
                    x: '@chelseastoner',
                    linkedin: '/in/chelsea-stoner-4544914'
                },
                focus: ['Healthcare', 'Software'],
                verified: true
            }
        ]
    },

    // Emergence Capital
    'emergence': {
        name: 'Emergence Capital',
        handles: {
            x: '@emergencecap',
            linkedin: 'company/emergence-capital-partners',
            substack: 'emergence.substack.com'
        },
        aum: '4B+',
        tier: 1,
        focus: ['Enterprise', 'Cloud', 'SaaS'],
        partners: [
            {
                name: 'Jason Green',
                handles: {
                    x: '@jasonegreen',
                    linkedin: '/in/jasongreen'
                },
                focus: ['Enterprise', 'SaaS'],
                verified: true
            },
            {
                name: 'Santi Subotovsky',
                handles: {
                    x: '@ssubo',
                    linkedin: '/in/santisubotovsky'
                },
                focus: ['Enterprise', 'Future of Work'],
                verified: true
            },
            {
                name: 'Jake Saper',
                handles: {
                    x: '@jacobsaper',
                    linkedin: '/in/jakesaper'
                },
                focus: ['Enterprise', 'AI'],
                verified: true
            }
        ]
    },

    // IVP (Institutional Venture Partners)
    'ivp': {
        name: 'IVP',
        handles: {
            x: '@ivp',
            linkedin: 'company/ivp',
            substack: 'ivp.substack.com'
        },
        aum: '8.7B+',
        tier: 1,
        focus: ['Growth', 'Enterprise', 'Consumer'],
        partners: [
            {
                name: 'Somesh Dash',
                handles: {
                    x: '@someshdash',
                    linkedin: '/in/someshdash'
                },
                focus: ['Enterprise', 'Fintech'],
                verified: true
            },
            {
                name: 'Jules Maltz',
                handles: {
                    x: '@julesmaltz',
                    linkedin: '/in/julesmaltz'
                },
                focus: ['Growth', 'SaaS'],
                verified: true
            },
            {
                name: 'Tom Loverro',
                handles: {
                    x: '@tomloverro',
                    linkedin: '/in/tomloverro'
                },
                focus: ['Enterprise', 'Crypto'],
                verified: true
            }
        ]
    },

    // Ribbit Capital
    'ribbit': {
        name: 'Ribbit Capital',
        handles: {
            x: '@ribbitcapital',
            linkedin: 'company/ribbit-capital'
        },
        aum: '6.7B+',
        tier: 1,
        focus: ['Fintech', 'Crypto', 'Financial Services'],
        partners: [
            {
                name: 'Micky Malka',
                handles: {
                    x: '@mickymalka',
                    linkedin: '/in/mickymalka'
                },
                focus: ['Fintech', 'Crypto'],
                verified: true
            },
            {
                name: 'Nick Shalek',
                handles: {
                    x: '@nickshalek',
                    linkedin: '/in/nickshalek'
                },
                focus: ['Fintech', 'Healthcare'],
                verified: true
            }
        ]
    },

    // Thrive Capital
    'thrive': {
        name: 'Thrive Capital',
        handles: {
            x: '@thrivecap',
            linkedin: 'company/thrive-capital'
        },
        aum: '15B+',
        tier: 1,
        focus: ['Consumer', 'Enterprise', 'Healthcare'],
        partners: [
            {
                name: 'Josh Kushner',
                handles: {
                    x: '@joshkushner',
                    linkedin: '/in/jkushner'
                },
                focus: ['Consumer', 'Healthcare'],
                verified: true
            },
            {
                name: 'Kareem Zaki',
                handles: {
                    x: '@kareemzaki',
                    linkedin: '/in/kareem-zaki-4a0a333'
                },
                focus: ['Enterprise', 'Fintech'],
                verified: true
            }
        ]
    },

    // Redpoint Ventures
    'redpoint': {
        name: 'Redpoint Ventures',
        handles: {
            x: '@redpointvc',
            linkedin: 'company/redpoint-ventures',
            substack: 'redpoint.substack.com'
        },
        aum: '7B+',
        tier: 1,
        focus: ['Enterprise', 'Consumer', 'Infrastructure'],
        partners: [
            {
                name: 'Tomasz Tunguz',
                handles: {
                    x: '@ttunguz',
                    linkedin: '/in/ttunguz',
                    substack: 'tomtunguz.com'
                },
                focus: ['SaaS', 'Data'],
                verified: true
            },
            {
                name: 'Annie Kadavy',
                handles: {
                    x: '@anniekadavy',
                    linkedin: '/in/anniekadavy'
                },
                focus: ['Consumer', 'Marketplaces'],
                verified: true
            },
            {
                name: 'Alex Bard',
                handles: {
                    x: '@alexbard',
                    linkedin: '/in/alexbard'
                },
                focus: ['Enterprise', 'AI'],
                verified: true
            }
        ]
    },

    // Lux Capital
    'lux': {
        name: 'Lux Capital',
        handles: {
            x: '@luxcapital',
            linkedin: 'company/lux-capital',
            substack: 'lux.substack.com'
        },
        aum: '4B+',
        tier: 1,
        focus: ['Deep Tech', 'Science', 'Healthcare'],
        partners: [
            {
                name: 'Josh Wolfe',
                handles: {
                    x: '@wolfejosh',
                    linkedin: '/in/joshwolfe',
                    substack: 'wolfejosh.substack.com'
                },
                focus: ['Deep Tech', 'Science'],
                verified: true
            },
            {
                name: 'Bilal Zuberi',
                handles: {
                    x: '@bznotes',
                    linkedin: '/in/bilalzuberi'
                },
                focus: ['Robotics', 'Space'],
                verified: true
            },
            {
                name: 'Deena Shakir',
                handles: {
                    x: '@deenashakir',
                    linkedin: '/in/deenashakir'
                },
                focus: ['Healthcare', 'Bio'],
                verified: true
            }
        ]
    },

    // Felicis Ventures
    'felicis': {
        name: 'Felicis Ventures',
        handles: {
            x: '@felicis',
            linkedin: 'company/felicis-ventures'
        },
        aum: '2.1B+',
        tier: 1,
        focus: ['Health', 'Security', 'Fintech'],
        partners: [
            {
                name: 'Aydin Senkut',
                handles: {
                    x: '@aydinsenkut',
                    linkedin: '/in/aydinsenkut'
                },
                focus: ['Global', 'Consumer'],
                verified: true
            },
            {
                name: 'Victoria Treyger',
                handles: {
                    x: '@vtreyger',
                    linkedin: '/in/victoriatreyger'
                },
                focus: ['Fintech', 'Enterprise'],
                verified: true
            },
            {
                name: 'Sundeep Peechu',
                handles: {
                    x: '@speechu',
                    linkedin: '/in/sundeeppeechu'
                },
                focus: ['Enterprise', 'Developer Tools'],
                verified: true
            }
        ]
    },

    // Scale Venture Partners
    'scale': {
        name: 'Scale Venture Partners',
        handles: {
            x: '@scalevp',
            linkedin: 'company/scale-venture-partners',
            substack: 'scale.substack.com'
        },
        aum: '3B+',
        tier: 2,
        focus: ['Enterprise', 'SaaS', 'Security'],
        partners: [
            {
                name: 'Ariel Tseitlin',
                handles: {
                    x: '@atseitlin',
                    linkedin: '/in/atseitlin'
                },
                focus: ['Cloud', 'DevOps'],
                verified: true
            },
            {
                name: 'Alex Niehenke',
                handles: {
                    x: '@alex_niehenke',
                    linkedin: '/in/alexniehenke'
                },
                focus: ['Enterprise', 'SaaS'],
                verified: true
            },
            {
                name: 'Stacey Bishop',
                handles: {
                    x: '@staceybishopvc',
                    linkedin: '/in/staceybishop'
                },
                focus: ['Enterprise', 'Cloud'],
                verified: true
            }
        ]
    },

    // Social Capital
    'socialcapital': {
        name: 'Social Capital',
        handles: {
            x: '@socialcapital',
            linkedin: 'company/social-capital'
        },
        aum: '2B+',
        tier: 2,
        focus: ['Healthcare', 'Education', 'Financial Services'],
        partners: [
            {
                name: 'Chamath Palihapitiya',
                handles: {
                    x: '@chamath',
                    linkedin: '/in/chamath'
                },
                focus: ['Technology', 'Climate'],
                verified: true
            },
            {
                name: 'Jay Zaveri',
                handles: {
                    x: '@jayzaveri',
                    linkedin: '/in/jayzaveri'
                },
                focus: ['AI', 'Healthcare'],
                verified: true
            }
        ]
    }
};

// Utility functions for handling VC data
export const getVCsByTier = (tier) => {
    return Object.entries(VC_FIRMS)
        .filter(([_, firm]) => firm.tier === tier)
        .map(([key, firm]) => ({ key, ...firm }));
};

export const getVCsByFocus = (focus) => {
    return Object.entries(VC_FIRMS)
        .filter(([_, firm]) => firm.focus.includes(focus))
        .map(([key, firm]) => ({ key, ...firm }));
};

export const getVerifiedPartners = () => {
    const verifiedPartners = [];
    Object.entries(VC_FIRMS).forEach(([firmKey, firm]) => {
        firm.partners
            .filter(partner => partner.verified)
            .forEach(partner => {
                verifiedPartners.push({
                    ...partner,
                    firm: firmKey
                });
            });
    });
    return verifiedPartners;
};

export const getSocialHandles = (platform) => {
    const handles = {};
    Object.entries(VC_FIRMS).forEach(([firmKey, firm]) => {
        if (firm.handles[platform]) {
            handles[firmKey] = firm.handles[platform];
        }
        firm.partners.forEach(partner => {
            if (partner.handles[platform]) {
                handles[`${firmKey}_${partner.name.replace(' ', '_')}`] = partner.handles[platform];
            }
        });
    });
    return handles;
};

export function getCombinedHandles() {
    const handles = new Set();
    Object.values(VC_FIRMS).forEach(firm => {
        if (firm.handles.x) handles.add(firm.handles.x.replace('@', ''));
        if (firm.handles.linkedin) handles.add(firm.handles.linkedin.replace('/in/', ''));
        firm.partners.forEach(partner => {
            if (partner.handles.x) handles.add(partner.handles.x.replace('@', ''));
            if (partner.handles.linkedin) handles.add(partner.handles.linkedin.replace('/in/', ''));
        });
    });
    return Array.from(handles);
}

export function getFoundersByFocus(focus) {
    const founders = [];
    Object.values(VC_FIRMS).forEach(firm => {
        firm.partners.forEach(partner => {
            if (partner.focus.some(f => f.toLowerCase() === focus.toLowerCase())) {
                founders.push(partner);
            }
        });
    });
    return founders;
}

export default VC_FIRMS;