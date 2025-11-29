// Common theme configuration for consistent UI across the app

export const theme = {
  // Color palette
  colors: {
    primary: {
      main: 'indigo-600',
      hover: 'indigo-700',
      light: 'indigo-50',
      text: 'indigo-600',
    },
    secondary: {
      main: 'purple-600',
      hover: 'purple-700',
    },
    success: {
      main: 'green-600',
      hover: 'green-700',
    },
    danger: {
      main: 'red-600',
      hover: 'red-700',
    },
    neutral: {
      50: 'gray-50',
      100: 'gray-100',
      200: 'gray-200',
      300: 'gray-300',
      400: 'gray-400',
      500: 'gray-500',
      600: 'gray-600',
      700: 'gray-700',
      800: 'gray-800',
      900: 'gray-900',
    },
  },

  // Common spacing
  spacing: {
    xs: '0.5rem',    // 8px
    sm: '0.75rem',   // 12px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
  },

  // Border radius
  borderRadius: {
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
  },

  // Typography
  typography: {
    heading: {
      xs: 'text-xs font-semibold',
      sm: 'text-sm font-bold',
      md: 'text-base font-bold',
      lg: 'text-lg font-bold',
      xl: 'text-xl font-bold',
    },
    body: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
    },
  },

  // Shadows
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  },

  // Transitions
  transitions: {
    all: 'transition-all',
    colors: 'transition-colors',
  },
};

// Reusable component class strings
export const components = {
  // Buttons
  button: {
    primary: `bg-linear-to-r from-indigo-600 to-purple-600 text-white py-2.5 px-5 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-md hover:shadow-lg`,
    secondary: `bg-gray-800 text-white py-2.5 px-5 rounded-lg hover:bg-gray-900 transition-colors font-semibold`,
    danger: `bg-red-600 text-white py-2.5 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium`,
    ghost: `text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 py-2.5 px-4 rounded-lg transition-all font-medium`,
    small: `px-4 py-1.5 text-xs rounded-lg font-semibold transition-all`,
  },

  // Inputs
  input: {
    base: `w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all`,
    textarea: `w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg resize-none text-gray-900 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all`,
    select: `px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 cursor-pointer focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all`,
    comment: `flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all`,
  },

  // Cards
  card: {
    base: `bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all`,
    compact: `bg-white rounded-lg p-4 border border-gray-100 shadow-sm transition-all`,
  },

  // Sidebar
  sidebar: {
    container: `bg-gray-50 border border-gray-100 p-4`,
    heading: `text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200`,
  },

  // Navigation
  nav: {
    item: `text-sm text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 p-2.5 rounded-lg cursor-pointer transition-all font-medium`,
    itemActive: `text-sm text-indigo-600 bg-indigo-50 p-2.5 rounded-lg cursor-pointer font-semibold transition-all`,
  },

  // Avatar
  avatar: {
    base: `bg-linear-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold shadow-sm`,
    small: `w-8 h-8 text-xs`,
    medium: `w-10 h-10 text-sm`,
    large: `w-12 h-12 text-base`,
  },

  // Badges/Pills
  badge: {
    primary: `bg-indigo-600 text-white px-4 py-1.5 rounded-lg font-semibold shadow-sm`,
    secondary: `bg-gray-100 text-gray-700 px-3 py-1 rounded-lg font-medium`,
  },

  // Upload area
  upload: {
    area: `flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all group`,
    text: `text-sm text-gray-700 group-hover:text-indigo-600 font-medium`,
  },

  // Media
  media: {
    container: `rounded-xl overflow-hidden border border-gray-100 shadow-sm`,
  },

  // Dividers
  divider: {
    horizontal: `border-t border-gray-100`,
    vertical: `border-l border-gray-100`,
  },

  // Text styles
  text: {
    heading: `text-gray-900 font-bold`,
    subheading: `text-gray-700 font-semibold`,
    body: `text-gray-700`,
    muted: `text-gray-600`,
    caption: `text-gray-600 text-xs`,
    link: `text-indigo-600 hover:text-indigo-700 transition-colors font-medium`,
  },

  // Action buttons (like/dislike)
  action: {
    active: `text-sm transition-all font-semibold`,
    inactive: `text-sm text-gray-500 transition-all font-semibold`,
  },
};

// Helper function to combine classes
export const cx = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// Common layout patterns
export const layouts = {
  container: `w-full min-h-screen bg-white flex flex-col`,
  navbar: `w-full bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm`,
  threeColumn: `flex justify-center w-full px-4 mt-4`,
  leftSidebar: `w-1/5 h-[88vh] sticky top-20`,
  mainContent: `w-2/4 mx-4 h-[88vh] overflow-y-scroll`,
  rightSidebar: `w-1/5 h-[88vh] sticky top-20`,
};

export default { theme, components, cx, layouts };
