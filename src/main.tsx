import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { AdminAuthProvider } from './contexts/AdminAuthContext'

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <AdminAuthProvider>
      <App />
    </AdminAuthProvider>
  </AuthProvider>
);
