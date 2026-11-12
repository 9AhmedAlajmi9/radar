(()=>{
const ST=String.fromCharCode(42);
const T={
ar:{ttl:'المساعد الذكي',vo:'الصوت',on:'مفعّل',off:'مغلق',ml:'اسم النموذج',ph:'اسأل عن الإشارة أو أي شيء...',snd:'إرسال',clr:'مسح',nokey:'أضف مفتاح الذكاء الاصطناعي في تبويب الإعدادات أولاً.',err:'خطأ',th:'جاري التفكير...',
 q:['اشرح الإشارة الحالية','ليش التقييم منخفض؟','أقوى سبب تفشل فيه الإشارة','هل في خطر على صفقاتي؟'],
 hi:'أنا أقرأ الشارت والتقييم والمناطق وصفقاتك الوهمية تلقائياً. اسألني ليش طلعت الإشارة، أو أي سؤال ثاني.',nt:'تحليل تعليمي وليس نصيحة مالية. أسئلتك وبيانات الرادار تُرسل لمزوّد الذكاء الاصطناعي.'},
en:{ttl:'AI Co-Pilot',vo:'Voice',on:'ON',off:'OFF',ml:'Model name',ph:'Ask about the signal or anything...',snd:'Send',clr:'Clear',nokey:'Add your AI key in the Settings tab first.',err:'Error',th:'Thinking...',
 q:['Explain the current signal','Why is the score low?','Strongest reason this signal fails','Any risk to my trades?'],
 hi:'I read the chart, score, zones and your paper trades automatically. Ask me why a signal appeared, or anything else.',nt:'Educational analysis, not financial advice. Your questions and radar data are sent to the AI provider.'}};
const SYS='You are the AI co-pilot inside an educational trading-analysis app called Flawless Radar Terminal. The app analyzes markets and never executes trades; the user places trades manually. Each user message includes LIVE CONTEXT from the app: price, score breakdown, zones, recent candles and paper trades. Use it to explain exactly why the engine shows BUY, SELL or no signal, citing the numbers. Be honest about uncertainty, never promise profit, and briefly remind that this is educational and not financial advice only when you give a trade-related view. You can also answer general, coding and everyday questions normally, and then ignore the context. Reply in the language of the user, Arabic by default, and stay concise, under 180 words unless asked for more.';
let H=[],L=[],eng=get('cp_eng','gemini'),voice=get('cp_v','0')==='1',open=get('cp_o','1')==='1',busy=false;
const mdl=()=>get('cp_m_'+eng,eng==='gemini'?'gemini-2.5-flash':'gpt-4o');
const clean=s=>String(s).split(ST).join('').split('#').join('');
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const fm=s=>esc(clean(s)).replace(/\n/g,'<br>');

function ctx(){
 const d=window.RD&&window.RD.get();if(!d||!d.R)return 'No radar data available right now.';
 const R=d.R,sym=d.sym,C=d.C,f=x=>x>100?x.toFixed(2):x.toFixed(4);
 const nm=['MTF D1/H1/M5','ICT/SMC','Classical','Indicators','Wyckoff/VSA','Price action'],W=[20,25,15,15,15,10];
 const z=a=>a.slice(-3).map(x=>(x.d>0?'bullish ':'bearish ')+f(x.lo)+'-'+f(x.hi)).join('; ')||'none';
 const cs=C.slice(-12).map(x=>[x.o,x.h,x.l,x.c].map(f).join('/')).join(' | ');
 let pos='none';try{const P=JSON.parse(get('pt','null'));if(P&&P.pos&&P.pos.length)pos=P.pos.map(x=>(x.d>0?'BUY ':'SELL ')+x.s+' at '+f(x.e)+' SL '+f(x.sl)+' TP '+f(x.tp)).join('; ')}catch(e){}
 return ['Symbol: '+sym+' (M5, live)','Price: '+f(R.p),
  'Score: '+R.total+'/100, direction: '+(R.dir>0?'BUY':R.dir<0?'SELL':'none')+', state: '+(R.st||'-')+(R.blocked?' (blocked by the volatility filter)':''),
  'School points: '+R.pts.map((q,i)=>nm[i]+' '+q.toFixed(0)+'/'+W[i]).join(', '),
  'Active FVG zones: '+z(R.fvg),'Active order blocks: '+z(R.ob),
  'Structure: '+(R.bos>0?'BOS up at '+f(R.bl.p):R.bos<0?'BOS down at '+f(R.bl.p):'no break'),
  'Engine levels if traded: entry '+f(R.p)+', stop '+f(R.sl)+', target '+f(R.tp),
  'Last 12 candles O/H/L/C: '+cs,'Open paper trades: '+pos].join('\n');
}

async function call(msgs){
 const key=get(eng==='gemini'?'k_gemini':'k_openai','').trim();
 if(!key)throw new Error(T[lang].nokey);
 const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),45000);
 try{
  let r,j;
  if(eng==='gemini'){
   r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(mdl())+':generateContent',{method:'POST',signal:ac.signal,headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({systemInstruction:{parts:[{text:SYS}]},contents:msgs.map(m=>({role:m.r==='u'?'user':'model',parts:[{text:m.t}]}))})});
   j=await r.json();
   if(!r.ok)throw new Error((j.error&&j.error.message)||('HTTP '+r.status));
   const p=j.candidates&&j.candidates[0]&&j.candidates[0].content&&j.candidates[0].content.parts;
   return p?p.map(x=>x.text||'').join(''):'(empty)';
  }
  r=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',signal:ac.signal,headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},body:JSON.stringify({model:mdl(),messages:[{role:'system',content:SYS}].concat(msgs.map(m=>({role:m.r==='u'?'user':'assistant',content:m.t})))})});
  j=await r.json();
  if(!r.ok)throw new Error((j.error&&j.error.message)||('HTTP '+r.status));
  return j.choices[0].message.content||'(empty)';
 }catch(e){if(e.name==='AbortError')throw new Error('timeout');throw e}
 finally{clearTimeout(tm)}
}

