import cityServiceData from '../data/dinodoors-city-service-pages.json';

/**
 * @typedef {Object} CityHub
 * @property {string} cityName
 * @property {string} state
 * @property {string} citySlug
 * @property {string} title
 * @property {string} metaTitle
 * @property {string} metaDescription
 * @property {string} canonicalPath
 * @property {string} intro
 * @property {string[]} nearbyCitySlugs
 * @property {string[]} activeServiceSlugs
 */

/**
 * @typedef {Object} CityServicePage
 * @property {string} id
 * @property {boolean} isActive
 * @property {string} cityName
 * @property {string} state
 * @property {string} citySlug
 * @property {string} serviceId
 * @property {string} serviceName
 * @property {string} serviceSlug
 * @property {string} serviceImageUrl
 * @property {string} urlPath
 * @property {string} title
 * @property {string} metaTitle
 * @property {string} metaDescription
 * @property {string} canonicalPath
 * @property {Array<{label: string, path: string}>} breadcrumbs
 * @property {Object} hero
 * @property {Object} content
 * @property {Object} internalLinks
 */

export function getAllCityHubs() {
  return cityServiceData.cityHubs;
}

/**
 * Gets a city hub by its slug.
 * Handles both "duncan" and "duncan-ok" style slugs.
 */
export function getCityHubBySlug(citySlug) {
  if (!citySlug) return null;
  const normalizedSlug = citySlug.endsWith('-ok') ? citySlug : `${citySlug}-ok`;
  return cityServiceData.cityHubs.find(h => h.citySlug === normalizedSlug) || 
         cityServiceData.cityHubs.find(h => h.citySlug === citySlug);
}

export function getAllCityServicePages() {
  return cityServiceData.cityServicePages;
}

/**
 * Gets a city-service page by city and service slugs.
 */
export function getCityServicePage(citySlug, serviceSlug) {
  if (!citySlug || !serviceSlug) return null;
  const normalizedCitySlug = citySlug.endsWith('-ok') ? citySlug : `${citySlug}-ok`;
  
  return cityServiceData.cityServicePages.find(
    p => (p.citySlug === normalizedCitySlug || p.citySlug === citySlug) && p.serviceSlug === serviceSlug
  );
}

/**
 * Gets all service pages for a specific city.
 */
export function getCityServicePagesForCity(citySlug) {
  if (!citySlug) return [];
  const normalizedCitySlug = citySlug.endsWith('-ok') ? citySlug : `${citySlug}-ok`;
  return cityServiceData.cityServicePages.filter(
    p => p.citySlug === normalizedCitySlug || p.citySlug === citySlug
  );
}

/**
 * Gets all city pages for a specific service.
 */
export function getCityServicePagesForService(serviceSlug) {
  if (!serviceSlug) return [];
  return cityServiceData.cityServicePages.filter(p => p.serviceSlug === serviceSlug);
}

/**
 * Formats the city slug for the URL (removes -ok if present to match existing pattern)
 */
export function formatCitySlugForUrl(citySlug) {
  return citySlug.replace(/-ok$/, '');
}

/**
 * Fixes internal paths from JSON (converts /service-areas/city-ok/... to /service-area/city/...)
 */
export function fixInternalPath(path) {
  if (!path) return path;
  return path
    .replace('/service-areas/', '/service-area/')
    .replace(/-ok(\/|$)/, '$1');
}

/**
 * Gets paths for getStaticPaths in city-service pages.
 */
export function getCityServicePaths() {
  return cityServiceData.cityServicePages.map(p => ({
    params: {
      city: formatCitySlugForUrl(p.citySlug),
      service: p.serviceSlug
    }
  }));
}

export default {
  getAllCityHubs,
  getCityHubBySlug,
  getAllCityServicePages,
  getCityServicePage,
  getCityServicePagesForCity,
  getCityServicePagesForService,
  getCityServicePaths,
  formatCitySlugForUrl,
  fixInternalPath
};
