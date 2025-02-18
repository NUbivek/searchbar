// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-18 00:24:40
// Current User's Login: NUbivek

const ROLES = {
    INVESTOR: ['investor', 'vc', 'venture capital', 'angel', 'partner', 'investment'],
    FOUNDER: ['founder', 'ceo', 'co-founder', 'cofounder', 'entrepreneur'],
    EXPERT: ['expert', 'advisor', 'consultant', 'specialist', 'professional'],
    RESEARCHER: ['researcher', 'scientist', 'analyst', 'research'],
    ENGINEER: ['engineer', 'developer', 'architect', 'cto', 'technical'],
    BUSINESS: ['business', 'sales', 'marketing', 'strategy', 'operations']
  };
  
  export function detectRole(text) {
    if (!text || typeof text !== 'string') return 'GENERAL';
    
    const lowercaseText = text.toLowerCase();
    
    for (const [role, keywords] of Object.entries(ROLES)) {
      if (keywords.some(keyword => lowercaseText.includes(keyword))) {
        return role;
      }
    }
    
    return 'GENERAL';
  }
  
  export function getRoleBasedPrompt(role, query) {
    const prompts = {
      INVESTOR: `From a venture capital perspective, analyze: ${query}`,
      FOUNDER: `From an entrepreneur's perspective, consider: ${query}`,
      EXPERT: `Providing expert analysis on: ${query}`,
      RESEARCHER: `From a research perspective, examine: ${query}`,
      ENGINEER: `From a technical standpoint, analyze: ${query}`,
      BUSINESS: `From a business strategy perspective, evaluate: ${query}`,
      GENERAL: query
    };
    
    return prompts[role] || query;
  }
  
  export function enrichContentWithRoles(content) {
    // Handle array input
    if (Array.isArray(content)) {
      return content.map(item => enrichContentWithRoles(item));
    }
    
    // Handle object input
    if (typeof content === 'object' && content !== null) {
      const role = content.text ? detectRole(content.text) : 'GENERAL';
      return {
        ...content,
        role,
        text: typeof content.text === 'string' 
          ? enrichTextWithRoles(content.text, content.vcMentions, content.founderMentions)
          : content.text
      };
    }
    
    // Handle string input
    if (typeof content === 'string') {
      return enrichTextWithRoles(content);
    }
    
    // Return as-is if none of the above
    return content;
  }
  
  function enrichTextWithRoles(text, vcMentions = [], founderMentions = []) {
    if (!text || typeof text !== 'string') return text;
    
    let enriched = text;
    
    // Enrich VC mentions
    if (vcMentions && vcMentions.length > 0) {
      vcMentions.forEach(vc => {
        if (vc.handles?.x) {
          const pattern = new RegExp(`@${vc.handles.x.replace('@', '')}`, 'gi');
          enriched = enriched.replace(pattern, `$& (Venture Capital)`);
        }
      });
    }
    
    // Enrich founder mentions
    if (founderMentions && founderMentions.length > 0) {
      founderMentions.forEach(founder => {
        if (founder.handles?.x) {
          const pattern = new RegExp(`@${founder.handles.x.replace('@', '')}`, 'gi');
          enriched = enriched.replace(pattern, `$& (Founder)`);
        }
      });
    }
    
    // Enrich other handles with detected roles
    enriched = enriched.replace(/(@[\w-]+)(?!\s*\([^)]+\))/g, (match) => {
      const handleText = match.substring(1);
      const role = detectRole(handleText);
      return role === 'GENERAL' ? match : `${match} (${role})`;
    });
    
    return enriched;
  }
  
  // Export constants and types
  export const ROLE_TYPES = Object.keys(ROLES);
  
  // Named export object instead of anonymous default export
  const roleDetection = {
    detectRole,
    getRoleBasedPrompt,
    enrichContentWithRoles,
    ROLES,
    ROLE_TYPES
  };
  
  export default roleDetection;