function speak(s){
 if(!voice||!window.speechSynthesis)return;
 speechSynthesis.cancel();
 const u=new SpeechSynthesisUtterance(clean(s).replace(/\s+/g,' ').slice(0,1500));
 u.lang=lang==='ar'?'ar-SA':'en-US';speechSynthesis.speak(u);
}

const st=document.createElement('style');
st.textContent='.cm{padding:8px 12px;border-radius:12px;margin:6px 0;font-size:14px;line-height:1.6;max-width:92%;word-wrap:break-word}.cu{background:rgba(0,240,255,.12);margin-inline-start:auto}.ca{background:var(--card);border:1px solid var(--line)}.ce{border:1px solid var(--rd);color:var(--rd)}.ci{color:var(--mu);font-size:13px}.cq{padding:6px 12px;font-size:12px}';
document.head.appendChild(st);

const box=document.createElement('div');box.className='card';box.id='cpbox';
box.innerHTML='<div class="row" id="cph" style="cursor:pointer"><h3 style="margin:0" id="cpt"></h3><span id="cpa" class="mu"></span></div>'+
 '<div id="cpb"><div class="seg" id="cpe" style="margin:10px 0"><button data-e="gemini">Gemini</button><button data-e="openai">OpenAI GPT</button></div>'+
 '<div class="row" style="gap:10px;margin-bottom:10px;align-items:flex-end"><label class="f" style="flex:1;margin:0"><span id="cpml"></span><input id="cpm" type="text"></label><button class="bt" id="cpv"></button></div>'+
 '<div id="cpl" style="max-height:340px;overflow-y:auto;background:var(--bg);border:1px solid var(--line);border-radius:12px;padding:10px"></div>'+
 '<div id="cpq" style="display:flex;flex-wrap:wrap;gap:6px;margin:10px 0"></div>'+
 '<div class="row" style="gap:8px"><input id="cpi" type="text" style="flex:1;padding:10px;background:var(--bg);border:1px solid var(--line);border-radius:8px;color:inherit"><button class="bt" id="cps"></button></div>'+
 '<div class="row" style="margin-top:8px"><span class="mu" id="cpn" style="font-size:11px"></span><button class="bt cq" id="cpc"></button></div></div>';
const pp=$('#paper');
const mount=()=>{if(box.parentNode!==pp)pp.appendChild(box)};
mount();new MutationObserver(mount).observe(pp,{childList:true});

function render(){
 const t=T[lang];
 $('#cpt').textContent=t.ttl;$('#cpa').textContent=open?'▾':'▸';$('#cpb').style.display=open?'block':'none';
 $$('#cpe button').forEach(b=>b.classList.toggle('on',b.dataset.e===eng));
 $('#cpml').textContent=t.ml;if(document.activeElement!==$('#cpm'))$('#cpm').value=mdl();
 $('#cpv').textContent=t.vo+': '+(voice?t.on:t.off);$('#cpv').style.borderColor=voice?'var(--gr)':'var(--cy)';$('#cpv').style.color=voice?'var(--gr)':'var(--cy)';
 $('#cpi').placeholder=t.ph;$('#cps').textContent=t.snd;$('#cpc').textContent=t.clr;$('#cpn').textContent=t.nt;
 $('#cpq').innerHTML=t.q.map((q,i)=>'<button class="bt cq" data-q="'+i+'">'+q+'</button>').join('');
 const l=$('#cpl');
 l.innerHTML='<div class="cm ci">'+t.hi+'</div>'+L.map(m=>'<div class="cm '+(m.r==='u'?'cu':m.r==='e'?'ce':m.r==='p'?'ci':'ca')+'">'+fm(m.t)+'</div>').join('');
 l.scrollTop=l.scrollHeight;
}

async function send(q){
 q=(q||'').trim();if(!q||busy)return;
 busy=true;$('#cpi').value='';
 L.push({r:'u',t:q});H.push({r:'u',t:q});L.push({r:'p',t:T[lang].th});render();
 try{
  const msgs=H.slice(-9).map(m=>({r:m.r,t:m.t}));
  msgs[msgs.length-1].t='LIVE CONTEXT:\n'+ctx()+'\n\nUSER QUESTION: '+q;
  const a=await call(msgs);
  L.pop();L.push({r:'a',t:a});H.push({r:'a',t:a});
  if(H.length>20){H.splice(0,2)}
  speak(a);
 }catch(e){L.pop();L.pop();H.pop();L.push({r:'e',t:T[lang].err+': '+(e.message||e)});$('#cpi').value=q}
 busy=false;render();
}

box.addEventListener('click',e=>{
 if(e.target.closest('#cph')){open=!open;set('cp_o',open?'1':'0');render();return}
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.e){eng=b.dataset.e;set('cp_eng',eng);render()}
 else if(b.dataset.q!==undefined)send(T[lang].q[+b.dataset.q]);
 else if(b.id==='cps')send($('#cpi').value);
 else if(b.id==='cpv'){voice=!voice;set('cp_v',voice?'1':'0');if(!voice&&window.speechSynthesis)speechSynthesis.cancel();render()}
 else if(b.id==='cpc'){L=[];H=[];if(window.speechSynthesis)speechSynthesis.cancel();render()}
});
box.addEventListener('input',e=>{if(e.target.id==='cpm')set('cp_m_'+eng,e.target.value.trim())});
box.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='cpi'){e.preventDefault();send(e.target.value)}});
$('#langBtn').addEventListener('click',()=>setTimeout(render,0));
render();
})();
