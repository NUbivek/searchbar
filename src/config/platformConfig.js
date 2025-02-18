// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-18 00:13:20
// Current User's Login: NUbivek

import { getCombinedHandles, getVCsByFocus, getFoundersByFocus } from './vcAccounts';
import { VC_FIRMS, VC_CATEGORIES } from './vcAccounts';
import { FOUNDER_INVESTORS } from './vcFounders';

// Ensure FOUNDER_INVESTORS is an object, default to empty object if undefined
const founderInvestors = FOUNDER_INVESTORS || {};

export const PLATFORM_CONFIGS = {
  linkedin: {
    companies: Object.values(VC_FIRMS)
      .map(firm => firm.handles?.linkedin)
      .filter(handle => handle)
      .map(handle => handle.replace('/company/', '')),
    keywords: [
      'venture capital',
      'startup investing',
      'founder',
      'seed funding',
      'Series A',
      'venture partner',
      'angel investor'
    ],
    profiles: getCombinedHandles().map(handle => handle.replace('@', '')),
    groups: [
      'Venture Capital & Private Equity',
      'Startup Founders Network',
      'YC Founders & Alumni',
      'Angel Investors Group'
    ]
  },
  
  x: {
    handles: getCombinedHandles(),
    lists: [
      'VCs-to-follow',
      'top-founders',
      'emerging-managers',
      'angel-investors'
    ],
    hashtags: [
      'venturecapital',
      'startups',
      'founderlife',
      'seedfunding',
      'angelinvestor'
    ]
  },
  
  reddit: {
    subreddits: [
      'venturecapital',
      'startups',
      'investing',
      'entrepreneur',
      'YCombinator'
    ],
    keywords: [
      'venture capital',
      'VC funding',
      'startup founder',
      'angel investing',
      'pitch deck'
    ]
  },
  
  substack: {
    newsletters: [
      ...Object.values(VC_FIRMS).flatMap(firm => 
        firm.partners.map(p => ({
          handle: p.handles?.substack,
          focus: p.focus
        })).filter(p => p.handle)
      ),
      ...Object.values(founderInvestors).flatMap(group =>
        (group?.members || []).map(m => ({
          handle: m.handles?.substack,
          focus: m.focus
        })).filter(m => m.handle)
      )
    ]
  }
};

export function generatePlatformQuery(platform, baseQuery) {
  const config = PLATFORM_CONFIGS[platform];
  
  switch (platform) {
    case 'linkedin':
      return {
        query: baseQuery,
        filters: {
          companies: config.companies,
          keywords: config.keywords,
          groups: config.groups
        }
      };
      
    case 'x':
      return {
        query: baseQuery,
        handles: config.handles,
        lists: config.lists,
        hashtags: config.hashtags.map(tag => `#${tag}`)
      };
      
    case 'reddit':
      return {
        query: baseQuery,
        subreddits: config.subreddits,
        keywords: config.keywords
      };
      
    case 'substack':
      return {
        query: baseQuery,
        newsletters: config.newsletters
      };
      
    default:
      return { query: baseQuery };
  }
}

export function getFocusedResults(results, focusArea) {
  const relevantVCs = getVCsByFocus(focusArea);
  const relevantFounders = getFoundersByFocus(focusArea);
  const relevantHandles = [...relevantVCs, ...relevantFounders].map(p => 
    p.handles?.x || p.handles?.linkedin
  ).filter(handle => handle);
  
  return results.filter(result => 
    relevantHandles.some(handle => 
      result.text?.toLowerCase().includes(handle.toLowerCase()) ||
      result.author?.toLowerCase().includes(handle.toLowerCase())
    )
  );
}

export function enrichResultsWithVC(result) {
    // If result isn't an array, wrap it in an array
    const results = Array.isArray(result) ? result : [result];
    
    return results.map(result => {
      const mentionedVCs = Object.values(VC_FIRMS).filter(firm =>
        (firm.handles?.x && result.text?.toLowerCase().includes(firm.handles.x.toLowerCase())) ||
        firm.partners.some(p => 
          p.handles?.x && result.text?.toLowerCase().includes(p.handles.x.toLowerCase())
        )
      );
      
      const mentionedFounders = Object.values(founderInvestors).flatMap(group =>
        (group?.members || []).filter(m =>
          m.handles?.x && result.text?.toLowerCase().includes(m.handles.x.toLowerCase())
        )
      );
      
      return {
        ...result,
        vcMentions: mentionedVCs,
        founderMentions: mentionedFounders
      };
    });
  }

export default PLATFORM_CONFIGS;