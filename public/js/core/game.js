
/* ============ 3. OUTILS ============ */
var $=s=>document.querySelector(s);
var rnd=(a,b)=>a+Math.random()*(b-a);
var fmt=n=>n>=1e12?(n/1e12).toFixed(2)+'T':n>=1e9?(n/1e9).toFixed(2)+'Md':n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e4?(n/1e3).toFixed(1)+'k':Math.round(n).toLocaleString('fr-FR');
var level=()=>Math.min(100,Math.floor(Math.sqrt(S.xp/4000))+1);
var lvlBar=()=>{const l=level(),a=4000*(l-1)**2,b=4000*l**2;return{l,p:l>=100?1:(S.xp-a)/(b-a)}};
var activeBait=()=>S.bait>=0&&S.baits[S.bait]>0?S.bait:-1;
var biteDelayMs=(rodSpeed,bonusSpeed=1)=>{
 const maxSpeed=RODS[BASE_RODS-1][3],speed=Math.max(1,rodSpeed*bonusSpeed),progress=Math.min(1,Math.log(speed)/Math.log(maxSpeed));
 return Math.round(5000-3000*progress);
};
var playRareCatchSound=tier=>{
 const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)return;
 const ctx=new AudioCtx(),notes=tier>=8?[392,523.25,659.25,1046.5,1568]:[523.25,659.25,783.99,1046.5];
 ctx.resume().then(()=>{
  const now=ctx.currentTime,gain=ctx.createGain();gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.16,now+.08);gain.gain.exponentialRampToValueAtTime(.0001,now+2.1);gain.connect(ctx.destination);
  notes.forEach((frequency,i)=>{const oscillator=ctx.createOscillator();oscillator.type='triangle';oscillator.frequency.value=frequency;oscillator.connect(gain);oscillator.start(now+i*.17);oscillator.stop(now+1.8)});
  setTimeout(()=>ctx.close(),2300);
 }).catch(error=>console.warn('Rare-catch sound could not be played.',error));
};
var baitButtons=()=>`<button class="chip ${S.bait<0?'on':''}" onclick="Act.pickBait(-1)">Sans appât</button>${BAIT_ORDER.map(i=>{const b=BAITS[i];return S.baits[i]>0?`<button class="chip ${S.bait===i?'on':''}" onclick="Act.pickBait(${i})">${b[3]} ${b[0]} ×${S.baits[i]}</button>`:''}).join('')}`;
var baitEffect=b=>{
 if(b<0||!BAITS[b])return null;
 const x=BAITS[b],active=x[6]==null||S.zone>=x[6];
 return active?{kind:x[5]||'',chance:Number(x[2])||1,value:Number(x[4])||1}:{kind:'inactive',chance:1,value:1};
};
// Calcul unique du multiplicateur de valeur de l'appât, utilisé pour toutes les prises.
// L'enchantement Appât raffiné (E.A) amplifie uniquement le bonus au-dessus de ×1.
var baitValueMultiplier=(baitIndex,effects=fx())=>{
 const bait=baitEffect(baitIndex);
 if(!bait)return 1;
 const base=Math.max(1,Number(bait.value)||1);
 if(bait.kind==='inactive')return 1;
 return 1+(base-1)*(1+Math.max(0,Number(effects.A)||0));
};
var baitDescription=b=>{
 const [,price,chance,,value,kind,minZone]=b;
 const zone=minZone>0?` · ${ZONES[minZone][0]}+`:'';
 const effects={balanced:'Polyvalent',value:'Valeur des prises',deep:'Favorise les raretés profondes',chest:'Coffres +0,45 point (plafond 4 %)',predator:'Favorise Épique et Mythique',astral:'Favorise Astral et supérieur'};
 return `Chance ×${chance} · Valeur ×${value}${kind?` · ${effects[kind]||kind}`:''}${zone}`;
};
var rodEn=r=>S.re[r]||(S.re[r]=[]);
var fx=()=>{const f={L:1,S:1,W:1,V:1,C:1,Q:1,B:0,D:0,K:0,R:0,H:0,A:0,P:0,X:0};rodEn(S.rod).forEach(i=>{const l=S.en[i]|0;if(l>0)f[EN[i][3]]+=EN[i][4]*ENSCALE*l});
 const hr=HWRODS[S.rod-BASE_RODS];if(hr&&hr[3]==='value')f.V*=hr[4];
 S.ae.forEach(i=>{const x=AR[i]&&AR[i][3];if(x)for(const k in x){if(AMUL.includes(k))f[k]*=1+(x[k]-1)*ASCALE;else f[k]+=x[k]*ASCALE}});
 f.V*=1+Pr.vb()*S.pr;f.L*=1+Pr.lb()*S.pr;if(Ev.active())f.V*=Ev.mult;return f};
