import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import SEO from '../components/SEO.jsx';

describe('SEO Component', () => {
  beforeEach(() => {
    document.title = 'Original Title';
    const oldTags = document.querySelectorAll('meta[data-dynamic-seo], script[data-dynamic-seo]');
    oldTags.forEach((el) => el.remove());
  });

  it('updates document.title with branding suffix if missing', () => {
    render(<SEO title="Sign In" description="Sign in page description" />);
    expect(document.title).toBe('Sign In | SaaSify');
  });

  it('keeps document.title intact if branding suffix is already present', () => {
    render(<SEO title="SaaSify Enterprise Platform" description="Landing page" />);
    expect(document.title).toBe('SaaSify Enterprise Platform');
  });

  it('sets meta description, robots, and Open Graph tags', () => {
    render(
      <SEO
        title="Dashboard"
        description="Tenant metrics dashboard"
        robots="noindex, nofollow"
        keywords="tenant, metrics, saas"
      />
    );

    const descMeta = document.querySelector('meta[name="description"]');
    expect(descMeta).not.toBeNull();
    expect(descMeta.getAttribute('content')).toBe('Tenant metrics dashboard');

    const robotsMeta = document.querySelector('meta[name="robots"]');
    expect(robotsMeta).not.toBeNull();
    expect(robotsMeta.getAttribute('content')).toBe('noindex, nofollow');

    const ogTitle = document.querySelector('meta[property="og:title"]');
    expect(ogTitle).not.toBeNull();
    expect(ogTitle.getAttribute('content')).toBe('Dashboard | SaaSify');
  });

  it('injects and cleans up JSON-LD structured data on unmount', () => {
    const jsonLdData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Custom Page',
    };

    const { unmount } = render(
      <SEO
        title="Custom Page"
        description="Testing JSON-LD script injection"
        jsonLd={jsonLdData}
      />
    );

    let scriptTag = document.querySelector('script[data-dynamic-seo="true"]');
    expect(scriptTag).not.toBeNull();
    expect(JSON.parse(scriptTag.textContent)).toEqual(jsonLdData);

    unmount();
    scriptTag = document.querySelector('script[data-dynamic-seo="true"]');
    expect(scriptTag).toBeNull();
  });
});
