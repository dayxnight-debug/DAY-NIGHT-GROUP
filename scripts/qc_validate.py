#!/usr/bin/env python3
from __future__ import annotations
import json, re, sys, hashlib
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
ROOT=Path(__file__).resolve().parents[1]
REQUIRED=['index.html','about.html','contact.html','artists.html','collabs.html','socials.html','privacy.html','404.html','admin.html','brand.html','diagnostics.html','style.css','app.js','site-config.js','content.json','robots.txt','sitemap.xml','CNAME','.nojekyll','backend/src/index.js']
PUBLIC_PAGES=['index.html','about.html','contact.html','artists.html','collabs.html','socials.html','privacy.html','404.html']
class Scan(HTMLParser):
    def __init__(self): super().__init__(convert_charrefs=True); self.ids=[]; self.refs=[]; self.blank=[]; self.lang=''; self.main=False; self.title=False
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='html': self.lang=a.get('lang','')
        if tag=='main': self.main=True
        if tag=='title': self.title=True
        if 'id' in a:self.ids.append(a['id'])
        for k in ('href','src','data-src'):
            if a.get(k):self.refs.append((tag,k,a[k]))
        if tag=='a' and a.get('target')=='_blank': self.blank.append(a)

def local_path(ref:str):
    if not ref or ref.startswith(('#','mailto:','tel:','data:','javascript:')): return None
    u=urlparse(ref)
    if u.scheme or u.netloc:return None
    p=u.path.lstrip('/')
    if not p:return None
    return (ROOT/p)

def fail(msg,errors): errors.append(msg)
def main():
    errors=[]; warnings=[]; passes=[]
    for f in REQUIRED:
        if not (ROOT/f).exists(): fail(f'Missing required file: {f}',errors)
        else: passes.append(f'required:{f}')
    try:d=json.loads((ROOT/'content.json').read_text())
    except Exception as e: fail(f'content.json invalid: {e}',errors); d={}
    if d:
        if d.get('schemaVersion')!='23.0.0': fail('content.json schemaVersion must be 23.0.0',errors)
        for key in ('artists','socialAccounts','tracks','collabs','projects'):
            if not isinstance(d.get(key),list): fail(f'content.json {key} must be an array',errors)
        ids=[]
        for key in ('artists','socialAccounts','tracks','collabs','projects'):
            for item in d.get(key,[]):
                iid=item.get('id')
                if not iid: fail(f'{key}: item missing id',errors)
                ids.append((key,iid))
        dup={i for _,i in ids if sum(1 for _,j in ids if j==i)>1}
        if dup: warnings.append('IDs reused across sections: '+', '.join(sorted(dup)))
        brand=d.get('brand',{})
        for key in ('dayLogo','nightLogo','xeroLight','xeroDark','midnightLight','midnightDark'):
            v=brand.get(key)
            if not v: fail(f'Brand asset missing for {key}: {v}',errors)
            elif not urlparse(str(v)).scheme and not (ROOT/str(v)).exists(): fail(f'Brand asset missing for {key}: {v}',errors)
    for name in [p.name for p in ROOT.glob('*.html')]:
        text=(ROOT/name).read_text(errors='replace'); sc=Scan()
        try: sc.feed(text)
        except Exception as e: fail(f'{name}: HTML parser error: {e}',errors); continue
        if sc.lang!='en': fail(f'{name}: html lang must be en',errors)
        if not sc.main: fail(f'{name}: missing <main>',errors)
        if len(sc.ids)!=len(set(sc.ids)): fail(f'{name}: duplicate id(s)',errors)
        for tag,k,ref in sc.refs:
            lp=local_path(ref)
            if lp and not lp.exists(): fail(f'{name}: broken local {k}={ref}',errors)
        for a in sc.blank:
            rel=set((a.get('rel') or '').split())
            if not {'noopener','noreferrer'}<=rel: fail(f'{name}: target=_blank missing noopener noreferrer',errors)
        if name in PUBLIC_PAGES and 'data-version="23.0.0"' not in text and "data-version='23.0.0'" not in text: fail(f'{name}: data-version is not 23.0.0',errors)
        if 'style.css?v=23.0.0' not in text: fail(f'{name}: style.css cache version mismatch',errors)
        if 'app.js?v=23.0.0' not in text: fail(f'{name}: app.js cache version mismatch',errors)
    # Guard against known accidental crop patterns in V23 layer.
    css=(ROOT/'style.css').read_text(errors='replace') if (ROOT/'style.css').exists() else ''
    if 'overflow-x:hidden' not in css: fail('CSS lacks horizontal overflow guard',errors)
    if 'V23' not in css: fail('CSS lacks V23 final layer',errors)
    # Ensure deploy workflow exists and runs validator.
    dep=(ROOT/'.github/workflows/deploy.yml')
    if dep.exists():
        t=dep.read_text()
        if 'scripts/qc_validate.py' not in t: fail('deploy.yml does not run scripts/qc_validate.py',errors)
        if 'V23' not in t: fail('deploy.yml not labeled V23',errors)
    # checksums for human handoff
    files=[p for p in ROOT.rglob('*') if p.is_file() and p.name!='CHECKSUMS-SHA256.txt' and '_site' not in p.parts]
    lines=[]
    for p in sorted(files):
        h=hashlib.sha256(p.read_bytes()).hexdigest(); lines.append(f'{h}  {p.relative_to(ROOT)}')
    (ROOT/'CHECKSUMS-SHA256.txt').write_text('\n'.join(lines)+'\n')
    print(f'V23 QC: {len(passes)} base checks, {len(warnings)} warning(s), {len(errors)} error(s)')
    for w in warnings: print('WARN:',w)
    for e in errors: print('FAIL:',e)
    return 1 if errors else 0
if __name__=='__main__': raise SystemExit(main())
