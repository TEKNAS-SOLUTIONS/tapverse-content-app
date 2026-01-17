import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const features = [
    {
      title: 'Client Management',
      description: 'Manage your clients and their information in one place',
      link: '/clients',
    },
    {
      title: 'Project Management',
      description: 'Create and manage content generation projects',
      link: '/projects',
    },
    {
      title: 'Content Generation',
      description: 'AI-powered blog posts, social content, and ads',
      link: '/projects',
    },
    {
      title: 'Admin Setup',
      description: 'Configure API keys and integrations',
      link: '/admin',
    }
  ];

  const stats = [
    { label: 'API Integrations', value: '9+' },
    { label: 'Content Types', value: '7' },
    { label: 'AI Models', value: '3' },
    { label: 'Platforms', value: '6' }
  ];

  // Apple-style SVG icons
  const UsersIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );

  const FolderIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );

  const DocumentIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  const GearIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const PlugIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <h1 className="text-5xl font-semibold text-gray-900 mb-4 tracking-tight">
          Welcome to Tapverse Content Automation
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Automate SEO content, social media posts, ads, and AI avatar videos for your clients
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/clients"
            className="btn-primary"
          >
            Get Started
          </Link>
          <Link
            to="/admin"
            className="btn-secondary"
          >
            Setup APIs
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="card text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-50 mb-4">
              <PlugIcon />
            </div>
            <div className="text-4xl font-semibold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature, index) => {
          const icons = [UsersIcon, FolderIcon, DocumentIcon, GearIcon];
          const IconComponent = icons[index] || FolderIcon;
          return (
            <Link
              key={index}
              to={feature.link}
              className="card-hover group"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-50 text-orange-600 mb-4">
                <IconComponent />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Quick Start Guide */}
      <div className="card">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Start Guide</h2>
        <div className="space-y-6">
          {[
            {
              step: '1',
              title: 'Configure API Keys',
              description: 'Go to Settings and add your API keys for Claude, HeyGen, and other services'
            },
            {
              step: '2',
              title: 'Add Clients',
              description: 'Create client profiles with their company information and target audience'
            },
            {
              step: '3',
              title: 'Create Projects',
              description: 'Start content generation projects with keywords and competitors'
            },
            {
              step: '4',
              title: 'Generate Content',
              description: 'Let AI create blog posts, social content, ads, and videos automatically'
            }
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-medium text-sm">
                {item.step}
              </span>
              <div>
                <h3 className="text-gray-900 font-medium mb-1">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
