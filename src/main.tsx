import React,{useEffect,useState} from 'react'; // 인증 상태를 반영합니다.
import {createRoot} from 'react-dom/client'; // 앱을 렌더링합니다.
import {App} from './App'; // 로그인한 사용자만 앱에 진입합니다.
import {supabase} from './supabase'; // 로그인 서버를 연결합니다.
import './style.css'; // 기존 UI를 유지합니다.
function Root(){ // 비로그인 사용자의 화면을 차단합니다.
const [ready,setReady]=useState(false);const [signed,setSigned]=useState(false);const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [message,setMessage]=useState('');
useEffect(()=>{void supabase.auth.getSession().then(({data})=>{setSigned(Boolean(data.session));setReady(true);});const {data}=supabase.auth.onAuthStateChange((_event,session)=>setSigned(Boolean(session)));return()=>data.subscription.unsubscribe();},[]);
const login=async()=>{const {error}=await supabase.auth.signInWithPassword({email,password});if(error)setMessage('로그인 실패: 계정을 확인하세요.');};
const reset=async()=>{if(!email){setMessage('이메일을 먼저 입력하세요.');return;}const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin});setMessage(error?'재설정 요청 실패':'재설정 메일을 확인하세요.');};
if(!ready)return <div className="login-page">인증 확인 중...</div>;if(signed)return <App/>;
return <div className="login-page"><form className="login-card" onSubmit={e=>{e.preventDefault();void login();}}><h1>ClassFlow</h1><p>학원 운영 관리자 로그인</p><label>이메일<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>비밀번호<input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="primary" type="submit">로그인</button><button type="button" onClick={()=>void reset()}>비밀번호 재설정</button><small>{message}</small><p>관리자 계정은 Supabase에서 별도 생성하세요.</p></form></div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><Root/></React.StrictMode>); // 로그인 상태에 맞는 화면을 표시합니다.
