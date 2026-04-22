// lib/cities.js

const cityServiceData = require('../data/dinodoors-city-service-pages.json');

const CITY_LIST = cityServiceData.cities.map(c => `${c.name}, ${c.state}`);

/**
 * Normalizer for URL slugs
 * e.g., "Elmore City, OK" -> "elmore-city"
 */
const normalizeCity = (city) =>
  city
    .toLowerCase()
    .replace(/,\s*ok$/i, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

module.exports = {
  CITY_LIST,
  normalizeCity,
};
