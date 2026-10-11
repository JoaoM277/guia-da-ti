import type { Resource } from './catalog';

export type SponsoredPlacement = 'creators' | 'studying' | 'networking' | 'communities';

// Add "type/slug" keys here to place catalog resources at the top of a list.
export const sponsoredResources: Record<SponsoredPlacement, readonly string[]> = {
  creators: [],
  studying: [],
  networking: [],
  communities: [],
};

export function isSponsored(resource: Resource, placement: SponsoredPlacement) {
  return sponsoredResources[placement].includes(`${resource.type}/${resource.slug}`);
}

export function pinSponsored(items: Resource[], placement: SponsoredPlacement) {
  const pinnedKeys = sponsoredResources[placement];
  const byKey = new Map(items.map(item => [`${item.type}/${item.slug}`, item]));
  const pinned = pinnedKeys.flatMap(key => {
    const item = byKey.get(key);
    return item ? [item] : [];
  });
  const pinnedSet = new Set(pinnedKeys);
  return [...pinned, ...items.filter(item => !pinnedSet.has(`${item.type}/${item.slug}`))];
}
