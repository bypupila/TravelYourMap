from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.lib.colors import white
import os, textwrap

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'output', 'pdf', 'travelyourmap-creator-pitch-es-en.pdf')
ASSET = os.path.join(ROOT, 'tmp', 'pdfs', 'assets')
PUBLIC = os.path.join(ROOT, 'public', 'creators')

W, H = 13.333*72, 7.5*72
NAVY = HexColor('#070A0D'); PANEL = HexColor('#10161C'); PANEL2 = HexColor('#151C23')
CORAL = HexColor('#FF473B'); AMBER = HexColor('#FFB65A'); MIST = HexColor('#F5F2ED')
MUTED = HexColor('#AAB5BD'); LINE = HexColor('#27323A'); TEAL = HexColor('#6CD9CF')

for name, path in [('Inter', '/System/Library/Fonts/Supplemental/Arial.ttf'), ('InterBold', '/System/Library/Fonts/Supplemental/Arial Bold.ttf')]:
    if os.path.exists(path): pdfmetrics.registerFont(TTFont(name, path))
FONT='Inter'; BOLD='InterBold'

def fit_image(c, path, x, y, w, h, alpha=1.0, mode='cover'):
    img=ImageReader(path); iw, ih=img.getSize(); ratio=iw/ih
    target=w/h
    if mode=='cover':
        if ratio>target: dh=h; dw=h*ratio
        else: dw=w; dh=w/ratio
    else:
        if ratio>target: dw=w; dh=w/ratio
        else: dh=h; dw=h*ratio
    c.saveState()
    p=c.beginPath(); p.rect(x,y,w,h); c.clipPath(p, stroke=0, fill=0)
    c.setFillAlpha(alpha); c.drawImage(path, x+(w-dw)/2, y+(h-dh)/2, dw, dh, mask='auto'); c.restoreState()

def bg(c, num, lang):
    c.setFillColor(NAVY); c.rect(0,0,W,H,fill=1,stroke=0)
    c.setFillColor(HexColor('#0E151B')); c.circle(W*.90,H*.91,210,fill=1,stroke=0)
    c.setStrokeColor(CORAL); c.setLineWidth(1); c.line(46,H-38,120,H-38)
    c.setFillColor(MIST); c.setFont(BOLD,10); c.drawString(46,H-29,'TRAVEL YOUR MAP')
    c.setFillColor(MUTED); c.setFont(FONT,8); c.drawRightString(W-46,H-29, 'CREATOR PARTNERSHIP DECK  |  '+lang.upper())
    c.setFillColor(MUTED); c.setFont(FONT,8); c.drawString(46,24, 'travelyourmap.bypupila.com')
    c.drawRightString(W-46,24, f'{num:02d}  /  18')

def text(c, s, x, y, size=16, color=MIST, font=FONT, leading=None, width=None):
    c.setFillColor(color); c.setFont(font,size)
    if width:
        words=s.split(); lines=[]; line=''
        for word in words:
            n=(line+' '+word).strip()
            if stringWidth(n,font,size)<=width: line=n
            else: lines.append(line); line=word
        if line: lines.append(line)
    else: lines=s.split('\n')
    leading=leading or size*1.28
    for line in lines:
        c.drawString(x,y,line); y-=leading
    return y

def title(c, kicker, headline, sub=None):
    text(c,kicker.upper(),46,H-88,10,CORAL,BOLD)
    y=text(c,headline,46,H-126,29,MIST,BOLD,34,470)
    if sub: text(c,sub,46,y-8,12,MUTED,FONT,18,505)

def pill(c, label, x, y, color=CORAL):
    c.setFillColor(Color(color.red,color.green,color.blue,alpha=.15)); c.roundRect(x,y, stringWidth(label,BOLD,8)+20,22,11,fill=1,stroke=0)
    text(c,label,x+10,y+7,8,color,BOLD)

def card(c,x,y,w,h,head,body,accent=CORAL):
    c.setFillColor(PANEL); c.roundRect(x,y,w,h,12,fill=1,stroke=0)
    c.setFillColor(accent); c.roundRect(x+18,y+h-35,30,3,1.5,fill=1,stroke=0)
    text(c,head,x+18,y+h-59,14,MIST,BOLD)
    text(c,body,x+18,y+h-84,10,MUTED,FONT,15,w-36)

