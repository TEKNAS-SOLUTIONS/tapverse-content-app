import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
<<<<<<< HEAD
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
=======
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
>>>>>>> 81af4489c65415405e981b88b6e6dc07cb6c9104
import Home from './pages/Home';
import Clients from './pages/Clients';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import AdminSetup from './pages/AdminSetup';
import Analytics from './pages/Analytics';
import KeywordAnalysis from './pages/KeywordAnalysis';
import Connections from './pages/Connections';
import GoogleOAuthCallback from './pages/GoogleOAuthCallback';
import Login from './pages/Login';
import Chat from './pages/Chat';
import AdminChat from './pages/AdminChat';
import MyAvatars from './pages/MyAvatars';

function App() {
  return (
<<<<<<< HEAD
    <ErrorBoundary>
      <Router>
        <Layout>
          <Toaster position="top-right" />
          <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/home" element={<Home />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:clientId" element={<ClientDetail />} />
          <Route path="/clients/:clientId/projects" element={<ClientDetail />} />
          <Route path="/clients/:clientId/projects/:projectId" element={<ProjectDetail />} />
          <Route path="/settings" element={<AdminSetup />} />
          <Route path="/connections/google/callback" element={<GoogleOAuthCallback />} />
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
=======
    <ToastProvider>
      <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/:projectId" element={<ProjectDetail />} />
                  <Route path="/clients/:clientId/projects" element={<Projects />} />
                  <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminSetup /></ProtectedRoute>} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/analytics/client/:clientId" element={<Analytics />} />
                  <Route path="/analytics/client/:clientId/project/:projectId" element={<Analytics />} />
                  <Route path="/keyword-analysis" element={<KeywordAnalysis />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/admin-chat" element={<ProtectedRoute requiredRole="admin"><AdminChat /></ProtectedRoute>} />
                  <Route path="/my-avatars" element={<MyAvatars />} />
                  <Route path="/connections" element={<Connections />} />
                  <Route path="/connections/google/callback" element={<GoogleOAuthCallback />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
    </ToastProvider>
>>>>>>> 81af4489c65415405e981b88b6e6dc07cb6c9104
  );
}

export default App;

