import {createClient} from '@supabase/supabase-js'; // 서버 인증과 DB를 사용합니다.
export const supabase=createClient(import.meta.env.VITE_SUPABASE_URL as string,import.meta.env.VITE_SUPABASE_ANON_KEY as string); // 서비스 키가 아닌 공개 키를 사용합니다.