// Les multiplicateurs de chance ont des rendements décroissants : les bonus
// restent utiles sans permettre à une combinaison extrême de dépasser environ ×100.
var luck=(b=activeBait())=>{
 const a=baitEffect(b);
 const raw=fx().L*RODS[S.rod][2]*ZONES[S.zone][2]*(a?a.chance:1)*(1+.015*(level()-1));
 return 1+100*(Math.max(1,raw)-1)/(100+Math.max(1,raw)-1);
};
var dk=(h,f=.55)=>'#'+[1,3,5].map(i=>Math.round(parseInt(h.slice(i,i+2),16)*f).toString(16).padStart(2,'0')).join('');
// Dessin SVG d'un poisson (a/b = couleurs, sp = corps rond, g = halo pour les raretés hautes)
var art=(f,t)=>{const a=f[5],b=f[6],sp=f[7],g=t>=3,u='q'+a.slice(1)+b.slice(1);return `<svg viewBox="0 0 180 120" class="fa"><defs><linearGradient id="${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>${g?`<circle cx="90" cy="60" r="56" fill="${a}" opacity=".22"/>`:''}${sp?`<ellipse cx="86" cy="60" rx="52" ry="46" fill="url(#${u})"/><path d="M132 60L172 36V84Z" fill="${b}"/><path d="M70 16Q86 0 102 16Z" fill="${b}"/><path d="M58 88Q70 108 84 90Z" fill="${b}"/>`:`<path d="M138 60L174 30Q164 60 174 90Z" fill="${b}"/><path d="M28 60C44 22 108 20 142 60 108 100 44 98 28 60Z" fill="url(#${u})"/><path d="M62 34Q86 8 112 38Z" fill="${b}"/><path d="M84 84Q96 104 112 84Z" fill="${b}"/>`}<path d="M74 44Q66 60 74 76" stroke="#fff6" stroke-width="3" fill="none"/><circle cx="${sp?52:48}" cy="52" r="7" fill="#fff"/><circle cx="${sp?50:46}" cy="52" r="3.5" fill="#111"/><ellipse cx="84" cy="40" rx="22" ry="6" fill="#fff" opacity=".35"/></svg>`};
var rodArt=a=>{const b=dk(a);return `<svg viewBox="0 0 120 120" class="fa"><path d="M22 104L96 16" stroke="${b}" stroke-width="7" stroke-linecap="round"/><path d="M22 104L70 47" stroke="${a}" stroke-width="7" stroke-linecap="round"/><circle cx="40" cy="82" r="9" fill="${a}" stroke="${b}" stroke-width="3"/><path class="rod-tip-line" d="M96 16Q108 50 96 84" stroke="#fff9" stroke-width="1.5" fill="none"/><path class="rod-hook" d="M96 84a5 5 0 1 1-6 5" stroke="#e2e8f0" stroke-width="2.5" fill="none"/></svg>`};
var pool=t=>FISH[t].map((f,j)=>[f,j]).filter(([f])=>(f[4]==null||f[4]===S.zone)&&(!f[8]||f[8]===Weather.current()[0]));

