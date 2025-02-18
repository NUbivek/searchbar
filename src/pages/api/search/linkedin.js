// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-18 00:35:50
// Current User's Login: NUbivek

import { 
  formatPromptForModel, 
  getModelStopTokens, 
  getModelById,
  getApiModel,
  DEFAULT_MODEL 
} from '@/utils/modelHelpers';

import { generatePlatformQuery, enrichResultsWithVC } from '@/config/platformConfig';
import { VC_FIRMS } from '@/config/vcAccounts';
import { enrichContentWithRoles } from '@/utils/roleDetection';
import { 
  BOUTIQUE_AND_SPECIALIST_FIRMS, 
  MARKET_DATA_SOURCES,
  COMBINED_DATA_SOURCES 
} from '@/config/marketDataSources';
import { 
  getAllKeyPersonnel, 
  getHandlesByTopic,
  marketDataIntegration 
} from '@/config/marketDataIntegration';

// Combine all LinkedIn handles from both VC firms and market data sources
const ALL_LINKEDIN_HANDLES = {
  ...Object.entries(VC_FIRMS).reduce((acc, [key, firm]) => ({
    ...acc,
    [key]: firm.handles?.linkedin || null
  }), {}),
  ...Object.entries(COMBINED_DATA_SOURCES).reduce((acc, [key, firm]) => ({
    ...acc,
    [key]: firm.handles?.linkedin || null
  }), {})
};

