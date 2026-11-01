# 성진 클래스 잠원점 v0.7

React + TypeScript + Vite + Supabase Google OAuth.

## 설치
1. 기존 `.env.local` 유지 (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
2. `npm install && npm run build && npm run dev`
3. Supabase의 `academy_shared_data` 테이블에 기존 분할 SQL 데이터가 있어야 합니다.
4. Render Static Site: Build `npm install && npm run build`, Publish `dist`.

## 데이터
- `cf.students`를 공용 테이블에서 조회합니다.
- `original.cells.<시트명>.<번호>`를 복원하여 원본 시트 조회와 엑셀 다운로드를 제공합니다.
- 원본 셀 다운로드는 원본 `.xlsx`의 서식·그림·매크로·정의된 이름을 복원하지 못합니다. 원본 파일은 별도 보관하세요.
- 출석·교육비·차량 원본 시트를 실제 업무 레코드로 완전 변환하지 않았습니다.
- 원본 학생 개인정보는 ZIP에 포함하지 않았습니다.

## 중요 보안
현재 공용 테이블의 RLS 정책이 모든 인증 사용자에게 허용되어 있다면 실제 운영에 적합하지 않습니다. 반드시 승인된 직원만 접근하도록 정책을 제한하세요. Google 인증 자체는 직원 승인 기능이 아닙니다.
