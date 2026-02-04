// lib/cities.js

const CITY_LIST = [
  "Duncan, OK",
  "Foster, OK",
  "Norman, OK",
  "Purcell, OK",
  "Springer, OK",
  "Davis, OK",
  "Katie, OK",
  "Velma, OK",
  "Wayne, OK",
  "Marlow, OK",
  "Pauls Valley, OK",
  "Ardmore, OK",
  "Bradley, OK",
  "Lindsay, OK",
  "Maysville, OK",
  "Stratford, OK",
  "Wynnewood, OK",
  "Elmore City, OK",
  "Ratliff City, OK",
];

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
