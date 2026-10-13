// Enchantements (3 emplacements par canne) : nom, emoji, description, effet, bonus/niveau, niveau max, prix de base
// ENSCALE : échelle de tous les bonus d'enchantement (BUFF : .1 → .35, soit ×3,5 ; niveau 10 ≈ +14 % chance/valeur, +17,5 % vitesse, etc.)
var ENSCALE=.35;
var EN=[
 ['Fortune des mers','🍀','Chance de touche','L',.04,10,1800],
 ['Rapidité','⚡','Morsure plus rapide','S',.05,10,2200],
 ['Patience','⏳','Fenêtre de ferrage','W',.055,10,2000],
 ['Prospérité','💰','Valeur des poissons','V',.04,10,3500],
 ['Économe','🪝','Chance de garder l\'appât','B',.05,10,2800],
 ['Butin double','✌️','Chance de doubler une prise','D',.03,10,7500],
 ['Chasseur de coffres','📦','Chance de coffre','C',.05,10,12000],
 ['Coup critique','🎯','Chance de prise ×3','K',.025,10,15000],
 ['Œil du prédateur','👁️','Raretés favorisées','R',.02,10,18000],
 ['Serrure d\'or','🗝️','Pièces des coffres','Q',.05,10,16000],
 ['Deuxième chance','🔄','Le poisson peut revenir mordre','H',.05,10,8000],
 ['Appât raffiné','🧪','Amplifie le bonus de valeur des appâts','A',.06,10,6000],
 ['Marée haute','🌊','Chance de pêcher une rareté au-dessus','P',.025,10,20000],
 ['Chasseur de zone','🗺️','Valeur par zone débloquée','X',.025,10,22000]
];
// Artefacts (3 équipés max, uniquement dans les coffres) : nom, emoji, rareté (= rang de coffre), effets
// ASCALE : échelle de la puissance des artefacts (BUFF : .3 → .7 ; ex. Trident de Poséidon +35 % valeur, Cœur astral +28 % chance)
var ASCALE=.7;
var AR=[
 ['Boussole d\'or','🧭',0,{L:1.15}],
 ['Lanterne des abysses','🏮',1,{W:1.25}],
 ['Sablier marin','⌛',1,{W:1.3}],
 ['Perle de sirène','🫧',2,{C:1.5}],
 ['Amulette du chat','😺',2,{B:.15}],
 ['Trident de Poséidon','🔱',3,{V:1.5}],
 ['Œil de Léviathan','🧿',4,{R:.08}],
 ['Ancre maudite','⚓',4,{V:2,S:.8}],
 ['Couronne des mers','👑',6,{V:1.2,Q:1.5}],
 ['Cœur astral','💠',7,{L:1.4,K:.1}],
 ['Cœur citrouille','🎃',2,{V:1.18},1],
 ['Grimoire spectral','📕',3,{L:1.22,W:1.12},1],
 ['Médaillon du Cavalier','💀',4,{R:.04,K:.04},1]
];
var AMUL='LSWVCQ',ALAB={L:'Chance',S:'Vitesse',W:'Fenêtre',V:'Valeur',C:'Coffres',Q:'Pièces des coffres',B:'Appât gratuit',R:'Raretés',K:'Critique'};
var artDesc=a=>Object.keys(a[3]).map(k=>{const v=a[3][k];if(AMUL.includes(k)){const d=(v-1)*ASCALE*100;return ALAB[k]+' '+(d>=0?'+':'−')+Math.abs(d).toFixed(1).replace('.0','')+' %'}return ALAB[k]+' +'+(v*ASCALE*100).toFixed(1).replace('.0','')+' %'}).join(' · ');
