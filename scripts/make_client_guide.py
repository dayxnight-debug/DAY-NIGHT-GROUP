from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, KeepTogether
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.units import mm
from pathlib import Path
OUT=Path(__file__).resolve().parents[1]/'CLIENT-LIVE-GUIDE.pdf'
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='Cover',parent=styles['Title'],fontName='Helvetica-Bold',fontSize=29,leading=32,spaceAfter=12,alignment=TA_CENTER,textColor=colors.HexColor('#111111')))
styles.add(ParagraphStyle(name='Sub',parent=styles['Normal'],fontName='Helvetica',fontSize=11,leading=16,alignment=TA_CENTER,textColor=colors.HexColor('#555555')))
styles.add(ParagraphStyle(name='H1x',parent=styles['Heading1'],fontName='Helvetica-Bold',fontSize=20,leading=24,spaceBefore=4,spaceAfter=10,textColor=colors.HexColor('#111111')))
styles.add(ParagraphStyle(name='H2x',parent=styles['Heading2'],fontName='Helvetica-Bold',fontSize=13,leading=17,spaceBefore=8,spaceAfter=5,textColor=colors.HexColor('#111111')))
styles.add(ParagraphStyle(name='Bodyx',parent=styles['BodyText'],fontName='Helvetica',fontSize=9.4,leading=14,spaceAfter=7,textColor=colors.HexColor('#252525')))
styles.add(ParagraphStyle(name='Smallx',parent=styles['BodyText'],fontName='Helvetica',fontSize=8,leading=11,textColor=colors.HexColor('#555555')))
styles.add(ParagraphStyle(name='Codex',parent=styles['Code'],fontName='Courier',fontSize=8,leading=11,backColor=colors.HexColor('#f2f2f2'),borderPadding=6,spaceBefore=4,spaceAfter=8))

def P(t,style='Bodyx'): return Paragraph(t,styles[style])
def bullets(items):
    out=[]
    for x in items: out.append(Paragraph('• '+x, ParagraphStyle(name='b'+str(len(out)),parent=styles['Bodyx'],leftIndent=10,firstLineIndent=-6,spaceAfter=4)))
    return out

def footer(canvas,doc):
    canvas.saveState();canvas.setFont('Helvetica',7);canvas.setFillColor(colors.HexColor('#777777'))
    canvas.drawString(18*mm,10*mm,'DAY//NIGHT Group - V23 client handoff')
    canvas.drawRightString(A4[0]-18*mm,10*mm,f'Page {doc.page}')
    canvas.restoreState()

doc=SimpleDocTemplate(str(OUT),pagesize=A4,rightMargin=18*mm,leftMargin=18*mm,topMargin=18*mm,bottomMargin=18*mm,title='DAY//NIGHT V23 Client Live Guide',author='Maxilu Studio')
story=[]
story += [Spacer(1,38*mm),P('DAY//NIGHT GROUP','Cover'),P('V23 - CLIENT LIVE, DEPLOYMENT & MAINTENANCE GUIDE','Sub'),Spacer(1,12*mm),P('Purpose: give the owner everything needed to publish, update and maintain the website without depending on the original supplier.','Sub'),Spacer(1,12*mm)]
t=Table([['Production domain','daynightgroup.ro'],['Static hosting','GitHub Pages'],['DNS / HTTPS','Cloudflare'],['Contact backend','Cloudflare Worker'],['Email delivery','Resend'],['Anti-spam','Cloudflare Turnstile'],['Content source','content.json']],colWidths=[48*mm,110*mm])
t.setStyle(TableStyle([('BACKGROUND',(0,0),(0,-1),colors.HexColor('#eeeeee')),('FONTNAME',(0,0),(-1,-1),'Helvetica'),('FONTNAME',(0,0),(0,-1),'Helvetica-Bold'),('FONTSIZE',(0,0),(-1,-1),9),('GRID',(0,0),(-1,-1),0.35,colors.HexColor('#cccccc')),('VALIGN',(0,0),(-1,-1),'TOP'),('PADDING',(0,0),(-1,-1),6)]));story+=[t,PageBreak()]

sections=[
('1. Before you start',["You need access to the GitHub repository that will contain the website.","You need access to the Cloudflare account that manages daynightgroup.ro.","For the contact form, create or use a Resend account and a Cloudflare Turnstile widget.","Never paste API keys or passwords inside HTML, app.js, site-config.js or content.json."]),
('2. Upload the website to GitHub',["Create a repository, preferably private while preparing the launch.","Upload the CONTENTS of the V23 folder to the repository root. index.html must be at repository root.","Confirm that .github/workflows/deploy.yml, assets/, backend/, content.json and CNAME are present.","Open repository Settings > Pages and set Source to GitHub Actions.","Open Actions and run the workflow named 'Deploy DAY//NIGHT V23 to GitHub Pages'."]),
('3. Connect daynightgroup.ro',["Keep the domain nameservers on Cloudflare.","In GitHub Settings > Pages, set the custom domain to daynightgroup.ro.","In Cloudflare DNS, create the records requested by GitHub Pages for the apex domain and www. Do not guess records if GitHub shows a different target.","Use one canonical address: https://daynightgroup.ro. Redirect www to the canonical domain if desired.","After DNS is valid, enable HTTPS in GitHub Pages and keep Cloudflare SSL/TLS enabled."]),
('4. Deploy the contact backend',["Open a terminal in the backend folder.","Install the Worker tooling with npm install.","Login to Cloudflare using npx wrangler login.","Create the required secrets: RESEND_API_KEY and TURNSTILE_SECRET_KEY.","Confirm CONTACT_TO, CONTACT_FROM and ALLOWED_ORIGINS in backend/wrangler.toml.","Deploy with npm run deploy and copy the Worker URL."],),
]
for title,items in sections:
    story += [P(title,'H1x')]+bullets(items)+[Spacer(1,3*mm)]
