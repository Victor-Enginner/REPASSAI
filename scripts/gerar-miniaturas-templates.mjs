import { chromium } from 'playwright';
import { readdir, readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
const catalog = path.resolve('backend/data/templates_store');
const output = path.resolve('public/template-thumbnails');
await mkdir(output,{recursive:true});
const browser = await chromium.launch({headless:true});
const allowed = new Set(['cdn.tailwindcss.com','images.unsplash.com','fonts.googleapis.com','fonts.gstatic.com','hoirqrkdgbmvpwutwuwj.supabase.co','api.iconify.design']);
try {
  for (const file of (await readdir(catalog)).filter(f=>f.endsWith('.json'))) {
    const meta=JSON.parse(await readFile(path.join(catalog,file),'utf8'));
    if(!/^[a-zA-Z0-9_-]+$/.test(meta.slug))continue;
    let html=await readFile(path.join(catalog,meta.slug+'.html'),'utf8');
    html=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/\son\w+\s*=\s*("[^"]*"|'[^']*')/gi,'');
    const context=await browser.newContext({viewport:{width:1280,height:820},serviceWorkers:'block'});
    await context.route('**/*',route=>{
      const u=new URL(route.request().url());
      return u.protocol==='https:'&&allowed.has(u.hostname)&&(!u.hostname.endsWith('supabase.co')||u.pathname.startsWith('/storage/v1/object/public/'))?route.continue():route.abort();
    });
    const page=await context.newPage();
    await page.setContent(html,{waitUntil:'domcontentloaded',timeout:15000});
    await page.addScriptTag({url:'https://cdn.tailwindcss.com'}).catch(()=>{});
    await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important} html,body{scroll-behavior:auto!important} [data-aos]{opacity:1!important;transform:none!important}'});
    await page.waitForTimeout(1800);
    await page.screenshot({path:path.join(output,meta.slug+'.jpg'),type:'jpeg',quality:70});
    await context.close();
    console.log('Miniatura:',meta.slug);
  }
}finally{await browser.close();}
