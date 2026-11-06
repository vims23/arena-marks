export type Player = {id:string; name:string; nickname:string; club:string; color:string; photo:string; status:'pending'|'approved'|'rejected'; group:string; contact:string;phone?:string;city?:string;uf?:string};
export type GameEvent = {id:string; type:'goal'|'yellow'|'red'; side:'home'|'away'; name:string; time:number; voided:boolean};
export type Match = {id:string; home:string; away:string; group:string; station:string; time:string; status:'scheduled'|'live'|'paused'|'finished'|'confirmed'; homeScore:number; awayScore:number; elapsed:number; startedAt:number|null; events:GameEvent[]};
export type Settings = {title:string; game:string; capacity:number; groupCount:number; stationCount:number; winPoints:number; drawPoints:number; date:string; time?:string; venue?:string; rules?:string};
export type Draw = {seed:string; mode:string; groups:string[][]; published:boolean; createdAt:string};
export type ArenaState = {players:Player[]; matches:Match[]; settings:Settings; selectedMatch:string; scene:string; draw:Draw|null; audit:{id:string; text:string; at:string}[]};
export const STORAGE_KEY='arena-marks-v1-20261024';
const names=['Brandon Alves','Thiago Santos','Davi Oliveira','Arthur Gomes','Lucas Ferreira','Gabriel Costa','Samuel Lima','Bruno Martins','Daniel Ribeiro','Jeziel Silva','André Rocha','Pedro Henrique','Rafael Souza','João Vitor','Matheus Alves','Felipe Santos','Gustavo Lima','Vinícius Costa','Caio Oliveira','Miguel Rocha','Leonardo Silva','Henrique Gomes','Victor Ribeiro','Eduardo Martins','Nicolas Ferreira'];
const clubs=['Real Madrid','Manchester City','Barcelona','Bayern München','Liverpool','Paris Saint-Germain','Arsenal','Inter de Milão','Atlético de Madrid','Borussia Dortmund','Juventus','Milan','Chelsea','Bayer Leverkusen','Napoli','Manchester United','Benfica','Sporting','Porto','Roma','Newcastle','Tottenham','Aston Villa','Atalanta','Ajax'];
export const clubColors=['#eee8d0','#80c1e8','#bf294b','#e33848','#ee594d','#517cbc','#de4455','#5481d0','#dc7476','#d9ce39','#e3e5e5','#db4c4c','#548cdf','#ce515a','#63b9e5','#df5a53','#db6c63','#6cb98c','#5c92ce','#d6a451','#bec8cf','#dde2e8','#9c7ac3','#648dc4','#e16b74'];
export function initialState():ArenaState {
  const players:Player[]=names.slice(0,24).map((name,i)=>({id:`p${i+1}`,name,nickname:name.split(' ')[0],club:clubs[i],color:clubColors[i],photo:'',status:i<21?'approved':'pending',group:i<20?String.fromCharCode(65+Math.floor(i/5)):'',contact:''}));
  const match=(id:string,home:string,away:string,group:string,station:string,time:string,status:Match['status'],h=0,a=0,elapsed=0):Match=>({id,home,away,group,station,time,status,homeScore:h,awayScore:a,elapsed,startedAt:status==='live'?Date.now():null,events:[]});
return {players,settings:{title:'Champions Marks League II',game:'EA SPORTS FC 27',capacity:32,groupCount:4,stationCount:6,winPoints:3,drawPoints:1,date:''},selectedMatch:'m1',scene:'match',draw:null,matches:[
    match('m1','p1','p2','A','PS5 · 01','14:00','live',2,1,382000),
    match('m2','p6','p7','B','PS5 · 02','14:00','live',0,0,258000),
    match('m3','p11','p12','C','PS5 · 03','14:20','scheduled'),
    match('m4','p16','p17','D','PS5 · 01','14:40','scheduled'),
    match('m5','p3','p4','A','PS5 · 02','14:40','scheduled'),
    match('m6','p8','p9','B','PS5 · 03','13:20','confirmed',3,1),
    match('m7','p13','p14','C','PS5 · 01','13:20','finished',1,1),
    match('m8','p4','p5','A','PS5 · 02','13:00','confirmed',1,0)
  ],audit:[{id:'a1',text:'Bruno Martins venceu Atlético de Madrid por 3 a 1. Resultado confirmado.',at:new Date(Date.now()-180000).toISOString()},{id:'a2',text:'Victor Ribeiro enviou uma inscrição para análise.',at:new Date(Date.now()-300000).toISOString()}]};
}
export const playerById=(state:ArenaState,id:string)=>state.players.find(p=>p.id===id);
export function clock(match:Match,now=Date.now()){const ms=match.elapsed+(match.startedAt?Math.max(0,now-match.startedAt):0);const sec=Math.floor(ms/1000);return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;}
export function standing(state:ArenaState,group:string){
 return state.players.filter(p=>p.group===group&&p.status==='approved').map(p=>{let played=0,wins=0,draws=0,losses=0,gf=0,ga=0; state.matches.filter(m=>m.status==='confirmed'&&(m.home===p.id||m.away===p.id)).forEach(m=>{played++;const a=m.home===p.id?m.homeScore:m.awayScore;const b=m.home===p.id?m.awayScore:m.homeScore;gf+=a;ga+=b;if(a>b)wins++;else if(a===b)draws++;else losses++;});return {...p,played,wins,draws,losses,gf,ga,gd:gf-ga,points:wins*state.settings.winPoints+draws*state.settings.drawPoints};}).sort((a,b)=>b.points-a.points||b.wins-a.wins||b.gd-a.gd||b.gf-a.gf||a.name.localeCompare(b.name,'pt-BR'));
}
export function makeDraw(players:Player[],count:number,seed:string,mode:string):string[][]{
 let n=2166136261;for(const c of seed)n=Math.imul(n^c.charCodeAt(0),16777619);const random=()=>{n^=n<<13;n^=n>>>17;n^=n<<5;return (n>>>0)/4294967296;};
 const items=players.filter(p=>p.status==='approved').map(p=>p.id); for(let i=items.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[items[i],items[j]]=[items[j],items[i]];}
 const groups:string[][]=Array.from({length:count},()=>[]);items.forEach((id,i)=>{const round=Math.floor(i/count);groups[mode==='pots'&&round%2?count-1-i%count:i%count].push(id);});return groups;
}
