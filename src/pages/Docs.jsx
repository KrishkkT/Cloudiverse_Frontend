import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cloud, ArrowLeft, Book, Terminal, Server,
  ChevronRight, ChevronDown, Copy, Check,
  Zap, Shield, DollarSign, FileCode
} from 'lucide-react';
import { toast } from 'react-toastify';

const Docs = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('getting-started');
  const [copiedCode, setCopiedCode] = useState(null);

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, language = 'bash', id }) => (
    <div className="relative bg-code-block rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-surface/50 border-b border-border">
        <span className="text-sm text-text-secondary">{language}</span>
        <button
          onClick={() => copyToClipboard(code, id)}
          className="text-text-secondary hover:text-text-primary"
        >
          {copiedCode === id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="text-text-primary">{code}</code>
      </pre>
    </div>
  );

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: <Zap className="h-4 w-4" /> },
    { id: 'terraform-basics', title: 'Terraform Basics', icon: <FileCode className="h-4 w-4" /> },
    { id: 'deploy-aws', title: 'Deploy to AWS', icon: <Server className="h-4 w-4" /> },
    { id: 'deploy-gcp', title: 'Deploy to GCP', icon: <Server className="h-4 w-4" /> },
    { id: 'deploy-azure', title: 'Deploy to Azure', icon: <Server className="h-4 w-4" /> },
    { id: 'cost-estimation', title: 'Cost Estimation', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'security', title: 'Security Best Practices', icon: <Shield className="h-4 w-4" /> }
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button onClick={() => navigate('/')} className="flex items-center text-text-secondary hover:text-text-primary">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </button>
            </div>
            <div className="flex items-center">
              <Cloud className="h-8 w-8 text-primary mr-2" />
              <span className="text-xl font-bold">Cloudiverse Docs</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-surface border-r border-border p-4 hidden md:block">
          <div className="flex items-center mb-6">
            <Book className="h-5 w-5 text-primary mr-2" />
            <span className="font-semibold">Documentation</span>
          </div>
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${activeSection === section.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:bg-surface/80 hover:text-text-primary'
                  }`}
              >
                {section.icon}
                <span className="ml-2">{section.title}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 max-w-4xl">
          {/* Getting Started */}
          {activeSection === 'getting-started' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-4">Getting Started with Cloudiverse</h1>
                <p className="text-text-secondary text-lg">
                  Learn how to design, generate, and deploy cloud infrastructure using Cloudiverse Architect.
                </p>
              </div>

              <div className="bg-surface border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Quick Start</h2>
                <ol className="space-y-4 text-text-secondary">
                  <li className="flex items-start">
                    <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 flex-shrink-0">1</span>
                    <div>
                      <strong className="text-text-primary">Create a workspace</strong>
                      <p>Start by creating a new project and describing your application in plain language.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 flex-shrink-0">2</span>
                    <div>
                      <strong className="text-text-primary">Answer clarifying questions</strong>
                      <p>Answer a few questions about scale, security, and requirements.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 flex-shrink-0">3</span>
                    <div>
                      <strong className="text-text-primary">Review architecture</strong>
                      <p>Review the generated architecture diagram and cost estimates.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 flex-shrink-0">4</span>
                    <div>
                      <strong className="text-text-primary">Export Terraform</strong>
                      <p>Download production-ready Terraform code for your chosen cloud provider.</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* Terraform Basics */}
          {activeSection === 'terraform-basics' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-4">Terraform Basics</h1>
                <p className="text-text-secondary text-lg">
                  Prerequisites and basic concepts for deploying your infrastructure.
                </p>
              </div>

              <div className="bg-surface border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Prerequisites</h2>
                <ul className="space-y-2 text-text-secondary list-disc pl-5">
                  <li>Terraform CLI v1.5+ installed</li>
                  <li>Cloud provider CLI (AWS CLI, gcloud, or Azure CLI)</li>
                  <li>Valid cloud provider credentials configured</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Install Terraform</h2>
                <CodeBlock
                  id="install-terraform"
                  language="bash"
                  code={`# MacOS (using Homebrew)
brew install terraform

# Windows (using Chocolatey)
choco install terraform

# Linux (Ubuntu/Debian)
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform`}
                />
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Basic Terraform Commands</h2>
                <CodeBlock
                  id="terraform-commands"
                  language="bash"
                  code={`# Initialize Terraform (download providers)
terraform init

# Preview changes
terraform plan

# Apply changes
terraform apply

# Destroy resources
terraform destroy`}
                />
              </div>
            </div>
          )}

          {/* Deploy to AWS */}
          {activeSection === 'deploy-aws' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-4">Deploy to AWS</h1>
                <p className="text-text-secondary text-lg">
                  Step-by-step guide to deploying your Cloudiverse-generated infrastructure to AWS.
                </p>
              </div>

              <div className="bg-surface border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Step 1: Configure AWS Credentials</h2>
                <CodeBlock
                  id="aws-creds"
                  language="bash"
                  code={`# Install AWS CLI
brew install awscli  # or: choco install awscli

# Configure credentials
aws configure

# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (e.g., us-east-1)
# - Output format (json)`}
                />
              </div>

              <div className="bg-surface border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Step 2: Export Terraform from Cloudiverse</h2>
                <p className="text-text-secondary mb-4">
                  In your Cloudiverse workspace, click "Export Terraform" and select AWS as your provider.
                  Download the ZIP file and extract it to your project directory.
                </p>
              </div>

              <div className="bg-surface border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Step 3: Deploy</h2>
                <CodeBlock
                  id="aws-deploy"
                  language="bash"
                  code={`# Navigate to your Terraform directory
cd my-cloudiverse-project/aws

# Initialize Terraform
terraform init

# Preview your infrastructure
terraform plan

# Deploy (type 'yes' to confirm)
terraform apply

# Save your outputs
terraform output > outputs.txt`}
                />
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                <h3 className="font-semibold text-yellow-500 mb-2">💡 Pro Tip</h3>
                <p className="text-text-secondary">
                  Always review the <code className="bg-surface px-2 py-1 rounded">terraform plan</code> output
                  before applying to understand what resources will be created and their estimated costs.
                </p>
              </div>
            </div>
          )}

          {/* Deploy to GCP */}
          {activeSection === 'deploy-gcp' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-4">Deploy to Google Cloud Platform</h1>
                <p className="text-text-secondary text-lg">
                  Step-by-step guide to deploying your infrastructure to GCP.
                </p>
              </div>

              <div className="bg-surface border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Step 1: Configure GCP Credentials</h2>
                <CodeBlock
                  id="gcp-creds"
                  language="bash"
                  code={`# Install Google Cloud SDK
brew install --cask google-cloud-sdk  # or download from cloud.google.com

# Login to GCP
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Create service account credentials for Terraform
gcloud iam service-accounts create terraform-sa --display-name="Terraform Service Account"
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \\
  --member="serviceAccount:terraform-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \\
  --role="roles/editor"

# Download key file
gcloud iam service-accounts keys create terraform-key.json \\
  --iam-account=terraform-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com

# Set credential path
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/terraform-key.json"`}
                />
              </div>

              <div className="bg-surface border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Step 2: Deploy</h2>
                <CodeBlock
                  id="gcp-deploy"
                  language="bash"
                  code={`# Navigate to GCP Terraform directory
cd my-cloudiverse-project/gcp

# Initialize and deploy
terraform init
terraform plan
terraform apply`}
                />
              </div>
            </div>
          )}

          {/* Deploy to Azure */}
          {activeSection === 'deploy-azure' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-4">Deploy to Microsoft Azure</h1>
                <p className="text-text-secondary text-lg">
                  Step-by-step guide to deploying your infrastructure to Azure.
                </p>
              </div>

              <div className="bg-surface border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Step 1: Configure Azure Credentials</h2>
                <CodeBlock
                  id="azure-creds"
                  language="bash"
                  code={`# Install Azure CLI
brew install azure-cli  # or: choco install azure-cli

# Login to Azure
az login

# Set your subscription
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# Create service principal for Terraform
az ad sp create-for-rbac --name "terraform-sp" --role contributor \\
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID

# Set environment variables from the output
export ARM_CLIENT_ID="<appId>"
export ARM_CLIENT_SECRET="<password>"
export ARM_SUBSCRIPTION_ID="<subscription_id>"
export ARM_TENANT_ID="<tenant>"`}
                />
              </div>

              <div className="bg-surface border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Step 2: Deploy</h2>
                <CodeBlock
                  id="azure-deploy"
                  language="bash"
                  code={`# Navigate to Azure Terraform directory
cd my-cloudiverse-project/azure

# Initialize and deploy
terraform init
terraform plan
terraform apply`}
                />
              </div>
            </div>
          )}

          {/* Cost Estimation */}
          {activeSection === 'cost-estimation' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-4">Understanding Cost Estimates</h1>
                <p className="text-text-secondary text-lg">
                  How Cloudiverse calculates and presents infrastructure costs.
                </p>
              </div>

              <div className="bg-surface border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Cost Calculation</h2>
                <p className="text-text-secondary mb-4">
                  Cloudiverse uses Infracost integration and provider pricing APIs to estimate costs.
                  Cost estimates include:
                </p>
                <ul className="space-y-2 text-text-secondary list-disc pl-5">
                  <li>Compute resources (VMs, containers, serverless)</li>
                  <li>Database services</li>
                  <li>Storage and networking</li>
                  <li>Managed services (load balancers, CDN, etc.)</li>
                </ul>
              </div>

              <div className="bg-surface border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Confidence Levels</h2>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-sm mr-3">HIGH</span>
                    <span className="text-text-secondary">All resources priced, ±20% accuracy</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-yellow-500 text-white px-2 py-1 rounded text-sm mr-3">MEDIUM</span>
                    <span className="text-text-secondary">Some assumptions made, ±30% accuracy</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-sm mr-3">LOW</span>
                    <span className="text-text-secondary">Traffic-based pricing, estimates may vary significantly</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Security */}
          {activeSection === 'security' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-4">Security Best Practices</h1>
                <p className="text-text-secondary text-lg">
                  Security recommendations for your generated infrastructure.
                </p>
              </div>

              <div className="bg-surface border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Built-in Security</h2>
                <p className="text-text-secondary mb-4">
                  All Cloudiverse-generated Terraform includes:
                </p>
                <ul className="space-y-2 text-text-secondary list-disc pl-5">
                  <li>Private subnets for databases and internal services</li>
                  <li>Security groups with least-privilege access</li>
                  <li>Encryption at rest for databases and storage</li>
                  <li>TLS/SSL for all public endpoints</li>
                  <li>Secrets management integration</li>
                </ul>
              </div>

              <div className="bg-surface border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Post-Deployment Checklist</h2>
                <ul className="space-y-2 text-text-secondary">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">☐</span>
                    Rotate initial credentials and secrets
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">☐</span>
                    Enable cloud provider audit logging
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">☐</span>
                    Set up alerts for unusual activity
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">☐</span>
                    Configure automated backups
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">☐</span>
                    Review security group rules
                  </li>
                </ul>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Docs;