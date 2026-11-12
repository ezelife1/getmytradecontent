const settings=window.GMTC||{};
const safeStorage={getItem(k){try{return window.sessionStorage.getItem(k)}catch{return null}},setItem(k,v){try{window.sessionStorage.setItem(k,v)}catch{}}};
const $=s=>document.querySelector(s);
function notice(message){$('#dialog-copy').textContent=message;$('#setup-dialog').showModal()}
const samples={
 driveway:{title:'DRIVEWAY DUE A CLEAN?',caption:'The entrance to your home deserves a little attention too.\n\nWe clean block paving and driveways across [AREA], helping lift built-up dirt and freshen up your outdoor space.\n\nWant a quote? Send [BUSINESS NAME] a photo of your driveway and your postcode. We’ll talk you through the next steps.\n\n[PHONE / CONTACT LINK]'},
 gutters:{title:'GUTTERS NEED ATTENTION?',caption:'Noticed water spilling over the side of your gutters? Leaves and debris could be stopping it flowing freely.\n\n[BUSINESS NAME] offers gutter clearing across [AREA]. Message us with your postcode and a photo of the property for a quote.\n\n[PHONE / CONTACT LINK]'},
 review:{title:'GOOD WORK. KIND WORDS.',caption:'A thank you to our customers across [AREA].\n\n[INSERT A GENUINE CUSTOMER REVIEW HERE, WITH PERMISSION]\n\nIt means a lot when someone takes the time to recommend our work. If we’ve recently completed a job for you, we’d appreciate your feedback: [REVIEW LINK].\n\n[BUSINESS NAME]'}
};
let selected='driveway';
function sample(key){selected=key;const item=samples[key];if(!item)return;$('#sample-title').textContent=item.title;$('#sample-caption').textContent=item.caption;document.querySelectorAll('[data-sample]').forEach(b=>{let active=b.dataset.sample===key;b.classList.toggle('active',active);b.setAttribute('aria-selected',active)});$('#copy-status').textContent=''}
if($('#sample-caption')){sample(selected);document.querySelectorAll('[data-sample]').forEach(b=>b.addEventListener('click',()=>sample(b.dataset.sample)));$('#copy-caption').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(samples[selected].caption);$('#copy-status').textContent='Copied!'}catch{$('#copy-status').textContent='Select the caption text to copy it.'}})}
function checkout(type){if(!settings.launchReady){notice('The Stripe link is connected, but sales are paused while the finished pack and automated delivery are being set up. No payment has been taken.');return}const trade=$('#trade')?.value||safeStorage.getItem('gmtc-trade')||'exterior-cleaning';if(settings.enabledTrades&&!settings.enabledTrades.includes(trade)){notice('This trade edition is not available yet.');return}safeStorage.setItem('gmtc-trade',trade);location.href=type==='pack'?settings.packPaymentLink:settings.upgradePaymentLink}
$('#buy-pack')?.addEventListener('click',()=>checkout('pack'));$('#buy-upgrade')?.addEventListener('click',()=>checkout('upgrade'));
if($('#launch-status'))$('#launch-status').textContent=settings.launchReady?'Confirm your trade at checkout to receive the correct pack.':'Pre-launch: checkout opens when your pack and automated delivery are ready.';
if($('#delivery-status'))$('#delivery-status').textContent=settings.launchReady?'Please use the access link in your order email.':'Pre-launch: automated delivery is not connected yet. No downloadable pack is being issued from this page.';
$('#request-trade')?.addEventListener('click',()=>{if(settings.whatsapp){location.href='https://wa.me/'+settings.whatsapp.replace(/\D/g,'')+'?text='+encodeURIComponent('Hi, I’m interested in a GetMyTradeContent pack for my trade: ')}else notice('More trade editions are planned. Trade requests will open when the business contact channel is connected.')});
$('#brief-form')?.addEventListener('submit',async event=>{event.preventDefault();const status=$('#brief-status');if(!settings.briefEndpoint){const fields=Object.fromEntries(new FormData(event.target));const message='GetMyTradeContent — Make It Mine brief\n\n'+Object.entries(fields).map(([key,value])=>key.replaceAll('_',' ')+': '+value).join('\n');window.open('https://wa.me/'+settings.whatsapp+'?text='+encodeURIComponent(message),'_blank','noopener');status.textContent='Your brief opens in WhatsApp. Review it and press Send to submit.';return}const button=event.target.querySelector('button');button.disabled=true;try{const result=await fetch(settings.briefEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(event.target)))});if(!result.ok)throw Error();status.textContent='Your brief has been sent. We’ll check your order and contact you about the next steps.';event.target.reset()}catch{status.textContent='Your brief could not be sent. Please try again.'}finally{button.disabled=false}});
if(settings.phone&&settings.whatsapp){const contact=document.createElement('div');contact.className='floating-contact';contact.innerHTML=`<a href="tel:${settings.phone.replace(/[^+\d]/g,'')}">Call</a><a href="https://wa.me/${settings.whatsapp.replace(/\D/g,'')}" target="_blank" rel="noopener">WhatsApp</a>`;document.body.append(contact);const hero=$('#hero');if(hero)new IntersectionObserver(([entry])=>contact.classList.toggle('visible',!entry.isIntersecting&&entry.boundingClientRect.bottom<0)).observe(hero)}
const trades=window.GMTC_TRADES||[];
function selectTrade(slug){
 const trade=trades.find(t=>t.slug===slug);if(!trade)return;
 safeStorage.setItem('gmtc-trade',slug);
 if($('#trade'))$('#trade').value=slug;
 if($('#edition-label'))$('#edition-label').textContent=trade.name+' edition';
 if($('#sales-headline')){$('#sales-headline').replaceChildren(document.createTextNode('90 days of content.'),document.createElement('br'));const em=document.createElement('em');em.textContent='Made for '+trade.name.toLowerCase()+'.';$('#sales-headline').append(em)}
 if($('#sales-intro'))$('#sales-intro').textContent='39 ready-written posts, matching Canva designs and a 13-week plan for '+trade.name.toLowerCase()+'. Know what to post next—without starting from scratch.';
 const scriptURL=document.querySelector('script[src$="app.js"]').src;
 for(const img of document.images){
  const source=img.getAttribute('src');let kind=null;
  if(img.classList.contains('hero-art'))kind='hero';
  else if(source.includes('contents.webp'))kind='contents';
  else if(source.includes('branding.webp'))kind='branding';
  else if(img.closest('.sample-visual'))kind='hero';
  if(kind){img.src=new URL('assets/trades/'+slug+'/'+kind+'.webp',scriptURL).href;img.alt=trade.name+' — '+kind+' marketing artwork'}
 }
 const note=document.querySelector('.studio-caption span:last-child');if(note)note.textContent='Illustrative '+trade.name.toLowerCase()+' edition';
 if($('#example-intro'))$('#example-intro').textContent='Explore a sample for the '+trade.name+' Edition.';
 if($('#sample-title')){
  document.querySelectorAll('[data-sample]').forEach(b=>b.hidden=slug!=='exterior-cleaning');
  const visual=document.querySelector('.sample-visual');const image=visual.querySelector('img');image.style.display='';visual.style.background='';
  if(slug==='exterior-cleaning'){visual.querySelector('small').textContent='EXTERIOR CLEANING / SAMPLE DESIGN';sample('driveway')}
  else {$('#sample-title').textContent=trade.headline;$('#sample-caption').textContent=trade.caption+'\n\n[PHONE / CONTACT LINK]';visual.querySelector('small').textContent=trade.name.toUpperCase()+' / SAMPLE COPY';samples.trade={title:trade.headline,caption:trade.caption+'\n\n[PHONE / CONTACT LINK]'};selected='trade'}
 }
}
const pathTrade=location.pathname.split('/').find(part=>trades.some(t=>t.slug===part));
const queryTrade=new URLSearchParams(location.search).get('trade');const storedTrade=safeStorage.getItem('gmtc-trade');const initial=trades.some(t=>t.slug===pathTrade)?pathTrade:trades.some(t=>t.slug===queryTrade)?queryTrade:location.pathname.endsWith('make-it-mine.html')?storedTrade:null;if(initial)selectTrade(initial);
$('#trade')?.addEventListener('change',e=>selectTrade(e.target.value));
const mobilePurchase=$('#mobile-purchase');
if(mobilePurchase&&$('#hero'))new IntersectionObserver(([entry])=>mobilePurchase.classList.toggle('visible',!entry.isIntersecting&&entry.boundingClientRect.bottom<0)).observe($('#hero'));
function updatePhotoFields(){
 const choice=$('#photo-preference')?.value;
 const own=choice==='own'||choice==='mixed';
 if($('#job-photo-fields'))$('#job-photo-fields').hidden=!own;
 if($('#job-photos-link')){$('#job-photos-link').required=own;$('#job-photos-link').disabled=!own;}
}
$('#photo-preference')?.addEventListener('change',updatePhotoFields);
$('#brief-form')?.addEventListener('reset',()=>setTimeout(updatePhotoFields,0));
updatePhotoFields();
