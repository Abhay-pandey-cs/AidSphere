const axios = require('axios');
const { analyzeSignal } = require('../utils/geminiAnalyzer');
const ScrapedSignal = require('../models/ScrapedSignal');
const SOS = require('../models/SOS');

/**
 * Live Mission Control Intelligence Monitor
 * Scrapes from ReliefWeb (News) and Indian Subreddits (Social Media)
 */

const triggerScrape = async (req, res) => {
  try {
    const { lat, lng } = req.body || {};
    const newSignals = [];

    // Reverse Geocoding via OpenStreetMap
    let geoContext = { city: null, state: null, region: 'INDIA_REGIONAL' };
    if (lat && lng) {
      try {
        const nomRes = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
          headers: { 'User-Agent': 'AidSphereResponder/1.0' }
        });
        const address = nomRes.data?.address || {};
        geoContext.city = address.city || address.town || address.county;
        geoContext.state = address.state;
        geoContext.region = `${geoContext.city || ''}_${geoContext.state || 'LOCAL'}`.toUpperCase();
        console.log(`[GeoTracker] Volunteer initialized localized scan at: ${geoContext.city}, ${geoContext.state}`);
      } catch (err) {
        console.warn("[GeoTracker] Reverse geocode timeout/failure:", err.message);
      }
    }

    // 1. Fetch from Reddit JSON (Dynamic Localized Targeting)
    try {
      let subreddits = 'india+delhi+mumbai+bangalore+kerala+chennai+pune+kolkata+hyderabad';
      let searchQuery = 'emergency OR help OR sos OR disaster OR rescue';

      if (geoContext.city || geoContext.state) {
        const localTarget = (geoContext.city || geoContext.state).replace(/\s+/g, '');
        subreddits = `${localTarget}+india`;
        searchQuery = `(emergency OR help OR disaster OR rescue) AND ${localTarget}`;
      }

      const userAgent = `AidSphereMultiSourceScraper/1.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)} (Node.js/Axios)`;
      const redditRes = await axios.get(`https://www.reddit.com/r/${subreddits}/search.json?q=${encodeURIComponent(searchQuery)}&restrict_sr=on&sort=new&limit=15`, {
        headers: { 'User-Agent': userAgent }
      });

      const posts = redditRes.data?.data?.children || [];
      for (const post of posts) {
        const data = post.data;
        if (!data.title && !data.selftext) continue;
        const text = `${data.title} ${data.selftext}`.substring(0, 500);

        // Multi-modal Extraction
        const imageUrl = data.url && (data.url.endsWith('.jpg') || data.url.endsWith('.png')) ? data.url : null;

        // Wait for AI Assessment
        const aiEvaluation = await analyzeSignal(text, imageUrl);

        // FILTER: AI drops post if not a true physical emergency
        if (!aiEvaluation.isDisaster) {
          console.log(`[Reddit] Gemini Dropped: "${text.substring(0, 40)}..." - Reason: ${aiEvaluation.aiReasoning}`);
          continue;
        }

        newSignals.push({
          originalId: `reddit_${data.id}`,
          platform: 'REDDIT_INDIA',
          author: data.author || 'AnonymousUser',
          content: `${text.trim()}\n\n[AI_VERIFIED: ${aiEvaluation.aiReasoning}]`,
          timestamp: new Date(data.created_utc * 1000),
          location: { region: geoContext.region },
          link: `https://reddit.com${data.permalink}`,
          neuralScore: aiEvaluation.confidenceScore,
          confidence: aiEvaluation.confidenceScore,
          sentiment: aiEvaluation.sentiment || 'warning',
          rawCategory: aiEvaluation.category || data.subreddit_name_prefixed
        });
      }
    } catch (err) {
      console.error('Reddit Scrape Error:', err.message);
    }

    // 2. Fetch from ReliefWeb API (Hyper-Local NGO News)
    try {
      const reliefTarget = geoContext.city || geoContext.state || 'India';
      const reliefRes = await axios.get(`https://api.reliefweb.int/v1/reports?appname=AidSphere&query[value]=${encodeURIComponent(reliefTarget)}&preset=latest&limit=10&profile=full`, {
        headers: { 'User-Agent': 'AidSphereProtocol/1.0.0' },
        timeout: 5000
      });

      const reports = reliefRes.data?.data || [];
      if (reports.length > 0) {
        for (const report of reports) {
          const title = report.fields.title;
          const body = report.fields.body ? report.fields.body.substring(0, 300).replace(/<[^>]*>?/gm, '') : title;

          const aiEvaluation = await analyzeSignal(`${title}. ${body}`);

          if (!aiEvaluation.isDisaster) {
            console.log(`[ReliefWeb] Gemini Dropped: "${title}" - Reason: ${aiEvaluation.aiReasoning}`);
            continue;
          }

          newSignals.push({
            originalId: `reliefweb_${report.id}`,
            platform: 'RELIEF_WEB',
            author: 'NGO_OFFICIAL',
            content: `${body}\n\n[AI_VERIFIED: ${aiEvaluation.aiReasoning}]`,
            timestamp: new Date(report.fields.date.created),
            location: { region: geoContext.region },
            link: report.fields.url_alias || report.fields.url,
            neuralScore: aiEvaluation.confidenceScore,
            confidence: aiEvaluation.confidenceScore,
            sentiment: aiEvaluation.sentiment || 'warning',
            rawCategory: aiEvaluation.category || 'Official NGO Alert'
          });
        }
      }
    } catch (err) {
      console.error('ReliefWeb Scrape Error:', err.message);
    }

    // 3. Fetch from NASA EONET (Global Events)
    try {
      const eonetRes = await axios.get('https://eonet.gsfc.nasa.gov/api/v3/events?limit=5&days=10', { timeout: 5000 });
      const events = eonetRes.data?.events || [];

      for (const event of events) {
        if (!event.title) continue;

        const aiEvaluation = await analyzeSignal(`NASA EONET Alert: ${event.title}`);

        if (!aiEvaluation.isDisaster) {
          continue;
        }

        newSignals.push({
          originalId: `nasa_eonet_${event.id}`,
          platform: 'NASA_EONET',
          author: 'NASA_SYSTEM',
          content: `Global Disaster Intelligence: ${event.title}. Verified by NASA Earth Observatory.\n\n[AI_VERIFIED: ${aiEvaluation.aiReasoning}]`,
          timestamp: new Date(event.geometry[0]?.date || new Date()),
          location: { region: 'GLOBAL' },
          link: event.sources[0]?.url || 'https://eonet.gsfc.nasa.gov',
          neuralScore: aiEvaluation.confidenceScore,
          confidence: aiEvaluation.confidenceScore,
          sentiment: aiEvaluation.sentiment || 'warning',
          rawCategory: aiEvaluation.category || event.categories[0]?.title || 'Natural Disaster'
        });
      }
    } catch (err) {
      console.error('NASA EONET Scrape Error:', err.message);
    }

    // 4. Fetch from Mastodon (Open Source Social Network)
    try {
      const mastodonRes = await axios.get('https://mastodon.social/api/v1/timelines/tag/emergency?limit=5', { timeout: 5000 });
      const statuses = mastodonRes.data || [];
      for (const status of statuses) {
        if (!status.content) continue;
        const text = status.content.replace(/<[^>]*>?/gm, '').substring(0, 300);

        // Multi-modal Extraction
        const imageUrl = status.media_attachments?.find(m => m.type === 'image')?.url || null;

        const aiEvaluation = await analyzeSignal(text, imageUrl);

        if (!aiEvaluation.isDisaster) {
          console.log(`[Mastodon] Gemini Dropped: "${text.substring(0, 40)}..." - Reason: ${aiEvaluation.aiReasoning}`);
          continue;
        }

        newSignals.push({
          originalId: `mastodon_${status.id}`,
          platform: 'MASTODON_SOCIAL',
          author: status.account?.username || 'FederatedNode',
          content: `${text.trim()}\n\n[AI_VERIFIED: ${aiEvaluation.aiReasoning}]`,
          timestamp: new Date(status.created_at),
          location: { region: 'GLOBAL' },
          link: status.url,
          neuralScore: aiEvaluation.confidenceScore,
          confidence: aiEvaluation.confidenceScore,
          sentiment: aiEvaluation.sentiment || 'warning',
          rawCategory: aiEvaluation.category || '#emergency'
        });
      }
    } catch (err) {
      console.error('Mastodon Scrape Error:', err.message);
    }

    // 5. Fallback / Seed Data (Injects guaranteed mock data with a real image for Gemini to visually evaluate!)
    if (newSignals.length === 0 || process.env.GEMINI_API_KEY) {
      console.log("[Test Post] Sending Mock Flood Image to Gemini for strict verification...");
      const mockText = "URGENT: Entire lower district is submerged. Cars are completely floating and water has reached the second floor of some buildings. Need rescue boats immediately! People are trapped on roofs.";
      const mockImageUrl = "https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=1000&auto=format&fit=crop"; // Real flood image

      const aiEvaluation = await analyzeSignal(mockText, mockImageUrl);

      if (aiEvaluation.isDisaster) {
        const todayKey = new Date().toISOString().split('T')[0];
        newSignals.push({
          originalId: `seed_disaster_${todayKey}`,
          platform: 'GEMINI_VISION_TEST',
          author: 'AidSphere_AI_Node',
          content: `${mockText}\n\n[AI_VISION_VERIFIED: ${aiEvaluation.aiReasoning}]`,
          timestamp: new Date(),
          location: { region: 'MAHARASHTRA_REGIONAL' },
          link: mockImageUrl,
          neuralScore: aiEvaluation.confidenceScore,
          confidence: aiEvaluation.confidenceScore,
          sentiment: aiEvaluation.sentiment || 'critical',
          rawCategory: aiEvaluation.category
        });
      }
    }

    // Save all to database (Upsert) and Auto-Convert to SOS where applicable
    let addedCount = 0;
    for (const sig of newSignals) {
      const exists = await ScrapedSignal.findOne({ originalId: sig.originalId });
      if (!exists) {
        await ScrapedSignal.create(sig);

        // AUTO-CONVERSION: Make visible on the main site Map if it's high confidence OR official
        if (sig.neuralScore > 80 || sig.platform === 'NASA_EONET' || sig.platform === 'RELIEF_WEB') {
          await SOS.create({
            user: req.user._id, // Assign to the Admin who triggered the scan
            type: 'other',
            category: 'disaster',
            description: `[INTEL SOURCE: ${sig.platform}] ${sig.content}`,
            location: {
              lat: 20.5937 + (Math.random() * 2 - 1), // Semi-randomized around India
              lng: 78.9629 + (Math.random() * 2 - 1),
              address: sig.location?.region || 'UNKNOWN'
            },
            urgency: sig.neuralScore > 85 ? 'critical' : 'high',
            status: 'pending',
            logs: [{
              status: 'pending',
              message: 'Auto-converted Authenticated Neural Signal to Main Site SOS',
              actor: req.user._id
            }]
          });
        }
        addedCount++;
      }
    }

    res.json({ message: `Successfully scraped and stored ${addedCount} new signals.` });

  } catch (error) {
    console.error('Failed to trigger scrape:', error);
    res.status(500).json({ message: 'Failed to access intelligence sources.' });
  }
};

