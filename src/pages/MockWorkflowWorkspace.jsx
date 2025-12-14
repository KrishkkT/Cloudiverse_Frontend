import React, { useState } from 'react';
import { 
  Play, 
  Server, 
  Database, 
  HardDrive, 
  ChevronRight,
  BarChart3,
  Code,
  Network,
  Copy,
  Download,
  CheckCircle,
  Circle,
  Lock,
  Save
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

const MockWorkflowWorkspace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: workspaceId } = useParams(); // Get workspace ID from URL params
  const [activeStep, setActiveStep] = useState('problem-definition');
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [appDescription, setAppDescription] = useState('');
  const [projectData, setProjectData] = useState({
    name: 'New Project',
    status: 'Draft'
  });

  // Define the steps for the decision rail
  const steps = [
    { id: 'problem-definition', name: 'Problem Definition' },
    { id: 'infraspec', name: 'Normalized InfraSpec' },
    { id: 'variants', name: 'Architecture Variants' },
    { id: 'comparison', name: 'Provider Comparison' },
    { id: 'diagrams', name: 'Diagrams' },
    { id: 'terraform', name: 'Terraform' },
    { id: 'deployment', name: 'Deployment Guide' }
  ];

  // Mock data for each step
  const mockData = {
    infraspec: {
      compute: {
        instances: 3,
        vcpus: 4,
        memory: '8GB',
        type: 't3.medium'
      },
      database: {
        engine: 'PostgreSQL',
        storage: '200GB',
        version: '13'
      },
      cache: {
        engine: 'Redis',
        size: '2GB'
      },
      storage: {
        type: 'Object Storage',
        size: '1TB',
        class: 'Standard'
      },
      networking: {
        cdn: 'Enabled',
        loadBalancer: 'Application Load Balancer'
      }
    },
    variants: [
      {
        id: 'cost-efficient',
        name: 'Cost-Efficient',
        costRange: '$800 - $1,200/month',
        tradeoffs: ['Shared tenancy for compute', 'Standard storage class', 'Basic monitoring']
      },
      {
        id: 'optimized',
        name: 'High-Performance',
        costRange: '$1,500 - $2,500/month',
        tradeoffs: ['Dedicated tenancy', 'High-IOPS storage', 'Advanced monitoring']
      }
    ],
    comparison: [
      { provider: 'AWS', cost: '$1,100/month', performance: 'High', reliability: '99.99%', security: 'Enterprise-grade', rank: 1 },
      { provider: 'Azure', cost: '$1,250/month', performance: 'Medium-High', reliability: '99.95%', security: 'Enterprise-grade', rank: 2 },
      { provider: 'GCP', cost: '$1,400/month', performance: 'Very High', reliability: '99.99%', security: 'Enterprise-grade', rank: 3 }
    ],
    terraform: `
# Terraform configuration for cloud infrastructure
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = var.aws_region
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
}

variable "db_instance_class" {
  description = "Database instance class"
  type        = string
  default     = "db.t3.micro"
}

# Outputs
output "web_server_ip" {
  description = "Public IP address of the web server"
  value       = aws_instance.web_server.public_ip
}

output "database_endpoint" {
  description = "Database endpoint"
  value       = aws_db_instance.postgres_db.endpoint
}

# Create VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name    = "cloud-planner-vpc"
    Project = "cloud-infrastructure-planner"
  }
}
    `.trim()
  };

  // Function to save workspace to database
  const saveWorkspace = async () => {
    try {
      const token = localStorage.getItem('token');
      const workspaceData = {
        name: projectData.name || 'New Project',
        description: appDescription || 'No description provided',
        project_data: {
          appDescription,
          activeStep,
          completedSteps: Array.from(completedSteps),
          projectData
        }
      };
      
      let response;
      
      if (workspaceId) {
        // Update existing workspace
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/workspaces/${workspaceId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(workspaceData)
        });
      } else {
        // Create new workspace
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/workspaces`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(workspaceData)
        });
      }
      
      if (response.ok) {
        const savedWorkspace = await response.json();
        console.log('Workspace saved:', savedWorkspace);
        // If this is a new workspace, redirect to the workspace page
        if (!workspaceId && savedWorkspace.id) {
          navigate(`/workspace/${savedWorkspace.id}`);
        }
      } else {
        console.error('Failed to save workspace');
      }
    } catch (error) {
      console.error('Error saving workspace:', error);
    }
  };
  
  // Function to advance to the next step
  const advanceToNextStep = () => {
    const currentIndex = steps.findIndex(step => step.id === activeStep);
    
    // Mark current step as completed
    setCompletedSteps(prev => new Set(prev).add(activeStep));
    
    // Move to next step if available
    if (currentIndex < steps.length - 1) {
      setActiveStep(steps[currentIndex + 1].id);
    }
    
    // Auto-save when advancing
    saveWorkspace();
  };

  // State 1: Empty / Start
  const renderStartState = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-text-primary mb-2">Brief the system you want to build.</h2>
          <p className="text-text-secondary mb-8">
            Describe the problem. We'll design the architecture.
          </p>
          
          <div className="bg-elevated border border-border rounded-xl p-6 mb-8">
            <textarea
              value={appDescription}
              onChange={(e) => setAppDescription(e.target.value)}
              placeholder="Describe your system (e.g., A SaaS analytics platform for 50k concurrent users with PostgreSQL database, Redis caching, and CDN for static assets...)"
              className="w-full h-48 bg-surface border border-border rounded-lg p-4 text-text-primary placeholder-text-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>
          
          <button
            onClick={() => {
              setCompletedSteps(new Set().add('problem-definition'));
              setActiveStep('infraspec');
              // Save the workspace when generating architecture
              saveWorkspace();
            }}
            disabled={!appDescription.trim()}
            className={`btn btn-primary px-6 py-3 ${!appDescription.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Play size={20} className="mr-2" />
            Generate Architecture
          </button>
        </div>
      </div>
    </div>
  );

  // State 2: InfraSpec Generated
  const renderInfraSpecState = () => (
    <div className="flex-1 p-8 overflow-auto">
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-2">Infrastructure Specification</h2>
          <p className="text-text-secondary">
            This InfraSpec is deterministic and production-ready.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Compute */}
          <div className="bg-elevated border border-border rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Server className="text-primary mr-3" size={20} />
              <h3 className="text-lg font-semibold text-text-primary">Compute</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Instances</span>
                <span className="text-text-primary">{mockData.infraspec.compute.instances}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">vCPUs</span>
                <span className="text-text-primary">{mockData.infraspec.compute.vcpus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Memory</span>
                <span className="text-text-primary">{mockData.infraspec.compute.memory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Instance Type</span>
                <span className="text-text-primary">{mockData.infraspec.compute.type}</span>
              </div>
            </div>
          </div>
          
          {/* Database */}
          <div className="bg-elevated border border-border rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Database className="text-primary mr-3" size={20} />
              <h3 className="text-lg font-semibold text-text-primary">Database</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Engine</span>
                <span className="text-text-primary">{mockData.infraspec.database.engine}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Storage</span>
                <span className="text-text-primary">{mockData.infraspec.database.storage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Version</span>
                <span className="text-text-primary">{mockData.infraspec.database.version}</span>
              </div>
            </div>
          </div>
          
          {/* Cache */}
          <div className="bg-elevated border border-border rounded-xl p-6">
            <div className="flex items-center mb-4">
              <HardDrive className="text-primary mr-3" size={20} />
              <h3 className="text-lg font-semibold text-text-primary">Cache</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Engine</span>
                <span className="text-text-primary">{mockData.infraspec.cache.engine}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Size</span>
                <span className="text-text-primary">{mockData.infraspec.cache.size}</span>
              </div>
            </div>
          </div>
          
          {/* Storage */}
          <div className="bg-elevated border border-border rounded-xl p-6">
            <div className="flex items-center mb-4">
              <HardDrive className="text-primary mr-3" size={20} />
              <h3 className="text-lg font-semibold text-text-primary">Storage</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Type</span>
                <span className="text-text-primary">{mockData.infraspec.storage.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Size</span>
                <span className="text-text-primary">{mockData.infraspec.storage.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Class</span>
                <span className="text-text-primary">{mockData.infraspec.storage.class}</span>
              </div>
            </div>
          </div>
          
          {/* Networking */}
          <div className="bg-elevated border border-border rounded-xl p-6 md:col-span-2">
            <div className="flex items-center mb-4">
              <Network className="text-primary mr-3" size={20} />
              <h3 className="text-lg font-semibold text-text-primary">Networking</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between">
                <span className="text-text-secondary">CDN</span>
                <span className="text-text-primary">{mockData.infraspec.networking.cdn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Load Balancer</span>
                <span className="text-text-primary">{mockData.infraspec.networking.loadBalancer}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Accept & Continue Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={advanceToNextStep}
            className="btn btn-primary px-6 py-3"
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );

  // State 3: Architecture Variants
  const renderVariantsState = () => (
    <div className="flex-1 p-8 overflow-auto">
      <div className="w-full px-4 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-2">Architecture Variants</h2>
          <p className="text-text-secondary">
            Two approaches to meet your requirements
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Variant A - Cost-Efficient */}
          <div className="bg-elevated border border-border rounded-xl p-6 hover:border-primary/30 transition-colors">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-text-primary mb-2">Variant A — Cost-Efficient</h3>
              <p className="text-text-secondary">
                Optimized for minimal operational costs
              </p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <h4 className="font-medium text-text-primary mb-2">Cost Range</h4>
                <p className="text-secondary">{mockData.variants[0].costRange}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-text-primary mb-2">Trade-offs</h4>
                <ul className="text-text-secondary space-y-1">
                  {mockData.variants[0].tradeoffs.map((tradeoff, index) => (
                    <li key={index}>• {tradeoff}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <button className="w-full btn btn-secondary">
              Select Cost-Efficient Variant
            </button>
          </div>
          
          {/* Variant B - Optimized */}
          <div className="bg-elevated border border-border rounded-xl p-6 hover:border-primary/30 transition-colors">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-text-primary mb-2">Variant B — High-Performance</h3>
              <p className="text-text-secondary">
                Balanced for performance, reliability, and scalability
              </p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <h4 className="font-medium text-text-primary mb-2">Cost Range</h4>
                <p className="text-secondary">{mockData.variants[1].costRange}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-text-primary mb-2">Trade-offs</h4>
                <ul className="text-text-secondary space-y-1">
                  {mockData.variants[1].tradeoffs.map((tradeoff, index) => (
                    <li key={index}>• {tradeoff}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <button className="w-full btn btn-primary">
              Select High-Performance Variant
            </button>
          </div>
        </div>
        
        {/* Accept & Continue Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={advanceToNextStep}
            className="btn btn-primary px-6 py-3"
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );

  // State 4: Multi-Cloud Comparison
  const renderComparisonState = () => (
    <div className="flex-1 p-8 overflow-auto">
      <div className="w-full px-4 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-2">Multi-Cloud Comparison Matrix</h2>
          <p className="text-text-secondary">
            Ranked provider recommendations for your selected variant
          </p>
        </div>
        
        {/* Comparison Matrix */}
        <div className="bg-elevated border border-border rounded-xl overflow-hidden mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="text-left p-4 font-medium text-text-primary">Provider</th>
                <th className="text-left p-4 font-medium text-text-primary">Estimated Cost</th>
                <th className="text-left p-4 font-medium text-text-primary">Performance</th>
                <th className="text-left p-4 font-medium text-text-primary">Reliability</th>
                <th className="text-left p-4 font-medium text-text-primary">Security</th>
                <th className="text-left p-4 font-medium text-text-primary">Rank</th>
              </tr>
            </thead>
            <tbody>
              {mockData.comparison.map((provider, index) => (
                <tr key={index} className="border-b border-border hover:bg-surface/50">
                  <td className="p-4 font-medium text-text-primary">{provider.provider}</td>
                  <td className="p-4 text-text-secondary">{provider.cost}</td>
                  <td className="p-4 text-text-secondary">{provider.performance}</td>
                  <td className="p-4 text-text-secondary">{provider.reliability}</td>
                  <td className="p-4 text-text-secondary">{provider.security}</td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <span className="font-medium text-primary">#{provider.rank}</span>
                      {provider.rank === 1 && <CheckCircle size={16} className="text-primary ml-2" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recommendation */}
          <div className="bg-elevated border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Ranked Provider Recommendation</h3>
            
            <div className="flex items-start mb-4">
              <div className="bg-primary/20 p-2 rounded-full mr-3">
                <BarChart3 size={20} className="text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-text-primary">AWS Recommended</h4>
                <p className="text-text-secondary text-sm">
                  Best balance of cost, performance, and reliability for your requirements
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-text-primary text-sm mb-1">Why AWS?</h4>
                <ul className="text-text-secondary text-sm space-y-1">
                  <li>• Competitive pricing for your workload</li>
                  <li>• Mature ecosystem with extensive services</li>
                  <li>• Global infrastructure with 99.99% SLA</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Provider Details */}
          <div className="bg-elevated border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Provider Strengths</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-text-primary mb-2">AWS</h4>
                <p className="text-text-secondary text-sm">
                  Market leader with the most comprehensive cloud services. Strong in compute, storage, and database offerings.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-text-primary mb-2">Azure</h4>
                <p className="text-text-secondary text-sm">
                  Excellent integration with Microsoft products. Strong hybrid cloud capabilities.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-text-primary mb-2">GCP</h4>
                <p className="text-text-secondary text-sm">
                  Cutting-edge technologies in machine learning and data analytics. Strong network performance.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Accept & Continue Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={advanceToNextStep}
            className="btn btn-primary px-6 py-3"
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );

  // State 5: Architecture Diagram
  const renderDiagramState = () => (
    <div className="flex-1 p-8 flex flex-col overflow-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Architecture Diagram</h2>
        <p className="text-text-secondary">
          Auto-generated visualization of your cloud infrastructure
        </p>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center bg-elevated border border-border rounded-xl p-8">
        <div className="text-center mb-8">
          <Network size={48} className="text-text-subtle mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">Auto-Generated Architecture Visualization</h3>
          <p className="text-text-secondary max-w-md mx-auto">
            This visualization is generated from your deterministic InfraSpec and represents your cloud architecture. Export as PNG/SVG.
          </p>
        </div>
        
        <div className="bg-surface border border-border rounded-lg w-full max-w-2xl h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block bg-surface/50 p-4 rounded-lg mb-4">
              <Network size={32} className="text-primary mx-auto" />
            </div>
            <p className="text-text-secondary">Architecture Diagram Visualization</p>
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button className="btn btn-secondary btn-sm">
            Zoom In
          </button>
          <button className="btn btn-secondary btn-sm">
            Zoom Out
          </button>
          <button className="btn btn-secondary btn-sm">
            Reset View
          </button>
          <div className="w-px bg-border mx-2"></div>
          <button className="btn btn-secondary btn-sm flex items-center">
            <Download size={16} className="mr-1" />
            PNG
          </button>
          <button className="btn btn-secondary btn-sm flex items-center">
            <Download size={16} className="mr-1" />
            SVG
          </button>
        </div>
      </div>
      
      {/* Accept & Continue Button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={advanceToNextStep}
          className="btn btn-primary px-6 py-3"
        >
          Accept & Continue
        </button>
      </div>
    </div>
  );

  // State 6: Terraform Code
  const renderTerraformState = () => (
    <div className="flex-1 flex flex-col overflow-auto">
      <div className="p-6 border-b border-border">
        <div className="mb-2">
          <h2 className="text-2xl font-bold text-text-primary">Terraform Code</h2>
          <p className="text-text-secondary">
            This Terraform is generated from a deterministic InfraSpec.
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button className="btn btn-secondary btn-sm flex items-center">
            <Copy size={16} className="mr-1" />
            Copy
          </button>
          <button className="btn btn-secondary btn-sm flex items-center">
            <Download size={16} className="mr-1" />
            Download ZIP
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-auto">
        {/* File Tree */}
        <div className="w-64 bg-surface border-r border-border overflow-y-auto">
          <div className="p-4 border-b border-border">
            <h3 className="font-medium text-text-primary">Files</h3>
          </div>
          <div className="p-2">
            <div className="py-1.5 px-3 text-sm text-text-primary font-medium">main.tf</div>
            <div className="py-1.5 px-3 text-sm text-text-secondary">variables.tf</div>
            <div className="py-1.5 px-3 text-sm text-text-secondary">outputs.tf</div>
            <div className="py-1.5 px-6 text-sm text-text-subtle">modules/</div>
            <div className="py-1.5 px-9 text-sm text-text-subtle">network/</div>
            <div className="py-1.5 px-9 text-sm text-text-subtle">compute/</div>
            <div className="py-1.5 px-9 text-sm text-text-subtle">database/</div>
          </div>
        </div>
        
        {/* Code Editor */}
        <div className="flex-1 overflow-auto bg-code-block">
          <pre className="p-6 text-sm text-text-primary font-mono">
            {mockData.terraform}
          </pre>
        </div>
      </div>
      
      {/* Accept & Continue Button */}
      <div className="flex justify-center mt-8 p-6">
        <button
          onClick={advanceToNextStep}
          className="btn btn-primary px-6 py-3"
        >
          Accept & Continue
        </button>
      </div>
    </div>
  );

  // State 7: Deployment Guide
  const renderDeploymentState = () => (
    <div className="flex-1 p-8 overflow-auto">
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-2">Deployment Guide</h2>
          <p className="text-text-secondary">
            Step-by-step instructions to deploy your infrastructure
          </p>
        </div>
        
        <div className="bg-elevated border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold text-text-primary mb-4">Deployment Steps</h3>
          
          <div className="space-y-6">
            <div className="flex">
              <div className="flex-shrink-0 mr-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/20 text-primary">
                  1
                </div>
              </div>
              <div>
                <h4 className="font-medium text-text-primary">Initialize Terraform</h4>
                <p className="text-text-secondary mt-1">
                  Run <code className="bg-surface px-2 py-1 rounded">terraform init</code> to initialize the working directory.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 mr-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/20 text-primary">
                  2
                </div>
              </div>
              <div>
                <h4 className="font-medium text-text-primary">Review Plan</h4>
                <p className="text-text-secondary mt-1">
                  Run <code className="bg-surface px-2 py-1 rounded">terraform plan</code> to preview the changes.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 mr-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/20 text-primary">
                  3
                </div>
              </div>
              <div>
                <h4 className="font-medium text-text-primary">Apply Configuration</h4>
                <p className="text-text-secondary mt-1">
                  Run <code className="bg-surface px-2 py-1 rounded">terraform apply</code> to create the infrastructure.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 mr-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/20 text-primary">
                  4
                </div>
              </div>
              <div>
                <h4 className="font-medium text-text-primary">Verify Deployment</h4>
                <p className="text-text-secondary mt-1">
                  Check the AWS Console to confirm all resources are created successfully.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border">
            <h4 className="font-medium text-text-primary mb-3">Next Steps</h4>
            <ul className="text-text-secondary space-y-2">
              <li>• Configure DNS settings for your domain</li>
              <li>• Set up SSL certificates</li>
              <li>• Configure monitoring and alerting</li>
              <li>• Set up backup and disaster recovery procedures</li>
            </ul>
          </div>
        </div>
        
        {/* Accept & Continue Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={advanceToNextStep}
            className="btn btn-primary px-6 py-3"
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );

  // Render the appropriate state based on activeStep
  const renderActiveState = () => {
    switch (activeStep) {
      case 'problem-definition':
        return renderStartState();
      case 'infraspec':
        return renderInfraSpecState();
      case 'variants':
        return renderVariantsState();
      case 'comparison':
        return renderComparisonState();
      case 'diagrams':
        return renderDiagramState();
      case 'terraform':
        return renderTerraformState();
      case 'deployment':
        return renderDeploymentState();
      default:
        return renderStartState();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Context Bar (Top Zone) */}
      <div className="h-16 bg-surface border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold text-text-primary">{projectData.name}</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/20 text-warning">
            Draft
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={saveWorkspace}
            className="btn btn-secondary btn-sm flex items-center space-x-1.5"
          >
            <Save size={14} />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL — Design Process (Fixed Width) */}
        <div className="w-72 flex-shrink-0 border-r border-border flex flex-col bg-surface">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-text-primary">Design Process</h2>
          </div>
          
          <nav className="flex-1 py-4">
            <ul className="space-y-1 px-2">
              {steps.map((step) => {
                const isActive = step.id === activeStep;
                const isCompleted = completedSteps.has(step.id);
                // A step is locked if it's not completed and it's not the first step and the previous step isn't completed
                const isLocked = step.id !== 'problem-definition' && 
                  !isCompleted && 
                  !completedSteps.has(steps[steps.findIndex(s => s.id === step.id) - 1]?.id);
                
                return (
                  <li key={step.id}>
                    <div
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                        isActive 
                          ? 'bg-primary/20 text-primary font-medium' 
                          : isCompleted
                            ? 'text-text-secondary'
                            : isLocked
                              ? 'text-text-subtle opacity-50 cursor-not-allowed'
                              : 'text-text-subtle'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle size={16} className="text-primary" />
                      ) : isLocked ? (
                        <Lock size={16} className="text-text-subtle" />
                      ) : (
                        <Circle size={16} className="text-text-subtle" />
                      )}
                      <span className="text-sm">{step.name}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* RIGHT PANEL — Main Workspace (Takes ALL remaining space) */}
        <div className="flex-1 flex flex-col bg-surface relative">
          {/* Main content area with scrolling */}
          <div className="flex-1 overflow-y-auto">
            {renderActiveState()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockWorkflowWorkspace;