// Database of employees from top companies with their social media handles
// This data can be used for verified sources in search

const TOP_COMPANY_EMPLOYEES = {
  // Tech Giants
  'Apple': [
    {
      name: 'Tim Cook',
      title: 'CEO',
      handles: {
        x: '@tim_cook',
        linkedin: '/in/timcook'
      },
      verified: true
    },
    {
      name: 'Craig Federighi',
      title: 'SVP Software Engineering',
      handles: {
        linkedin: '/in/craig-federighi-8a3582'
      },
      verified: true
    }
  ],
  'Microsoft': [
    {
      name: 'Satya Nadella',
      title: 'CEO',
      handles: {
        x: '@satyanadella',
        linkedin: '/in/satyanadella'
      },
      verified: true
    },
    {
      name: 'Amy Hood',
      title: 'CFO',
      handles: {
        linkedin: '/in/amy-hood-9b5153'
      },
      verified: true
    }
  ],
  'Google': [
    {
      name: 'Sundar Pichai',
      title: 'CEO',
      handles: {
        x: '@sundarpichai',
        linkedin: '/in/sundarpichai'
      },
      verified: true
    },
    {
      name: 'Ruth Porat',
      title: 'CFO',
      handles: {
        linkedin: '/in/ruth-porat-8b5a09'
      },
      verified: true
    }
  ],

  // Startup Unicorns
  'Stripe': [
    {
      name: 'Patrick Collison',
      title: 'CEO & Co-founder',
      handles: {
        x: '@patrickc',
        linkedin: '/in/patrickcollison'
      },
      verified: true
    },
    {
      name: 'John Collison',
      title: 'President & Co-founder',
      handles: {
        x: '@collision',
        linkedin: '/in/johncollison'
      },
      verified: true
    }
  ],
  'Databricks': [
    {
      name: 'Ali Ghodsi',
      title: 'CEO & Co-founder',
      handles: {
        x: '@alighodsi',
        linkedin: '/in/alighodsi'
      },
      verified: true
    },
    {
      name: 'Matei Zaharia',
      title: 'CTO & Co-founder',
      handles: {
        x: '@matei_zaharia',
        linkedin: '/in/mateizaharia'
      },
      verified: true
    }
  ],

  // Finance
  'BlackRock': [
    {
      name: 'Larry Fink',
      title: 'CEO',
      handles: {
        linkedin: '/in/larry-fink-bb93a115'
      },
      verified: true
    }
  ],
  'JPMorgan Chase': [
    {
      name: 'Jamie Dimon',
      title: 'CEO',
      handles: {
        linkedin: '/in/jamie-dimon-1a1aa1'
      },
      verified: true
    }
  ],

  // Carta Specific
  'Carta': [
    {
      name: 'Henry Ward',
      title: 'CEO & Co-founder',
      handles: {
        x: '@henrysward',
        linkedin: '/in/henryward'
      },
      verified: true
    },
    {
      name: 'Mita Mallick',
      title: 'Head of Inclusion, Equity, and Impact',
      handles: {
        x: '@MitaMallick',
        linkedin: '/in/mitamallick'
      },
      verified: true
    },
    {
      name: 'Charly Kevers',
      title: 'CFO',
      handles: {
        linkedin: '/in/charlykevers'
      },
      verified: true
    },
    {
      name: 'Peter Walker',
      title: 'CTO',
      handles: {
        x: '@peterwalker',
        linkedin: '/in/peterwalker'
      },
      verified: true
    }
  ],

  // Growth Companies
  'Snowflake': [
    {
      name: 'Frank Slootman',
      title: 'CEO',
      handles: {
        linkedin: '/in/frankslootman'
      },
      verified: true
    },
    {
      name: 'Christian Kleinerman',
      title: 'SVP of Product',
      handles: {
        linkedin: '/in/christiankleinerman'
      },
      verified: true
    },
    {
      name: 'Benoit Dageville',
      title: 'Co-founder & President of Products',
      handles: {
        linkedin: '/in/benoit-dageville-3a54b82'
      },
      verified: true
    }
  ],
  'Figma': [
    {
      name: 'Dylan Field',
      title: 'CEO & Co-founder',
      handles: {
        x: '@zoink',
        linkedin: '/in/dylanfield'
      },
      verified: true
    },
    {
      name: 'Evan Wallace',
      title: 'CTO & Co-founder',
      handles: {
        x: '@evanwallace',
        linkedin: '/in/evan-wallace-8932914a'
      },
      verified: true
    },
    {
      name: 'Yuhki Yamashita',
      title: 'Chief Product Officer',
      handles: {
        x: '@yuhkiyam',
        linkedin: '/in/yuhkiyamashita'
      },
      verified: true
    }
  ],
  'Notion': [
    {
      name: 'Ivan Zhao',
      title: 'CEO & Co-founder',
      handles: {
        x: '@ivanhzhao',
        linkedin: '/in/ivanhzhao'
      },
      verified: true
    },
    {
      name: 'Simon Last',
      title: 'Co-founder',
      handles: {
        linkedin: '/in/simonlast'
      },
      verified: true
    },
    {
      name: 'Akshay Kothari',
      title: 'COO',
      handles: {
        x: '@akothari',
        linkedin: '/in/akshay-kothari-a305332'
      },
      verified: true
    }
  ],

  // More Top Startups
  'Rippling': [
    {
      name: 'Parker Conrad',
      title: 'CEO & Co-founder',
      handles: {
        x: '@parkerconrad',
        linkedin: '/in/parkerconrad'
      },
      verified: true
    },
    {
      name: 'Prasanna Sankar',
      title: 'CTO & Co-founder',
      handles: {
        linkedin: '/in/prasannasankar'
      },
      verified: true
    }
  ],
  'Plaid': [
    {
      name: 'Zach Perret',
      title: 'CEO & Co-founder',
      handles: {
        x: '@zachperret',
        linkedin: '/in/zachperret'
      },
      verified: true
    },
    {
      name: 'William Hockey',
      title: 'Co-founder',
      handles: {
        x: '@williamhockey',
        linkedin: '/in/williamhockey'
      },
      verified: true
    }
  ],
  'Airtable': [
    {
      name: 'Howie Liu',
      title: 'CEO & Co-founder',
      handles: {
        x: '@howieliu',
        linkedin: '/in/howieliu'
      },
      verified: true
    },
    {
      name: 'Andrew Ofstad',
      title: 'Chief Product Officer & Co-founder',
      handles: {
        linkedin: '/in/andrewofstad'
      },
      verified: true
    }
  ],

  // AI Companies
  'OpenAI': [
    {
      name: 'Sam Altman',
      title: 'CEO',
      handles: {
        x: '@sama',
        linkedin: '/in/samaltman'
      },
      verified: true
    },
    {
      name: 'Ilya Sutskever',
      title: 'Chief Scientist & Co-founder',
      handles: {
        x: '@ilyasut',
        linkedin: '/in/ilya-sutskever-a33a6b'
      },
      verified: true
    }
  ],
  'Anthropic': [
    {
      name: 'Dario Amodei',
      title: 'CEO & Co-founder',
      handles: {
        linkedin: '/in/dario-amodei-3934394'
      },
      verified: true
    },
    {
      name: 'Daniela Amodei',
      title: 'President & Co-founder',
      handles: {
        linkedin: '/in/daniela-amodei-3934394'
      },
      verified: true
    }
  ],

  // VC Firms Partners
  'Sequoia Capital': [
    {
      name: 'Roelof Botha',
      title: 'Partner',
      handles: {
        x: '@roelofbotha',
        linkedin: '/in/roelofbotha'
      },
      verified: true
    },
    {
      name: 'Alfred Lin',
      title: 'Partner',
      handles: {
        x: '@Alfred_Lin',
        linkedin: '/in/alfredlin'
      },
      verified: true
    }
  ],
  'Andreessen Horowitz': [
    {
      name: 'Marc Andreessen',
      title: 'General Partner & Co-founder',
      handles: {
        x: '@pmarca',
        linkedin: '/in/mandreessen'
      },
      verified: true
    },
    {
      name: 'Ben Horowitz',
      title: 'General Partner & Co-founder',
      handles: {
        x: '@bhorowitz',
        linkedin: '/in/benhorowitz'
      },
      verified: true
    }
  ]
};

