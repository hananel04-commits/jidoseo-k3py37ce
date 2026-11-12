(()=>{'use strict';
const $=s=>document.querySelector(s),D=window.GUIDE_DATA;
let active={week:null,student:null,worksheet:null,problem:null};
const option=(el,arr,label,id)=>el.replaceChildren(...arr.map(x=>{const o=document.createElement('option');o.value=x[id];o.textContent=x[label];return o}));
const route=(...parts)=>'#'+parts.map(encodeURIComponent).join('/');
function tab(name){
 if(name==='guide'&&!active.problem.guide)return;
 const original=name==='original';$('#guide-panel').hidden=original;$('#original-panel').hidden=!original;
 $('#tab-guide').setAttribute('aria-selected',String(!original));$('#tab-original').setAttribute('aria-selected',String(original));
}
function openProblem(p,scroll=false){
 active.problem=p;
 $('#selected-meta').textContent=active.week.label+' · '+active.student.label+' · '+active.worksheet.label;
 $('#selected-title').textContent='문항 '+p.number;
 $('#tab-guide').disabled=!p.guide;$('#tab-guide').textContent=p.guide?'지도서':'지도서 없음';
 $('#tab-guide').title=p.guide?'해당 문항의 기존 지도서':'1주는 교사용 원본만 추가하며 새 지도서를 만들지 않았습니다.';
 for(const id of ['guide-pdf','guide-full'])$( '#'+id).hidden=!p.guide;
 if(p.guide){const url=p.guide+'?v=final-weeks-1-2';$('#guide-image').src=url;$('#guide-image').alt=active.student.id+' '+p.id+' 지도서';$('#guide-full').href=url;$('#guide-pdf').href=p.pdf}
 else{$('#guide-image').removeAttribute('src');$('#guide-full').removeAttribute('href');$('#guide-pdf').removeAttribute('href')}
 $('#revision-note').textContent=active.week.id==='1주차'?'교사용 원본 바로 보기 · 기존 심화 지도서만 연결 · 1주 새 제작 없음':(active.student.id==='이우명'?'승인본 v5R2 · 실제 도형 · 단계별 1:1 연결':'심화 8문항만 · v5R2 · 실제 도형 · 단계별 1:1 연결');
 for(const name of ['problem','answer','solution'])$('#original-'+name).src=p.originalImages[name];
 $('#teacher-pdf').href=active.student.teacherPdf+'#page='+p.originalPages[0];
 $('#original-caption').textContent=active.student.sourceFilename+' · PDF '+p.originalPages.join(', ')+'쪽 · No.'+p.id;
 $('#combined').href=active.student.combinedPdf;$('#combined').textContent=active.week.id==='1주차'?'기존 심화 지도서 합본 PDF ↗':'학생 지도서 합본 PDF ↗';
 for(const b of $('#problem-buttons').children)b.setAttribute('aria-current',String(Number(b.dataset.number)===p.number));
 tab(active.week.id==='1주차'?'original':'guide');
 $('#status').textContent=(p.answer?'공식 정답: '+p.answer:'정답은 해당 문항의 교사용 공식 정답 원본을 확인하세요.')+' · 이 문항으로 직접 연결되는 주소입니다.';
 document.title=active.student.id+' '+p.id+' | '+active.week.label;
 if(scroll&&innerWidth<=760)$('#viewer').scrollIntoView({block:'start',behavior:'instant'});
}
function applyHash(scroll=false){
 let parts;try{parts=location.hash.slice(1).split('/').map(decodeURIComponent)}catch{parts=[]}
 const w=D.weeks.find(x=>x.id===parts[0])||D.weeks[0],s=w.students.find(x=>x.id===parts[1])||w.students[0],ws=s.worksheets.find(x=>x.id===parts[2])||s.worksheets[0],p=ws.problems.find(x=>String(x.number)===parts[3])||ws.problems[0];
 active={week:w,student:s,worksheet:ws,problem:p};
 option($('#week'),D.weeks,'label','id');$('#week').value=w.id;
 option($('#student'),w.students,'label','id');$('#student').value=s.id;
 option($('#worksheet'),s.worksheets,'label','id');$('#worksheet').value=ws.id;
 $('#count').textContent=ws.problems.length+'문항';
 $('#problem-buttons').replaceChildren(...ws.problems.map(x=>{const b=document.createElement('button');b.type='button';b.textContent=x.number;b.dataset.number=x.number;b.setAttribute('aria-label',x.number+'번 '+(w.id==='1주차'?'교사용 원본':'지도서')+' 바로 열기');b.onclick=()=>{const hash=route(w.id,s.id,ws.id,x.number);if(location.hash===hash)openProblem(x,true);else location.hash=hash};return b}));
 openProblem(p,scroll);const canonical=route(w.id,s.id,ws.id,p.number);if(location.hash!==canonical)history.replaceState(null,'',canonical);
}
$('#week').onchange=()=>{const w=D.weeks.find(x=>x.id===$('#week').value),s=w.students[0],ws=s.worksheets[0];location.hash=route(w.id,s.id,ws.id,ws.problems[0].number)};
$('#student').onchange=()=>{const s=active.week.students.find(x=>x.id===$('#student').value),ws=s.worksheets[0];location.hash=route(active.week.id,s.id,ws.id,ws.problems[0].number)};
$('#worksheet').onchange=()=>{const ws=active.student.worksheets.find(x=>x.id===$('#worksheet').value);location.hash=route(active.week.id,active.student.id,ws.id,ws.problems[0].number)};
$('#tab-guide').onclick=()=>tab('guide');$('#tab-original').onclick=()=>tab('original');
$('#guide-image').onerror=()=>{if(active.problem.guide)$('#status').textContent='이미지를 열지 못했습니다. app과 자료 폴더의 상대 위치를 유지해 주세요.'};
addEventListener('hashchange',()=>applyHash(true));window.guideApp={get active(){return active},route,tab};applyHash();
})();
