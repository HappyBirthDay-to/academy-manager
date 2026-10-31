# 성진 클래스 잠원 v0.3

## 안전한 초기 설정
1. Supabase 프로젝트 생성 → SQL Editor에서 `supabase.sql` 실행.
2. Authentication > Users에서 관리자 계정 생성. **공통 초기 비밀번호를 사용하지 마세요.**
3. Authentication > URL Configuration에 실제 Render 주소 등록.
4. `.env.example`을 `.env`로 복사하고 Supabase Project URL과 **공개 키(anon/publishable)** 입력. `service_role` 키 금지.
5. `npm install && npm run build`로 빌드, Render Static Site Publish Directory `dist`.
6. Render Environment에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 등록 후 재배포.
7. 로그인 후 `엑셀 업로드`에서 원본을 직접 선택. GitHub에 원본 업로드 금지.

## 범위와 제한
- 원본 11개 시트의 **셀 값**을 계정별 데이터베이스에 보관하고 원본 다운로드 가능. 수식/서식/매크로는 보존하지 않습니다.
- `입관원서`의 학생번호, 이름, 연락처, 요일별 시간은 학생 화면으로 변환합니다.
- 출석/차량/교육비 원본 시트는 저장되지만 **업무 화면의 개별 기록으로 완전히 이관되지 않았습니다**. 화면의 신규 수정 내역은 별도로 저장됩니다.
- 기존 학생 목록을 업로드 시 교체하므로 업로드 전 백업하세요.
- Supabase 무료 플랜에는 사용량/보존 정책 제약이 있습니다. 운영 전 백업, MFA, 개인정보 처리 방침, 권한 점검이 필요합니다.
- 로그인 및 RLS만으로 보안이 절대 보장되는 것은 아닙니다. 실제 운영 전 보안 점검이 필요합니다.
