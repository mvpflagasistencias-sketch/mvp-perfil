import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import { GoogleOAuthProvider } from '@react-oauth/google' // 1. Importa esto
import './index.css'
import App from './App.jsx'

// 2. Aquí va tu Client ID que copiaste
const CLIENT_ID = "562921795217-unpktkr53aae2fu2s4haklakjfufdtji.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={CLIENT_ID}> {/* 3. Envuelve tu App */}
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)