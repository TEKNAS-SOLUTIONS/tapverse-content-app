import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectsAPI, clientsAPI } from '../services/api';
import ContentTypeCards from '../components/projects/ContentTypeCards';
import SEOBlogWorkflow from '../components/content/seo-blog/SEOBlogWorkflow';
import ProgrammaticSEO from '../components/content/programmatic-seo/ProgrammaticSEO';

function ProjectDetail() {
  const { projectId, clientId } = useParams();
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContentType, setSelectedContentType] = useState(null);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const projectRes = await projectsAPI.getById(projectId);
      if (projectRes.data.success) {
        setProject(projectRes.data.data);
        
        // Load client info
        const clientIdToUse = clientId || projectRes.data.data.client_id;
        const clientRes = await clientsAPI.getById(clientIdToUse);
        if (clientRes.data.success) {
          setClient(clientRes.data.data);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-400">Loading project...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-300">Error: {error}</p>
          <Link 
            to={clientId ? `/clients/${clientId}` : '/clients'} 
            className="mt-4 inline-block text-blue-400 hover:text-blue-300"
          >
            ← Back
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">Project not found</p>
        <Link 
          to={clientId ? `/clients/${clientId}` : '/clients'} 
          className="mt-4 inline-block text-blue-400 hover:text-blue-300"
        >
          ← Back
        </Link>
      </div>
    );
  }

  const projectTypes = project.project_types || (project.project_type ? [project.project_type] : []);

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <div className="flex justify-between items-start">
          <div>
            <Link 
              to={clientId ? `/clients/${clientId}` : '/clients'} 
              className="text-blue-400 hover:text-blue-300 mb-4 inline-block"
            >
              ← Back to {client ? client.company_name : 'Client'}
            </Link>
            <h1 className="text-3xl font-bold text-white">{project.project_name}</h1>
            {client && (
              <p className="mt-1 text-gray-400">
                Client: <span className="text-blue-400">{client.company_name}</span>
              </p>
            )}
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            project.status === 'completed' ? 'bg-green-900 text-green-200' :
            project.status === 'processing' ? 'bg-yellow-900 text-yellow-200' :
            'bg-slate-700 text-gray-300'
          }`}>
            {project.status || 'active'}
          </span>
        </div>
      </div>

      {/* Content Type Cards - Horizontal at top */}
      {!selectedContentType && (
        <ContentTypeCards
          projectTypes={projectTypes}
          onSelectType={setSelectedContentType}
        />
      )}

      {/* Content Workflow */}
      {selectedContentType === 'seo_blog' && (
        <div>
          <button
            onClick={() => setSelectedContentType(null)}
            className="mb-4 text-blue-400 hover:text-blue-300"
          >
            ← Back to Content Types
          </button>
          <SEOBlogWorkflow
            projectId={projectId}
            clientId={client?.id}
            project={project}
            client={client}
          />
        </div>
      )}

      {selectedContentType === 'programmatic_seo' && (
        <div>
          <button
            onClick={() => setSelectedContentType(null)}
            className="mb-4 text-blue-400 hover:text-blue-300"
          >
            ← Back to Content Types
          </button>
          <ProgrammaticSEO
            projectId={projectId}
            clientId={client?.id}
            project={project}
            client={client}
          />
        </div>
      )}
    </div>
  );
}

export default ProjectDetail;
