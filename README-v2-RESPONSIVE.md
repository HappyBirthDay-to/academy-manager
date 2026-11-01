# 성진 클래스 잠원점 v2.0 - 모바일·데스크톱 UI 개선

## 변경된 파일
- `src/App.tsx` : 상단 도구 막대와 학생·시간표 테이블 클래스 및 브랜드 로고 경로 적용
- `src/main.tsx` : 로그인 이미지 경로를 `academy-emblem-reference.png`로 변경, 신규 CSS 추가
- `src/redesign.css` : PC/모바일 반응형 화면 전체 재구성. 기존 `style.css`는 보존.
- `.gitignore` : macOS 시스템 파일 및 OAuth 비밀 파일 제외

## 적용
1. 기존 프로젝트 폴더를 백업합니다.
2. ZIP의 전체 프로젝트 파일을 기존 폴더에 덮어씁니다. **기존 `.env.local`은 유지**합니다.
3. `npm install` -> `npm run build` -> `npm run dev`를 실행합니다.
4. GitHub에 반영한 뒤 Render에서 빌드/배포합니다. Render에는 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 환경변수가 필요합니다.

## 의도한 모바일 동작
- 상단 월 선택은 전체 너비, 주요 업무 버튼은 2열로 표시
- 대시보드 4개 핵심 지표는 2열
- 학생 목록은 순번/이름/나이/전화/관리 등 중요 항목만 화면 너비 안에 표시. 감춰진 수업·등하원 정보는 PC 또는 학생 수정에서 확인
- 시간표는 각 요일 안에서 이름을 줄바꿈
- 출석·차량·교육비 업무 정보와 서버 기록의 저장 로직은 유지
- 로그인 로고는 실제 스프라이트 PNG로 표시

## 검증 범위 및 주의
패키지 설치가 실행 환경에서 시간 초과되어 **TypeScript/Vite 빌드는 검증하지 못했습니다.** 실제 환경에서 `npm run build`를 반드시 수행하세요. 학생 데이터와 로그인 권한은 Supabase RLS 정책으로 별도 보호해야 합니다. 공개 저장소에 `.env.local`, `client_secret.json`, 학생 개인정보 원본을 커밋하지 마세요.
