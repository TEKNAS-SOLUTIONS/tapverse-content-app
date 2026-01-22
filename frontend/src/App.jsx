import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Clients from './pages/Clients';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import AdminSetup from './pages/AdminSetup';
import Analytics from './pages/Analytics';
import KeywordAnalysis from './pages/KeywordAnalysis';
import Connections from './pages/Connections';
import GoogleOAuthCallback from './pages/GoogleOAuthCallback';

function App() {
  return (
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
  );
}

export default App;