story += [P('Worker commands','H2x'),P('cd backend\nnpm install\nnpx wrangler login\nnpx wrangler secret put RESEND_API_KEY\nnpx wrangler secret put TURNSTILE_SECRET_KEY\nnpm run deploy','Codex'),PageBreak()]

story += [P('5. Connect the contact form','H1x')]
story += bullets(["Edit site-config.js. Set contactEndpoint to the deployed Worker URL ending in /contact.","Set turnstileSiteKey to the PUBLIC Turnstile site key. This is not a secret.","Do not put the Turnstile secret or Resend API key in site-config.js.","Deploy again, open contact.html and send a real test message.","Verify the message arrives at management@daynightgroup.ro and that Reply points to the visitor email."])
story += [P('Example public configuration','H2x'),P("window.DAYNIGHT_CONFIG = Object.freeze({<br/>  contactEndpoint: 'https://YOUR-WORKER.workers.dev/contact',<br/>  turnstileSiteKey: 'PUBLIC_SITE_KEY',<br/>  githubRepoUrl: 'https://github.com/OWNER/REPO'<br/>});",'Codex')]
story += [P('6. Use the Admin page','H1x')]+bullets(["Open /admin.html. This page is not indexed by search engines.","Save the GitHub repository URL once on the device.","Use Artists, Tracks, Social Accounts, Projects + Collabs or Brand workflows.","GitHub handles login and permissions. The website never stores a GitHub token.","After a workflow commits to main, the deployment workflow automatically publishes the update.","Use /diagnostics.html to run a public preflight check before and after changes."])+[PageBreak()]

story += [P('7. Add or edit content','H1x'),P('The public pages use content.json as the single source of truth. Do not manually duplicate the same data into multiple pages.','Bodyx')]
rows=[['Content','Where it appears','How to manage'],['Artists','Artists page','Manage artist workflow'],['Tracks','Socials / Latest Tracks','Manage track workflow'],['Social accounts','Socials page','Manage social workflow'],['Collabs','Collabs page','Manage project or collaboration workflow'],['Projects','Collabs / projects section','Manage project or collaboration workflow'],['Brand paths','Artist and brand identity','Manage brand identity workflow']]
t=Table(rows,colWidths=[36*mm,56*mm,66*mm],repeatRows=1)
t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#111111')),('TEXTCOLOR',(0,0),(-1,0),colors.white),('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'),('FONTNAME',(0,1),(-1,-1),'Helvetica'),('FONTSIZE',(0,0),(-1,-1),8.3),('GRID',(0,0),(-1,-1),0.35,colors.HexColor('#cccccc')),('VALIGN',(0,0),(-1,-1),'TOP'),('PADDING',(0,0),(-1,-1),5)]));story += [t,Spacer(1,4*mm)]
story += [P('Logo rule','H2x')]+bullets(["Light background: use the dark/black artist logo variant.","Dark background: use the light/white artist logo variant.","Do not remove the approved DAY//NIGHT, XERØ or MIDNIGHT files unless a replacement is intentionally approved.","The visible card border may be invisible, but hover and glow effects must remain clipped inside the component boundary."])
story += [P('8. Quality control after every edit','H1x')]+bullets(["Open Home, About, Contact, Artists, Collabs and Socials on mobile and desktop.","Switch Light/Dark on Artists and confirm every logo has correct contrast.","Check that no navigation item, title, logo, card, player or button is cut off.","On Collabs, scroll through every video and press Play.","On Socials, verify Spotify, YouTube and SoundCloud embeds can load.","Run /diagnostics.html. Fix FAIL results before handoff.","Open GitHub Actions and confirm the latest Deploy workflow is green."])+[PageBreak()]

story += [P('9. Google Search Console','H1x')]+bullets(["Add daynightgroup.ro as a Domain property in Google Search Console.","Complete the DNS verification using the TXT value supplied by Google.","Submit https://daynightgroup.ro/sitemap.xml.","Do not invent a Search Console verification token. Use only the token generated for the owner account.","robots.txt already points to the sitemap and keeps internal Admin/Brand/Diagnostics pages out of crawling."])
story += [P('10. Recovery / rollback','H1x')]+bullets(["If a content update is wrong, open GitHub > Commits, inspect the previous known-good commit and revert the bad commit.","Do not delete the repository history to fix a small content error.","Keep the delivered V23 ZIP as an offline recovery copy.","If the contact form fails but the static site works, visitors can still use the management email shown on Contact and in the footer."])
story += [P('11. Final launch checklist','H1x')]
check=["GitHub deploy is green","daynightgroup.ro resolves","HTTPS certificate is valid","www behavior is intentional","all five public navigation items fit on mobile","XERØ and MIDNIGHT logos switch correctly","all collaboration videos are visible","contact message arrives by email","diagnostics shows no FAIL","sitemap submitted to Google"]
story += bullets([f'[ ] {x}' for x in check])
story += [Spacer(1,8*mm),P('When all boxes pass, the site can be treated as production live. Future feature additions should be released as a new version, not by editing the delivery ZIP in place.','Bodyx')]

doc.build(story,onFirstPage=footer,onLaterPages=footer)
print(OUT)
