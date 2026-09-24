import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';

// Placeholder Dashboard until Phase 6/7
const PlaceholderDashboard = () => (
  <div className="min-h-screen bg-[#0a0a0f] text-slate-200 flex items-center justify-center flex-col gap-4">
      <h1 className="text-2xl font-bold text-indigo-400">Dashboard</h1>
      <p className="text-slate-400">Welcome to the application!</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<PlaceholderDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
