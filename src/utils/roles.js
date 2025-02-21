export const ROLES = {
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

export const ROLE_TYPES = Object.keys(ROLES);

export default {
    ROLES,
    ROLE_TYPES,
    detectRole
}; 