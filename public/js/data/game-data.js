/* ============ 1. DONNÉES ============ */
// Raretés : nom, couleur, poids de base, XP gagnée
const TIERS=[['Commun','#94a3b8',70,4],['Rare','#3b82f6',22,10],['Épique','#a855f7',6,30],['Mythique','#ef4444',1.5,90],['Secret','#22e39a',0.25,250],['Astral','#67e8f9',0.03,700],['Ultra','#f0abfc',0.0001,1800],['Légendaire','#fbbf24',0.000002,4500],['Primordial','#fb7185',0.00000002,10000],['Transcendant','#f97316',0.000000001,25000],['Infini','#f43f5e',0.00000000003,65000],['Omniversal','#c084fc',0.0000000000008,180000],['Créateur','#fef08a',0.000000000000015,500000],['Singularité','#67e8f9',0.0000000000000002,1500000],['Au-delà','#ffffff',0.000000000000000002,5000000]];
const RARE_SHOWCASE_COLORS=['#22d3ee','#ec4899','#facc15','#ef4444','#f97316','#dc2626','#a855f7','#fde047','#14b8a6','#f8fafc'];
const rareShowcaseColor=t=>t>=5?RARE_SHOWCASE_COLORS[Math.min(t-5,RARE_SHOWCASE_COLORS.length-1)]:TIERS[t][1];
// Poissons par rareté : nom, (libre), valeur min, valeur max, zone exclusive ou null, couleur haut, couleur bas, corps rond (1/0)
const FISH=[
[["Sardine",'',18,45,null,'#e2e8f0','#64748b',0],["Carpe",'',24,54,null,'#d6c58a','#78633a',0],["Gardon",'',15,42,null,'#cbd5e1','#475569',0],["Goujon",'',12,36,null,'#fde68a','#a16207',0]],
[["Truite",'',30,70,null,'#93c5fd','#1d4ed8',0],["Perche",'',35,80,null,'#86efac','#15803d',0],["Brochet",'',40,90,null,'#86efac','#166534',0],["Saumon",'',45,95,null,'#fdba74','#c2410c',0],["Truite dorée",'',70,140,1,'#fde68a','#a16207',0],["Anguille de rivière",'',85,170,1,'#a7f3d0','#166534',0]],
[["Poisson-lune",'',180,380,null,'#e9d5ff','#7e22ce',1],["Barracuda",'',220,450,null,'#f0abfc','#86198f',0],["Raie manta",'',200,420,null,'#c7d2fe','#3730a3',1],["Requin-marteau",'',240,480,null,'#cbd5e1','#334155',0],["Silure géant",'',180,360,2,'#cbd5e1','#334155',0],["Perche royale",'',220,420,2,'#bbf7d0','#166534',0],["Poisson-perroquet",'',500,900,3,'#f9a8d4','#be185d',0],["Mérou corail",'',650,1100,3,'#fdba74','#9a3412',0]],
[["Koï écarlate",'',1200,2400,null,'#fecaca','#b91c1c',0],["Espadon doré",'',1800,3000,null,'#fde68a','#b45309',0],["Poisson-dragon",'',1500,2800,null,'#86efac','#b91c1c',0],["Kraken junior",'',2000,3400,null,'#fda4af','#881337',1],["Calmar colossal",'',4000,7000,4,'#c4b5fd','#6d28d9',1],["Anguille abyssale",'',5000,9000,4,'#99f6e4','#115e59',0]],
[["Poisson fantôme",'',5000,9000,null,'#d1fae5','#047857',1],["Anguille spectrale",'',6000,12000,null,'#a7f3d0','#0f766e',0],["Baleine d'ombre",'',7000,14000,null,'#c4b5fd','#1e1b4b',1],["Baleine astrale",'',20000,35000,5,'#e9d5ff','#6d28d9',1],["Dragon des étoiles",'',30000,50000,5,'#fef08a','#7c3aed',0]],
[["Léviathan astral",'',50000,100000,null,'#cffafe','#4338ca',1],["Chat-poisson cosmique",'',60000,120000,null,'#fbcfe8','#6d28d9',0],["Dragon des étoiles",'',70000,140000,null,'#fef08a','#7c3aed',0]],
[["Mégalodon céleste",'',200000,400000,null,'#f5d0fe','#86198f',0],["Kraken primordial",'',300000,600000,null,'#e9d5ff','#6b21a8',1],["Léviathan éternel",'',500000,1000000,null,'#fbcfe8','#9d174d',1]]];
FISH.push(
 [["Phénix des abysses",'',10000000,25000000,null,'#fde68a','#ea580c',1],["Gardien des étoiles",'',15000000,35000000,null,'#bfdbfe','#7c3aed',0]],
 [["Origine du monde",'',100000000,250000000,null,'#fff7ed','#e11d48',1],["Le dernier Léviathan",'',150000000,400000000,null,'#fbcfe8','#7e22ce',1]],
 [["Serpent transcendant",'',500000000,1200000000,6,'#fb923c','#9a3412',1],["Méduse solaire",'',700000000,1600000000,6,'#fde68a','#ea580c',0]],
 [["Roi de l'infini",'',3000000000,8000000000,7,'#fb7185','#9f1239',1],["Comète vivante",'',5000000000,12000000000,7,'#fda4af','#be123c',0]],
 [["Architecte des mondes",'',25000000000,70000000000,8,'#c084fc','#6b21a8',1],["Noyau cosmique",'',40000000000,100000000000,8,'#e9d5ff','#7e22ce',0]],
 [["Singularité marine",'',250000000000,800000000000,9,'#67e8f9','#155e75',1],["Trou noir abyssal",'',500000000000,1500000000000,9,'#a5f3fc','#164e63',0]],
 [["Poisson au-delà",'',5000000000000,15000000000000,9,'#f8fafc','#64748b',1],["Origine véritable",'',10000000000000,30000000000000,9,'#fef08a','#a16207',0]],
 [["Ultime pêcheur",'',100000000000000,300000000000000,9,'#ffffff','#38bdf8',1],["Lumière finale",'',250000000000000,800000000000000,9,'#fef08a','#f97316',0]]
);
// Cannes : nom, prix, chance, vitesse, fenêtre de ferrage (ms), couleur
const RODS=[['Bambou',0,1,1,1400,'#d9a441'],['Roseau',24300,1.2,1.08,1480,'#a3e635'],['Carbone',40400,1.45,1.18,1550,'#94a3b8'],['Fibre de verre',262000,1.75,1.28,1650,'#67e8f9'],['Titane',494000,2.1,1.45,1800,'#7dd3fc'],['Corail',1200000,2.55,1.6,1900,'#fda4af'],['Tempête',8430000,3.1,1.8,2050,'#93c5fd'],['Astrale',16000000,3.8,2,2200,'#c4b5fd'],['Sanguine',29700000,4.6,2.25,2350,'#f87171'],['Spectrale',158000000,5.6,2.55,2500,'#a7f3d0'],['Dragon des mers',281000000,6.9,2.9,2700,'#fde047'],['Cosmique',501000000,8.5,3.3,2900,'#fbcfe8'],['Éclipse',2770000000,10.5,3.8,3100,'#a5b4fc'],['Nébuleuse',4900000000,13,4.3,3300,'#f0abfc'],['Aurore',8590000000,16,4.9,3500,'#5eead4'],['Trident du Léviathan',15000000000,20,5.6,3800,'#fde68a'],['Divine du Chat',86400000000,26,6.5,4200,'#f0abfc'],['Primordiale',141000000000,34,7.5,4600,'#fff']];
const BASE_RODS=RODS.length;
// Nom, niveau requis, prix en citrouilles, bonus, multiplicateur du bonus, couleur, icône
const HWRODS=[
 ['Canne Citrouille',2,2000,'chance',5,'#fb923c','🎃'],
 ['Canne Fantôme',2,3500,'chance',8,'#38bdf8','👻'],
 ['Canne Sorcière',10,5000,'value',12,'#22c55e','🧙'],
 ['Canne Vampire',15,7500,'window',.2,'#ef4444','🦇'],
 ['Canne Infernale',20,10000,'chance',10,'#f97316','🔥'],
 ['Canne Spectrale',25,15000,'value',15,'#a855f7','🌀'],
 ['Canne Lune Noire',25,22000,'chance',20,'#93c5fd','🌙'],
 ['Canne du Néant',30,35000,'value',25,'#d946ef','✨']
];
const HWROD_IMAGES=['citrouille','fantome','sorciere','vampire','infernale','spectrale','lune-noire','neant'].map(n=>`images/halloween/${n}.png`);
const hwRodImg=i=>`<img class="hwrod-img" src="${HWROD_IMAGES[i]}" alt="${HWRODS[i][0]}">`;
const ROD_SHOP_IMAGES=['bambou','roseau','carbone','fibre-de-verre','titane','corail','tempete','astrale','sanguine','spectrale','dragon-des-mers','cosmique','eclipse','nebuleuse','aurore','trident-du-leviathan','divine-du-chat','primordiale'].map(n=>`images/rods/${n}.png`);
const rodShopArt=i=>`<img class="rod-shop-art" src="${ROD_SHOP_IMAGES[i]}" alt="${RODS[i][0]}">`;
const eventRodSpeed=requiredLevel=>1+(requiredLevel-HWRODS[0][1])/(HWRODS[HWRODS.length-1][1]-HWRODS[0][1])*(RODS[BASE_RODS-1][3]-1);
RODS.push(...HWRODS.map(r=>[r[0],0,r[3]==='chance'?r[4]:1,eventRodSpeed(r[1]),1400+(r[3]==='window'?r[4]*1000:0),r[5]]));
// Appâts : nom, prix, chance, emoji, valeur, effet spécialisé, zone minimale.
const BAITS=[
 ['Mouche',15,1.1,'🪰',1.11],
 ['Ver de terre',25,1.18,'🪱',1.2],
 ['Crevette',75,1.45,'🦐',1.5],
 ['Calmar',150,1.68,'🦑',1.82],
 ['Leurre doré',300,1.98,'✨',2.22],
 ['Appât astral',600,2.7,'🌟',3.05],
 ['Appât abyssal',1800,3.65,'🐙',4.6],
 ['Appât cosmique',9000,5.2,'🌌',8],
 ['Larve lumineuse',300,1.35,'💡',1.05,'balanced',0],
 ['Pâte dorée',900,1.15,'🟡',1.55,'value',0],
 ['Calamar spectral',2500,1.85,'👻',1.25,'deep',4],
 ['Perle enchantée',3500,1.08,'🔮',1,'chest',0],
 ['Appât prédateur',5000,1.35,'🦷',1,'predator',0],
 ['Nectar astral',12000,3.1,'🌌',3.4,'astral',5]
];
const BAIT_ORDER=BAITS.map((b,i)=>i).sort((a,b)=>BAITS[a][1]-BAITS[b][1]);
// Zones : nom, prix, chance, valeur, ciel, horizon, eau haut, eau bas
const ZONES=[['Étang paisible',0,1,1.0,'#1e1b4b','#f472b6','#0ea5e9','#082f49'],['Rivière',86100,1.22,1.28,'#1e3a8a','#fdba74','#22d3ee','#0e4f5c'],['Lac brumeux',2670000,1.48,1.73,'#334155','#cbd5e1','#64748b','#0f172a'],['Récif corallien',54200000,1.9,2.63,'#0ea5e9','#fde68a','#2dd4bf','#134e4a'],['Abysses',893000000,2.45,4.44,'#020617','#1e1b4b','#1e3a8a','#020617'],['Mer astrale',26200000000,3.2,7.7,'#0f0a1e','#a855f7','#4c1d95','#0f0a1e'],['Faille temporelle',120000000000,4.2,12.5,'#172554','#f0abfc','#312e81','#0b102e'],['Dimension miroir',1500000000000,5.8,21,'#581c87','#fef08a','#7e22ce','#2e1065'],['Forge des mondes',12000000000000,8,38,'#431407','#fb923c','#c2410c','#450a0a'],['Néant ultime',120000000000000,11,75,'#020617','#67e8f9','#164e63','#020617']];
const WEATHER=[
 ['rain','Pluie fine','🌧️','Une carpe argentée se montre dans les eaux calmes.',0],
 ['sun','Grand soleil','☀️','Un poisson-lune apparaît près des rivières.',1],
 ['stars','Nuit étoilée','🌙','La carpe lunaire nage dans les lacs brumeux.',2]
];
const WEATHER_MS=8*60*1000;
const Weather={
 current(){return WEATHER[Math.floor(Date.now()/WEATHER_MS)%WEATHER.length]},
 left(){return WEATHER_MS-Date.now()%WEATHER_MS},
 ui(){const e=$('#weather-banner');if(!e)return;const w=this.current(),m=Math.floor(this.left()/60000),s=Math.floor(this.left()%60000/1000);e.innerHTML=`<span><b>${w[2]} ${w[1]}</b><br><span class="mu">${w[3]}</span></span><span class="mu">Change dans ${m}:${String(s).padStart(2,'0')}</span>`}
};
FISH[1].push(['Carpe argentée','',60,120,0,'#e2e8f0','#64748b',0,'rain']);
FISH[2].push(['Poisson-lune','',280,520,1,'#fde68a','#f97316',1,'sun']);
FISH[3].push(['Carpe lunaire','',1800,3200,2,'#c4b5fd','#312e81',1,'stars']);
// Espèces supplémentaires : les valeurs sont avant le multiplicateur de zone.
FISH[0].push(
 ['Ablette des roseaux','',16,40,0,'#dbeafe','#1e40af',0],
 ['Tanche cuivrée','',28,62,0,'#fed7aa','#9a3412',0],
 ['Vairon brumeux','',32,68,1,'#cbd5e1','#475569',0],
 ['Barbeau rapide','',38,76,1,'#bfdbfe','#1d4ed8',0]
);
FISH[1].push(
 ['Omble des cascades','',75,145,1,'#bae6fd','#0369a1',0],
 ['Carassin lunaire','',85,165,2,'#ddd6fe','#6d28d9',0,'stars'],
 ['Sandre des roseaux','',100,190,2,'#bbf7d0','#166534',0],
 ['Dorade prismatique','',150,280,3,'#fbcfe8','#be185d',0]
);
FISH[2].push(
 ['Poisson-ange solaire','',650,1250,3,'#fef08a','#ea580c',0,'sun'],
 ['Murène corallienne','',750,1400,3,'#fdba74','#9a3412',0],
 ['Requin-renard','',1100,2100,4,'#cbd5e1','#334155',0],
 ['Poisson-lanterne royal','',1300,2500,4,'#a5f3fc','#0e7490',0]
);
FISH[3].push(
 ['Espadon spectral','',4500,8500,4,'#c4b5fd','#6d28d9',0],
 ['Raie des profondeurs','',5200,9800,4,'#99f6e4','#115e59',1]
);
FISH[4].push(
 ['Nautile astral','',16000,30000,5,'#e9d5ff','#7e22ce',1],
 ['Requin comète','',22000,42000,5,'#fbcfe8','#be123c',0]
);
FISH[5].push(
 ['Méduse d\'horloge','',75000,140000,6,'#fed7aa','#c2410c',1],
 ['Carpe paradoxale','',95000,180000,6,'#bfdbfe','#3730a3',0,'rain']
);
FISH[6].push(
 ['Serpent miroir','',500000,950000,7,'#e9d5ff','#7e22ce',1],
 ['Raie inversée','',650000,1200000,7,'#a5f3fc','#155e75',1]
);
FISH[7].push(
 ['Forge-poisson','',4000000,7500000,8,'#fdba74','#9a3412',0],
 ['Salamandre solaire','',5500000,10000000,8,'#fef08a','#c2410c',0,'sun']
);
FISH[8].push(
 ['Marteau des abysses','',35000000,70000000,9,'#cbd5e1','#1e293b',0],
 ['Anguille du zéro','',50000000,100000000,9,'#a5f3fc','#155e75',0]
);
FISH[9].push(
 ['Écho du néant','',250000000,500000000,9,'#e2e8f0','#475569',1],
 ['Œil du néant','',350000000,700000000,9,'#f0abfc','#7e22ce',1]
);
FISH[10].push(['Roi sans océan','',2000000000,4000000000,9,'#fda4af','#9f1239',1]);
FISH[11].push(['Constellation vivante','',20000000000,40000000000,8,'#c4b5fd','#6d28d9',1]);
FISH[13].push(['Cœur de singularité','',300000000000,650000000000,9,'#67e8f9','#155e75',1]);
FISH[14].push(['Dernier battement','',8000000000000,18000000000000,9,'#fef08a','#f97316',1]);

