const body=document.body,btn=document.querySelector('.theme');function autoTheme(){const saved=(()=>{try{return localStorage.getItem('dn-theme')}catch(e){return null}})();if(saved){body.classList.toggle('dark',saved==='dark')}else{const h=new Date().getHours();body.classList.toggle('dark',h>=19||h<7)}sync()}function sync(){
 if(btn)btn.textContent=body.classList.contains('dark')?'☀ LIGHT':'◐ DARK';
 const meta=document.querySelector('meta[name="theme-color"]');
 if(meta)meta.content=body.classList.contains('dark')?'#080808':'#f4f1ea';
}btn?.addEventListener('click',()=>{body.classList.toggle('dark');(()=>{try{localStorage.setItem('dn-theme',body.classList.contains('dark')?'dark':'light')}catch(e){}})();sync()});autoTheme();document.querySelectorAll('[data-year]').forEach(x=>x.textContent=new Date().getFullYear());const f=document.querySelector('#contactForm');
if(f){
 const status=f.querySelector('.status'), submit=f.querySelector('button[type="submit"]');
 const cfg=window.DAYNIGHT_CONFIG||{};
 let turnstileWidget=null;
 const setupTurnstile=()=>{
  if(turnstileWidget!==null || !window.turnstile || !cfg.turnstileSiteKey)return;
  turnstileWidget=window.turnstile.render('#contactTurnstile',{sitekey:cfg.turnstileSiteKey,theme:'auto'});
 };
 const timer=setInterval(()=>{setupTurnstile();if(turnstileWidget!==null)clearInterval(timer)},250);
 setTimeout(()=>clearInterval(timer),15000);
 f.addEventListener('submit',async e=>{
  e.preventDefault();if(!f.reportValidity())return;
  if(!cfg.contactEndpoint || !cfg.turnstileSiteKey){status.textContent='Contact form is being configured. Please email management@daynightgroup.ro directly.';status.dataset.state='error';return;}
  setupTurnstile();
  const token=window.turnstile && turnstileWidget!==null ? window.turnstile.getResponse(turnstileWidget):'';
  if(!token){status.textContent='Please complete the verification before sending.';status.dataset.state='error';return;}
  const formData=new FormData(f);
  const payload={name:String(formData.get('name')||''),email:String(formData.get('email')||''),subject:String(formData.get('subject')||''),message:String(formData.get('message')||''),website:String(formData.get('website')||''),turnstileToken:token};
  submit.disabled=true;status.textContent='Sending your message…';status.dataset.state='pending';
  const controller=new AbortController();const requestTimer=setTimeout(()=>controller.abort(),12000);
  try{
   const res=await fetch(cfg.contactEndpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
   const data=await res.json().catch(()=>({}));
   if(!res.ok||!data.ok)throw new Error(data.error||'Could not send message.');
   f.reset();status.textContent='Message sent successfully. We will get back to you soon.';status.dataset.state='success';
  }catch(err){status.textContent=err?.name==='AbortError'?'The request timed out. Please try again or email management@daynightgroup.ro directly.':'Message not sent. Please try again or email management@daynightgroup.ro directly.';status.dataset.state='error';}
  finally{clearTimeout(requestTimer);submit.disabled=false;submit.removeAttribute('aria-busy');if(window.turnstile && turnstileWidget!==null)window.turnstile.reset(turnstileWidget);}
 });
}
/* DAY//NIGHT V9 experience */
document.addEventListener('DOMContentLoaded',()=>{
  // V21 — restrained scroll motion, reusable for static and dynamic content.
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollObserver=('IntersectionObserver' in window && !reduceMotion)?new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('v205-in','v9-visible');
        scrollObserver.unobserve(e.target);
      }
    });
  },{threshold:.10,rootMargin:'0px 0px -36px 0px'}):null;
  const applyScrollMotion=(scope=document)=>{
    const targets=scope.querySelectorAll('.card,.menu-grid a,.release-card-v111,.social-card-v15,.dynamic-track-card-v20,section>h2,section>h3,section>.lead,section>.kicker,.about-story>p,form');
    let i=0;
    targets.forEach(el=>{
      if(el.dataset.v205Scroll)return;
      el.dataset.v205Scroll='1';
      el.classList.add('v9-reveal','v205-scroll-reveal');
      if(i%3===1)el.classList.add('v205-scroll-left');
      else if(i%3===2)el.classList.add('v205-scroll-right');
      el.style.setProperty('--v205-delay',`${Math.min((i%5)*45,180)}ms`);
      if(scrollObserver)scrollObserver.observe(el);
      else el.classList.add('v205-in','v9-visible');
      i++;
    });
  };
  window.applyDayNightScrollMotion=applyScrollMotion;
  applyScrollMotion();

  // Depth/spotlight effect on cards; desktop only.
  if(matchMedia('(hover:hover) and (pointer:fine)').matches){
    document.querySelectorAll('.v9-depth-card').forEach(card=>{
      card.addEventListener('pointermove',e=>{
        const r=card.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
        const rx=((y/r.height)-.5)*-5, ry=((x/r.width)-.5)*6;
        card.style.setProperty('--mx',`${x}px`);card.style.setProperty('--my',`${y}px`);
        card.style.transform=`perspective(850px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-5px)`;
      });
      card.addEventListener('pointerleave',()=>card.style.transform='');
    });

    // Magnetic interaction, intentionally subtle.
    document.querySelectorAll('.menu-grid a,.theme,button').forEach(el=>{
      el.addEventListener('pointermove',e=>{
        const r=el.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)*.08,y=(e.clientY-r.top-r.height/2)*.10;
        el.style.transform=`translate(${x}px,${y}px)`;
      });
      el.addEventListener('pointerleave',()=>el.style.transform='');
    });
  }

  // V14: native internal navigation — no artificial transition delay.
});


