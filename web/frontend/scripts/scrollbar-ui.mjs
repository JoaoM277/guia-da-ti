import assert from 'node:assert/strict';

export async function checkScrollbarLayout({send,evaluate,waitFor,navigate,click,key}) {
  const geometry=`(()=>{const main=document.querySelector('main').getBoundingClientRect(),header=document.querySelector('.header-inner').getBoundingClientRect();return {left:main.left,width:main.width,headerLeft:header.left,headerWidth:header.width,scrolling:document.documentElement.scrollHeight>innerHeight}})()`;
  for(const width of [1440,390]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    await navigate('/criadores/');
    const long=await evaluate(geometry);
    assert.equal(long.scrolling,true,'Long route must need a scrollbar');
    await navigate('/eventos/');
    const short=await evaluate(geometry);
    assert.equal(short.scrolling,false,'Short route must not need a scrollbar');
    console.log('Scrollbar geometry:',JSON.stringify({width,long,short}));
    for(const property of ['left','width','headerLeft','headerWidth'])assert.ok(Math.abs(long[property]-short[property])<0.5,`Route shifted ${property}: ${JSON.stringify({long,short})}`);
    for(const route of ['/comunidades/','/comunidades/?publico=male']) {
      await navigate(route);
      const before=await evaluate(geometry);
      await click(`[...document.querySelectorAll('main button')].find(button=>button.textContent.includes('Filtrar comunidades'))`);
      await waitFor(`!!document.querySelector('[role="dialog"]')`);
      const during=await evaluate(geometry);
      for(const property of ['left','width','headerLeft','headerWidth'])assert.ok(Math.abs(before[property]-during[property])<0.5,`Dialog shifted ${property}: ${JSON.stringify({before,during})}`);
      await key('Escape');
      await waitFor(`!document.querySelector('[role="dialog"]')`);
      const after=await evaluate(geometry);
      assert.ok(Math.abs(before.width-after.width)<0.5 && Math.abs(before.left-after.left)<0.5,'Closing dialog shifted layout');
    }
  }
  await checkContributionSelectLayout({send,evaluate,waitFor,navigate,click,key});
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  console.log('Scrollbar layout OK: long/short routes and dialog scroll locks keep content aligned on desktop and mobile.');
}

export async function checkContributionSelectLayout({send,evaluate,waitFor,navigate,click,key}) {
  const geometry=`(()=>{const main=document.querySelector('main').getBoundingClientRect(),header=document.querySelector('.header-inner').getBoundingClientRect();return {left:main.left,width:main.width,headerLeft:header.left,headerWidth:header.width}})()`;
  for(const width of [1440,390]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    await evaluate(`sessionStorage.setItem('participationMode','member')`);
    await navigate('/criadores/');
    const beforeForm=await evaluate(geometry);
    const scrollbarWidth=await evaluate(`innerWidth-document.documentElement.clientWidth`);
    await evaluate(`window.dispatchEvent(new CustomEvent('guia:contribute',{detail:'universities'}))`);
    await waitFor(`!!document.querySelector('[data-contribution-form]')`);
    await click(`[...document.querySelectorAll('[data-contribution-form] button')].find(button=>button.textContent.trim()==='Continuar')`);
    const dialogGeometry=`(()=>{const rect=document.querySelector('[data-slot="dialog-content"]').getBoundingClientRect();return {left:rect.left,width:rect.width}})()`;
    const beforeSelect=await evaluate(dialogGeometry);
    for(let attempt=0;attempt<2;attempt++) {
      await click(`document.querySelector('[aria-label="Tipo de instituição"]')`);
      await waitFor(`!!document.querySelector('[role="listbox"]')`);
      assert.equal(await evaluate(`Number(document.body.dataset.scrollLocked)`),2,'Select must exercise a nested scroll lock');
      const duringSelect=await evaluate(dialogGeometry);
      for(const property of ['left','width'])assert.ok(Math.abs(beforeSelect[property]-duringSelect[property])<0.5,`Select shifted dialog ${property}`);
      assert.equal(await evaluate(`innerWidth-document.documentElement.clientWidth`),scrollbarWidth,'Select replaced the scrollbar with an empty gutter');
      const during=await evaluate(geometry);
      for(const property of ['left','width','headerLeft','headerWidth'])assert.ok(Math.abs(beforeForm[property]-during[property])<0.5,`Select shifted page ${property}`);
      const scrollY=await evaluate('window.scrollY');
      await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:5,y:100,deltaX:0,deltaY:400});
      assert.equal(await evaluate('window.scrollY'),scrollY,'Nested select allowed background scrolling');
      await key('Escape');
      await waitFor(`!document.querySelector('[role="listbox"]')`);
      assert.equal(await evaluate(`Number(document.body.dataset.scrollLocked)`),1,'Closing select must keep the dialog scroll lock');
    }
    await key('Escape');
    await waitFor(`!document.querySelector('[data-slot="dialog-content"]')`);
    await waitFor(`!document.body.hasAttribute('data-scroll-locked')`);
    await evaluate(`sessionStorage.removeItem('participationMode')`);
  }
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  console.log('Form select layout OK: nested scroll locks preserve scrollbar, page and dialog geometry on desktop and mobile.');
}
