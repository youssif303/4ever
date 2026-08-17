/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  // Dark Premium palette — applied to both schemes so the app always looks dark & premium.
  light: {
    text: '#E8F4FF',
    tint: '#2DD4BF',
    background: '#0E1F2E',        // deep navy
    foreground: '#E8F4FF',        // ice white
    card: '#152942',              // dark blue card surface
    cardForeground: '#E8F4FF',
    primary: '#2DD4BF',           // vivid teal
    primaryForeground: '#071624', // dark text on teal buttons
    secondary: '#1A3250',         // secondary dark surface
    secondaryForeground: '#90D4CD',
    muted: '#162840',
    mutedForeground: '#7BACC7',   // blue-grey muted text
    accent: '#FBBF24',            // vivid amber / gold
    accentForeground: '#071624',
    destructive: '#F87171',
    destructiveForeground: '#FFFFFF',
    border: '#1E3A50',            // dark border
    input: '#1A3250',
    success: '#34D399',           // emerald green
    softAccent: '#1C2A1A',        // soft dark greenish surface
    darkSurface: '#071624',       // near-black for hero sections
  },
  dark: {
    text: '#E8F4FF',
    tint: '#2DD4BF',
    background: '#07111A',
    foreground: '#E8F4FF',
    card: '#0F1E2E',
    cardForeground: '#E8F4FF',
    primary: '#2DD4BF',
    primaryForeground: '#071624',
    secondary: '#132030',
    secondaryForeground: '#90D4CD',
    muted: '#0D1C2A',
    mutedForeground: '#6A99B8',
    accent: '#FBBF24',
    accentForeground: '#071624',
    destructive: '#F87171',
    destructiveForeground: '#FFFFFF',
    border: '#172B3E',
    input: '#132030',
    success: '#34D399',
    softAccent: '#142018',
    darkSurface: '#040C15',
  },
  radius: 20,
};

export default colors;
