/**
 * Network Data Utilities
 * Functions for processing and formatting network data for visualization
 */

/**
 * Generates mock LinkedIn network data for visualization
 * @param {number} connections Number of first degree connections
 * @returns {Object} Graph data with nodes and links
 */
export const generateLinkedInNetworkData = (connections = 50) => {
  const nodes = [];
  const links = [];
  const companies = ['Google', 'Microsoft', 'Amazon', 'Facebook', 'Apple', 'Netflix', 'Tesla', 'Twitter', 'LinkedIn', 'IBM'];
  const positions = ['Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'Marketing Manager', 'CEO', 'CTO', 'VP Engineering', 'Frontend Developer', 'Backend Developer'];
  const locations = ['San Francisco', 'New York', 'Seattle', 'London', 'Toronto', 'Berlin', 'Tokyo', 'Singapore', 'Sydney', 'Paris'];
  
  // Add user node
  nodes.push({
    id: 'user',
    name: 'You',
    degree: 0,
    company: 'Your Company',
    position: 'Your Position',
    location: 'Your Location',
    connections: connections,
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
    val: 20, // Node size
    color: '#2563eb', // Blue
  });
  
  // Generate first degree connections
  for (let i = 0; i < connections; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const position = positions[Math.floor(Math.random() * positions.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    const node = {
      id: `connection_1_${i}`,
      name: `Connection ${i + 1}`,
      degree: 1,
      company,
      position,
      location,
      connections: Math.floor(Math.random() * 200) + 50,
      image: `https://randomuser.me/api/portraits/men/${(i % 70) + 1}.jpg`,
      val: 10, // Node size
      color: '#2563eb', // Blue for 1st connections
    };
    
    nodes.push(node);
    
    // Link to user
    links.push({
      source: 'user',
      target: node.id,
      value: 1
    });
    
    // Add some second degree connections
    if (i < 10) {
      const numSecondDegree = Math.floor(Math.random() * 5) + 1;
      
      for (let j = 0; j < numSecondDegree; j++) {
        const secondDegreeCompany = companies[Math.floor(Math.random() * companies.length)];
        const secondDegreePosition = positions[Math.floor(Math.random() * positions.length)];
        const secondDegreeLocation = locations[Math.floor(Math.random() * locations.length)];
        
        const secondDegreeId = `connection_2_${i}_${j}`;
        const secondDegreeNode = {
          id: secondDegreeId,
          name: `${node.name}'s Connection ${j + 1}`,
          degree: 2,
          company: secondDegreeCompany,
          position: secondDegreePosition,
          location: secondDegreeLocation,
          connections: Math.floor(Math.random() * 150) + 20,
          image: `https://randomuser.me/api/portraits/women/${(i * 10 + j) % 70 + 1}.jpg`,
          val: 6, // Node size
          color: '#9333ea', // Purple for 2nd connections
        };
        
        nodes.push(secondDegreeNode);
        
        // Link to first degree connection
        links.push({
          source: node.id,
          target: secondDegreeId,
          value: 1
        });
        
        // Add some third degree connections
        if (j < 2) {
          const numThirdDegree = Math.floor(Math.random() * 3) + 1;
          
          for (let k = 0; k < numThirdDegree; k++) {
            const thirdDegreeCompany = companies[Math.floor(Math.random() * companies.length)];
            const thirdDegreePosition = positions[Math.floor(Math.random() * positions.length)];
            const thirdDegreeLocation = locations[Math.floor(Math.random() * locations.length)];
            
            const thirdDegreeId = `connection_3_${i}_${j}_${k}`;
            const thirdDegreeNode = {
              id: thirdDegreeId,
              name: `${secondDegreeNode.name}'s Connection ${k + 1}`,
              degree: 3,
              company: thirdDegreeCompany,
              position: thirdDegreePosition,
              location: thirdDegreeLocation,
              connections: Math.floor(Math.random() * 100) + 10,
              image: `https://randomuser.me/api/portraits/men/${(i * 100 + j * 10 + k) % 70 + 1}.jpg`,
              val: 3, // Node size
              color: '#ec4899', // Pink for 3rd connections
            };
            
            nodes.push(thirdDegreeNode);
            
            // Link to second degree connection
            links.push({
              source: secondDegreeId,
              target: thirdDegreeId,
              value: 1
            });
          }
        }
      }
    }
  }
  
  // Add company nodes
  const uniqueCompanies = [...new Set(nodes.map(node => node.company))];
  uniqueCompanies.forEach(company => {
    if (company !== 'Your Company') {
      const companyNode = {
        id: `company_${company}`,
        name: company,
        type: 'company',
        employees: nodes.filter(n => n.company === company).length,
        val: 15, // Node size
        color: '#10b981', // Green for companies
      };
      
      nodes.push(companyNode);
      
      // Link company to employees
      nodes.forEach(node => {
        if (node.company === company && node.type !== 'company') {
          links.push({
            source: node.id,
            target: companyNode.id,
            value: 1,
            dashed: true
          });
        }
      });
    }
  });
  
  return { nodes, links };
};

/**
 * Generates mock Twitter network data for visualization
 * @param {number} followers Number of followers
 * @returns {Object} Graph data with nodes and links
 */
export const generateTwitterNetworkData = (followers = 120) => {
  const nodes = [];
  const links = [];
  const interests = ['Tech', 'Politics', 'Sports', 'Music', 'Art', 'Science', 'Gaming', 'Fashion', 'Food', 'Travel'];
  
  // Add user node
  nodes.push({
    id: 'user',
    name: 'You',
    handle: '@yourhandle',
    followers: followers,
    following: Math.floor(followers * 0.7),
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
    val: 20, // Node size
    color: '#1da1f2', // Twitter blue
  });
  
  // Generate followers
  for (let i = 0; i < followers; i++) {
    const userInterests = [];
    const numInterests = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < numInterests; j++) {
      userInterests.push(interests[Math.floor(Math.random() * interests.length)]);
    }
    
    const node = {
      id: `follower_${i}`,
      name: `Follower ${i + 1}`,
      handle: `@follower${i + 1}`,
      followers: Math.floor(Math.random() * 5000) + 100,
      following: Math.floor(Math.random() * 1000) + 50,
      interests: [...new Set(userInterests)],
      image: `https://randomuser.me/api/portraits/men/${(i % 70) + 1}.jpg`,
      val: 5 + (Math.random() * 5), // Varied node size
      color: '#1da1f2', // Twitter blue
    };
    
    nodes.push(node);
    
    // Link to user (either following or followed by)
    const isFollowingUser = Math.random() > 0.5;
    
    links.push({
      source: isFollowingUser ? node.id : 'user',
      target: isFollowingUser ? 'user' : node.id,
      value: 1,
      direction: isFollowingUser ? 'incoming' : 'outgoing'
    });
    
    // Add some connections between followers
    if (i > 0 && Math.random() > 0.7) {
      const numConnections = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < numConnections; j++) {
        const targetIndex = Math.floor(Math.random() * i);
        
        if (targetIndex !== i) {
          links.push({
            source: node.id,
            target: `follower_${targetIndex}`,
            value: 1
          });
        }
      }
    }
  }
  
  // Add interest nodes
  interests.forEach(interest => {
    const interestedUsers = nodes.filter(n => n.interests && n.interests.includes(interest));
    
    if (interestedUsers.length > 0) {
      const interestNode = {
        id: `interest_${interest}`,
        name: interest,
        type: 'interest',
        followers: interestedUsers.length,
        val: 12, // Node size
        color: '#10b981', // Green for interests
      };
      
      nodes.push(interestNode);
      
      // Link interest to users
      interestedUsers.forEach(user => {
        links.push({
          source: user.id,
          target: interestNode.id,
          value: 1,
          dashed: true
        });
      });
    }
  });
  
  return { nodes, links };
};

/**
 * Generates mock Facebook network data for visualization
 * @param {number} friends Number of friends
 * @returns {Object} Graph data with nodes and links
 */
export const generateFacebookNetworkData = (friends = 85) => {
  const nodes = [];
  const links = [];
  const groups = ['Family', 'College', 'High School', 'Work', 'Neighbors', 'Sports Team', 'Book Club', 'Travel Group', 'Gaming Clan', 'Cooking Class'];
  
  // Add user node
  nodes.push({
    id: 'user',
    name: 'You',
    friends: friends,
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
    val: 20, // Node size
    color: '#1877f2', // Facebook blue
  });
  
  // Create friend groups
  const friendGroups = {};
  
  groups.forEach(group => {
    if (Math.random() > 0.3) { // 70% chance to have this group
      friendGroups[group] = Math.floor(Math.random() * (friends / 3)) + 3;
    }
  });
  
  // Ensure total doesn't exceed friends count
  let totalAssigned = Object.values(friendGroups).reduce((sum, val) => sum + val, 0);
  const unassigned = Math.max(0, friends - totalAssigned);
  
  // Generate friends
  let friendCount = 0;
  
  // First create grouped friends
  Object.entries(friendGroups).forEach(([group, count]) => {
    for (let i = 0; i < count; i++) {
      const mutualFriends = Math.floor(Math.random() * 20) + 5;
      
      const node = {
        id: `friend_${friendCount}`,
        name: `Friend ${friendCount + 1}`,
        group,
        mutualFriends,
        image: `https://randomuser.me/api/portraits/men/${(friendCount % 70) + 1}.jpg`,
        val: 8, // Node size
        color: getGroupColor(group),
      };
      
      nodes.push(node);
      
      // Link to user
      links.push({
        source: 'user',
        target: node.id,
        value: 1
      });
      
      // Create connections within the same group
      nodes.forEach(otherNode => {
        if (otherNode.id !== node.id && otherNode.id !== 'user' && otherNode.group === group && Math.random() > 0.5) {
          links.push({
            source: node.id,
            target: otherNode.id,
            value: 1
          });
        }
      });
      
      friendCount++;
    }
  });
  
  // Then create ungrouped friends
  for (let i = 0; i < unassigned; i++) {
    const mutualFriends = Math.floor(Math.random() * 5) + 1;
    
    const node = {
      id: `friend_${friendCount}`,
      name: `Friend ${friendCount + 1}`,
      group: 'Other',
      mutualFriends,
      image: `https://randomuser.me/api/portraits/women/${(i % 70) + 1}.jpg`,
      val: 8, // Node size
      color: '#6b7280', // Gray for ungrouped
    };
    
    nodes.push(node);
    
    // Link to user
    links.push({
      source: 'user',
      target: node.id,
      value: 1
    });
    
    friendCount++;
  }
  
  // Create group nodes
  Object.keys(friendGroups).forEach(group => {
    const groupMembers = nodes.filter(n => n.group === group);
    
    if (groupMembers.length > 0) {
      const groupNode = {
        id: `group_${group.replace(/\s+/g, '_')}`,
        name: group,
        type: 'group',
        members: groupMembers.length,
        val: 15, // Node size
        color: getGroupColor(group, 0.7),
      };
      
      nodes.push(groupNode);
      
      // Link group to members
      groupMembers.forEach(member => {
        links.push({
          source: member.id,
          target: groupNode.id,
          value: 1,
          dashed: true
        });
      });
    }
  });
  
  return { nodes, links };
};

/**
 * Gets color for Facebook friend group
 * @param {string} group Group name
 * @param {number} alpha Optional opacity
 * @returns {string} Color in hex or rgba
 */
function getGroupColor(group, alpha = 1) {
  const colors = {
    'Family': '#ef4444',
    'College': '#f59e0b',
    'High School': '#10b981',
    'Work': '#3b82f6',
    'Neighbors': '#8b5cf6',
    'Sports Team': '#ec4899',
    'Book Club': '#06b6d4',
    'Travel Group': '#14b8a6',
    'Gaming Clan': '#7c3aed',
    'Cooking Class': '#f97316',
    'Other': '#6b7280'
  };
  
  const color = colors[group] || '#6b7280';
  
  if (alpha < 1) {
    // Convert hex to rgba
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  return color;
}

/**
 * Filters network data based on search term and degree settings
 * @param {Object} data Full network data object
 * @param {string} searchTerm Term to search for
 * @param {Array} degrees Array of degrees to include (e.g. [1, 2])
 * @returns {Object} Filtered network data
 */
export const filterNetworkData = (data, searchTerm = '', degrees = [1, 2, 3]) => {
  if (!data || !data.nodes || !data.links) return { nodes: [], links: [] };
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  // If no search term and all degrees selected, return original data
  if (!searchTerm && degrees.includes(1) && degrees.includes(2) && degrees.includes(3)) {
    return data;
  }
  
  // Filter nodes based on search term and degrees
  const filteredNodes = data.nodes.filter(node => {
    const matchesSearch = !searchTerm || 
      (node.name && node.name.toLowerCase().includes(lowerSearchTerm)) ||
      (node.company && node.company.toLowerCase().includes(lowerSearchTerm)) ||
      (node.position && node.position.toLowerCase().includes(lowerSearchTerm)) ||
      (node.location && node.location.toLowerCase().includes(lowerSearchTerm)) ||
      (node.handle && node.handle.toLowerCase().includes(lowerSearchTerm)) ||
      (node.group && node.group.toLowerCase().includes(lowerSearchTerm));
    
    const matchesDegree = node.id === 'user' || 
      !node.degree || 
      degrees.includes(node.degree) || 
      node.type === 'company' || 
      node.type === 'group' || 
      node.type === 'interest';
    
    return matchesSearch && matchesDegree;
  });
  
  // Get IDs of filtered nodes
  const filteredNodeIds = filteredNodes.map(node => node.id);
  
  // Filter links based on filtered nodes
  const filteredLinks = data.links.filter(link => 
    filteredNodeIds.includes(link.source) || 
    filteredNodeIds.includes(link.target)
  );
  
  return { nodes: filteredNodes, links: filteredLinks };
};
