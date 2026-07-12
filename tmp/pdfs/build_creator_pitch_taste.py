from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.colors import HexColor, Color, white
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import registerFont
from reportlab.pdfbase.ttfonts import TTFont
import os, math

ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
OUT=os.path.join(ROOT,'output','pdf','travelyourmap-creator-pitch-taste-es-en.pdf')
AS=os.path.join(ROOT,'tmp','pdfs','assets'); PUB=os.path.join(ROOT,'public','creators')
W,H=960,540
INK=HexColor('#111719'); PAPER=HexColor('#F4F1EB'); SMOKE=HexColor('#CFCBC3'); MUTED=HexColor('#827E77'); LINE=HexColor('#D8D3CB'); ACCENT=HexColor('#D85B4D')
try:
    registerFont(TTFont('Avenir','/System/Library/Fonts/Supplemental/Arial.ttf')); registerFont(TTFont('AvenirBold','/System/Library/Fonts/Supplemental/Arial Bold.ttf'))
    F,FB='Avenir','AvenirBold'
except: F,FB='Helvetica','Helvetica-Bold'

def wrap(s,font,size,width):
    o=[]; line=''
    for w in s.split():
        new=(line+' '+w).strip()
        if stringWidth(new,font,size)<=width: line=new
        else: o.append(line); line=w
    return o+[line] if line else o
def tx(c,s,x,y,size=12,col=INK,font=F,width=None,lead=None):
    c.setFont(font,size); c.setFillColor(col); lead=lead or size*1.25
    for line in wrap(s,font,size,width) if width else s.split('\n'):
        c.drawString(x,y,line); y-=lead
    return y
def img(c,p,x,y,w,h,cover=True,alpha=1):
    im=ImageReader(p); iw,ih=im.getSize(); r=iw/ih; target=w/h
    if cover:
        dw,dh=(h*r,h) if r>target else (w,w/r)
    else: dw,dh=(w,w/r) if r>target else (h*r,h)
    c.saveState(); q=c.beginPath(); q.rect(x,y,w,h); c.clipPath(q,0,0); c.setFillAlpha(alpha); c.drawImage(p,x+(w-dw)/2,y+(h-dh)/2,dw,dh,mask='auto'); c.restoreState()
def rule(c,x,y,w,col=LINE): c.setStrokeColor(col); c.setLineWidth(.8); c.line(x,y,x+w,y)
def page(c,n,lang):
    c.setFillColor(PAPER); c.rect(0,0,W,H,0,1)
    c.setFillColor(INK); c.rect(0,H-22,W,22,0,1)
    tx(c,'TRAVEL YOUR MAP',32,H-15,7,PAPER,FB); tx(c,lang, W-68,H-15,7,SMOKE,FB)
    tx(c,'travelyourmap.bypupila.com',32,20,7,MUTED,FB); tx(c,f'{n:02d} / 18',W-70,20,7,MUTED,FB)
def kicker(c,label):
    tx(c,label.upper(),54,448,8,ACCENT,FB); rule(c,54,432,68,ACCENT)
def head(c,s,x=54,y=396,width=470): return tx(c,s,x,y,31,INK,FB,width,34)
def button(c,label,url,x,y,w=164):
    c.setFillColor(ACCENT); c.roundRect(x,y,w,32,16,0,1); tx(c,label,x+16,y+11,8,PAPER,FB); c.linkURL(url,(x,y,x+w,y+32),relative=0)
def simple_map(c,x,y,w,h):
    c.setFillColor(INK); c.roundRect(x,y,w,h,22,0,1)
    c.setStrokeColor(Color(.95,.94,.91,alpha=.22)); c.setLineWidth(.6)
    for i in range(7): c.arc(x+20+i*41,y+28,x+120+i*41,y+h-28,35,110)
    pts=[(.18,.63),(.38,.43),(.51,.72),(.67,.31),(.79,.58),(.88,.39)]
    for k,(a,b) in enumerate(pts):
        xx=x+w*a; yy=y+h*b; c.setFillColor(ACCENT); c.circle(xx,yy,5 if k!=2 else 7,0,1); c.setStrokeColor(Color(1,1,1,alpha=.35)); c.circle(xx,yy,13,0,1)
    tx(c,'A public map that makes your footprint visible.',x+22,y+25,8,PAPER,FB)
def cover(c,lang,hero):
    c.setFillColor(INK); c.rect(0,0,W,H,0,1); img(c,hero,430,0,530,H,True,.9)
    c.setFillColor(Color(.067,.09,.1,alpha=.92)); c.rect(0,0,525,H,0,1)
    c.setFillColor(Color(.067,.09,.1,alpha=.4)); c.rect(390,0,140,H,0,1)
    tx(c,'TRAVEL YOUR MAP',52,470,9,PAPER,FB); rule(c,52,452,55,ACCENT)
    h='Tu canal ya cuenta historias.\nAhora puede abrir puertas.' if lang=='ES' else 'Your channel already tells stories.\nNow it can open doors.'
    tx(c,h,52,395,32,PAPER,FB,420,38)
    p='Un media kit interactivo para que tus videos, destinos y valor comercial trabajen juntos.' if lang=='ES' else 'An interactive media kit so your videos, destinations and commercial value work together.'
    tx(c,p,52,285,13,SMOKE,F,355,18)
    button(c,'Crear mi mapa' if lang=='ES' else 'Create my map','https://travelyourmap.bypupila.com/onboarding?lang='+lang.lower(),52,86)
    tx(c,'CREATOR PARTNERSHIP DECK  /  2026',52,56,7,SMOKE,FB)