/* V11 final enhancement guards */
(() => {
  document.querySelectorAll('a[target="_blank"]').forEach(a => {
    const rel = new Set((a.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
    rel.add('noopener'); rel.add('noreferrer');
    a.setAttribute('rel', [...rel].join(' '));
  });

  // Mark embeds loaded for subtle CSS-ready state without blocking playback.
  document.querySelectorAll('iframe').forEach(frame => {
    frame.addEventListener('load', () => frame.closest('section,div')?.classList.add('embed-ready-v11'), {once:true});
  });
})();


/* V13 performance */
(()=>{const frames=[...document.querySelectorAll('iframe[data-src]')];const load=f=>{if(!f||f.getAttribute('src')||!f.dataset.src)return;f.src=f.dataset.src;f.removeAttribute('data-src')};if('IntersectionObserver'in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){load(e.target);io.unobserve(e.target)}}),{rootMargin:'500px 0px',threshold:.01});frames.forEach(f=>io.observe(f))}else frames.forEach(load)})();

/* V14 instant navigation: warm the small static pages after first render. */
(()=>{
 const urls=[...document.querySelectorAll('a[href$=".html"]')]
   .map(a=>a.getAttribute('href')).filter(Boolean);
 const unique=[...new Set(urls)];
 const warm=()=>unique.forEach(href=>{
   if(href===location.pathname.split('/').pop())return;
   const l=document.createElement('link');l.rel='prefetch';l.href=href;l.as='document';document.head.appendChild(l);
 });
 if('requestIdleCallback'in window) requestIdleCallback(warm,{timeout:1200});
 else setTimeout(warm,350);
})();

/* V18 production guards */
(()=>{
  const themeButton=document.querySelector('.theme');
  const syncThemeA11y=()=>{
    if(!themeButton)return;
    const dark=document.body.classList.contains('dark');
    themeButton.setAttribute('aria-pressed',dark?'true':'false');
    themeButton.setAttribute('aria-label',dark?'Switch to light theme':'Switch to dark theme');
  };
  syncThemeA11y();
  themeButton?.addEventListener('click',()=>requestAnimationFrame(syncThemeA11y));

  // Prevent accidental double-submit even on very fast taps.
  const form=document.querySelector('#contactForm');
  form?.addEventListener('submit',()=>{
    const submit=form.querySelector('button[type="submit"]');
    if(submit)submit.setAttribute('aria-busy','true');
  });

  // Mark broken local images without causing layout collapse.
  document.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>img.classList.add('asset-error-v18'),{once:true}));
})();

/* V18.1 — playback-reactive presentation.
   For click-to-load YouTube releases, activation is tied directly to the user's PLAY action.
   Cross-origin third-party embeds cannot expose raw audio amplitude to the page, so this intentionally reacts to playback interaction rather than faking audio analysis. */
