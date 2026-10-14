import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

export async function checkCommunityCuration({send,evaluate,waitFor,navigate,click,selectOption}) {
  const {resources}=JSON.parse(await readFile(new URL('../src/generated/catalog.json',import.meta.url),'utf8'));
  const communities=resources.filter(r=>r.type==='communities');
  const fulldev=communities.find(r=>r.slug==='fulldev');
  assert.deepEqual(fulldev.communityPlatforms,['whatsapp','discord','linkedin','website']);
  for(const platform of ['all',...fulldev.communityPlatforms]) {
    await navigate('/comunidades/?plataforma='+platform);
    await waitFor(`document.querySelector('main tbody tr td:first-child button')?.textContent === 'FullDev'`);
  }
  for(const audience of ['general','female','lgbt','male']) {
    await navigate('/comunidades/?publico='+audience);
    const expected=communities.filter(r=>r.communityAudience===audience);
    await waitFor(`document.querySelectorAll('main tbody tr').length === ${Math.min(20,expected.length)}`);
    const names=await evaluate(`[...document.querySelectorAll('main tbody tr td:first-child button')].map(button=>button.textContent)`);
    assert.ok(names.every(name=>expected.some(r=>r.name===name)));
    assert.equal(await evaluate(`new URLSearchParams(location.search).get('publico')`),audience);
  }
  const nationalWhatsApp = audience => communities.filter(r => r.communityAudience === audience && r.communityLocation?.scope === 'national' && r.communityPlatforms?.includes('whatsapp'));
  await navigate('/comunidades/?alcance=national&plataforma=whatsapp&publico=female');
  await waitFor(`document.querySelectorAll('main tbody tr').length === ${Math.min(20,nationalWhatsApp('female').length)}`);
  await selectOption('Público da comunidade','LGBT+');
  await waitFor(`document.querySelectorAll('main tbody tr').length === ${Math.min(20,nationalWhatsApp('lgbt').length)}`);
  for(const width of [320,390,768,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true,'Community filters overflow at '+width);
  }
  await navigate('/comunidades/?plataforma=whatsapp&publico=general');
  const listingUrl=await evaluate(`location.href`);
  assert.equal(await evaluate(`document.querySelector('main tbody tr').textContent.includes('Mais de 4.000 membros')`),true);
  await click(`document.querySelector('main tbody tr td:first-child button')`);
  await waitFor(`document.querySelector('[role="dialog"] h2')?.textContent==='FullDev'`);
  assert.equal(await evaluate(`location.href`),listingUrl);
  assert.equal(await evaluate(`document.querySelector('[role="dialog"]').textContent.includes('Mais de 4.000 membros') && document.querySelector('[role="dialog"]').textContent.includes('07/10/2026')`),true);
  for(const link of fulldev.communityLinks) {
    assert.equal(await evaluate(`!!document.querySelector('[role="dialog"] a[href='+CSS.escape(${JSON.stringify(link.url)})+'][target="_blank"]')`),true,link.platform);
  }
  for(const width of [320,390,768,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    assert.equal(await evaluate(`(()=>{const el=document.querySelector('[role="dialog"]');return el.scrollWidth<=el.clientWidth && document.documentElement.scrollWidth<=innerWidth})()`),true,'Community dialog overflow at '+width);
  }
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await waitFor(`!document.querySelector('[role="dialog"]')`);
  assert.equal(await evaluate(`location.href`),listingUrl);
  await click(`document.querySelector('button[aria-label="Ver detalhes: FullDev"]')`);
  await waitFor(`document.querySelector('[role="dialog"] h2')?.textContent==='FullDev'`);
  await click(`[...document.querySelectorAll('[role="dialog"] button')].find(button=>button.textContent==='Fechar')`);
  await waitFor(`!document.querySelector('[role="dialog"]')`);
  await waitFor(`document.activeElement?.getAttribute('aria-label')==='Ver detalhes: FullDev'`);
  console.log('Community curation OK: filters, FullDev priority, dialogs without navigation, platform links, closing/focus and mobile layout.');
}
