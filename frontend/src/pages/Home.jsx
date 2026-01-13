import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const features = [
    {
      title: 'Client Management',
      description: 'Manage your clients and their information in one place',
      icon: '👥',
      link: '/clients',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Project Management',
      description: 'Create and manage content generation projects',
      icon: '📁',
      link: '/projects',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Content Generation',
      description: 'AI-powered blog posts, social content, and ads',
      icon: '✍️',
      link: '/projects',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Admin Setup',
      description: 'Configure API keys and integrations',
      icon: '⚙️',
      link: '/admin',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const stats = [
    { label: 'API Integrations', value: '9+', icon: '🔌' },
    { label: 'Content Types', value: '7', icon: '📝' },
    { label: 'AI Models', value: '3', icon: '🤖' },
    { label: 'Platforms', value: '6', icon: '📱' }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl border border-slate-700">
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome to Tapverse Content Automation
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Automate SEO content, social media posts, ads, and AI avatar videos for your clients
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/clients"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
          <Link
            to="/admin"
            className="px-6 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors"
          >
            Setup APIs
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-slate-900 rounded-xl p-6 border border-slate-800 text-center">
            <span className="text-3xl mb-2 block">{stat.icon}</span>
            <div className="text-3xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <Link
            key={index}
            to={feature.link}
            className="group bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-slate-600 transition-all"
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} mb-4`}>
              <span className="text-2xl">{feature.icon}</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
              {feature.title}
            </h3>
            <p className="text-gray-400">
              {feature.description}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick Start Guide */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h2 className="text-2xl font-bold text-white mb-4">🚀 Quick Start Guide</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
            <div>
              <h3 className="text-white font-medium">Configure API Keys</h3>
              <p className="text-gray-400 text-sm">Go to Admin Setup and add your API keys for Claude, HeyGen, and other services</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
            <div>
              <h3 className="text-white font-medium">Add Clients</h3>
              <p className="text-gray-400 text-sm">Create client profiles with their company information and target audience</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
            <div>
              <h3 className="text-white font-medium">Create Projects</h3>
              <p className="text-gray-400 text-sm">Start content generation projects with keywords and competitors</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</span>
            <div>
              <h3 className="text-white font-medium">Generate Content</h3>
              <p className="text-gray-400 text-sm">Let AI create blog posts, social content, ads, and videos automatically</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