// Filter out null handles
const VALID_LINKEDIN_HANDLES = Object.fromEntries(
  Object.entries(ALL_LINKEDIN_HANDLES).filter(([_, handle]) => handle !== null)
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
  if (!TOGETHER_API_KEY) {
    return res.status(401).json({ message: 'Together API key is missing' });
  }

  try {
    const { query, model = DEFAULT_MODEL } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const selectedModel = getModelById(model);
    if (!selectedModel) {
      console.warn(`Invalid model selection: ${model}, falling back to default`);
      return res.status(400).json({ message: 'Invalid model selection' });
    }

    const baseKeywords = encodeURIComponent(query);
    const searchUrls = {
      feed: `https://www.linkedin.com/feed/search/?keywords=${baseKeywords}`,
      posts: `https://www.linkedin.com/search/results/content/?keywords=${baseKeywords}`,
      articles: `https://www.linkedin.com/search/results/content/?keywords=${baseKeywords}&filters=article`,
      comments: `https://www.linkedin.com/search/results/content/?keywords=${baseKeywords}&filters=comment`,
      groups: `https://www.linkedin.com/search/results/groups/?keywords=${baseKeywords}`,
      companies: `https://www.linkedin.com/search/results/companies/?keywords=${baseKeywords}`,
      people: `https://www.linkedin.com/search/results/people/?keywords=${baseKeywords}`,
      events: `https://www.linkedin.com/search/results/events/?keywords=${baseKeywords}`,
      schools: `https://www.linkedin.com/search/results/schools/?keywords=${baseKeywords}`,
      learning: `https://www.linkedin.com/learning/search?keywords=${baseKeywords}`,
      jobs: `https://www.linkedin.com/jobs/search/?keywords=${baseKeywords}`,
      hashtag: (tag) => `https://www.linkedin.com/feed/hashtag/${tag.replace(/[^a-zA-Z0-9]/g, '')}`
    };

    // Get platform-specific query enhancement
    const platformQuery = generatePlatformQuery('linkedin', query);

    // Get relevant firms and personnel
    const relevantFirms = Object.entries(VALID_LINKEDIN_HANDLES)
      .filter(([key]) => {
        const firm = VC_FIRMS[key] || COMBINED_DATA_SOURCES[key];
        return firm && (
          query.toLowerCase().includes(firm.name.toLowerCase()) ||
          firm.specialty_areas?.some(area => 
            query.toLowerCase().includes(area.toLowerCase())
          )
        );
      })
      .map(([key, handle]) => {
        const firm = VC_FIRMS[key] || COMBINED_DATA_SOURCES[key];
        return `${firm.name} (${handle})`;
      })
      .join(', ');

    // Get key personnel from both VCs and market data firms
    const personnelData = getAllKeyPersonnel();
    const allPersonnel = [
      ...(personnelData.vc_personnel || []),
      ...(personnelData.banking_personnel || []),
      ...(personnelData.consulting_personnel || []),
      ...(personnelData.research_personnel || []),
      ...(personnelData.market_personnel || [])
    ];

    const keyPersonnel = allPersonnel
      .filter(person => person && person.handles?.linkedin)
      .map(person => `${person.name} (${person.title} at ${person.firm})`)
      .join(', ');

    const linkedinSearchPrompt = `
Analyze recent LinkedIn content for: "${query}"
Focus on insights from:
1. VCs and Investment Professionals
2. Market Research Firms and Analysts
3. Investment Banks and Financial Advisors
4. Founders and Executive Leadership
5. Industry Experts and Consultants

Structure your response in clear sections:

### Investment & Market Insights
Focus on perspectives from leading firms about:
- Market opportunities and investment trends
- Industry analysis and strategic insights
- Key research findings and forecasts
- Expert commentary and analysis
Particularly focus on insights from: ${relevantFirms}

### Financial & Investment Updates
Format updates as:
[Firm/Expert] announced [update] on [date]
Include: 
- Investment announcements and market analysis
- Research findings and forecasts
- Industry outlooks and trends
- Strategic insights and recommendations
Key experts to track: ${keyPersonnel}

### Expert Perspectives & Analysis
Format quotes as:
> "Quote text"
> — [Expert Name], [Firm/Position]
Prioritize insights from verified experts and investors

### Upcoming Events & Conferences
Format each event as:
### [Event Name]
*[Date, Location]*
[Description focusing on investment/market relevance]

### Research & Investment Resources
Format as:
• [Resource Title] by [Firm/Expert]: [Key Findings]

### Strategic Opportunities
List current focus areas:
• [Opportunity] identified by [Firm]: [Analysis/Impact]

Additional Focus:
- Prioritize updates from verified experts and investors
- Highlight strategic insights and market analysis
- Focus on data-driven investment opportunities
- Include specific market trends and predictions
- Emphasize quantitative analysis and research findings`;

    const requestBody = {
      model: getApiModel(model),
      prompt: formatPromptForModel(linkedinSearchPrompt, selectedModel),
      max_tokens: 1500,
      temperature: 0.7,
      top_p: 0.9,
      stop: getModelStopTokens(model)
    };

    const response = await fetch('https://api.together.xyz/v1/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}: ${JSON.stringify(data)}`);
    }

    const rawAnswer = data.choices?.[0]?.text || '';
    const processedAnswer = processLinkedInResponse(rawAnswer, searchUrls);

    const resultObject = {
      text: processedAnswer,
      query: query,
      platform: 'linkedin',
      originalContent: processedAnswer
    };

    const enrichedResults = enrichResultsWithVC(resultObject)[0];
    const enrichedAnswer = enrichContentWithRoles(enrichedResults);
    const prioritizedContent = prioritizeSections(enrichedAnswer.text);

    const finalAnswer = {
      content: prioritizedContent,
      role: enrichedAnswer.role,
      vcMentions: enrichedAnswer.vcMentions,
      founderMentions: enrichedAnswer.founderMentions
    };

    return res.status(200).json({
      answer: finalAnswer,
      searchUrls: searchUrls,
      markdown: true,
      vcFocus: platformQuery.filters,
      rolePrioritization: true,
      detectedRole: enrichedAnswer.role
    });

  } catch (error) {
    console.error('LinkedIn search processing error:', error);
    return res.status(500).json({
      message: 'Failed to process LinkedIn search',
      details: error.message
    });
  }
}

