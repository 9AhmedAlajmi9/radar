(()=>{
const W=[20,25,15,15,15,10],SY=['BTCUSDT','ETHUSDT','SOLUSDT'],TH=[50,60,70,80,85],NN=[1000,3000,5000];
const sg=x=>x>0?1:x<0?-1:0,avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
const ema=(a,n)=>{const k=2/(n+1);let e=a[0];return a.map(x=>(e=x*k+e*(1-k)))};
const tr=a=>{const c=a.map(x=>x.c),i=c.length-1;return ema(c,20)[i]>ema(c,50)[i]?1:-1};
const atrS=a=>{const o=[];for(let i=1;i<a.length;i++)o.push(Math.max(a[i].h-a[i].l,Math.abs(a[i].h-a[i-1].c),Math.abs(a[i].l-a[i-1].c)));return o};
const rsi=c=>{let g=0,l=0;for(let i=c.length-14;i<c.length;i++){const d=c[i]-c[i-1];d>0?g+=d:l-=d}return l===0?100:100-100/(1+g/l)};
const sw=a=>{const hi=[],lo=[];for(let i=2;i<a.length-2;i++){const x=a[i],q=[a[i-1],a[i-2],a[i+1],a[i+2]];if(q.every(y=>x.h>y.h))hi.push({i,p:x.h});if(q.every(y=>x.l<y.l))lo.push({i,p:x.l})}return{hi,lo}};

function oldA(C,H,D){
 const n=C.length,p=C[n-1].c,B=C[n-2],B2=C[n-3],ts=atrS(C),A=avg(ts.slice(-14)),A50=avg(ts.slice(-50));
 const{hi,lo}=sw(C),rg=C.slice(-50),top=Math.max(...rg.map(x=>x.h)),bot=Math.min(...rg.map(x=>x.l)),pos=(p-bot)/(top-bot||1);
 const fvg=[],ob=[];
 for(let i=Math.max(2,n-60);i<n;i++){
  const a=C[i-2],c=C[i],b=C[i-1],z=a;
  if(c.l>a.h&&c.l-a.h>.3*A&&!C.slice(i+1).some(x=>x.l<=a.h))fvg.push({d:1,lo:a.h,hi:c.l});
  if(c.h<a.l&&a.l-c.h>.3*A&&!C.slice(i+1).some(x=>x.h>=a.l))fvg.push({d:-1,lo:c.h,hi:a.l});
  if(Math.abs(b.c-b.o)>1.5*A){
   if(b.c>b.o&&z.c<z.o&&!C.slice(i).some(x=>x.l<z.l))ob.push({d:1,lo:z.l,hi:z.h});
   if(b.c<b.o&&z.c>z.o&&!C.slice(i).some(x=>x.h>z.h))ob.push({d:-1,lo:z.l,hi:z.h});
  }
 }
 const lh=hi[hi.length-1],ll=lo[lo.length-1];let bos=0;
 if(lh&&p>lh.p)bos=1;else if(ll&&p<ll.p)bos=-1;
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
 return{dir,pts,total:Math.round(pts.reduce((a,b)=>a+b,0)),blocked:A<.5*A50||A>2.5*A50,p,sl:p-dir*1.5*A,tp:p+dir*3*A};
}

function newA(C,H,D){
 const n=C.length,p=C[n-1].c,ts=atrS(C),A=avg(ts.slice(-14)),A50=avg(ts.slice(-50));
 const{hi,lo}=sw(C),rg=C.slice(-50),top=Math.max(...rg.map(x=>x.h)),bot=Math.min(...rg.map(x=>x.l)),pos=(p-bot)/(top-bot||1);
 const fvg=[],ob=[];
 for(let i=Math.max(2,n-60);i<n;i++){
  const a=C[i-2],c=C[i],b=C[i-1];
  if(c.l>a.h&&c.l-a.h>.3*A&&!C.slice(i+1).some(x=>x.l<=a.h))fvg.push({d:1,lo:a.h,hi:c.l});
  if(c.h<a.l&&a.l-c.h>.3*A&&!C.slice(i+1).some(x=>x.h>=a.l))fvg.push({d:-1,lo:c.h,hi:a.l});
  if(Math.abs(b.c-b.o)>1.5*A){
   if(b.c>b.o&&a.c<a.o&&!C.slice(i).some(x=>x.l<a.l))ob.push({d:1,lo:a.l,hi:a.h});
   if(b.c<b.o&&a.c>a.o&&!C.slice(i).some(x=>x.h>a.h))ob.push({d:-1,lo:a.l,hi:a.h});
  }
 }
 const lh=hi[hi.length-1],ll=lo[lo.length-1];let bos=0;
 if(lh&&p>lh.p)bos=1;else if(ll&&p<ll.p)bos=-1;
 const nz=d=>[...fvg,...ob].some(z=>z.d===d&&p>=z.lo-.3*A&&p<=z.hi+.3*A);
 const cl=C.map(x=>x.c),vs=avg(C.slice(-22,-2).map(x=>x.v));
 const Lg=[0,0,0,0,0,0],Sh=[0,0,0,0,0,0];
 const w3=tr(D)*.4+tr(H)*.35+tr(C)*.25;Lg[0]=Math.max(0,w3);Sh[0]=Math.max(0,-w3);
 Lg[1]=.4*(bos===1)+.3*nz(1)+.3*(pos<.5);Sh[1]=.4*(bos===-1)+.3*nz(-1)+.3*(pos>=.5);
 const nr=a=>a.some(x=>Math.abs(p-x.p)<.6*A);
 let cL=pos<.4?.2:0,cS=pos>.6?.2:0;
 if(nr(lo))cL+=.5;if(nr(hi))cS+=.5;
 if(lh&&ll&&lh.p>ll.p){const g=lh.p-ll.p,up=lh.i>ll.i,r=up?(lh.p-p)/g:(p-ll.p)/g;if(r>=.5&&r<=.705){if(up)cL+=.5;else cS+=.5}}
 Lg[2]=Math.min(1,cL);Sh[2]=Math.min(1,cS);
 const e20=ema(cl,20)[n-1],e50=ema(cl,50)[n-1],mc=ema(cl,12)[n-1]-ema(cl,26)[n-1],rz=Math.max(-1,Math.min(1,(rsi(cl)-50)/20));
 Lg[3]=((e20>e50?1:0)+Math.max(0,rz)+(mc>0?1:0))/3;Sh[3]=((e20<=e50?1:0)+Math.max(0,-rz)+(mc<=0?1:0))/3;
 let wL=0,wS=0;
 for(let k=2;k<=4;k++){const c=C[n-k],rb=c.h-c.l||1,cp=(c.c-c.l)/rb,r=c.v/vs,dk=k===2?1:k===3?.8:.6;
  if(r>1.3){const q=Math.min(1,(r-1)/1.2)*dk;if(cp>.55&&c.c>c.o)wL=Math.max(wL,q);else if(cp<.45&&c.c<c.o)wS=Math.max(wS,q)}}
 const rl=Math.min(...C.slice(-40,-10).map(x=>x.l)),rh=Math.max(...C.slice(-40,-10).map(x=>x.h)),r10=C.slice(-10);
 if(r10.some(x=>x.l<rl&&x.c>rl))wL+=.5;if(r10.some(x=>x.h>rh&&x.c<rh))wS+=.5;
 Lg[4]=Math.min(1,wL);Sh[4]=Math.min(1,wS);
 let pL=0,pS=0;
 for(let k=2;k<=4;k++){const c=C[n-k],q=C[n-k-1],dk=k===2?1:k===3?.7:.5,rb=c.h-c.l||1,bd=Math.abs(c.c-c.o)||1e-9,lw=Math.min(c.o,c.c)-c.l,uw=c.h-Math.max(c.o,c.c);
  if(lw>2*bd&&lw>.6*rb)pL=Math.max(pL,dk);
  if(uw>2*bd&&uw>.6*rb)pS=Math.max(pS,dk);
  if(c.c>c.o&&q.c<q.o&&c.c>q.o&&c.o<q.c)pL=Math.max(pL,.9*dk);
  if(c.c<c.o&&q.c>q.o&&c.c<q.o&&c.o>q.c)pS=Math.max(pS,.9*dk);
  if(bd>A&&(c.c-c.l)/rb>.75&&c.c>c.o)pL=Math.max(pL,.5*dk);
  if(bd>A&&(c.h-c.c)/rb>.75&&c.c<c.o)pS=Math.max(pS,.5*dk);}
 Lg[5]=pL;Sh[5]=pS;
 const sL=Lg.reduce((a,x,i)=>a+W[i]*x,0),sS=Sh.reduce((a,x,i)=>a+W[i]*x,0),dir=sL>sS?1:sS>sL?-1:0,Z=dir>0?Lg:Sh;
 const pts=Z.map((x,i)=>dir?W[i]*x:0);
 return{dir,pts,total:Math.round(pts.reduce((a,b)=>a+b,0)),blocked:A<.5*A50||A>2.5*A50,p,sl:p-dir*1.5*A,tp:p+dir*3*A};
}

let bs=SY[0],bn=3000,sel=70,eng='o',DATA=null;
const T={
ar:{tab:'المختبر',h:'اختبار رجعي (Backtest)',fee:'رسوم + انزلاق % لكل جهة',run:'ابدأ الاختبار',ld:'جاري جلب البيانات...',cl:'جاري الحساب',er:'تعذر جلب البيانات من Binance',
 c:['الدرجة ≥','صفقات','ربح %','متوسط R','عامل الربح','أقصى هبوط'],e:'المحرك',o:'القديم (الحالي)',nw:'الجديد',cmp:'مقارنة المحركين عند الدرجة',all:'الفترة كاملة',h1:'النصف الأول',h2:'النصف الثاني',sch:'متوسط نقاط كل مدرسة (رابحة / خاسرة)',
 n:['الأطر D1/H1/M5','ICT/SMC','كلاسيكي','مؤشرات','Wyckoff/VSA','برايس أكشن'],none:'لا صفقات عند هذه الدرجة',ndays:'الفترة',days:'يوم',eq:'منحنى الأرباح (R)',
 nt:'اختبار تاريخي وليس ضماناً. R = وحدة المخاطرة (الوقف = 1R والهدف = 2R). إذا لمست الشمعة الوقف والهدف معاً نحسبها خسارة. الأهم متوسط R وعامل الربح، وليس نسبة الربح وحدها. لا تعدّل الأوزان على نفس الفترة اللي تختبر عليها.'},
en:{tab:'Lab',h:'Backtest',fee:'Fees + slippage % per side',run:'Run backtest',ld:'Fetching data...',cl:'Computing',er:'Could not load Binance data',
 c:['Score ≥','Trades','Win %','Avg R','Profit F.','Max DD'],e:'Engine',o:'Old (live)',nw:'New',cmp:'Engine comparison at score',all:'Full period',h1:'First half',h2:'Second half',sch:'Avg points per school (winners / losers)',
 n:['MTF D1/H1/M5','ICT/SMC','Classical','Indicators','Wyckoff/VSA','Price action'],none:'No trades at this score',ndays:'Period',days:'days',eq:'Equity curve (R)',
 nt:'Historical test, not a guarantee. R = risk unit (stop = 1R, target = 2R). If one candle touches both stop and target we count a loss. Avg R and profit factor matter more than win rate alone. Do not tune weights on the same period you test on.'}};
const kl=(s,i,e)=>fetch('https://api.binance.com/api/v3/klines?symbol='+s+'&interval='+i+'&limit=1000'+(e?'&endTime='+e:'')).then(r=>{if(!r.ok)throw 0;return r.json()}).then(a=>a.map(k=>({t:k[0],o:+k[1],h:+k[2],l:+k[3],c:+k[4],v:+k[5]})));
const pull=async(s,i,pages)=>{let out=[],e;for(let p=0;p<pages;p++){const a=await kl(s,i,e);if(!a.length)break;out=a.concat(out);e=a[0].t-1;if(a.length<1000)break}return out};

function sim(th,m,ev,fee,from,to){
 const out=[];let i=from;
 while(i<to){const r=ev[i];
  if(!r||r.bk||!r.d||r.tot<th){i++;continue}
  const risk=Math.abs(r.p-r.sl),cost=2*fee/100*r.p/risk;let res=null,j=i+1;
  for(;j<Math.min(m.length,i+289);j++){const c=m[j],hs=r.d>0?c.l<=r.sl:c.h>=r.sl,ht=r.d>0?c.h>=r.tp:c.l<=r.tp;
   if(hs){res=-1;break}if(ht){res=Math.abs(r.tp-r.p)/risk;break}}
  if(res===null){const c=m[Math.min(j,m.length-1)];res=(r.d>0?c.c-r.p:r.p-c.c)/risk}
  out.push({r:res-cost,pts:r.pts});i=j+1}
 return out}
function stats(a){const n=a.length;if(!n)return{n:0};let g=0,l=0,c=0,pk=0,dd=0;
 a.forEach(x=>{if(x.r>0)g+=x.r;else l-=x.r;c+=x.r;pk=Math.max(pk,c);dd=Math.max(dd,pk-c)});
 return{n,wr:a.filter(x=>x.r>0).length/n*100,ex:c/n,pf:l?g/l:(g?99:0),dd}}

const st=document.createElement('style');
st.textContent='.lr{display:grid;grid-template-columns:52px repeat(5,1fr);gap:4px;font-size:12px;padding:7px 0;border-bottom:1px solid var(--line);direction:ltr;text-align:center;cursor:pointer}.lr b{text-align:start;font-weight:600}.lh{color:var(--mu);cursor:default}.lr.on{background:rgba(0,240,255,.08);color:var(--cy)}.lr.d{cursor:default}';
document.head.appendChild(st);

const sec=document.createElement('section');sec.className='tab';sec.id='lab';
sec.innerHTML='<div class="card"><h3 id="bh"></h3><div class="seg" id="ba">'+SY.map(s=>'<button data-a="'+s+'">'+s.replace('USDT','')+'</button>').join('')+'</div><div class="seg" id="bnn" style="margin-top:8px">'+NN.map(n=>'<button data-n="'+n+'"></button>').join('')+'</div><p class="mu" id="bel" style="margin:12px 0 6px"></p><div class="seg" id="be"><button data-e="o"></button><button data-e="n"></button></div><label class="f" style="margin:12px 0 0"><span id="bfl"></span><input id="bf" type="number" inputmode="decimal" value="0.1"></label><button class="bt" id="brun" style="width:100%;margin-top:12px;padding:12px"></button><p class="mu" id="bst" style="margin:8px 0 0"></p></div><div id="bres"></div>';
document.querySelector('main').insertBefore(sec,document.querySelector('.foot'));
const nb=document.createElement('button');nb.dataset.t='lab';nb.innerHTML='<b>⚗</b><span></span>';
document.querySelector('nav').appendChild(nb);
nb.onclick=()=>{$$('nav button').forEach(x=>x.classList.toggle('on',x===nb));$$('.tab').forEach(x=>x.classList.toggle('on',x.id==='lab'));$('#ttl').textContent=T[lang].tab;render()};

function txt(){const t=T[lang];$('#bh').textContent=t.h;$('#bfl').textContent=t.fee;$('#brun').textContent=t.run;$('#bel').textContent=t.e;nb.querySelector('span').textContent=t.tab;
 $$('#bnn button').forEach(b=>b.textContent=Math.round(b.dataset.n*5/1440)+' '+t.days);
 $$('#be button').forEach(b=>{b.textContent=b.dataset.e==='o'?t.o:t.nw;b.classList.toggle('on',b.dataset.e===eng)});
 if(nb.classList.contains('on'))$('#ttl').textContent=t.tab;
 $$('#ba button').forEach(b=>b.classList.toggle('on',b.dataset.a===bs));$$('#bnn button').forEach(b=>b.classList.toggle('on',+b.dataset.n===bn))}

function render(){
 if(!DATA)return;const t=T[lang],{m,ev,fee}=DATA,n=m.length,mid=Math.floor((120+n)/2),E=ev[eng];
 const S=(th,a,b,e)=>sim(th,m,e||E,fee,a,b);
 const cells=s=>s.n?[s.n,s.wr.toFixed(0)+'%',s.ex.toFixed(2),s.pf.toFixed(2),s.dd.toFixed(1)]:['0','–','–','–','–'];
 const rw=(lab,s,cls,at,sty)=>'<div class="lr '+cls+'" '+at+(sty?' style="'+sty+'"':'')+'><b>'+lab+'</b>'+cells(s).map(x=>'<span>'+x+'</span>').join('')+'</div>';
 const hd=(sty,lab)=>'<div class="lr lh d"'+(sty?' style="'+sty+'"':'')+'><b>'+(lab||t.c[0])+'</b>'+t.c.slice(1).map(x=>'<span>'+x+'</span>').join('')+'</div>';
 const days=Math.round((m[n-1].t-m[0].t)/864e5),big='grid-template-columns:96px repeat(5,1fr)';
 const all=S(sel,120,n),w=all.filter(x=>x.r>0),l=all.filter(x=>x.r<=0);
 let h='<div class="card"><h3>'+t.cmp+' ≥'+sel+'</h3>'+hd(big,'')+rw(t.o,stats(S(sel,120,n,ev.o)),'d','',big)+rw(t.nw,stats(S(sel,120,n,ev.n)),'d','',big)+'</div>';
 h+='<div class="card"><p class="mu" style="margin:0 0 6px">'+t.ndays+': '+days+' '+t.days+' · '+(eng==='o'?t.o:t.nw)+'</p>'+hd()+TH.map(th=>rw('≥'+th,stats(S(th,120,n)),th===sel?'on':'','data-th="'+th+'"')).join('')+'</div>';
 h+='<div class="card"><h3>≥'+sel+'</h3>'+hd(big)+rw(t.all,stats(all),'d','',big)+rw(t.h1,stats(S(sel,120,mid)),'d','',big)+rw(t.h2,stats(S(sel,mid,n)),'d','',big)+'</div>';
 if(all.length){
  h+='<div class="card"><h3>'+t.eq+'</h3><canvas id="lq" style="width:100%;height:120px;display:block"></canvas></div>';
  h+='<div class="card"><h3>'+t.sch+'</h3>'+t.n.map((nm,i)=>'<div class="cp"><span>'+nm+'</span><strong>'+avg(w.map(x=>x.pts[i])).toFixed(1)+' / '+avg(l.map(x=>x.pts[i])).toFixed(1)+'</strong></div>').join('')+'</div>';
 }else h+='<div class="card"><p class="mu">'+t.none+'</p></div>';
 h+='<p class="mu" style="font-size:12px">'+t.nt+'</p>';
 $('#bres').innerHTML=h;
 const cv=$('#lq');if(cv){const Wd=cv.clientWidth,Hh=120,d=devicePixelRatio||1;cv.width=Wd*d;cv.height=Hh*d;const g=cv.getContext('2d');g.scale(d,d);
  let c=0;const v=[0,...all.map(x=>c+=x.r)],mx=Math.max(...v),mn=Math.min(...v),X=i=>i/(v.length-1)*Wd,Y=q=>Hh-4-(q-mn)/((mx-mn)||1)*(Hh-8);
  g.strokeStyle='#1e2636';g.beginPath();g.moveTo(0,Y(0));g.lineTo(Wd,Y(0));g.stroke();
  g.strokeStyle='#00F0FF';g.lineWidth=2;g.beginPath();v.forEach((q,i)=>i?g.lineTo(X(i),Y(q)):g.moveTo(X(i),Y(q)));g.stroke()}
}

async function run(){
 const t=T[lang],s=$('#bst'),btn=$('#brun');
 const fee=+$('#bf').value||0;s.textContent=t.ld;btn.disabled=true;
 let m,h,d;
 try{[m,h,d]=await Promise.all([pull(bs,'5m',bn/1000),pull(bs,'1h',1),pull(bs,'1d',1)])}catch(e){s.textContent=t.er;btn.disabled=false;return}
 const evO=new Array(m.length).fill(null),evN=new Array(m.length).fill(null);let hi=0,di=0,i=120;
 const mk=r=>({d:r.dir,tot:r.total,pts:r.pts,sl:r.sl,tp:r.tp,p:r.p,bk:r.blocked});
 const step=()=>{const end=Math.min(m.length,i+80);
  for(;i<end;i++){const tt=m[i].t;
   while(hi<h.length&&h[hi].t+36e5<=tt)hi++;
   while(di<d.length&&d[di].t+864e5<=tt)di++;
   if(hi<50||di<50)continue;
   try{const c=m.slice(i-119,i+1),hh=h.slice(Math.max(0,hi-100),hi),dd=d.slice(Math.max(0,di-100),di);
    evO[i]=mk(oldA(c,hh,dd));evN[i]=mk(newA(c,hh,dd))}catch(e){}}
  s.textContent=T[lang].cl+' '+Math.round(i/m.length*100)+'%';
  if(i<m.length)setTimeout(step,0);else{DATA={m,ev:{o:evO,n:evN},fee};s.textContent='';btn.disabled=false;render()}};
 step()}

sec.addEventListener('click',e=>{const b=e.target.closest('button,[data-th]');if(!b)return;
 if(b.dataset.a){bs=b.dataset.a;txt()}else if(b.dataset.n){bn=+b.dataset.n;txt()}
 else if(b.dataset.e){eng=b.dataset.e;txt();render()}
 else if(b.dataset.th){sel=+b.dataset.th;render()}else if(b.id==='brun')run()});
$('#langBtn').addEventListener('click',()=>setTimeout(()=>{txt();render()},0));
txt();
})();
