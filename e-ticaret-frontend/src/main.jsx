import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './index.css' 
import { BrowserRouter } from 'react-router-dom'
// 2. EKSİK OLAN PARÇA BU 👇 (Bunu eklemezsen butonlar çalışmaz)
import "bootstrap/dist/js/bootstrap.bundle.min.js";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* v7 uyarılarını susturmak için flags ekledik */}
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)