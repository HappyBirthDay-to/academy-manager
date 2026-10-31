import React from 'react'; // 개발 중 상태 관련 오류를 조기에 발견합니다.
import { createRoot } from 'react-dom/client'; // 화면 진입점을 통일합니다.
import { App } from './App'; // 모든 기능을 앱에 연결합니다.
import './style.css'; // 동일한 화면 스타일을 적용합니다.
createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>); // 안정적인 렌더링을 위해 엄격 모드를 사용합니다.
