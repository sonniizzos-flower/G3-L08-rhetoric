'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const CN=['一','二','三','四','五'];
const FAST=+(new URLSearchParams(location.search).get('fast')||1);   // 測試用
const S={idx:0,mode:'auto',paused:false,started:false,voiceOn:true,rate:0.8,voice:null,token:0,answers:{},rec:false,endDone:false,scale:1,think:10000,lastAct:Date.now()};
const store={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

/* ================= 教材資料（文字皆取自教材） ================= */
const UNITS=[
 {name:'設問',color:'#D9480F',icon:'？',
  simple:'不直接說，故意用「問句」來問，讓大家注意。',
  say:'設問，就是不直接說，故意用問句來問，讓大家注意。',
  book:'不採用「敘述句」，故意改用「問句」來引起讀者注意的修辭法。設問包括：疑問，表示心中真有疑問；激問，表示答案在問題反面，也就是明知故問；提問，表示問題之後，附有答案，也就是自問自答。',
  sent:{lines:['你的殼呢？'],fs:230,lh:1.3,cues:[{l:0,s:3,n:2,cls:'a'}]},
  cueSteps:[{cue:[0],say:'看這裡，句子最後有問號。這是問句，不是敘述句。',pill:'用「問句」來問'}],
  options:['頂真','設問','感嘆'],
  reason:'用問句來問，心中真的有疑問，這是設問裡的「疑問」。',
  book2:'這裡用的是設問法裡的疑問，表示心中真有疑惑。'},
 {name:'頂真',color:'#1971C2',icon:'🔗',
  simple:'上一句的結尾，變成下一句的開頭，像接力一樣。',
  say:'頂真，就是上一句的結尾，變成下一句的開頭，像接力一樣。',
  book:'用上一句的結尾，作為下一句的起頭，使鄰接的句子頭尾蟬聯，有上遞下接的趣味。',
  sent:{lines:['小螃蟹正要去找寄居蟹，','寄居蟹就慌張的跑過來了。'],fs:120,lh:1.75,cues:[{l:0,s:7,n:3,cls:'a'},{l:1,s:0,n:3,cls:'b'}]},
  cueSteps:[{cue:[0],say:'第一句的結尾，是「寄居蟹」。',pill:'上一句的結尾'},
            {cue:[1],say:'下一句的開頭，也是「寄居蟹」。像接力棒一樣傳下去。',pill:'變成下一句的開頭',arrow:true}],
  options:['頂真','類疊','鑲嵌'],
  reason:'前一句的結尾「寄居蟹」，變成下一句的開頭。',
  book2:'用前一句的結尾「寄居蟹」來作為下一句的起頭。'},
 {name:'類疊',color:'#2F9E44',icon:'🔁',
  simple:'同一個字或詞，接二連三一直重複說。',
  say:'類疊，就是同一個字或詞，接二連三，一直重複說。',
  book:'同一個字詞語句，接二連三反覆使用的修辭法。可以強調語意，可以貫串文意，也可以使語言富有節奏感。可分為疊字、疊句、類字、類句四種。',
  sent:{lines:['拜託！拜託！'],fs:220,lh:1.3,cues:[{l:0,s:0,n:2,cls:'a',badge:'1'},{l:0,s:3,n:2,cls:'b',badge:'2'}]},
  cueSteps:[{cue:[0],say:'第一次，說「拜託」。',pill:'第 1 次：拜託'},
            {cue:[1],say:'第二次，又說「拜託」。相同的詞一直重複，讓意思更強。',pill:'相同的詞，重複說'}],
  options:['頂真','鑲嵌','類疊'],
  reason:'「拜託」連續說了兩次，讓意思更強。',
  book2:'重複運用相同的字詞語句，有更強調文意的作用。'},
 {name:'鑲嵌',color:'#AE3EC9',icon:'🧩',
  simple:'在詞語中間，故意放進別的字，把詞語拉長。',
  say:'鑲嵌，就是在詞語中間，故意放進別的字，把詞語拉長。',
  book:'在語詞中，故意插入數目字、虛字、特定字、同義或異義字來拉長文句，就是鑲嵌修辭。',
  sent:{lines:['東翻西找'],fs:270,lh:1.3,cues:[{l:0,s:1,n:1,cls:'b'},{l:0,s:3,n:1,cls:'b'},{l:0,s:0,n:1,cls:'a'},{l:0,s:2,n:1,cls:'a'}]},
  cueSteps:[{cue:[0,1],say:'原本的詞語，是「翻找」。',pill:'原本的詞：翻找'},
            {cue:[2,3],say:'中間故意放進「東」和「西」，把詞語拉長。',pill:'插入「東」「西」'}],
  options:['類疊','鑲嵌','設問'],
  reason:'在「翻找」中間，插入「東」和「西」，把詞語拉長。',
  book2:'在「翻找」中插入「東西」兩字，可強化「翻找」的忙碌程度，讓平順的句子有了變化，讀起來更有趣味。'},
 {name:'感嘆',color:'#C2255C',icon:'！',
  simple:'遇到高興、生氣、難過的事，用呼聲說出心情。',
  say:'感嘆，就是遇到高興、生氣、難過的事，用呼聲說出心情。',
  book:'當人遇到喜、怒、哀、樂之事，常會以呼聲來表達情感。這種以呼聲表露情感的修辭法，叫做感嘆。',
  sent:{lines:['啊！瓶蓋會動！'],fs:200,lh:1.3,cues:[{l:0,s:0,n:2,cls:'a'}]},
  cueSteps:[{cue:[0],say:'看這裡，「啊」是遇到事情時發出的呼聲。用呼聲說出心情，就是感嘆。',pill:'用「呼聲」說出心情'}],
  options:['設問','類疊','感嘆'],
  reason:'「啊！」是遇到事情的呼聲，直接說出心情。',
  book2:'用感嘆句來表達人物的情緒，讀者的感受更直接、深刻。'}
];
// 綜合練習：句子皆取自教材「練習」或「解析」
const PRAC=[
 {name:'類疊',sent:{lines:['書信可以傳情，可以達意，','可以抒懷，可以解悶。'],fs:110,lh:1.35,cues:[{l:0,s:2,n:2,cls:'a'},{l:0,s:7,n:2,cls:'a'},{l:1,s:0,n:2,cls:'a'},{l:1,s:5,n:2,cls:'a'}]},
  options:['頂真','鑲嵌','類疊'],reason:'「可以」重複說了好幾次，這是類疊。'},
 {name:'感嘆',sent:{lines:['哎唷！是哪個缺德的人','把磚塊堆在馬路上？'],fs:120,lh:1.35,cues:[{l:0,s:0,n:3,cls:'a'}]},
  options:['感嘆','頂真','類疊'],reason:'「哎唷！」是遇到事情發出的呼聲，用來說出心情，這是感嘆。'},
 {name:'設問',sent:{lines:['小螃蟹，','你怎麼變成這樣？'],fs:150,lh:1.35,cues:[{l:1,s:1,n:2,cls:'a'},{l:1,s:7,n:1,cls:'a'}]},
  options:['頂真','設問','鑲嵌'],reason:'用問句來問，心中真的有疑問，這是設問裡的「疑問」。',
  book2:'這裡用的是設問法裡的疑問，表示心中真有疑惑。'},
 {name:'鑲嵌',sent:{lines:['他經過千山萬水，','終於回到日夜思念的故鄉。'],fs:110,lh:1.35,cues:[{l:0,s:3,n:1,cls:'a'},{l:0,s:5,n:1,cls:'a'},{l:0,s:4,n:1,cls:'b'},{l:0,s:6,n:1,cls:'b'}]},
  options:['鑲嵌','設問','感嘆'],reason:'在「山水」中間，插入數目字「千」和「萬」，這是鑲嵌。'},
 {name:'頂真',sent:{lines:['菠菜含有維生素Ｋ，','含有維生素Ｋ的還有雞肉和豬排。'],fs:100,lh:1.35,cues:[{l:0,s:2,n:6,cls:'a'},{l:1,s:0,n:6,cls:'b'}]},
  options:['類疊','設問','頂真'],reason:'前一句結尾的「含有維生素Ｋ」，變成下一句的開頭，這是頂真。'}
];
UNITS.forEach((u,i)=>{u.qid='u'+i});
PRAC.forEach((p,i)=>{p.qid='p'+i});
const unitColor=n=>(UNITS.find(u=>u.name===n)||{}).color||'#123B5E';

/* ================= 句子 HTML ================= */
function sentHTML(s,o={}){
  const fs=o.fs||s.fs, lh=o.lh||s.lh||1.3;
  let h=`<div class="sent${o.hid?' hid':''}${o.allon?' allon':''}" style="--fs:${fs}px;--lh:${lh};--cd:${(0.36*0.8/S.rate).toFixed(3)}s">`;
  s.lines.forEach((ln,l)=>{
    h+=`<div class="ln" data-l="${l}">`;
    [...ln].forEach((ch,i)=>{
      const k=s.cues.findIndex(c=>c.l===l&&i>=c.s&&i<c.s+c.n);
      h+=`<span class="c${k>=0?' q q'+k+' '+s.cues[k].cls:''}" data-i="${i}" style="--i:${i}">${ch}</span>`;
    });
    h+='</div>';
  });
  return h+'</div>';
}
const show=sel=>$$(sel).forEach(e=>e.classList.add('show'));

/* ================= 投影片 ================= */
const slides=[];
slides.push({type:'title',tag:'',html:()=>`<div class="slide title ${S.started?'':'static'}">
  <div class="t1 pre">第八課</div><div class="t2 pre">修辭總複習</div>
  <div class="five">${UNITS.map((u,i)=>`<button class="fcard pre" style="--c:${u.color}" onclick="jumpUnit(${i})"><b>${i+1}</b>${u.name}</button>`).join('')}</div>
  <div class="startbtns"><button class="big" onclick="start('auto')">▶ 自動播放</button><button class="big alt" onclick="start('inter')">☝ 互動教學</button></div></div>`,
  idle:'按下「開始」，跟小寄一起複習修辭！',
  steps:()=>[
   {say:'哈囉，我是寄居蟹小寄。今天，我們要一起複習第八課的修辭。',do:()=>show('.t1,.t2'),min:3200},
   {say:'一共有五種修辭：設問、頂真、類疊、鑲嵌、感嘆。',do:()=>$$('.fcard').forEach((c,i)=>{c.style.animationDelay=(i*.6)+'s';c.classList.add('show')}),min:5200,hold:800}]});

UNITS.forEach((u,ui)=>{
  const tag=`單元 ${ui+1}　${u.name}`;
  slides.push({type:'explain',unit:ui,tag,
    html:()=>`<div class="slide"><div class="nameRow pre"><div class="icon" style="background:${u.color}">${u.icon}</div><div class="bigname" style="color:${u.color}">${u.name}</div></div>
      <div class="card expl pre" style="padding:22px 70px 26px">${u.simple}</div>
      <button class="bookbtn" onclick="showBook(${ui})">📖 教材原文</button></div>`,
    steps:()=>[
      {say:`第${CN[ui]}個修辭，${u.name}。`,text:`第${CN[ui]}個修辭：${u.name}`,do:()=>show('.nameRow'),min:2200},
      {say:u.say,text:u.simple,do:()=>show('.expl'),min:3000,hold:1500}]});
  slides.push({type:'sent',unit:ui,tag,
    html:()=>`<div class="slide"><div class="label pre">課文原句</div><div class="card pre">${sentHTML(u.sent,{hid:true})}</div>
      <button class="readbtn" onclick="readAloud(${ui})">🔊 再聽一次</button></div>`,
    steps:()=>{
      const st=[{say:'請看課文裡的句子，跟著小寄一起讀。',text:'課文裡的句子，一起讀一讀',do:()=>show('.label,.card'),min:2200}];
      u.sent.lines.forEach((ln,l)=>st.push({say:ln,text:ln,do:()=>$$('.ln')[l].classList.add('rv'),min:[...ln].length*360*0.8/S.rate+600,hold:700}));
      st[st.length-1].hold=1800; return st;}});
  slides.push({type:'cue',unit:ui,tag,
    html:()=>`<div class="slide"><div class="card" id="card">${sentHTML(u.sent,{})}</div><div class="pill" id="pill" style="--pc:${u.color}"></div></div>`,
    steps:()=>u.cueSteps.map((cs,k)=>({say:cs.say,text:cs.say,min:3200,hold:1400,do:()=>{
        $('.sent').classList.add('focus');
        cs.cue.forEach(ci=>$$('.q'+ci).forEach(e=>e.classList.add('on')));
        const p=$('#pill'); p.classList.remove('show'); void p.offsetWidth; p.textContent=cs.pill; p.classList.add('show');
        cs.cue.forEach(ci=>{ if(u.sent.cues[ci].badge) addBadge(ci,u.sent.cues[ci]); });
        if(cs.arrow) setTimeout(()=>addArrow(u.sent),900);
      }}))});
  slides.push(quizSlide(u,`單元 ${ui+1}　選一選`));
  slides.push(answerSlide(u,tag));
});

slides.push({type:'pintro',tag:'綜合練習',
  html:()=>`<div class="slide"><div class="t2 pre">綜合練習</div><div class="five">${UNITS.map(u=>`<div class="fcard pre" style="--c:${u.color};cursor:default;width:260px;height:140px;font-size:70px">${u.name}</div>`).join('')}</div></div>`,
  steps:()=>[{say:'現在是綜合練習。每一題，都要看句子，選出正確的修辭。',text:'看句子，選出正確的修辭',do:()=>{$$('.pre').forEach((c,i)=>{c.style.animationDelay=(i*.35)+'s';c.classList.add('show')})},min:4500,hold:800}]});
PRAC.forEach((p,k)=>{
  slides.push(quizSlide(p,`綜合練習　第 ${k+1} 題`));
  slides.push(answerSlide(p,`綜合練習　第 ${k+1} 題`));
});
function scoreInfo(){let a=0,c=0;[...UNITS,...PRAC].forEach(q=>{const v=S.answers[q.qid];if(v!==undefined&&v!==null){a++;if(q.options[v]===q.name)c++}});return{a,c}}
slides.push({type:'end',tag:'',
  html:()=>{const {a,c}=scoreInfo();return `<div class="slide"><div class="t2 pre">你真棒！</div><div class="five">${UNITS.map(u=>`<div class="fcard pre" style="--c:${u.color};cursor:default;width:260px;height:140px;font-size:70px">${u.name}</div>`).join('')}</div>
    ${a?`<div class="score pre">你答對了 ${c} 題（共作答 ${a} 題）</div>`:''}</div>`},
  steps:()=>{const {a,c}=scoreInfo();const st=[{say:'太棒了！五種修辭，我們都複習完了。',text:'五種修辭，都複習完了！',do:()=>$$('.pre').forEach((c,i)=>{c.style.animationDelay=(i*.3)+'s';c.classList.add('show')}),min:3800}];
    if(a) st.push({say:`你答對了${c}題，共作答${a}題。`,text:`你答對了 ${c} 題，共作答 ${a} 題`,min:2800});
    st[st.length-1].hold=1500;return st;}});

function quizSlide(q,tag){
  return {type:'quiz',qid:q.qid,q,tag,
    html:()=>`<div class="slide"><div class="card" id="card">${sentHTML(q.sent,{lh:1.3})}</div>
      <div class="opts pre">${q.options.map((o,i)=>`<button class="opt" data-k="${i}"><span class="no">${i+1}</span>${o}</button>`).join('')}</div></div>`,
    steps:()=>[{say:'這一句，用了哪一種修辭？請想一想，點一個答案。',text:'這一句用了哪一種修辭？點一個答案',do:()=>show('.opts'),min:3000}]};
}
function answerSlide(q,tag){
  return {type:'answer',qid:q.qid,q,tag,
    html:()=>{
      const fsA=Math.min(Math.round(q.sent.fs*0.55),112), r=resultOf(q), ac=unitColor(q.name);
      return `<div class="slide">${r?`<div class="result ${r.ok?'':'soft'}">${r.text}</div>`:''}<div class="card small" id="card">${sentHTML(q.sent,{fs:fsA,lh:1.35,allon:true})}</div>
      <div class="anspanel"><div class="ansrow"><div class="ansbadge pre" style="--ac:${ac}"><span class="lab">答案</span><span class="nm">${q.name}</span></div>
      <div class="why pre">${q.reason}</div></div>${q.book2?`<div class="bookline pre">教材解析：${q.book2}</div>`:''}</div></div>`},
    steps:()=>{const r=resultOf(q);
      const st=[{say:(r?r.text.replace('！','，').replace('。','，'):'')+`答案是${q.name}。`,text:(r?r.text+' ':'')+`答案：${q.name}`,do:()=>show('.ansbadge'),min:2400},
                {say:q.reason,text:q.reason,do:()=>show('.why'),min:3400,hold:900}];
      if(q.book2) st.push({do:()=>show('.bookline'),min:3200,hold:900});
      return st;}};
}
function resultOf(q){const v=S.answers[q.qid]; if(v===undefined||v===null) return null;
  return q.options[v]===q.name?{ok:true,text:'答對了，太棒了！'}:{ok:false,text:'沒關係，我們一起來看答案。'};}

/* ================= 裝飾：徽章、箭頭 ================= */
function addBadge(ci,c){
  const card=$('#card'), spans=$$('.q'+ci);
  const first=spans[0], last=spans[spans.length-1];
  const d=document.createElement('div'); d.className='badge'; d.textContent=c.badge;
  d.style.background=c.cls==='a'?'#D9480F':'#1864AB';
  d.style.left=(offsetIn(first,card).x+ (offsetIn(last,card).x+last.offsetWidth-offsetIn(first,card).x)/2 -38)+'px';
  d.style.top=(offsetIn(first,card).y-82)+'px';
  card.appendChild(d);
}
function offsetIn(el,ref){let x=0,y=0,e=el;while(e&&e!==ref){x+=e.offsetLeft;y+=e.offsetTop;e=e.offsetParent;}return{x,y}}
function addArrow(sent){
  const card=$('#card'); const c0=$$('.q0').pop(), c1=$$('.q1')[0];
  const p0=offsetIn(c0,card), p1=offsetIn(c1,card);
  const x1=p0.x+c0.offsetWidth/2, y1=p0.y+c0.offsetHeight+10, x2=p1.x+c1.offsetWidth/2, y2=p1.y-4;
  const ns='http://www.w3.org/2000/svg', svg=document.createElementNS(ns,'svg');
  svg.setAttribute('class','ov'); svg.setAttribute('width',card.offsetWidth); svg.setAttribute('height',card.offsetHeight);
  const path=document.createElementNS(ns,'path');
  path.setAttribute('d',`M${x1} ${y1} C${x1} ${y1+55} ${x2} ${y2-55} ${x2} ${y2-20} M${x2-18} ${y2-26} L${x2} ${y2-4} L${x2+18} ${y2-26}`);
  svg.appendChild(path); card.appendChild(svg);
  const len=path.getTotalLength(); path.style.strokeDasharray=len; path.style.strokeDashoffset=len;
  path.style.animation='draw 1.6s ease forwards';
}
(function(){const st=document.createElement('style');st.textContent='@keyframes draw{to{stroke-dashoffset:0}}';document.head.appendChild(st)})();

/* ================= 計時、語音 ================= */
function sleep(ms,tk){return new Promise(res=>{let left=ms;const t=setInterval(()=>{
  if(tk!==S.token){clearInterval(t);res(false);return}
  if(!S.paused){left-=50*FAST;if(left<=0){clearInterval(t);res(true)}}},50)})}
const estMs=t=>[...t].length*380*0.8/S.rate+1200;
function speak(text,tk){
  return new Promise(res=>{
    if(!text||!S.voiceOn||!('speechSynthesis' in window)){res(true);return}
    let done=false;const fin=()=>{if(!done){done=true;res(true)}};
    const u=new SpeechSynthesisUtterance(text);
    if(S.voice){u.voice=S.voice;u.lang=S.voice.lang}else u.lang='zh-TW';
    u.rate=S.rate;u.pitch=1.05;u.onend=fin;u.onerror=fin;S.utter=u;
    setTimeout(()=>{if(tk===S.token)speechSynthesis.speak(u);else fin()},80);
    sleep(estMs(text)+2500,tk).then(fin);
  });
}
function setBubble(t){ if(t===undefined)return; $('#btext').textContent=t; $('#bubble').classList.toggle('on',!!t) }
function setTalk(on){ $('#crab').classList.toggle('talk',on) }

/* ================= 播放核心 ================= */
function render(sl){
  $('#content').innerHTML=sl.html();
  const chip=$('#chip'); chip.textContent=sl.tag||''; chip.style.display=sl.tag?'':'none';
  closeBook();
  if(sl.type==='quiz'){ if(S.mode==='inter') delete S.answers[sl.qid]; }
  sl.locked=false;
}
async function play(idx){
  idx=Math.max(0,Math.min(slides.length-1,idx));
  const tk=++S.token;
  if('speechSynthesis' in window){speechSynthesis.cancel(); if(!S.paused)speechSynthesis.resume();}
  S.idx=idx;S.endDone=false;
  const sl=slides[idx]; render(sl); setBubble(''); setTalk(false); updateUI();
  setProgress(idx,0);
  if(!S.started){ setBubble(sl.idle||''); return; }
  const steps=sl.steps();
  for(let i=0;i<steps.length;i++){
    if(tk!==S.token)return;
    const st=steps[i];
    if(st.text!==undefined||st.say)setBubble(st.text!==undefined?st.text:st.say);
    st.do&&st.do();
    setTalk(!!st.say);
    const jobs=[sleep(st.min||800,tk)]; if(st.say)jobs.push(speak(st.say,tk));
    await Promise.all(jobs);
    setTalk(false);
    if(tk!==S.token)return;
    await sleep(st.hold!==undefined?st.hold:600,tk);
    if(tk!==S.token)return;
    setProgress(idx,(i+1)/steps.length);
  }
  if(tk!==S.token)return;
  await afterSlide(tk,sl);
}
async function afterSlide(tk,sl){
  if(sl.type==='quiz'){
    if(S.mode==='auto'){
      const w=document.createElement('div');w.className='think';w.innerHTML=`<span>想一想…</span><b><i style="animation-duration:${S.think/1000}s"></i></b>`;
      $('#content .slide').appendChild(w);
      const ok=await sleep(S.think,tk); if(ok&&tk===S.token&&!sl.locked)go(S.idx+1);
    } else setBubble('點一下你的答案，我們再看答案喔！');
    return;
  }
  if(sl.type==='end'){S.endDone=true;if(S.mode==='auto'){S.paused=true;if('speechSynthesis' in window)speechSynthesis.pause();updateUI()}return}
  if(S.mode==='auto'){const ok=await sleep(700,tk);if(ok&&tk===S.token)go(S.idx+1)}
}
function go(i){ if(i<0||i>=slides.length)return; if(!S.started&&i>0) {S.started=true;document.body.classList.add('started')} play(i) }
function next(){
  const sl=slides[S.idx];
  if(S.mode==='inter'&&sl.type==='quiz'&&S.answers[sl.qid]===undefined){toast('先點一個答案，再按下一頁喔');return}
  go(S.idx+1);
}
function start(mode,idx=0){
  S.mode=mode;S.started=true;S.paused=false;document.body.classList.add('started');
  if('speechSynthesis' in window)speechSynthesis.resume();
  document.body.classList.remove('hidectl');go(idx);
}
function jumpUnit(i){const at=slides.findIndex(s=>s.type==='explain'&&s.unit===i);if(!S.started){start(S.mode,at)}else go(at)}
function choose(k){
  const sl=slides[S.idx]; if(sl.type!=='quiz'||sl.locked||!$('.opts.show'))return; if(k>=sl.q.options.length)return;
  sl.locked=true;S.answers[sl.qid]=k;S.token++;
  if('speechSynthesis' in window){speechSynthesis.cancel()}
  $$('.opt').forEach((b,i)=>b.classList.toggle('sel',i===k));$('.opts').classList.add('lock');
  setBubble('你選了「'+sl.q.options[k]+'」，我們來看答案！');setTalk(false);
  const at=S.idx; setTimeout(()=>{if(S.idx===at)go(at+1)},1100);
}
function togglePlay(){
  if(!S.started){start(S.mode);return}
  if(S.endDone&&S.idx===slides.length-1&&S.paused){S.paused=false;document.body.classList.remove('paused');S.endDone=false;go(0);return}
  S.paused=!S.paused; applyPause();
}
function applyPause(){
  $('#stage').classList.toggle('paused',S.paused);
  if('speechSynthesis' in window){S.paused?speechSynthesis.pause():speechSynthesis.resume()}
  updateUI();
}
function setMode(m){S.mode=m;store.set('l8mode',m);updateUI();if(S.started)play(S.idx)}

/* ================= 進度、介面 ================= */
function setProgress(i,f){$('#pbar').style.width=Math.min(100,((i+f)/slides.length*100)).toFixed(2)+'%'}
function updateUI(){
  $('#seek').value=S.idx;$('#pos').textContent=(S.idx+1)+' / '+slides.length;
  $('#bPlay').textContent=(S.started&&!S.paused)?'⏸ 暫停':'▶ 播放';
  $('#bPrev').disabled=S.idx===0;$('#bNext').disabled=S.idx===slides.length-1;
  $('#mAuto').classList.toggle('on',S.mode==='auto');$('#mInter').classList.toggle('on',S.mode==='inter');
  $('#bVoice').textContent='🔊 語音：'+(S.voiceOn?'開':'關');$('#bVoice').classList.toggle('on',S.voiceOn);
  $('#jump').value=String(unitStart(S.idx));
  $('#stage').classList.toggle('paused',S.paused);
}
function unitStart(i){let best=0;jumpIdx.forEach(j=>{if(j<=i)best=j});return best}
let jumpIdx=[];
function buildNav(){
  const sel=$('#jump');const items=[['開始',0]];
  UNITS.forEach((u,ui)=>items.push([`單元${ui+1}　${u.name}`,slides.findIndex(s=>s.type==='explain'&&s.unit===ui)]));
  items.push(['綜合練習',slides.findIndex(s=>s.type==='pintro')]);items.push(['結尾',slides.length-1]);
  jumpIdx=items.map(x=>x[1]);
  sel.innerHTML=items.map(x=>`<option value="${x[1]}">${x[0]}</option>`).join('');
  $('#seek').max=slides.length-1;
  items.slice(1,-1).forEach(x=>{const t=document.createElement('div');t.className='tick';t.style.left=(x[1]/slides.length*100)+'%';$('#progress').appendChild(t)});
}
let toastT;function toast(t){const e=$('#toast');e.textContent=t;e.style.display='block';clearTimeout(toastT);toastT=setTimeout(()=>e.style.display='none',2200)}

/* 教材原文 */
function showBook(ui){const u=UNITS[ui];$('#bookh').textContent='教材原文：'+u.name;$('#bookp').textContent=u.book;$('#bookpanel').classList.add('open')}
function closeBook(){$('#bookpanel').classList.remove('open')}
function readAloud(ui){ if(!('speechSynthesis' in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(UNITS[ui].sent.lines.join(''));if(S.voice){u.voice=S.voice;u.lang=S.voice.lang}else u.lang='zh-TW';u.rate=S.rate;S.utter=u;setTimeout(()=>speechSynthesis.speak(u),80)}

/* ================= 語音清單 ================= */
let zhVoices=[];
function loadVoices(){
  if(!('speechSynthesis' in window)){$('#vnote').textContent='此瀏覽器不支援語音';S.voiceOn=false;updateUI();return}
  const vs=speechSynthesis.getVoices();
  zhVoices=vs.filter(v=>/^zh/i.test(v.lang)||/Chinese|中文|國語|普通话/i.test(v.name));
  const score=v=>{let s=0;const l=v.lang.replace('_','-').toLowerCase();
    if(l==='zh-tw')s+=100;else if(l.startsWith('zh-hk'))s+=50;else if(l.startsWith('zh'))s+=30;
    if(/Natural|Online/i.test(v.name))s+=20;if(/HsiaoChen|HsiaoYu|YunJhe|Hanhan|Zhiwei|Yating|Meijia/i.test(v.name))s+=10;if(/Traditional|台灣|Taiwan/i.test(v.name))s+=15;return s};
  zhVoices.sort((a,b)=>score(b)-score(a));
  const sel=$('#voiceSel');
  sel.innerHTML=zhVoices.map((v,i)=>`<option value="${i}">${v.name}</option>`).join('')||'<option>（無中文語音）</option>';
  if(zhVoices.length){
    const saved=store.get('l8voice','');let i=zhVoices.findIndex(v=>v.name===saved);if(i<0)i=0;
    S.voice=zhVoices[i];sel.value=String(i);
    $('#vnote').textContent=/zh-tw/i.test(S.voice.lang.replace('_','-'))?'':'（目前不是台灣語音）';
  }else if(vs.length){
    $('#vnote').textContent='找不到中文語音，請改用 Edge 或安裝中文語音；目前以字幕呈現';S.voice=null;S.voiceOn=false;
  }
  updateUI();
}

/* ================= 版面縮放、全螢幕、錄影 ================= */
function fit(){
  const full=document.fullscreenElement||S.rec; const h=full?0:$('#controls').offsetHeight;
  const s=Math.min(innerWidth/1920,(innerHeight-h)/1080);S.scale=s;
  const vp=$('#viewport');vp.style.bottom=h+'px';
  $('#stage').style.transform=`translate(-50%,-50%) scale(${s})`;
}
function toggleFull(){ if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().catch(()=>toast('瀏覽器不允許全螢幕，請改按 F11')) }
function enterRec(){
  S.rec=true;document.body.classList.add('rec','hidectl');
  if(!document.fullscreenElement)document.documentElement.requestFullscreen().catch(()=>{});
  S.started=false;document.body.classList.remove('started');S.paused=false;S.mode='auto';
  const h=$('#recHint');h.innerHTML='錄影模式<br>先按 Win + Alt + R 開始錄影，再按「空白鍵」開始自動播放<br><small>（按 Esc 離開錄影模式）</small>';h.style.display='block';
  S.token++;if('speechSynthesis' in window)speechSynthesis.cancel();
  play(0);updateUI();setTimeout(fit,200);
}
function exitRec(){S.rec=false;document.body.classList.remove('rec');$('#recHint').style.display='none';fit();updateCtl()}
function updateCtl(){
  const idle=Date.now()-S.lastAct>3500;
  document.body.classList.toggle('hidectl',S.rec||(S.started&&!S.paused&&S.mode==='auto'&&idle&&!!document.fullscreenElement));
  document.body.classList.toggle('idle',S.rec||(idle&&!!document.fullscreenElement));
}

/* ================= 事件 ================= */
$('#bFirst').onclick=()=>{S.answers={};S.paused=false;if(S.started)go(0);else start(S.mode)};
$('#bPrev').onclick=()=>go(S.idx-1);
$('#bNext').onclick=next;
$('#bPlay').onclick=togglePlay;
$('#bReplay').onclick=()=>{if(!S.started)start(S.mode);else{if(S.paused){S.paused=false;applyPause()}play(S.idx)}};
$('#mAuto').onclick=()=>setMode('auto');$('#mInter').onclick=()=>setMode('inter');
$('#jump').onchange=e=>{const i=+e.target.value;if(!S.started){start(S.mode,i)}else go(i)};
$('#bVoice').onclick=()=>{S.voiceOn=!S.voiceOn;if(!S.voiceOn&&'speechSynthesis' in window)speechSynthesis.cancel();store.set('l8voiceOn',S.voiceOn?'1':'0');updateUI()};
$('#voiceSel').onchange=e=>{S.voice=zhVoices[+e.target.value]||null;if(S.voice)store.set('l8voice',S.voice.name)};
$('#rate').oninput=e=>{S.rate=+e.target.value;store.set('l8rate',S.rate)};
$('#bFull').onclick=toggleFull;$('#bRec').onclick=enterRec;
$('#bHelp').onclick=()=>$('#help').classList.add('open');
$('#seek').oninput=e=>{$('#pos').textContent=(+e.target.value+1)+' / '+slides.length};
$('#seek').onchange=e=>{const i=+e.target.value;if(!S.started){start(S.mode,i)}else go(i)};
$('#content').addEventListener('click',e=>{const b=e.target.closest('.opt');if(b)choose(+b.dataset.k)});
document.addEventListener('keydown',e=>{
  S.lastAct=Date.now();
  if(e.target.matches('select,input[type=range]')&&(e.key===' '||e.key.startsWith('Arrow')))e.target.blur();
  if(e.key===' '){e.preventDefault();
    if(S.rec&&!S.started){$('#recHint').style.display='none';start('auto');return}
    togglePlay();}
  else if(e.key==='ArrowRight')next();
  else if(e.key==='ArrowLeft')go(S.idx-1);
  else if(/^[rR]$/.test(e.key))$('#bReplay').click();
  else if(/^[fF]$/.test(e.key))toggleFull();
  else if(/^[mM]$/.test(e.key))$('#bVoice').click();
  else if(e.key==='1'||e.key==='2'||e.key==='3')choose(+e.key-1);
  else if(e.key==='Escape'){if(S.rec)exitRec();closeBook();$('#help').classList.remove('open')}
});
['mousemove','mousedown','touchstart'].forEach(ev=>document.addEventListener(ev,()=>{S.lastAct=Date.now();updateCtl()}));
document.addEventListener('fullscreenchange',()=>{fit();if(!document.fullscreenElement&&S.rec)exitRec()});
addEventListener('resize',fit);
setInterval(updateCtl,500);
$('#help').addEventListener('click',e=>{if(e.target.id==='help')e.target.classList.remove('open')});

/* ================= 初始化 ================= */
S.rate=+store.get('l8rate',0.8)||0.8;$('#rate').value=S.rate;
S.voiceOn=store.get('l8voiceOn','1')==='1';
S.mode=store.get('l8mode','auto');
buildNav();
if('speechSynthesis' in window){loadVoices();speechSynthesis.onvoiceschanged=loadVoices;setTimeout(loadVoices,1200)}else loadVoices();
fit();play(0);
window.__S=S;window.__slides=slides;
