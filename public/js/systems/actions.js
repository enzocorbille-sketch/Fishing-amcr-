/* ============ 5. ACTIONS ============ */
var Act={
 buyRod(i){if(i<0||i>=BASE_RODS)return;const p=RODS[i][1];if(S.rods.includes(i))S.rod=i;else if(S.c>=p){S.c-=p;S.rods.push(i);S.rod=i}else return;this.done()},
 buyEventRod(i){const r=HWRODS[i],id=BASE_RODS+i;if(!r||!HW.on())return;const h=HW.st();if(S.rods.includes(id)||level()<r[1]||h.pk<r[2]||(h.shop['rod'+i]|0)>=1)return;
  h.pk-=r[2];h.shop['rod'+i]=1;S.rods.push(id);S.rod=id;this.done()},
 equipEventRod(i){const r=HWRODS[i],id=BASE_RODS+i;if(!r||!S.rods.includes(id))return;
  if(level()<r[1])return UI.toast(`Niveau ${r[1]} requis pour équiper ${r[0]}`);
  S.rod=id;this.done()},
 buyZone(i){const p=ZONES[i][1];if(S.zones.includes(i))S.zone=i;else if(S.c>=p){S.c-=p;S.zones.push(i);S.zone=i}else return;this.done()},
 buyBait(i,n){const p=BAITS[i][1]*n;if(S.c<p)return;S.c-=p;S.baits[i]=(S.baits[i]||0)+n;this.done()},
 sellChest(t){if(!(S.chests[t]>0))return;S.c+=CHESTS[t][3];if(!--S.chests[t])delete S.chests[t];this.done()},
 pickBait(i){S.bait=i;this.done()},
 rerollPrice(r=UI.er()){const p=RODS[r]?RODS[r][1]:RODS[S.rod][1];return Math.round(10000*Math.pow(1+Math.max(0,p)/10000,.28))},
 reroll(){const r=UI.er(),e=rodEn(r),pr=this.rerollPrice(r),owners=S.eb||(S.eb={});
  if(e.length>=3)return UI.toast('3 emplacements pleins · retire un enchantement depuis son slot');
  if(S.c<pr)return UI.toast('Solde insuffisant');
  const pl=EN.map((_,i)=>i).filter(i=>!e.includes(i)&&(owners[i]==null||+owners[i]===r));
  if(!pl.length)return UI.toast('Tous les enchantements sont déjà liés à une autre canne');
  const i=pl[Math.random()*pl.length|0],l=1+Math.floor(Math.random()*5);
  S.c-=pr;S.en[i]=Math.max(S.en[i]|0,l);e.push(i);
  owners[i]=r;UI.msg=`${EN[i][1]} ${EN[i][0]} niveau ${S.en[i]} · lié à la canne ${RODS[r][0]}`;this.done()},
 equip(i){const r=UI.er(),e=rodEn(r),k=e.indexOf(i),owners=S.eb||(S.eb={});
  if(k>=0){e.splice(k,1);delete S.en[i];delete owners[i]}else if(!(S.en[i]|0))return;else if(owners[i]!=null&&+owners[i]!==r)return UI.toast(`Cet enchantement est lié à ${RODS[owners[i]]?RODS[owners[i]][0]:'une autre canne'}`);
  else if(e.length<3){e.push(i);owners[i]=r}else return UI.toast('3 enchantements max par canne');this.done()},
 prestige(){if(!Pr.can())return;const g=Pr.gain();
  if(!confirm(`Prestige : tu dépenses 1 🌠 Étoile filante, tu gagnes ${g} ⭐ et tu recommences à zéro (pièces, cannes normales, zones, appâts, poissons, coffres, niveau, enchantements et pierres).\nToutes tes 🌠 Étoiles filantes restantes sont aussi perdues.\nTu gardes : tes cannes événement, tes artefacts, ton index, tes mutations, tes succès, tes quêtes et tes ⭐.\nLes citrouilles et les achats de la boutique Halloween sont réinitialisés.\nContinuer ?`))return;
 const h=S.hw&&typeof S.hw==='object'?{...S.hw,pk:0,shop:{}}:null;
 const keep={rods:[0,...(S.rods||[]).filter(i=>i>=BASE_RODS&&i<RODS.length)],ao:S.ao,ae:S.ae,quests:S.quests,idx:S.idx,casts:0,mu:S.mu,ach:S.ach,gr:S.gr,hwt:S.hwt,op:S.op,af:S.af,rec:S.rec,pr:(S.pr|0)+g,pn:(S.pn|0)+1,pt:0,bk:S.bk,hw:h};
  Engine.clear();Object.assign(S,fresh(),keep);Cloud.force=1;UI.msg=`⭐ Prestige ${S.pn} · +${g} ⭐ · total ${S.pr} ⭐`;save();UI.go('prest')},
 qClaim(t,id){const q=QD[t].find(x=>x[0]===id),s=Q.st()[t];if(!q||s.done[id]||Q.prog(t,q)<q[3])return;s.done[id]=1;S.c+=Q.reward(q);UI.msg=`🎯 Quête « ${q[1]} » terminée · +${fmt(Q.reward(q))} 🪙`;this.done()},
 aeq(i){const k=S.ae.indexOf(i);if(k>=0)S.ae.splice(k,1);else if(!S.ao[i])return;else if(S.ae.length<3)S.ae.push(i);else return UI.toast('3 artefacts max');this.done()},
 enPrice(i){const l=S.en[i]|0;return l<5?EN[i][6]*(l+1)*(l+1):0},
 upgrade(i){const l=S.en[i]|0,owner=(S.eb||{})[i];if(owner!=null&&+owner!==UI.er())return;if(l<1||l>=EN[i][5])return;
  if(l<5){const p=this.enPrice(i);if(S.c<p)return;S.c-=p}else{if(!(S.es>0))return UI.toast('Il te faut une pierre d\'enchante 🪨');S.es--}
  S.en[i]=l+1;this.done()},
 favLast(){const c=Engine.last;if(!c||c.t==null||c.fav)return;const k=c.t+'-'+c.j,e=S.inv[k];
  if(!e||e.n<1||e.v<c.val-1e-6||(S.fav||[]).length>=FAVMAX)return;
  e.n--;e.v=Math.max(0,e.v-c.val);if(e.n<=0)delete S.inv[k];S.fav=S.fav||[];S.fav.push({t:c.t,j:c.j,v:c.val,m:c.mut});c.fav=1;save();UI.caught(c);UI.head()},
 unfav(i){const f=(S.fav||[])[i];if(!f)return;const k=f.t+'-'+f.j,e=S.inv[k]||{n:0,v:0};e.n++;e.v+=f.v;S.inv[k]=e;S.fav.splice(i,1);this.done()},
 sellFav(i){const f=(S.fav||[])[i];if(!f)return;S.c+=f.v;S.fav.splice(i,1);this.done()},
 toggleAf(){S.af=S.af===0?1:0;this.done()},
 sell(t){let g=0;for(const k in S.inv){if(t<0||k.startsWith(t+'-')){g+=S.inv[k].v;delete S.inv[k]}}S.c+=g;this.done()},
 reset(){if(confirm('Tout effacer et repartir de zéro ?')){Object.assign(S,fresh());Cloud.force=1;this.done()}},
 done(){save();UI.render()}};

