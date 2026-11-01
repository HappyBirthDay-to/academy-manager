성진 클래스 잠원점 SQL 분할 실행 안내

1. Supabase SQL Editor에서 기존 academy_shared_data 테이블을 확인하세요.
2. 01.sql부터 38.sql까지 순서대로 하나씩 붙여넣고 Run을 누르세요.
3. 이미 테이블이 생성된 경우 CREATE TABLE을 다시 실행할 필요가 없습니다.
4. 99-verify.sql 실행: stored_keys=38, student_count=189가 예상됩니다.
5. 각 SQL은 같은 key에 UPSERT하므로 재실행 시 해당 key의 기존 변경 내용을 덮어씁니다.
6. 파일에는 실제 학생 개인정보가 포함되어 있으니 공개 GitHub/Render에 올리지 마세요.
7. 이 파일은 기존 RLS 정책을 수정하지 않습니다. 승인된 직원만 접근하도록 정책을 검증해야 합니다.
8. SQL로 저장한 뒤 웹앱 조회 테이블이 academy_shared_data인지 별도 확인해야 합니다.
