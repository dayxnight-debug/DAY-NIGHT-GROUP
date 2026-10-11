#!/usr/bin/env python3
import asyncio, json, sys, os
from playwright.async_api import async_playwright
BASE='http://127.0.0.1:8765'
PAGES=['index.html','about.html','contact.html','artists.html','collabs.html','socials.html','privacy.html','404.html','admin.html','brand.html','diagnostics.html']
VIEWPORTS=[('mobile-320',320,700),('mobile-390',390,844),('mobile-430',430,932),('tablet',768,1024),('desktop',1440,1000)]
async def main():
    problems=[]; checks=0
    async with async_playwright() as p:
        kwargs={'headless':True,'args':['--no-sandbox']}
        if os.getenv('CHROMIUM_PATH'): kwargs['executable_path']=os.environ['CHROMIUM_PATH']
        browser=await p.chromium.launch(**kwargs)
        for vn,w,h in VIEWPORTS:
            ctx=await browser.new_context(viewport={'width':w,'height':h})
            page=await ctx.new_page()
            page.on('pageerror', lambda e: problems.append(f'PAGEERROR {vn}: {e}'))
            for name in PAGES:
                errs=[]
                def on_console(msg):
                    if msg.type=='error' and not any(x in msg.text for x in ['Failed to load resource','ERR_BLOCKED_BY_CLIENT']): errs.append(msg.text)
                page.on('console', on_console)
                await page.goto(f'{BASE}/{name}',wait_until='domcontentloaded',timeout=15000)
                await page.wait_for_timeout(900)
                data=await page.evaluate('''() => ({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,bw:document.body.scrollWidth,bcw:document.body.clientWidth,version:document.body.dataset.version})''')
                checks+=1
                if data['sw']>data['cw']+1 or data['bw']>data['bcw']+1: problems.append(f'OVERFLOW {vn} {name}: doc {data["sw"]}/{data["cw"]}, body {data["bw"]}/{data["bcw"]}')
                if data['version']!='23.0.0': problems.append(f'VERSION {vn} {name}: {data["version"]}')
                if errs: problems.extend(f'CONSOLE {vn} {name}: {e}' for e in errs)
                # Dark theme pass and logo visibility on artists.
                if name=='artists.html':
                    await page.evaluate("localStorage.setItem('dn-theme','dark'); location.reload()")
                    await page.wait_for_load_state('domcontentloaded'); await page.wait_for_timeout(700)
                    visible=await page.evaluate('''() => [...document.querySelectorAll('.artist-card-v173')].map(c=>({day:getComputedStyle(c.querySelector('.artist-logo-day-v174')).visibility,night:getComputedStyle(c.querySelector('.artist-logo-night-v174')).visibility}))''')
                    if visible and any(v['day']!='hidden' or v['night']=='hidden' for v in visible): problems.append(f'THEMELOGO {vn}: {visible}')
                    await page.evaluate("localStorage.removeItem('dn-theme')")
                page.remove_listener('console',on_console)
            await ctx.close()
        await browser.close()
    out={'checks':checks,'problems':problems,'ok':not problems}
    print(json.dumps(out,indent=2))
    return 1 if problems else 0
if __name__=='__main__': raise SystemExit(asyncio.run(main()))
