var ZONES=[
 ['Étang paisible',0,1,1.0,'#1e1b4b','#f472b6','#0ea5e9','#082f49'],
 ['Rivière',86100,1.22,1.28,'#1e3a8a','#fdba74','#22d3ee','#0e4f5c'],
 ['Lac brumeux',2670000,1.48,1.73,'#334155','#cbd5e1','#64748b','#0f172a'],
 ['Récif corallien',54200000,1.9,2.63,'#0ea5e9','#fde68a','#2dd4bf','#134e4a'],
 ['Abysses',893000000,2.45,4.44,'#020617','#1e1b4b','#1e3a8a','#020617'],
 ['Mer astrale',26200000000,3.2,7.7,'#0f0a1e','#a855f7','#4c1d95','#0f0a1e'],
 ['Faille temporelle',120000000000,4.2,12.5,'#172554','#f0abfc','#312e81','#0b102e'],
 ['Dimension miroir',1500000000000,5.8,21,'#581c87','#fef08a','#7e22ce','#2e1065'],
 ['Forge des mondes',12000000000000,8,38,'#431407','#fb923c','#c2410c','#450a0a'],
 ['Néant ultime',120000000000000,11,75,'#020617','#67e8f9','#164e63','#020617']
];
var WEATHER=[
 ['rain','Pluie fine','🌧️','Une carpe argentée se montre dans les eaux calmes.',0],
 ['sun','Grand soleil','☀️','Un poisson-lune apparaît près des rivières.',1],
 ['stars','Nuit étoilée','🌙','La carpe lunaire nage dans les lacs brumeux.',2]
];
var WEATHER_MS=8*60*1000;
var Weather={
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
