/* ============ 6. INTERFACE ============ */
var TABS=[['fish','🎣 Pêche'],['shop','🛒 Boutique'],['ench','✨ Bonus'],['quest','🎯 Quêtes'],['ach','🏆 Succès'],['prest','⭐ Prestige'],['inv','🎒 Inventaire'],['lb','🏅 Classement'],['dex','📖 Index']];
function drawFishingScene(){
 const canvas=$('.scene-art-canvas');if(!canvas)return;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Impossible de créer le rendu de la scène de pêche.');
 const w=960,h=360;
 canvas.width=w;canvas.height=500;ctx.scale(1,500/h);
 const rand=(()=>{let n=8291;return()=>((n=(n*1664525+1013904223)>>>0)/4294967296)})();
 let g=ctx.createLinearGradient(0,0,0,205);g.addColorStop(0,'#090b16');g.addColorStop(.58,'#1b1a31');g.addColorStop(1,'#67524d');ctx.fillStyle=g;ctx.fillRect(0,0,w,205);
 const haze=ctx.createRadialGradient(475,150,5,475,150,430);haze.addColorStop(0,'#9a77683c');haze.addColorStop(1,'#302b4600');ctx.fillStyle=haze;ctx.fillRect(0,0,w,230);
 ctx.save();ctx.filter='blur(15px)';ctx.fillStyle='#74799820';for(const [x,y,rx,ry] of [[96,119,120,20],[236,92,145,24],[467,123,180,26],[654,102,128,21],[868,132,116,22]]){ctx.beginPath();ctx.ellipse(x,y,rx,ry,-.06,0,Math.PI*2);ctx.fill()}ctx.restore();
 ctx.save();ctx.filter='blur(7px)';ctx.strokeStyle='#a8aac22b';ctx.lineWidth=13;for(const [x,y,span] of [[-15,110,300],[198,92,298],[487,118,315],[720,104,260]]){ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+span*.2,y-26,x+span*.47,y+18,x+span,y-18);ctx.stroke()}ctx.restore();
 for(let i=0;i<86;i++){const x=rand()*w,y=rand()*150,r=.45+rand()*1.05;ctx.fillStyle=`rgba(239,225,201,${.18+rand()*.55})`;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
 ctx.save();ctx.translate(0,76);ctx.scale(1,.72);ctx.translate(0,-76);
 const glow=ctx.createRadialGradient(746,76,2,746,76,88);glow.addColorStop(0,'#f6e7c7a8');glow.addColorStop(.24,'#ead5a45d');glow.addColorStop(1,'#d9bd8400');ctx.fillStyle=glow;ctx.fillRect(650,-12,192,180);
 const moon=ctx.createRadialGradient(735,66,3,746,76,32);moon.addColorStop(0,'#fff6df');moon.addColorStop(.66,'#e5d3ab');moon.addColorStop(1,'#9c917f');ctx.fillStyle=moon;ctx.beginPath();ctx.arc(746,76,25,0,Math.PI*2);ctx.fill();
 ctx.save();ctx.beginPath();ctx.arc(746,76,24,0,Math.PI*2);ctx.clip();
 for(const [x,y,rx,ry] of [[737,69,3,2],[754,82,4,3],[744,60,2,3],[729,84,1.5,2],[757,66,1.3,1],[746,91,2,1]]){ctx.fillStyle='#716a6150';ctx.beginPath();ctx.ellipse(x,y,rx,ry,-.25,0,Math.PI*2);ctx.fill()}
 ctx.restore();
 ctx.restore();
 const hills=[{y:165,c:'#181a26',d:13},{y:174,c:'#20212a',d:10},{y:181,c:'#292820',d:8}];
 for(let k=0;k<hills.length;k++){const a=hills[k];ctx.beginPath();ctx.moveTo(0,205);ctx.lineTo(0,a.y);for(let x=0;x<=w;x+=40)ctx.lineTo(x,a.y+Math.sin(x*.018+k*1.4)*a.d+Math.sin(x*.043+k)*a.d*.28);ctx.lineTo(w,205);ctx.closePath();g=ctx.createLinearGradient(0,a.y,0,208);g.addColorStop(0,a.c);g.addColorStop(1,'#10161a');ctx.fillStyle=g;ctx.fill()}
 const pine=(x,ground,size,color)=>{
  ctx.save();ctx.filter='blur(.7px)';ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x,ground-size);ctx.lineTo(x-size*.08,ground-size*.15);ctx.lineTo(x-size*.22,ground-size*.08);ctx.lineTo(x-size*.1,ground-size*.03);ctx.lineTo(x-size*.29,ground+size*.04);ctx.lineTo(x-size*.12,ground+size*.08);ctx.lineTo(x-size*.34,ground+size*.16);ctx.lineTo(x-size*.1,ground+size*.19);ctx.lineTo(x-size*.1,ground+size*.27);ctx.lineTo(x+size*.1,ground+size*.27);ctx.lineTo(x+size*.1,ground+size*.19);ctx.lineTo(x+size*.34,ground+size*.16);ctx.lineTo(x+size*.12,ground+size*.08);ctx.lineTo(x+size*.29,ground+size*.04);ctx.lineTo(x+size*.1,ground-size*.03);ctx.lineTo(x+size*.22,ground-size*.08);ctx.lineTo(x+size*.08,ground-size*.15);ctx.closePath();ctx.fill();
  ctx.strokeStyle=color;ctx.lineCap='round';ctx.lineWidth=Math.max(1,size*.035);ctx.beginPath();ctx.moveTo(x,ground+size*.24);ctx.lineTo(x,ground-size*.75);
  for(let i=1;i<7;i++){const y=ground-size*(.72-i*.105),span=size*(.1+i*.028);ctx.moveTo(x,y);ctx.quadraticCurveTo(x-span*.5,y+size*.025,x-span,y+size*.1);ctx.moveTo(x,y);ctx.quadraticCurveTo(x+span*.5,y+size*.025,x+span,y+size*.1)}
  ctx.stroke();ctx.restore();
 };
 for(const [start,end,base] of [[0,280,184],[704,960,184]])for(let x=start;x<end;x+=10+rand()*14){const size=12+rand()*36;pine(x,base+rand()*12,size,`rgba(${13+rand()*8|0},${17+rand()*11|0},${28+rand()*12|0},${.3+rand()*.27})`)}
 const mansion=ctx.createLinearGradient(790,122,884,183);mansion.addColorStop(0,'#101219');mansion.addColorStop(1,'#080b10');ctx.fillStyle=mansion;
 ctx.beginPath();ctx.moveTo(785,177);ctx.lineTo(785,146);ctx.lineTo(815,125);ctx.lineTo(815,140);ctx.lineTo(844,119);ctx.lineTo(875,143);ctx.lineTo(891,143);ctx.lineTo(891,179);ctx.closePath();ctx.fill();
 ctx.fillStyle='#24202a';ctx.beginPath();ctx.moveTo(785,146);ctx.lineTo(815,125);ctx.lineTo(815,140);ctx.lineTo(844,119);ctx.lineTo(875,143);ctx.lineTo(843,136);ctx.lineTo(815,154);ctx.closePath();ctx.fill();
 ctx.fillStyle='#c48d4c88';for(const [x,y] of [[801,154],[825,153],[850,151],[873,157]]){ctx.fillRect(x,y,5,12);ctx.fillStyle='#f0c16d';ctx.fillRect(x+1,y+1,2,3);ctx.fillStyle='#c48d4c88'}
 g=ctx.createLinearGradient(0,185,0,360);g.addColorStop(0,'#526067');g.addColorStop(.13,'#23424a');g.addColorStop(.55,'#10262e');g.addColorStop(1,'#071015');ctx.fillStyle=g;ctx.fillRect(0,185,w,175);
 const shore=ctx.createLinearGradient(0,210,0,360);shore.addColorStop(0,'#31312d');shore.addColorStop(.18,'#1a1d1c');shore.addColorStop(1,'#080b0d');
 ctx.fillStyle=shore;ctx.beginPath();ctx.moveTo(0,216);ctx.bezierCurveTo(90,207,160,221,218,249);ctx.bezierCurveTo(251,272,265,321,296,360);ctx.lineTo(0,360);ctx.closePath();ctx.fill();
 ctx.beginPath();ctx.moveTo(960,214);ctx.bezierCurveTo(870,207,813,222,773,254);ctx.bezierCurveTo(748,282,744,321,719,360);ctx.lineTo(960,360);ctx.closePath();ctx.fill();
 for(const [start,end] of [[-8,212],[748,968]])for(let x=start;x<end;x+=22+rand()*25){const size=44+rand()*82,ground=255+rand()*85,shade=rand()>.5?'rgba(9,14,20,.72)':'rgba(11,17,24,.68)';pine(x,ground,size,shade)}
 g=ctx.createLinearGradient(0,189,0,360);g.addColorStop(0,'#dbbd8628');g.addColorStop(.18,'#d2b8780a');g.addColorStop(1,'#d2b87800');ctx.fillStyle=g;
 ctx.fillRect(620,189,250,171);
 const shimmer=ctx.createRadialGradient(746,195,2,746,228,122);shimmer.addColorStop(0,'#f6d9a535');shimmer.addColorStop(1,'#d2b87800');ctx.fillStyle=shimmer;ctx.fillRect(610,188,272,150);
 ctx.save();ctx.globalCompositeOperation='screen';
 for(let y=197;y<355;y+=rand()*7+3){const d=(y-190)/170,x=748+(rand()-.5)*(14+d*144),len=5+rand()*(8+d*46);ctx.strokeStyle=`rgba(231,209,162,${.06+rand()*.2})`;ctx.lineWidth=.5+rand()*1.4;ctx.beginPath();ctx.moveTo(x-len*d*.35,y);ctx.quadraticCurveTo(x,y-1,x+len*d*.65,y);ctx.stroke()}
 for(let i=0;i<300;i++){const y=197+rand()*158,d=(y-190)/170,x=rand()*w,len=3+rand()*(10+d*55);ctx.strokeStyle=`rgba(${75+Math.floor(rand()*75)},${111+Math.floor(rand()*66)},${118+Math.floor(rand()*62)},${.06+rand()*.18})`;ctx.lineWidth=.4+rand()*1.2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+len,y+(rand()-.5)*1.3);ctx.stroke()}
 ctx.restore();
 ctx.strokeStyle='#c7d6df55';ctx.lineWidth=1;for(const [rx,ry] of [[13,3],[22,5],[34,8]]){ctx.beginPath();ctx.ellipse(500,202,rx,ry,-.04,Math.PI*.08,Math.PI*.92);ctx.stroke()}
 ctx.strokeStyle='#c8b18a55';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,192);ctx.quadraticCurveTo(160,185,310,194);ctx.quadraticCurveTo(630,189,960,193);ctx.stroke();
 for(let i=0;i<2600;i++){const x=rand()*w,y=rand()*h,alpha=rand()*.055;ctx.fillStyle=rand()>.5?`rgba(230,216,184,${alpha})`:`rgba(0,0,0,${alpha})`;ctx.fillRect(x,y,rand()*1.2+.3,rand()*1.2+.3)}
 ctx.strokeStyle='#0b0e0f';ctx.lineWidth=2;for(const [x,y,dx,dy] of [[28,360,7,-74],[44,360,-5,-111],[64,360,18,-82],[918,360,-10,-98],[941,360,8,-65],[895,360,-23,-78]]){ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+dx*.25,y+dy*.55,x+dx,y+dy);ctx.stroke()}
 const vignette=ctx.createRadialGradient(480,170,115,480,170,565);vignette.addColorStop(.45,'#00000000');vignette.addColorStop(1,'#020307a8');ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h);
}
function sceneRod(color){
 return `<svg viewBox="0 0 420 500" role="img" aria-label="Canne de pêche">
  <defs>
   <linearGradient id="rod-shaft" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#101116"/><stop offset=".2" stop-color="${color}"/><stop offset=".42" stop-color="#fff" stop-opacity=".9"/><stop offset=".55" stop-color="${color}"/><stop offset=".82" stop-color="#17131f"/><stop offset="1" stop-color="#090a10"/></linearGradient>
   <linearGradient id="rod-metal" x2="0" y2="1"><stop stop-color="#fff0bc"/><stop offset=".24" stop-color="#bd8748"/><stop offset=".52" stop-color="#33291f"/><stop offset=".76" stop-color="#d7a754"/><stop offset="1" stop-color="#17171d"/></linearGradient>
   <radialGradient id="reel-glow"><stop stop-color="${color}"/><stop offset=".6" stop-color="#271526"/><stop offset="1" stop-color="#08090d"/></radialGradient>
  </defs>
  <path d="M407 500 238 10" fill="none" stroke="#040509" stroke-width="14"/>
  <path d="M407 500 238 10" fill="none" stroke="url(#rod-shaft)" stroke-width="9"/>
  <path d="M407 500 238 10" fill="none" stroke="#fff" stroke-opacity=".62" stroke-width="1.5"/>
  <path d="M392 486 379 439" stroke="#08090d" stroke-width="27"/>
  <path d="M392 486 379 439" stroke="url(#rod-metal)" stroke-width="20"/>
  <path d="M391 477 379 444" stroke="${color}" stroke-width="3"/>
  <path d="M386 451 380 435" stroke="#1b1720" stroke-width="25"/>
  <path d="M386 451 380 435" stroke="url(#rod-metal)" stroke-width="16"/>
  <path d="M384 441 397 437 406 463 393 467Z" fill="#13141a" stroke="url(#rod-metal)" stroke-width="4"/>
  <ellipse cx="351" cy="300" rx="29" ry="34" fill="#05060a" stroke="url(#rod-metal)" stroke-width="5"/>
  <ellipse cx="351" cy="300" rx="21" ry="26" fill="url(#reel-glow)" stroke="${color}" stroke-width="3"/>
  <ellipse cx="351" cy="300" rx="13" ry="19" fill="none" stroke="#eac776" stroke-opacity=".8" stroke-width="3"/>
  <circle cx="351" cy="300" r="6" fill="#d5b579"/>
  <path d="M326 279 309 264M377 321 394 338" stroke="url(#rod-metal)" stroke-width="5"/>
  <path d="M394 338 410 330" stroke="#14151a" stroke-width="7" stroke-linecap="round"/>
  <path d="M238 10Q268 2 278 30M247 37Q273 27 285 59M256 67Q278 57 293 91" fill="none" stroke="#140e1b" stroke-width="5"/>
  <path d="M238 10Q268 2 278 30M247 37Q273 27 285 59M256 67Q278 57 293 91" fill="none" stroke="url(#rod-metal)" stroke-width="2"/>
  <path d="M238 10Q272 24 296 50" fill="none" stroke="#d9cde0" stroke-opacity=".65" stroke-width="1.5"/>
  <path d="M365 442 396 433M369 452 399 444M373 462 403 455M377 472 407 466" stroke="#fff0c4" stroke-opacity=".66" stroke-width="1.5"/>
  <path d="M229 4 246 9" stroke="#f8e8c4" stroke-width="3" stroke-linecap="round"/>
 </svg>`;
}
