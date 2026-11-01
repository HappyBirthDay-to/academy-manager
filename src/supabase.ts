import { createClient } from '@supabase/supabase-js'; // 인증 요청에 공개 API 키를 포함하기 위해 공식 SDK를 사용합니다.
const url = import.meta.env.VITE_SUPABASE_URL?.trim(); // 주소가 누락되지 않았는지 확인합니다.
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim(); // 브라우저용 공개 키만 사용합니다.
if (!url || !key) throw new Error('Supabase URL 또는 Publishable Key가 없습니다. .env.local 및 Render 환경변수를 확인하세요.'); // 원인을 명확하게 표시합니다.
export const supabase = createClient(url, key, { auth: { flowType: 'pkce', detectSessionInUrl: true } }); // 인증 코드 교환을 보호합니다.
export const publicSupabaseKey = key; // 인증 URL의 공개 apikey 파라미터에만 사용합니다.
