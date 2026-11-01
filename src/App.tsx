import { supabase } from './supabase';
import { OriginalWorkbook } from './OriginalWorkbook';
import { useEffect, useState } from 'react'; // 입력값 변경을 화면에 반영합니다.
import { Users, CalendarDays, Bus, Wallet, Clock, LayoutDashboard, Plus, Download } from 'lucide-react'; // 메뉴를 직관적으로 구분합니다.
import * as XLSX from 'xlsx'; // 데이터 백업을 엑셀 형식으로 제공합니다.
type Student={id:string;name:string;age:string;phone:string;schedule:string;pickup:string;dropoff:string;pickupTime:string;dropoffTime:string}; // 모든 메뉴에서 학생정보를 공유합니다.
type Records=Record<string,string>; // 학생과 날짜별 상태를 저장합니다.
const empty=():Student=>({id:'',name:'',age:'',phone:'',schedule:'',pickup:'',dropoff:'',pickupTime:'',dropoffTime:''}); // 새 학생 등록값을 초기화합니다.
const read=<T,>(_key:string,fallback:T):T=>fallback; // 개인정보는 브라우저에 영구 보관하지 않습니다. // 저장값이 깨져도 실행되도록 합니다.
const days=['월','화','수','목','금']; // 원본 수업 요일을 유지합니다.
const nav=[{name:'대시보드',icon:LayoutDashboard},{name:'학생관리',icon:Users},{name:'시간표',icon:Clock},{name:'출석관리',icon:CalendarDays},{name:'차량관리',icon:Bus},{name:'교육비',icon:Wallet},{name:'원본 시트',icon:Download}]; // 주요 업무를 하나의 메뉴로 제공합니다.
export function App(){ // 모든 메뉴가 같은 학생 목록을 사용하도록 합니다.
const [page,setPage]=useState('대시보드'); // 현재 화면을 기억합니다.
const [students,setStudents]=useState<Student[]>(()=>read('cf.students',[])); // 학생을 브라우저에 보존합니다.
const [attendance,setAttendance]=useState<Records>(()=>read('cf.attendance',{})); // 출석 변경을 보존합니다.
const [payments,setPayments]=useState<Records>(()=>read('cf.payments',{})); // 교육비 변경을 보존합니다.
const [month,setMonth]=useState(new Date().toISOString().slice(0,7)); // 월별 업무의 기준을 맞춥니다.
const [editing,setEditing]=useState<Student|null>(null); // 등록과 수정을 동일한 화면에서 처리합니다.
const [query,setQuery]=useState(''); // 학생을 빠르게 검색합니다.
const [day,setDay]=useState('월'); // 차량 조회 요일을 선택합니다.
const [direction,setDirection]=useState<'등원'|'하원'>('등원');
useEffect(()=>{let active=true;void supabase.from('academy_data').select('key,value').then(({data,error})=>{if(!active)return;if(error){alert(error.message);return;}for(const row of data??[]){if(row.key==='cf.students'&&Array.isArray(row.value))setStudents(row.value as Student[]);if(row.key==='cf.attendance'&&row.value)setAttendance(row.value as Records);if(row.key==='cf.payments'&&row.value)setPayments(row.value as Records);}});return()=>{active=false;};},[]); // 인증된 사용자 데이터만 불러옵니다. // 차량 이동 방향을 구분합니다.
const save=<T,>(key:string,value:T,update:(value:T)=>void)=>{update(value);void supabase.from('academy_data').upsert({key,value},{onConflict:'owner_id,key'}).then(({error})=>{if(error)alert('저장 실패: '+error.message);});}; // 변경 직후 저장해 새로고침 손실을 줄입니다.
const key=(id:string,date:string)=>`${id}|${date}`; // 학생별 상태가 섞이지 않게 합니다.
const slots=(s:Student)=>[...s.schedule.matchAll(/([월화수목금])\s*(\d{1,2})/g)].map(m=>({day:m[1],hour:Number(m[2])})); // '월2 수2' 형식을 시간표로 바꿉니다.
const saveStudent=()=>{if(!editing?.name.trim()){alert('이름을 입력해 주세요.');return;}const id=editing.id||String(Date.now());const next={...editing,id};save('cf.students',students.some(s=>s.id===id)?students.map(s=>s.id===id?next:s):[...students,next],setStudents);setEditing(null);}; // 등록과 수정을 구분해 중복 행을 방지합니다.
const [busy,setBusy]=useState(false);
const [archiveRefresh,setArchiveRefresh]=useState(0); // 업로드 후 원본 시트를 다시 읽습니다. // 중복 업로드를 막습니다.
const importWorkbook=async(file:File)=>{ // 원본 엑셀을 비공개 저장소에 보관합니다.
  setBusy(true); // 중복 업로드를 막습니다.
  try { // 업로드 실패 원인을 표시합니다.
    const bytes = await file.arrayBuffer(); // 원본 바이트를 변경하지 않고 읽습니다.
    const wb = XLSX.read(bytes, { type: 'array', cellFormula: true, cellStyles: true }); // 시트와 수식을 읽습니다.
    const required = ['사용방법','설정','입관원서','현황판','출석부_월수금','출석부_화목','등하원_스케줄_관리','등하원_월수금','등하원_화목','교육비_현황(상반기)','교육비_현황(하반기)']; // 11개 시트가 누락되지 않았는지 검사합니다.
    const missing = required.filter(name => !wb.SheetNames.includes(name)); // 빠진 시트를 찾습니다.
    if (missing.length) throw new Error(`시트 누락: ${missing.join(', ')}`); // 일부 데이터만 저장되는 상황을 막습니다.
    const archive: Record<string, unknown[][]> = {}; // 시트 전체의 표시값을 조회용으로 보관합니다.
    for (const name of wb.SheetNames) archive[name] = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[name], { header: 1, defval: '', raw: false }); // 모든 시트를 조회 가능하게 만듭니다.
    const { data: identity } = await supabase.auth.getUser(); // 로그인한 사용자 ID를 확인합니다.
    if (!identity.user) throw new Error('다시 로그인해 주세요.'); // 인증되지 않은 업로드를 차단합니다.
    const path = `${identity.user.id}/original.xlsx`; // 계정별 비공개 파일 경로를 만듭니다.
    const { error: fileError } = await supabase.storage.from('academy-originals').upload(path, new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), { upsert: true }); // 수식·서식·숨김 셀을 포함한 원본 파일을 보관합니다.
    if (fileError) throw fileError; // 원본 저장 실패 시 성공이라고 표시하지 않습니다.
    const { error: dbError } = await supabase.from('academy_data').upsert({ key: 'original.workbook', value: archive }, { onConflict: 'owner_id,key' }); // 시트별 조회 데이터를 보관합니다.
    if (dbError) throw dbError; // 조회용 데이터 저장 오류를 알립니다.
    setArchiveRefresh(value => value + 1); // 원본 조회 화면을 갱신합니다.
    alert(`원본 ${wb.SheetNames.length}개 시트를 저장했습니다. 업무 화면으로의 자동 변환은 아직 검증되지 않았습니다.`); // 보존과 변환을 구분합니다.
  } catch (error) { alert(error instanceof Error ? error.message : '업로드 실패'); } finally { setBusy(false); } // 상태를 복구합니다.
};
const downloadOriginal=async()=>{ // 원본 파일을 변형 없이 다운로드합니다.
  const { data: identity } = await supabase.auth.getUser(); // 자신의 파일만 접근합니다.
  if (!identity.user) return; // 비로그인 다운로드를 막습니다.
  const { data, error } = await supabase.storage.from('academy-originals').download(`${identity.user.id}/original.xlsx`); // 비공개 버킷에서 원본을 읽습니다.
  if (error || !data) { alert(error?.message ?? '원본 파일이 없습니다.'); return; } // 원본이 없는 상황을 안내합니다.
  const url = URL.createObjectURL(data); // 브라우저 다운로드를 위한 임시 주소를 생성합니다.
  const link = document.createElement('a'); // 원본 다운로드 링크를 준비합니다.
  link.href = url; link.download = '성진클래스잠원점-원본.xlsx'; link.click(); // 원본 바이트를 저장합니다.
  setTimeout(() => URL.revokeObjectURL(url), 1000); // 임시 주소를 정리합니다.
};
const exportExcel=()=>{const book=XLSX.utils.book_new();XLSX.utils.book_append_sheet(book,XLSX.utils.json_to_sheet(students),'학생');XLSX.utils.book_append_sheet(book,XLSX.utils.json_to_sheet(Object.entries(attendance).map(([k,v])=>({학생:k.split('|')[0],날짜:k.split('|')[1],상태:v}))),'출석');XLSX.utils.book_append_sheet(book,XLSX.utils.json_to_sheet(Object.entries(payments).map(([k,v])=>({학생:k.split('|')[0],월:k.split('|')[1],상태:v}))),'교육비');XLSX.writeFile(book,`seongjin-class-${month}.xlsx`);}; // 운영 데이터를 수동 백업할 수 있게 합니다.
const status=(record:Records,set:(r:Records)=>void,store:string,id:string,date:string,options:string[])=><select className="status" value={record[key(id,date)]||''} onChange={e=>save(store,{...record,[key(id,date)]:e.target.value},set)}><option value="">—</option>{options.map(o=><option key={o}>{o}</option>)}</select>; // 표에서 상태를 직접 수정합니다.
const dates=Array.from({length:new Date(Number(month.slice(0,4)),Number(month.slice(5)),0).getDate()},(_,i)=>`${month}-${String(i+1).padStart(2,'0')}`); // 해당 월의 정확한 날짜를 생성합니다.
return <div className="layout"><aside className="sidebar"><div className="brand"><span>C</span><div>성진 클래스 잠원점<small>학원 관리 시스템</small></div></div><p>WORKSPACE</p>{nav.map(({name,icon:Icon})=><button key={name} className={page===name?'active':''} onClick={()=>setPage(name)}><Icon size={19}/>{name}</button>)}<footer>성진 클래스 잠원점 v0.6<br/>Supabase 계정별 저장</footer></aside><main><header><span>운영 관리 / <b>{page}</b></span><div><input type="month" value={month} onChange={e=>setMonth(e.target.value)}/><label className="secondary" style={{cursor:"pointer"}}>{busy?"업로드 중":"엑셀 업로드"}<input hidden type="file" accept=".xlsx,.xls" disabled={busy} onChange={e=>{const f=e.target.files?.[0];if(f)void importWorkbook(f);e.target.value="";}}/></label><button className="secondary" onClick={()=>void downloadOriginal()}>원본 다운로드</button><button className="secondary" onClick={()=>void supabase.auth.signOut()}>로그아웃</button><button className="secondary" onClick={exportExcel}><Download size={16}/> 엑셀 백업</button></div></header><section className="content"><div className="privacy-note" role="alert">계정별 로그인 및 데이터 접근 정책을 사용합니다. 원본 시트는 셀 값만 보관되며 출석·차량·교육비의 상세 자동 변환은 미완료입니다.</div><div className="heading"><div><label>SEONGJIN CLASS</label><h1>{page}</h1><p>학생부터 출석, 차량, 교육비까지 간편하게 관리하세요.</p></div>{page==='학생관리'&&<button className="primary" onClick={()=>setEditing(empty())}><Plus size={17}/> 학생 등록</button>}</div>
{page==='대시보드'&&<><div className="cards">{[['전체 학생',students.length,'명'],['출석 기록',Object.values(attendance).filter(v=>v==='출석').length,'건'],['차량 등록',students.filter(s=>s.pickup||s.dropoff).length,'명'],['이번 달 완납',students.filter(s=>payments[key(s.id,month)]==='완납').length,'명']].map(([label,value,unit])=><article key={label}><span>{label}</span><strong>{value}<small>{unit}</small></strong><p>현재 등록 기준</p></article>)}</div><div className="panel"><h2>빠른 업무</h2><div className="quick">{nav.slice(1).map(({name,icon:Icon})=><button key={name} onClick={()=>setPage(name)}><Icon size={22}/>{name}<span>→</span></button>)}</div></div><div className="panel"><h2>최근 등록 학생</h2><div className="tags">{students.slice(-15).map(s=><span key={s.id}>{s.name} <small>{s.schedule}</small></span>)}{!students.length&&'학생관리에서 학생을 등록해 주세요.'}</div></div></>}
{page==='학생관리'&&<div className="panel"><div className="panelhead"><h2>학생 목록 <small>{students.length}명</small></h2><input placeholder="이름·번호·연락처 검색" value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="scroll"><table><thead><tr>{['학생번호','이름','나이','연락처','수업시간','등원장소','하원장소','관리'].map(t=><th key={t}>{t}</th>)}</tr></thead><tbody>{students.filter(s=>[s.name,s.id,s.phone].some(v=>v.includes(query))).map(s=><tr key={s.id}><td>{s.id}</td><td><b>{s.name}</b></td><td>{s.age}</td><td>{s.phone}</td><td>{s.schedule}</td><td>{s.pickup}</td><td>{s.dropoff}</td><td><button onClick={()=>setEditing({...s})}>수정</button><button onClick={()=>{if(confirm('학생을 삭제할까요?'))save('cf.students',students.filter(x=>x.id!==s.id),setStudents);}}>삭제</button></td></tr>)}</tbody></table></div></div>}
{page==='시간표'&&<div className="panel"><h2>주간 수업 시간표</h2><p>수업시간 입력 예: 월2 수2 금2 (오후 2시)</p><div className="scroll"><table className="timetable"><thead><tr><th>시간</th>{days.map(d=><th key={d}>{d}요일</th>)}</tr></thead><tbody>{[1,2,3,4,5,6,7,8,9].map(h=><tr key={h}><th>{h}시</th>{days.map(d=><td key={d}>{students.filter(s=>slots(s).some(t=>t.day===d&&t.hour===h)).map(s=><span className="pill" key={s.id}>{s.name}</span>)}</td>)}</tr>)}</tbody></table></div></div>}
{page==='출석관리'&&<div className="panel"><h2>{month} 출석부</h2><p>가로로 스크롤해 날짜별 출석·결석·보강을 기록하세요.</p><div className="scroll"><table className="attendance"><thead><tr><th className="fixed">학생</th>{dates.map(d=><th key={d}>{Number(d.slice(-2))}<small>{['일','월','화','수','목','금','토'][new Date(d+'T12:00:00').getDay()]}</small></th>)}</tr></thead><tbody>{students.map(s=><tr key={s.id}><th className="fixed">{s.name}<small>{s.schedule}</small></th>{dates.map(d=><td key={d}>{status(attendance,setAttendance,'cf.attendance',s.id,d,['출석','결석','보강'])}</td>)}</tr>)}</tbody></table></div></div>}
{page==='차량관리'&&<div className="panel"><div className="panelhead"><h2>등하원 차량 스케줄</h2><div><select value={day} onChange={e=>setDay(e.target.value)}>{days.map(d=><option key={d}>{d}</option>)}</select><select value={direction} onChange={e=>setDirection(e.target.value as '등원'|'하원')}><option>등원</option><option>하원</option></select></div></div><div className="scroll"><table><thead><tr>{['시간','이름','장소','수업시간','연락처'].map(t=><th key={t}>{t}</th>)}</tr></thead><tbody>{students.filter(s=>slots(s).some(x=>x.day===day)&&(direction==='등원'?s.pickup:s.dropoff)).sort((a,b)=>(direction==='등원'?a.pickupTime:a.dropoffTime).localeCompare(direction==='등원'?b.pickupTime:b.dropoffTime)).map(s=><tr key={s.id}><td><b>{direction==='등원'?s.pickupTime:s.dropoffTime}</b></td><td>{s.name}</td><td>{direction==='등원'?s.pickup:s.dropoff}</td><td>{s.schedule}</td><td>{s.phone}</td></tr>)}</tbody></table></div></div>}
{page==='원본 시트'&&<OriginalWorkbook refresh={archiveRefresh} />}
{page==='교육비'&&<div className="panel"><h2>{month.slice(0,4)}년 교육비 수납 현황</h2><p>각 월별 납부 상태를 선택하세요. 금액·청구 규칙은 추후 추가합니다.</p><div className="scroll"><table><thead><tr><th className="fixed">학생</th>{Array.from({length:12},(_,i)=><th key={i}>{i+1}월</th>)}</tr></thead><tbody>{students.map(s=><tr key={s.id}><th className="fixed">{s.name}</th>{Array.from({length:12},(_,i)=>{const m=`${month.slice(0,4)}-${String(i+1).padStart(2,'0')}`;return <td key={m}>{status(payments,setPayments,'cf.payments',s.id,m,['완납','미납','면제'])}</td>;})}</tr>)}</tbody></table></div></div>}
</section></main>{editing&&<div className="overlay" onClick={()=>setEditing(null)}><div className="modal" onClick={e=>e.stopPropagation()}><h2>{editing.id?'학생 수정':'학생 등록'}</h2><p>등록한 정보는 시간표와 차량관리 화면에 연결됩니다.</p><div className="fields">{([['id','학생번호'],['name','이름'],['age','나이'],['phone','연락처'],['schedule','수업시간 (월2 수2 금2)'],['pickup','등원장소'],['pickupTime','등원시간 (13:30)'],['dropoff','하원장소'],['dropoffTime','하원시간 (15:00)']] as const).map(([field,label])=><label key={field}>{label}<input value={editing[field]} onChange={e=>setEditing({...editing,[field]:e.target.value})}/></label>)}</div><div className="modal-actions"><button onClick={()=>setEditing(null)}>취소</button><button className="primary" onClick={saveStudent}>저장하기</button></div></div></div>}</div>;
}