function prioritizeSections(content) {
  if (typeof content !== 'string') return content;
  
  const sections = content.split(/(?=### )/);
  
  return sections.map(section => {
    const [header, ...contentParts] = section.split('\n');
    const sectionContent = contentParts.join('\n');
    
    const enriched = enrichContentWithRoles({
      text: sectionContent,
      platform: 'linkedin'
    });
    
    // Prioritize sections with investment or market analysis content
    const isPriority = (
      header.includes('Investment') || 
      header.includes('Market') ||
      header.includes('Analysis') ||
      enriched.role === 'INVESTOR' ||
      enriched.role === 'EXPERT'
    );
    
    return isPriority ? `⭐️ ${header}\n${enriched.text}` : section;
  }).join('\n\n');
}

function processLinkedInResponse(text, searchUrls) {
  if (!text) return '';

  function cleanText(text) {
    return text
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/_{2,}/g, '')
      .trim();
  }

  function createLink(text, url, type = '') {
    const cleanedText = cleanText(text);
    
    // Check if text matches any known LinkedIn handle
    const matchedHandle = Object.entries(VALID_LINKEDIN_HANDLES).find(([key, handle]) => {
      const firm = VC_FIRMS[key] || COMBINED_DATA_SOURCES[key];
      return firm && cleanedText.includes(firm.name);
    });
    
    if (matchedHandle) {
      const [_, handle] = matchedHandle;
      return `[${cleanedText}](https://linkedin.com${handle})`;
    }
    
    if (type === 'event') {
      const [title, details] = cleanedText.split(':').map(s => s.trim());
      if (details) {
        return `**${createLink(title, url)}**\n${details}`;
      }
    }
    
    return `[${cleanedText}](${url})`;
  }

  function processSection(content) {
    if (!content.trim()) return '';

    let processed = content;

    // Process events with dates
    processed = processed.replace(
      /### ([^#\n]+)\n\*([^*]+)\*\n\n([^\n]+)/g,
      (match, title, date, description) => {
        const eventLink = createLink(title, searchUrls.events);
        return `### ${eventLink}\n*${date}*\n\n${description}`;
      }
    );

    // Process companies
    processed = processed.replace(
      /([A-Z][a-zA-Z0-9\s,.]+ (?:Inc\.|Corp\.?|Ltd\.?|Company|Technologies|Group|Solutions|Systems))/g,
      match => createLink(match, searchUrls.companies)
    );

    // Process professional titles and names
    processed = processed.replace(
      /([A-Z][a-zA-Z\s]+ (?:CEO|CTO|CFO|Founder|Director|Manager|Lead|Professional|Analyst|Researcher))/g,
      match => createLink(match, searchUrls.people)
    );

    // Process hashtags
    processed = processed.replace(
      /#[\w\d]+/g,
      match => {
        const tag = match.replace('#', '');
        return createLink(match, searchUrls.hashtag(tag));
      }
    );

    // Process quotes with attribution
    processed = processed.replace(
      /> \"([^\"]+)\"\n> — ([^,]+), ([^\n]+)/g,
      (match, quote, name, title) => {
        const nameLink = createLink(name, searchUrls.people);
        return `> "${quote}"\n> — ${nameLink}, ${title}`;
      }
    );

    // Process job opportunities
    processed = processed.replace(
      /• ([^:]+) at ([^:]+): /g,
      (match, role, company) => {
        const roleLink = createLink(role, searchUrls.jobs);
        const companyLink = createLink(company, searchUrls.companies);
        return `• ${roleLink} at ${companyLink}: `;
      }
    );

    // Process learning resources
    processed = processed.replace(
      /• ([^:]+) by ([^:]+): /g,
      (match, course, provider) => {
        const courseLink = createLink(course, searchUrls.learning);
        const providerLink = createLink(provider, searchUrls.companies);
        return `• ${courseLink} by ${providerLink}: `;
      }
    );

    return processed;
  }

  const sections = text.split(/(?=### )/);
  const processedSections = sections.map(section => {
    const [header, ...content] = section.split('\n');
    if (header.startsWith('#')) {
      return `${header}\n${processSection(content.join('\n'))}`;
    }
    return processSection(section);
  });

  let result = processedSections
    .filter(section => section.trim())
    .join('\n\n');

  result += '\n\n---\n\n### 🔍 Explore More on LinkedIn\n\n';
  const footerCategories = [
    ['📱 Latest Discussions', searchUrls.feed],
    ['🔥 Trending Posts', searchUrls.posts],
    ['📚 Featured Articles', searchUrls.articles],
    ['👥 Active Groups', searchUrls.groups],
    ['📅 Upcoming Events', searchUrls.events],
    ['🎓 Learning Resources', searchUrls.learning],
    ['💼 Job Opportunities', searchUrls.jobs]
  ];

  result += footerCategories
    .map(([text, url]) => `• ${createLink(text, url)}`)
    .join('\n');

  return result;
}