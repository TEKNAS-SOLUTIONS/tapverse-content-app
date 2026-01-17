import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { clientsAPI, projectsAPI } from '../services/api';
import { useState, useEffect } from 'react';

function Breadcrumb() {
  const location = useLocation();
  const params = useParams();
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateBreadcrumbs();
  }, [location.pathname, params]);

  const generateBreadcrumbs = async () => {
    const path = location.pathname;
    const crumbs = [{ label: 'Home', path: '/' }];

    // Parse path and build breadcrumbs
    if (path.startsWith('/clients')) {
      crumbs.push({ label: 'Clients', path: '/clients' });
      if (params.clientId) {
        try {
          const res = await clientsAPI.getById(params.clientId);
          if (res.data.success) {
            crumbs.push({ label: res.data.data.company_name, path: `/clients/${params.clientId}` });
          }
        } catch (err) {
          crumbs.push({ label: 'Client', path: `/clients/${params.clientId}` });
        }
      }
    } else if (path.startsWith('/projects')) {
      crumbs.push({ label: 'Projects', path: '/projects' });
      if (params.projectId) {
        try {
          const res = await projectsAPI.getById(params.projectId);
          if (res.data.success) {
            crumbs.push({ label: res.data.data.project_name, path: `/projects/${params.projectId}` });
            
            // Check for tab in hash or query
            const hash = location.hash;
            const searchParams = new URLSearchParams(location.search);
            const tab = hash.replace('#', '') || searchParams.get('tab');
            
            if (tab) {
              const tabLabels = {
                'seo-strategy': 'SEO Strategy',
                'google-ads-strategy': 'Google Ads Strategy',
                'facebook-ads-strategy': 'Facebook Ads Strategy',
                'ideas': 'Article Ideas',
                'generate': 'Generate Content',
                'scheduling': 'Content Scheduling',
                'email': 'Email Newsletter',
              };
              if (tabLabels[tab]) {
                crumbs.push({ label: tabLabels[tab], path: null });
              }
            }
          }
        } catch (err) {
          crumbs.push({ label: 'Project', path: `/projects/${params.projectId}` });
        }
      }
    } else if (path.startsWith('/analytics')) {
      crumbs.push({ label: 'Analytics', path: '/analytics' });
      if (params.clientId) {
        try {
          const res = await clientsAPI.getById(params.clientId);
          if (res.data.success) {
            crumbs.push({ label: res.data.data.company_name, path: `/analytics/client/${params.clientId}` });
            
            if (params.projectId) {
              try {
                const res2 = await projectsAPI.getById(params.projectId);
                if (res2.data.success) {
                  crumbs.push({ label: res2.data.data.project_name, path: null });
                }
              } catch (err) {
                crumbs.push({ label: 'Project', path: null });
              }
            }
          }
        } catch (err) {
          crumbs.push({ label: 'Client', path: `/analytics/client/${params.clientId}` });
        }
      }
    } else if (path.startsWith('/admin-chat')) {
      crumbs.push({ label: 'Admin Chat', path: '/admin-chat' });
    } else if (path.startsWith('/admin')) {
      crumbs.push({ label: 'Settings', path: '/admin' });
    }

    setBreadcrumbs(crumbs);
    setLoading(false);
  };

  if (loading || breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumb on home page or while loading
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-gray-400">/</span>}
          {crumb.path ? (
            <Link
              to={crumb.path}
              className="hover:text-orange-500 transition-colors text-gray-600"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{crumb.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export default Breadcrumb;
