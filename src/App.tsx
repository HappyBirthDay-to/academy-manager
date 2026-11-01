import { supabase } from './supabase';
import { OriginalWorkbook } from './OriginalWorkbook';
import { useEffect, useState } from 'react'; // 입력값 변경을 화면에 반영합니다.
import { Users, CalendarDays, Bus, Wallet, Clock, LayoutDashboard, Plus, Download, ShieldAlert, RefreshCw, BookOpen, CheckCircle2, Search, Pencil, Trash2 } from 'lucide-react'; // 메뉴를 직관적으로 구분합니다.
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
const [dashboardQuery,setDashboardQuery]=useState(''); // 대시보드 학생 검색을 별도로 관리합니다.
const [query,setQuery]=useState(''); // 학생을 빠르게 검색합니다.
const [day,setDay]=useState('월'); // 차량 조회 요일을 선택합니다.
const [direction,setDirection]=useState<'등원'|'하원'>('등원');
const [attendanceDate,setAttendanceDate]=useState(new Date().toLocaleDateString('sv-SE')); // 날짜별 출석을 관리합니다.
useEffect(()=>{if(!attendanceDate.startsWith(month))setAttendanceDate(`${month}-01`);},[month]); // 선택한 월과 출석 날짜가 달라지지 않게 맞춥니다.
const [attendanceTime,setAttendanceTime]=useState('전체'); // 수업 시간별 명단을 조회합니다.
const [selectedAttendance,setSelectedAttendance]=useState<string[]>([]); // 출석 일괄 대상입니다.
const [selectedPayments,setSelectedPayments]=useState<string[]>([]); // 교육비 일괄 대상입니다.
const [vehicleQuery,setVehicleQuery]=useState(''); // 차량 명단을 검색합니다.
const sortedStudents=[...students].sort((a,b)=>a.name.localeCompare(b.name,'ko')||a.id.localeCompare(b.id)); // 학생번호는 보존하고 이름만 정렬합니다.
const normalizePhone=(value:string)=>{ // 원본 엑셀에서 앞자리 0이 사라진 휴대전화 번호를 보정합니다.
 const digits=value.replace(/\D/g,''); // 하이픈이나 공백 때문에 길이 판단이 틀리지 않도록 숫자만 추출합니다.
 if(digits.length===10&&digits.startsWith('10'))return `0${digits}`; // 1012345678은 01012345678로 복구합니다.
 return digits; // 일반전화와 이미 정상인 번호는 임의로 바꾸지 않습니다.
};
const phoneNumber=(value:string)=>normalizePhone(value); // 전화 연결에도 보정된 숫자를 사용합니다.
const phoneText=(value:string)=>{ // 학생 목록과 차량관리에서 같은 표기 규칙을 사용합니다.
 const digits=normalizePhone(value); // 원본이 숫자 타입으로 들어온 경우도 처리합니다.
 if(digits.length===11&&digits.startsWith('010'))return `${digits.slice(0,3)}-${digits.slice(3,7)}-${digits.slice(7)}`; // 휴대전화는 010-0000-0000 형식으로 표시합니다.
 if(digits.length===10&&digits.startsWith('02'))return `${digits.slice(0,2)}-${digits.slice(2,6)}-${digits.slice(6)}`; // 서울 지역번호를 보존합니다.
 if(digits.length===10)return `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`; // 그 밖의 10자리 전화번호를 표시합니다.
 return value||'—'; // 판별 불가능한 값은 원본을 유지해 데이터 왜곡을 막습니다.
};
const studentOrder=new Map(sortedStudents.map((student,index)=>[student.id,index+1])); // 화면마다 동일한 가나다순 순번을 표시합니다.
const navigate=(name:string)=>{setPage(name);window.scrollTo(0,0);}; // 메뉴 이동 시 상단으로 돌아옵니다.






