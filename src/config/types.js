   /**
    * @typedef {Object} SearchResult
    * @property {string} content - The search result content
    * @property {Array<string>} sources - List of sources used
    * @property {number} confidence - Confidence score of the result
    */

   /**
    * @typedef {Object} SourceScope
    * @property {string} id - Unique identifier for the scope
    * @property {string} label - Display label
    * @property {string} desc - Description of the scope
    */

   /**
    * @typedef {Object} Model
    * @property {string} id - Model identifier
    * @property {string} name - Display name
    * @property {string} description - Short description
    * @property {string} apiModel - API model identifier
    */

   /**
    * @typedef {Object} SearchFilters
    * @property {boolean} linkedin - LinkedIn filter state
    * @property {boolean} x - Twitter/X filter state
    * @property {boolean} crunchbase - Crunchbase filter state
    * @property {boolean} pitchbook - PitchBook filter state
    * @property {boolean} reddit - Reddit filter state
    * @property {boolean} ycombinator - Y Combinator filter state
    * @property {boolean} substack - Substack filter state
    * @property {boolean} medium - Medium filter state
    * @property {boolean} uploadedFiles - Uploaded files filter state
    */