// Inventaire : poissons favoris, vente, coffres et remise à zéro.
// Les actions appellent Act.done() pour conserver la sauvegarde existante.
var Inventory={
 sellChest(t){if(!(S.chests[t]>0))return;S.c+=CHESTS[t][3];if(!--S.chests[t])delete S.chests[t];Act.done()},
 favLast(){const c=Engine.last;if(!c||c.t==null||c.fav)return;const k=c.t+'-'+c.j,e=S.inv[k];
  if(!e||e.n<1||e.v<c.val-1e-6||(S.fav||[]).length>=FAVMAX)return;
  e.n--;e.v=Math.max(0,e.v-c.val);if(e.n<=0)delete S.inv[k];S.fav=S.fav||[];S.fav.push({t:c.t,j:c.j,v:c.val,m:c.mut});c.fav=1;save();UI.caught(c);UI.head()},
 unfav(i){const f=(S.fav||[])[i];if(!f)return;const k=f.t+'-'+f.j,e=S.inv[k]||{n:0,v:0};e.n++;e.v+=f.v;S.inv[k]=e;S.fav.splice(i,1);Act.done()},
 sellFav(i){const f=(S.fav||[])[i];if(!f)return;S.c+=f.v;S.fav.splice(i,1);Act.done()},
 toggleAf(){S.af=S.af===0?1:0;Act.done()},
 sell(t){let g=0;for(const k in S.inv){if(t<0||k.startsWith(t+'-')){g+=S.inv[k].v;delete S.inv[k]}}S.c+=g;Act.done()},
 reset(){if(confirm('Tout effacer et repartir de zéro ?')){Object.assign(S,fresh());Cloud.force=1;Act.done()}}
};