const [busy,setBusy]=useState(false);
const [dataState,setDataState]=useState<'loading'|'ready'|'empty'|'error'>('loading');
const [dataError,setDataError]=useState('');
const [reload,setReload]=useState(0);
const [archiveRefresh,setArchiveRefresh]=useState(0);
useEffect(() => { // 학생 목록은 개별 키로 조회해 RLS 및 네트워크 오류를 정확히 구분합니다.
  let active = true; // 화면 해제 후 비동기 상태 변경을 방지합니다.
  setDataState('loading'); // 새 조회가 시작됐음을 표시합니다.
  setDataError(''); // 이전 오류와 새로운 조회 결과를 구분합니다.
  void (async () => { // 여러 업무 데이터 조회를 순서대로 확인합니다.
    const { data, error } = await supabase.from('academy_shared_data').select('key,value').in('key',['cf.students','cf.attendance','cf.payments']); // 불필요한 원본 시트를 읽지 않아 속도를 높입니다.
    if (!active) return; // 이전 화면의 응답을 버립니다.
    if (error) { setDataError(`${error.code ?? 'QUERY_ERROR'}: ${error.message}`); setDataState('error'); return; } // 권한 및 스키마 문제를 숨기지 않습니다.
    const studentRecord = data?.find(row => row.key === 'cf.students'); // 정확한 학생 키만 선택합니다.
    if (!studentRecord) { setDataError('cf.students 키를 읽지 못했습니다. SQL 저장 여부와 RLS SELECT 정책을 확인하세요.'); setDataState('empty'); return; } // 빈 결과를 정상 데이터로 오인하지 않습니다.
    if (!Array.isArray(studentRecord.value)) { setDataError('cf.students의 JSON 형식이 배열이 아닙니다.'); setDataState('error'); return; } // 원본 구조 오류를 감지합니다.
    const validStudents = studentRecord.value.filter((value): value is Student => typeof value === 'object' && value !== null && typeof value.id === 'string' && typeof value.name === 'string'); // 구조가 맞는 학생만 표시합니다.
    setStudents(validStudents); // 서버에서 읽은 학생 수를 기준으로 화면을 갱신합니다.
    const attendanceRow = data?.find(row => row.key === 'cf.attendance'); // 출석 데이터가 있을 때만 가져옵니다.
    const paymentsRow = data?.find(row => row.key === 'cf.payments'); // 교육비 데이터가 있을 때만 가져옵니다.
    setAttendance(attendanceRow?.value && typeof attendanceRow.value === 'object' && !Array.isArray(attendanceRow.value) ? attendanceRow.value as Records : {}); // 출석 기록이 없는 경우 이전 조회값을 남기지 않습니다. // 원본 출석기록을 유지합니다.
    setPayments(paymentsRow?.value && typeof paymentsRow.value === 'object' && !Array.isArray(paymentsRow.value) ? paymentsRow.value as Records : {}); // 월별 교육비의 오래된 상태를 제거합니다. // 원본 교육비 기록을 유지합니다.
    setDataState('ready'); // 데이터 조회가 성공했을 때만 정상 상태를 표시합니다.
  })(); // 인증 후 데이터 조회를 시작합니다.
  return () => { active = false; }; // 화면 해제 시 응답 반영을 중단합니다.
}, [reload]); // 사용자가 다시 조회할 때 실행합니다.
const save=<T,>(key:string,value:T,update:(value:T)=>void)=>{update(value);void supabase.from('academy_shared_data').upsert({key,value},{onConflict:'key'}).then(({error})=>{if(error)alert('저장 실패: '+error.message);});}; // 변경 직후 저장해 새로고침 손실을 줄입니다.
const key=(id:string,date:string)=>`${id}|${date}`;
const bulkSave=async(kind:'cf.attendance'|'cf.payments',ids:string[],date:string,value:string)=>{ // 선택한 학생만 변경합니다.
 if(!ids.length)return; // 대상이 없다면 실행하지 않습니다.
 const old=kind==='cf.attendance'?attendance:payments; // 기존 데이터를 유지합니다.
 const next={...old};for(const id of ids)next[key(id,date)]=value; // 해당 날짜의 선택 학생만 갱신합니다.
 const {error}=await supabase.from('academy_shared_data').upsert({key:kind,value:next},{onConflict:'key'}); // 저장 완료를 확인합니다.
 if(error){alert('저장 실패: '+error.message);return;} // 오류가 있으면 성공으로 표시하지 않습니다.
 if(kind==='cf.attendance'){setAttendance(next);setSelectedAttendance([]);}else{setPayments(next);setSelectedPayments([]);} // 저장 후 선택을 해제합니다.
};
 // 학생별 상태가 섞이지 않게 합니다.