var pickW=w=>{let x=Math.random()*w.reduce((a,b)=>a+b,0);for(let i=0;i<w.length;i++)if((x-=w[i])<=0)return i;return w.length-1};
var chestArt=t=>{const[,c,d]=CHESTS[t];return `<svg viewBox="0 0 160 140" class="fa"><circle cx="80" cy="76" r="62" fill="${c}" opacity=".2"/><ellipse cx="80" cy="128" rx="54" ry="8" fill="#000" opacity=".5"/><rect x="24" y="68" width="112" height="58" rx="8" fill="${d}" stroke="${c}" stroke-width="3"/><path d="M20 72Q20 24 80 24Q140 24 140 72Z" fill="${d}" stroke="${c}" stroke-width="3"/><path d="M40 72Q42 42 80 38" stroke="#fff5" stroke-width="4" fill="none"/><rect x="40" y="44" width="12" height="82" fill="${c}" opacity=".85"/><rect x="108" y="44" width="12" height="82" fill="${c}" opacity=".85"/><rect x="66" y="62" width="28" height="30" rx="6" fill="${c}" stroke="#fff" stroke-width="2"/><text x="80" y="84" text-anchor="middle" font-size="20" font-weight="900" fill="${d}">${CSYM[t]}</text></svg>`};
// Transforme une ligne de butin en objet affichable + effet à appliquer
var resolve=x=>{const[k,v,q]=x;
 if(k==='g')return{c:'#fbbf24',html:`<div class="em">🪙</div><b>${fmt(q)}</b>`,lab:`+${fmt(q)} 🪙`,apply:()=>{S.c+=Math.round(q*fx().Q)}};
 if(k==='b'){const B=BAITS[v];return{c:'#38bdf8',html:`<div class="em">${B[3]}</div><b>${B[0]} ×${q}</b>`,lab:`${B[0]} ×${q}`,apply:()=>{S.baits[v]=(S.baits[v]||0)+q}}}
 if(k==='p')return{c:'#fbbf24',html:`<div class="em">🌠</div><b>Étoile filante</b>`,lab:'Étoile filante 🌠 · permet un prestige',apply:()=>{S.pt=(S.pt|0)+1}};
 if(k==='a'){const A=AR[v],own=S.ao[v],ref=Math.max(1000,Math.round(CHESTS[Math.min(7,A[2])][3]*20));return{c:CHESTS[A[2]][1],html:`<div class="em">${A[1]}</div><b>${A[0]}</b>`,lab:own?`Artefact ${A[0]} (déjà possédé → +${fmt(ref)} 🪙)`:`NOUVEL ARTEFACT : ${A[0]} !`,apply:()=>{if(own)S.c+=ref;else S.ao[v]=1}}}
 if(k==='r'){const R=RODS[v],own=S.rods.includes(v),hr=v>=BASE_RODS?HWRODS[v-BASE_RODS]:null,ref=hr?Math.round(hr[2]*.5):Math.round(R[1]/2);return{c:R[5],html:`<div class="em">${rodArt(R[5])}</div><b>${R[0]}</b>`,lab:own?`Canne ${R[0]} (déjà possédée → +${fmt(ref)} ${hr?'🎃':'🪙'})`:`Nouvelle canne : ${R[0]} !`,apply:()=>{if(own){if(hr)HW.pk(ref);else S.c+=ref}else S.rods.push(v)}}}
 const E=fx(),p=pool(v),[f,j]=p[Math.floor(Math.random()*p.length)],val=Math.round(rnd(f[2],f[3])*ZONES[S.zone][3]*E.V*baitValueMultiplier(activeBait(),E));
 return{c:TIERS[v][1],html:`<div class="em">${art(f,v)}</div><b>${f[0]}</b>`,lab:`${f[0]} (${TIERS[v][0]}) · valeur ${fmt(val)} 🪙`,apply:()=>{const key=v+'-'+j,e=S.inv[key]||{n:0,v:0};e.n++;e.v+=val;S.inv[key]=e;S.idx[key]=(S.idx[key]||0)+1}}};

