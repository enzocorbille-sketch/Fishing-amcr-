/* ============ 1. DONNÉES ============ */
// Raretés : nom, couleur, poids de base, XP gagnée
var TIERS=[['Commun','#94a3b8',70,4],['Rare','#3b82f6',22,10],['Épique','#a855f7',6,30],['Mythique','#ef4444',1.5,90],['Secret','#22e39a',0.25,250],['Astral','#67e8f9',0,700],['Ultra','#f0abfc',0.01,1800],['Légendaire','#fbbf24',0.000002,4500],['Primordial','#fb7185',0.00000002,10000],['Transcendant','#f97316',0.000000001,25000],['Infini','#f43f5e',0.00000000003,65000],['Omniversal','#c084fc',0.0000000000008,180000],['Créateur','#fef08a',0.000000000000015,500000],['Singularité','#67e8f9',0.000000000000000002,1500000],['Au-delà','#ffffff',2,5000000]];
var RARE_SHOWCASE_COLORS=['#22d3ee','#ec4899','#facc15','#ef4444','#f97316','#dc2626','#a855f7','#fde047','#14b8a6','#f8fafc'];
var rareShowcaseColor=t=>t>=5?RARE_SHOWCASE_COLORS[Math.min(t-5,RARE_SHOWCASE_COLORS.length-1)]:TIERS[t][1];
// Poissons par rareté : nom, (libre), valeur min, valeur max, zone exclusive ou null, couleur haut, couleur bas, corps rond (1/0)
var FISH=[
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
