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

