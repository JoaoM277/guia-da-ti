import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchesCommunityLocation, matchesCommunityFilters, emptyCommunityFilters, readCommunityFilters, readLocationSelection, toggleStates, compareCommunities, brazilRegions, stateCodes } from '../src/community-location.ts';

test('regional selection matches any selected UF without leaking other scopes', () => {
  const selected={scope:'regional',states:['SP','RJ']};
  assert.equal(matchesCommunityLocation({scope:'regional',states:['RJ','MG']},selected),true);
  assert.equal(matchesCommunityLocation({scope:'regional',states:['AM']},selected),false);
  assert.equal(matchesCommunityLocation({scope:'national'},selected),false);
  assert.equal(matchesCommunityLocation({scope:'international'},selected),false);
  assert.equal(matchesCommunityLocation(undefined,selected),false);
});
test('national and international communities remain separate and no selection includes all results', () => {
  for(const scope of ['national','international']) {
    assert.equal(matchesCommunityLocation({scope}, {scope,states:[]}),true);
    assert.equal(matchesCommunityLocation({scope:scope==='national'?'international':'national'}, {scope,states:[]}),false);
    assert.equal(matchesCommunityLocation({scope}, {scope:null,states:[]}),true);
  }
});
test('Geral includes legacy communities and platform tabs combine with location',()=>{
  const resource={areas:['networking','carreira'],communityPlatforms:['discord','telegram'],communityModality:'hybrid',communityLocation:{scope:'regional',states:['SP']}};
  assert.equal(matchesCommunityFilters({areas:['frontend']},emptyCommunityFilters()),true);
  const filters={scope:'regional',states:['SP'],platform:'discord'};
  assert.equal(matchesCommunityFilters(resource,filters),true);
  for(const override of [{platform:'whatsapp'},{states:['RJ']}]) assert.equal(matchesCommunityFilters(resource,{...filters,...override}),false);
  assert.deepEqual(readCommunityFilters('?categorias=networking,unknown&ninhos=discord,unknown&modalidade=online'),{...emptyCommunityFilters(),platform:'discord'});
});
test('regions add all UFs, partial selections fill the region and toggling preserves other regions', () => {
  const southeast=brazilRegions.find(region=>region.id==='sudeste').states;
  let selected=toggleStates({scope:null,states:[]},['SP']);
  selected=toggleStates(selected,southeast);
  assert.deepEqual(selected.states,['ES','MG','RJ','SP']);
  selected=toggleStates(selected,['AM']);
  selected=toggleStates(selected,southeast);
  assert.deepEqual(selected,{scope:'regional',states:['AM']});
  assert.deepEqual(toggleStates(selected,['AM']),{scope:null,states:[]});
  assert.deepEqual(toggleStates({scope:'national',states:[]},['SP']),{scope:'regional',states:['SP']});
  assert.equal(new Set(stateCodes).size,27);
});
test('shared filter URLs restore valid states and reject unsupported values', () => {
  assert.deepEqual(readLocationSelection('?alcance=regional&estados=SP,RJ,XX,SP'),{scope:'regional',states:['RJ','SP']});
  assert.deepEqual(readLocationSelection('?alcance=international&estados=SP'),{scope:'international',states:[]});
  assert.deepEqual(readLocationSelection('?alcance=invalid&estados=XX'),{scope:null,states:[]});
});

test('Outra groups the remaining platforms without inventing a platform for legacy records',()=>{
 const other={...emptyCommunityFilters(),platform:'other'};
 for(const id of ['slack','meetup','discourse','circle','mighty-networks','other']) assert.equal(matchesCommunityFilters({communityPlatforms:[id]},other),true);
 for(const id of ['whatsapp','telegram','discord','facebook','linkedin','reddit','github','website']) assert.equal(matchesCommunityFilters({communityPlatforms:[id]},other),false);
 assert.equal(matchesCommunityFilters({},other),false);
 assert.deepEqual(readCommunityFilters('?plataforma=slack'),other);
 assert.deepEqual(readCommunityFilters('?plataforma=unknown'),emptyCommunityFilters());
 assert.deepEqual(readCommunityFilters('?plataforma=discord&alcance=regional&estados=SP'),{scope:'regional',states:['SP'],platform:'discord',audience:'all'});
});

test('audience combines with any registered platform and location without guessing legacy audiences',()=>{
 const r={communityAudience:'female',communityPlatforms:['whatsapp','discord','website'],communityLocation:{scope:'national'}};
 for(const platform of ['whatsapp','discord','website'])assert.equal(matchesCommunityFilters(r,{...emptyCommunityFilters(),platform,audience:'female',scope:'national'}),true);
 assert.equal(matchesCommunityFilters(r,{...emptyCommunityFilters(),audience:'male'}),false);
 assert.equal(matchesCommunityFilters({}, {...emptyCommunityFilters(),audience:'general'}),false);
 assert.deepEqual(readCommunityFilters('?publico=lgbt&plataforma=website'),{...emptyCommunityFilters(),audience:'lgbt',platform:'website'});
 assert.deepEqual(readCommunityFilters('?publico=invalid'),emptyCommunityFilters());
 const ordered=[{slug:'z',name:'Zeta'},{slug:'a',name:'Alfa'},{slug:'fulldev',name:'FullDev'}].sort(compareCommunities);
 assert.deepEqual(ordered.map(r=>r.slug),['a','fulldev','z']);
});