const slots=(s:Student)=>[...s.schedule.matchAll(/([월화수목금])\s*(\d{1,2})/g)].map(m=>({day:m[1],hour:Number(m[2])})); // '월2 수2' 형식을 시간표로 바꿉니다.
const saveStudent=()=>{if(!editing?.name.trim()){alert('이름을 입력해 주세요.');return;}const id=editing.id||String(Date.now());const next={...editing,id};save('cf.students',students.some(s=>s.id===id)?students.map(s=>s.id===id?next:s):[...students,next],setStudents);setEditing(null);}; // 등록과 수정을 구분해 중복 행을 방지합니다.
const importWorkbook=async(file:File)=>{ // 원본의 셀 값과 수식을 공용 테이블에 나누어 보관합니다.
 setBusy(true); // 중복 업로드를 방지합니다.
 try { // 네트워크 실패를 안내합니다.
 const wb=XLSX.read(await file.arrayBuffer(),{type:'array',cellFormula:true}); // 시트와 수식을 읽습니다.
 const required=['사용방법','설정','입관원서','현황판','출석부_월수금','출석부_화목','등하원_스케줄_관리','등하원_월수금','등하원_화목','교육비_현황(상반기)','교육비_현황(하반기)']; // 필수 시트를 확인합니다.
 const missing=required.filter(n=>!wb.SheetNames.includes(n)); // 누락을 찾습니다.
 if(missing.length)throw new Error('시트 누락: '+missing.join(', ')); // 불완전한 업로드를 막습니다.
 for(const name of wb.SheetNames){ // 모든 시트를 처리합니다.
 const cells=Object.entries(wb.Sheets[name]).filter(([a])=>!a.startsWith('!')).map(([c,v])=>{const cell=v as XLSX.CellObject;return {c,v:cell.v??'',...(cell.f?{f:cell.f}:{})};}); // 값과 수식을 보관합니다.
 for(let i=0;i<cells.length;i+=200){ // 요청 크기를 제한합니다.
 const key=`original.cells.${name}.${String(i/200).padStart(4,'0')}`; // 기존 SQL 키와 맞춥니다.
 const {error}=await supabase.from('academy_shared_data').upsert({key,value:cells.slice(i,i+200)},{onConflict:'key'}); // 공용 테이블에 저장합니다.
 if(error)throw error; // 실패한 업로드를 알립니다.
 } // 시트별 묶음 저장을 마칩니다.
 } // 모든 시트를 처리했습니다.
 setArchiveRefresh(v=>v+1); // 조회 화면을 새로고칩니다.
 alert('원본 시트 저장 완료. 학생/출석/교육비 자동 변환은 별도 검증이 필요합니다.'); // 보존과 업무 변환을 구분합니다.
 }catch(e){alert(e instanceof Error?e.message:'업로드 실패');}finally{setBusy(false);} // 버튼을 복구합니다.
};
const downloadOriginal=async()=>{ // DB의 원본 셀 데이터로 다중 시트 엑셀을 재구성합니다.
 const {data,error}=await supabase.from('academy_shared_data').select('key,value').like('key','original.cells.%').order('key'); // 저장된 모든 묶음을 읽습니다.
 if(error||!data?.length){alert(error?.message??'원본 데이터가 없습니다.');return;} // 빈 파일 생성을 막습니다.
 const sheets=new Map<string,Array<{c:string;v:unknown;f?:string}>>(); // 시트별 셀을 모읍니다.
 for(const row of data){const match=/^original\.cells\.(.+)\.(\d{4})$/.exec(row.key);if(!match||!Array.isArray(row.value))continue;const items=sheets.get(match[1])??[];for(const cell of row.value){if(cell&&typeof cell==='object'&&'c'in cell&&typeof cell.c==='string')items.push(cell as {c:string;v:unknown;f?:string});}sheets.set(match[1],items);} // 셀 묶음을 합칩니다.
 const wb=XLSX.utils.book_new(); // 엑셀 통합문서를 만듭니다.
 for(const [name,cells] of sheets){const ws:XLSX.WorkSheet={};let maxR=0,maxC=0;for(const cell of cells){const pos=XLSX.utils.decode_cell(cell.c);maxR=Math.max(maxR,pos.r);maxC=Math.max(maxC,pos.c);const v=cell.v;ws[cell.c]={t:typeof v==='number'?'n':typeof v==='boolean'?'b':'s',v:v??'',...(cell.f?{f:cell.f}:{})};}ws['!ref']=XLSX.utils.encode_range({s:{r:0,c:0},e:{r:maxR,c:maxC}});XLSX.utils.book_append_sheet(wb,ws,name.slice(0,31));} // 셀 주소를 유지합니다.
 XLSX.writeFile(wb,'성진클래스잠원점-원본셀데이터.xlsx'); // 원본 서식·이미지는 복원되지 않음을 안내합니다.
};
const exportExcel=()=>{const book=XLSX.utils.book_new();XLSX.utils.book_append_sheet(book,XLSX.utils.json_to_sheet(sortedStudents.map((student,index)=>({순번:index+1,...student,phone:phoneText(student.phone)}))),'학생');XLSX.utils.book_append_sheet(book,XLSX.utils.json_to_sheet(Object.entries(attendance).map(([k,v])=>({학생:k.split('|')[0],날짜:k.split('|')[1],상태:v}))),'출석');XLSX.utils.book_append_sheet(book,XLSX.utils.json_to_sheet(Object.entries(payments).map(([k,v])=>({학생:k.split('|')[0],월:k.split('|')[1],상태:v}))),'교육비');XLSX.writeFile(book,`seongjin-class-${month}.xlsx`);}; // 운영 데이터를 수동 백업할 수 있게 합니다.
const status=(record:Records,set:(r:Records)=>void,store:string,id:string,date:string,options:string[])=><select className="status" value={record[key(id,date)]||''} onChange={e=>save(store,{...record,[key(id,date)]:e.target.value},set)}><option value="">—</option>{options.map(o=><option key={o}>{o}</option>)}</select>; // 표에서 상태를 직접 수정합니다.
const dates=Array.from({length:new Date(Number(month.slice(0,4)),Number(month.slice(5)),0).getDate()},(_,i)=>`${month}-${String(i+1).padStart(2,'0')}`); // 해당 월의 정확한 날짜를 생성합니다.
return <div className="layout"><aside className="sidebar"><div className="brand"><div>성진 클래스 잠원점<small>학원 관리 시스템</small></div></div><p>WORKSPACE</p>{nav.map(({name,icon:Icon})=><button key={name} className={page===name?'active':''} onClick={()=>navigate(name)}><Icon size={19}/>{name}</button>)}<footer>성진 클래스 잠원점 v1.0<br/>학원 관리 시스템</footer></aside><main><header><span>운영 관리 / <b>{page}</b></span><div><input type="month" value={month} onChange={e=>setMonth(e.target.value)}/><label className="secondary" style={{cursor:"pointer"}}>{busy?"업로드 중":"엑셀 업로드"}<input hidden type="file" accept=".xlsx,.xls" disabled={busy} onChange={e=>{const f=e.target.files?.[0];if(f)void importWorkbook(f);e.target.value="";}}/></label><button className="secondary" onClick={()=>void downloadOriginal()}>원본 다운로드</button><button className="secondary" onClick={()=>void supabase.auth.signOut()}>로그아웃</button><button className="secondary" onClick={exportExcel}><Download size={16}/> 엑셀 백업</button></div></header><section className="content"><div className={`data-banner data-${dataState}`} role="status"><div><ShieldAlert size={17}/><span>{dataState==='loading'?'학생 정보를 불러오고 있습니다.':dataState==='ready'?`학생 정보 연결 완료 · ${students.length}명`:dataError}</span></div><button type="button" onClick={()=>setReload(v=>v+1)}><RefreshCw size={15}/> 다시 조회</button></div><div className="heading"><div><label>SEONGJIN CLASS</label><h1>{page}</h1><p>학생부터 출석, 차량, 교육비까지 간편하게 관리하세요.</p></div>{page==='학생관리'&&<button className="primary" onClick={()=>setEditing(empty())}><Plus size={17}/> 학생 등록</button>}</div>
{page==='대시보드'&&<>
<div className="academy-hero" role="img" aria-label="태권도 발차기와 줄넘기 선수가 있는 성진 클래스 잠원점 배너"/>
<div className="cards dashboard-kpis">
  <article><div className="kpi-icon kpi-blue"><Users size={24}/></div><div><span>전체 학생</span><strong>{dataState==='ready'?students.length:'—'}<small>명</small></strong><p>현재 등록 기준</p></div></article>
  <article><div className="kpi-icon kpi-purple"><BookOpen size={24}/></div><div><span>수업 시간</span><strong>{dataState==='ready'?new Set(students.flatMap(s=>slots(s).map(t=>`${t.day}${t.hour}`))).size:'—'}<small>개</small></strong><p>학생 시간표 기준</p></div></article>
  <article><div className="kpi-icon kpi-green"><CheckCircle2 size={24}/></div><div><span>오늘 출석</span><strong>{dataState==='ready'?Object.entries(attendance).filter(([k,v])=>k.endsWith(new Date().toLocaleDateString('sv-SE'))&&v==='출석').length:'—'}<small>명</small></strong><p>실제 기록 기준</p></div></article>
  <article><div className="kpi-icon kpi-orange"><Bus size={24}/></div><div><span>차량 이용 학생</span><strong>{dataState==='ready'?students.filter(s=>s.pickup||s.dropoff).length:'—'}<small>명</small></strong><p>등하원 정보 기준</p></div></article>
  <article><div className="kpi-icon kpi-yellow"><Wallet size={24}/></div><div><span>이번 달 완납</span><strong>{dataState==='ready'?students.filter(s=>payments[key(s.id,month)]==='완납').length:'—'}<small>명</small></strong><p>실제 납부 기록 기준</p></div></article>
</div>
<div className="dashboard-grid">
  <section className="panel dashboard-students">
    <div className="panelhead dashboard-table-head">
      <h2>학생 목록 <small>{students.length}명</small></h2>
      <div className="dashboard-actions">
        <label className="dashboard-search"><Search size={16}/><input aria-label="학생 검색" placeholder="이름, 번호, 연락처 검색" value={dashboardQuery} onChange={e=>setDashboardQuery(e.target.value)}/></label>
        <button className="primary" onClick={()=>setEditing(empty())}><Plus size={16}/> 학생 등록</button>
      </div>
    </div>
    <div className="scroll"><table className="dashboard-table">
      <thead><tr>{['순번','이름','나이','연락처','수업시간','등하원','상태','관리'].map(x=><th key={x}>{x}</th>)}</tr></thead>
      <tbody>
      {sortedStudents.filter(s=>[s.id,s.name,s.phone].some(v=>v.includes(dashboardQuery))).slice(0,10).map(s=><tr key={s.id}>
        <td>{studentOrder.get(s.id)}</td><td><b>{s.name}</b></td><td>{s.age||'—'}</td><td>{phoneText(s.phone)}</td><td>{s.schedule||'—'}</td>
        <td>{s.pickup||s.dropoff?'이용':'—'}</td><td><span className="student-status">등록</span></td>
        <td className="table-tools"><button aria-label={`${s.name} 수정`} onClick={()=>setEditing({...s})}><Pencil size={15}/></button><button aria-label={`${s.name} 삭제`} onClick={()=>{if(confirm('학생을 삭제할까요?'))save('cf.students',students.filter(x=>x.id!==s.id),setStudents);}}><Trash2 size={15}/></button></td>
      </tr>)}
      {dataState==='ready'&&!students.length&&<tr><td colSpan={8}>등록된 학생이 없습니다.</td></tr>}
      </tbody>
    </table></div>
    <div className="dashboard-table-footer"><button className="secondary" onClick={exportExcel}><Download size={16}/> 엑셀 다운로드</button><button className="secondary" onClick={()=>navigate('학생관리')}>전체 학생 보기 →</button></div>
  </section>
  <div className="dashboard-side">
    <section className="panel"><h2>빠른 기능</h2><div className="quick">{nav.slice(1,6).map(({name,icon:Icon})=><button key={name} onClick={()=>navigate(name)}><Icon size={23}/>{name}</button>)}</div></section>
    <section className="panel"><div className="panelhead"><h2>오늘의 수업</h2><button className="text-link" onClick={()=>navigate('시간표')}>전체 보기 →</button></div><div className="today-classes">{[1,2,3,4,5].map(h=>{const d=['일','월','화','수','목','금','토'][new Date().getDay()];const count=students.filter(s=>slots(s).some(t=>t.day===d&&t.hour===h)).length;return <div className="class-row" key={h}><strong>{h}시</strong><span>{count}명 수업</span><button onClick={()=>navigate('시간표')}>보기 →</button></div>;})}</div></section>
    <section className="panel"><h2>원본 데이터</h2><p>업로드한 원본 시트는 원본 시트 메뉴에서 확인할 수 있습니다.</p><button className="secondary" onClick={()=>navigate('원본 시트')}>원본 시트 열기 →</button></section>
  </div>
</div>
</>}
{page==='학생관리'&&<div className="panel"><div className="panelhead"><h2>학생 목록 <small>{students.length}명</small></h2><input placeholder="이름·번호·연락처 검색" value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="scroll"><table><thead><tr>{['순번','이름','나이','연락처','수업시간','등원장소','하원장소','관리'].map(t=><th key={t}>{t}</th>)}</tr></thead><tbody>{sortedStudents.filter(s=>[s.name,s.id,s.phone].some(v=>v.includes(query))).map((s,i)=><tr key={s.id}><td>{studentOrder.get(s.id)}</td><td><b>{s.name}</b></td><td>{s.age}</td><td>{phoneNumber(s.phone)?<a href={`tel:${phoneNumber(s.phone)}`}>{phoneText(s.phone)}</a>:'—'}</td><td>{s.schedule}</td><td>{s.pickup}</td><td>{s.dropoff}</td><td><button onClick={()=>setEditing({...s})}>수정</button><button onClick={()=>{if(confirm('학생을 삭제할까요?'))save('cf.students',students.filter(x=>x.id!==s.id),setStudents);}}>삭제</button></td></tr>)}</tbody></table></div></div>}
{page==='시간표'&&<div className="panel"><h2>주간 수업 시간표</h2><p>수업시간 입력 예: 월2 수2 금2 (오후 2시)</p><div className="scroll"><table className="timetable"><thead><tr><th>시간</th>{days.map(d=><th key={d}>{d}요일</th>)}</tr></thead><tbody>{[1,2,3,4,5,6,7,8,9].map(h=><tr key={h}><th>{h}시</th>{days.map(d=><td key={d}>{students.filter(s=>slots(s).some(t=>t.day===d&&t.hour===h)).map(s=><span className="pill" key={s.id}>{s.name}</span>)}</td>)}</tr>)}</tbody></table></div></div>}
{page==='출석관리'&&<div className="panel workflow"><div className="panelhead"><h2>일일 출석부</h2><p>월이 바뀌어도 학생 명단은 유지됩니다. 기록이 없는 날짜는 미기록으로 표시합니다.</p><button className="secondary" onClick={()=>navigate('대시보드')}>← 홈</button></div><div className="workflow-filters"><label>날짜 <input type="date" value={attendanceDate} onChange={e=>{setAttendanceDate(e.target.value);setSelectedAttendance([]);}}/></label><label>수업 시간 <select value={attendanceTime} onChange={e=>{setAttendanceTime(e.target.value);setSelectedAttendance([]);}}><option>전체</option>{[1,2,3,4,5,6,7,8,9].map(h=><option key={h} value={String(h)}>{h}시</option>)}</select></label></div>{(()=>{const weekday=['일','월','화','수','목','금','토'][new Date(attendanceDate+'T12:00:00').getDay()];const list=sortedStudents.filter(s=>slots(s).some(t=>t.day===weekday&&(attendanceTime==='전체'||t.hour===Number(attendanceTime))));return <><div className="bulk-actions"><span>{weekday}요일 대상 {list.length}명 · 선택 {selectedAttendance.length}명</span><button onClick={()=>setSelectedAttendance(list.every(s=>selectedAttendance.includes(s.id))?[]:list.map(s=>s.id))}>전체 선택/해제</button>{['출석','보강','결석'].map(v=><button key={v} disabled={!selectedAttendance.length} onClick={()=>void bulkSave('cf.attendance',selectedAttendance,attendanceDate,v)}>선택 {v}</button>)}<button disabled={!selectedAttendance.length} onClick={()=>void bulkSave('cf.attendance',selectedAttendance,attendanceDate,'')}>기록 삭제</button></div><div className="scroll"><table className="workflow-table"><thead><tr><th>선택</th><th>순번</th><th>이름</th><th>수업시간</th><th>상태</th><th>수정</th></tr></thead><tbody>{list.map((s,i)=><tr key={s.id}><td><input type="checkbox" checked={selectedAttendance.includes(s.id)} onChange={e=>setSelectedAttendance(prev=>e.target.checked?[...prev,s.id]:prev.filter(id=>id!==s.id))}/></td><td>{i+1}</td><td><b>{s.name}</b></td><td>{s.schedule}</td><td>{attendance[key(s.id,attendanceDate)]||'미기록'}</td><td>{status(attendance,setAttendance,'cf.attendance',s.id,attendanceDate,['출석','보강','결석'])}</td></tr>)}</tbody></table></div></>;})()}</div>}
{page==='차량관리'&&<div className="panel workflow"><div className="panelhead"><h2>등하원 차량관리</h2><button className="secondary" onClick={()=>navigate('대시보드')}>← 홈</button></div><div className="workflow-filters"><select value={day} onChange={e=>setDay(e.target.value)}>{days.map(d=><option key={d}>{d}</option>)}</select><select value={direction} onChange={e=>setDirection(e.target.value as '등원'|'하원')}><option>등원</option><option>하원</option></select><input placeholder="학생·장소 검색" value={vehicleQuery} onChange={e=>setVehicleQuery(e.target.value)}/></div>{(()=>{const place=(s:Student)=>direction==='등원'?s.pickup:s.dropoff;const time=(s:Student)=>direction==='등원'?s.pickupTime:s.dropoffTime;const list=sortedStudents.filter(s=>slots(s).some(x=>x.day===day)&&place(s)&&`${s.name} ${place(s)}`.includes(vehicleQuery));const groups=[{title:'시간 등록',items:list.filter(s=>time(s)).sort((a,b)=>time(a).localeCompare(time(b)))},{title:'시간 미등록',items:list.filter(s=>!time(s))}];return groups.map(g=><section key={g.title}><h3>{g.title} ({g.items.length}명)</h3><div className="scroll"><table className="workflow-table"><thead><tr><th>순번</th><th>시간</th><th>학생</th><th>장소</th><th>수업</th><th>전화</th><th>수정</th></tr></thead><tbody>{g.items.map((s,i)=><tr key={s.id}><td>{i+1}</td><td>{time(s)||'미등록'}</td><td><b>{s.name}</b></td><td>{place(s)}</td><td>{s.schedule}</td><td>{phoneNumber(s.phone)?<a href={`tel:${phoneNumber(s.phone)}`}>{phoneText(s.phone)}</a>:'—'}</td><td><button onClick={()=>setEditing({...s})}>수정</button></td></tr>)}</tbody></table></div></section>);})()}</div>}
{page==='원본 시트'&&<OriginalWorkbook refresh={archiveRefresh} />}
{page==='교육비'&&<div className="panel workflow"><div className="panelhead"><h2>월별 교육비 관리</h2><button className="secondary" onClick={()=>navigate('대시보드')}>← 홈</button></div><div className="workflow-filters"><label>기준 월 <input type="month" value={month} onChange={e=>{setMonth(e.target.value);setSelectedPayments([]);}}/></label></div><div className="bulk-actions"><span>선택 {selectedPayments.length}명</span><button onClick={()=>setSelectedPayments(selectedPayments.length===students.length?[]:sortedStudents.map(s=>s.id))}>전체 선택/해제</button>{['완납','미납','면제'].map(v=><button key={v} disabled={!selectedPayments.length} onClick={()=>void bulkSave('cf.payments',selectedPayments,month,v)}>선택 {v}</button>)}<button disabled={!selectedPayments.length} onClick={()=>void bulkSave('cf.payments',selectedPayments,month,'')}>기록 삭제</button></div><div className="scroll"><table className="workflow-table"><thead><tr><th>선택</th><th>순번</th><th>학생번호</th><th>이름</th><th>월</th><th>상태</th><th>수정</th></tr></thead><tbody>{sortedStudents.map((s,i)=><tr key={s.id}><td><input type="checkbox" checked={selectedPayments.includes(s.id)} onChange={e=>setSelectedPayments(prev=>e.target.checked?[...prev,s.id]:prev.filter(id=>id!==s.id))}/></td><td>{studentOrder.get(s.id)}</td><td><b>{s.name}</b></td><td>{month}</td><td>{payments[key(s.id,month)]||'미기록'}</td><td>{status(payments,setPayments,'cf.payments',s.id,month,['완납','미납','면제'])}</td></tr>)}</tbody></table></div></div>}
</section></main>{editing&&<div className="overlay" onClick={()=>setEditing(null)}><div className="modal" onClick={e=>e.stopPropagation()}><h2>{editing.id?'학생 수정':'학생 등록'}</h2><p>등록한 정보는 시간표와 차량관리 화면에 연결됩니다.</p><div className="fields">{([['id','학생번호'],['name','이름'],['age','나이'],['phone','연락처'],['schedule','수업시간 (월2 수2 금2)'],['pickup','등원장소'],['pickupTime','등원시간 (13:30)'],['dropoff','하원장소'],['dropoffTime','하원시간 (15:00)']] as const).map(([field,label])=><label key={field}>{label}<input value={editing[field]} onChange={e=>setEditing({...editing,[field]:e.target.value})}/></label>)}</div><div className="modal-actions"><button onClick={()=>setEditing(null)}>취소</button><button className="primary" onClick={saveStudent}>저장하기</button></div></div></div>}</div>;
}
