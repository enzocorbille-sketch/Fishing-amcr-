S.eb=S.eb&&typeof S.eb==='object'?S.eb:{};
S.chests=S.chests&&typeof S.chests==='object'?S.chests:{};
for(const [r,ids] of Object.entries(S.re||{})){
 const rod=+r;if(!Number.isInteger(rod)||!Array.isArray(ids))continue;
 S.re[rod]=ids.filter(i=>{if(!EN[i]||(S.en[i]|0)<1)return false;if(S.eb[i]==null){S.eb[i]=rod;return true}return +S.eb[i]===rod});
}
var save=()=>{try{S.ver=1;S._t=Date.now();localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}Cloud.dirty()};
