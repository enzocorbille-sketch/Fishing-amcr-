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

