import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {validateImageUrl} from '../src/services/templateImages.js';
for(const url of ['http://example.com/a.jpg','javascript:alert(1)','https://user:pass@example.com/a','https://127.0.0.1/a','https://localhost/a','https://example.com/a?token=secret']) assert.throws(()=>validateImageUrl(url));
assert.equal(validateImageUrl('https://example.com/photo.jpg'),'https://example.com/photo.jpg');
const browser=await chromium.launch();
try{const page=await browser.newPage();await page.goto('http://127.0.0.1:4188');const result=await page.evaluate(async()=>{
 const {replaceTemplateImage}=await import('/src/services/templateImages.js');
 const html='<html><body><picture><source srcset="old.webp"><img class="hero-photo" width="800" src="old.jpg" onerror="attack()"></picture></body></html>';
 let rejected=false;try{replaceTemplateImage(html,0,{url:'https://example.com/new.jpg',alt:'Foto',authorized:false});}catch{rejected=true;}
 const document=new DOMParser().parseFromString(replaceTemplateImage(html,0,{url:'https://example.com/new.jpg',alt:'Foto <script>literal</script>',authorized:true}),'text/html');
 const image=document.querySelector('img');return {rejected,src:image.getAttribute('src'),alt:image.alt,width:image.getAttribute('width'),className:image.className,event:image.getAttribute('onerror'),source:document.querySelector('source').getAttribute('srcset')};
});assert.equal(result.rejected,true);assert.equal(result.src,'https://example.com/new.jpg');assert.equal(result.source,result.src);assert.equal(result.width,'800');assert.equal(result.className,'hero-photo');assert.equal(result.event,null);assert.equal(result.alt,'Foto <script>literal</script>');console.log('PASS: URL/consentimento validados; picture, dimensões e classe preservados; alt literal.');}finally{await browser.close();}
