# v1.4 변경 파일 적용

기존 프로젝트에서 src/App.tsx, src/style.css를 교체하고 public/academy-emblem-reference.png를 추가합니다. .env.local, Supabase 데이터 및 인증 설정은 변경하지 않습니다.

- 로고: 사용자가 제공한 첫 번째 이미지 그대로 사용 (새로 그린 로고가 아님)
- 학생관리/교육비: 학생번호 열 숨김, 순번 유지
- 출석관리: 기준 월 변경 시 조회 날짜도 해당 월 1일로 이동. 기존 출석 기록은 자동 생성하지 않음
- 중요: 원본 엑셀의 과거 출석기록이 cf.attendance에 변환 저장된 것인지는 별도 확인 필요

WebStorm에서 npm run build, npm run dev를 실행해 검증하고 이후 Render 배포하세요.