/* ============ 3b. MUTATIONS ============ */
// [nom, icône, couleur, multiplicateur de valeur, chance par prise, filtre visuel]
var MUT=[['Bronze','🥉','#cd7f32',1.5,.08,'sepia(1) saturate(2.2) hue-rotate(-15deg) brightness(.85)'],
 ['Argent','🥈','#cbd5e1',2,.04,'grayscale(1) brightness(1.3)'],
 ['Or','🥇','#fbbf24',3,.02,'sepia(1) saturate(4.5) hue-rotate(5deg) brightness(1.1)'],
 ['Diamant','💎','#67e8f9',5,.008,'saturate(.6) hue-rotate(150deg) brightness(1.35)'],
 ['Obscure','🌑','#8b5cf6',8,.003,'brightness(.35) contrast(1.3)'],
 ['Halloween','🎃','#fb923c',10,.01,'sepia(1) saturate(5) hue-rotate(-25deg)'],
 ['Prismatique','🌈','#f0abfc',25,.0003,'saturate(1.6) brightness(1.15)']];
var Mut={
 // Halloween : du 7 octobre au 2 novembre (date de l'appareil)
 on(d){if(!d&&typeof HW!=='undefined'&&HW.pv())return true;const x=d||new Date(),m=x.getMonth(),j=x.getDate();return(m===9&&j>=7)||(m===10&&j<=2)},
 // tirage du plus rare au plus courant ; renvoie l'indice de la mutation ou -1
 roll(){for(const i of [6,4,3,5,2,1,0]){if(i===5&&!this.on())continue;if(Math.random()<MUT[i][4])return i}return -1},
 dex(){return `<h2>Mutations</h2><div class="grid">${MUT.map((m,i)=>{const n=(S.mu||{})[i]|0;return `<div class="fc ${n?'':'lock'}" style="--a:${m[2]}"><div class="em">${n?m[1]:'❔'}</div><b>${n?m[0]:'???'}</b><div class="mu">${n?'×'+n+' · ':''}valeur ×${m[3]}${i===5?' · événement 7 oct. → 2 nov.':''}</div></div>`}).join('')}</div>`}};

/* ============ 4a. COMBAT DE PÊCHE (traits du poisson) ============ */
// Poids moyen (kg) par rareté ; le poids réel dépend de la taille tirée
var WKG=[.5,3,12,45,160,600,2500,9000,30000];
var clampN=(x,a,b)=>Math.max(a,Math.min(b,x));
// Comportements propres aux espèces : am = agressivité, dur = durée des rafales (s), pm = puissance, rm = vitesse de fuite, flip = changements de direction (s)
var BEH={
 steady:{n:'Calme',i:'🌊',d:'Tire par à-coups lents et prévisibles.',am:.6,dur:[1.2,1.8],pm:.9,rm:.6,flip:null},
 darter:{n:'Nerveux',i:'⚡',d:'Change sans cesse de direction.',am:1,dur:[.9,1.5],pm:.85,rm:1,flip:[.75,1.35]},
 diver:{n:'Plongeur',i:'🐋',d:'Plongées rares mais énormes : relâche la ligne !',am:.45,dur:[1.5,2.2],pm:1.7,rm:.8,flip:null},
 runner:{n:'Coureur',i:'💨',d:'Part loin si tu cesses de remonter.',am:.8,dur:[1.6,2.4],pm:1,rm:1.8,flip:null},
 trick:{n:'Rusé',i:'🎭',d:'Feinte : la direction annoncée change en cours de route.',am:.9,dur:[1,1.6],pm:1,rm:1,flip:null,fake:.3}};
/* ============ 7. DÉMARRAGE ============ */
document.addEventListener('keydown',e=>{if(UI.tab==='fish'&&e.code==='Space'){e.preventDefault();if(!e.repeat)Engine.act()}});
UI.render();
Cloud.init();
setInterval(()=>{if(Ev.tick())UI.head();else Ev.ui();Weather.ui()},1000);
