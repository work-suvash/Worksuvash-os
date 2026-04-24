/**
 * Website Registry
 *
 * Central registry of all fake websites available in Work OS Browser.
 * Add new websites here to make them accessible via the browser.
 */

import { Website } from './types';
import { BrowserHome } from './sites/BrowserHome';
import { TypeFlow } from './sites/TypeFlow';

/**
 * All registered websites
 */
export const websites: Website[] = [
  {
    id: 'browser-home',
    domain: 'browser://home',
    name: 'Home',
    description: 'Browser home page',
    category: 'other',
    security: 'secure',
    color: '#6366f1',
    component: BrowserHome,
    searchable: false,
    aliases: ['browser://welcome', 'browser://newtab', 'home'],
  },
  {
    id: 'typeflow',
    domain: 'typeflow.io',
    name: 'TypeFlow',
    description: 'Master the keyboard with bite-sized typing lessons.',
    category: 'other',
    security: 'secure',
    color: '#8b5cf6',
    component: TypeFlow,
    searchable: true,
    keywords: ['typing', 'keyboard', 'wpm', 'practice', 'lessons', 'typeflow'],
    aliases: ['www.typeflow.io'],
  },
];

/**
 * Website lookup functions
 */
export function getWebsiteByDomain(domain: string): Website | null {
  // Normalize domain (remove protocol, www, trailing slashes)
  const normalized = domain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .toLowerCase();

  // Check exact match
  let website = websites.find(
    (w) =>
      w.domain === normalized ||
      w.domain === `https://${normalized}` ||
      w.domain === `http://${normalized}`
  );

  // Check aliases
  if (!website) {
    website = websites.find((w) =>
      w.aliases?.some((alias) => alias === normalized || alias === `www.${normalized}`)
    );
  }

  return website || null;
}

export function searchWebsites(query: string): Website[] {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();

  return websites
    .filter((w) => w.searchable !== false)
    .filter(
      (w) =>
        w.name.toLowerCase().includes(lowerQuery) ||
        w.description.toLowerCase().includes(lowerQuery) ||
        w.domain.toLowerCase().includes(lowerQuery) ||
        w.keywords?.some((k) => k.toLowerCase().includes(lowerQuery))
    )
    .slice(0, 10); // Limit results
}

export function getWebsitesByCategory(category: string): Website[] {
  return websites.filter((w) => w.category === category);
}

export function getAllWebsites(): Website[] {
  return websites.filter((w) => w.searchable !== false);
}
