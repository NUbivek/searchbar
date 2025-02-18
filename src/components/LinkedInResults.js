// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-18 01:15:27
// Current User's Login: NUbivek

import React, { useMemo } from 'react';
import VC_FIRMS, { 
  getVerifiedPartners, 
  getCombinedHandles, 
  getVCsByFocus,
  getFoundersByFocus 
} from '@/config/vcAccounts';

// Initialize VC data
const VERIFIED_VCS = getVerifiedPartners();
const VC_HANDLES = getCombinedHandles();

const CONTENT_CATEGORIES = {
  PRIMARY: {
    VC_INSIGHTS: {
      id: 'vc_insights',
      icon: '💎',
      title: 'Verified VC Insights',
      keywords: ['invested', 'investing', 'investment', 'fund', 'portfolio']
    },
    MARKET_INTEL: {
      id: 'market_intel',
      icon: '📊',
      title: 'Market Intelligence',
      keywords: ['market', 'trend', 'analysis', 'research', 'report']
    }
  },
  LINKEDIN: {
    POSTS: {
      id: 'linkedin_posts',
      icon: '📝',
      title: 'LinkedIn Highlights',
      keywords: ['posted', 'shared', 'commented', 'discussed']
    },
    COMPANIES: {
      id: 'companies',
      icon: '🏢',
      title: 'Company Updates',
      keywords: ['announced', 'launched', 'company', 'startup']
    }
  }
};

const LinkedInResults = ({ results, isSearching }) => {
  const processedContent = useMemo(() => {
    if (!results?.answer?.content) return null;

    const cleanContent = String(results.answer.content)
      .replace(/[⭐️*]/g, '')
      .replace(/#{1,3}\s*/g, '')
      .replace(/•+\s*/g, '')
      .trim();

    return {
      vcContent: extractVCContent(cleanContent),
      marketIntel: extractMarketIntel(cleanContent),
      linkedinContent: extractLinkedInContent(cleanContent)
    };
  }, [results]);

  if (isSearching) {
    return <LoadingState />;
  }

  if (!processedContent) return null;

  return (
    <div className="mt-8 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
        {/* Header */}
        <Header role={results.answer?.role} />

        {/* Main Content */}
        <div className="p-6 space-y-8">
          {/* VC Insights Section */}
          {processedContent.vcContent.length > 0 && (
            <VCInsightsSection insights={processedContent.vcContent} />
          )}

          {/* Market Intelligence Section */}
          {processedContent.marketIntel.length > 0 && (
            <MarketIntelSection data={processedContent.marketIntel} />
          )}

          {/* LinkedIn Content Section */}
          {processedContent.linkedinContent.length > 0 && (
            <LinkedInSection content={processedContent.linkedinContent} />
          )}
        </div>

        {/* Quick Links */}
        <QuickLinks searchUrls={results.searchUrls} />
      </div>
    </div>
  );
};

// Component Functions
const Header = ({ role }) => (
  <div className="bg-gradient-to-r from-[#0077B5] to-[#00A0DC] px-6 py-5">
    <div className="flex items-center justify-between">
      <h2 className="text-xl text-white font-semibold flex items-center gap-2">
        <span className="text-2xl">💡</span>
        Market Intelligence Report
      </h2>
      {role && (
        <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium">
          {role}
        </span>
      )}
    </div>
  </div>
);

const VCInsightsSection = ({ insights }) => (
  <div className="space-y-4">
    <SectionHeader 
      icon={CONTENT_CATEGORIES.PRIMARY.VC_INSIGHTS.icon}
      title={CONTENT_CATEGORIES.PRIMARY.VC_INSIGHTS.title}
    />
    <div className="grid gap-4">
      {insights.map((insight, index) => (
        <VCCard key={index} insight={insight} />
      ))}
    </div>
  </div>
);

const MarketIntelSection = ({ data }) => (
  <div className="space-y-4">
    <SectionHeader 
      icon={CONTENT_CATEGORIES.PRIMARY.MARKET_INTEL.icon}
      title={CONTENT_CATEGORIES.PRIMARY.MARKET_INTEL.title}
    />
    <div className="bg-slate-50 rounded-lg p-4">
      {data.map((item, index) => (
        <div key={index} className="prose prose-sm max-w-none text-slate-600 mb-3 last:mb-0">
          {item}
        </div>
      ))}
    </div>
  </div>
);

const LinkedInSection = ({ content }) => (
  <div className="space-y-4">
    <SectionHeader 
      icon={CONTENT_CATEGORIES.LINKEDIN.POSTS.icon}
      title={CONTENT_CATEGORIES.LINKEDIN.POSTS.title}
    />
    <div className="grid gap-4">
      {content.map((item, index) => (
        <ContentCard key={index} content={item} />
      ))}
    </div>
  </div>
);

const SectionHeader = ({ icon, title }) => (
  <div className="flex items-center gap-2 mb-4">
    <span className="text-xl">{icon}</span>
    <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
  </div>
);

const VCCard = ({ insight }) => (
  <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg p-4 border border-blue-100">
    <div className="flex flex-col gap-3">
      <div className="prose prose-sm max-w-none text-slate-600" 
           dangerouslySetInnerHTML={{ __html: insight.content }} />
      <div className="flex items-center gap-2 text-sm">
        <a
          href={insight.linkedIn}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1"
        >
          {insight.name}
          {insight.verified && (
            <span className="text-blue-500">✓</span>
          )}
        </a>
        <span className="text-slate-400">•</span>
        <span className="text-slate-600">{insight.title}</span>
        {insight.company && (
          <>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">{insight.company}</span>
          </>
        )}
      </div>
      {insight.focus?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {insight.focus.map((area, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium"
            >
              {area}
            </span>
          ))}
        </div>
      )}
    </div>
  </div>
);

