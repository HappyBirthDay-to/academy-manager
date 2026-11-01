# Render 배포 안내 (v1.2)

1. 기존 GitHub 저장소에 파일을 반영합니다. `.env.local`은 업로드하지 않습니다.
2. Render의 기존 Static Site에 연결된 저장소와 브랜치를 확인합니다.
3. Build Command: `npm install && npm run build`
4. Publish Directory: `dist`
5. Environment에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`를 설정합니다. 두 번째 값은 공개 가능한 publishable/anon 키만 사용합니다.
6. Render의 Rewrite 규칙 `/*` → `/index.html`을 유지합니다.
7. Supabase > Authentication > URL Configuration에서 Site URL을 Render 실제 주소로, Redirect URLs에 Render 주소와 로컬 주소를 추가합니다.
8. Google Cloud OAuth 클라이언트의 Authorized redirect URI는 Supabase가 표시하는 `/auth/v1/callback` 주소를 유지합니다.
9. Render 재배포 후 Google 로그인, 학생 조회, 전화 연결, 엑셀 다운로드를 실제 도메인에서 점검합니다.

주의: `cf.students` 원본은 자동으로 수정하지 않습니다. 전화번호는 화면/내보내기에서 보정하고, 학생 고유 ID는 출석·교육비 참조 무결성을 위해 유지합니다. 공개 인터넷 배포 전 RLS와 사용자 허용 목록을 반드시 점검하세요.
