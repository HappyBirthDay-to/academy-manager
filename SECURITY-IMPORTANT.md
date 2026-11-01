# 긴급 보안 조치

현재 GitHub 공개 저장소에 `.env.local`과 `private-import/original-academy.xlsx`가 이미 커밋되어 있습니다. `.gitignore`는 과거 기록을 삭제하지 않습니다.

1. 즉시 GitHub 저장소를 Private으로 전환하세요.
2. 노출된 엑셀 파일의 개인정보 접근 범위를 점검하고, 이력을 포함한 삭제 조치를 진행하세요.
3. 키가 공개됐으므로 가능한 키를 교체하고 Render 환경변수도 갱신하세요. Supabase Publishable Key는 공개용이지만 RLS가 안전한지 별도 검증이 필요합니다.
4. 현재 학원 공용 테이블 RLS가 모든 인증 사용자에게 허용된다면 실제 학생 정보 사용 전 승인된 관리자 목록 기반 정책으로 변경해야 합니다.
5. 이 ZIP에는 `.env.local`, 원본 XLSX, 개인정보 SQL, IDE 메타데이터가 없습니다.
