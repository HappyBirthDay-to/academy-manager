import { useEffect, useMemo, useState } from 'react'; // 원본 시트 선택과 검색을 관리합니다.
import { supabase } from './supabase';
import * as XLSX from 'xlsx'; // 로그인한 사용자의 원본만 조회합니다.

type Archive = Record<string, unknown[][]>; // 원본의 모든 시트를 배열로 표시합니다.
type Props = { refresh: number }; // 업로드 후 다시 불러오기 위해 사용합니다.
export const OriginalWorkbook = ({ refresh }: Props) => { // 모든 시트를 읽기 전용 표로 보여줍니다.
  const [archive, setArchive] = useState<Archive>({}); // 시트 전체를 저장합니다.
  const [selected, setSelected] = useState(''); // 선택한 시트를 기억합니다.
  const [search, setSearch] = useState(''); // 검색어를 기억합니다.
  const [error, setError] = useState(''); // 조회 오류를 표시합니다.
  useEffect(() => { // 업로드 후 시트를 다시 조회합니다.
    let active = true; // 닫힌 화면의 상태 변경을 막습니다.
    void supabase.from('academy_shared_data').select('key,value').like('key','original.cells.%').order('key').then(({data,error:fetchError})=>{ // 원본 셀을 공용 테이블에서 조회합니다.
      if(!active)return; // 닫힌 화면은 갱신하지 않습니다.
      if(fetchError){setError(fetchError.message);return;} // 권한 오류를 보여줍니다.
      const next:Archive={}; // 원본 행·열을 재구성합니다.
      for(const item of data??[]){const m=/^original\.cells\.(.+)\.(\d{4})$/.exec(item.key);if(!m||!Array.isArray(item.value))continue;const rows=next[m[1]]??[];for(const cell of item.value){if(!cell||typeof cell!=='object'||!('c'in cell)||typeof cell.c!=='string')continue;const pos=XLSX.utils.decode_cell(cell.c);if(!rows[pos.r])rows[pos.r]=[];rows[pos.r][pos.c]='v'in cell?cell.v:'';}next[m[1]]=rows;} // 분할 셀을 원래 좌표에 배치합니다.
      setArchive(next);setSelected(current=>current in next?current:Object.keys(next)[0]??''); // 첫 시트를 선택합니다.
    }); // 조회를 완료합니다.
    return () => { active = false; }; // 불필요한 결과 반영을 막습니다.
  }, [refresh]); // 업로드 시점에 다시 조회합니다.
  const rows = useMemo(() => (archive[selected] ?? []).filter(row => Array.isArray(row) && (!search || row.some(cell => String(cell ?? '').includes(search)))), [archive, selected, search]); // 검색에 맞는 행만 표시합니다.
  const width = useMemo(() => Math.min(80, Math.max(1, ...rows.map(row => row.length))), [rows]); // 너무 넓은 시트는 화면에 맞춰 열을 제한합니다.
  return <section className="panel original-panel"> {/* 원본 시트 화면을 표시합니다. */}
    <h2>원본 엑셀 전체 조회</h2> {/* 원본 보관 상태를 확인할 수 있도록 합니다. */}
    <p>모든 시트의 표시값을 조회합니다. 저장된 원본 셀 값을 조회합니다. 다운로드 시 수식 일부는 유지되지만 서식·이미지는 복원되지 않습니다.</p> {/* 표시값과 실제 원본 파일을 구분합니다. */}
    {error && <p role="alert">{error}</p>} {/* 조회 오류가 있으면 표시합니다. */}
    {!Object.keys(archive).length ? <p>상단 '엑셀 업로드'에서 원본을 등록해 주세요.</p> : <> {/* 원본이 없을 때는 안내를 표시합니다. */}
      <div className="original-tools"> {/* 검색과 시트 선택을 가까이 배치합니다. */}
        <select aria-label="시트 선택" value={selected} onChange={event => setSelected(event.target.value)}>{Object.keys(archive).map(name => <option key={name}>{name}</option>)}</select> {/* 모든 시트를 선택할 수 있습니다. */}
        <input aria-label="내용 검색" placeholder="원본 내용 검색" value={search} onChange={event => setSearch(event.target.value)} /> {/* 모바일에서도 검색할 수 있습니다. */}
      </div> {/* 도구를 닫습니다. */}
      <p>{selected} · {rows.length.toLocaleString()}행</p> {/* 선택한 시트의 크기를 표시합니다. */}
      <div className="scroll original-scroll"><table><tbody>{rows.map((row, index) => <tr key={index}>{Array.from({ length: width }, (_, column) => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody></table></div> {/* 셀 순서를 유지해 표를 렌더링합니다. */}
    </>} {/* 조회 결과를 닫습니다. */}
  </section>; // 화면 반환을 종료합니다.
}; // 컴포넌트를 종료합니다.
