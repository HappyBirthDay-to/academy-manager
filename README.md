# 성진 클래스 잠원 v0.5 — 카카오 로그인

## 포함 기능
- 카카오 OAuth 전용 로그인 (기존 이메일/비밀번호 폼 제거)
- 대시보드, 학생 등록/수정/삭제, 주간 시간표, 출석, 차량, 교육비
- 엑셀 업로드, 운영 데이터 다운로드, 원본 셀 값 다운로드
- Supabase `academy_data` 테이블에 사용자별 저장
- Render Static Site 배포 가능

## 중요한 한계
- **실제 학생 개인정보는 ZIP/소스/GitHub에 포함하지 않습니다.** 로그인 후 원본 엑셀을 직접 업로드하세요.
- 현재 엑셀 가져오기는 `입관원서` 시트의 일부 필드만 학생 목록으로 변환합니다. 출석·차량·교육비 원본은 셀 값 아카이브만 보관하며 화면 자동 반영은 아직 구현되지 않았습니다.
- 원본 다운로드는 서식/수식이 보존되지 않습니다. 원본 파일을 따로 백업하세요.
- 기존 `academy_data` RLS는 **계정별 데이터 격리**입니다. 카카오로 로그인한 모든 사용자가 자기 데이터 공간을 생성할 수 있으며, 4명 공동 관리·승인 기능은 아직 없습니다.
- **실제 학생 개인정보 업로드는 관리자 허용 목록과 RLS를 적용한 후 진행하세요.** 이 버전은 테스트용입니다.
- 빌드 및 실기기 테스트는 완료되지 않았습니다.

## 설정
1. Kakao Developers: REST API 키의 카카오 로그인 Redirect URI에 `https://<project-ref>.supabase.co/auth/v1/callback` 등록, 카카오 로그인 활성화, Client Secret 설정.
2. Supabase Authentication → Providers → Kakao: REST API 키(Client ID), Client Secret 입력.
3. Supabase Authentication → URL Configuration: 로컬 주소 및 실제 Render 주소 허용.
4. 기존 `academy_data` 테이블과 RLS 유지. `supabase.sql`을 재실행하지 마세요.
5. `.env.local`을 프로젝트 루트에 작성 (아래 예시 참고).
6. `npm install` → `npm run dev` → `npm run build`.
7. Render Environment에도 같은 VITE_* 값 입력 후 재배포.

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_KEY
```

**주의:** `sb_secret_...`와 카카오 Client Secret은 프론트엔드/깃에 넣지 마세요.

## Git
기존 프로젝트의 `.git`과 `.env.local`을 유지하고 새 소스만 병합하세요. 원격 브랜치 충돌이 해결되지 않았다면 강제 push하지 마세요.
