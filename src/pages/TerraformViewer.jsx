import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Copy, Download, Code, Eye, FileText } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'react-toastify';

const TerraformViewer = () => {
  const { projectId } = useParams();
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('code'); // code, preview

  // Mock Terraform code
  const terraformCode = `# Terraform configuration for cloud infrastructure
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
    Name = "cloud-planner-vpc"
    Project = "cloud-infrastructure-planner"
  }
}

# Create Internet Gateway
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name = "cloud-planner-igw"
  }
}

# Create Subnet
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "\${var.aws_region}a"
  
  tags = {
    Name = "cloud-planner-public-subnet"
  }
}

# Create Security Group for Web Server
resource "aws_security_group" "web_sg" {
  name        = "web-server-sg"
  description = "Security group for web servers"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "web-server-security-group"
  }
}

# Create Security Group for Database
resource "aws_security_group" "db_sg" {
  name        = "database-sg"
  description = "Security group for database"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.web_sg.id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "database-security-group"
  }
}

# Create EC2 Instance
resource "aws_instance" "web_server" {
  ami           = "ami-0c02fb55956c7d316"
  instance_type = var.instance_type
  subnet_id     = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.web_sg.id]
  
  tags = {
    Name    = "cloud-planner-web-server"
    Project = "cloud-infrastructure-planner"
  }
}

# Create RDS Instance
resource "aws_db_instance" "postgres_db" {
  allocated_storage      = 20
  engine                 = "postgres"
  engine_version         = "13"
  instance_class         = var.db_instance_class
  db_name                = "mydb"
  username               = "admin"
  password               = "password123"
  parameter_group_name   = "default.postgres13"
  skip_final_snapshot    = true
  publicly_accessible    = false
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.db_subnet_group.name
  
  tags = {
    Name    = "cloud-planner-postgres-db"
    Project = "cloud-infrastructure-planner"
  }
}

# Create DB Subnet Group
resource "aws_db_subnet_group" "db_subnet_group" {
  name       = "cloud-planner-db-subnet-group"
  subnet_ids = [aws_subnet.public.id]
  
  tags = {
    Name = "cloud-planner-db-subnet-group"
  }
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(terraformCode);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([terraformCode], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "main.tf";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.info('Downloading Terraform file...');
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Terraform Code</h1>
          <p className="text-text-secondary mt-1">Generated infrastructure as code</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setViewMode('code')}
            className={`btn flex items-center space-x-2 ${
              viewMode === 'code' ? 'btn-primary' : 'btn-secondary'
            }`}
          >
            <Code size={18} />
            <span>Code</span>
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`btn flex items-center space-x-2 ${
              viewMode === 'preview' ? 'btn-primary' : 'btn-secondary'
            }`}
          >
            <Eye size={18} />
            <span>Preview</span>
          </button>
          <button
            onClick={handleCopy}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <Copy size={18} />
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Download size={18} />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* File Tree */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-bold flex items-center">
                <FileText size={20} className="mr-2" />
                File Structure
              </h2>
            </div>
            <div className="card-body p-0">
              <div className="border-b border-border">
                <div className="p-4 font-medium">terraform/
                  <div className="ml-4 mt-2 space-y-2">
                    <div className="flex items-center p-2 rounded hover:bg-surface cursor-pointer text-primary">
                      <FileText size={16} className="mr-2" />
                      main.tf
                    </div>
                    <div className="flex items-center p-2 rounded hover:bg-surface cursor-pointer">
                      <FileText size={16} className="mr-2" />
                      variables.tf
                    </div>
                    <div className="flex items-center p-2 rounded hover:bg-surface cursor-pointer">
                      <FileText size={16} className="mr-2" />
                      outputs.tf
                    </div>
                    <div className="flex items-center p-2 rounded hover:bg-surface cursor-pointer">
                      <FileText size={16} className="mr-2" />
                      providers.tf
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <button className="btn btn-secondary w-full">
                  Download ZIP
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Code Viewer */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-bold">main.tf</h2>
            </div>
            <div className="card-body p-0">
              <SyntaxHighlighter
                language="hcl"
                style={oneDark}
                customStyle={{
                  backgroundColor: '#1E1E2E',
                  borderRadius: '0 0 0.75rem 0.75rem',
                  margin: 0,
                  padding: '1.5rem'
                }}
                showLineNumbers
              >
                {terraformCode}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment Instructions */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-bold">Deployment Instructions</h2>
        </div>
        <div className="card-body">
          <div className="prose prose-invert max-w-none">
            <h3>Prerequisites</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Install Terraform CLI (version 1.0+)</li>
              <li>Configure AWS CLI with appropriate credentials</li>
              <li>Ensure sufficient permissions for resource creation</li>
            </ul>
            
            <h3 className="mt-6">Deployment Steps</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Download the Terraform files using the Download button above</li>
              <li>Navigate to the downloaded directory in your terminal</li>
              <li>Initialize Terraform:
                <pre className="bg-code-block p-4 rounded mt-2">terraform init</pre>
              </li>
              <li>Review the execution plan:
                <pre className="bg-code-block p-4 rounded mt-2">terraform plan</pre>
              </li>
              <li>Apply the configuration:
                <pre className="bg-code-block p-4 rounded mt-2">terraform apply</pre>
              </li>
            </ol>
            
            <div className="alert alert-info mt-6">
              <p><strong>Note:</strong> The generated Terraform code is ready for deployment but should be reviewed for security and compliance requirements before production use.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Dock */}
      <AIDock />
    </div>
  );
};

export default TerraformViewer;