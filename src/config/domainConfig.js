// Domain-based configuration
const DOMAIN_CONFIG = {
  // Default config
  default: {
    appName: 'TaskCherry',
    title: 'TaskCherry',
    loginTitle: 'TaskCherry',
    loginSubtitle: 'Görevlerinizi TaskCherry ile yönetin',
    favicon: '/cherry-favicon.svg',
    primaryColor: '#3b82f6',
    logo: '🍒', // Default emoji logo
  },
  
  // Berk Sarıcan - berksarican.com
  'berksarican.com': {
    appName: 'Berk Sarıcan',
    title: 'Berk Sarıcan - Satış Yönetimi',
    loginTitle: 'Berk Sarıcan',
    loginSubtitle: 'Satış Yönetimi',
    favicon: '/berk-favicon.svg',
    primaryColor: '#2563eb',
    logo: 'B', // Login ekranında gösterilecek logo
    logoGradient: 'linear-gradient(135deg, #2563eb, #1e40af)', // Logo renk gradyanı
    titleGradient: 'linear-gradient(135deg, #2563eb, #1e40af)', // App name gradient
    buttonGradient: 'linear-gradient(135deg, #2563eb, #1e40af)', // Button gradient
    buttonHoverGradient: 'linear-gradient(135deg, #1e40af, #1e3a8a)', // Button hover
  },
  
  // Subdomain desteği (www, app, vb.)
  'www.berksarican.com': {
    appName: 'Berk Sarıcan',
    title: 'Berk Sarıcan - Satış Yönetimi',
    loginTitle: 'Berk Sarıcan',
    loginSubtitle: 'Satış Yönetimi',
    favicon: '/berk-favicon.svg',
    primaryColor: '#2563eb',
    logo: 'B',
    logoGradient: 'linear-gradient(135deg, #2563eb, #1e40af)',
    titleGradient: 'linear-gradient(135deg, #2563eb, #1e40af)',
    buttonGradient: 'linear-gradient(135deg, #2563eb, #1e40af)',
    buttonHoverGradient: 'linear-gradient(135deg, #1e40af, #1e3a8a)',
  },
  
  // Domain-specific configs
  'app.example.com': {
    appName: 'Example Boards',
    title: 'Example Boards - Project Management',
    loginTitle: 'Welcome to Example Boards',
    loginSubtitle: 'Manage your projects efficiently',
    favicon: '/example-favicon.svg',
    primaryColor: '#10b981',
  },
  
  'localhost:5174': {
    appName: 'TaskCherry',
    title: 'TaskCherry',
    loginTitle: 'TaskCherry',
    loginSubtitle: 'Görevlerinizi TaskCherry ile yönetin',
    favicon: '/cherry-favicon.svg',
    primaryColor: '#3b82f6',
    logo: '🍒', // Default emoji logo
  },
  
  // Daha fazla domain ekleyebilirsiniz
  // 'your-custom-domain.com': { ... },
};

/**
 * Get configuration based on current domain
 */
export const getDomainConfig = () => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  const domain = port ? `${hostname}:${port}` : hostname;
  
  // Check if domain has specific config
  if (DOMAIN_CONFIG[domain]) {
    return DOMAIN_CONFIG[domain];
  }
  
  // Check if subdomain matches (e.g., *.yourdomain.com)
  const domainKeys = Object.keys(DOMAIN_CONFIG);
  for (const key of domainKeys) {
    if (key !== 'default' && domain.includes(key)) {
      return DOMAIN_CONFIG[key];
    }
  }
  
  // Return default config
  return DOMAIN_CONFIG.default;
};

/**
 * Update page title dynamically
 */
export const updatePageTitle = (title) => {
  const config = getDomainConfig();
  document.title = title || config.title;
};

/**
 * Update favicon dynamically
 */
export const updateFavicon = () => {
  const config = getDomainConfig();
  const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
  link.type = 'image/svg+xml';
  link.rel = 'icon';
  link.href = config.favicon;
  document.head.appendChild(link);
};

/**
 * Apply primary color theme
 */
export const applyPrimaryColor = () => {
  const config = getDomainConfig();
  document.documentElement.style.setProperty('--primary-color', config.primaryColor);
};

/**
 * Initialize domain configuration
 */
export const initDomainConfig = () => {
  updatePageTitle();
  updateFavicon();
  applyPrimaryColor();
};

export default getDomainConfig;

