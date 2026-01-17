import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
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
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectId" element={<ProjectDetail />} />
          <Route path="/clients/:clientId/projects" element={<Projects />} />
          <Route path="/admin" element={<AdminSetup />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/analytics/client/:clientId" element={<Analytics />} />
          <Route path="/analytics/client/:clientId/project/:projectId" element={<Analytics />} />
          <Route path="/keyword-analysis" element={<KeywordAnalysis />} />
          <Route path="/connections" element={<Connections />} />
          <Route path="/connections/google/callback" element={<GoogleOAuthCallback />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

