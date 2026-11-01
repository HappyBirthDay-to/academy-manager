# 성진 클래스 잠원점 v1.0 적용 안내

- 기존 프로젝트에서 `.env.local`, `.git` 및 로컬에만 있는 변경사항을 백업하세요.
- 이 배포 ZIP에는 학생 원본 엑셀과 비밀키가 포함되지 않습니다.
- `public/academy-banner.png`는 선택한 1번 시안의 배너 부분을 추출한 이미지입니다.
- Supabase 테이블은 `academy_shared_data`이며 `cf.students` 배열을 읽습니다.
- 기존에 확인한 RLS 정책 4개는 유지합니다. 다만 `authenticated` 전체 허용이므로 승인된 관리자 4명만 접근하도록 운영 전에 제한해야 합니다.
- **중요**: GitHub Public 저장소에는 이미 `.env.local`과 `private-import/original-academy.xlsx`가 추적되어 있었습니다. 저장소 Private 전환, Git 이력에서 개인정보 제거 및 관련 키 점검이 필요합니다.
- 기존 GitHub 저장소의 `.git`은 ZIP으로 대체하지 마세요.
- 실행: `npm install && npm run build && npm run dev`
- 현재 대시보드 통계는 실제 저장된 `cf.students`, `cf.attendance`, `cf.payments`만 사용하며 미이관 출석·교육비는 임의 값으로 채우지 않습니다.
- 엑셀 백업은 업무 데이터를 내보내며 원본 다운로드는 저장된 셀 데이터 재구성본입니다. 서식·이미지까지 원본과 동일한 파일은 아닙니다.
