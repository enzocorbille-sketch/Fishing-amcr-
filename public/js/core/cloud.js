/* ============ 6b. COMPTE EN LIGNE (Cloudflare) ============ */
var esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
var Cloud={
 tok:localStorage.getItem('catbet-tok')||'',user:localStorage.getItem('catbet-user')||'',
 base:+localStorage.getItem('catbet-base')||0,pending:localStorage.getItem('catbet-pend')==='1',
 busy:0,force:0,timer:0,v:0,msg:'',mode:'login',code:'',bk:null,refused:0,admin:false,adm:null,sessionStart:Date.now(),lastPlaySync:Date.now(),lb:{board:'casts',rows:null,me:null,hide:false,loading:false,error:'',request:0},
 set(k,v){try{v==null?localStorage.removeItem('catbet-'+k):localStorage.setItem('catbet-'+k,v)}catch(e){}},
 async api(path,method,body,keep){
  const r=await fetch('/api/'+path,{method,keepalive:!!keep,headers:{'Content-Type':'application/json',...(this.tok?{Authorization:'Bearer '+this.tok}:{})},body:body?JSON.stringify(body):undefined});
  let j={};try{j=await r.json()}catch(e){}return{ok:r.ok,status:r.status,j}},
 // la partie la plus avancée = celle qui a le plus de lancers (le prestige remet l'XP à zéro, pas les lancers)
 ahead(a,b){const x=a.casts||0,y=b.casts||0;return x>y||(x===y&&(a.xp||0)>(b.xp||0))},
 dirty(){this.v++;this.pending=true;this.set('pend','1');if(!this.tok||this.refusedNow()){this.badge();return}if(!this.timer)this.timer=setTimeout(()=>{this.timer=0;this.push()},5000);this.badge()},
 refusedNow(){return this.refused&&Date.now()-this.refused<6e4},
 syncPlay(){
  if(!this.tok||document.hidden)return;
  const now=Date.now(),elapsed=Math.floor((now-this.lastPlaySync)/1000);
  if(elapsed>0){S.play=(S.play||0)+elapsed;this.lastPlaySync=now}
 },
 async push(retry){
  if(!this.tok||this.busy||this.refusedNow())return;this.busy=1;clearTimeout(this.timer);this.timer=0;let again=0;const v=this.v;
  try{
   this.syncPlay();
   const r=await this.api('save','PUT',{data:S,base:this.base,force:this.force},document.hidden);
   if(r.status===401){return this.drop()}
   if(r.status===422){this.refused=Date.now();this.msg='⚠ '+(r.j.error||'Sauvegarde en ligne refusée')+' Ta partie reste sur cet appareil.'}
   else if(r.status===409){
    const c=r.j.data||{};
    if(!this.force&&this.ahead(c,S))this.adopt(c,r.j.updated);
    else{this.base=r.j.updated;this.set('base',this.base);again=!retry}
   }else if(r.ok){
    this.base=r.j.updated;this.set('base',this.base);this.force=0;this.msg='✓ Synchronisé';
    if(v===this.v){this.pending=false;this.set('pend',null)}else again=1;
   }else this.msg='⚠ Erreur serveur'
  }catch(e){this.msg='⚠ Hors ligne'}
  finally{this.busy=0;this.badge()}
  if(again)await this.push(true)
 },
 adopt(c,u){
  Object.assign(S,fresh(),c);delete S.fa;const migrated=migrateTank(S);try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}
  this.base=u;this.set('base',u);this.pending=false;this.set('pend',null);if(migrated)this.dirty();this.msg='✓ Progression récupérée';UI.render();this.badge()},
 async pull0(){
  if(!this.tok||this.busy)return;
  try{
   const r=await this.api('save','GET');
   if(r.status===401)return this.drop();
   if(!r.ok)return;
   this.admin=!!r.j.admin;this.badge();
   const c=r.j.data,u=r.j.updated;
   if(!c){this.base=0;this.set('base',0);if(S.xp||S.casts)await this.push();return}
   if(u===this.base){if(this.pending)await this.push();return}
   if(!this.pending)this.adopt(c,u);
   else if(this.ahead(c,S))this.adopt(c,u);
   else{this.base=u;this.set('base',u);await this.push()}
  }catch(e){this.msg='⚠ Hors ligne';this.badge()}
 },
 async auth(){
  const u=$('#cu').value.trim(),p=$('#cp').value,body={username:u,password:p};this.msg='…';this.panel();
  if(this.mode==='recover')body.code=$('#cc').value;
  const r=await this.api(this.mode,'POST',body).catch(()=>null);
  if(!r){this.msg='⚠ Serveur injoignable';return this.panel()}
  if(!r.ok){this.msg=r.j.error||'Erreur';return this.panel()}
  this.tok=r.j.token;this.user=r.j.username;this.admin=!!r.j.admin;this.set('tok',this.tok);this.set('user',this.user);
  const c=r.j.data,u2=r.j.updated||0,mine=(S.xp||0)>0||(S.casts||0)>0;
  if(!c){this.base=0;this.set('base',0);this.force=0;this.dirty();this.push()}
  else if(!mine)this.adopt(c,u2);
  else{
   const lv=x=>Math.min(100,Math.floor(Math.sqrt((x.xp||0)/4000))+1);
   const keepCloud=confirm(`Ce compte a déjà une partie : niveau ${lv(c)}, ${fmt(c.c||0)} pièces, ${fmt(c.casts||0)} lancers.\nCet appareil a aussi une partie : niveau ${lv(S)}, ${fmt(S.c||0)} pièces, ${fmt(S.casts||0)} lancers.\n\nOK = garder la partie du compte\nAnnuler = envoyer celle de cet appareil (elle remplace celle du compte)`);
   if(keepCloud)this.adopt(c,u2);else{this.base=u2;this.set('base',u2);this.force=1;this.dirty();this.push()}
  }
  this.msg='';this.refused=0;this.badge();
  if(r.j.recovery){this.code=r.j.recovery;this.panel()}else this.close()
 },
 forget(){this.tok='';this.user='';this.admin=false;this.adm=null;this.lb.rows=null;this.set('tok',null);this.set('user',null);this.set('base',null);this.base=0},
 drop(){this.busy=0;this.forget();this.msg='Session expirée : reconnecte-toi.';this.badge()},
 wipe(){this.forget();this.set('pend',null);try{localStorage.removeItem(KEY)}catch(e){}location.reload()},
 async logout(){
  if(this.pending)await this.push();
  if(this.pending&&!confirm('La dernière sauvegarde en ligne a échoué : les changements récents seront perdus. Se déconnecter quand même ?'))return;
  try{await this.api('logout','POST')}catch(e){}
  this.wipe()
 },
 async del(){
  const p=prompt('Pour supprimer définitivement ton compte et ta sauvegarde en ligne, tape ton mot de passe :');if(!p)return;
  const r=await this.api('account','DELETE',{password:p}).catch(()=>null);
  if(!r||!r.ok){this.msg=(r&&r.j.error)||'⚠ Serveur injoignable';return this.panel()}
  this.forget();this.msg='Compte supprimé. Ta partie reste sur cet appareil.';this.panel();this.badge()
 },
 async sync(){this.refused=0;this.msg='…';this.panel();await this.pull();if(this.pending)await this.push();this.panel()},
 copy(){try{navigator.clipboard.writeText(this.code);UI.toast('Code copié')}catch(e){}},
 codeOk(){this.code='';this.close()},
 async newCode(){
  const p=prompt('Tape ton mot de passe pour générer un nouveau code (l\'ancien ne marchera plus) :');if(!p)return;
  const r=await this.api('recovery-code','POST',{password:p}).catch(()=>null);
  if(!r||!r.ok){this.msg=(r&&r.j.error)||'⚠ Serveur injoignable';return this.panel()}
  this.code=r.j.recovery;this.panel()
 },
 // --- administration (compte admin uniquement ; le serveur refuse tout autre compte)
 async admOpen(){
 this.adm={users:null,logs:null,sel:null,q:'',sort:'updated',view:'users'};this.msg='…';this.panel();
  const r=await this.api('admin/users','GET').catch(()=>null);
  if(!r||!r.ok){this.adm=null;this.msg=(r&&r.j.error)||'⚠ Accès refusé';return this.panel()}
  this.adm.users=r.j.users;this.msg='';this.panel()
 },
 async admLogs(){
 this.adm.view='logs';this.adm.logs=null;this.msg='…';this.panel();
 const r=await this.api('admin/logs?limit=200','GET').catch(()=>null);
 if(!r||!r.ok){this.msg=(r&&r.j.error)||'⚠ Impossible de charger les logs';return this.panel()}
 this.adm.logs=r.j.logs;this.msg='';this.panel()
 },
 async admUser(id){
  const r=await this.api('admin/user?user_id='+id,'GET').catch(()=>null);
  if(!r||!r.ok){this.msg=(r&&r.j.error)||'⚠ Erreur';return this.panel()}
  this.adm.sel={...r.j,tmp:'',k:(this.adm.sel&&this.adm.sel.k)||'coins'};this.msg='';this.panel()
 },
 admCat(k){this.adm.sel.k=k;this.panel()},
 admGive(mode){const s=this.adm.sel,k=$('#gk').value,gi=$('#gi'),gn=$('#gn'),op={k,id:gi?+gi.value:0,n:gn?+gn.value:1,mode},id=s.user.id;
  this.admDo('grant',{user_id:id,op},async()=>{await this.admUser(id);this.msg='✓ Envoyé. Il s\'applique dans les 30 s si le joueur a le jeu ouvert (sinon à sa prochaine connexion).';this.panel()})},
 admUndo(){if(!confirm('Retirer au joueur tout ce que tu lui as donné (les dons non encore annulés) ?'))return;const id=this.adm.sel.user.id;this.admDo('undo',{user_id:id},async j=>{await this.admUser(id);this.msg='✓ '+j.count+' don(s) annulé(s).';this.panel()})},
 admBack(){if(this.adm&&this.adm.sel){this.adm.sel=null;this.msg=''}else if(this.adm&&this.adm.view==='logs'){this.adm.view='users';this.msg=''}else this.adm=null;this.panel()},
 async admDo(path,body,after){
  const r=await this.api('admin/'+path,'POST',body).catch(()=>null);
  if(!r||!r.ok){this.msg=(r&&r.j.error)||'⚠ Erreur';return this.panel()}
  await after(r.j)
 },
 admRestore(bid){if(!confirm('Remplacer la partie de ce joueur par cette sauvegarde ?'))return;const id=this.adm.sel.user.id;this.admDo('restore',{user_id:id,id:bid},async()=>{await this.admUser(id);this.msg='✓ Sauvegarde restaurée pour ce joueur.';this.panel()})},
 admUnflag(){const id=this.adm.sel.user.id;this.admDo('unflag',{user_id:id},async()=>{await this.admUser(id);await this.admList()})},
 admReset(){if(!confirm('Générer un mot de passe temporaire pour ce joueur ? Il sera déconnecté de tous ses appareils.'))return;const id=this.adm.sel.user.id;this.admDo('reset-password',{user_id:id},async j=>{this.adm.sel.tmp=j.password;this.msg='';this.panel()})},
 admDel(){const n=this.adm.sel.user.username;if(prompt('Supprimer définitivement le compte « '+n+' » et ses sauvegardes ? Tape son pseudo pour confirmer :')!==n)return;this.admDo('delete',{user_id:this.adm.sel.user.id},async()=>{this.adm.sel=null;await this.admList();this.msg='Compte supprimé.';this.panel()})},
 async admList(){const r=await this.api('admin/users','GET').catch(()=>null);if(r&&r.ok)this.adm.users=r.j.users;this.panel()},
 // --- dons / retraits de l'admin : appliqués ici en direct, puis confirmés au serveur (jamais appliqués deux fois)
 opText(o){const N=fmt,n=o.n,nm=(l,i)=>(l[i]||['?'])[0],t={coins:()=>N(n)+' 🪙',xp:()=>N(n)+' XP',rod:()=>'canne '+nm(RODS,o.id),zone:()=>'zone '+nm(ZONES,o.id),chest:()=>n+' coffre(s) '+nm(CHESTS,o.id),bait:()=>n+' '+nm(BAITS,o.id),art:()=>'artefact '+nm(AR,o.id),stone:()=>n+' pierre(s) d\'enchantement',star:()=>n+' étoile(s) filante(s)'};return(o.mode==='remove'?'− ':'+ ')+(t[o.k]?t[o.k]():o.k)},
 applyOp(o){
  const sg=o.mode==='remove'?-1:1,n=+o.n||0,id=o.id|0,add=(m,k,v)=>{m[k]=Math.max(0,(m[k]||0)+v);if(!m[k])delete m[k]};
  switch(o.k){
   case 'coins':S.c=Math.max(0,(S.c||0)+sg*n);break;
   case 'xp':S.xp=Math.max(0,(S.xp||0)+sg*n);break;
   case 'stone':S.es=Math.max(0,(S.es|0)+sg*n);break;
   case 'star':S.pt=Math.max(0,(S.pt|0)+sg*n);break;
   case 'chest':if(CHESTS[id])add(S.chests,id,sg*n);break;
   case 'bait':if(BAITS[id]){add(S.baits,id,sg*n);if(!S.baits[id]&&S.bait===id)S.bait=-1}break;
   case 'rod':if(RODS[id]){if(sg>0){if(!S.rods.includes(id))S.rods.push(id)}else{S.rods=S.rods.filter(x=>x!==id);if(!S.rods.length)S.rods=[0];if(!S.rods.includes(S.rod))S.rod=S.rods[0]}}break;
   case 'zone':if(ZONES[id]){if(sg>0){if(!S.zones.includes(id))S.zones.push(id)}else{S.zones=S.zones.filter(x=>x!==id);if(!S.zones.length)S.zones=[0];if(!S.zones.includes(S.zone))S.zone=S.zones[0]}}break;
   case 'art':if(AR[id]){if(sg>0)S.ao[id]=1;else{delete S.ao[id];S.ae=S.ae.filter(x=>x!==id)}}break;
  }},
 async grantsPoll(){
  if(!this.tok||document.hidden)return;
  const r=await this.api('grants','GET').catch(()=>null);
  if(!r||!r.ok||!r.j.list||!r.j.list.length)return;
  const done=S.gr||[],news=r.j.list.filter(g=>!done.includes(g.id)),ids=r.j.list.map(g=>g.id);
  if(news.length){news.forEach(g=>this.applyOp(g.op));S.gr=done.concat(news.map(g=>g.id)).slice(-100);save();UI.render();UI.toast('🛠 Le dev a modifié ton inventaire : '+news.map(g=>this.opText(g.op)).join(', '))}
  await this.api('grants/ack','POST',{ids}).catch(()=>{})
 },
 async pull(){await this.pull0();await this.grantsPoll()},
 // --- classement (compte requis ; les comptes signalés et l'admin ne sont pas classés)
 async lbLoad(b){
  if(b)this.lb.board=b;if(!this.tok)return;const board=this.lb.board,request=++this.lb.request;this.lb.loading=true;this.lb.error='';UI.render();
  try{
   const r=await this.api('leaderboard?board='+board,'GET');
   if(request!==this.lb.request)return;
   if(r.ok){this.lb.rows=r.j.rows;this.lb.me=r.j.me;this.lb.hide=!!r.j.hidden;this.lb.error=''}
   else{this.lb.rows=[];this.lb.me=null;this.lb.error='⚠ '+(r.j.error||'Impossible de charger le classement.')}
  }catch(e){console.error('Leaderboard request failed.',e);if(request===this.lb.request){this.lb.rows=[];this.lb.me=null;this.lb.error='⚠ Erreur réseau : le classement est indisponible.'}}
  if(request===this.lb.request){this.lb.loading=false;UI.render()}},
 async lbHide(){
  try{
   const r=await this.api('leaderboard/hide','POST',{hide:!this.lb.hide});
   if(r.ok){this.lb.hide=!this.lb.hide;this.lb.rows=null;this.lb.error=''}
   else this.lb.error='⚠ '+(r.j.error||'Impossible de modifier la visibilité.');
  }catch(e){console.error('Leaderboard visibility update failed.',e);this.lb.error='⚠ Erreur réseau : visibilité non modifiée.'}
  UI.render()},
 lbView(){
  const L=this.lb;
  if(!this.tok)return '<div class="panel mu">Connecte-toi (bouton « 👤 Connexion » en haut) pour voir le classement et y apparaître.</div>';
  if(L.rows===null&&!L.loading)setTimeout(()=>this.lbLoad());
  const B=[['casts','🎣 Lancers'],['coins','🪙 Pièces'],['fish','🐟 Poissons attrapés'],['rare','👑 Poisson le plus rare'],['species','📖 Espèces'],['mut','🧬 Mutations'],['ach','🏆 Trophées']];
  const tabs=B.map(([k,n])=>`<button class="chip ${L.board===k?'on':''}" onclick="Cloud.lbLoad('${k}')">${n}</button>`).join('');
  const medal=i=>['🥇','🥈','🥉'][i]||('#'+(i+1));
  const value=(v,fish)=>L.board==='rare'?esc(this.rareFish(fish)):fmt(v);
  const playerName=r=>`${r.prestiges>0?'⭐'.repeat(Math.min(20,r.prestiges))+' ':''}${r.username}`;
  const rows=L.error?`<div class="mu" style="color:var(--gold)">${esc(L.error)}</div>`:L.loading||L.rows===null?'<div class="mu">Chargement…</div>':(L.rows.length?L.rows.map((r,i)=>`<div class="row sp" style="padding:6px 0;${r.me?'font-weight:800;color:var(--gold)':''}"><span>${medal(i)} ${esc(playerName(r))}</span><span>${value(r.value,r.fish)}</span></div>`).join(''):'<div class="mu">Personne pour l\'instant.</div>');
  const me=L.me&&!(L.rows||[]).some(r=>r.me)?`<div class="row sp mu" style="padding:6px 0;border-top:1px solid var(--line)"><span>#${L.me.rank} · ${esc(playerName({username:'toi',prestiges:L.me.prestiges}))}</span><span>${value(L.me.value,L.me.fish)}</span></div>`:'';
  return `<div class="row" style="margin-bottom:10px">${tabs}<button class="chip" onclick="Cloud.lb.rows=null;Cloud.lb.error='';UI.render()">↻</button></div><div class="panel">${rows}${me}</div><div class="panel row sp"><span class="mu">Tous les joueurs sont visibles dans le classement.${this.admin?' Seul le compte développeur peut modifier la visibilité.':''}</span>${this.admin?`<button class="chip" onclick="Cloud.lbHide()">${L.hide?'🙈 Masqué : me réafficher':'👁 Visible : me masquer'}</button>`:''}</div>`},
 rareFish(key){
  const m=/^(\d+)-(\d+)$/.exec(String(key||''));
  if(!m)return '—';
  const tier=+m[1],species=+m[2],fish=FISH[tier]&&FISH[tier][species];
  return fish&&TIERS[tier]?fish[0]+' · '+TIERS[tier][0]:'—';
 },
 evPreview(){try{localStorage.setItem('catbet-evpreview',localStorage.getItem('catbet-evpreview')==='1'?'0':'1')}catch(e){}this.panel();UI.render()},
 badge(){const b=$('#acc');if(b)b.textContent=this.tok?'☁ '+this.user+(this.pending?' ⏳':''):'👤 Connexion';const d=$('#devb');if(d)d.style.display=this.tok&&this.admin?'':'none'},
 close(){if(this.code)return;this.bk=null;this.adm=null;const m=$('#cm');if(m)m.remove()},
 panel(){
  let m=$('#cm');
  if(!m){m=document.createElement('div');m.id='cm';m.style.cssText='position:fixed;inset:0;z-index:20;background:#000a;display:flex;align-items:center;justify-content:center;padding:16px';m.onclick=e=>{if(e.target===m)this.close()};document.body.appendChild(m)}
  const lg=this.mode==='login',rc=this.mode==='recover';
  const lv=x=>Math.min(100,Math.floor(Math.sqrt((x||0)/4000))+1);
  const dt=t=>esc(new Date(t).toLocaleString('fr-FR',{dateStyle:'short',timeStyle:'short'}));
  const dur=s=>{s=Math.max(0,Math.floor(+s||0));const d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60);return(d?d+' j ':'')+(h? h+' h ':'')+m+' min'};
  const kind=b=>b.kind==='manual'?'💾 Manuelle':'🔄 Auto';
  const bkRows=(list,fn)=>`<div style="margin-top:10px">${list.map(b=>`<div class="row sp mu" style="margin:6px 0"><span>${kind(b)} · ${dt(b.ts)}<br>niv ${lv(b.xp)} · ${fmt(b.c)} 🪙 · ${fmt(b.casts)} lancers</span><button class="chip" onclick="${fn}(${+b.id})">Restaurer</button></div>`).join('')}</div>`;
  let inner;
  if(this.code)inner=`<h2>🔑 Code de récupération</h2><p class="mu">Si tu oublies ton mot de passe, ce code est le seul moyen de récupérer ton compte. Note-le ou range-le dans un gestionnaire de mots de passe : il ne sera plus jamais affiché.</p>
    <div class="panel" style="font:800 19px ui-monospace,monospace;text-align:center;user-select:all">${esc(this.code)}</div>
    <div class="row"><button class="chip" onclick="Cloud.copy()">Copier</button><button class="btn sm" onclick="Cloud.codeOk()">J'ai noté mon code</button></div>`;
  else if(this.adm&&this.adm.sel){const s=this.adm.sel,u=s.user,sm=s.summary||{},nm=(l,i)=>(l[i]||['?'])[0],names=(arr,l)=>(arr||[]).map(i=>nm(l,i)).join(', ')||'—',cnt=(o,l)=>Object.entries(o||{}).map(([k,v])=>v+'× '+nm(l,k)).join(', ')||'—';
   const KINDS=[['coins','Pièces'],['xp','XP'],['rod','Canne'],['zone','Zone'],['chest','Coffre'],['bait','Appât'],['art','Artefact'],['stone','Pierre d\'enchantement'],['star','Étoile filante']],LISTS={rod:RODS,zone:ZONES,chest:CHESTS,bait:BAITS,art:AR};
   inner=`<div class="row sp"><h2>🛠 ${esc(u.username)}</h2><button class="chip" onclick="Cloud.admBack()">← Joueurs</button></div>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr))"><div class="panel"><b>Niveau</b><br>${lv(sm.xp)} · ${fmt(sm.xp)} XP</div><div class="panel"><b>Économie</b><br>${fmt(sm.c)} 🪙</div><div class="panel"><b>Activité</b><br>${fmt(sm.casts)} lancers · ${dur(u.play_seconds)}</div><div class="panel"><b>Dates</b><br>Connexion : ${u.last_login?dt(u.last_login):'jamais'}<br>Sauvegarde : ${s.last_save?dt(s.last_save):'jamais'}</div></div>
    <div class="panel mu">Cannes : ${esc(names(sm.rods,RODS))}<br>Zones : ${esc(names(sm.zones,ZONES))}<br>Coffres : ${esc(cnt(sm.chests,CHESTS))}<br>Appâts : ${esc(cnt(sm.baits,BAITS))}<br>Artefacts : ${esc(names(Object.keys(sm.ao||{}),AR))}<br>Pierres : ${sm.es||0} · Étoiles filantes : ${sm.pt||0}</div>
    <h2 style="font-size:16px">🎁 Donner / retirer</h2>
    <select class="in" id="gk" onchange="Cloud.admCat(this.value)">${KINDS.map(([k,l])=>`<option value="${k}"${k===s.k?' selected':''}>${l}</option>`).join('')}</select>
    ${LISTS[s.k]?`<select class="in" id="gi">${LISTS[s.k].map((x,i)=>`<option value="${i}">${esc(x[0])}</option>`).join('')}</select>`:''}
    ${['rod','zone','art'].includes(s.k)?'':`<input class="in" id="gn" type="number" min="1" value="${s.k==='coins'||s.k==='xp'?1000:1}">`}
    <div class="row"><button class="btn sm" onclick="Cloud.admGive('give')">➕ Donner</button><button class="chip" onclick="Cloud.admGive('remove')">➖ Retirer</button><button class="chip" onclick="Cloud.admUndo()">↩ Annuler tous les dons</button></div>
    ${(s.grants||[]).length?`<div class="mu" style="margin-top:8px">${s.grants.map(g=>`${dt(g.ts)} · ${esc(Cloud.opText(g.op))} · ${g.applied?'✓ appliqué':'⏳ en attente'}${g.undone?' · annulé':''}`).join('<br>')}</div>`:''}
    <div class="mu" style="margin:8px 0;min-height:18px">${esc(this.msg)}</div>
    <div class="mu">Sauvegardes de ce joueur :</div>${s.backups.length?bkRows(s.backups,'Cloud.admRestore'):'<div class="mu">Aucune.</div>'}
    <div class="row" style="margin-top:12px"><button class="chip" onclick="Cloud.admReset()">Mot de passe temporaire</button><button class="chip" onclick="Cloud.admDel()">Supprimer le compte</button></div>
    ${s.tmp?`<div class="panel" style="margin-top:10px">Mot de passe temporaire (à donner au joueur, affiché une seule fois) :<div style="font:800 18px ui-monospace,monospace;user-select:all;text-align:center">${esc(s.tmp)}</div></div>`:''}
    <button class="chip" style="margin-top:8px" onclick="Cloud.admBack()">← Retour à la liste</button>`}
  else if(this.adm){
   if(this.adm.view==='logs'){
    const actionName={register:'Inscription',login:'Connexion',recover_password:'Mot de passe récupéré',save:'Sauvegarde',grant:'Don',remove_grant:'Retrait',undo_grants:'Annulation de dons',restore_save:'Restauration',unflag_user:'Désignalement',reset_password:'Réinitialisation mot de passe',delete_user:'Suppression'};
    const logs=this.adm.logs||[];
    inner=`<div class="row sp"><h2>📜 Journal d'activité</h2><button class="chip" onclick="Cloud.admBack()">← Joueurs</button></div>
     <p class="mu">${this.adm.logs?logs.length+' événement(s) récent(s), conservés côté serveur.':'Chargement…'}</p>
     <div class="panel" style="overflow:auto">${logs.map(l=>`<div class="row sp" style="gap:16px;border-bottom:1px solid var(--line);padding:10px 0;align-items:flex-start"><span style="min-width:145px"><b>${dt(l.ts)}</b><br><span class="mu">#${l.id}</span></span><span style="flex:1;min-width:180px"><b>${esc(actionName[l.action]||l.action)}</b><br><span class="mu">acteur : ${esc(l.actor)}${l.target?` · joueur : ${esc(l.target)}`:''}</span></span><code style="white-space:pre-wrap;word-break:break-word;max-width:45%;color:var(--mu)">${esc(JSON.stringify(l.details||{}))}</code></div>`).join('')||'<div class="mu">Aucun événement.</div>'}</div>`;
   }else{
   const all=this.adm.users||[],q=(this.adm.q||'').toLowerCase(),us=all.filter(x=>!q||x.username.toLowerCase().includes(q)).sort((a,b)=>(b[this.adm.sort]||0)-(a[this.adm.sort]||0));
   const online=all.filter(x=>x.last_login&&Date.now()-x.last_login<86400000).length;
   inner=`<h2>🛠 Administration développeur</h2><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))"><div class="panel"><b>Comptes</b><br>${all.length}</div><div class="panel"><b>Actifs 24 h</b><br>${online}</div><div class="panel"><b>Signalés</b><br>${all.filter(x=>x.flagged).length}</div></div><div class="row" style="margin-bottom:8px"><input class="in" style="flex:1;min-width:220px" placeholder="Rechercher un joueur…" value="${esc(this.adm.q||'')}" oninput="Cloud.adm.q=this.value;Cloud.panel()"><select class="in" style="width:auto" onchange="Cloud.adm.sort=this.value;Cloud.panel()"><option value="updated">Dernière sauvegarde</option><option value="last_login">Dernière connexion</option><option value="play_seconds">Temps de jeu</option><option value="c">Pièces</option><option value="casts">Lancers</option></select></div>
    <p class="mu">${us.length} joueur(s) affiché(s) sur ${all.length}. Sélectionne un compte pour voir tous ses détails.</p>
    <div class="row" style="margin-bottom:8px"><button class="chip" onclick="Cloud.evPreview()">🎃 Aperçu de l'événement (toi seul) : ${localStorage.getItem('catbet-evpreview')==='1'?'ON':'OFF'}</button></div>
    ${us.map(x=>`<div class="panel row sp" style="margin:6px 0"><span><b>${esc(x.username)}${x.flagged?' ⚠️':''}</b><br><span class="mu">niv ${lv(x.xp)} · ${fmt(x.c)} 🪙 · ${fmt(x.casts)} lancers · jeu ${dur(x.play_seconds)}<br>connexion ${x.last_login?dt(x.last_login):'jamais'} · sauvegarde ${x.updated?dt(x.updated):'jamais'}</span></span><button class="chip" onclick="Cloud.admUser(${+x.id})">Ouvrir</button></div>`).join('')}
    <div class="mu" style="margin:8px 0;min-height:18px">${esc(this.msg)}</div><button class="chip" onclick="Cloud.admBack()">← Retour</button><button class="btn sm" onclick="Cloud.admLogs()">📜 Voir les logs détaillés</button></div>`}
   }
  else if(this.tok)inner=`<h2>☁ ${esc(this.user)}</h2><p class="mu">Ta progression est sauvegardée en ligne et suit ton compte sur tous tes appareils.</p>
    <div class="row"><button class="btn sm" onclick="Cloud.sync()">Synchroniser maintenant</button><button class="chip" onclick="Cloud.logout()">Se déconnecter</button></div>
    <div class="mu" style="margin-top:10px;min-height:18px">${esc(this.msg)}</div>
    <div class="mu">💾 Ta partie est sauvegardée automatiquement en ligne (le ⏳ à côté de ton pseudo = en cours d'envoi).</div>
    <div class="row" style="margin-top:12px"><button class="chip" onclick="Cloud.newCode()">Nouveau code de récupération</button><button class="chip" onclick="Cloud.del()">Supprimer mon compte</button>${this.admin?'<button class="btn sm" onclick="Cloud.admOpen()">🛠 Administration</button>':''}</div>`;
  else if(rc)inner=`<h2>🔑 Mot de passe oublié</h2><p class="mu">Entre ton pseudo, le code de récupération reçu à l'inscription et un nouveau mot de passe.</p>
    <form onsubmit="event.preventDefault();Cloud.auth()">
     <input class="in" id="cu" maxlength="20" autocomplete="username" placeholder="Pseudo" required>
     <input class="in" id="cc" maxlength="40" autocomplete="off" placeholder="Code de récupération (XXXXX-XXXXX-XXXXX-XXXXX)" required>
     <input class="in" id="cp" type="password" maxlength="128" autocomplete="new-password" placeholder="Nouveau mot de passe (8 caractères minimum)" required>
     <button class="btn" style="width:100%">Réinitialiser mon mot de passe</button>
    </form>
    <div class="mu" style="margin:8px 0;min-height:18px">${esc(this.msg)}</div>
    <button class="chip" onclick="Cloud.mode='login';Cloud.msg='';Cloud.panel()">← Retour</button>`;
  else inner=`<h2>👤 Compte</h2><p class="mu">Connecte-toi pour retrouver ta progression sur tous tes appareils.</p>
    <div class="row" style="margin-bottom:10px"><button class="chip ${lg?'on':''}" onclick="Cloud.mode='login';Cloud.msg='';Cloud.panel()">Connexion</button><button class="chip ${lg?'':'on'}" onclick="Cloud.mode='register';Cloud.msg='';Cloud.panel()">Créer un compte</button></div>
    <form onsubmit="event.preventDefault();Cloud.auth()">
     <input class="in" id="cu" maxlength="20" autocomplete="username" placeholder="Pseudo" required>
     <input class="in" id="cp" type="password" maxlength="128" autocomplete="${lg?'current-password':'new-password'}" placeholder="Mot de passe${lg?'':' (8 caractères minimum)'}" required>
     <button class="btn" style="width:100%">${lg?'Se connecter':'Créer mon compte'}</button>
    </form>
    <div class="mu" style="margin-top:8px;min-height:18px">${esc(this.msg)}</div>
    ${lg?`<button class="chip" onclick="Cloud.mode='recover';Cloud.msg='';Cloud.panel()">Mot de passe oublié ?</button>`:''}
    <div class="mu" style="margin-top:8px">Sans compte, ta partie reste seulement sur cet appareil.</div>`;
  const wide=!!this.adm;
  m.style.alignItems=wide?'stretch':'center';m.style.padding=wide?'0':'16px';
  m.innerHTML=`<div class="panel" style="max-width:${wide?'1400px':'380px'};width:100%;margin:${wide?'0 auto':'0'};min-height:${wide?'100vh':'0'};max-height:${wide?'100vh':'88vh'};overflow:auto;border-radius:${wide?'0':'16px'}">${inner}</div>`;
 },
 init(){
  this.badge();
  addEventListener('online',()=>this.pull());
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(this.pending)this.push()}else this.pull()});
  setInterval(()=>{this.syncPlay();if(this.pending&&!document.hidden)this.push()},30000);
  setInterval(()=>this.grantsPoll(),30000);
  this.pull()
 }
};

