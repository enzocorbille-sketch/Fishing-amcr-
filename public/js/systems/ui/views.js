/* UI screens and inventory views. */
Object.assign(UI,{
v_fish(){
  const z=ZONES[S.zone],r=RODS[S.rod],hr=HWRODS[S.rod-BASE_RODS],lb=lvlBar();setTimeout(()=>this.refreshGo());
  return `<div class="scene"><canvas class="scene-art-canvas" aria-hidden="true"></canvas><svg class="scene-art" viewBox="0 0 960 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
   <linearGradient id="nightSky" x2="0" y2="1"><stop stop-color="#080a12"/><stop offset=".68" stop-color="${z[4]}" stop-opacity=".52"/><stop offset="1" stop-color="#765044"/></linearGradient>
   <radialGradient id="moonLight"><stop stop-color="#fff4d5"/><stop offset=".72" stop-color="#e6d4aa"/><stop offset="1" stop-color="#948575"/></radialGradient>
   <linearGradient id="lake" x2="0" y2="1"><stop stop-color="${z[6]}" stop-opacity=".35"/><stop offset=".45" stop-color="#102126"/><stop offset="1" stop-color="#080d11"/></linearGradient>
   <linearGradient id="shore" x2="0" y2="1"><stop stop-color="#252524"/><stop offset="1" stop-color="#101313"/></linearGradient>
   <filter id="moonGlow" x="-120%" y="-120%" width="340%" height="340%"><feGaussianBlur stdDeviation="13"/></filter>
   <filter id="soften" x="-10%" y="-20%" width="120%" height="140%"><feGaussianBlur stdDeviation="2"/></filter>
   <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .18"/></feComponentTransfer></filter>
   <clipPath id="waterClip"><path d="M0 193Q160 187 310 194T620 192T960 194V360H0Z"/></clipPath>
  </defs>
  <rect width="960" height="205" fill="url(#nightSky)"/>
  <path d="M0 145Q245 94 463 147T960 128V205H0Z" fill="${z[5]}" opacity=".12" filter="url(#soften)"/>
  <path d="M-20 98Q75 74 158 92T342 86" fill="none" stroke="#aaa0a045" stroke-width="12" filter="url(#soften)"/>
  <path d="M-20 98Q75 74 158 92T342 86" fill="none" stroke="#d4c4ac12" stroke-width="4"/>
  <g class="stars">
   <circle cx="88" cy="49" r="1.4"/><circle cx="164" cy="91" r="1"/><circle cx="254" cy="35" r="1.3"/><circle cx="350" cy="68" r="1"/><circle cx="424" cy="30" r="1.2"/><circle cx="566" cy="59" r="1.3"/><circle cx="642" cy="31" r="1"/><circle cx="838" cy="56" r="1.3"/><circle cx="905" cy="102" r="1"/>
   <circle cx="203" cy="122" r="1.1"/><circle cx="323" cy="108" r=".8"/><circle cx="593" cy="112" r="1"/><circle cx="883" cy="36" r=".8"/>
  </g>
  <circle cx="742" cy="77" r="43" fill="#e5c891" opacity=".18" filter="url(#moonGlow)"/>
  <circle cx="742" cy="77" r="26" fill="url(#moonLight)"/>
  <g fill="#887c70" opacity=".3"><circle cx="733" cy="69" r="3"/><circle cx="751" cy="84" r="4.2"/><circle cx="746" cy="64" r="1.8"/><circle cx="729" cy="86" r="1.5"/></g>
  <path class="distant" d="M0 169Q45 155 88 164Q135 138 179 152Q215 135 260 160Q305 141 348 160Q392 133 438 158Q481 141 526 164Q575 135 621 157Q662 138 702 161Q750 131 791 157Q832 140 872 161Q919 138 960 155V216H0Z"/>
  <path d="M0 177Q114 164 220 174T450 169T681 177T960 165V212H0Z" fill="#131819" opacity=".86"/>
  <path class="mansion" d="M795 179V148L817 131V145L840 127 863 145V133L884 150V179Z"/>
  <path class="mansion" d="M826 137V112L835 112V127M835 112L839 104 843 112M872 145V122L879 122V151"/>
  <path class="windows" d="M810 155h7v12h-7zm17 3h8v13h-8zm20-1h7v11h-7zm22 1h6v10h-6z"/>
  <path d="M0 186Q144 178 284 187T564 184T960 186V211Q808 201 665 209T359 206T0 211Z" fill="#a8967950"/>
  <path d="M0 194Q160 187 310 194T620 192T960 194V360H0Z" fill="url(#lake)"/>
  <g clip-path="url(#waterClip)" fill="none" stroke-linecap="round">
   <path d="M721 199h37M704 203h67M712 208h54M697 213h82M708 219h65M700 225h88M713 232h74M704 240h97M719 249h75M710 260h104M728 272h85M716 286h111M735 302h93M718 320h128M744 340h105" stroke="#ddc99a" opacity=".3"/>
   <path d="M0 211h136M188 217h91M318 208h116M52 231h105M253 239h132M438 222h80M106 258h98M343 251h130M566 237h92M42 281h128M234 278h82M499 269h140M85 309h101M395 303h94M184 337h101M512 333h72" stroke="#9eb0a7" opacity=".16"/>
   <path d="M0 222h960M0 246h960M0 275h960M0 315h960" stroke="#02080a" opacity=".4"/>
  </g>
  <path d="M0 192Q160 187 310 193T620 191T960 194" fill="none" stroke="#a9aaa0" opacity=".45"/>
  <path d="M685 197Q745 194 804 199" fill="none" stroke="#fff4d2" stroke-width="2" opacity=".65" filter="url(#soften)"/>
  <path d="M707 207Q744 203 777 208M718 221Q751 218 790 222M728 240Q759 237 799 241M738 265Q774 262 812 266M748 294Q783 291 825 296" fill="none" stroke="#f5ddb0" stroke-width="1.2" opacity=".38"/>
  <path d="M0 213Q100 202 198 211T398 211T596 208" fill="none" stroke="#c6b27e" opacity=".14"/>
  <path d="M0 251Q82 225 183 240Q251 250 294 360H0ZM960 225Q870 220 820 248Q779 272 756 360H960Z" fill="url(#shore)"/>
  <path d="M0 268Q85 239 167 252Q224 261 259 315M960 243Q876 231 833 264Q803 286 784 330" fill="none" stroke="#5b5140" stroke-width="4" opacity=".5"/>
  <g fill="#37342c" opacity=".8"><ellipse cx="83" cy="265" rx="22" ry="5"/><ellipse cx="128" cy="255" rx="16" ry="4"/><ellipse cx="867" cy="251" rx="18" ry="4"/><ellipse cx="824" cy="266" rx="13" ry="3"/></g>
  <path d="M0 242Q91 218 177 237M960 231Q873 221 817 251" fill="none" stroke="#64553d" opacity=".5"/>
  <g class="reed"><path d="M42 360q8-68 1-127m9 127q-2-53 15-91m-48 91q12-47 3-82m886 82q-10-67-1-132m-12 132q6-49-18-89m38 89q-8-44 11-70"/></g>
  <g class="reed-light"><path d="M43 300l-13-16m19 31 16-20m-27 33-15-14m878-7 12-17m-23 35-17-19m38 35 14-17"/></g>
  <rect width="960" height="360" filter="url(#grain)" opacity=".22"/>
  </svg><svg class="scene-line${hr?' event':''}" viewBox="0 0 410 280" preserveAspectRatio="none" aria-hidden="true"><path d="M410 0C360 90 218 270 10 275"/></svg><div class="${hr?'scene-rod-event':'scene-rod'}">${sceneRod(r[5])}</div><div class="st" id="st">Prêt à pêcher dans ${z[0]}</div><div id="bob"></div>
  <div class="panel cast-panel"><button class="btn" id="go" onclick="Engine.act()">Lancer</button><div class="bar" id="tm"><i></i></div><span class="mu cast-hint">Espace pour lancer ou ferrer · combat automatique</span></div></div>
  <div class="panel weather-banner" id="weather-banner"></div><div class="panel water-info"><div class="row sp"><span><b style="color:${r[5]}">${r[0]}</b> · chance ×${luck().toFixed(2)}${hr&&hr[3]==='value'?' · valeur ×'+hr[4]:''} · ferrage ${r[4]} ms</span><span class="row" id="lv">Niv. ${lb.l} <div class="bar"><i style="width:${lb.p*100}%"></i></div></span></div>
  <div class="row bait-row">${baitButtons()}</div></div>
  <div id="res">${Engine.last?'':'<div class="panel mu">Ta dernière prise apparaîtra ici.</div>'}</div>
  <div id="evb"></div><div id="hwb"></div>`;
 },v_shop(){return Shop.render.call(this)},v_ench(){
  const er=this.er(),eq=rodEn(er),f=fx(),pr=Act.rerollPrice(er),owners=S.eb||{},rollable=EN.some((_,i)=>!eq.includes(i)&&(owners[i]==null||+owners[i]===er));
  const slots=Array.from({length:3},(_,slot)=>{const i=eq[slot];return i==null?`<div class="panel mu" style="flex:1 1 150px;text-align:center;padding:12px">Emplacement ${slot+1}<br>Vide</div>`:`<div class="panel" style="flex:1 1 150px;text-align:center;padding:12px"><b>${EN[i][1]} ${EN[i][0]}</b><div class="mu">Niveau ${S.en[i]|0}</div><button class="chip" style="margin-top:6px" onclick="Act.equip(${i})">Retirer · détruire</button></div>`}).join('');
  const P={B:'Appât gratuit',D:'Prise double',K:'Critique',R:'Rareté',H:'Seconde chance',A:'Bonus appât',P:'Rang supérieur',X:'Valeur/zone'},M={L:'Chance',S:'Vitesse',W:'Fenêtre',V:'Valeur',C:'Coffres',Q:'Gains coffres'};
  const act=Object.keys(M).filter(k=>Math.abs(f[k]-1)>.0005).map(k=>`${M[k]} ×${f[k].toFixed(3)}`).concat(Object.keys(P).filter(k=>f[k]>.0005).map(k=>`${P[k]} ${(f[k]*100).toFixed(1)} %`));
  const msg=this.msg;this.msg='';
  return `<div class="panel row sp"><b>🪨 Pierres d'enchante : ${S.es|0}</b><span class="mu">Elles se pêchent au hasard · 1 pierre = +1 niveau de V à X</span></div>
  ${msg?`<div class="panel pop" style="border-color:var(--gr)">${msg}</div>`:''}
  <h2>Bonus actifs <span class="mu" style="font-size:13px;font-weight:500">— canne équipée : ${RODS[S.rod][0]}</span></h2>
  <div class="row" style="margin-bottom:12px">${act.length?act.map(x=>`<span class="chip">${x}</span>`).join(''):'<span class="mu">Aucun bonus actif</span>'}</div>
  <h2>🎣 Enchanter une canne <span class="mu" style="font-size:13px;font-weight:500">— 3 emplacements max</span></h2>
  <div class="row" style="margin-bottom:12px">${S.rods.map(i=>`<button class="chip ${i===er?'on':''}" onclick="UI.ed=${i};UI.render()">${RODS[i][0]} · ${rodEn(i).length}/3${i===S.rod?' ✔':''}</button>`).join('')}</div>
  <h2>Emplacements équipés · ${eq.length}/3</h2><div class="row" style="align-items:stretch;margin-bottom:12px">${slots}</div>
  <div class="panel"><div class="mu">Un enchantement tiré au hasard (niveau I à V) est lié à la canne sélectionnée et ne peut pas être réutilisé sur une autre. Son prix de reroll dépend de la valeur de cette canne. Le retirer de son emplacement le détruit définitivement, niveau compris.</div><button class="btn g" style="margin-top:10px" onclick="Act.reroll()" ${eq.length>=3||S.c<pr||!rollable?'disabled':''}>🎲 Reroll · ${fmt(pr)} 🪙</button></div>
  <h2>📜 Enchantements</h2><div class="grid">${EN.map((e,i)=>{const l=S.en[i]|0,on=eq.includes(i),up=l>0&&l<e[5],pc=Act.enPrice(i);
   const owner=owners[i]==null?null:+owners[i],locked=owner!=null&&owner!==er;
   return `<div class="fc ${l&&!locked?'':'lock'}" style="--a:${on?'#22e39a':'#a855f7'}"><div style="font-size:40px">${e[1]}</div><b>${e[0]}</b><div class="mu" style="font-size:12px">${e[2]}<br>+${(e[4]*ENSCALE*100).toFixed(1)} % par niveau · Niv. ${l}/${e[5]}</div>
   <div class="row" style="justify-content:center;margin-top:6px">${locked?'<span class="mu">Indisponible sur cette canne</span>':on?`<span class="mu">Dans le slot ${eq.indexOf(i)+1}</span>`:l?`<button class="chip" onclick="Act.equip(${i})" ${eq.length>=3?'disabled':''}>Équiper</button>`:'<span class="mu">Obtenu par reroll</span>'}${up&&!locked?`<button class="btn sm" onclick="Act.upgrade(${i})" ${(l<5?S.c<pc:!(S.es>0))?'disabled':''}>${l<5?'+1 niv · '+fmt(pc)+' 🪙':'+1 niv · 1 🪨'}</button>`:''}</div></div>`}).join('')}</div>
  <h2>🏺 Artefacts <span class="mu" style="font-size:13px;font-weight:500">— ${S.ae.length}/3 équipés · uniquement dans les coffres</span></h2><div class="grid">${AR.map((a,i)=>{const o=S.ao[i],q=S.ae.includes(i),c=CHESTS[a[2]];
   return `<div class="fc" style="--a:${c[1]};${o?'':'filter:grayscale(1);opacity:.55'}"><small style="color:${c[1]};font-weight:800">${c[0]}</small><div style="font-size:46px">${a[1]}</div><b>${o?a[0]:'???'}</b><div class="mu" style="font-size:12px">${artDesc(a)}</div>${o?`<button class="btn sm ${q?'':'g'}" style="margin-top:6px" onclick="Act.aeq(${i})">${q?'Retirer':'Équiper'}</button>`:'<div class="mu" style="font-size:12px;margin-top:6px">À trouver en coffre</div>'}</div>`}).join('')}</div>`;
 },v_prest(){
  const g=Pr.gain(),can=Pr.can(),msg=this.msg;this.msg='';
  return `${msg?`<div class="panel pop" style="border-color:var(--gr)">${msg}</div>`:''}
  <div class="panel"><h2 style="margin-top:0">⭐ Prestige</h2><div class="row"><span class="chip">⭐ ${S.pr|0} étoile(s)</span><span class="chip">Valeur +${((S.pr|0)*Pr.vb()*100).toFixed(0)} %</span><span class="chip">Chance +${((S.pr|0)*Pr.lb()*100).toFixed(0)} %</span><span class="chip">${S.pn|0} prestige(s)</span></div>
  <p class="mu">Chaque ⭐ donne <b>+${Pr.vb()*100} % de valeur</b> et <b>+${Pr.lb()*100} % de chance</b> pour toujours. Le nombre d'étoiles gagnées dépend de la valeur de poissons pêchés pendant cette partie : <b>${fmt(S.fv||0)} 🪙</b>.</p>
  <p class="mu">Il te faut <b>1 🌠 Étoile filante</b> (tu en as <b>${S.pt|0}</b> ${can?'✅':'❌'}). C'est un objet très rare : il se pêche au hasard, ou sort des coffres Mythique et au-dessus.</p>
  <div class="mu">Tu gardes : cannes événement, artefacts, quêtes, index, mutations, succès, ⭐ et tes autres 🌠.<br>Tu perds : pièces, cannes normales, zones, appâts, poissons, coffres, enchantements, pierres, niveau de pêche et citrouilles. La boutique Halloween est réinitialisée.</div>
  <button class="btn gold" style="margin-top:12px" onclick="Act.prestige()" ${can?'':'disabled'}>${can?`Faire un prestige · +${g} ⭐`:'Il te faut une 🌠 Étoile filante'}</button></div>`;
 },v_quest(){
  const s=Q.st(),t=(this.qt==='e'&&!HW.on())?'h':this.qt,msg=this.msg;this.msg='';
  const tabs=[['h','⏱️ Heure'],['d','📅 Jour'],['w','🗓️ Semaine'],...(HW.on()?[['e','🎃 Événement'+(HW.ready()?' ●'+HW.ready():'')]]:[])].map(([k,n])=>`<button class="chip ${t===k?'on':''}" onclick="UI.qt='${k}';UI.render()">${n}</button>`).join('');
  if(t==='e'&&HW.on()){const h=HW.st();return `${msg?`<div class="panel pop" style="border-color:var(--gr)">${msg}</div>`:''}
  <div class="row sp" style="margin-bottom:12px"><span class="row">${tabs}</span><span class="mu">Fin dans ${HW.left()}</span></div>
  <div class="panel row sp" style="border-color:#fb923c"><b>🎃 ${fmt(h.pk)} citrouille(s)</b><span class="mu">+1 par poisson · +2 si muté · +20 mutation Halloween · +10 par boss</span></div>
  <h2>Quêtes de l'événement</h2><div class="grid">${HQ.map(q=>{const p=HW.prog(q),done=!!h.done[q[0]],ok=p>=q[3];return `<div class="fc" style="--a:${done?'#22e39a':ok?'#fbbf24':'#fb923c'}"><small style="font-weight:800;color:${done?'var(--gr)':'#fb923c'}">${done?'TERMINÉE':'ÉVÉNEMENT'}</small><b>${q[1]}</b><div class="mu" style="font-size:12px">${q[2]}</div><div class="bar" style="margin:8px auto;max-width:90%"><i style="width:${p/q[3]*100}%"></i></div><div class="mu">${fmt(p)} / ${fmt(q[3])} · <b style="color:#fb923c">${q[5]} 🎃</b> · <b style="color:var(--gold)">${fmt(Math.round(q[6]*Q.mult()))} 🪙</b></div><button class="btn sm ${ok&&!done?'g':''}" style="margin-top:6px" onclick="HW.claim('${q[0]}')" ${ok&&!done?'':'disabled'}>${done?'✔ Réclamée':ok?'Réclamer':'En cours'}</button></div>`}).join('')}</div>
  <h2>Boutique de l'événement</h2><div class="grid">${HS.map(it=>{const n=h.shop[it[0]]|0,can=h.pk>=it[2]&&n<it[3];return `<div class="fc" style="--a:#fb923c"><b>${it[1]}</b>${it[4]?`<div class="mu" style="font-size:12px;margin-top:4px">${it[4]}</div>`:''}<div class="mu">${it[2]} 🎃 · ${n}/${it[3]} achetés</div><button class="btn sm ${can?'g':''}" style="margin-top:6px" onclick="HW.buy('${it[0]}')" ${can?'':'disabled'}>${n>=it[3]?'Épuisé':'Acheter'}</button></div>`}).join('')}</div>`}
  return `${msg?`<div class="panel pop" style="border-color:var(--gr)">${msg}</div>`:''}
  <div class="row sp" style="margin-bottom:12px"><span class="row">${tabs}</span><span class="mu">Réinitialisation dans ${Q.left(t)}</span></div>
  <div class="grid">${QD[t].map(q=>{const p=Q.prog(t,q),done=!!s[t].done[q[0]],ok=p>=q[3];
   return `<div class="fc" style="--a:${done?'#22e39a':ok?'#fbbf24':'#38bdf8'}"><small style="font-weight:800;color:${done?'var(--gr)':'var(--pu)'}">${done?'TERMINÉE':'QUÊTE'}</small><b>${q[1]}</b><div class="mu" style="font-size:12px">${q[2]}</div><div class="bar" style="margin:8px auto;max-width:90%"><i style="width:${p/q[3]*100}%"></i></div><div class="mu">${fmt(p)} / ${fmt(q[3])} · <b style="color:var(--gold)">${fmt(Q.reward(q))} 🪙</b></div><button class="btn sm ${ok&&!done?'g':''}" style="margin-top:6px" onclick="Act.qClaim('${t}','${q[0]}')" ${ok&&!done?'':'disabled'}>${done?'✔ Réclamée':ok?'Réclamer':'En cours'}</button></div>`}).join('')}</div>`;
 },v_inv(){
 const rods=[...new Set((S.rods||[]).filter(i=>Number.isInteger(i)&&i>=0&&i<RODS.length))].sort((a,b)=>a-b);
 const baits=BAITS.map((b,i)=>({b,i,n:S.baits[i]|0})).filter(x=>x.n>0);
 const keys=Object.keys(S.inv).sort((a,b)=>b.split('-')[0]-a.split('-')[0]),ch=Object.keys(S.chests).filter(t=>S.chests[t]>0);
 const fv=S.fav||[];
 if(!rods.length&&!baits.length&&!keys.length&&!ch.length&&!fv.length)return '<div class="panel mu">Ton inventaire est vide. Va pêcher !</div>';
 const tot=keys.reduce((a,k)=>a+S.inv[k].v,0);
 const rodItems=`<h2>🎣 Cannes (${rods.length})</h2><div class="grid" style="margin-bottom:12px">${rods.map(i=>{const r=RODS[i],hr=HWRODS[i-BASE_RODS],enchants=(S.re[i]||[]).filter(j=>EN[j]&&(S.en[j]|0)>0);
  return `<div class="fc inv-rod" style="--a:${r[5]}"><div class="em">${hr?hr[6]:rodArt(r[5])}</div><b style="text-align:center;color:${r[5]}">${r[0]}</b><div class="mu" style="text-align:center">🍀 Chance ×${r[2]} · ⚡ Vitesse ×${r[3]} · 🎯 ${r[4]} ms</div><div class="inv-enchants"><b style="color:var(--tx)">✨ Enchantements</b>${enchants.length?enchants.map(j=>`<div>${EN[j][1]} ${EN[j][0]} · Nv. ${S.en[j]} <span>(${EN[j][2]} +${(EN[j][4]*ENSCALE*S.en[j]*100).toFixed(1).replace('.0','')} %)</span></div>`).join(''):'<div>Aucun enchantement équipé</div>'}</div><button class="btn sm ${S.rod===i?'eq':'g'}" style="width:100%" onclick="${hr?`Act.equipEventRod(${i-BASE_RODS})`:`Act.buyRod(${i})`}" ${S.rod===i||hr&&level()<hr[1]?'disabled':''}>${S.rod===i?'✓ Équipée':hr&&level()<hr[1]?'🔒 Niveau '+hr[1]:'Équiper'}</button></div>`}).join('')}</div>`;
 const baitItems=baits.length?`<h2>🪱 Appâts (${baits.length})</h2><div class="row bait-row" style="margin-bottom:12px">${baitButtons()}</div>`:'';
 const chests=ch.length?`<h2>📦 Coffres</h2><div class="grid" style="margin-bottom:12px">${ch.map(t=>`<div class="fc" style="--a:${CHESTS[t][1]}"><div class="em">${chestArt(+t)}</div><b>${CHESTS[t][0]} ×${S.chests[t]}</b><button class="btn sm" onclick="UI.openChest(${t})">Ouvrir</button> <button class="chip" onclick="Act.sellChest(${t})">Vendre ${fmt(CHESTS[t][3])}</button></div>`).join('')}</div>`:'';
 const fish=keys.length?`<div class="panel row sp"><b>Poissons : 🪙 ${fmt(tot)}</b><span class="row"><button class="btn g sm" onclick="Act.sell(-1)">Tout vendre (sauf ⭐)</button>${TIERS.map((t,i)=>keys.some(k=>k.startsWith(i+'-'))?`<button class="chip" style="color:${t[1]}" onclick="Act.sell(${i})">${t[0]}</button>`:'').join('')}</span></div>
 <div class="grid">${keys.map(k=>{const[t,j]=k.split('-'),f=FISH[t][j],e=S.inv[k];return `<div class="fc" style="--a:${TIERS[t][1]}"><div class="em">${art(f,+t)}</div><b>${f[0]}</b><div class="mu">×${e.n} · 🪙 ${fmt(e.v)}</div></div>`}).join('')}</div>`:'';
 const favs=`<div class="panel row sp"><span>⭐ Mettre automatiquement les poissons <b>mutés</b> en favoris</span><button class="chip ${S.af!==0?'on':''}" onclick="Act.toggleAf()">${S.af!==0?'Activé':'Désactivé'}</button></div>`+(fv.length?`<h2>⭐ Favoris (${fv.length}/${FAVMAX}) · 🪙 ${fmt(fv.reduce((a,f)=>a+f.v,0))}</h2><div class="grid" style="margin-bottom:12px">${fv.map((f,i)=>{const F=FISH[f.t][f.j],m=f.m>=0?MUT[f.m]:null;return `<div class="fc${m?' mut':''}" style="--a:${m?m[2]:TIERS[f.t][1]}"><div class="em${m&&f.m===6?' pr':''}"${m?` style="filter:${m[5]}"`:''}>${art(F,+f.t)}</div><b>${F[0]}</b><div class="mu">${m?m[1]+' '+m[0]+' · ':''}🪙 ${fmt(f.v)}</div><button class="chip" onclick="Act.sellFav(${i})">Vendre</button> <button class="chip" onclick="Act.unfav(${i})">Retirer ⭐</button></div>`}).join('')}</div>`:'');
 return rodItems+baitItems+favs+chests+fish;
  },v_ach(){
    const msg=this.msg;this.msg='';
    const head=`${msg?`<div class="panel pop" style="border-color:var(--gr)">${msg}</div>`:''}<div class="panel row sp" style="margin-bottom:12px"><b>🏆 ${Ach.trophies()} trophée(s)</b></div>`;
    return head+`<div class="grid">${ACH.map(a=>{const t=a[4](),v=a[5](),d=Ach.done(a),c=Ach.claimed(a),all=d>=t.length,nx=t[Math.min(d,t.length-1)],ic=Ach.icons(a),pend=Ach.pending(a);
    return `<div class="fc" style="--a:${all&&c>=t.length?'#22e39a':d>c?'#fbbf24':'#38bdf8'}"><div class="em" style="font-size:34px;height:44px">${a[3]}</div><b>${a[1]}</b><div class="mu" style="font-size:12px">${a[2]}</div><div style="margin:6px 0;font-size:20px">${ic.map((x,i)=>`<span style="opacity:${i<c?1:i<d?.8:.22}">${x}</span>`).join('')}</div><div class="bar" style="margin:6px auto;max-width:90%"><i style="width:${Math.min(1,v/nx)*100}%"></i></div><div class="mu">${fmt(Math.min(v,nx))} / ${fmt(nx)}</div>${d>c?`<button class="btn sm g" style="margin-top:6px" onclick="Ach.claim('${a[0]}')">Réclamer +${fmt(pend.g)} 🪙${pend.s?' +'+pend.s+' 🪨':''}</button>`:all&&c>=t.length?'<div class="mu" style="color:var(--gr);font-weight:800;margin-top:6px">✔ Complété</div>':''}</div>`}).join('')}</div>`;
  },openChest(t){this.ct=t;this.tab='open';this.render()},strip(t,n=44,win=-1,w=null){const L=HW_CHEST_IDS.includes(t)?hwLoot(t):loot(t),ws=L.map(x=>x[3]);return Array.from({length:n},()=>{const r=resolve(L[pickW(ws)]);return `<div class="fc rc" style="--a:${r.c}">${r.html}</div>`}).join('')},v_open(){
  const t=this.ct,C=CHESTS[t],L=HW_CHEST_IDS.includes(t)?hwLoot(t):loot(t),tot=L.reduce((a,x)=>a+x[3],0);
  setTimeout(()=>{const rl=$('#rl');if(rl&&!this.busy)rl.innerHTML=this.strip(t)});
  return `<div class="panel row sp"><b style="color:${C[1]}">Coffre ${C[0]} <span id="cn">×${S.chests[t]||0}</span></b><button class="chip" onclick="UI.go('inv')">← Retour</button></div>
  <div class="panel"><div class="roul"><div class="pin"></div><div class="rl" id="rl"></div></div><div class="row" style="justify-content:center;margin-top:12px"><button class="btn gold" id="ob" onclick="UI.open()" ${S.chests[t]>0?'':'disabled'}>Ouvrir le coffre</button></div><div id="rw"></div></div>
  <h2>Contenu & probabilités</h2><div class="grid">${L.map(x=>{const r=resolve(x);return `<div class="fc" style="--a:${r.c}">${r.html}<div class="mu">${(x[3]/tot*100).toFixed(1)} %</div></div>`}).join('')}</div>`;
 },open(){
  const t=this.ct;if(this.busy||!(S.chests[t]>0))return;
  this.busy=1;S.chests[t]--;Q.add('open');HW.add('open');S.op=(S.op|0)+1;$('#ob').disabled=true;$('#rw').innerHTML='';
  const L=HW_CHEST_IDS.includes(t)?hwLoot(t):loot(t),ws=L.map(x=>x[3]),win=resolve(L[pickW(ws)]),W=36;
  const cells=Array.from({length:44},(_,i)=>i===W?win:resolve(L[pickW(ws)]));
  const rl=$('#rl'),box=rl.parentNode;
  rl.style.transition='none';rl.style.transform='translateX(0)';
  rl.innerHTML=cells.map(r=>`<div class="fc rc" style="--a:${r.c}">${r.html}</div>`).join('');
  rl.offsetWidth;
  rl.style.transition='transform 4.6s cubic-bezier(.12,.7,.08,1)';
  rl.style.transform=`translateX(${-(W*132+66-box.clientWidth/2+rnd(-45,45))}px)`;
  setTimeout(()=>{win.apply();if(!S.chests[t])delete S.chests[t];save();this.busy=0;this.head();
   if(this.tab!=='open')return;
   $('#cn').textContent='×'+(S.chests[t]||0);$('#ob').disabled=!(S.chests[t]>0);
   $('#rw').innerHTML=`<div class="panel catch pop" style="--a:${win.c};margin-top:12px"><div><div style="color:${win.c};font-weight:900">Tu as obtenu :</div><b>${win.lab}</b></div></div>`},4700);
 },v_lb(){
  return `<div class="panel"><h2>🏅 Classement mondial</h2><div class="mu">Compare les joueurs par lancers, pièces, poissons capturés et poisson le plus rare. Les données viennent des comptes en ligne.</div></div>${Cloud.lbView()}`;
 },v_dex(){
  const all=FISH.flat().length,got=Object.keys(S.idx).length;
  return `<div class="panel row sp"><b>Index : ${got}/${all} · 🐉 Boss vaincus : ${Object.values(S.bk||{}).reduce((a,b)=>a+b,0)}</b><button class="chip" onclick="Act.reset()">Réinitialiser la partie</button></div>`+TIERS.map((T,t)=>`<h2 style="color:${T[1]}">${T[0]}</h2><div class="grid">${FISH[t].map((f,j)=>{const n=S.idx[t+'-'+j],w=WEATHER.find(x=>x[0]===f[8]);return `<div class="fc ${n?'':'lock'}" style="--a:${T[1]}"><div class="em ${n?'':'sil'}">${art(f,t)}</div><b>${n?f[0]:'???'}</b><div class="mu">${n?'×'+n+' · ':''}${w?`${w[2]} Exclusif · ${w[1]} · `:''}${f[4]!=null?'Zone : '+ZONES[f[4]][0]:'Toutes zones'}${n&&(S.rec||{})[t+'-'+j]?'<br>🏅 Record : '+S.rec[t+'-'+j]+' kg':''}</div></div>`}).join('')}</div>`).join('')+Mut.dex();
 }
});
