import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// import bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // สำหรับ Modal

import "sweetalert2/dist/sweetalert2.min.css";

createRoot(document.getElementById('root')).render(
    <App />,
)
