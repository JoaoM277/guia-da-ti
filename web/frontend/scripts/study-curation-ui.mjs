import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
export async function checkStudyCuration({
  catalog,
  send,
  evaluate,
  waitFor,
  navigate,
  click,
}) {
  const groups = [
    ["platforms", "plataformas", 16],
    ["universities", "faculdades", 12],
    ["bootcamps", "bootcamps", 8],
    ["roadmaps", "roadmaps", 4],
    ["books", "livros", 12],
    ["certifications", "certificacoes", 12],
  ];
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  for (const [type, route, count] of groups) {
    assert.equal(
      catalog.resources.filter((r) => r.type === type && !r.demo).length,
      count,
    );
    await navigate("/" + route + "/");
    await waitFor(
      `!!document.querySelector('main [aria-label^="Cards:"]') && !document.querySelector('main [role="status"]')`,
    );
    const cards = await evaluate(
      `[...document.querySelectorAll('main [aria-label^="Cards:"] article')].map(a=>({name:a.querySelector('div a').textContent,href:a.querySelector('div a').getAttribute('href'),text:a.textContent}))`,
    );
    assert.ok(cards.length >= count && cards.length <= 20);
    assert.ok(cards.every((c) => c.href.startsWith("/" + route + "/")));
    const images = await evaluate(
      `Promise.all([...document.querySelectorAll('main [aria-label^="Cards:"] article')].filter(a=>!a.textContent.includes('Exemplo')).map(async a=>{const im=a.querySelector('img');if(!im)return false;try{await im.decode();return im.naturalWidth>0;}catch{return false;}}))`,
    );
    assert.equal(images.length, count);
    assert.ok(
      images.every(Boolean),
      "Every curated study resource has a working local image",
    );
    assert.equal(
      await evaluate(
        `[...document.querySelectorAll('main [aria-label^="Cards:"] article img')].every(im=>im.getBoundingClientRect().height<=im.parentElement.getBoundingClientRect().height+1)`,
      ),
      true,
      "Images fit inside their card without clipping",
    );
    if (
      process.env.STUDY_SCREENSHOT_PATH &&
      ["platforms", "books"].includes(type)
    ) {
      const screenshot = await send("Page.captureScreenshot", {
        format: "png",
      });
      await writeFile(
        process.env.STUDY_SCREENSHOT_PATH.replace(".png", `.${type}.png`),
        Buffer.from(screenshot.data, "base64"),
      );
    }
    assert.ok(
      cards.every(
        (c) => c.text.includes("Sem avaliações") && c.text.includes("0 hypes"),
      ),
      "Curation does not seed fictional popularity",
    );
    if (type === "platforms") {
      assert.equal(
        await evaluate(
          `getComputedStyle(document.querySelector('main article')).cursor`,
        ),
        "pointer",
      );
      await click(`document.querySelector('main article')`);
      await waitFor(
        `location.pathname.split('/').filter(Boolean).join('/') === ${JSON.stringify(cards[0].href.split("/").filter(Boolean).join("/"))}`,
      );
      await navigate("/plataformas/?visualizacao=lista");
      await waitFor(
        `!!document.querySelector('main [aria-label^="Lista:"] article')`,
      );
      assert.equal(
        await evaluate(
          `getComputedStyle(document.querySelector('main article')).cursor`,
        ),
        "pointer",
      );
      await click(`document.querySelector('main article')`);
      await waitFor(
        `location.pathname.split('/').filter(Boolean).join('/') === ${JSON.stringify(cards[0].href.split("/").filter(Boolean).join("/"))}`,
      );
    }
  }
  await evaluate(
    `sessionStorage.setItem('participationMode','member');sessionStorage.setItem('discussionTestMode','showcase')`,
  );
  await navigate("/plataformas/alura/");
  await waitFor(`!!document.querySelector('[aria-label="Apresentação do recurso"]') && !!document.querySelector('[aria-label="Avaliações"]')`);
  assert.equal(await evaluate(`document.querySelector('[aria-label="Apresentação do recurso"]').contains(document.querySelector('[aria-label="Avaliações"]'))`), false);
  assert.equal(await evaluate(`!!document.querySelector('[aria-label="Informações e links do recurso"] a[href^="https://www.alura.com.br/"]')`), true);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('[aria-label="Avaliações"]')).borderTopStyle`), 'solid');
  await waitFor(
    `document.querySelector('[aria-label="5 estrelas"]') && !document.querySelector('[aria-label="5 estrelas"]').disabled`,
  );
  await click(`document.querySelector('[aria-label="5 estrelas"]')`);
  await waitFor(
    `document.querySelector('[aria-label="5 estrelas"]').getAttribute('aria-checked')==='true'`,
  );
  assert.deepEqual(await evaluate(`window.lastStudyPublication`), {
    path: "/api/study/platforms/alura/vote",
    data: { rating: 5 },
    csrf: "test-csrf",
  });
  await click(
    `[...document.querySelectorAll('main button')].find(b=>b.textContent==='Dar hype')`,
  );
  await waitFor(
    `document.querySelector('main').textContent.includes('1 hypes') && [...document.querySelectorAll('main button')].some(b=>b.textContent==='Remover hype'&&!b.disabled)`,
  );
  await click(
    `[...document.querySelectorAll('main button')].find(b=>b.textContent==='Remover hype')`,
  );
  await waitFor(
    `document.querySelector('main').textContent.includes('0 hypes') && !document.querySelector('[aria-label="3 estrelas"]').disabled`,
  );
  await click(`document.querySelector('[aria-label="3 estrelas"]')`);
  await waitFor(
    `document.querySelector('[aria-label="3 estrelas"]').getAttribute('aria-checked')==='true' && !document.querySelector('main textarea').disabled`,
  );
  assert.equal(
    await evaluate(
      `document.querySelector('[aria-label="Avaliações e discussão"]').textContent.includes('3 (1)')`,
    ),
    true,
  );
  await evaluate(
    `(()=>{const el=document.querySelector('main textarea');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(el,'Uma experiência de estudo.');el.dispatchEvent(new Event('input',{bubbles:true}));})()`,
  );
  await click(`document.querySelector('main button[type="submit"]')`);
  await waitFor(
    `!!document.querySelector('main [aria-label="Conversa"]') && document.querySelector('main').textContent.includes('Comentário publicado no fórum')`,
  );
  assert.deepEqual(await evaluate(`window.lastStudyPublication`), {
    path: "/api/study/platforms/alura/comments",
    data: { body: "Uma experiência de estudo." },
    csrf: "test-csrf",
  });
  assert.equal(
    await evaluate(
      `document.querySelector('[aria-label="Avaliações e discussão"]').textContent.includes('1 comentários')`,
    ),
    true,
  );
  await evaluate(
    `sessionStorage.removeItem('participationMode');sessionStorage.removeItem('discussionTestMode')`,
  );
  console.log(
    "Study curation UI OK: all six categories, real routes, unseeded ratings, authenticated stars/hype and resource discussion integration.",
  );
}
