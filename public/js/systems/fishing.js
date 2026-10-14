/* ============ CORRECTIF NaN kg ============ */
// Poids de base (kg) par rareté : index 0 = Commun … index 14 = Au-delà
// ⚠️ Supprime l'ancienne ligne "var WKG=..." ailleurs dans ton projet, sinon elle peut écraser celle-ci.
var WKG=[0.4, 1.5, 6, 20, 70, 200, 600, 2000, 7000, 25000, 90000, 300000, 1000000, 4000000, 15000000];
// Si tu ajoutes une rareté plus tard, le tableau se complète tout seul
while(WKG.length<TIERS.length) WKG.push(WKG[WKG.length-1]*4);
// Renvoie toujours un nombre valide, même si le tier n'a pas de poids défini
function wkgOf(t){return WKG[t]||WKG[WKG.length-1]}

var Fight={
 R:Math.random,s:null,in:{reel:false,steer:0},
 behOf(t,j){const h=t+j;
  const L=t===0?['steady','darter']:t<=2?['steady','darter','diver','runner']:['steady','darter','diver','runner','trick'];return L[h%L.length]},
 // fiche du poisson : poids, puissance, vitesse, agressivité, endurance, comportement
 traits(c){const t=c.t,s=c.size,b=this.behOf(t,c.j),B=BEH[b];
  const P=(14+8.5*t+6*s)*B.pm,ag=clampN((.2+.08*t)*B.am*1.4,.1,.95),sp=clampN((.8+.18*t)*B.rm,.5,2.6),E=1+.25*t+.4*s;
  return{beh:b,kg:+(wkgOf(t)*(.5+s)).toFixed(wkgOf(t)<5?2:1),P,ag,sp,E,run:4*sp,d0:22+6.5*t+8*s,
   risk:clampN((P-26)/55,0,1)}},
 start(c){const tr=this.traits(c),R=this.R;
  this.s={c,tr,d:tr.d0,dmax:tr.d0+35,ten:16,sta:1,dir:R()<.5?-1:1,nd:null,surge:false,sT:0,sDur:0,cd:.6+R()*.7,faked:false,flipT:0,breakT:0,slackT:0,t:0,danger:0,safe:0,res:null};
  this.in={reel:false,steer:0};return this.s},
 // direction que le joueur voit : le poisson Rusé annonce d'abord la mauvaise
 shown(){const f=this.s;if(!f)return 0;const B=BEH[f.tr.beh];
  if(f.surge)return B.fake&&!f.faked?-f.dir:f.dir;
  return f.nd!=null&&f.cd<=.35?f.nd:0},
 tick(dt){
  const f=this.s;if(!f||f.res)return;const tr=f.tr,B=BEH[tr.beh],R=this.R,I=this.in;f.t+=dt;
  if(!f.surge){f.cd-=dt;
   if(f.nd==null&&f.cd<=.35)f.nd=(tr.beh==='runner'&&f.dir)?f.dir:(R()<.5?-1:1);
   if(f.cd<=0){f.surge=true;f.sT=0;f.pw=.8+R()*.5;f.sDur=B.dur[0]+R()*(B.dur[1]-B.dur[0]);f.faked=false;f.dir=f.nd;f.nd=null;f.flipT=B.flip?B.flip[0]+R()*(B.flip[1]-B.flip[0]):0}}
  else{f.sT+=dt;
   if(B.flip){f.flipT-=dt;if(f.flipT<=0){f.dir*=-1;f.flipT=B.flip[0]+R()*(B.flip[1]-B.flip[0])}}
   if(B.fake&&!f.faked&&f.sT>=B.fake){f.dir*=-1;f.faked=true}
   if(f.sT>=f.sDur){f.surge=false;f.cd=(.5+R()*.9)/Math.max(.2,tr.ag*1.6)}}
  // tension : le joueur la monte en remontant, le poisson la monte en tirant ; contrer sa direction l'amortit
  const pull=tr.P*(f.surge?f.pw:.22)*(.65+.35*f.sta),cf=!f.surge?1:(I.steer===0?1:I.steer===-f.dir?.3:1.5);
  f.ten=clampN(f.ten+((I.reel?52:12)+pull*cf-f.ten)*Math.min(1,dt*5.5),0,110);
  if(f.ten>85)f.danger+=dt;if(f.ten>=30&&f.ten<=85)f.safe+=dt;
  // fatigue du poisson : il se fatigue quand on garde une bonne pression ; distance
  if(I.reel&&f.ten>=30&&f.ten<=88)f.sta=Math.max(0,f.sta-dt*.34/tr.E);else if(!I.reel)f.sta=Math.min(1,f.sta+dt*.03);
  if(I.reel)f.d-=dt*20*(1-.55*f.sta)*(f.ten<20?.35:1);else f.d+=dt*tr.run*f.sta*(f.surge?1:.25);
  if(f.ten>=100){f.breakT+=dt;if(f.breakT>=.22)return this.end('break')}else f.breakT=Math.max(0,f.breakT-dt*.5);
  if(f.ten<18&&!I.reel){f.slackT+=dt;if(f.slackT>=2)return this.end('slack')}else f.slackT=0;
  if(f.d<=0)return this.end('win');if(f.d>=f.dmax)return this.end('escape');if(f.t>45)return this.end('time')},
 end(why){const f=this.s,perf=f.t>0?f.safe/f.t:0;f.res={win:why==='win',why,perf:why==='win'?clampN((perf-.6)/.4,0,1):0,time:f.t};return f.res},
 // joueur simulé (calibrage et combat automatique) : délai de réaction, précision, seuils de tension
 sim(c,sk){const R=this.R,f=this.start(c),hist=[];let reelOn=true,t=0;
  while(!f.res){
   hist.push([t,this.shown(),f.ten]);while(hist.length>1&&hist[1][0]<=t-sk.rt)hist.shift();
   const seen=hist[0][1],ten=hist[0][2]+(R()-.5)*2*(sk.noise||0);
   if(sk.reelAlways)reelOn=true;else{if(reelOn&&ten>sk.hi)reelOn=false;else if(!reelOn&&ten<sk.lo)reelOn=true}
   this.in.reel=reelOn;this.in.steer=(sk.steer&&seen&&R()<sk.acc)?-seen:0;
   this.tick(.05);t+=.05}
  return f.res},
 auto(c){return this.sim(c,SKILL.auto)}};