def cta(c, label, href, x, y, w=205):
    c.setFillColor(CORAL); c.roundRect(x,y,w,34,17,fill=1,stroke=0)
    text(c,label,x+16,y+11,9,white,BOLD)
    c.linkURL(href,(x,y,x+w,y+34),relative=0)

def map_dots(c,x,y,w,h):
    c.setFillColor(HexColor('#0D2428')); c.roundRect(x,y,w,h,18,fill=1,stroke=0)
    c.setStrokeColor(TEAL); c.setLineWidth(.6)
    for px,py,r in [(0.22,.64,10),(.41,.54,7),(.61,.67,12),(.73,.35,8),(.84,.58,6),(.52,.28,8)]:
        xx=x+w*px; yy=y+h*py; c.setFillColor(Color(1,.28,.23,alpha=.8)); c.circle(xx,yy,r,fill=1,stroke=0)
        c.setStrokeColor(Color(.42,.85,.81,alpha=.35)); c.circle(xx,yy,r*2.2,fill=0,stroke=1)
    text(c,'YOUR DESTINATIONS. ONE COMMERCIAL STORY.',x+25,y+24,9,MIST,BOLD)

def cover(c, lang, hero):
    fit_image(c,hero,0,0,W,H,.78); c.setFillColor(Color(0.02,.04,.05,alpha=.62)); c.rect(0,0,W,H,fill=1,stroke=0)
    c.setFillColor(CORAL); c.roundRect(54,H-105,132,24,12,fill=1,stroke=0); text(c,'CREATOR PARTNERSHIP',66,H-97,8,white,BOLD)
    headline = 'Tu canal ya cuenta historias.\nAhora puede abrir puertas.' if lang=='ES' else 'Your channel already tells stories.\nNow it can open doors.'
    text(c,headline,54,H-175,33,MIST,BOLD,40,490)
    sub = 'El media kit interactivo que convierte tus viajes de YouTube en una experiencia que fans y marcas quieren explorar.' if lang=='ES' else 'The interactive media kit that turns your YouTube travels into an experience fans and brands want to explore.'
    text(c,sub,54,H-275,13,MIST,FONT,19,445)
    cta(c, 'Crear mi mapa' if lang=='ES' else 'Create my map', 'https://travelyourmap.bypupila.com/onboarding?lang='+lang.lower(),54,80,184)
    text(c,'ESPAÑOL + ENGLISH  |  JULY 2026',54,52,8,MIST,BOLD)

def slide_problem(c,n,lang):
    bg(c,n,lang); title(c,'El problema' if lang=='ES' else 'The problem', 'Tu canal tiene alcance.\nTu propuesta comercial sigue dispersa.' if lang=='ES' else 'Your channel has reach.\nYour commercial story is still scattered.', 'Cada video, destino y prueba de experiencia vive en un lugar distinto.' if lang=='ES' else 'Every video, destination and proof of expertise lives somewhere else.')
    a=[('Links sueltos' if lang=='ES' else 'Scattered links','La marca tiene que hacer el trabajo.' if lang=='ES' else 'The brand has to do the work.'),('PDF estático' if lang=='ES' else 'Static PDF','No comunica tu universo en movimiento.' if lang=='ES' else 'It cannot show your world in motion.'),('Valor invisible' if lang=='ES' else 'Invisible value','Tu cobertura por destino no se ve.' if lang=='ES' else 'Your destination coverage stays unseen.')]
    for i,(h,b) in enumerate(a): card(c,46+i*286,120,258,150,h,b,[CORAL,AMBER,TEAL][i])

def slide_solution(c,n,lang):
    bg(c,n,lang); title(c,'La solución' if lang=='ES' else 'The solution', 'Un mapa que convierte\ntu biblioteca de viajes en una marca.' if lang=='ES' else 'One map that turns\nyour travel library into a brand.', 'Travel Your Map organiza los videos oficiales de YouTube por destino en una página pública lista para compartir.' if lang=='ES' else 'Travel Your Map organizes official YouTube videos by destination in a public page built to share.')
    map_dots(c,560,96,340,300)
    for i,(h,b) in enumerate([('IMPORTA' if lang=='ES' else 'IMPORT','Tu canal' if lang=='ES' else 'Your channel'),('MAPEA' if lang=='ES' else 'MAP','Tus destinos' if lang=='ES' else 'Your destinations'),('COMPARTE' if lang=='ES' else 'SHARE','Tu nueva historia comercial' if lang=='ES' else 'Your new commercial story')]):
        x=52+i*150; pill(c,str(i+1).zfill(2),x,130,TEAL); text(c,h,x,98,11,MIST,BOLD); text(c,b,x,76,9,MUTED,FONT,12,130)

