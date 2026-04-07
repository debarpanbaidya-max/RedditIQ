import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useStore from './store/useStore';
import Landing from './pages/Landing';
import Research from './pages/Research';
import Analytics from './pages/Analytics';
import Defense from './pages/Defense';
import Layout from './components/Layout/Layout';

function ProtectedRoute({ children }) {
  const { user, authLoading } = useStore();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading RedditIQ...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const fetchUser = useStore(s => s.fetchUser);

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Layout /></ProtectedRoute>
        }>
          <Route index element={<Navigate to="research" replace />} />
          <Route path="research"  element={<Research />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="defense"   element={<Defense />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
