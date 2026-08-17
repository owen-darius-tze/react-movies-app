/**
 * Image Registry for consistent celebrity imagery across different sources.
 * This ensures that an entity like "Al Pacino" always uses the same
 * visual assets whether the UI is rendering from a Rotten Tomatoes
 * component or an Insider TV component.
 */

export type CelebrityImageAssets = {
  rt_img: string;
  insider_img: string;
};

export type CelebrityRegistryEntry = {
  id: string;
  name: string;
  assets: CelebrityImageAssets;
};

// The source of truth for all celebrity visual assets
export const CELEBRITY_IMAGE_REGISTRY: Record<string, CelebrityRegistryEntry> = {
  "celebrity-1": {
    id: "celebrity-1",
    name: "Martin Scorsese",
    assets: {
      rt_img: "/images/celebrities/scorsese-rt.jpg",
      insider_img: "/images/celebrities/scorsese-insider.jpg",
    },
  },
  "celebrity-2": {
    id: "celebrity-2",
    name: "Al Pacino",
    assets: {
      rt_img: "/images/celebrities/pacino-rt.jpg",
      insider_img: "/images/celebrities/pacino-insider.jpg",
    },
  },
  "celebrity-3": {
    id: "celebrity-3",
    name: "Robert De Niro",
    assets: {
      rt_img: "/images/celebrities/dero-rt.jpg",
      insider_img: "/images/celebrities/dero-insider.jpg",
    },
  },
};

/**
 * Retrieves the consistent image assets for a given celebrity ID.
 * @param celebrityId - The unique identifier from the mock database.
 * @returns The matched Image assets.
 */
export function getCelebrityImage(celebrityId: string) {
  const registryEntry = CELEBRITY_IMAGE_REGISTRY[celebrityId];
  if (!registryEntry) {
    console.warn(`[ImageRegistry] No entry found for celebrity ID: ${celebrityId}`);
    return null;
  }
  return registryEntry.assets;
}

/**
 * Helper to get a specific source image for a celebrity.
 * @param celebrityId - The unique identifier.
 * @param source - 'rt' | 'insider'
 * @returns URL string or fallback
 */
export function getCelebritySourceImage(celebrityId: string, source: 'rt' | 'insider') {
  const assets = getCelebrityImage(celebrityId);
  if (!assets) return '/api/placeholder/150/150';
  return source === 'rt'? assets.rt_img : assets.insider_img;
}