def slide_value(c,n,lang):
    bg(c,n,lang); title(c,'Por qué convierte' if lang=='ES' else 'Why it converts', 'Menos explicación.\nMás evidencia.' if lang=='ES' else 'Less explaining.\nMore proof.', 'Haz que una marca entienda tu alcance en segundos, antes de abrir un spreadsheet.' if lang=='ES' else 'Let a brand understand your reach in seconds, before opening a spreadsheet.')
    vals=[('CREDIBILIDAD' if lang=='ES' else 'CREDIBILITY','Tus videos oficiales siguen siendo el centro.' if lang=='ES' else 'Your official videos remain at the center.'),('DESCUBRIMIENTO' if lang=='ES' else 'DISCOVERY','Fans y partners navegan por país, ciudad y ruta.' if lang=='ES' else 'Fans and partners browse by country, city and route.'),('INVENTARIO' if lang=='ES' else 'INVENTORY','Destinos y rutas se vuelven espacios patrocinables.' if lang=='ES' else 'Destinations and routes become sponsor-ready inventory.')]
    for i,(h,b) in enumerate(vals): card(c,46+i*286,105,258,180,h,b,[CORAL,TEAL,AMBER][i])

def slide_features(c,n,lang,product):
    bg(c,n,lang); title(c,'La experiencia' if lang=='ES' else 'The experience', 'Pensado para crecer\ncon tu audiencia y tus deals.' if lang=='ES' else 'Built to grow\nwith your audience and your deals.')
    fit_image(c,product,525,83,375,310,.98)
    arr=[('Mapa interactivo 3D' if lang=='ES' else 'Interactive 3D map','Videos organizados por destino.' if lang=='ES' else 'Videos organized by destination.'),('Embeds oficiales' if lang=='ES' else 'Official embeds','Sin perder views, ingresos ni control.' if lang=='ES' else 'No lost views, revenue or control.'),('Analytics por país' if lang=='ES' else 'Country analytics','Conoce qué despierta más interés.' if lang=='ES' else 'Know what creates the most interest.'),('Votaciones de fans' if lang=='ES' else 'Fan voting','Convierte curiosidad en conversación.' if lang=='ES' else 'Turn curiosity into conversation.')]
    for i,(h,b) in enumerate(arr):
        x=46+(i%2)*225; y=210-(i//2)*100; card(c,x,y,205,80,h,b,[CORAL,TEAL,AMBER,CORAL][i])

def slide_sponsors(c,n,lang,img):
    bg(c,n,lang); fit_image(c,img,505,74,410,355,.86)
    title(c,'Para sponsors' if lang=='ES' else 'For sponsors', 'Las marcas no compran\nsolo views. Compran destinos.' if lang=='ES' else 'Brands do not buy\nviews alone. They buy destinations.', 'Muestra contexto, afinidad y presencia geográfica sin armar un nuevo deck para cada conversación.' if lang=='ES' else 'Show context, fit and geographic presence without building a fresh deck for every conversation.')
    pill(c,'SPONSOR HUB',48,113,AMBER)
    text(c,'Activa sponsors por país, ciudad o ruta.' if lang=='ES' else 'Activate sponsors by country, city or route.',46,82,11,MIST,BOLD,360)

def slide_flow(c,n,lang):
    bg(c,n,lang); title(c,'El flujo' if lang=='ES' else 'The flow', 'De tu canal a una página\nlista para compartir.' if lang=='ES' else 'From your channel to a page\nready to share.')
    steps=[('1','Conecta tu canal' if lang=='ES' else 'Connect your channel'),('2','Detectamos destinos' if lang=='ES' else 'We detect destinations'),('3','Publica tu mapa' if lang=='ES' else 'Publish your map'),('4','Compártelo con marcas' if lang=='ES' else 'Share it with brands')]
    for i,(num,label) in enumerate(steps):
        x=65+i*215; c.setStrokeColor(CORAL if i<3 else TEAL); c.setLineWidth(2); 
        if i<3: c.line(x+58,210,x+184,210)
        c.setFillColor(PANEL2); c.circle(x,210,35,fill=1,stroke=0); text(c,num,x-7,204,16,CORAL,BOLD); text(c,label,x-42,143,11,MIST,BOLD,13,145)
    text(c,'Sin editar tus videos. Sin reemplazar YouTube.' if lang=='ES' else 'No re-editing your videos. No replacing YouTube.',46,82,12,MUTED,FONT)

def slide_pricing(c,n,lang):
    bg(c,n,lang); title(c,'Precios claros' if lang=='ES' else 'Clear pricing', 'Elige el punto de partida\nque acompaña tu ambición.' if lang=='ES' else 'Choose the starting point\nthat matches your ambition.')
    plans=[('FREE','$0', '1 canal · hasta 50 videos\nMapa público · importación básica' if lang=='ES' else '1 channel · up to 50 videos\nPublic map · basic import'),('CREATOR','$29 / mes' if lang=='ES' else '$29 / month','Videos ilimitados · 1 sponsor\nAnalytics básicos · branding limpio' if lang=='ES' else 'Unlimited videos · 1 sponsor\nBasic analytics · clean branding'),('CREATOR PRO','$79 / mes' if lang=='ES' else '$79 / month','Videos ilimitados · Sponsor Hub\nCompetitor analytics · sync prioritaria' if lang=='ES' else 'Unlimited videos · Sponsor Hub\nCompetitor analytics · priority sync'),('AGENCY','$199 / mes' if lang=='ES' else '$199 / month','Portafolio · API · portal de marcas\nSoporte dedicado' if lang=='ES' else 'Portfolio · API · brand portal\nDedicated support')]
    for i,(name,price,body) in enumerate(plans):
        x=37+i*225; featured=i==2; c.setFillColor(HexColor('#281412') if featured else PANEL); c.roundRect(x,115,205,220,13,fill=1,stroke=0)
        if featured: pill(c,'MÁS VENDIDO' if lang=='ES' else 'MOST POPULAR',x+47,320,CORAL)
        text(c,name,x+18,286,11,CORAL if featured else MIST,BOLD); text(c,price,x+18,248,21,MIST,BOLD); text(c,body,x+18,208,9,MUTED,FONT,14,170)
    text(c,'Anual: 20% de ahorro sobre la facturación mensual.' if lang=='ES' else 'Annual billing: save 20% versus monthly billing.',46,76,10,MUTED,FONT)

def slide_close(c,n,lang,hero):
    fit_image(c,hero,0,0,W,H,.54); c.setFillColor(Color(0.02,.04,.05,alpha=.70)); c.rect(0,0,W,H,fill=1,stroke=0)
    text(c,'TRAVEL YOUR MAP',54,H-75,11,CORAL,BOLD)
    h='Tu próximo gran deal\npodría empezar con un link.' if lang=='ES' else 'Your next great deal\ncould start with one link.'
    text(c,h,54,H-135,34,MIST,BOLD,40,510)
    sub='Crea un mapa que haga visible todo lo que tu canal ya construyó.' if lang=='ES' else 'Create a map that makes visible everything your channel has already built.'
    text(c,sub,54,H-240,13,MIST,FONT,18,450)
    cta(c,'Crear mi mapa' if lang=='ES' else 'Create my map','https://travelyourmap.bypupila.com/onboarding?lang='+lang.lower(),54,95,185)
    cta(c,'Ver precios' if lang=='ES' else 'View pricing','https://travelyourmap.bypupila.com/pricing',250,95,145)
    text(c,'travelyourmap.bypupila.com',54,62,10,MIST,BOLD)

def build():
    os.makedirs(os.path.dirname(OUT),exist_ok=True)
    c=canvas.Canvas(OUT,pagesize=(W,H),pageCompression=1)
    hero=os.path.join(ASSET,'hero-generated.png'); sponsors=os.path.join(ASSET,'sponsors-generated.png'); product=os.path.join(PUBLIC,'homepage-demo.png')
    for lang, offset in [('ES',0),('EN',9)]:
        cover(c,lang,hero); c.showPage()
        slide_problem(c,2+offset,lang); c.showPage()
        slide_solution(c,3+offset,lang); c.showPage()
        slide_value(c,4+offset,lang); c.showPage()
        slide_features(c,5+offset,lang,product); c.showPage()
        slide_sponsors(c,6+offset,lang,sponsors); c.showPage()
        slide_flow(c,7+offset,lang); c.showPage()
        slide_pricing(c,8+offset,lang); c.showPage()
        slide_close(c,9+offset,lang,hero); c.showPage()
    c.save()
    print(OUT)
if __name__=='__main__': build()
