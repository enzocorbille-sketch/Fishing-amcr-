var KEY='catbet-fishing-v3';
var fresh=()=>({c:150,xp:0,rod:0,rods:[0],zone:0,zones:[0],bait:-1,baits:{},inv:{},idx:{},chests:{},casts:0,en:{},re:{},eb:{},es:0,ao:{},ae:[],quests:null,ev:{end:0,next:0},pr:0,pn:0,fv:0,pt:0,bk:{},avg:0,mu:{},fav:[],af:1,ach:{},hw:null,hwt:0,op:0,gr:[],rec:{},play:0});
var S=(()=>{try{return Object.assign(fresh(),JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){return fresh()}})();
delete S.fa;
