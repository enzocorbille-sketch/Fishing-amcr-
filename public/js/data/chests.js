// Coffres : nom, couleur, fond, prix de vente, poids de drop en pêchant
var CHESTS=[['Commun','#94a3b8','#1e293b',250,50],['Rare','#3b82f6','#172554',1e3,28],['Épique','#a855f7','#3b0764',5e3,12],['Légendaire','#fbbf24','#78350f',25e3,5],['Mythique','#ef4444','#450a0a',1e5,2],['Secret','#22e39a','#022c22',5e5,.7],['Astral','#67e8f9','#082f49',2e6,.2],['Ultra','#f0abfc','#0f0a1e',1e7,.15],['Coffre Citrouille','#fb923c','#431407',150,0],['Coffre Maudit','#a855f7','#2e1065',300,0],['Coffre du Cavalier','#ef4444','#450a0a',450,0],['Divin','#fef08a','#422006',5e7,.05],['Cosmique','#c084fc','#2e1065',2e8,.02],['Omniversal','#f0abfc','#3b0764',1e9,.008],['Transcendant','#f97316','#431407',1e10,.002],['Infini','#ffffff','#172554',1e11,.0005]];
var CSYM=['','★','★','✦','♛','?','✧','∞','🎃','☠','💀','✹','✧','⬢','✺','∞'];
var HW_CHEST_IDS=[8,9,10];
// Butin d'un coffre de rareté t : [type, id, quantité, poids] — g pièces · b appât · r canne · f poisson (rareté)
var loot=t=>{const P=CHESTS[t][3],B=Math.min(7,t+1),R=Math.min(17,t*2+1);
 const L=[['g',0,Math.round(P*.6),30],['g',0,Math.round(P*1.5),20],['g',0,Math.round(P*4),6],['b',B,8+t*2,14],['b',Math.max(0,B-2),12,10],['f',t>=7?6:Math.min(5,t),1,10]];
 if(t>0)L.push(['r',R,1,3],['r',Math.min(17,R+1),1,1.5]);
 if(t>=4)L.push(['p',0,1,t>=6?1.5:1]);
 const ids=AR.map((a,i)=>i).filter(i=>!AR[i][4]&&Math.abs(AR[i][2]-t)<=1);if(ids.length){const w=Math.min(4,10/ids.length);ids.forEach(i=>L.push(['a',i,1,AR[i][2]===t?w*1.2:w*.8]))}
 return L};
var hwLoot=t=>{
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