const ContentCard = ({ content }) => (
  <div className="bg-white rounded-lg p-4 border border-slate-100 hover:border-blue-100 transition-colors duration-200">
    <div className="prose prose-sm max-w-none text-slate-600" 
         dangerouslySetInnerHTML={{ __html: content }} />
  </div>
);

const QuickLinks = ({ searchUrls }) => (
  <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-t border-slate-100">
    <div className="flex flex-wrap gap-2">
      {searchUrls && Object.entries(searchUrls)
        .filter(([key, url]) => typeof url === 'string' && !key.includes('hashtag'))
        .map(([key, url]) => (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm
                     bg-white text-blue-600 hover:bg-blue-50 border border-slate-200
                     transition-all duration-200 hover:scale-105"
          >
            {getIconForLink(key)}
            <span>{formatLinkLabel(key)}</span>
          </a>
        ))}
    </div>
  </div>
);

const LoadingState = () => (
  <div className="mt-8 flex flex-col items-center justify-center gap-3 p-8">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
    </div>
    <p className="text-slate-600 font-medium">Processing insights...</p>
  </div>
);

// Utility Functions
const extractVCContent = (content) => {
  const vcInsights = [];
  if (!content) return vcInsights;

  const contentLines = content.split('\n').filter(line => line.trim());

  contentLines.forEach(line => {
    VERIFIED_VCS.forEach(vc => {
      if (vc?.name && line.toLowerCase().includes(vc.name.toLowerCase())) {
        vcInsights.push({
          content: formatContent(line),
          name: vc.name,
          title: vc.title || '',
          company: vc.firm || '',
          linkedIn: vc.handles?.linkedin || '#',
          verified: true,
          focus: vc.focus || []
        });
      }
    });
  });

  return vcInsights;
};

const extractMarketIntel = (content) => {
  if (!content) return [];

  return content
    .split('\n')
    .filter(line => line.trim())
    .filter(line => {
      const containsVCHandle = VC_HANDLES.some(handle => 
        line.toLowerCase().includes(handle.toLowerCase())
      );
      
      return !containsVCHandle && 
        CONTENT_CATEGORIES.PRIMARY.MARKET_INTEL.keywords.some(keyword =>
          line.toLowerCase().includes(keyword)
        );
    })
    .map(line => formatContent(line));
};

const extractLinkedInContent = (content) => {
  if (!content) return [];
  
  return content
    .split('\n')
    .filter(line => line.trim())
    .filter(line => {
      const containsVCHandle = VC_HANDLES.some(handle => 
        line.toLowerCase().includes(handle.toLowerCase())
      );
      
      return !containsVCHandle && (
        line.includes('linkedin.com') || 
        CONTENT_CATEGORIES.LINKEDIN.POSTS.keywords.some(keyword =>
          line.toLowerCase().includes(keyword)
        )
      );
    })
    .map(line => formatContent(line));
};

const formatContent = (content) => {
  return content
    .replace(/\[(.*?)\]\((https:\/\/[^)]+)\)/g, (match, text, url) => 
      `<a href="${url}" target="_blank" rel="noopener noreferrer" 
          class="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-1.5 py-0.5 rounded transition-colors duration-200">
          ${text}
       </a>`
    );
};

const getIconForLink = (type) => {
  const icons = {
    companies: '🏢',
    people: '👥',
    posts: '📝',
    groups: '👥',
    feed: '📰',
    default: '🔍'
  };
  return icons[type] || icons.default;
};

const formatLinkLabel = (key) => {
  return key.charAt(0).toUpperCase() + 
         key.slice(1).replace(/([A-Z])/g, ' $1');
};

export default LinkedInResults;