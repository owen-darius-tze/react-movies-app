/**
 * Placeholder image utilities using UI Avatars API
 * https://ui-avatars.com/api/?name=NAME
 */

const UI_AVATARS_BASE = 'https://ui-avatars.com/api/';

interface PlaceholderOptions {
  name: string;
  size?: number;
  background?: string;
  color?: string;
  bold?: boolean;
  format?: 'png' | 'svg' | 'jpg';
}

/**
 * Generate a placeholder avatar URL from UI Avatars API
 * @param options - Configuration options for the avatar
 * @returns URL string for the placeholder image
 */
export function getAvatarPlaceholder({
  name,
  size = 200,
  background = 'random',
  color = 'fff',
  bold = true,
  format = 'png',
}: PlaceholderOptions): string {
  const encodedName = encodeURIComponent(name);
  const params = new URLSearchParams({
    name: encodedName,
    size: size.toString(),
    background,
    color,
    format,
    bold: bold.toString(),
  });
  return `${UI_AVATARS_BASE}?${params.toString()}`;
}

/**
 * Generate a placeholder for a movie/show title
 * @param title - The movie/show title
 * @param size - Image size (default 200)
 * @returns URL string for the placeholder
 */
export function getMediaPlaceholder(title: string, size = 200): string {
  return getAvatarPlaceholder({
    name: title,
    size,
    background: '0d0d0d',
    color: 'e0e0e0',
  });
}

/**
 * Generate a placeholder for a person/celebrity
 * @param name - The person's name
 * @param size - Image size (default 200)
 * @returns URL string for the placeholder
 */
export function getPersonPlaceholder(name: string, size = 200): string {
  return getAvatarPlaceholder({
    name,
    size,
    background: '1a1a2e',
    color: 'e0e0e0',
  });
}

/**
 * Generate a placeholder for news/article content
 * @param title - The article title or source name
 * @param size - Image size (default 200)
 * @returns URL string for the placeholder
 */
export function getNewsPlaceholder(title: string, size = 200): string {
  return getAvatarPlaceholder({
    name: title,
    size,
    background: '1a2a1a',
    color: 'e0e0e0',
  });
}

/**
 * Get the best available image URL, falling back to placeholder
 * @param image - The primary image URL (can be null/undefined)
 * @param fallbackName - Name to use for placeholder if primary is missing
 * @param getPlaceholder - Function to generate placeholder (e.g., getMediaPlaceholder, getPersonPlaceholder)
 * @returns Valid image URL string
 */
export function getImageOrPlaceholder(
  image: string | null | undefined,
  fallbackName: string,
  getPlaceholder: (name: string, size: number) => string,
  size = 200
): string {
  if (image && image.trim() !== '') {
    return image;
  }
  return getPlaceholder(fallbackName, size);
}