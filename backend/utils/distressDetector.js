/**
 * simpleDistressDetector.js
 * Analyzes SOS descriptions for keywords and urgency levels.
 */

const DISTRESS_KEYWORDS = [
  'help', 'save', 'trapped', 'dying', 'emergency', 'stuck', 'starving', 'bleeding', 
  'collapsed', 'injured', 'unconscious', 'pain', 'fire', 'flood', 'water', 'food'
];

const analyzeDistress = (text) => {
  if (!text) return { score: 0, priority: 'low' };

  const words = text.toLowerCase().split(/\W+/);
  const matchedKeywords = words.filter(word => DISTRESS_KEYWORDS.includes(word));
  
  const score = matchedKeywords.length;
  
  let priority = 'low';
  if (score > 4) priority = 'critical';
  else if (score > 2) priority = 'high';
  else if (score > 0) priority = 'medium';

  return {
    score,
    priority,
    isDistress: score > 0
  };
};

module.exports = analyzeDistress;
