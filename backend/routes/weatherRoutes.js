const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/alerts', async (req, res) => {
  try {
    // Fetch live global 4.5+ magnitude earthquakes in the last 24h
    const { data } = await axios.get('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson');
    const features = data.features.slice(0, 3); // Max 3 popups to prevent UI clutter

    if (features.length === 0) {
      return res.json([]);
    }

    const alerts = features.map(item => {
      const mag = item.properties.mag;
      return {
        id: item.id,
        type: mag > 6 ? 'Critical Seismic Anomaly' : 'Seismic Anomaly Detected',
        region: item.properties.place,
        severity: mag > 6 ? 'Critical' : 'High',
        detail: `Magnitude ${mag.toFixed(1)} earthquake at depth ${item.geometry.coordinates[2].toFixed(1)}km. Ground sensors confirm event anomaly.`
      };
    });
    res.json(alerts);
  } catch (error) {
    console.error('USGS Anomaly Fetch error:', error.message);
    res.json([]);
  }
});

module.exports = router;
