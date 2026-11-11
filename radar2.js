(()=>{
const T={
ar:{snd:'تفعيل الصوت',sndOn:'الصوت مفعّل ✓',sndT:'رنين خفيف عند المراقبة (70+) وجرس عند الإشارة (85+). يعمل والتطبيق مفتوح فقط.',lg:'سجل الإشارات',win:'رابحة',los:'خاسرة',op:'مفتوحة',wr:'نسبة الربح',emp:'لا توجد إشارات مسجلة بعد',w:'ربح',l:'خسارة',o:'مفتوحة',
 acc:{b:'الرصيد',e:'الصافي',f:'عائم',m:'الهامش الحر'},dep:'رصيد وهمي $',set:'ضبط وتصفير',rk:'المخاطرة',sp:'وقف %',tpp:'هدف %',auto:'روبوت الإغلاق التلقائي',buy:'شراء',sell:'بيع',pos:'الصفقات المفتوحة',np:'لا توجد صفقات مفتوحة',cl:'إغلاق',an:'الأداء',tr:'الصفقات',best:'أفضل أصل',mg:'الهامش غير كافٍ',nt:'محاكاة بمال وهمي على الأسعار الحية، برافعة ثابتة 10x.'},
en:{snd:'Enable sound',sndOn:'Sound on ✓',sndT:'Soft chime on WATCH (70+), bell on SIGNAL (85+). Works only while the app is open.',lg:'Signal log',win:'Wins',los:'Losses',op:'Open',wr:'Win rate',emp:'No signals logged yet',w:'WIN',l:'LOSS',o:'OPEN',
 acc:{b:'Balance',e:'Equity',f:'Floating',m:'Free margin'},dep:'Virtual deposit $',set:'Set & reset',rk:'Risk',sp:'Stop %',tpp:'Target %',auto:'Auto-Close Robot',buy:'BUY',sell:'SELL',pos:'Open positions',np:'No open positions',cl:'Close',an:'Performance',tr:'Trades',best:'Best asset',mg:'Not enough margin',nt:'Paper trading with fake money on live prices, fixed 10x leverage.'}
};
const SY=['BTCUSDT','ETHUSDT','SOLUSDT'],fmtP=x=>x>100?x.toFixed(2):x.toFixed(4),pr=s=>px[s]?px[s].p:0;
let ac=null,snd=false;
const tone=(f,t0,d,v)=>{const c=ac,o=c.createOscillator(),g=c.createGain(),n=c.currentTime+t0;o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,n);g.gain.linearRampToValueAtTime(v,n+.01);g.gain.exponentialRampToValueAtTime(.0001,n+d);o.connect(g);g.connect(c.destination);o.start(n);o.stop(n+d+.05)};
const chime=()=>{if(snd){tone(880,0,.5,.12);tone(1320,.12,.5,.08)}};
const bell=()=>{if(snd)[0,.45,.9].forEach(t=>{tone(660,t,1.2,.5);tone(1320,t,1,.3);tone(1980,t,.8,.15)})};

let LG=[];try{LG=JSON.parse(get('lg','[]'))||[]}catch(e){}
const svl=()=>set('lg',JSON.stringify(LG.slice(-60)));
let P=null;try{P=JSON.parse(get('pt','null'))}catch(e){}
if(!P||typeof P.bal!=='number')P={dep:10000,bal:10000,pos:[],h:[],auto:1,rk:1,sp:.5,tpp:1,sym:'BTCUSDT'};
if(!P.dep)P.dep=10000;
const svp=()=>set('pt',JSON.stringify(P));
const msg=x=>{const e=$('#tst');if(!e)return;e.textContent=x;e.style.display='block';setTimeout(()=>e.style.display='none',1500)};

function addSig(s,d,lv,sc){
 if(LG.some(x=>x.s===s&&x.st==='o'))return;
 if(LG.some(x=>x.s===s&&Date.now()-x.t<1800000))return;
 LG.push({s,d,e:lv[0],sl:lv[1],tp:lv[2],sc,t:Date.now(),st:'o'});svl();
}
function resolve(){let ch=0;LG.forEach(x=>{if(x.st!=='o'||!px[x.s])return;const p=pr(x.s);
 const w=x.d>0?p>=x.tp:p<=x.tp,l=x.d>0?p<=x.sl:p>=x.sl;
 if(w){x.st='w';ch=1}else if(l){x.st='l';ch=1}});if(ch)svl()}

const seen={},seenW={};
function watch(){
 const sg=$('#rsg'),big=$('#rsc .big'),h3=sg&&sg.querySelector('h3'),b=$('#rs .on');
 if(!big||!b)return;const s=b.dataset.s,total=parseInt(big.textContent),vis=sg.style.display==='block';
 if(!vis||!h3||h3.textContent.indexOf(s.replace('USDT',''))<0)return;
 const lv=[...sg.querySelectorAll('[data-v]')].map(x=>parseFloat(x.dataset.v)),d=/BUY|شراء/.test(h3.textContent)?1:-1,now=Date.now();
 if(total>=85){if(now-(seen[s]||0)>120000){bell();addSig(s,d,lv,total)}seen[s]=now}
 else{if(now-(seenW[s]||0)>120000)chime();seenW[s]=now}
}

const fl=x=>(x.d>0?pr(x.s)-x.e:x.e-pr(x.s))*x.q;
function acct(){let f=0,m=0;P.pos.forEach(x=>{f+=fl(x);m+=x.e*x.q/10});const eq=P.bal+f;return{bal:P.bal,eq,f,m:eq-m}}
function open(d){const p=pr(P.sym);if(!p)return;const q=P.bal*P.rk/100/(p*P.sp/100);
 if(p*q/10>acct().m){msg(T[lang].mg);return}
 P.pos.push({s:P.sym,d,e:p,q,sl:p*(1-d*P.sp/100),tp:p*(1+d*P.tpp/100),t:Date.now()});svp()}
function close(i,cp){const x=P.pos[i];if(!x)return;const z=cp||pr(x.s),pl=(x.d>0?z-x.e:x.e-z)*x.q;P.bal+=pl;P.h.push({s:x.s,pl,t:Date.now()});P.pos.splice(i,1);svp()}
function auto(){if(!P.auto)return;for(let i=P.pos.length-1;i>=0;i--){const x=P.pos[i],p=pr(x.s),
 hs=x.d>0?p<=x.sl:p>=x.sl,ht=x.d>0?p>=x.tp:p<=x.tp;if(hs)close(i,x.sl);else if(ht)close(i,x.tp)}}

const st=document.createElement('style');
st.textContent='.pa{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:12px}.pa div{display:flex;flex-direction:column}.pa strong{font-size:18px;direction:ltr;text-align:start}.bs{display:flex;gap:10px;margin-top:12px}.bs button{flex:1;padding:18px;font-size:20px;font-weight:700;border-radius:12px;border:1px solid;cursor:pointer;background:var(--bg)}.bb{color:var(--gr);border-color:var(--gr)}.ss{color:var(--rd);border-color:var(--rd)}.bt{background:var(--bg);border:1px solid var(--cy);color:var(--cy);border-radius:8px;padding:8px 16px;cursor:pointer}';
document.head.appendChild(st);

const ab=document.createElement('div');ab.className='card';
ab.innerHTML='<div class="row"><span class="mu" id="snt" style="font-size:12px"></span><button class="bt" id="snb"></button></div>';
$('#radar').insertBefore(ab,$('#sess'));
const lg=document.createElement('div');lg.className='card';lg.id='rlg';$('#radar').appendChild(lg);
$('#snb').onclick=()=>{try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();ac.resume();snd=true;chime()}catch(e){}};