def split_problem(c,n,lang):
    page(c,n,lang); kicker(c,'El punto de fricción' if lang=='ES' else 'The friction point')
    head(c,'Tu audiencia ve viajes.\nUna marca ve links dispersos.' if lang=='ES' else 'Your audience sees travel.\nA brand sees scattered links.')
    p='Tu canal ya contiene prueba de experiencia. El desafío es hacerla entendible en una sola visita.' if lang=='ES' else 'Your channel already contains proof of expertise. The challenge is making it clear in one visit.'
    tx(c,p,54,286,13,MUTED,F,380,19)
    x=555; rule(c,x,390,315,INK)
    rows=[('PDF estático' if lang=='ES' else 'Static PDF','no muestra una biblioteca que cambia.' if lang=='ES' else 'cannot show a library in motion.'),('Links sueltos' if lang=='ES' else 'Scattered links','obligan a la marca a buscar.' if lang=='ES' else 'make a brand do the searching.'),('Cobertura invisible' if lang=='ES' else 'Invisible footprint','no convierte destinos en oportunidad.' if lang=='ES' else 'does not turn destinations into opportunity.')]
    for i,(a,b) in enumerate(rows):
        y=350-i*80; tx(c,f'0{i+1}',x,y,9,ACCENT,FB); tx(c,a,x+42,y,13,INK,FB); tx(c,b,x+42,y-20,10,MUTED,F); rule(c,x,y-36,315)
def solution(c,n,lang):
    page(c,n,lang); kicker(c,'La respuesta' if lang=='ES' else 'The answer')
    head(c,'Un mapa público\npara una historia que ya existe.' if lang=='ES' else 'A public map\nfor a story that already exists.',54,396,390)
    tx(c,'Importa tu canal, ordena videos por lugar y comparte una página que se explica sola.',54,284,13,MUTED,F,370,19) if lang=='ES' else tx(c,'Import your channel, organize videos by place and share a page that explains itself.',54,284,13,MUTED,F,370,19)
    simple_map(c,492,108,390,302)
    tx(c,'01  IMPORTA    02  MAPEA    03  COMPARTE',492,78,8,INK,FB)
def proof(c,n,lang,product):
    page(c,n,lang); kicker(c,'La experiencia' if lang=='ES' else 'The experience')
    head(c,'No agregas otra capa.\nHaces visible la que ya construiste.' if lang=='ES' else 'You do not add another layer.\nYou make the one you built visible.',54,396,455)
    img(c,product,556,89,330,310,True,.98); c.setStrokeColor(INK); c.setLineWidth(1); c.rect(556,89,330,310,0,1)
    p='Videos oficiales de YouTube. Página pública. Destinos navegables. Todo parte de tu contenido.' if lang=='ES' else 'Official YouTube videos. A public page. Browseable destinations. All built from your content.'
    tx(c,p,54,258,13,MUTED,F,390,19)
    rule(c,54,140,390,INK); tx(c,'YouTube remains the source of truth.',54,112,9,INK,FB)
def capabilities(c,n,lang):
    page(c,n,lang); kicker(c,'Qué cambia' if lang=='ES' else 'What changes')
    head(c,'Una página que funciona\npara tres conversaciones.' if lang=='ES' else 'One page that works\nfor three conversations.',54,396,430)
    data=[('FANS' if lang=='ES' else 'FANS','Encuentran el próximo viaje que quieren ver.' if lang=='ES' else 'Find the next trip they want to watch.'),('MARCAS' if lang=='ES' else 'BRANDS','Entienden tu presencia por destino.' if lang=='ES' else 'Understand your presence by destination.'),('EQUIPO' if lang=='ES' else 'YOUR TEAM','Ve qué países y videos mueven interés.' if lang=='ES' else 'See what countries and videos drive interest.')]
    x=516
    for i,(a,b) in enumerate(data):
        y=370-i*105; tx(c,f'0{i+1}',x,y,10,ACCENT,FB); tx(c,a,x+55,y,12,INK,FB); tx(c,b,x+55,y-21,11,MUTED,F,285,15); rule(c,x,y-43,335)
def sponsor(c,n,lang,photo):
    page(c,n,lang); img(c,photo,0,0,472,H,True,.93); c.setFillColor(Color(.07,.09,.1,alpha=.16)); c.rect(0,0,472,H,0,1)
    kicker(c,'Sponsor hub' if lang=='ES' else 'Sponsor hub'); head(c,'Las marcas no compran solo views.\nCompran contexto.' if lang=='ES' else 'Brands do not buy views alone.\nThey buy context.',510,396,375)
    p='Activa sponsors por país, ciudad o ruta. Tu mapa puede mostrar dónde una colaboración tiene sentido.' if lang=='ES' else 'Activate sponsors by country, city or route. Your map can show where a collaboration makes sense.'
    tx(c,p,510,274,13,MUTED,F,355,19); rule(c,510,160,340,INK)
    tx(c,'DESTINATION  /  STORY  /  PARTNER FIT',510,131,8,ACCENT,FB)
