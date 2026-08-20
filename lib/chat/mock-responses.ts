/**
 * Mock responses for the chat feature.
 * This function returns a canned response based on the user's input.
 * In a real app you would call an LLM, but here we simulate token-by-token
 * streaming using setTimeout in the route handler.
 */

export function mockResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  // Simple keyword matching
  if (lower.includes('recommend') || lower.includes('what should i watch')) {
    return 'I recommend watching "Goodfellas" – a classic Martin Scorsese film starring Al Pacino and Robert De Niro.';
  }
  if (lower.includes('goodfellas') || lower.includes('casino') || lower.includes('irishman')) {
    return 'Those are excellent Scorsese films. "Goodfellas" is often considered his masterpiece, while "Casino" showcases his epic style and "The Irishman" uses groundbreaking de-aging technology.';
  }
  if (lower.includes('scorsese')) {
    return 'Martin Scorsese is one of the greatest directors of all time, known for his collaborations with Al Pacino and Robert De Niro. His films often explore themes of guilt, redemption, and the American underworld.';
  }
  if (lower.includes('pacino') || lower.includes('al pacino')) {
    return 'Al Pacino delivered iconic performances in Scorsese films like "The Irishman" (as Jimmy Hoffa) and "Heat". His intensity and range have made him a legend.';
  }
  if (lower.includes('de niro') || lower.includes('robert de niro')) {
    return 'Robert De Niro has starred in numerous Scorsese classics including "Goodfellas", "Casino", "Taxi Driver", and "Raging Bull". His collaborations with Scorsese are cinematic gold.';
  }
  if (lower.includes('heat') || lower.includes('godfather')) {
    return 'While not a Scorsese film, "Heat" features Pacino and De Niro together in a legendary cops-and-robbers story. "The Godfather" is Coppola\'s masterpiece, also featuring Pacino.';
  }
  if (lower.includes('taxi driver') || lower.includes('raging bull')) {
    return 'Both "Taxi Driver" and "Raging Bull" are Scorsese masterpieces starring Robert De Niro, showcasing his ability to portray deeply troubled characters.';
  }

  // Fallback
  return 'I\'m here to help you discover great movies from the Scorsese-Pacino-De Niro universe. Ask me for recommendations or insights!';
}