// Enchantements (3 emplacements par canne) : nom, emoji, description, effet, bonus/niveau, niveau max, prix de base
// ENSCALE : échelle de tous les bonus d'enchantement (BUFF : .1 → .35, soit ×3,5 ; niveau 10 ≈ +14 % chance/valeur, +17,5 % vitesse, etc.)
const ENSCALE=.35;
const EN=[['Fortune des mers','🍀','Chance de touche','L',.04,10,1800],['Rapidité','⚡','Morsure plus rapide','S',.05,10,2200],['Patience','⏳','Fenêtre de ferrage','W',.055,10,2000],['Prospérité','💰','Valeur des poissons','V',.04,10,3500],['Économe','🪝','Chance de garder l\'appât','B',.05,10,2800],['Butin double','✌️','Chance de doubler une prise','D',.03,10,7500],['Chasseur de coffres','📦','Chance de coffre','C',.05,10,12000],['Coup critique','🎯','Chance de prise ×3','K',.025,10,15000],['Œil du prédateur','👁️','Raretés favorisées','R',.02,10,18000],['Serrure d\'or','🗝️','Pièces des coffres','Q',.05,10,16000],['Deuxième chance','🔄','Le poisson peut revenir mordre','H',.05,10,8000],['Appât raffiné','🧪','Amplifie le bonus de valeur des appâts','A',.06,10,6000],['Marée haute','🌊','Chance de pêcher une rareté au-dessus','P',.025,10,20000],['Chasseur de zone','🗺️','Valeur par zone débloquée','X',.025,10,22000]];
// Artefacts (3 équipés max, uniquement dans les coffres) : nom, emoji, rareté (= rang de coffre), effets
// ASCALE : échelle de la puissance des artefacts (BUFF : .3 → .7 ; ex. Trident de Poséidon +35 % valeur, Cœur astral +28 % chance)
const ASCALE=.7;
const AR=[['Boussole d\'or','🧭',0,{L:1.15}],['Lanterne des abysses','🏮',1,{W:1.25}],['Sablier marin','⌛',1,{S:1.3}],['Perle de sirène','🫧',2,{C:1.5}],['Amulette du chat','😺',2,{B:.15}],['Trident de Poséidon','🔱',3,{V:1.5}],['Œil de Léviathan','🧿',4,{R:.08}],['Ancre maudite','⚓',4,{V:2,S:.8}],['Couronne des mers','👑',6,{V:1.2,Q:1.5}],['Cœur astral','💠',7,{L:1.4,K:.1}],['Cœur citrouille','🎃',2,{V:1.18},1],['Grimoire spectral','📕',3,{L:1.22,W:1.12},1],['Médaillon du Cavalier','💀',4,{R:.04,K:.04},1]];
const AMUL='LSWVCQ',ALAB={L:'Chance',S:'Vitesse',W:'Fenêtre',V:'Valeur',C:'Coffres',Q:'Pièces des coffres',B:'Appât gratuit',R:'Raretés',K:'Critique'};
const artDesc=a=>Object.keys(a[3]).map(k=>{const v=a[3][k];if(AMUL.includes(k)){const d=(v-1)*ASCALE*100;return ALAB[k]+' '+(d>=0?'+':'−')+Math.abs(d).toFixed(1).replace('.0','')+' %'}return ALAB[k]+' +'+(v*ASCALE*100).toFixed(1).replace('.0','')+' %'}).join(' · ');
// Coffres : nom, couleur, fond, prix de vente, poids de drop en pêchant
const CHESTS=[['Commun','#94a3b8','#1e293b',250,50],['Rare','#3b82f6','#172554',1e3,28],['Épique','#a855f7','#3b0764',5e3,12],['Légendaire','#fbbf24','#78350f',25e3,5],['Mythique','#ef4444','#450a0a',1e5,2],['Secret','#22e39a','#022c22',5e5,.7],['Astral','#67e8f9','#082f49',2e6,.2],['Ultra','#f0abfc','#0f0a1e',1e7,.15],['Coffre Citrouille','#fb923c','#431407',150,0],['Coffre Maudit','#a855f7','#2e1065',300,0],['Coffre du Cavalier','#ef4444','#450a0a',450,0],['Divin','#fef08a','#422006',5e7,.05],['Cosmique','#c084fc','#2e1065',2e8,.02],['Omniversal','#f0abfc','#3b0764',1e9,.008],['Transcendant','#f97316','#431407',1e10,.002],['Infini','#ffffff','#172554',1e11,.0005]];
const CSYM=['','★','★','✦','♛','?','✧','∞','🎃','☠','💀','✹','✧','⬢','✺','∞'];
const HW_CHEST_IDS=[8,9,10];
// Butin d'un coffre de rareté t : [type, id, quantité, poids] — g pièces · b appât · r canne · f poisson (rareté)
const loot=t=>{const P=CHESTS[t][3],B=Math.min(7,t+1),R=Math.min(17,t*2+1);
 const L=[['g',0,Math.round(P*.6),30],['g',0,Math.round(P*1.5),20],['g',0,Math.round(P*4),6],['b',B,8+t*2,14],['b',Math.max(0,B-2),12,10],['f',t>=7?6:Math.min(5,t),1,10]];
 if(t>0)L.push(['r',R,1,3],['r',Math.min(17,R+1),1,1.5]);
 if(t>=4)L.push(['p',0,1,t>=6?1.5:1]);
 const ids=AR.map((a,i)=>i).filter(i=>!AR[i][4]&&Math.abs(AR[i][2]-t)<=1);if(ids.length){const w=Math.min(4,10/ids.length);ids.forEach(i=>L.push(['a',i,1,AR[i][2]===t?w*1.2:w*.8]))}
 return L};
const hwLoot=t=>{
 const tier=t-8,rods=[[0],[1,2],[3,4]][tier],artifact=10+tier;
 const L=[
  ['g',0,[120,240,360][tier],28],
  ['b',Math.min(7,3+tier),[4,6,8][tier],20],
  ['r',BASE_RODS+rods[0],1,[5,3,2][tier]],
  ['a',artifact,1,[4,5,6][tier]]
 ];
 if(rods[1]!=null)L.push(['r',BASE_RODS+rods[1],1,1]);
 return L
};

/* ============ 2. ÉTAT & SAUVEGARDE ============ */
