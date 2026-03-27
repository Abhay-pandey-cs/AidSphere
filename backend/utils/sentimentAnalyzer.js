/**
 * sentimentAnalyzer.js
 * Analyzes text for emotional intensity and authenticity markers.
 */

const INTENSE_EMOTIONS = [
  'scared', 'terrified', 'please', 'dying', 'stuck', 'starving', 'water', 'food',
  'immediate', 'urgent', 'trapped', 'emergency', 'help', 'bloody', 'injured'
];

const BOT_MARKERS = [
  'fllw', 'clck', 'bit.ly', 'crypto', 'nft', 'giveaway', 'dm me'
];

const analyzeSentiment = (text) => {
  if (!text) return { score: 0, intensity: 'low', authenticity: 0 };

  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\W+/);
  
  // Intensity Logic (Emotional weight)
  const intenseMatches = words.filter(word => INTENSE_EMOTIONS.includes(word));
  const intensityScore = intenseMatches.length;
  
  let intensity = 'low';
  if (intensityScore > 3) intensity = 'critical';
  else if (intensityScore > 1) intensity = 'high';

  // Authenticity Logic (Spam/Bot detection)
  const botMatches = BOT_MARKERS.filter(marker => lowerText.includes(marker));
  const authenticityScore = Math.max(0, 100 - (botMatches.length * 40));

  // Determine Priority
  let priority = 'low';
  if (intensityScore > 0 && authenticityScore > 50) priority = 'medium';
  if (intensityScore > 2 && authenticityScore > 70) priority = 'high';
  if (intensityScore > 4 && authenticityScore > 80) priority = 'critical';

  return {
    intensityScore,
    intensity,
    authenticityScore,
    priority,
    isAuthentic: authenticityScore > 60
  };
};

module.exports = analyzeSentiment;
