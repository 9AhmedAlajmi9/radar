(()=>{
const SY=['BTCUSDT','ETHUSDT','SOLUSDT'],W=[20,25,15,15,15,10];
let sym=SY[0],C=[],CH=[],H=[],D=[],hT=0,R=null,bad=false,busy=false,VN=70,VO=0;
const X={
ar:{sc:'التقييم',sg:'إشارة',wt:'مراقبة',no:'لا توجد إشارة بعد',bk:'محجوبة بفلتر التذبذب',ent:'الدخول',sl:'الوقف',tp:'الهدف',q:'الكمية',bal:'الرصيد $',rk:'مخاطرة %',ok:'تم النسخ',n:['الأطر D1/H1/M5','ICT/SMC','كلاسيكي','مؤشرات','Wyckoff/VSA','برايس أكشن'],b:'شراء',s:'بيع',er:'تعذر جلب البيانات من Binance',nt:'تحليل تعليمي وليس نصيحة مالية.',ol:'أقدم',nw:'أحدث',lv:'الآن'},
en:{sc:'Score',sg:'SIGNAL',wt:'WATCH',no:'No signal yet',bk:'Blocked by volatility filter',ent:'Entry',sl:'Stop',tp:'Target',q:'Size',bal:'Balance $',rk:'Risk %',ok:'Copied',n:['MTF D1/H1/M5','ICT/SMC','Classical','Indicators','Wyckoff/VSA','Price action'],b:'BUY',s:'SELL',er:'Could not load Binance data',nt:'Educational analysis, not financial advice.',ol:'Older',nw:'Newer',lv:'Live'}};
const t=k=>X[lang][k],sg=x=>x>0?1:x<0?-1:0,avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
const fmt=x=>x.toLocaleString('en-US',{maximumFractionDigits:x>100?2:4});
const K=(s,i,n)=>fetch('https://api.binance.com/api/v3/klines?symbol='+s+'&interval='+i+'&limit='+n).then(r=>{if(!r.ok)throw 0;return r.json()}).then(a=>a.map(k=>({t:k[0],o:+k[1],h:+k[2],l:+k[3],c:+k[4],v:+k[5]})));
const ema=(a,n)=>{const k=2/(n+1);let e=a[0];return a.map(x=>(e=x*k+e*(1-k)))};
const tr=a=>{const c=a.map(x=>x.c),i=c.length-1;return ema(c,20)[i]>ema(c,50)[i]?1:-1};
const atrS=a=>{const o=[];for(let i=1;i<a.length;i++)o.push(Math.max(a[i].h-a[i].l,Math.abs(a[i].h-a[i-1].c),Math.abs(a[i].l-a[i-1].c)));return o};
const rsi=c=>{let g=0,l=0;for(let i=c.length-14;i<c.length;i++){const d=c[i]-c[i-1];d>0?g+=d:l-=d}return l===0?100:100-100/(1+g/l)};
const sw=a=>{const hi=[],lo=[];for(let i=2;i<a.length-2;i++){const x=a[i],q=[a[i-1],a[i-2],a[i+1],a[i+2]];if(q.every(y=>x.h>y.h))hi.push({i,p:x.h});if(q.every(y=>x.l<y.l))lo.push({i,p:x.l})}return{hi,lo}};
const fT=ts=>{const d=new Date(ts),p=x=>String(x).padStart(2,'0');return p(d.getDate())+'/'+p(d.getMonth()+1)+' '+p(d.getHours())+':'+p(d.getMinutes())};

function analyze(){
 const n=C.length,p=C[n-1].c,B=C[n-2],B2=C[n-3],ts=atrS(C),A=avg(ts.slice(-14)),A50=avg(ts.slice(-50));
 const{hi,lo}=sw(C),rg=C.slice(-50),top=Math.max(...rg.map(x=>x.h)),bot=Math.min(...rg.map(x=>x.l)),pos=(p-bot)/(top-bot||1);
 const fvg=[],ob=[];
 for(let i=Math.max(2,n-60);i<n;i++){
  const a=C[i-2],c=C[i],b=C[i-1],z=a;
  if(c.l>a.h&&c.l-a.h>.3*A&&!C.slice(i+1).some(x=>x.l<=a.h))fvg.push({d:1,lo:a.h,hi:c.l,i:i-2});
  if(c.h<a.l&&a.l-c.h>.3*A&&!C.slice(i+1).some(x=>x.h>=a.l))fvg.push({d:-1,lo:c.h,hi:a.l,i:i-2});
  if(Math.abs(b.c-b.o)>1.5*A){
   if(b.c>b.o&&z.c<z.o&&!C.slice(i).some(x=>x.l<z.l))ob.push({d:1,lo:z.l,hi:z.h,i:i-2});
   if(b.c<b.o&&z.c>z.o&&!C.slice(i).some(x=>x.h>z.h))ob.push({d:-1,lo:z.l,hi:z.h,i:i-2});
  }
 }
 const lh=hi[hi.length-1],ll=lo[lo.length-1];let bos=0,bl=null;
 if(lh&&p>lh.p){bos=1;bl=lh}else if(ll&&p<ll.p){bos=-1;bl=ll}
 const iD=bos||tr(C),zn=[...fvg,...ob].some(z=>z.d===iD&&p>=z.lo-.3*A&&p<=z.hi+.3*A),disc=iD===1?pos<.5:pos>.5;
 const nr=a=>a.some(x=>Math.abs(p-x.p)<.6*A);
 let cd=pos<.4?1:pos>.6?-1:0,cs=.4;
 if(nr(lo)){cd=1;cs=1}else if(nr(hi)){cd=-1;cs=1}
 if(lh&&ll&&lh.p>ll.p){const g=lh.p-ll.p,up=lh.i>ll.i,r=up?(lh.p-p)/g:(p-ll.p)/g;if(r>=.5&&r<=.705){cd=up?1:-1;cs=1}}
 const cl=C.map(x=>x.c),iv=(ema(cl,20)[n-1]>ema(cl,50)[n-1]?1:-1)+(rsi(cl)>55?1:rsi(cl)<45?-1:0)+(ema(cl,12)[n-1]-ema(cl,26)[n-1]>0?1:-1);
 const vs=avg(C.slice(-22,-2).map(x=>x.v)),rb=B.h-B.l||1,cp=(B.c-B.l)/rb,sp=B.v>1.8*vs;
 const v1=sp?(cp>.6&&B.c>B.o?1:cp<.4&&B.c<B.o?-1:0):0;
 const rl=Math.min(...C.slice(-30,-2).map(x=>x.l)),rh=Math.max(...C.slice(-30,-2).map(x=>x.h));
 const wv=v1+((B.l<rl&&B.c>rl)?1:(B.h>rh&&B.c<rh)?-1:0);
 const bd=Math.abs(B.c-B.o)||1e-9,lw=Math.min(B.o,B.c)-B.l,uw=B.h-Math.max(B.o,B.c);
 let pv=0;
 if(lw>2*bd&&lw>.6*rb)pv=1;else if(uw>2*bd&&uw>.6*rb)pv=-1;
 else if(B.c>B.o&&B2.c<B2.o&&B.c>B2.o&&B.o<B2.c)pv=1;else if(B.c<B.o&&B2.c>B2.o&&B.c<B2.o&&B.o>B2.c)pv=-1;
 const ms=tr(D)+tr(H)+tr(C);
 const S=[{d:sg(ms),s:(3+Math.abs(ms))/6},{d:iD,s:.4*(bos?1:.5)+.3*zn+.3*disc},{d:cd,s:cs},{d:sg(iv),s:Math.abs(iv)/3},{d:sg(wv),s:Math.abs(wv)/2},{d:pv,s:pv?1:0}];
 const dir=sg(S.reduce((a,x,i)=>a+W[i]*x.d*x.s,0)),pts=S.map((x,i)=>dir&&x.d===dir?W[i]*x.s:0);
 return{dir,pts,total:Math.round(pts.reduce((a,b)=>a+b,0)),blocked:A<.5*A50||A>2.5*A50,fvg,ob,bos,bl,p,sl:p-dir*1.5*A,tp:p+dir*3*A};
}

function draw(){
 const cv=$('#rcv'),w=cv.clientWidth,h=260,d=devicePixelRatio||1,tot=CH.length;if(!w||!R||tot<30)return;
 VN=Math.max(20,Math.min(300,Math.min(tot,VN)));VO=Math.max(0,Math.min(tot-VN,VO));
 const vn=Math.round(VN),vo=Math.round(VO),end=tot-vo,s=Math.max(0,end-vn),v=CH.slice(s,end),base=tot-C.length;
 cv.width=w*d;cv.height=h*d;const g=cv.getContext('2d');g.scale(d,d);
 let mx=Math.max(...v.map(x=>x.h)),mn=Math.min(...v.map(x=>x.l));const pd=(mx-mn)*.06;mx+=pd;mn-=pd;
 const Y=q=>h-(q-mn)/(mx-mn)*h,cw=w/vn;
 const box=(z,col)=>{if(z.i+base>=end)return;const x=Math.max(0,z.i+base-s)*cw;g.fillStyle=col;g.fillRect(x,Y(z.hi),w-x,Math.max(2,Y(z.lo)-Y(z.hi)))};
 R.fvg.forEach(z=>box(z,z.d>0?'rgba(0,255,102,.16)':'rgba(255,77,106,.16)'));
 R.ob.forEach(z=>box(z,'rgba(176,38,255,.28)'));
 v.forEach((x,i)=>{const cx=i*cw+cw/2,c=x.c>=x.o?'#00FF66':'#FF4D6A';g.strokeStyle=g.fillStyle=c;g.beginPath();g.moveTo(cx,Y(x.h));g.lineTo(cx,Y(x.l));g.stroke();g.fillRect(cx-cw*.35,Math.min(Y(x.o),Y(x.c)),cw*.7,Math.max(1,Math.abs(Y(x.o)-Y(x.c))))});
 const ln=(q,c,dash)=>{const y=Y(q);if(y<0||y>h)return;g.strokeStyle=c;g.setLineDash(dash);g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();g.setLineDash([])};
 if(R.bl){ln(R.bl.p,'#00F0FF',[5,4]);g.fillStyle='#00F0FF';g.font='11px sans-serif';g.textAlign='left';g.fillText(R.bos>0?'BOS ↑':'BOS ↓',6,Y(R.bl.p)-4)}
 if(R.st==='sg'||R.st==='wt'){ln(R.p,'#E6EAF2',[2,3]);ln(R.sl,'#FF4D6A',[2,3]);ln(R.tp,'#00FF66',[2,3])}
 g.fillStyle='rgba(138,148,168,.95)';g.font='11px sans-serif';
 for(let k=0;k<4;k++){const idx=Math.min(v.length-1,Math.floor(k*(vn-1)/3));g.textAlign=k===0?'left':k===3?'right':'center';g.fillText(fT(v[idx].t),k===0?3:k===3?w-3:idx*cw,h-4)}
}

function ui(){
 $('#lb1').textContent=t('bal');$('#lb2').textContent=t('rk');$('#rnt').textContent=t('nt');
 $('#zo').textContent=t('ol');$('#zn').textContent=t('nw');$('#zl').textContent=t('lv');
 if(bad||!R){$('#rsc').innerHTML='<p class="mu">'+t('er')+'</p>';$('#rsg').style.display='none';return}
 const st=R.blocked?'bk':R.total>=85?'sg':R.total>=70?'wt':'no';R.st=st;
 const col=st==='sg'?'var(--gr)':st==='wt'?'var(--cy)':'var(--mu)',dt=R.dir>0?t('b'):t('s');
 $('#rsc').innerHTML='<div class="row"><h3 style="margin:0">'+t('sc')+'</h3><strong class="big" style="color:'+col+'">'+R.total+'/100</strong></div>'+
  R.pts.map((q,i)=>'<div class="rr"><span>'+t('n')[i]+'</span><i><b style="width:'+q/W[i]*100+'%"></b></i><em>'+q.toFixed(0)+'/'+W[i]+'</em></div>').join('')+
  '<p class="mu" style="margin:8px 0 0">'+(st==='bk'||st==='no'?t(st):t(st)+' · '+dt)+'</p>';
 let h='';
 if(st==='sg'||st==='wt'){
  const q=(+$('#ib').value||0)*(+$('#ir').value||0)/100/Math.abs(R.p-R.sl),rows=[[t('ent'),R.p],[t('sl'),R.sl],[t('tp'),R.tp],[t('q'),q]];
  h='<h3>'+dt+' '+sym.replace('USDT','')+'</h3>'+rows.map(([k,v],i)=>{const c=i<3&&v>100?v.toFixed(2):v.toFixed(4);return '<div class="cp"><span class="mu">'+k+'</span><strong>'+(i<3?fmt(v):c)+'</strong><button data-v="'+c+'">⧉</button></div>'}).join('');
 }
 $('#rsg').innerHTML=h;$('#rsg').style.display=h?'block':'none';draw();
}

async function go(){
 if(busy)return;busy=true;
 try{
  if(Date.now()-hT>60000){[D,H]=await Promise.all([K(sym,'1d',100),K(sym,'1h',100)]);hT=Date.now()}
  if(!CH.length)CH=await K(sym,'5m',1000);
  else{
   const a=await K(sym,'5m',4);
   if(a[0].t>CH[CH.length-1].t+300000)CH=await K(sym,'5m',1000);
   else{let add=0;a.forEach(x=>{const l=CH[CH.length-1];if(x.t===l.t)CH[CH.length-1]=x;else if(x.t>l.t){CH.push(x);add++}});if(add&&VO>0)VO+=add;if(CH.length>1500)CH=CH.slice(-1500)}
  }
  C=CH.slice(-150);
  if(C.length<60||H.length<50||D.length<50)throw 0;
  R=analyze();bad=false;
 }catch(e){bad=true}
 busy=false;ui();
}

const st=document.createElement('style');
st.textContent='.rr{display:flex;align-items:center;gap:8px;margin:6px 0;font-size:13px}.rr span{width:112px;color:var(--mu)}.rr i{flex:1;height:6px;background:var(--line);border-radius:3px;overflow:hidden}.rr b{display:block;height:100%;background:var(--cy)}.rr em{width:44px;font-style:normal;direction:ltr;text-align:end}.big{font-size:28px}.cp{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--line)}.cp strong{direction:ltr;flex:1;text-align:center}.cp button{background:var(--bg);border:1px solid var(--cy);color:var(--cy);border-radius:8px;padding:5px 12px;cursor:pointer}#tst{position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:var(--gr);color:#000;padding:8px 18px;border-radius:999px;z-index:60;display:none}#rz button{padding:9px 4px;font-size:13px}';
document.head.appendChild(st);
const sd=document.querySelector('[data-i=soon1]');if(sd)sd.style.display='none';
const bx=document.createElement('div');
bx.innerHTML='<div class="seg" id="rs">'+SY.map(s=>'<button data-s="'+s+'"'+(s===sym?' class="on"':'')+'>'+s.replace('USDT','')+' · M5</button>').join('')+'</div><canvas id="rcv" style="width:100%;height:260px;display:block;background:#0B0E14;border:1px solid var(--line);border-radius:12px;margin:10px 0 8px;touch-action:pan-y"></canvas><div class="seg" id="rz" style="margin:0 0 10px"><button id="zo"></button><button id="zn"></button><button id="zi">＋</button><button id="zu">－</button><button id="zl"></button></div><div class="card" id="rsc"></div><div class="card" id="rsg" style="display:none"></div><div class="card"><div class="row"><label class="f" style="flex:1;margin:0"><span id="lb1"></span><input id="ib" type="number" inputmode="decimal"></label><label class="f" style="flex:1;margin:0"><span id="lb2"></span><input id="ir" type="number" inputmode="decimal"></label></div><p class="mu" id="rnt" style="margin:10px 0 0"></p></div>';
$('#radar').appendChild(bx);
const ts=document.createElement('div');ts.id='tst';document.body.appendChild(ts);
$('#ib').value=get('bal','1000');$('#ir').value=get('rk','1');
['ib','ir'].forEach(id=>$('#'+id).oninput=e=>{set(id==='ib'?'bal':'rk',e.target.value);R&&ui()});
$('#rs').onclick=e=>{const b=e.target.closest('[data-s]');if(b){sym=b.dataset.s;hT=0;R=null;CH=[];VO=0;VN=70;$$('#rs button').forEach(x=>x.classList.toggle('on',x===b));go()}};
$('#rz').onclick=e=>{const b=e.target.closest('button');if(!b)return;
 if(b.id==='zo')VO+=VN*.5;else if(b.id==='zn')VO-=VN*.5;else if(b.id==='zi')VN*=.7;else if(b.id==='zu')VN*=1.4;else if(b.id==='zl')VO=0;draw()};
const cv=$('#rcv'),PT=new Map();let pd0=0,vn0=0;
cv.addEventListener('pointerdown',e=>{try{cv.setPointerCapture(e.pointerId)}catch(x){}PT.set(e.pointerId,{x:e.clientX,y:e.clientY});if(PT.size===2){const[a,b]=[...PT.values()];pd0=Math.hypot(a.x-b.x,a.y-b.y);vn0=VN}});
cv.addEventListener('pointermove',e=>{const p=PT.get(e.pointerId);if(!p)return;
 if(PT.size===1){const dx=e.clientX-p.x;p.x=e.clientX;p.y=e.clientY;VO+=dx/(cv.clientWidth/Math.round(VN));draw()}
 else if(PT.size===2){p.x=e.clientX;p.y=e.clientY;const[a,b]=[...PT.values()],dd=Math.hypot(a.x-b.x,a.y-b.y);if(pd0>10&&dd>10){VN=vn0*pd0/dd;draw()}}});
['pointerup','pointercancel'].forEach(k=>cv.addEventListener(k,e=>{PT.delete(e.pointerId)}));
document.addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(b){navigator.clipboard&&navigator.clipboard.writeText(b.dataset.v);ts.textContent=t('ok');ts.style.display='block';setTimeout(()=>ts.style.display='none',1200)}});
$$('nav button').forEach(b=>b.addEventListener('click',()=>setTimeout(draw,60)));
addEventListener('resize',draw);
window.RD={get:()=>({R,sym,C,CH}),analyze};
go();setInterval(go,5000);
})();
