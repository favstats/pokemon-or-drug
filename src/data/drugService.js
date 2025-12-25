// Drug Service - Provides links and attempts to fetch real pill images
// Uses RxImage API from National Library of Medicine for pill images
// Uses OpenFDA API for drug data

const RXIMAGE_API = 'https://rximage.nlm.nih.gov/api/rximage/1/rxnav';
const OPENFDA_API = 'https://api.fda.gov/drug/label.json';

// Cache for drug images
const drugImageCache = new Map();

// Generate drugs.com link for a drug name
export const getDrugLink = (drugName) => {
  const slug = drugName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return `https://www.drugs.com/${slug}.html`;
};

// Get DailyMed link (more reliable for official drug info)
export const getDailyMedLink = (drugName) => {
  const query = encodeURIComponent(drugName);
  return `https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=${query}`;
};

// Fetch pill image from RxImage API
export const fetchDrugImage = async (drugName) => {
  // Check cache first
  if (drugImageCache.has(drugName)) {
    return drugImageCache.get(drugName);
  }

  try {
    const response = await fetch(
      `${RXIMAGE_API}?name=${encodeURIComponent(drugName)}&imageTypes=1`,
      { mode: 'cors' }
    );
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.nlmRxImages && data.nlmRxImages.length > 0) {
      const imageUrl = data.nlmRxImages[0].imageUrl;
      drugImageCache.set(drugName, imageUrl);
      return imageUrl;
    }
    
    return null;
  } catch (error) {
    // RxImage API might have CORS issues, fail silently
    console.warn(`Could not fetch image for ${drugName}:`, error.message);
    return null;
  }
};

// Fetch additional drugs from OpenFDA API
export const fetchDrugsFromFDA = async (limit = 100) => {
  try {
    // Get brand name drugs
    const response = await fetch(
      `${OPENFDA_API}?search=_exists_:openfda.brand_name&limit=${limit}`
    );
    
    if (!response.ok) {
      console.warn('OpenFDA API request failed');
      return [];
    }
    
    const data = await response.json();
    
    if (!data.results) return [];
    
    const drugs = [];
    const seenNames = new Set();
    
    for (const result of data.results) {
      if (result.openfda?.brand_name) {
        for (const name of result.openfda.brand_name) {
          // Clean up name and check for duplicates
          const cleanName = name.split(' ')[0]; // Just first word
          if (cleanName.length >= 4 && cleanName.length <= 15 && !seenNames.has(cleanName.toUpperCase())) {
            seenNames.add(cleanName.toUpperCase());
            
            // Get indication/purpose
            let description = 'A prescription medication.';
            let category = 'PRESCRIPTION';
            
            if (result.purpose) {
              description = result.purpose[0].substring(0, 100);
            } else if (result.indications_and_usage) {
              const usage = result.indications_and_usage[0];
              description = usage.substring(0, 100).replace(/\s+/g, ' ').trim();
              if (!description.endsWith('.')) description += '...';
            }
            
            // Try to determine category from drug class
            if (result.openfda?.pharm_class_epc) {
              category = result.openfda.pharm_class_epc[0].toUpperCase().substring(0, 20);
            }
            
            drugs.push({
              name: cleanName,
              category,
              description,
              color: getRandomPillColor(),
              pillShape: getRandomPillShape(),
              pillColor: '#FFFFFF'
            });
          }
        }
      }
    }
    
    return drugs;
  } catch (error) {
    console.warn('Error fetching from OpenFDA:', error.message);
    return [];
  }
};

// Helper to get random pill color
const pillColors = [
  '#FF6B9D', '#9B59B6', '#3498DB', '#2ECC71', '#F39C12', 
  '#E74C3C', '#1ABC9C', '#9B59B6', '#34495E', '#E91E63',
  '#00BCD4', '#8BC34A', '#FF5722', '#607D8B', '#673AB7'
];

const getRandomPillColor = () => {
  return pillColors[Math.floor(Math.random() * pillColors.length)];
};

// Helper to get random pill shape
const pillShapes = ['capsule', 'round', 'oval', 'diamond'];

const getRandomPillShape = () => {
  return pillShapes[Math.floor(Math.random() * pillShapes.length)];
};

// Get Wikipedia link
export const getWikipediaLink = (drugName) => {
  const slug = drugName.replace(/\s+/g, '_');
  return `https://en.wikipedia.org/wiki/${slug}`;
};

export default {
  getDrugLink,
  getDailyMedLink,
  fetchDrugImage,
  fetchDrugsFromFDA,
  getWikipediaLink
};
