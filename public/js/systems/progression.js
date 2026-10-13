/* ============ 5a. BOSS, HEURE DORÉE & PRESTIGE ============ */
// Boss : de temps en temps un poisson légendaire mord (1 chance sur 400 par touche). Il faut le ferrer 5 fois de suite,
// chaque fois dans une fenêtre plus courte (55 % de celle de la canne). Récompense volontairement modérée :
// 60× la valeur moyenne de tes dernières prises + un coffre tiré au hasard (minimum garanti selon la zone, jusqu'à +3 rangs au-dessus) + de l'XP
var BOSSP=1/400,BOSSR=5,BOSSX=60,BOSSXP=150,BOSSCHEST=[0,1,2,2,3,4,5,6,7,7]; // coffre minimum garanti par zone
// un boss par zone : nom, emoji, couleur
var BOSS=[['Esturgeon ancestral','🐟','#38bdf8'],['Brochet royal','🐊','#22e39a'],['Spectre du lac','👻','#cbd5e1'],['Raie impériale','🦈','#2dd4bf'],['Kraken des abysses','🦑','#a855f7'],['Dragon astral','🐉','#f0abfc'],['Gardien temporel','⌛','#f97316'],['Reflet infini','🪞','#c084fc'],['Forgeron des mondes','⚒️','#fb923c'],['Roi du néant','👑','#67e8f9']];
// Heure dorée : tous les ~25-45 min (temps réel, page ouverte), la valeur des poissons est ×2 pendant 8 min
var Ev={mult:2,dur:8*60000,
 active(){return !!(S.ev&&S.ev.end>Date.now())},
 left(){const s=Math.max(0,Math.round((S.ev.end-Date.now())/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')},
 tick(){const n=Date.now();if(!S.ev||typeof S.ev!=='object')S.ev={end:0,next:0};
  if(!S.ev.next){S.ev.next=n+15*60000;save()}
  if(!this.active()&&n>=S.ev.next){S.ev.end=n+this.dur;S.ev.next=S.ev.end+rnd(25,45)*60000;save();return true}return false},
 ui(){HW.ui();const e=$('#evb');if(!e)return;e.innerHTML=this.active()?`<span class="evb">🌟 Heure dorée · valeur ×${this.mult} · ${this.left()}</span>`:''}};
// Prestige : on recommence contre des ⭐ (bonus permanent). Il faut dépenser 1 « Étoile filante » 🌠, objet rare qui se pêche (1 chance sur PDROP par prise) ou sort des gros coffres
var PDROP=1/8000;
var Pr={vb(){return .10},lb(){return .10},
 can(){return (S.pt|0)>0},
 gain(){return Math.max(1,Math.floor(Math.sqrt((S.fv||0)/1e9)))}};

/* ============ 5b. QUÊTES (par heure / jour / semaine) ============ */
// id, nom, description, objectif, type d'évènement, récompense de base (🪙)
// NERF : objectifs relevés (~×2 à ×2,5), récompenses de base ÷3
var QD={
 h:[['h_cast','Pêcheur pressé','Effectue 15 lancers.',15,'cast',150],['h_fish','Petit banc','Attrape 10 poissons.',10,'fish',200],['h_value','Bonne prise','Gagne 4 000 🪙 de valeur de poissons.',4000,'value',250],['h_chest','Coffre du jour','Trouve 1 coffre en pêchant.',1,'chest',300]],
 d:[['d_cast','Marathon du pêcheur','Effectue 100 lancers.',100,'cast',600],['d_zone','Explorateur','Pêche 40 fois ailleurs que dans l\'étang.',40,'zonecast',750],['d_fish','Pêche productive','Attrape 70 poissons.',70,'fish',850],['d_rare','Belle prise','Attrape 8 poissons rares ou mieux.',8,'rare',1050],['d_open','Ouvre-boîte','Ouvre 12 coffres.',12,'open',1200]],
 w:[['w_cast','Semaine en mer','Effectue 500 lancers.',500,'cast',3000],['w_fish','Grande pêche','Attrape 350 poissons.',350,'fish',3600],['w_value','Trésor de pêche','Gagne 150 000 🪙 de valeur de poissons.',150000,'value',4600],['w_rare','Chasseur de raretés','Attrape 30 poissons rares ou mieux.',30,'rare',5600],['w_open','Maître des coffres','Ouvre 50 coffres.',50,'open',6300]]};
var Q={
 pad:n=>String(n).padStart(2,'0'),
 key(t){const d=new Date(),p=this.pad,D=`${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
  if(t==='h')return D+'-'+p(d.getHours());if(t==='d')return D;
  const m=new Date(d.getFullYear(),d.getMonth(),d.getDate()-(d.getDay()+6)%7);return `${m.getFullYear()}-${p(m.getMonth()+1)}-${p(m.getDate())}`},
 end(t){const d=new Date();if(t==='h')return new Date(d.getFullYear(),d.getMonth(),d.getDate(),d.getHours()+1);
  if(t==='d')return new Date(d.getFullYear(),d.getMonth(),d.getDate()+1);return new Date(d.getFullYear(),d.getMonth(),d.getDate()-(d.getDay()+6)%7+7)},
 left(t){const s=Math.max(0,Math.round((this.end(t)-new Date())/1000)),h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h>=24?Math.floor(h/24)+' j '+h%24+' h':h?h+' h '+this.pad(m):m+' min'},
 st(){if(!S.quests)S.quests={};for(const t of ['h','d','w']){const k=this.key(t);if(!S.quests[t]||S.quests[t].k!==k)S.quests[t]={k,p:{},done:{}}}return S.quests},
 add(kind,n=1){const s=this.st();let ch=0;for(const t in QD)for(const q of QD[t])if(q[4]===kind&&!s[t].done[q[0]]){s[t].p[q[0]]=Math.min(q[3],(s[t].p[q[0]]||0)+n);ch=1}return ch},
 // la récompense suit le prix de la meilleure canne possédée (exposant réduit à .18 : ×19 en fin de partie au lieu de ×100)
 mult(){const P=Math.max(...S.rods.map(i=>RODS[i][1]));return Math.pow(1+P/10000,.18)},
 reward(q){return Math.round(q[5]*this.mult())},
 prog(t,q){return Math.min(q[3],this.st()[t].p[q[0]]||0)},
 ready(){const s=this.st();let n=0;for(const t in QD)for(const q of QD[t])if(!s[t].done[q[0]]&&(s[t].p[q[0]]||0)>=q[3])n++;return n}};

/* ============ 5c. FAVORIS, SUCCÈS, TROPHÉES & ÉVÉNEMENT HALLOWEEN ============ */
var FAVMAX=300;
var migrateTank=d=>{
 if(!Array.isArray(d.tank))return false;
 d.fav=Array.isArray(d.fav)?d.fav:[];
 d.inv=d.inv&&typeof d.inv==='object'?d.inv:{};
 for(const f of d.tank){
  if(!f||!FISH[f.t]||!FISH[f.t][f.j])continue;
  const value=Math.max(0,+f.v||0);
  if(f.origin==='fav'&&d.fav.length<FAVMAX)d.fav.push({t:f.t,j:f.j,v:value,m:Number.isInteger(f.m)?f.m:-1});
  else{const k=f.t+'-'+f.j,e=d.inv[k]||{n:0,v:0};e.n++;e.v+=value;d.inv[k]=e}
 }
 delete d.tank;
 return true;
};
if(migrateTank(S))try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){console.error('Aquarium fish migration could not be saved locally.',e)}
// bouton « favori » sous la prise qu'on vient de faire
var favBtn=c=>c.fav?'<div class="mu">⭐ En favori (protégé de la vente)</div>':((S.inv[c.t+'-'+c.j]||{n:0}).n>0?'<div style="margin-top:6px"><button class="chip" onclick="Act.favLast()">⭐ Mettre en favori</button></div>':'');
var topTier=()=>TIERS.length-1;
var topTierCount=()=>Object.keys(S.idx).filter(k=>+k.split('-')[0]>=6).reduce((a,k)=>a+S.idx[k],0);

// --- Succès : plusieurs paliers (🥉🥈🥇💎), récompense à réclamer. id, nom, description, icône, paliers, valeur actuelle
// NERF : paliers plus durs sur les succès faciles à farmer
var ACH=[
 ['casts','Pêcheur assidu','Effectue des lancers.','🎣',()=>[100,1000,10000,100000],()=>S.casts|0],
 ['dex','Collectionneur','Découvre des espèces de poissons.','📖',()=>{const T=FISH.flat().length;return[Math.ceil(T*.15),Math.ceil(T*.4),Math.ceil(T*.7),T]},()=>Object.keys(S.idx).length],
 ['mut','Mutant','Découvre des mutations différentes.','🧬',()=>[1,3,5,MUT.length],()=>Object.keys(S.mu||{}).length],
 ['mutn','Chasseur de mutants','Attrape des poissons mutés.','✨',()=>[10,100,1000,10000],()=>Object.values(S.mu||{}).reduce((a,b)=>a+b,0)],
 ['prism','Au bout de l\'arc-en-ciel','Attrape un poisson Prismatique.','🌈',()=>[1],()=>(S.mu||{})[6]|0],
 ['boss','Tueur de boss','Bats des boss.','🐉',()=>[3,25,100,300],()=>Object.values(S.bk||{}).reduce((a,b)=>a+b,0)],
 ['open','Ouvre-boîte','Ouvre des coffres.','📦',()=>[25,250,2500,25000],()=>S.op|0],
 ['top','Chasseur de légendes','Attrape des poissons Ultra ou mieux.','👑',()=>[1,10,100],topTierCount],
 ['pres','Renaissance','Fais des prestiges.','⭐',()=>[1,3,10,25],()=>S.pn|0],
 ['hw','Citrouille d\'or','Gagne des 🎃 pendant les événements Halloween.','🎃',()=>[150,600,1500],()=>S.hwt|0]];
var ACHR=[500,2000,8000,30000];
var Ach={
 st(){if(!S.ach)S.ach={};return S.ach},
 done(a){const t=a[4](),v=a[5]();let n=0;while(n<t.length&&v>=t[n])n++;return n},
 claimed(a){return Math.min(this.st()[a[0]]|0,a[4]().length)},
 icons(a){const n=a[4]().length;return n===1?['💎']:n===3?['🥉','🥈','🥇']:['🥉','🥈','🥇','💎']},
 reward(a,i){const n=a[4]().length;return{c:Math.round(ACHR[Math.min(3,i+4-n)]*Q.mult()),s:(i===n-1&&n>=4)?1:0}},
 pending(a){let g=0,s=0;for(let i=this.claimed(a);i<this.done(a);i++){const r=this.reward(a,i);g+=r.c;s+=r.s}return{g,s}},
 ready(){return ACH.reduce((k,a)=>k+(this.done(a)>this.claimed(a)?1:0),0)},
 trophies(){return ACH.reduce((k,a)=>k+this.claimed(a),0)},
 claim(id){const a=ACH.find(x=>x[0]===id);if(!a||this.done(a)<=this.claimed(a))return;
  const p=this.pending(a);this.st()[id]=this.done(a);S.c+=p.g;S.es=(S.es|0)+p.s;
  UI.msg=`🏆 « ${a[1]} » · +${fmt(p.g)} 🪙${p.s?` · +${p.s} 🪨`:''}`;Act.done()}};

// --- Événement Halloween (7 octobre → 2 novembre, date de l'appareil) : quêtes, 🎃 et boutique
// id, nom, description, objectif, type, récompense en 🎃, récompense de base en 🪙
// NERF : objectifs relevés, 🎃 et 🪙 réduits
var HQ=[
 ['hw_fish','Chasseur de citrouilles','Attrape 120 poissons.',120,'fish',15,500],
 ['hw_mut','Mutant de saison','Obtiens 6 poissons mutés.',6,'mut',25,1000],
 ['hw_hal','Pêche maudite','Obtiens 2 poissons de mutation Halloween.',2,'hal',40,2000],
 ['hw_open','Coffres hantés','Ouvre 25 coffres.',25,'open',20,1200],
 ['hw_boss','Boss d\'Halloween','Bats 4 boss.',4,'boss',30,2000],
 ['hw_cast','Nuit blanche','Effectue 700 lancers.',700,'cast',50,3000]];
// id, nom, coût en 🎃, limite d'achats par événement
var HS=[['stone','🪨 Pierre d\'enchantement',40,5],['cl','📦 Coffre Légendaire',60,5],['cm','📦 Coffre Mythique',150,3],['coins','🪙 Sac de pièces',25,20],['hw_pumpkin','🎃 Coffre Citrouille',300,10,'Coffre Halloween · chance de Canne Citrouille et Cœur citrouille.'],['hw_cursed','👻 Coffre Maudit',600,5,'Coffre Halloween · chance de Canne Fantôme et Grimoire spectral.'],['hw_headless','💀 Coffre du Cavalier sans tête',900,3,'Coffre Halloween · chance de Canne Vampire et Médaillon du Cavalier.']];
var HW={
 pv(){try{return !!Cloud.admin&&localStorage.getItem('catbet-evpreview')==='1'}catch(e){return false}},
 real(){return Mut.on(new Date())},
 on(){return this.pv()||this.real()},
 st(){const y=new Date().getFullYear();if(!S.hw||S.hw.y!==y)S.hw={y,p:{},done:{},pk:0,shop:{}};return S.hw},
 left(){if(!this.real())return 'aperçu admin';const n=new Date(),end=new Date(n.getFullYear(),10,3),s=Math.max(0,Math.round((end-n)/1000)),d=Math.floor(s/86400),h=Math.floor(s%86400/3600);return d?d+' j '+h+' h':h+' h'},
 pk(n){const h=this.st();h.pk+=n;S.hwt=(S.hwt|0)+n},
 add(kind,n=1){if(!this.on())return;const h=this.st();if(kind==='boss')this.pk(10);for(const q of HQ)if(q[4]===kind&&!h.done[q[0]])h.p[q[0]]=Math.min(q[3],(h.p[q[0]]||0)+n)},
 fish(c){if(!this.on())return;this.pk(1+(c.mut>=0?2:0)+(c.mut===5?20:0)+(c.mut===6?80:0));this.add('fish');if(c.mut>=0)this.add('mut');if(c.mut===5)this.add('hal')},
 prog(q){return Math.min(q[3],this.st().p[q[0]]||0)},
 ready(){if(!this.on())return 0;const h=this.st();return HQ.filter(q=>!h.done[q[0]]&&(h.p[q[0]]||0)>=q[3]).length},
 claim(id){const q=HQ.find(x=>x[0]===id),h=this.st();if(!q||!this.on()||h.done[id]||this.prog(q)<q[3])return;
  h.done[id]=1;this.pk(q[5]);const c=Math.round(q[6]*Q.mult());S.c+=c;UI.msg=`🎃 « ${q[1]} » · +${q[5]} 🎃 · +${fmt(c)} 🪙`;Act.done()},
 buy(id){const it=HS.find(x=>x[0]===id),h=this.st();if(!it||!this.on()||(h.shop[id]|0)>=it[3]||h.pk<it[2])return;
  h.pk-=it[2];h.shop[id]=(h.shop[id]|0)+1;
  S.chests=S.chests&&typeof S.chests==='object'?S.chests:{};
  if(id==='stone')S.es=(S.es|0)+1;else if(id==='cl')S.chests[3]=(S.chests[3]||0)+1;else if(id==='cm')S.chests[4]=(S.chests[4]||0)+1;
  else if(id==='hw_pumpkin')S.chests[8]=(S.chests[8]||0)+1;else if(id==='hw_cursed')S.chests[9]=(S.chests[9]||0)+1;else if(id==='hw_headless')S.chests[10]=(S.chests[10]||0)+1;
  else if(id==='coins')S.c+=Math.round(2500*Q.mult());
  UI.msg=`🎃 Acheté : ${it[1]}`;Act.done()},
 ui(){const e=$('#hwb');if(!e)return;e.innerHTML=this.on()?`<span class="hwb" onclick="UI.qt='e';UI.go('quest')">🎃 Événement Halloween · mutation ×${MUT[5][3]} · ${this.left()} · 🎃 ${this.st().pk}</span>`:''}};

