import React, { useState } from 'react';
import { Settings, Plus, Code, Zap, AlertTriangle, Info } from 'lucide-react';

const RulesEngine: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'rules' | 'templates'>('overview');

  const comingSoonFeatures = [
    {
      title: 'Automated Assignment Rules',
      description: 'Automatically assign orders to team members based on workload, expertise, and availability',
      icon: <Zap className="h-6 w-6 text-blue-500" />,
      category: 'Assignment'
    },
    {
      title: 'Priority Escalation',
      description: 'Automatically escalate high-priority orders or those approaching deadlines',
      icon: <AlertTriangle className="h-6 w-6 text-orange-500" />,
      category: 'Escalation'
    },
    {
      title: 'Quality Control Rules',
      description: 'Set rules for quality checks and automatic reviews based on order complexity',
      icon: <Settings className="h-6 w-6 text-green-500" />,
      category: 'Quality'
    },
    {
      title: 'Notification Triggers',
      description: 'Configure when and how team members receive notifications about order updates',
      icon: <Info className="h-6 w-6 text-purple-500" />,
      category: 'Notifications'
    },
    {
      title: 'Status Transition Rules',
      description: 'Define automatic status changes based on time, actions, or external triggers',
      icon: <Code className="h-6 w-6 text-indigo-500" />,
      category: 'Workflow'
    },
    {
      title: 'SLA Management',
      description: 'Monitor and enforce service level agreements with automatic alerts',
      icon: <Settings className="h-6 w-6 text-red-500" />,
      category: 'SLA'
    }
  ];

  const exampleRules = [
    {
      name: 'High Priority Auto-Assignment',
      condition: 'order.priority >= 8 AND order.order_final_price > 5000',
      action: 'assign_to_senior_abstractor()',
      status: 'Template'
    },
    {
      name: 'Deadline Alert',
      condition: 'order.eta - current_date <= 1_day',
      action: 'send_alert_to_manager()',
      status: 'Template'
    },
    {
      name: 'Quality Review Trigger',
      condition: 'order.score < 70 OR order.complexity = "high"',
      action: 'require_quality_review()',
      status: 'Template'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rules Engine</h1>
            <p className="text-gray-600 mt-2">Automate workflows and business logic (Coming Soon)</p>
          </div>
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg px-4 py-2">
            <span className="text-yellow-800 font-medium">🚧 Under Development</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedTab('rules')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'rules'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Example Rules
            </button>
            <button
              onClick={() => setSelectedTab('templates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Rule Templates
            </button>
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-200">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-blue-100 rounded-lg p-3">
                <Code className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Intelligent Automation</h2>
                <p className="text-gray-600">Streamline your workflow with powerful rule-based automation</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              The Rules Engine will allow you to create sophisticated automation rules that can automatically 
              assign orders, escalate priorities, trigger notifications, and manage quality control processes. 
              Define conditions and actions using an intuitive interface or advanced scripting.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comingSoonFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {feature.category}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Benefits Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expected Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Reduce manual assignment time by 80%</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Improve response times for high-priority orders</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Ensure consistent quality control processes</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Minimize human error in workflow management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Provide 24/7 automated monitoring</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Scale operations without additional overhead</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Example Rules Tab */}
      {selectedTab === 'rules' && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-yellow-600" />
              <p className="text-yellow-800 font-medium">Preview: Example Rules</p>
            </div>
            <p className="text-yellow-700 mt-1 text-sm">
              These are examples of rules that will be available when the Rules Engine is implemented.
            </p>
          </div>

          <div className="grid gap-6">
            {exampleRules.map((rule, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                      {rule.status}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled>
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                    <code className="block bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-gray-800">
                      {rule.condition}
                    </code>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                    <code className="block bg-blue-50 border border-blue-200 rounded px-3 py-2 text-sm text-blue-800">
                      {rule.action}
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {selectedTab === 'templates' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-600" />
              <p className="text-blue-800 font-medium">Rule Templates Library</p>
            </div>
            <p className="text-blue-700 mt-1 text-sm">
              Pre-built rule templates will be available to help you get started quickly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Templates</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <h4 className="font-medium text-gray-900">Load Balancing</h4>
                  <p className="text-sm text-gray-600">Distribute orders evenly across team members</p>
                </div>
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <h4 className="font-medium text-gray-900">Skill-Based Routing</h4>
                  <p className="text-sm text-gray-600">Assign based on expertise and past performance</p>
                </div>
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <h4 className="font-medium text-gray-900">Priority Assignment</h4>
                  <p className="text-sm text-gray-600">Route high-priority orders to senior staff</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Templates</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <h4 className="font-medium text-gray-900">Deadline Alerts</h4>
                  <p className="text-sm text-gray-600">Notify when orders approach due dates</p>
                </div>
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <h4 className="font-medium text-gray-900">Status Updates</h4>
                  <p className="text-sm text-gray-600">Automatic notifications on status changes</p>
                </div>
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <h4 className="font-medium text-gray-900">Customer Communication</h4>
                  <p className="text-sm text-gray-600">Auto-notify customers of progress updates</p>
                </div>
              </div>
            </div>
          </div>

          {/* Template Creation Preview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create Custom Rule</h3>
              <button className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed" disabled>
                <Plus className="h-4 w-4 mr-2 inline" />
                Coming Soon
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-50">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name</label>
                <input 
                  type="text" 
                  placeholder="Enter rule name..." 
                  className="w-full border border-gray-300 rounded-md px-3 py-2" 
                  disabled 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2" disabled>
                  <option>Select category...</option>
                  <option>Assignment</option>
                  <option>Notification</option>
                  <option>Quality Control</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Stay Updated</h3>
        <p className="text-gray-600 mb-4">
          The Rules Engine is currently in development. This powerful feature will be available in a future update.
        </p>
        <div className="flex justify-center space-x-4">
          <div className="flex items-center text-sm text-gray-500">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
            Phase 1: Rule Builder (Q2 2025)
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            Phase 2: Advanced Automation (Q3 2025)
          </div>
        </div>
      </div>
    </div>
  );
};

export default RulesEngine;