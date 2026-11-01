import React, { useEffect, useState } from 'react'; // 인증 상태가 바뀔 때 화면을 즉시 갱신합니다.
import { createRoot } from 'react-dom/client'; // React 앱을 브라우저에 표시합니다.
import { App } from './App'; // 인증된 사용자에게만 업무 화면을 보여줍니다.
import { supabase, publicSupabaseKey } from './supabase'; // 기존 Supabase 프로젝트 연결을 유지합니다.
import './style.css'; // 기존 반응형 디자인을 유지합니다.

function Root() { // 카카오 인증과 화면 전환을 한 곳에서 관리합니다.
  const [ready, setReady] = useState(false); // 인증 확인 전에 개인정보 화면이 표시되지 않도록 합니다.
  const [signed, setSigned] = useState(false); // 로그인 세션 존재 여부에 따라 화면을 구분합니다.
  const [loading, setLoading] = useState(false); // 중복 로그인 요청을 막습니다.
  const [message, setMessage] = useState(''); // 로그인 오류를 사용자에게 안내합니다.
  useEffect(() => { // 새로고침 및 카카오 인증 복귀 시 세션을 다시 확인합니다.
    let active = true; // 화면이 사라진 뒤 상태 갱신을 막습니다.
    void supabase.auth.getSession().then(({ data, error }) => { // 기존 세션이 있는지 서버 SDK로 확인합니다.
      if (!active) return; // 이미 해제된 컴포넌트의 상태는 바꾸지 않습니다.
      setSigned(Boolean(data.session)); // 세션이 있을 때만 앱을 표시합니다.
      setMessage(error?.message ?? ''); // 세션 확인 실패 이유를 보여줍니다.
      setReady(true); // 확인 완료 후 로그인 화면을 표시합니다.
    }); // 최초 인증 확인을 완료합니다.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => { // 카카오 인증 복귀와 로그아웃을 반영합니다.
      if (active) setSigned(Boolean(session)); // 살아 있는 화면만 갱신합니다.
    }); // 인증 상태 구독을 등록합니다.
    return () => { active = false; data.subscription.unsubscribe(); }; // 불필요한 구독을 해제합니다.
  }, []); // 첫 진입 때 한 번만 구독합니다.
  const login = async () => { // 버튼 클릭 시 카카오 로그인 페이지로 이동합니다.
    setLoading(true); // 중복 요청을 방지합니다.
    setMessage(''); // 이전 오류 메시지를 지웁니다.
    const { data, error } = await supabase.auth.signInWithOAuth({ // SDK가 OAuth 인증 URL을 생성하도록 합니다.
      provider: 'kakao', // 카카오 인증만 사용합니다.
      options: { redirectTo: window.location.origin, skipBrowserRedirect: true }, // API 키를 추가한 뒤 이동하기 위해 자동 이동을 끕니다.
    }); // 인증 URL 생성을 마칩니다.
    if (error || !data.url) { setMessage(error?.message ?? '카카오 인증 URL 생성 실패'); setLoading(false); return; } // 오류가 있으면 이동하지 않습니다.
    const target = new URL(data.url); // SDK의 인증 파라미터를 유지합니다.
    if (!target.searchParams.has('apikey')) target.searchParams.set('apikey', publicSupabaseKey); // Supabase 게이트웨이에서 요구하는 공개 키를 포함합니다.
    window.location.assign(target.toString()); // 실제 카카오 인증으로 이동합니다.
  }; // 카카오 로그인 처리를 마칩니다.
  if (!ready) return <div className="login-page">로그인 상태를 확인하고 있어요...</div>; // 확인 중에는 업무 데이터를 숨깁니다.
  if (signed) return <App />; // 인증이 완료된 경우에만 업무 화면을 렌더링합니다.
  return <div className="login-page"><section className="login-card kakao-login-card"><div className="login-mark"><img src="/taekwondo-kick.png" alt="태권도 발차기 캐릭터" /></div><h1>성진 클래스 잠원점</h1><p>학생 관리부터 출석, 차량, 교육비까지<br />하나의 공간에서 관리하세요.</p><button className="kakao-login-button" type="button" disabled={loading} onClick={() => void login()}><span aria-hidden="true">●</span>{loading ? '카카오 연결 중...' : '카카오로 시작하기'}</button>{message && <p className="login-error" role="alert">{message}</p>}<small>카카오 계정으로 안전하게 로그인합니다.</small><p className="login-disclaimer">현재 버전은 로그인한 계정별 데이터가 분리됩니다.<br />4인 공동 접근 및 관리자 승인 기능은 다음 업데이트에서 제공됩니다.</p></section></div>; // 비로그인 사용자에게만 카카오 로그인 버튼을 보여줍니다.
} // 루트 컴포넌트를 종료합니다.
createRoot(document.getElementById('root')!).render(<React.StrictMode><Root /></React.StrictMode>); // 개발 중 인증 상태 오류를 확인하기 쉽게 합니다.
