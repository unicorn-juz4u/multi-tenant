import { useEffect } from 'react';

const setMetaTag = (attrName, attrVal, content) => {
  if (typeof document === 'undefined') return null;
  if (content === undefined || content === null) return null;
  
  let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrVal);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
  return element;
};

const setLinkTag = (rel, href) => {
  if (typeof document === 'undefined') return null;
  if (!href) return null;

  let element = document.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
  return element;
};

/**
 * Custom React hook for dynamic route-level SEO meta management
 */
export const useSEO = ({
  title,
  description,
  keywords,
  robots = 'noindex, nofollow',
  canonical,
  ogType = 'website',
  jsonLd,
}) => {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // 1. Formatted Page Title
    const formattedTitle = title
      ? (title.includes('SaaSify') ? title : `${title} | SaaSify`)
      : 'SaaSify | Enterprise Multi-Tenant Cloud Platform';
    document.title = formattedTitle;

    // 2. Standard Meta Tags
    setMetaTag('name', 'title', formattedTitle);
    if (description) {
      setMetaTag('name', 'description', description);
    }
    if (keywords) {
      setMetaTag('name', 'keywords', keywords);
    }
    setMetaTag('name', 'robots', robots);

    // 3. Canonical URL
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://saasify.app';
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    const canonicalUrl = canonical || `${currentOrigin}${currentPath}`;
    setLinkTag('canonical', canonicalUrl);

    // 4. Open Graph Meta Tags
    setMetaTag('property', 'og:title', formattedTitle);
    if (description) {
      setMetaTag('property', 'og:description', description);
    }
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', ogType);

    // 5. Twitter Card Meta Tags
    setMetaTag('name', 'twitter:title', formattedTitle);
    if (description) {
      setMetaTag('name', 'twitter:description', description);
    }

    // 6. Optional Structured Data (JSON-LD)
    let jsonLdScript = null;
    if (jsonLd) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.type = 'application/ld+json';
      jsonLdScript.setAttribute('data-dynamic-seo', 'true');
      jsonLdScript.text = JSON.stringify(jsonLd);
      document.head.appendChild(jsonLdScript);
    }

    return () => {
      if (jsonLdScript && jsonLdScript.parentNode) {
        jsonLdScript.parentNode.removeChild(jsonLdScript);
      }
    };
  }, [title, description, keywords, robots, canonical, ogType, jsonLd]);
};

/**
 * Declarative SEO Component for mounting inside page views
 */
export const SEO = (props) => {
  useSEO(props);
  return null;
};

export default SEO;