def process(c,n,lang):
    page(c,n,lang); kicker(c,'Del canal al link' if lang=='ES' else 'From channel to link')
    head(c,'Un proceso corto.\nUna salida que cambia la conversación.' if lang=='ES' else 'A short process.\nAn outcome that changes the conversation.',54,396,445)
    steps=[('01','Conecta tu canal' if lang=='ES' else 'Connect your channel'),('02','Detectamos destinos' if lang=='ES' else 'We detect destinations'),('03','Publica y comparte' if lang=='ES' else 'Publish and share')]
    for i,(num,label) in enumerate(steps):
        x=75+i*260; c.setFillColor(INK); c.circle(x,180,27,0,1); tx(c,num,x-9,176,10,PAPER,FB); tx(c,label,x-52,118,11,INK,FB,155,14)
        if i<2: c.setStrokeColor(ACCENT); c.setLineWidth(1.4); c.line(x+38,180,x+215,180)
    tx(c,'Sin reemplazar YouTube. Sin editar tus videos.',54,70,12,MUTED,F) if lang=='ES' else tx(c,'No replacing YouTube. No re-editing your videos.',54,70,12,MUTED,F)
def pricing(c,n,lang):
    page(c,n,lang); kicker(c,'Precios' if lang=='ES' else 'Pricing')
    head(c,'Un precio que acompaña\nel tamaño de tu operación.' if lang=='ES' else 'Pricing that matches\nthe size of your operation.',54,396,420)
    plans=[('FREE','$0','1 canal · hasta 50 videos' if lang=='ES' else '1 channel · up to 50 videos'),('CREATOR','$29','Videos ilimitados · 1 sponsor' if lang=='ES' else 'Unlimited videos · 1 sponsor'),('CREATOR PRO','$79','Sponsor Hub · analytics · sync' if lang=='ES' else 'Sponsor Hub · analytics · sync'),('AGENCY','$199','Portafolio · API · portal de marcas' if lang=='ES' else 'Portfolio · API · brand portal')]
    x=520
    for i,(a,b,d) in enumerate(plans):
        y=390-i*72; tx(c,a,x,y,9,ACCENT if i==2 else INK,FB); tx(c,b,x+145,y,18,INK,FB); tx(c,'/ mes' if lang=='ES' else '/ month',x+193,y,8,MUTED,FB); tx(c,d,x,y-18,9,MUTED,F); rule(c,x,y-32,325)
    tx(c,'Facturación anual: 20% de ahorro.' if lang=='ES' else 'Annual billing: save 20%.',54,112,10,MUTED,F)
    button(c,'Ver precios' if lang=='ES' else 'View pricing','https://travelyourmap.bypupila.com/pricing',54,66,146)
def end(c,lang,hero):
    c.setFillColor(INK); c.rect(0,0,W,H,0,1); img(c,hero,465,0,495,H,True,.75); c.setFillColor(Color(.067,.09,.1,alpha=.84)); c.rect(0,0,600,H,0,1)
    tx(c,'TRAVEL YOUR MAP',54,462,9,PAPER,FB); rule(c,54,445,60,ACCENT)
    h='Tu próximo gran deal\npodría empezar con un link.' if lang=='ES' else 'Your next great deal\ncould start with one link.'
    tx(c,h,54,386,31,PAPER,FB,435,37)
    p='Crea un mapa que haga visible todo lo que tu canal ya construyó.' if lang=='ES' else 'Create a map that makes visible everything your channel has already built.'
    tx(c,p,54,275,13,SMOKE,F,365,18)
    button(c,'Crear mi mapa' if lang=='ES' else 'Create my map','https://travelyourmap.bypupila.com/onboarding?lang='+lang.lower(),54,86)
    tx(c,'travelyourmap.bypupila.com',54,50,8,SMOKE,FB)
def build():
    os.makedirs(os.path.dirname(OUT),exist_ok=True); c=Canvas(OUT,pagesize=(W,H),pageCompression=1)
    hero=os.path.join(AS,'hero-generated.png'); sponsor_photo=os.path.join(AS,'sponsors-generated.png'); product=os.path.join(PUB,'homepage-demo.png')
    for lang,start in [('ES',1),('EN',9)]:
        cover(c,lang,hero);c.showPage(); split_problem(c,start+1,lang);c.showPage(); solution(c,start+2,lang);c.showPage(); proof(c,start+3,lang,product);c.showPage(); capabilities(c,start+4,lang);c.showPage(); sponsor(c,start+5,lang,sponsor_photo);c.showPage(); process(c,start+6,lang);c.showPage(); pricing(c,start+7,lang);c.showPage(); end(c,lang,hero);c.showPage()
    c.save(); print(OUT)
if __name__=='__main__': build()
