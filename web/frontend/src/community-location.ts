import { communityAudiences, communityPlatforms, communityTabIds, primaryCommunityPlatforms } from './community-options.ts';
export type CommunityLocation = { scope: 'regional' | 'national' | 'international'; states?: string[] };
export type LocationSelection = { scope: CommunityLocation['scope'] | null; states: string[] };
export const brazilRegions = [
  { id: 'norte', name: 'Norte', states: ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'] },
  { id: 'nordeste', name: 'Nordeste', states: ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'] },
  { id: 'centro-oeste', name: 'Centro-Oeste', states: ['DF', 'GO', 'MT', 'MS'] },
  { id: 'sudeste', name: 'Sudeste', states: ['ES', 'MG', 'RJ', 'SP'] },
  { id: 'sul', name: 'Sul', states: ['PR', 'RS', 'SC'] },
];
export const stateCodes = brazilRegions.flatMap(region => region.states);
export function matchesCommunityLocation(location: CommunityLocation | undefined, selection: LocationSelection) {
  if (!selection.scope) return true;
  if (!location || location.scope !== selection.scope) return false;
  return location.scope !== 'regional' || !!location.states?.some(uf => selection.states.includes(uf));
}
export type CommunityFilters = LocationSelection & { platform: string; audience?: string };
export const emptyLocationSelection = (): LocationSelection => ({scope:null,states:[]});
export const emptyCommunityFilters = (): CommunityFilters => ({...emptyLocationSelection(),platform:'all',audience:'all'});
export function readCommunityFilters(search: string): CommunityFilters {
  const params=new URLSearchParams(search);
  const requested=params.get('plataforma') || (params.get('ninhos')||'').split(',')[0];
  const platform=communityTabIds.includes(requested)?requested:communityPlatforms.some(item=>item.id===requested)?'other':'all';
  const requestedAudience=params.get('publico');
  const audience=communityAudiences.some(item=>item.id===requestedAudience)?requestedAudience!:'all';
  return {...readLocationSelection(search),platform,audience};
}
export function matchesCommunityFilters(resource: {communityLocation?:CommunityLocation;communityPlatforms?:string[];communityAudience?:string}, filters:CommunityFilters) {
  return matchesCommunityLocation(resource.communityLocation,filters)
    && (!filters.audience || filters.audience==='all' || resource.communityAudience===filters.audience)
    && (filters.platform==='all'||!!resource.communityPlatforms?.some(id=>filters.platform==='other'?!primaryCommunityPlatforms.includes(id):id===filters.platform));
}
export function compareCommunities(a:{slug:string;name:string},b:{slug:string;name:string}) {
  return a.name.localeCompare(b.name,'pt-BR',{sensitivity:'base'});
}
export function toggleStates(selection: LocationSelection, states: string[]): LocationSelection {
  const selected = selection.scope === 'regional' ? selection.states : [];
  const all = states.every(uf => selected.includes(uf));
  const next = all ? selected.filter(uf => !states.includes(uf)) : [...new Set([...selected, ...states])];
  return { scope: next.length ? 'regional' : null, states: next.sort() };
}
export function readLocationSelection(search: string): LocationSelection {
  const params = new URLSearchParams(search);
  const scope = params.get('alcance');
  if (scope === 'national' || scope === 'international') return { scope, states: [] };
  const states = [...new Set((params.get('estados') || '').split(',').filter(uf => stateCodes.includes(uf)))].sort();
  return { scope: states.length ? 'regional' : null, states };
}
