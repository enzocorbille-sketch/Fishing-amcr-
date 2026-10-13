// Boutique : affichage et navigation des produits.
// Le module reste un script classique pour conserver les sauvegardes et les API globales existantes.
var Shop={render(){
  if(this.shop==='hwrods'&&!HW.on())this.shop='rods';
  const SB=[['rods','🎣','Cannes','Choisissez la canne qui correspond à votre style de pêche.'],['baits','🪱','Appâts','Plus de chance et plus de valeur à chaque lancer.'],['zones','🗺️','Zones','Chaque zone a ses propres poissons.']];
  if(HW.on())SB.push(['hwrods','🎃','Cannes Halloween','Édition limitée · prix en citrouilles.']);
  const cur=SB.find(x=>x[0]===this.shop)||SB[0];
  const side=`<aside class="sbar">${SB.map(([k,ic,n])=>`<button class="sb ${this.shop===k?'on':''}" onclick="UI.shop='${k}';UI.render()"><span class="ni">${ic}</span>${n}</button>`).join('')}<button class="sb" onclick="UI.go('ench')"><span class="ni">✨</span>Équipement<small>Enchantements, artefacts</small></button>${HW.on()?`<button class="sb hws" onclick="UI.qt='e';UI.go('quest')"><span class="ni">🎃</span><b>BOUTIQUE HALLOWEEN</b><small>Quêtes et autres objets</small></button>`:''}</aside>`;
  const RAR=[['Commune','#cbd5e1',0,2],['Rare','#60a5fa',3,5],['Épique','#a78bfa',6,9],['Légendaire','#fb923c',10,14],['Mythique','#f43f5e',15,17]],rr=i=>RAR.findIndex(x=>i>=x[2]&&i<=x[3]);
  let filt='',h='';
  if(this.shop==='rods'){
   const rf=this.rf==null?-1:this.rf;
   filt=`<div class="row" style="flex-wrap:wrap;gap:6px">${[[-1,'Toutes'],...RAR.map((x,i)=>[i,x[0]+'s'])].map(([k,n])=>`<button class="chip ${rf===k?'on':''}" onclick="UI.rf=${k};UI.render()">${n}</button>`).join('')}</div>`;
   h=RODS.slice(0,BASE_RODS).map((r,i)=>({r,i})).filter(({i})=>rf<0||rr(i)===rf).map(({r,i})=>{const own=S.rods.includes(i),A=RAR[rr(i)];
    return `<div class="rc rod-card ${own||S.c>=r[1]?'':'lock'}" style="--a:${r[5]};--rarity:${A[1]}"><div class="rh"><b>${r[0]}</b><span class="pill">${A[0]}</span></div><div class="rart ${i<9?'short':'tall'}">${rodShopArt(i)}</div><div class="rod-stats"><div class="rs"><span>🍀 Chance</span><b>×${r[2]}</b></div><div class="rs"><span>⚡ Vitesse</span><b>×${r[3]}</b></div><div class="rs"><span>🎯 Ferrage</span><b>${r[4]} ms</b></div></div><button class="btn sm rod-buy ${S.rod===i?'eq':own?'g':''}" onclick="Act.buyRod(${i})" ${S.rod===i||(!own&&S.c<r[1])?'disabled':''}>${S.rod===i?'✓ Équipée':own?'Équiper':'🪙 '+fmt(r[1])}</button></div>`}).join('');
  }
  if(this.shop==='hwrods'){
   const hstate=HW.st();
   h=`<div class="hwshop-head"><div style="font-size:32px">🎃</div><div><b>Collection limitée</b><div class="mu">Huit cannes exclusives · elles restent après un prestige.</div></div><div class="hwshop-wallet">🎃 ${fmt(hstate.pk)} <span class="mu">citrouilles</span></div></div>
   ${HWRODS.map((r,i)=>{const id=BASE_RODS+i,own=S.rods.includes(id),lvl=level()>=r[1],used=(hstate.shop['rod'+i]|0)>=1,cost=r[2],can=!own&&!used&&lvl&&hstate.pk>=cost,label=own?'✓ Déjà obtenue':used?'✓ Déjà achetée':can?`Acheter · 🎃 ${fmt(cost)}`:`🎃 ${fmt(cost)}`;
    return `<article class="hwshop-card ${own||can?'':'lock'}" style="--a:${r[5]}"><div class="hwshop-art">${hwRodImg(i)}</div><div class="hwshop-buy"><button class="btn sm ${can?'g':''}" style="width:100%" onclick="Act.buyEventRod(${i})" ${own||used||!lvl||hstate.pk<cost?'disabled':''}>${label}</button></div></article>`}).join('')}`;
  }
  if(this.shop==='baits')h=BAIT_ORDER.map(i=>{const b=BAITS[i];return `<div class="fc" style="--a:#38bdf8"><div class="em">${b[3]}</div><b>${b[0]}</b><div class="mu">${baitDescription(b)}<br>En stock : ${S.baits[i]||0}</div>${[1,10,100].map(n=>`<button class="btn sm" onclick="Act.buyBait(${i},${n})" ${S.c<b[1]*n?'disabled':''}>×${n} · ${fmt(b[1]*n)}</button>`).join(' ')}</div>`}).join('');
  if(this.shop==='zones')h=ZONES.map((z,i)=>{const own=S.zones.includes(i);return `<div class="fc" style="--a:${z[6]}"><div class="em" style="height:54px;border-radius:12px;background:linear-gradient(${z[4]},${z[5]} 45%,${z[6]} 45%,${z[7]})"></div><b>${z[0]}</b><div class="mu">Chance ×${z[2]} · Valeur ×${z[3]}<br>Poissons exclusifs</div><button class="btn sm" onclick="Act.buyZone(${i})" ${S.zone===i||(!own&&S.c<z[1])?'disabled':''}>${S.zone===i?'Actuelle':own?'Y aller':'🪙 '+fmt(z[1])}</button></div>`}).join('');
  return `<div class="shop">${side}<section><div class="sh"><div class="shi">${cur[1]}</div><div><h2 style="margin:0">${cur[2]}</h2><div class="mu">${cur[3]}</div></div><div class="sf">${filt}</div></div><div class="grid ${this.shop==='hwrods'?'hwshop-grid':this.shop==='rods'?'rod-list':''}">${h}</div></section></div>`;

}};
