/**
 * BlancKit Monochrome Theme
 * Monospace, minimal, terminal-inspired design
 */

export const monochromeTheme = {
  fonts: {
    body: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  },
  colors: {
    // Monochrome palette
    background: '#FFFFFF',
    foreground: '#000000',

    // Grays
    gray50: '#FAFAFA',
    gray100: '#F5F5F5',
    gray200: '#E5E5E5',
    gray300: '#D4D4D4',
    gray400: '#A3A3A3',
    gray500: '#737373',
    gray600: '#525252',
    gray700: '#404040',
    gray800: '#262626',
    gray900: '#171717',

    // States
    hover: '#F5F5F5',
    active: '#E5E5E5',
    border: '#E5E5E5',

    // Status
    success: '#000000',
    error: '#000000',
    warning: '#000000',
  },
  radii: {
    none: '0px',
    sm: '2px',
    md: '4px',
    lg: '6px',
    full: '9999px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    lg: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  },
} as const;

export type MonochromeTheme = typeof monochromeTheme;
