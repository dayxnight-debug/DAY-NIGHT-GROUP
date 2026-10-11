// DAY//NIGHT V23 — Cloudflare Worker contact API.
// Secrets belong in Cloudflare Worker secrets/variables, never in source control.
const JSON_HEADERS={
  'Content-Type':'application/json; charset=utf-8',
  'Cache-Control':'no-store',
  'X-Content-Type-Options':'nosniff',
  'Referrer-Policy':'no-referrer',
  'Permissions-Policy':'camera=(), microphone=(), geolocation=()'
};
const respond=(status,data,origin='',requestId='')=>new Response(
  JSON.stringify({...data,...(requestId?{requestId}:{})}),
  {status,headers:{...JSON_HEADERS,...(origin?{'Access-Control-Allow-Origin':origin,'Vary':'Origin'}:{})}}
);
const clean=v=>typeof v==='string'?v.trim():'';
const cleanHeader=v=>clean(v).replace(/[\r\n]+/g,' ').slice(0,160);
const validEmail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)&&v.length<=254;
const rateKey=ip=>`contact:${ip||'unknown'}`;
const allowedOrigin=(env,origin)=>{
  const allowed=(env.ALLOWED_ORIGINS||'').split(',').map(s=>s.trim()).filter(Boolean);
  return allowed.includes(origin)?origin:'';
};
const withTimeout=async(url,options={},ms=8000)=>{
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),ms);
  try{return await fetch(url,{...options,signal:controller.signal})}
  finally{clearTimeout(timer)}
};
const rateCheck=async(env,ip)=>{
  if(!env.RATE_KV)return true;
  const key=rateKey(ip), n=Number(await env.RATE_KV.get(key)||0);
  if(n>=5)return false;
  await env.RATE_KV.put(key,String(n+1),{expirationTtl:600});
  return true;
};
const configured=env=>Boolean(env.RESEND_API_KEY&&env.TURNSTILE_SECRET_KEY&&env.CONTACT_FROM&&env.CONTACT_TO);

export default {
  async fetch(request,env){
    const origin=request.headers.get('Origin')||'';
    const cors=allowedOrigin(env,origin);
    const requestId=crypto.randomUUID();
    const url=new URL(request.url);

    if(request.method==='GET'&&url.pathname==='/health'){
      return respond(200,{ok:true,service:'daynight-contact',version:'23.0.0',configured:configured(env)},cors,requestId);
    }
    if(url.pathname!=='/contact')return respond(404,{ok:false,error:'Not found'},cors,requestId);

    if(request.method==='OPTIONS'){
      if(!cors)return respond(403,{ok:false,error:'Origin not allowed'},'',requestId);
      return new Response(null,{status:204,headers:{
        'Access-Control-Allow-Origin':cors,
        'Access-Control-Allow-Methods':'POST, OPTIONS',
        'Access-Control-Allow-Headers':'Content-Type',
        'Access-Control-Max-Age':'86400',
        'Vary':'Origin'
      }});
    }
    if(request.method!=='POST')return respond(405,{ok:false,error:'Method not allowed'},cors,requestId);
    if(!cors)return respond(403,{ok:false,error:'Origin not allowed'},'',requestId);
    if(!configured(env))return respond(503,{ok:false,error:'Contact service not configured'},cors,requestId);

    const contentType=(request.headers.get('Content-Type')||'').toLowerCase();
    if(!contentType.includes('application/json'))return respond(415,{ok:false,error:'Content-Type must be application/json'},cors,requestId);

    const ip=request.headers.get('CF-Connecting-IP')||'';
    if(!(await rateCheck(env,ip)))return new Response(JSON.stringify({ok:false,error:'Too many requests. Try again later.',requestId}),{
      status:429,headers:{...JSON_HEADERS,'Access-Control-Allow-Origin':cors,'Vary':'Origin','Retry-After':'600'}
    });

    const size=Number(request.headers.get('Content-Length')||0);
    if(size>16000)return respond(413,{ok:false,error:'Message too large'},cors,requestId);

    let raw;
    try{raw=await request.text();if(raw.length>16000)return respond(413,{ok:false,error:'Message too large'},cors,requestId)}
    catch{return respond(400,{ok:false,error:'Invalid body'},cors,requestId)}

    let data;
    try{data=JSON.parse(raw)}catch{return respond(400,{ok:false,error:'Invalid JSON'},cors,requestId)}
    if(clean(data.website))return respond(200,{ok:true},cors,requestId); // honeypot: intentionally silent success

    const name=clean(data.name), email=clean(data.email), subject=cleanHeader(data.subject), message=clean(data.message), token=clean(data.turnstileToken);
    if(!name||name.length>120||!validEmail(email)||!subject||subject.length>160||message.length<10||message.length>5000||!token){
      return respond(400,{ok:false,error:'Invalid form fields'},cors,requestId);
    }

    let verification;
    try{
      const form=new FormData();
      form.set('secret',env.TURNSTILE_SECRET_KEY);
      form.set('response',token);
      if(ip)form.set('remoteip',ip);
      const response=await withTimeout('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:form},7000);
      verification=await response.json();
    }catch(err){
      return respond(502,{ok:false,error:err?.name==='AbortError'?'Verification timed out':'Verification unavailable'},cors,requestId);
    }
    if(!verification?.success)return respond(403,{ok:false,error:'Verification failed'},cors,requestId);

    const text=`DAY//NIGHT website inquiry\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nRequest ID: ${requestId}\n\n${message}`;
    let emailResponse;
    try{
      emailResponse=await withTimeout('https://api.resend.com/emails',{
        method:'POST',
        headers:{'Authorization':`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json'},
        body:JSON.stringify({from:env.CONTACT_FROM,to:[env.CONTACT_TO],reply_to:email,subject:`[DAY//NIGHT] ${subject}`,text})
      },8000);
    }catch(err){
      return respond(502,{ok:false,error:err?.name==='AbortError'?'Email delivery timed out':'Email service unavailable'},cors,requestId);
    }
    if(!emailResponse.ok)return respond(502,{ok:false,error:'Email delivery request failed'},cors,requestId);

    return respond(200,{ok:true},cors,requestId);
  }
};