const getMonitoredFeed = async (req, res) => {
  try {
    // Return all signals sorted by upvotes (descending), then recency
    const signals = await ScrapedSignal.find({ status: 'pending' })
      .sort({ upvotes: -1, createdAt: -1 })
      .limit(30);

    res.json(signals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error fetching signals.' });
  }
};

const upvoteSignal = async (req, res) => {
  try {
    const signalId = req.params.id;
    const userId = req.user._id;

    const signal = await ScrapedSignal.findById(signalId);
    if (!signal) return res.status(404).json({ message: 'Signal not found.' });

    // Check if already upvoted
    if (signal.upvotes.includes(userId)) {
      // Remove upvote (toggle)
      signal.upvotes = signal.upvotes.filter(id => id.toString() !== userId.toString());
    } else {
      // Add upvote
      signal.upvotes.push(userId);
      // Boost neural score slightly on upvote
      signal.neuralScore = Math.min(100, signal.neuralScore + 2);
    }

    await signal.save();
    res.json(signal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to upvote.' });
  }
};

const convertSignalToSOS = async (req, res) => {
  try {
    const signalId = req.params.id;
    const signal = await ScrapedSignal.findById(signalId);

    if (!signal) return res.status(404).json({ message: 'Signal not found' });
    if (signal.status === 'verified') return res.status(400).json({ message: 'Signal already verified and converted' });

    // Mark as verified
    signal.status = 'verified';
    await signal.save();

    // Create a new SOS from the signal
    const newSOS = await SOS.create({
      user: req.user._id, // Admin who verified it
      type: 'other',
      category: 'disaster',
      description: `[INTEL SOURCE: ${signal.platform}] ${signal.content} \n\nOriginal Author: ${signal.author} \nLink: ${signal.link || 'N/A'}`,
      location: {
        lat: signal.location?.lat || 20.5937 + (Math.random() * 2 - 1),
        lng: signal.location?.lng || 78.9629 + (Math.random() * 2 - 1),
        address: signal.location?.region || 'UNKNOWN'
      },
      urgency: signal.neuralScore > 85 ? 'critical' : 'high',
      status: 'pending',
      logs: [{
        status: 'pending',
        message: 'Admin Verified and Converted Scraped Signal to Official SOS',
        actor: req.user._id
      }]
    });

    // Populate user info for socket broadcast
    const populatedSOS = await SOS.findById(newSOS._id).populate('user', 'name phone role');

    // Emit socket event
    if (req.io) {
      req.io.emit('newSOS', populatedSOS);
    }

    res.json({ message: 'Successfully converted to SOS', sos: populatedSOS, signal });
  } catch (error) {
    console.error('Error converting signal to SOS:', error);
    res.status(500).json({ message: 'Server error during conversion' });
  }
};

const dismissSignal = async (req, res) => {
  try {
    const signalId = req.params.id;
    await ScrapedSignal.findByIdAndDelete(signalId);
    res.json({ message: 'Signal permanently purged', id: signalId });
  } catch (error) {
    console.error('Error dismissing signal:', error);
    res.status(500).json({ message: 'Server error during signal dismissal' });
  }
};

const purgeAllSignals = async (req, res) => {
  try {
    await ScrapedSignal.deleteMany({ status: 'pending' });
    res.json({ message: 'Neural feed purged successfully' });
  } catch (error) {
    console.error('Purge error:', error);
    res.status(500).json({ message: 'Failed to purge neural feed' });
  }
};

module.exports = { triggerScrape, getMonitoredFeed, upvoteSignal, convertSignalToSOS, dismissSignal, purgeAllSignals };
