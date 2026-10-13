// Cannes : nom, prix, chance, vitesse, fenêtre de ferrage (ms), couleur
var RODS=[['Bambou',0,1,1,1400,'#d9a441'],['Roseau',24300,1.2,1.08,1480,'#a3e635'],['Carbone',40400,1.45,1.18,1550,'#94a3b8'],['Fibre de verre',262000,1.75,1.28,1650,'#67e8f9'],['Titane',494000,2.1,1.45,1800,'#7dd3fc'],['Corail',1200000,2.55,1.6,1900,'#fda4af'],['Tempête',8430000,3.1,1.8,2050,'#93c5fd'],['Astrale',16000000,3.8,2,2200,'#c4b5fd'],['Sanguine',29700000,4.6,2.25,2350,'#f87171'],['Spectrale',158000000,5.6,2.55,2500,'#a7f3d0'],['Dragon des mers',281000000,6.9,2.9,2700,'#fde047'],['Cosmique',501000000,8.5,3.3,2900,'#fbcfe8'],['Éclipse',2770000000,10.5,3.8,3100,'#a5b4fc'],['Nébuleuse',4900000000,13,4.3,3300,'#f0abfc'],['Aurore',8590000000,16,4.9,3500,'#5eead4'],['Trident du Léviathan',15000000000,20,5.6,3800,'#fde68a'],['Divine du Chat',86400000000,26,6.5,4200,'#f0abfc'],['Primordiale',141000000000,34,7.5,4600,'#fff']];
var BASE_RODS=RODS.length;
// Nom, niveau requis, prix en citrouilles, bonus, multiplicateur du bonus, couleur, icône
var HWRODS=[
 ['Canne Citrouille',2,2000,'chance',5,'#fb923c','🎃'],
 ['Canne Fantôme',5,3500,'chance',8,'#38bdf8','👻'],
 ['Canne Sorcière',10,5000,'value',12,'#22c55e','🧙'],
 ['Canne Vampire',15,7500,'window',.2,'#ef4444','🦇'],
 ['Canne Infernale',20,10000,'chance',10,'#f97316','🔥'],
 ['Canne Spectrale',25,15000,'value',15,'#a855f7','🌀'],
 ['Canne Lune Noire',25,22000,'chance',20,'#93c5fd','🌙'],
 ['Canne du Néant',30,35000,'value',25,'#d946ef','✨']
];
var HWROD_IMAGES=['citrouille','fantome','sorciere','vampire','infernale','spectrale','lune-noire','neant'].map(n=>`images/halloween/${n}.png`);
var hwRodImg=i=>`<img class="hwrod-img" src="${HWROD_IMAGES[i]}" alt="${HWRODS[i][0]}">`;
var ROD_SHOP_IMAGES=['bambou','roseau','carbone','fibre-de-verre','titane','corail','tempete','astrale','sanguine','spectrale','dragon-des-mers','cosmique','eclipse','nebuleuse','aurore','trident-du-leviathan','divine-du-chat','primordiale'].map(n=>`images/rods/${n}.png`);
var rodShopArt=i=>`<img class="rod-shop-art" src="${ROD_SHOP_IMAGES[i]}" alt="${RODS[i][0]}">`;
var eventRodSpeed=requiredLevel=>1+(requiredLevel-HWRODS[0][1])/(HWRODS[HWRODS.length-1][1]-HWRODS[0][1])*(RODS[BASE_RODS-1][3]-1);
RODS.push(...HWRODS.map(r=>[r[0],0,r[3]==='chance'?r[4]:1,eventRodSpeed(r[1]),1400+(r[3]==='window'?r[4]*1000:0),r[5]]));
