// --- Événement Halloween (7 octobre → 2 novembre, date de l'appareil) : quêtes, 🎃 et boutique
// id, nom, description, objectif, type, récompense en 🎃, récompense de base en 🪙
// NERF : objectifs relevés, 🎃 et 🪙 réduits
var HQ=[
 ['hw_fish','Chasseur de citrouilles','Attrape 120 poissons.',120,'fish',15,500],
 ['hw_mut','Mutant de saison','Obtiens 6 poissons mutés.',6,'mut',25,1000],
 ['hw_hal','Pêche maudite','Obtiens 2 poissons de mutation Halloween.',2,'hal',40,2000],
 ['hw_open','Coffres hantés','Ouvre 25 coffres.',25,'open',20,1200],
 ['hw_boss','Boss d\'Halloween','Bats 4 boss.',4,'boss',30,2000],
 ['hw_cast','Nuit blanche','Effectue 700 lancers.',700,'cast',50,3000]
];
// id, nom, coût en 🎃, limite d'achats par événement
var HS=[
 ['stone','🪨 Pierre d\'enchantement',40,5],
 ['cl','📦 Coffre Légendaire',60,5],
 ['cm','📦 Coffre Mythique',150,3],
 ['coins','🪙 Sac de pièces',25,20],
 ['hw_pumpkin','🎃 Coffre Citrouille',300,10,'Coffre Halloween · chance de Canne Citrouille et Cœur citrouille.'],
 ['hw_cursed','👻 Coffre Maudit',600,5,'Coffre Halloween · chance de Canne Fantôme et Grimoire spectral.'],
 ['hw_headless','💀 Coffre du Cavalier sans tête',900,3,'Coffre Halloween · chance de Canne Vampire et Médaillon du Cavalier.']
];
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