(()=>{
  let active=null, timer=null;
  const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const stop=()=>{
    document.body.classList.remove('playback-reactive');
    document.querySelectorAll('.reactive-player-shell.is-playing-reactive').forEach(el=>el.classList.remove('is-playing-reactive'));
    active=null;
    if(timer){clearTimeout(timer);timer=null;}
  };
  const start=(shell,duration=18000)=>{
    if(!shell||reduce)return;
    stop();
    active=shell;
    shell.classList.add('is-playing-reactive');
    document.body.classList.add('playback-reactive');
    timer=setTimeout(stop,duration);
  };

  document.addEventListener('click',e=>{
    const play=e.target.closest('[data-youtube-id]');
    if(play){
      const id=play.dataset.youtubeId;
      const holder=document.querySelector(`[data-video-holder="${id}"]`);
      if(holder) requestAnimationFrame(()=>start(holder,20000));
      return;
    }
    const shell=e.target.closest('.reactive-player-shell');
    if(shell && !e.target.closest('a')) start(shell,12000);
  },{passive:true});

  window.addEventListener('blur',stop);
  document.addEventListener('visibilitychange',()=>{ if(document.hidden) stop(); });
})();


/* V23 — single-source dynamic content + resilient admin/deploy control. */
(()=>{
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl=v=>{try{const u=new URL(String(v||''),location.href);return /^(https?:)$/.test(u.protocol)?u.href:'#'}catch{return'#'}};
  const safeAsset=v=>{try{const raw=String(v||'').trim();if(!raw)return'';const u=new URL(raw,location.href);return /^(https?:)$/.test(u.protocol)?u.href:''}catch{return''}};
  const activeSorted=a=>(Array.isArray(a)?a:[]).filter(x=>x&&x.active!==false).sort((x,y)=>(Number(x.order)||999)-(Number(y.order)||999));
  const ytId=value=>{try{const u=new URL(String(value||''));const host=u.hostname.toLowerCase().replace(/^www\./,'');if(host==='youtu.be')return u.pathname.split('/').filter(Boolean)[0]||'';if(host==='youtube.com'||host==='m.youtube.com'){if(u.pathname==='/watch')return u.searchParams.get('v')||'';const parts=u.pathname.split('/').filter(Boolean);if(['shorts','embed','live'].includes(parts[0]))return parts[1]||'';}return''}catch{return''}};
  const statusError=(mount,msg)=>{if(mount&&!mount.children.length){mount.removeAttribute('aria-busy');mount.innerHTML=`<p class="v20-content-error" role="status">${esc(msg)}</p>`}};
  const setBusy=(el,busy)=>{if(!el)return;if(busy)el.setAttribute('aria-busy','true');else el.removeAttribute('aria-busy')};
  const fetchJson=async(url,{timeout=7000,retries=1}={})=>{
    let last;
    for(let i=0;i<=retries;i++){
      const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeout);
      try{const r=await fetch(url,{cache:'no-store',signal:controller.signal,headers:{'Accept':'application/json'}});if(!r.ok)throw new Error(`${url}: HTTP ${r.status}`);return await r.json()}catch(e){last=e;if(i<retries)await new Promise(res=>setTimeout(res,250*(i+1)))}finally{clearTimeout(timer)}
    }
    throw last||new Error(`${url} unavailable`);
  };
  const wireBrokenImages=scope=>scope.querySelectorAll('img').forEach(img=>{if(img.dataset.v23ImageGuard)return;img.dataset.v23ImageGuard='1';img.addEventListener('error',()=>img.classList.add('asset-error-v18'),{once:true})});
  const wirePremium=scope=>{
    if(!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
    scope.querySelectorAll('.v9-depth-card').forEach(card=>{
      if(card.dataset.v23Depth)return;card.dataset.v23Depth='1';
      card.addEventListener('pointermove',e=>{if(card.classList.contains('artist-card-v173'))return;const r=card.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;const rx=((y/r.height)-.5)*-4,ry=((x/r.width)-.5)*5;card.style.setProperty('--mx',`${x}px`);card.style.setProperty('--my',`${y}px`);card.style.transform=`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`});
      card.addEventListener('pointerleave',()=>card.style.transform='');
    });
  };
  const releaseCard=(p,i,prefix='RELEASE')=>{
    const id=ytId(p.youtubeUrl||p.externalUrl||''), title=esc(p.title||'Untitled'), label=esc(p.label||'DAY//NIGHT'), credit=esc(p.credit||'Official project'), link=safeUrl(p.externalUrl||p.youtubeUrl||'');
    const artwork=safeAsset(p.artwork),poster=artwork||(id?`https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`:'');
    const play=id?`<button aria-label="Play ${title}" class="release-play-v111" data-youtube-id="${esc(id)}" type="button"><span aria-hidden="true">▶</span> PLAY HERE</button>`:'';
    const open=link!=='#'?`<a href="${esc(link)}" rel="noopener noreferrer" target="_blank">OPEN ↗</a>`:'';
    const video=id?`<div class="release-video-v111 reactive-player-shell" data-reactive-player="youtube" data-video-holder="${esc(id)}"><button aria-label="Play ${title}" class="release-poster-v111" data-youtube-id="${esc(id)}" type="button">${poster?`<img alt="Video thumbnail for ${title}" decoding="async" loading="lazy" src="${esc(poster)}"/>`:''}<span aria-hidden="true" class="release-poster-play-v111">▶</span><span class="release-poster-label-v111">PLAY VIDEO</span></button></div>`:'';
    return `<article class="release-card-v111 v9-depth-card"><div class="release-info-v111"><span class="release-number-v111">${prefix} ${String(i+1).padStart(2,'0')}&nbsp;&nbsp; ${label}</span><h3>${title}</h3><p class="release-by-v111">${credit}</p><div class="release-actions-v111">${play}${open}</div></div>${video}</article>`;
  };
  const wireYouTube=scope=>scope.querySelectorAll('[data-youtube-id]').forEach(btn=>{if(btn.dataset.v23Wired)return;btn.dataset.v23Wired='1';btn.addEventListener('click',()=>{
    const id=btn.dataset.youtubeId,card=btn.closest('.release-card-v111'),holder=card?.querySelector('[data-video-holder]');if(!id||!holder)return;
    holder.innerHTML=`<iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="eager" referrerpolicy="strict-origin-when-cross-origin" src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0" title="${esc(card?.querySelector('h3')?.textContent||'YouTube video')}"></iframe>`;
    holder.classList.add('is-playing-reactive');document.body.classList.add('playback-reactive');setTimeout(()=>document.body.classList.remove('playback-reactive'),6000);
    holder.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});
  })});

  const mounts=['artistCardsDynamic','socialAccountsDynamic','trackCardsDynamic','collabsDynamic','projectsDynamic'].map(id=>document.getElementById(id)).filter(Boolean);mounts.forEach(el=>setBusy(el,true));
  if(mounts.length){fetchJson('content.json',{timeout:7000,retries:1}).then(data=>{
    if(!data||typeof data!=='object')throw new Error('Invalid content structure');
    const brand=data.brand||{};
    const applySrc=(selector,value)=>{const src=safeAsset(value);if(!src)return;document.querySelectorAll(selector).forEach(el=>{el.src=src})};
    applySrc('.logo-day, .hero-logo-day',brand.dayLogo);applySrc('.logo-night, .hero-logo-night',brand.nightLogo);
    document.querySelectorAll('[data-brand-key]').forEach(el=>{const src=safeAsset(brand[el.dataset.brandKey]);if(src)el.src=src});
    document.querySelectorAll('[data-brand-tagline]').forEach(el=>{el.textContent=brand.tagline||data.site?.tagline||'THE PEOPLE BEHIND THE SOUND'});

    const artists=document.getElementById('artistCardsDynamic');if(artists){const arr=activeSorted(data.artists);artists.innerHTML=arr.map((a,i)=>{
      const social=activeSorted(a.socials).map(s=>{const href=safeUrl(s.url);return href==='#'?'':`<a aria-label="${esc(a.name)} on ${esc(s.platform)}" class="artist-pill-v173" href="${esc(href)}" rel="noopener noreferrer" target="_blank"><small>${esc(s.platform)}</small><strong>${esc(s.handle||a.name)}</strong><b aria-hidden="true">↗</b></a>`}).join('');
      const artistId=String(a.id||a.name||'artist').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');const day=safeAsset(a.logoDay),night=safeAsset(a.logoNight);
      return `<article class="card v9-depth-card artist-card-v173 artist-card-v20 artist-card-${esc(artistId)}"><span class="num">ARTIST ${esc(a.number||String(i+1).padStart(2,'0'))}</span><div aria-hidden="true" class="artist-brand-logo-v174 artist-brand-logo-${esc(artistId)}-v174">${day?`<img alt="" class="artist-logo-day-v174" decoding="async" loading="lazy" src="${esc(day)}"/>`:''}${night?`<img alt="" class="artist-logo-night-v174" decoding="async" loading="lazy" src="${esc(night)}"/>`:''}</div><div aria-hidden="true" class="artist-symbol">${esc(a.symbol||'')}</div><div class="artist-card-copy-v173"><h3>${esc(a.name||'Artist')}</h3><p class="artist-roles-v173">${esc(a.roles||'')}</p>${a.bio?`<p class="artist-bio-v20">${esc(a.bio)}</p>`:''}</div>${social?`<nav aria-label="${esc(a.name||'Artist')} social links" class="artist-burst-v173"><span aria-hidden="true" class="artist-at-v173">@</span>${social}</nav>`:''}</article>`;
    }).join('');setBusy(artists,false)}

    const socials=document.getElementById('socialAccountsDynamic');if(socials){socials.innerHTML=activeSorted(data.socialAccounts).map(s=>{const href=safeUrl(s.url);return href==='#'?'':`<a class="social-card-v15" href="${esc(href)}" rel="noopener noreferrer" target="_blank"><small>${esc(s.platform)} · ${esc(s.type||'PROFILE')}</small><strong>${esc(s.owner||s.platform)}</strong><span>${esc(s.handle||'OPEN')} · OPEN ↗</span></a>`}).join('');setBusy(socials,false)}

    const trackMount=document.getElementById('trackCardsDynamic'),tracks=activeSorted(data.tracks);if(trackMount){const section=document.getElementById('tracksDynamic');if(!tracks.length){section?.setAttribute('hidden','');trackMount.innerHTML=''}else{section?.removeAttribute('hidden');trackMount.innerHTML=tracks.map((t,i)=>{const href=safeUrl(t.url),art=safeAsset(t.artwork);return `<article class="dynamic-track-card-v192 dynamic-track-card-v20 v9-depth-card">${art?`<img alt="${esc(t.title||'Track')} artwork" loading="lazy" decoding="async" src="${esc(art)}"/>`:''}<div><div class="track-meta-v20"><span>TRACK ${String(i+1).padStart(2,'0')}</span><span>${esc(t.platform||'MUSIC')}</span>${t.releaseDate?`<time datetime="${esc(t.releaseDate)}">${esc(t.releaseDate)}</time>`:''}</div><h3>${esc(t.title||'Untitled')}</h3><p>${esc(t.artist||'DAY//NIGHT')}</p><div class="track-actions-v20">${href!=='#'?`<a href="${esc(href)}" rel="noopener noreferrer" target="_blank">PLAY / OPEN ↗</a>`:''}</div></div></article>`}).join('')}setBusy(trackMount,false)}

    const collabs=document.getElementById('collabsDynamic');if(collabs){collabs.innerHTML=activeSorted(data.collabs).map((p,i)=>releaseCard(p,i,'RELEASE')).join('');setBusy(collabs,false)}
    const projects=document.getElementById('projectsDynamic');if(projects){const arr=activeSorted(data.projects);if(!arr.length){projects.hidden=true;projects.innerHTML=''}else{projects.hidden=false;projects.innerHTML=`<div class="section-heading-v192"><span>PROJECTS</span><h2>MORE FROM DAY//NIGHT</h2></div>`+arr.map((p,i)=>releaseCard(p,i,'PROJECT')).join('')}setBusy(projects,false)}

    wireYouTube(document);wireBrokenImages(document);wirePremium(document);window.applyDayNightScrollMotion?.();document.dispatchEvent(new CustomEvent('daynight:content-ready',{detail:{version:data.schemaVersion||''}}));
  }).catch(err=>{
    console.error('[DAY//NIGHT] content load failed',err);
    statusError(document.getElementById('artistCardsDynamic'),'Content is temporarily unavailable.');statusError(document.getElementById('socialAccountsDynamic'),'Profiles are temporarily unavailable.');statusError(document.getElementById('collabsDynamic'),'Releases are temporarily unavailable.');statusError(document.getElementById('trackCardsDynamic'),'Tracks are temporarily unavailable.');mounts.forEach(el=>setBusy(el,false));
  })}

  // Admin handoff. GitHub owns authentication and authorization; no token is stored in this site.
  const repoInput=document.getElementById('repoUrl');if(repoInput){
    const cfg=window.DAYNIGHT_CONFIG||{},key='dn-github-repo',status=document.getElementById('deployStatus');
    try{repoInput.value=localStorage.getItem(key)||cfg.githubRepoUrl||''}catch{repoInput.value=cfg.githubRepoUrl||''}
    const norm=()=>{try{const u=new URL(repoInput.value.trim().replace(/\.git$/,'').replace(/\/$/,''));const parts=u.pathname.split('/').filter(Boolean);return u.protocol==='https:'&&u.hostname==='github.com'&&parts.length===2?`https://github.com/${parts[0]}/${parts[1]}`:''}catch{return''}};
    const requireRepo=()=>{const r=norm();if(!r){if(status)status.textContent='Save a valid GitHub repository URL first.';return''}try{localStorage.setItem(key,r)}catch{}return r};
    document.getElementById('saveRepo')?.addEventListener('click',()=>{const r=requireRepo();if(r){repoInput.value=r;if(status)status.textContent='Repository saved on this device.'}});
    document.querySelectorAll('[data-workflow]').forEach(button=>button.addEventListener('click',()=>{const r=requireRepo();if(r)window.open(`${r}/actions/workflows/${encodeURIComponent(button.dataset.workflow)}`,'_blank','noopener,noreferrer')}));
    document.getElementById('editContent')?.addEventListener('click',()=>{const r=requireRepo();if(r)window.open(`${r}/edit/main/content.json`,'_blank','noopener,noreferrer')});
    document.getElementById('deploySite')?.addEventListener('click',()=>{const r=requireRepo();if(r){window.open(`${r}/actions/workflows/deploy.yml`,'_blank','noopener,noreferrer');if(status)status.textContent='Deploy workflow opened. Press Run workflow in GitHub.'}});
    document.getElementById('openActions')?.addEventListener('click',()=>{const r=requireRepo();if(r)window.open(`${r}/actions`,'_blank','noopener,noreferrer')});
    document.getElementById('openAssets')?.addEventListener('click',()=>{const r=requireRepo();if(r)window.open(`${r}/tree/main/assets`,'_blank','noopener,noreferrer')});
  }

  // Diagnostics page — browser-side preflight without secrets.
  const diag=document.getElementById('diagnosticsResults');if(diag){
    const add=(label,state,detail='')=>{const row=document.createElement('li');row.className=`diag-row diag-${state}`;row.innerHTML=`<strong>${esc(label)}</strong><span>${state.toUpperCase()}</span>${detail?`<small>${esc(detail)}</small>`:''}`;diag.appendChild(row)};
    const run=async()=>{diag.innerHTML='';add('JavaScript runtime','pass',navigator.userAgent);add('Theme engine','pass',document.body.classList.contains('dark')?'dark':'light');
      try{const data=await fetchJson('content.json',{timeout:5000,retries:0});add('content.json','pass',`schema ${data.schemaVersion||'unknown'} · ${activeSorted(data.artists).length} artists · ${activeSorted(data.collabs).length} collabs`)}catch(e){add('content.json','fail',e.message)}
      const local=[...document.images].filter(img=>img.src.startsWith(location.origin));const broken=local.filter(img=>img.complete&&img.naturalWidth===0);add('Local images',broken.length?'fail':'pass',`${local.length-broken.length}/${local.length} loaded`);
      const cfg=window.DAYNIGHT_CONFIG||{};add('Contact endpoint',cfg.contactEndpoint?'pass':'warn',cfg.contactEndpoint||'Not configured yet');add('Turnstile public key',cfg.turnstileSiteKey?'pass':'warn',cfg.turnstileSiteKey?'Configured':'Not configured yet');
      if(cfg.contactEndpoint){try{const health=new URL(cfg.contactEndpoint);health.pathname=health.pathname.replace(/\/contact\/?$/,'/health');const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),5000);const r=await fetch(health,{signal:controller.signal,cache:'no-store'});clearTimeout(timer);const d=await r.json().catch(()=>({}));add('Contact Worker health',r.ok&&d.ok?'pass':'fail',r.ok?`version ${d.version||'unknown'}`:`HTTP ${r.status}`)}catch(e){add('Contact Worker health','fail',e.name==='AbortError'?'Timed out':e.message)}}
    };
    document.getElementById('runDiagnostics')?.addEventListener('click',run);run();
  }
})();
