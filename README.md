# 성진 클래스 잠원점 v0.6

## 포함 사항
- 카카오 OAuth 로그인: Supabase PKCE 사용, `apikey` 누락 오류에 대비해 인증 URL에 **공개** 키를 전달합니다.
- 태권도 발차기 아이콘, PC/모바일 반응형 UI
- 학생·시간표·출석·차량·교육비의 **기존 v0.5 기능**
- 원본 엑셀 11개 시트 조회(표시값), 원본 `.xlsx` 전체 파일 비공개 업로드/다운로드
- `private-import/original-academy.xlsx` : 원본 파일의 **변형 없는 사본**. `.gitignore`로 GitHub 업로드 제외.

## 설치
1. `npm install` → `npm run build` → `npm run dev`.
2. 기존 `.env.local` 유지: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (Publishable Key).
3. Supabase SQL Editor에서 **`supabase-storage.sql` 최초 1회 실행** (기존 `supabase.sql` 재실행하지 않음).
4. Supabase Authentication > Providers > Kakao에서 Client ID/Secret 설정, 카카오 REST API 키에 Supabase `/auth/v1/callback` 로그인 리다이렉트 등록.
5. 로그인 후 **엑셀 업로드** 버튼으로 `private-import/original-academy.xlsx`를 선택합니다. 원본 11개 시트가 비공개 버킷에 저장됩니다.
6. 원본 시트 메뉴에서 표시값을 조회하고, 원본 다운로드로 실제 원본 파일을 복원합니다.

## 중요한 제한
- **원본 파일은 ZIP에 포함되지만 GitHub/Render 정적 사이트에는 포함시키면 안 됩니다.** `private-import/`는 `.gitignore`로 제외되며 빌드에서 사용하지 않습니다.
- 학생·출석·차량·교육비를 각 업무 화면으로 자동 변환하는 작업은 아직 미완료입니다. **원본 보존 ≠ 업무 데이터 이관 완료**입니다.
- 카카오 로그인 성공자 누구나 자신의 계정 공간을 생성할 수 있습니다. 현재 `academy_data` RLS는 **계정별 격리**만 합니다. 4인 승인·공유는 미구현입니다. 실제 학생정보를 운영용으로 올리기 전 승인 기능과 보안 검증이 필요합니다.
- `private-import/` 폴더를 별도 Public GitHub 저장소에 수동 업로드하지 마세요.
- 이전에 스크린샷에 노출된 카카오 Client Secret은 재발급하세요.
- Supabase Storage 무료 용량과 브라우저 메모리 사용량 제한이 있습니다.
