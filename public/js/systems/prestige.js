/* ============ 5a. BOSS, HEURE DORÉE & PRESTIGE ============ */
// Boss : de temps en temps un poisson légendaire mord (1 chance sur 400 par touche). Il faut le ferrer 5 fois de suite,
// chaque fois dans une fenêtre plus courte (55 % de celle de la canne). Récompense volontairement modérée :
// 60× la valeur moyenne de tes dernières prises + un coffre tiré au hasard (minimum garanti selon la zone, jusqu'à +3 rangs au-dessus) + de l'XP
var BOSSP=1/400,BOSSR=5,BOSSX=60,BOSSXP=150,BOSSCHEST=[0,1,2,2,3,4,5,6,7,7]; // coffre minimum garanti par zone
// un boss par zone : nom, emoji, couleur
var BOSS=[['Esturgeon ancestral','🐟','#38bdf8'],['Brochet royal','🐊','#22e39a'],['Spectre du lac','👻','#cbd5e1'],['Raie impériale','🦈','#2dd4bf'],['Kraken des abysses','🦑','#a855f7'],['Dragon astral','🐉','#f0abfc'],['Gardien temporel','⌛','#f97316'],['Reflet infini','🪞','#c084fc'],['Forgeron des mondes','⚒️','#fb923c'],['Roi du néant','👑','#67e8f9']];
// Heure dorée : tous les ~25-45 min (temps réel, page ouverte), la valeur des poissons est ×2 pendant 8 min
var Ev={mult:2,dur:8*60000,
 active(){return !!(S.ev&&S.ev.end>Date.now())},
 left(){const s=Math.max(0,Math.round((S.ev.end-Date.now())/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')},
 tick(){const n=Date.now();if(!S.ev||typeof S.ev!=='object')S.ev={end:0,next:0};
  if(!S.ev.next){S.ev.next=n+15*60000;save()}
  if(!this.active()&&n>=S.ev.next){S.ev.end=n+this.dur;S.ev.next=S.ev.end+rnd(25,45)*60000;save();return true}return false},
 ui(){HW.ui();const e=$('#evb');if(!e)return;e.innerHTML=this.active()?`<span class="evb">🌟 Heure dorée · valeur ×${this.mult} · ${this.left()}</span>`:''}};
// Prestige : on recommence contre des ⭐ (bonus permanent). Il faut dépenser 1 « Étoile filante » 🌠, objet rare qui se pêche (1 chance sur PDROP par prise) ou sort des gros coffres
var PDROP=1/8000;
var Pr={vb(){return .10},lb(){return .10},
 can(){return (S.pt|0)>0},
 gain(){return Math.max(1,Math.floor(Math.sqrt((S.fv||0)/1e9)))}};

