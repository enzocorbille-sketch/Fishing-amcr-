// Appâts : nom, prix, chance, emoji, valeur, effet spécialisé, zone minimale.
var BAITS=[
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
 ['Mathieu',1000000000,1000,'🪰',1000,'balanced',0]
];
var BAIT_ORDER=BAITS.map((b,i)=>i).sort((a,b)=>BAITS[a][1]-BAITS[b][1]);