function build(){const t=T[lang];$('#paper').innerHTML=
 '<div class="card"><div class="pa" id="pacc"></div></div>'+
 '<div class="card"><div class="row" style="gap:10px;align-items:flex-end"><label class="f" style="flex:1;margin:0">'+t.dep+'<input id="pd" type="number" inputmode="decimal" value="'+P.dep+'"></label><button class="bt" id="pset">'+t.set+'</button></div></div>'+
 '<div class="card"><div class="seg" id="pas">'+SY.map(s=>'<button data-s="'+s+'" class="'+(s===P.sym?'on':'')+'">'+s.replace('USDT','')+'</button>').join('')+'</div><div class="mu" id="ppx" style="margin:8px 0;direction:ltr;text-align:start"></div>'+
 '<p class="mu" style="margin:0 0 6px">'+t.rk+'</p><div class="seg">'+[1,1.5,2].map(r=>'<button data-r="'+r+'" class="'+(r===P.rk?'on':'')+'">'+r+'%</button>').join('')+'</div>'+
 '<div class="row" style="gap:10px;margin-top:12px"><label class="f" style="flex:1;margin:0">'+t.sp+'<input id="psp" type="number" inputmode="decimal" value="'+P.sp+'"></label><label class="f" style="flex:1;margin:0">'+t.tpp+'<input id="ptp" type="number" inputmode="decimal" value="'+P.tpp+'"></label></div>'+
 '<div class="row" style="margin-top:12px"><span>'+t.auto+'</span><input type="checkbox" class="sw" id="pau"'+(P.auto?' checked':'')+'></div>'+
 '<div class="bs"><button class="bb" id="pb">'+t.buy+'</button><button class="ss" id="ps">'+t.sell+'</button></div><p class="mu" style="margin:10px 0 0;font-size:12px">'+t.nt+'</p></div>'+
 '<div class="card"><h3>'+t.pos+'</h3><div id="ppo"></div></div><div class="card"><h3>'+t.an+'</h3><div id="pan"></div></div>';
}
function dyn(){const t=T[lang],a=acct();
 $('#pacc').innerHTML=[['b',a.bal],['e',a.eq],['f',a.f],['m',a.m]].map(([k,v])=>'<div><span class="mu">'+t.acc[k]+'</span><strong style="color:'+(k==='f'?(v>=0?'var(--gr)':'var(--rd)'):'inherit')+'">'+v.toFixed(2)+'</strong></div>').join('');
 $('#ppx').textContent=P.sym.replace('USDT','')+'/USDT  '+fmtP(pr(P.sym));
 $('#ppo').innerHTML=P.pos.length?P.pos.map((x,i)=>{const f=fl(x);return '<div class="cp" style="flex-wrap:wrap"><span>'+(x.d>0?t.buy:t.sell)+' '+x.s.replace('USDT','')+'</span><strong style="color:'+(f>=0?'var(--gr)':'var(--rd)')+'">'+f.toFixed(2)+'</strong><button data-c="'+i+'">'+t.cl+'</button><span class="mu" style="width:100%;direction:ltr;text-align:start;font-size:12px">'+fmtP(x.e)+' · SL '+fmtP(x.sl)+' · TP '+fmtP(x.tp)+'</span></div>'}).join(''):'<p class="mu">'+t.np+'</p>';
 const n=P.h.length,w=P.h.filter(x=>x.pl>0).length,m={};P.h.forEach(x=>m[x.s]=(m[x.s]||0)+x.pl);const bk=Object.keys(m).sort((x,y)=>m[y]-m[x])[0];
 $('#pan').innerHTML='<div class="pa"><div><span class="mu">'+t.wr+'</span><strong>'+(n?Math.round(w/n*100)+'%':'—')+'</strong></div><div><span class="mu">'+t.tr+'</span><strong>'+n+'</strong></div><div><span class="mu">'+t.best+'</span><strong>'+(bk?bk.replace('USDT',''):'—')+'</strong></div></div>';
}
function rlog(){const t=T[lang],n=LG.length,w=LG.filter(x=>x.st==='w').length,l=LG.filter(x=>x.st==='l').length,f=w+l;
 $('#snb').textContent=snd?t.sndOn:t.snd;$('#snt').textContent=t.sndT;
 $('#rlg').innerHTML='<h3>'+t.lg+'</h3><p class="mu">'+t.wr+': '+(f?Math.round(w/f*100)+'%':'—')+' · '+t.win+' '+w+' · '+t.los+' '+l+' · '+t.op+' '+(n-f)+'</p>'+(n?LG.slice(-10).reverse().map(x=>{const c=x.st==='w'?'var(--gr)':x.st==='l'?'var(--rd)':'var(--mu)',d=new Date(x.t);return '<div class="cp"><span>'+(x.d>0?t.buy:t.sell)+' '+x.s.replace('USDT','')+' · '+x.sc+'</span><span class="mu" style="direction:ltr">'+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+'</span><strong style="color:'+c+'">'+t[x.st]+'</strong></div>'}).join(''):'<p class="mu">'+t.emp+'</p>');
}

const pp=$('#paper');
pp.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.s){P.sym=b.dataset.s;svp();build()}
 else if(b.dataset.r){P.rk=+b.dataset.r;svp();build()}
 else if(b.dataset.c!==undefined)close(+b.dataset.c);
 else if(b.id==='pset'){const v=+$('#pd').value;if(v>0){P.dep=v;P.bal=v;P.pos=[];P.h=[];svp()}}
 else if(b.id==='pb')open(1);else if(b.id==='ps')open(-1);else return;
 dyn()});
pp.addEventListener('input',e=>{const i=e.target,v=+i.value;if(i.id==='psp'&&v>0)P.sp=v;if(i.id==='ptp'&&v>0)P.tpp=v;svp()});
pp.addEventListener('change',e=>{if(e.target.id==='pau'){P.auto=e.target.checked?1:0;svp()}});
$('#langBtn').addEventListener('click',()=>setTimeout(()=>{build();dyn();rlog()},0));
build();dyn();rlog();
setInterval(()=>{try{watch();resolve();auto();dyn();rlog()}catch(e){}},1000);
})();