var SKILL={
 pro:{rt:.12,hi:74,lo:56,acc:1,steer:true,noise:2},
 auto:{rt:.3,hi:76,lo:52,acc:.88,steer:true,noise:5},
 casual:{rt:.45,hi:80,lo:55,acc:.6,steer:true,noise:8},
 idle:{rt:.1,reelAlways:true,steer:false}};

/* ============ 4. MOTEUR DE PÊCHE ============ */
var Engine={
 st:0,t1:0,t2:0,b:-1,free:0,again:0,boss:null,last:null,  // st : 0 repos · 1 attente · 2 touche
 act(){if(this.st===0)this.cast();else if(this.st===2)this.reel()},
 cast(){
  const r=RODS[S.rod],f=fx();this.st=1;S.casts++;this.again=0;this.boss=null;if(Ev.tick())UI.head();Q.add('cast');HW.add('cast');if(S.zone>0)Q.add('zonecast');
  this.b=activeBait();this.free=0;if(this.b>=0){if(Math.random()<f.B)this.free=1;else{S.baits[this.b]--;if(S.baits[this.b]<=0){delete S.baits[this.b];if(S.bait===this.b)S.bait=-1}save();UI.refreshBaits()}}
  UI.fishState(this.free?'Appât préservé ! Patience…':'Patience…','wait');
  this.t1=setTimeout(()=>this.bite(),biteDelayMs(r[3],f.S));
 },
 bite(){
  if(!this.boss&&!this.again&&Math.random()<BOSSP)this.boss={n:0,N:BOSSR,z:S.zone};
  const B=this.boss,base=RODS[S.rod][4]*fx().W,w=B?Math.max(700,base*.55):base;
  this.st=2;UI.fishState(B?`🐉 ${BOSS[B.z][0]} mord ! Ferre ! (${B.n+1}/${B.N})`:this.again?'Il revient ! Ferre vite !':'ÇA MORD ! Ferre vite !','bite');UI.timer(w);
  this.t2=setTimeout(()=>{
   if(B){this.boss=null;this.st=0;UI.fishState('La ligne a cassé… le boss s\'enfuit 🐉💨','');UI.refreshGo();return}
   if(!this.again&&Math.random()<fx().H){this.again=1;return this.bite()}
   this.st=0;UI.fishState('Le poisson s\'est échappé…','');UI.refreshGo()},w);
 },
 bossHit(){clearTimeout(this.t2);const B=this.boss;B.n++;
  if(B.n>=B.N){this.boss=null;this.st=0;return this.bossWin(B.z)}
  this.st=1;UI.fishState(`💥 Il se débat… ${B.n}/${B.N} · tiens bon !`,'wait');
  this.t1=setTimeout(()=>this.bite(),rnd(500,1400))},
 bossWin(z){const rw=Math.max(500,Math.round((S.avg||0)*BOSSX)),ct=Math.min(7,(BOSSCHEST[z]||0)+pickW([55,25,13,7]));
  S.c+=rw;S.chests[ct]=(S.chests[ct]||0)+1;S.xp+=BOSSXP;S.bk[z]=(S.bk[z]|0)+1;Q.add('chest');HW.add('boss');
  this.last={boss:z,reward:rw,ct};save();UI.caught(this.last);UI.head()},
 clear(){clearTimeout(this.t1);clearTimeout(this.t2);this.st=0;this.boss=null;Fight.s=null;Fight.in={reel:false,steer:0}},
 roll(){
  const E=fx(),L=luck(this.b),w=TIERS.map((t,i)=>pool(i).length?t[2]*Math.pow(L,.25*i)*(i>0?1+E.R*2.5*i:1):0);
  const bs=baitEffect(this.b);
  if(bs&&bs.kind==='deep'&&S.zone>=4)for(let i=4;i<w.length;i++)w[i]*=1.35;
  if(bs&&bs.kind==='predator'){if(w[2])w[2]*=1.35;if(w[3])w[3]*=1.35}
  if(bs&&bs.kind==='astral'&&S.zone>=5)for(let i=5;i<w.length;i++)w[i]*=1.45;
  let x=Math.random()*w.reduce((a,b)=>a+b,0),t=0;for(;t<w.length-1&&(x-=w[t])>0;t++);
  const tags=[];
  if(Math.random()<Math.min(.5,E.P)&&t<TIERS.length-1&&pool(t+1).length){t++;tags.push('🌊 Marée haute')}
  const p=pool(t),[f,j]=p[Math.floor(Math.random()*p.length)];
  const bait=baitValueMultiplier(this.b,E);
  const size=Math.random();let m=ZONES[S.zone][3]*bait*E.V*(1+E.X*S.zone);
  if(bs&&bs.kind!=='inactive'&&bait>1)tags.push(`🪱 Valeur appât ×${bait.toFixed(2)}`);
  if(Math.random()<E.K){m*=3;tags.push('🎯 Critique ×3')}
  if(Math.random()<E.D){m*=2;tags.push('✌️ Double')}
  const mi=Mut.roll();if(mi>=0)m*=MUT[mi][3];
  const val=Math.round((f[2]+(f[3]-f[2])*size)*m);
  const weightFactor=bs&&bs.kind==='weight'?1.15:1;
  return{t,j,f,val,tags,mut:mi,size,kg:+(wkgOf(t)*(.5+size)*weightFactor).toFixed(wkgOf(t)<5?2:1),cm:Math.round(f[2]/2+size*60)};
 },
 reel(){
  if(this.boss)return this.bossHit();
  clearTimeout(this.t2);this.st=0;
  const chestBait=baitEffect(this.b),chestBonus=chestBait&&chestBait.kind==='chest'?.0045:0;
  if(Math.random()<Math.min(.04,.0017*Math.pow(level(),.7)*Math.pow(luck(this.b),.3)*fx().C+chestBonus)){
   const chestWeights=CHESTS.map(c=>c[4]);
   if(HW.on()){chestWeights[8]=.08;chestWeights[9]=.03;chestWeights[10]=.01}
   const t=pickW(chestWeights);S.chests[t]=(S.chests[t]||0)+1;Q.add('chest');this.last={chest:t};save();UI.caught(this.last);UI.head();return}
  const c=this.roll();
  return this.fightEnd(c,Fight.auto(c),true)},
 // Combat simulé automatiquement, sans mini-jeu.
 fightEnd(c,res,auto){
  this.st=0;Fight.s=null;Fight.in={reel:false,steer:0};
  if(!res.win){this.last={lost:{name:c.f[0],t:c.t,kg:c.kg},why:res.why,auto:!!auto};UI.lost(this.last);return}
  this.land(c)},
 land(c){
  const k=c.t+'-'+c.j;
  if(S.af!==0&&c.mut>=0&&(S.fav||[]).length<FAVMAX){S.fav=S.fav||[];S.fav.push({t:c.t,j:c.j,v:c.val,m:c.mut});c.fav=1}
  else{const e=S.inv[k]||{n:0,v:0};e.n++;e.v+=c.val;S.inv[k]=e}
  S.idx[k]=(S.idx[k]||0)+1;S.xp+=TIERS[c.t][3];
  S.rec=S.rec||{};const pr=S.rec[k]||0;if(c.kg>pr){S.rec[k]=c.kg;if(pr>0)c.rec=1}
  if(c.mut>=0){S.mu=S.mu||{};S.mu[c.mut]=(S.mu[c.mut]|0)+1}
  HW.fish(c);Q.add('fish');if(c.t>=1)Q.add('rare');Q.add('value',c.val);S.fv=(S.fv||0)+c.val;S.avg=S.avg?S.avg*.98+c.val*.02:c.val;
  if(Math.random()<Math.min(.012,.004+c.t*.0015)){S.es=(S.es|0)+1;c.stone=1}
  if(Math.random()<PDROP){S.pt=(S.pt|0)+1;c.ptok=1}
  this.last=c;save();if(c.t>=7)playRareCatchSound(c.t);UI.caught(c);UI.head();
 }};
