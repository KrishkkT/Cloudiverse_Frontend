import{j as e}from"./index-lHb7DQJg.js";import{u,r as o}from"./vendor-rtOnKvnR.js";import{B as h}from"./utils-_x9ZSjUA.js";import{W as b,bc as j,a6 as f,bd as y,r as l,D as g,$ as N,t as v,p as w}from"./ui-CG_uZszz.js";const T=()=>{const d=u(),[r,n]=o.useState("getting-started"),[x,i]=o.useState(null),m=(s,a)=>{navigator.clipboard.writeText(s),i(a),h.success("Copied to clipboard!"),setTimeout(()=>i(null),2e3)},t=({code:s,language:a="bash",id:c})=>e.jsxs("div",{className:"relative bg-code-block rounded-lg border border-border overflow-hidden",children:[e.jsxs("div",{className:"flex items-center justify-between px-4 py-2 bg-surface/50 border-b border-border",children:[e.jsx("span",{className:"text-sm text-text-secondary",children:a}),e.jsx("button",{onClick:()=>m(s,c),className:"text-text-secondary hover:text-text-primary",children:x===c?e.jsx(v,{className:"h-4 w-4 text-green-500"}):e.jsx(w,{className:"h-4 w-4"})})]}),e.jsx("pre",{className:"p-4 overflow-x-auto text-sm",children:e.jsx("code",{className:"text-text-primary",children:s})})]}),p=[{id:"getting-started",title:"Getting Started",icon:e.jsx(f,{className:"h-4 w-4"})},{id:"terraform-basics",title:"Terraform Basics",icon:e.jsx(y,{className:"h-4 w-4"})},{id:"deploy-aws",title:"Deploy to AWS",icon:e.jsx(l,{className:"h-4 w-4"})},{id:"deploy-gcp",title:"Deploy to GCP",icon:e.jsx(l,{className:"h-4 w-4"})},{id:"deploy-azure",title:"Deploy to Azure",icon:e.jsx(l,{className:"h-4 w-4"})},{id:"cost-estimation",title:"Cost Estimation",icon:e.jsx(g,{className:"h-4 w-4"})},{id:"security",title:"Security Best Practices",icon:e.jsx(N,{className:"h-4 w-4"})}];return e.jsxs("div",{className:"min-h-screen bg-background text-text-primary",children:[e.jsx("header",{className:"sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border",children:e.jsx("div",{className:"container mx-auto px-4 sm:px-6 lg:px-8",children:e.jsxs("div",{className:"flex items-center justify-between h-16",children:[e.jsx("div",{className:"flex items-center",children:e.jsxs("button",{onClick:()=>d("/"),className:"flex items-center text-text-secondary hover:text-text-primary",children:[e.jsx(b,{className:"h-5 w-5 mr-2"}),"Back"]})}),e.jsx("div",{className:"flex items-center",children:e.jsx("a",{href:"/",children:e.jsx("img",{src:"/cloudiverse.png",alt:"Cloudiverse Architect",className:"h-12 w-auto"})})})]})})}),e.jsxs("div",{className:"flex",children:[e.jsxs("aside",{className:"w-64 min-h-screen bg-surface border-r border-border p-4 hidden md:block",children:[e.jsxs("div",{className:"flex items-center mb-6",children:[e.jsx(j,{className:"h-5 w-5 text-primary mr-2"}),e.jsx("span",{className:"font-semibold",children:"Documentation"})]}),e.jsx("nav",{className:"space-y-1",children:p.map(s=>e.jsxs("button",{onClick:()=>n(s.id),className:`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${r===s.id?"bg-primary/10 text-primary":"text-text-secondary hover:bg-surface/80 hover:text-text-primary"}`,children:[s.icon,e.jsx("span",{className:"ml-2",children:s.title})]},s.id))})]}),e.jsxs("main",{className:"flex-1 p-8 max-w-4xl",children:[r==="getting-started"&&e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-3xl font-bold mb-4",children:"Getting Started with Cloudiverse"}),e.jsx("p",{className:"text-text-secondary text-lg",children:"Learn how to design, generate, and deploy cloud infrastructure using Cloudiverse Architect."})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-6",children:[e.jsx("h2",{className:"text-xl font-semibold mb-4",children:"Quick Start"}),e.jsxs("ol",{className:"space-y-4 text-text-secondary",children:[e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 flex-shrink-0",children:"1"}),e.jsxs("div",{children:[e.jsx("strong",{className:"text-text-primary",children:"Create a workspace"}),e.jsx("p",{children:"Start by creating a new project and describing your application in plain language."})]})]}),e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 flex-shrink-0",children:"2"}),e.jsxs("div",{children:[e.jsx("strong",{className:"text-text-primary",children:"Answer clarifying questions"}),e.jsx("p",{children:"Answer a few questions about scale, security, and requirements."})]})]}),e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 flex-shrink-0",children:"3"}),e.jsxs("div",{children:[e.jsx("strong",{className:"text-text-primary",children:"Review architecture"}),e.jsx("p",{children:"Review the generated architecture diagram and cost estimates."})]})]}),e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 flex-shrink-0",children:"4"}),e.jsxs("div",{children:[e.jsx("strong",{className:"text-text-primary",children:"Export Terraform"}),e.jsx("p",{children:"Download production-ready Terraform code for your chosen cloud provider."})]})]})]})]})]}),r==="terraform-basics"&&e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-3xl font-bold mb-4",children:"Terraform Basics"}),e.jsx("p",{className:"text-text-secondary text-lg",children:"Prerequisites and basic concepts for deploying your infrastructure."})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-6",children:[e.jsx("h2",{className:"text-xl font-semibold mb-4",children:"Prerequisites"}),e.jsxs("ul",{className:"space-y-2 text-text-secondary list-disc pl-5",children:[e.jsx("li",{children:"Terraform CLI v1.5+ installed"}),e.jsx("li",{children:"Cloud provider CLI (AWS CLI, gcloud, or Azure CLI)"}),e.jsx("li",{children:"Valid cloud provider credentials configured"})]})]}),e.jsxs("div",{children:[e.jsx("h2",{className:"text-xl font-semibold mb-4",children:"Install Terraform"}),e.jsx(t,{id:"install-terraform",language:"bash",code:`# MacOS (using Homebrew)
brew install terraform

# Windows (using Chocolatey)
choco install terraform

# Linux (Ubuntu/Debian)
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform`})]}),e.jsxs("div",{children:[e.jsx("h2",{className:"text-xl font-semibold mb-4",children:"Basic Terraform Commands"}),e.jsx(t,{id:"terraform-commands",language:"bash",code:`# Initialize Terraform (download providers)
terraform init

# Preview changes
terraform plan

# Apply changes
terraform apply

# Destroy resources
terraform destroy`})]})]}),r==="deploy-aws"&&e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-3xl font-bold mb-4",children:"Deploy to AWS"}),e.jsx("p",{className:"text-text-secondary text-lg",children:"Step-by-step guide to deploying your Cloudiverse-generated infrastructure to AWS."})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-6",children:[e.jsx("h2",{className:"text-xl font-semibold mb-4",children:"Step 1: Configure AWS Credentials"}),e.jsx(t,{id:"aws-creds",language:"bash",code:`# Install AWS CLI
brew install awscli  # or: choco install awscli

# Configure credentials
aws configure

# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (e.g., us-east-1)
# - Output format (json)`})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-6",children:[e.jsx("h2",{className:"text-xl font-semibold mb-4",children:"Step 2: Export Terraform from Cloudiverse"}),e.jsx("p",{className:"text-text-secondary mb-4",children:'In your Cloudiverse workspace, click "Export Terraform" and select AWS as your provider. Download the ZIP file and extract it to your project directory.'})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-6",children:[e.jsx("h2",{className:"text-xl font-semibold mb-4",children:"Step 3: Deploy"}),e.jsx(t,{id:"aws-deploy",language:"bash",code:`# Navigate to your Terraform directory
cd my-cloudiverse-project/aws

# Initialize Terraform
terraform init

# Preview your infrastructure
terraform plan

# Deploy (type 'yes' to confirm)
terraform apply

# Save your outputs
terraform output > outputs.txt`})]}),e.jsxs("div",{className:"bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6",children:[e.jsx("h3",{className:"font-semibold text-yellow-500 mb-2",children:"💡 Pro Tip"}),e.jsxs("p",{className:"text-text-secondary",children:["Always review the ",e.jsx("code",{className:"bg-surface px-2 py-1 rounded",children:"terraform plan"})," output before applying to understand what resources will be created and their estimated costs."]})]})]}),r==="deploy-gcp"&&e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-3xl font-bold mb-4",children:"Deploy to Google Cloud Platform"}),e.jsx("p",{className:"text-text-secondary text-lg",children:"Step-by-step guide to deploying your infrastructure to GCP."})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-6",children:[e.jsx("h2",{className:"text-xl font-semibold mb-4",children:"Step 1: Configure GCP Credentials"}),e.jsx(t,{id:"gcp-creds",language:"bash",code:`# Install Google Cloud SDK
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
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/terraform-key.json"`})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-6",children:[e.jsx("h2",{className:"text-xl font-semibold mb-4",children:"Step 2: Deploy"}),e.jsx(t,{id:"gcp-deploy",language:"bash",code:`# Navigate to GCP Terraform directory
cd my-cloudiverse-project/gcp

# Initialize and deploy
terraform init
terraform plan
terraform apply`})]})]}),r==="deploy-azure"&&e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-3xl font-bold mb-4",children:"Deploy to Microsoft Azure"}),e.jsx("p",{className:"text-text-secondary text-lg",children:"Step-by-step guide to deploying your infrastructure to Azure."})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-6",children:[e.jsx("h2",{className:"text-xl font-semibold mb-4",children:"Step 1: Configure Azure Credentials"}),e.jsx(t,{id:"azure-creds",language:"bash",code:`# Install Azure CLI
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
export ARM_TENANT_ID="<tenant>"`})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-6",children:[e.jsx("h2",{className:"text-xl font-semibold mb-4",children:"Step 2: Deploy"}),e.jsx(t,{id:"azure-deploy",language:"bash",code:`# Navigate to Azure Terraform directory
cd my-cloudiverse-project/azure

# Initialize and deploy
terraform init
terraform plan
terraform apply`})]})]}),r==="cost-estimation"&&e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-3xl font-bold mb-4",children:"Understanding Cost Estimates"}),e.jsx("p",{className:"text-text-secondary text-lg",children:"How Cloudiverse calculates and presents infrastructure costs."})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-6",children:[e.jsx("h2",{className:"text-xl font-semibold mb-4",children:"Cost Calculation"}),e.jsx("p",{className:"text-text-secondary mb-4",children:"Cloudiverse uses Infracost integration and provider pricing APIs to estimate costs. Cost estimates include:"}),e.jsxs("ul",{className:"space-y-2 text-text-secondary list-disc pl-5",children:[e.jsx("li",{children:"Compute resources (VMs, containers, serverless)"}),e.jsx("li",{children:"Database services"}),e.jsx("li",{children:"Storage and networking"}),e.jsx("li",{children:"Managed services (load balancers, CDN, etc.)"})]})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-6",children:[e.jsx("h2",{className:"text-xl font-semibold mb-4",children:"Confidence Levels"}),e.jsxs("ul",{className:"space-y-3",children:[e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"bg-green-500 text-white px-2 py-1 rounded text-sm mr-3",children:"HIGH"}),e.jsx("span",{className:"text-text-secondary",children:"All resources priced, ±20% accuracy"})]}),e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"bg-yellow-500 text-white px-2 py-1 rounded text-sm mr-3",children:"MEDIUM"}),e.jsx("span",{className:"text-text-secondary",children:"Some assumptions made, ±30% accuracy"})]}),e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"bg-red-500 text-white px-2 py-1 rounded text-sm mr-3",children:"LOW"}),e.jsx("span",{className:"text-text-secondary",children:"Traffic-based pricing, estimates may vary significantly"})]})]})]})]}),r==="security"&&e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-3xl font-bold mb-4",children:"Security Best Practices"}),e.jsx("p",{className:"text-text-secondary text-lg",children:"Security recommendations for your generated infrastructure."})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-6",children:[e.jsx("h2",{className:"text-xl font-semibold mb-4",children:"Built-in Security"}),e.jsx("p",{className:"text-text-secondary mb-4",children:"All Cloudiverse-generated Terraform includes:"}),e.jsxs("ul",{className:"space-y-2 text-text-secondary list-disc pl-5",children:[e.jsx("li",{children:"Private subnets for databases and internal services"}),e.jsx("li",{children:"Security groups with least-privilege access"}),e.jsx("li",{children:"Encryption at rest for databases and storage"}),e.jsx("li",{children:"TLS/SSL for all public endpoints"}),e.jsx("li",{children:"Secrets management integration"})]})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-6",children:[e.jsx("h2",{className:"text-xl font-semibold mb-4",children:"Post-Deployment Checklist"}),e.jsxs("ul",{className:"space-y-2 text-text-secondary",children:[e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"text-primary mr-2",children:"☐"}),"Rotate initial credentials and secrets"]}),e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"text-primary mr-2",children:"☐"}),"Enable cloud provider audit logging"]}),e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"text-primary mr-2",children:"☐"}),"Set up alerts for unusual activity"]}),e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"text-primary mr-2",children:"☐"}),"Configure automated backups"]}),e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"text-primary mr-2",children:"☐"}),"Review security group rules"]})]})]})]})]})]})]})};export{T as default};