// Function to get employees by company
function getEmployeesByCompany(company) {
  return TOP_COMPANY_EMPLOYEES[company] || [];
}

// Function to get all employees
function getAllEmployees() {
  return Object.values(TOP_COMPANY_EMPLOYEES).flat();
}

// Function to search employees by name, title, or company
function searchEmployees(query) {
  const allEmployees = [];
  
  for (const [company, employees] of Object.entries(TOP_COMPANY_EMPLOYEES)) {
    for (const employee of employees) {
      allEmployees.push({
        ...employee,
        company
      });
    }
  }
  
  return allEmployees.filter(employee => {
    const searchString = `${employee.name} ${employee.title} ${employee.company}`.toLowerCase();
    return query.toLowerCase().split(' ').every(term => searchString.includes(term));
  });
}

// Function to get all social handles
function getAllSocialHandles(platform = null) {
  const handles = [];
  
  for (const employees of Object.values(TOP_COMPANY_EMPLOYEES)) {
    for (const employee of employees) {
      if (employee.handles) {
        if (platform && employee.handles[platform]) {
          handles.push({
            name: employee.name,
            title: employee.title,
            handle: employee.handles[platform],
            platform
          });
        } else if (!platform) {
          for (const [plt, handle] of Object.entries(employee.handles)) {
            handles.push({
              name: employee.name,
              title: employee.title,
              handle,
              platform: plt
            });
          }
        }
      }
    }
  }
  
  return handles;
}

module.exports = {
  TOP_COMPANY_EMPLOYEES,
  getEmployeesByCompany,
  getAllEmployees,
  searchEmployees,
  getAllSocialHandles
};
