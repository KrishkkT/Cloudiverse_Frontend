import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Cloud, ArrowLeft, Book, Terminal, Server,
  ChevronRight, ChevronDown, Copy, Check,
  Zap, Shield, DollarSign, FileCode, Workflow
} from 'lucide-react';
import { toast } from 'react-toastify';

const PROVIDERS = ['aws', 'gcp', 'azure'];

const SERVICES_DB = {
  "aws": [
    {
      "id": "computecontainer",
      "name": "AWS ECS Fargate",
      "icon": "📦",
      "description": "Managed service for running Docker containers."
    },
    {
      "id": "computeserverless",
      "name": "AWS Lambda",
      "icon": "⚡",
      "description": "Run code without thinking about servers or clusters. Pay only for the compute time you consume."
    },
    {
      "id": "computevm",
      "name": "AWS Instance",
      "icon": "🖥️",
      "description": "Secure and resizable compute capacity in the cloud."
    },
    {
      "id": "computebatch",
      "name": "AWS Batch",
      "icon": "📊",
      "description": "Managed computebatch service for AWS."
    },
    {
      "id": "computeedge",
      "name": "AWS Cloudfront Functions",
      "icon": "☁️",
      "description": "Managed computeedge service for AWS."
    },
    {
      "id": "relationaldatabase",
      "name": "AWS RDS Postgresql",
      "icon": "🗄️",
      "description": "Managed relational database service that provides you with six familiar database engines, including Amazon Aurora, PostgreSQL, MySQL, MariaDB, Oracle Database, and SQL Server."
    },
    {
      "id": "nosqldatabase",
      "name": "AWS Dynamodb",
      "icon": "📉",
      "description": "Fast and flexible NoSQL database service for any scale."
    },
    {
      "id": "cache",
      "name": "AWS Elasticache Redis",
      "icon": "⚡",
      "description": "Fully managed in-memory caching service supporting flexible, real-time use cases."
    },
    {
      "id": "searchengine",
      "name": "AWS Opensearch",
      "icon": "☁️",
      "description": "Managed searchengine service for AWS."
    },
    {
      "id": "objectstorage",
      "name": "AWS S3",
      "icon": "📁",
      "description": "Object storage service that offers industry-leading scalability, data availability, security, and performance."
    },
    {
      "id": "blockstorage",
      "name": "AWS Ebs",
      "icon": "💾",
      "description": "Managed blockstorage service for AWS."
    },
    {
      "id": "filestorage",
      "name": "AWS Efs",
      "icon": "📂",
      "description": "Managed filestorage service for AWS."
    },
    {
      "id": "backup",
      "name": "AWS Backup",
      "icon": "♻️",
      "description": "Managed backup service for AWS."
    },
    {
      "id": "loadbalancer",
      "name": "AWS Alb",
      "icon": "⚖️",
      "description": "Distributes incoming application traffic across multiple targets, such as EC2 instances, in multiple Availability Zones."
    },
    {
      "id": "apigateway",
      "name": "AWS APIgateway V2",
      "icon": "🚪",
      "description": "Fully managed service that makes it easy for developers to create, publish, maintain, monitor, and secure APIs."
    },
    {
      "id": "cdn",
      "name": "AWS Cloudfront",
      "icon": "🌐",
      "description": "Fast, highly secure and programmable content delivery network (CDN)."
    },
    {
      "id": "dns",
      "name": "AWS Route53",
      "icon": "☁️",
      "description": "Managed dns service for AWS."
    },
    {
      "id": "vpcnetworking",
      "name": "AWS VPC",
      "icon": "🕸️",
      "description": "Global virtual network connecting your cloud resources."
    },
    {
      "id": "natgateway",
      "name": "AWS NAT Gateway",
      "icon": "🌐",
      "description": "Managed natgateway service for AWS."
    },
    {
      "id": "vpn",
      "name": "AWS VPN",
      "icon": "🔒",
      "description": "Managed vpn service for AWS."
    },
    {
      "id": "privatelink",
      "name": "AWS Privatelink",
      "icon": "🔗",
      "description": "Managed privatelink service for AWS."
    },
    {
      "id": "servicediscovery",
      "name": "AWS Cloud Map",
      "icon": "🔎",
      "description": "Managed servicediscovery service for AWS."
    },
    {
      "id": "servicemesh",
      "name": "AWS App Mesh",
      "icon": "🕸️",
      "description": "Managed servicemesh service for AWS."
    },
    {
      "id": "messagingqueue",
      "name": "AWS Sqs",
      "icon": "📬",
      "description": "Managed messagingqueue service for AWS."
    },
    {
      "id": "eventbus",
      "name": "AWS Eventbridge",
      "icon": "🚌",
      "description": "Serverless event bus that makes it easier to build event-driven applications at scale using events generated from your applications, integrated SaaS applications, and AWS services."
    },
    {
      "id": "workfloworchestration",
      "name": "AWS Step Functions",
      "icon": "🔄",
      "description": "Managed workfloworchestration service for AWS."
    },
    {
      "id": "notification",
      "name": "AWS Sns",
      "icon": "🔔",
      "description": "Managed notification service for AWS."
    },
    {
      "id": "identityauth",
      "name": "AWS Cognito",
      "icon": "🔐",
      "description": "Identity platform for web and mobile apps. It’s a user directory, an authentication server, and an authorization service for OAuth 2.0 access tokens."
    },
    {
      "id": "secretsmanagement",
      "name": "AWS Secrets Manager",
      "icon": "🔑",
      "description": "service to help you protect access to your applications, services, and IT resources."
    },
    {
      "id": "keymanagement",
      "name": "AWS KMS",
      "icon": "🔑",
      "description": "Managed keymanagement service for AWS."
    },
    {
      "id": "certificatemanagement",
      "name": "AWS Acm",
      "icon": "📜",
      "description": "Managed certificatemanagement service for AWS."
    },
    {
      "id": "waf",
      "name": "AWS WAF",
      "icon": "🛡️",
      "description": "Web Application Firewall that helps protect your web applications or APIs against common web exploits and bots."
    },
    {
      "id": "ddosprotection",
      "name": "AWS Shield",
      "icon": "🛡️",
      "description": "Managed ddosprotection service for AWS."
    },
    {
      "id": "policygovernance",
      "name": "AWS Organizations",
      "icon": "⚖️",
      "description": "Managed policygovernance service for AWS."
    },
    {
      "id": "monitoring",
      "name": "AWS Cloudwatch",
      "icon": "📊",
      "description": "Observability of your AWS resources and applications on AWS and on-premises."
    },
    {
      "id": "logging",
      "name": "AWS Cloudwatch Logs",
      "icon": "📜",
      "description": "Monitor, store, and access your log files from Amazon EC2 instances, AWS CloudTrail, Route 53, and other sources."
    },
    {
      "id": "tracing",
      "name": "AWS Xray",
      "icon": "🔍",
      "description": "Managed tracing service for AWS."
    },
    {
      "id": "siem",
      "name": "AWS Security Hub",
      "icon": "🛡️",
      "description": "Managed siem service for AWS."
    },
    {
      "id": "containerregistry",
      "name": "AWS Ecr",
      "icon": "🐳",
      "description": "Managed containerregistry service for AWS."
    },
    {
      "id": "cicd",
      "name": "AWS Codepipeline",
      "icon": "🚀",
      "description": "Managed cicd service for AWS."
    },
    {
      "id": "artifactrepository",
      "name": "AWS Codeartifact",
      "icon": "📦",
      "description": "Managed artifactrepository service for AWS."
    },
    {
      "id": "iotcore",
      "name": "AWS IoT Core",
      "icon": "📱",
      "description": "Managed iotcore service for AWS."
    },
    {
      "id": "timeseriesdatabase",
      "name": "AWS Timestream",
      "icon": "⏱️",
      "description": "Managed timeseriesdatabase service for AWS."
    },
    {
      "id": "eventstream",
      "name": "AWS Kinesis Streams",
      "icon": "📡",
      "description": "Managed eventstream service for AWS."
    },
    {
      "id": "datawarehouse",
      "name": "AWS Redshift",
      "icon": "🏛️",
      "description": "Managed datawarehouse service for AWS."
    },
    {
      "id": "streamprocessor",
      "name": "AWS Kinesis Analytics",
      "icon": "🌊",
      "description": "Managed streamprocessor service for AWS."
    },
    {
      "id": "mltraining",
      "name": "AWS Sagemaker Training",
      "icon": "🧠",
      "description": "Managed mltraining service for AWS."
    },
    {
      "id": "mlinference",
      "name": "AWS Sagemaker Endpoint",
      "icon": "🤖",
      "description": "Managed mlinference service for AWS."
    },
    {
      "id": "featurestore",
      "name": "AWS Sagemaker Feature Store",
      "icon": "🗃️",
      "description": "Managed featurestore service for AWS."
    }
  ],
  "gcp": [
    {
      "id": "computecontainer",
      "name": "GCP Cloud Run",
      "icon": "📦",
      "description": "Managed service for running Docker containers."
    },
    {
      "id": "computeserverless",
      "name": "GCP Cloud Functions",
      "icon": "⚡",
      "description": "Run code without thinking about servers or clusters. Pay only for the compute time you consume."
    },
    {
      "id": "computevm",
      "name": "GCP Compute Engine",
      "icon": "🖥️",
      "description": "Secure and resizable compute capacity in the cloud."
    },
    {
      "id": "computebatch",
      "name": "GCP Batch",
      "icon": "📊",
      "description": "Managed computebatch service for GCP."
    },
    {
      "id": "computeedge",
      "name": "GCP Cloud CDN Edge",
      "icon": "☁️",
      "description": "Managed computeedge service for GCP."
    },
    {
      "id": "relationaldatabase",
      "name": "GCP Cloud SQL Postgres",
      "icon": "🗄️",
      "description": "Managed relational database service that provides you with six familiar database engines, including Amazon Aurora, PostgreSQL, MySQL, MariaDB, Oracle Database, and SQL Server."
    },
    {
      "id": "nosqldatabase",
      "name": "GCP Firestore",
      "icon": "📉",
      "description": "Fast and flexible NoSQL database service for any scale."
    },
    {
      "id": "cache",
      "name": "GCP Memorystore Redis",
      "icon": "⚡",
      "description": "Fully managed in-memory caching service supporting flexible, real-time use cases."
    },
    {
      "id": "searchengine",
      "name": "GCP Elastic Cloud",
      "icon": "☁️",
      "description": "Managed searchengine service for GCP."
    },
    {
      "id": "objectstorage",
      "name": "GCP Cloud Storage",
      "icon": "📁",
      "description": "Object storage service that offers industry-leading scalability, data availability, security, and performance."
    },
    {
      "id": "blockstorage",
      "name": "GCP Persistent Disk",
      "icon": "💾",
      "description": "Managed blockstorage service for GCP."
    },
    {
      "id": "filestorage",
      "name": "GCP Filestore",
      "icon": "📂",
      "description": "Managed filestorage service for GCP."
    },
    {
      "id": "backup",
      "name": "GCP Backup And Dr",
      "icon": "♻️",
      "description": "Managed backup service for GCP."
    },
    {
      "id": "loadbalancer",
      "name": "GCP Cloud Load Balancing",
      "icon": "⚖️",
      "description": "Distributes incoming application traffic across multiple targets, such as EC2 instances, in multiple Availability Zones."
    },
    {
      "id": "apigateway",
      "name": "GCP API Gateway",
      "icon": "🚪",
      "description": "Fully managed service that makes it easy for developers to create, publish, maintain, monitor, and secure APIs."
    },
    {
      "id": "cdn",
      "name": "GCP Cloud CDN",
      "icon": "🌐",
      "description": "Fast, highly secure and programmable content delivery network (CDN)."
    },
    {
      "id": "dns",
      "name": "GCP Cloud DNS",
      "icon": "☁️",
      "description": "Managed dns service for GCP."
    },
    {
      "id": "vpcnetworking",
      "name": "GCP VPC",
      "icon": "🕸️",
      "description": "Global virtual network connecting your cloud resources."
    },
    {
      "id": "natgateway",
      "name": "GCP Cloud NAT",
      "icon": "🌐",
      "description": "Managed natgateway service for GCP."
    },
    {
      "id": "vpn",
      "name": "GCP Cloud VPN",
      "icon": "🔒",
      "description": "Managed vpn service for GCP."
    },
    {
      "id": "privatelink",
      "name": "GCP Private Service Connect",
      "icon": "🔗",
      "description": "Managed privatelink service for GCP."
    },
    {
      "id": "servicediscovery",
      "name": "GCP Service Directory",
      "icon": "🔎",
      "description": "Managed servicediscovery service for GCP."
    },
    {
      "id": "servicemesh",
      "name": "GCP Anthos Service Mesh",
      "icon": "🕸️",
      "description": "Managed servicemesh service for GCP."
    },
    {
      "id": "messagingqueue",
      "name": "GCP Pubsub",
      "icon": "📬",
      "description": "Managed messagingqueue service for GCP."
    },
    {
      "id": "eventbus",
      "name": "GCP Eventarc",
      "icon": "🚌",
      "description": "Serverless event bus that makes it easier to build event-driven applications at scale using events generated from your applications, integrated SaaS applications, and AWS services."
    },
    {
      "id": "workfloworchestration",
      "name": "GCP Workflows",
      "icon": "🔄",
      "description": "Managed workfloworchestration service for GCP."
    },
    {
      "id": "notification",
      "name": "GCP Pubsub Notifications",
      "icon": "🔔",
      "description": "Managed notification service for GCP."
    },
    {
      "id": "identityauth",
      "name": "GCP Identity Platform",
      "icon": "🔐",
      "description": "Identity platform for web and mobile apps. It’s a user directory, an authentication server, and an authorization service for OAuth 2.0 access tokens."
    },
    {
      "id": "secretsmanagement",
      "name": "GCP Secret Manager",
      "icon": "🔑",
      "description": "service to help you protect access to your applications, services, and IT resources."
    },
    {
      "id": "keymanagement",
      "name": "GCP Cloud KMS",
      "icon": "🔑",
      "description": "Managed keymanagement service for GCP."
    },
    {
      "id": "certificatemanagement",
      "name": "GCP Certificate Manager",
      "icon": "📜",
      "description": "Managed certificatemanagement service for GCP."
    },
    {
      "id": "waf",
      "name": "GCP Cloud Armor",
      "icon": "🛡️",
      "description": "Web Application Firewall that helps protect your web applications or APIs against common web exploits and bots."
    },
    {
      "id": "ddosprotection",
      "name": "GCP Cloud Armor DDoS",
      "icon": "🛡️",
      "description": "Managed ddosprotection service for GCP."
    },
    {
      "id": "policygovernance",
      "name": "GCP Org Policy",
      "icon": "⚖️",
      "description": "Managed policygovernance service for GCP."
    },
    {
      "id": "monitoring",
      "name": "GCP Cloud Monitoring",
      "icon": "📊",
      "description": "Observability of your AWS resources and applications on AWS and on-premises."
    },
    {
      "id": "logging",
      "name": "GCP Cloud Logging",
      "icon": "📜",
      "description": "Monitor, store, and access your log files from Amazon EC2 instances, AWS CloudTrail, Route 53, and other sources."
    },
    {
      "id": "tracing",
      "name": "GCP Cloud Trace",
      "icon": "🔍",
      "description": "Managed tracing service for GCP."
    },
    {
      "id": "siem",
      "name": "GCP Security Command Center",
      "icon": "🛡️",
      "description": "Managed siem service for GCP."
    },
    {
      "id": "containerregistry",
      "name": "GCP Artifact Registry",
      "icon": "🐳",
      "description": "Managed containerregistry service for GCP."
    },
    {
      "id": "cicd",
      "name": "GCP Cloud Build",
      "icon": "🚀",
      "description": "Managed cicd service for GCP."
    },
    {
      "id": "artifactrepository",
      "name": "GCP Artifact Registry",
      "icon": "📦",
      "description": "Managed artifactrepository service for GCP."
    },
    {
      "id": "iotcore",
      "name": "GCP IoT Registry Legacy",
      "icon": "📱",
      "description": "Managed iotcore service for GCP."
    },
    {
      "id": "timeseriesdatabase",
      "name": "GCP Bigquery Timeseries",
      "icon": "⏱️",
      "description": "Managed timeseriesdatabase service for GCP."
    },
    {
      "id": "eventstream",
      "name": "GCP Pubsub",
      "icon": "📡",
      "description": "Managed eventstream service for GCP."
    },
    {
      "id": "datawarehouse",
      "name": "GCP Bigquery",
      "icon": "🏛️",
      "description": "Managed datawarehouse service for GCP."
    },
    {
      "id": "streamprocessor",
      "name": "GCP Dataflow",
      "icon": "🌊",
      "description": "Managed streamprocessor service for GCP."
    },
    {
      "id": "mltraining",
      "name": "GCP Vertex Ai Training",
      "icon": "🧠",
      "description": "Managed mltraining service for GCP."
    },
    {
      "id": "mlinference",
      "name": "GCP Vertex Ai Endpoint",
      "icon": "🤖",
      "description": "Managed mlinference service for GCP."
    },
    {
      "id": "featurestore",
      "name": "GCP Vertex Feature Store",
      "icon": "🗃️",
      "description": "Managed featurestore service for GCP."
    }
  ],
  "azure": [
    {
      "id": "computecontainer",
      "name": "Azure Container Apps",
      "icon": "📦",
      "description": "Managed service for running Docker containers."
    },
    {
      "id": "computeserverless",
      "name": "Azure Functions",
      "icon": "⚡",
      "description": "Run code without thinking about servers or clusters. Pay only for the compute time you consume."
    },
    {
      "id": "computevm",
      "name": "Azure Virtual Machines",
      "icon": "🖥️",
      "description": "Secure and resizable compute capacity in the cloud."
    },
    {
      "id": "computebatch",
      "name": "Azure Batch",
      "icon": "📊",
      "description": "Managed computebatch service for AZURE."
    },
    {
      "id": "computeedge",
      "name": "Azure Front Door Edge",
      "icon": "☁️",
      "description": "Managed computeedge service for AZURE."
    },
    {
      "id": "relationaldatabase",
      "name": "Azure Postgresql Flexible",
      "icon": "🗄️",
      "description": "Managed relational database service that provides you with six familiar database engines, including Amazon Aurora, PostgreSQL, MySQL, MariaDB, Oracle Database, and SQL Server."
    },
    {
      "id": "nosqldatabase",
      "name": "Azure Cosmosdb",
      "icon": "📉",
      "description": "Fast and flexible NoSQL database service for any scale."
    },
    {
      "id": "cache",
      "name": "Azure Redis",
      "icon": "⚡",
      "description": "Fully managed in-memory caching service supporting flexible, real-time use cases."
    },
    {
      "id": "searchengine",
      "name": "Azure Ai Search",
      "icon": "☁️",
      "description": "Managed searchengine service for AZURE."
    },
    {
      "id": "objectstorage",
      "name": "Azure Blob Storage",
      "icon": "📁",
      "description": "Object storage service that offers industry-leading scalability, data availability, security, and performance."
    },
    {
      "id": "blockstorage",
      "name": "Azure Managed Disks",
      "icon": "💾",
      "description": "Managed blockstorage service for AZURE."
    },
    {
      "id": "filestorage",
      "name": "Azure Files",
      "icon": "📂",
      "description": "Managed filestorage service for AZURE."
    },
    {
      "id": "backup",
      "name": "Azure Recovery Services",
      "icon": "♻️",
      "description": "Managed backup service for AZURE."
    },
    {
      "id": "loadbalancer",
      "name": "Azure Application Gateway",
      "icon": "⚖️",
      "description": "Distributes incoming application traffic across multiple targets, such as EC2 instances, in multiple Availability Zones."
    },
    {
      "id": "apigateway",
      "name": "Azure API Management",
      "icon": "🚪",
      "description": "Fully managed service that makes it easy for developers to create, publish, maintain, monitor, and secure APIs."
    },
    {
      "id": "cdn",
      "name": "Azure CDN",
      "icon": "🌐",
      "description": "Fast, highly secure and programmable content delivery network (CDN)."
    },
    {
      "id": "dns",
      "name": "Azure DNS",
      "icon": "☁️",
      "description": "Managed dns service for AZURE."
    },
    {
      "id": "vpcnetworking",
      "name": "Azure Virtual Network",
      "icon": "🕸️",
      "description": "Global virtual network connecting your cloud resources."
    },
    {
      "id": "natgateway",
      "name": "Azure NAT Gateway",
      "icon": "🌐",
      "description": "Managed natgateway service for AZURE."
    },
    {
      "id": "vpn",
      "name": "Azure VPN Gateway",
      "icon": "🔒",
      "description": "Managed vpn service for AZURE."
    },
    {
      "id": "privatelink",
      "name": "Azure Private Endpoint",
      "icon": "🔗",
      "description": "Managed privatelink service for AZURE."
    },
    {
      "id": "servicediscovery",
      "name": "Azure Private DNS",
      "icon": "🔎",
      "description": "Managed servicediscovery service for AZURE."
    },
    {
      "id": "servicemesh",
      "name": "Azure Service Mesh Aks",
      "icon": "🕸️",
      "description": "Managed servicemesh service for AZURE."
    },
    {
      "id": "messagingqueue",
      "name": "Azure Service Bus",
      "icon": "📬",
      "description": "Managed messagingqueue service for AZURE."
    },
    {
      "id": "eventbus",
      "name": "Azure Event Grid",
      "icon": "🚌",
      "description": "Serverless event bus that makes it easier to build event-driven applications at scale using events generated from your applications, integrated SaaS applications, and AWS services."
    },
    {
      "id": "workfloworchestration",
      "name": "Azure Logic Apps",
      "icon": "🔄",
      "description": "Managed workfloworchestration service for AZURE."
    },
    {
      "id": "notification",
      "name": "Azure Notification Hubs",
      "icon": "🔔",
      "description": "Managed notification service for AZURE."
    },
    {
      "id": "identityauth",
      "name": "Azure Ad B2c",
      "icon": "🔐",
      "description": "Identity platform for web and mobile apps. It’s a user directory, an authentication server, and an authorization service for OAuth 2.0 access tokens."
    },
    {
      "id": "secretsmanagement",
      "name": "Azure Key Vault Secrets",
      "icon": "🔑",
      "description": "service to help you protect access to your applications, services, and IT resources."
    },
    {
      "id": "keymanagement",
      "name": "Azure Key Vault Keys",
      "icon": "🔑",
      "description": "Managed keymanagement service for AZURE."
    },
    {
      "id": "certificatemanagement",
      "name": "Azure Key Vault Certs",
      "icon": "📜",
      "description": "Managed certificatemanagement service for AZURE."
    },
    {
      "id": "waf",
      "name": "Azure WAF",
      "icon": "🛡️",
      "description": "Web Application Firewall that helps protect your web applications or APIs against common web exploits and bots."
    },
    {
      "id": "ddosprotection",
      "name": "Azure DDoS Protection",
      "icon": "🛡️",
      "description": "Managed ddosprotection service for AZURE."
    },
    {
      "id": "policygovernance",
      "name": "Azure Azure Policy",
      "icon": "⚖️",
      "description": "Managed policygovernance service for AZURE."
    },
    {
      "id": "monitoring",
      "name": "Azure Monitor",
      "icon": "📊",
      "description": "Observability of your AWS resources and applications on AWS and on-premises."
    },
    {
      "id": "logging",
      "name": "Azure Log Analytics",
      "icon": "📜",
      "description": "Monitor, store, and access your log files from Amazon EC2 instances, AWS CloudTrail, Route 53, and other sources."
    },
    {
      "id": "tracing",
      "name": "Azure App Insights",
      "icon": "🔍",
      "description": "Managed tracing service for AZURE."
    },
    {
      "id": "siem",
      "name": "Azure Sentinel",
      "icon": "🛡️",
      "description": "Managed siem service for AZURE."
    },
    {
      "id": "containerregistry",
      "name": "Azure Acr",
      "icon": "🐳",
      "description": "Managed containerregistry service for AZURE."
    },
    {
      "id": "cicd",
      "name": "Azure Devops",
      "icon": "🚀",
      "description": "Managed cicd service for AZURE."
    },
    {
      "id": "artifactrepository",
      "name": "Azure Artifacts",
      "icon": "📦",
      "description": "Managed artifactrepository service for AZURE."
    },
    {
      "id": "iotcore",
      "name": "Azure IoT Hub",
      "icon": "📱",
      "description": "Managed iotcore service for AZURE."
    },
    {
      "id": "timeseriesdatabase",
      "name": "Azure Data Explorer",
      "icon": "⏱️",
      "description": "Managed timeseriesdatabase service for AZURE."
    },
    {
      "id": "eventstream",
      "name": "Azure Event Hubs",
      "icon": "📡",
      "description": "Managed eventstream service for AZURE."
    },
    {
      "id": "datawarehouse",
      "name": "Azure Synapse",
      "icon": "🏛️",
      "description": "Managed datawarehouse service for AZURE."
    },
    {
      "id": "streamprocessor",
      "name": "Azure Stream Analytics",
      "icon": "🌊",
      "description": "Managed streamprocessor service for AZURE."
    },
    {
      "id": "mltraining",
      "name": "Azure ML Training",
      "icon": "🧠",
      "description": "Managed mltraining service for AZURE."
    },
    {
      "id": "mlinference",
      "name": "Azure ML Endpoint",
      "icon": "🤖",
      "description": "Managed mlinference service for AZURE."
    },
    {
      "id": "featurestore",
      "name": "Azure ML Feature Store",
      "icon": "🗃️",
      "description": "Managed featurestore service for AZURE."
    }
  ]
};

const Docs = () => {
  const navigate = useNavigate();
  const { section: paramSection } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // Default to getting-started if no section param
  const activeSection = paramSection || searchParams.get('section') || 'getting-started';

  const [copiedCode, setCopiedCode] = useState(null);

  // For Cloud Services Tabs
  const initialProvider = searchParams.get('provider') || 'aws';
  const initialService = searchParams.get('service');
  const [activeProvider, setActiveProvider] = useState(initialProvider);
  const [highlightedService, setHighlightedService] = useState(initialService);

  // Sync state with URL params when they change
  useEffect(() => {
    if (searchParams.get('provider')) {
      setActiveProvider(searchParams.get('provider'));
    }
    if (searchParams.get('service')) {
      setHighlightedService(searchParams.get('service'));
    }
  }, [searchParams]);

  const updateProvider = (provider) => {
    setActiveProvider(provider);
    setSearchParams({ provider, ...(highlightedService ? { service: highlightedService } : {}) });
  };

  useEffect(() => {
    // Scroll to highlighted service if present (only when on cloud-services section)
    if (activeSection === 'cloud-services' && highlightedService) {
      // Small delay to ensure render
      setTimeout(() => {
        const el = document.getElementById(highlightedService);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-2', 'ring-primary', 'bg-white/10');
          setTimeout(() => el.classList.remove('ring-2', 'ring-primary', 'bg-white/10'), 2000);
        }
      }, 100);
    }
  }, [highlightedService, activeProvider, activeSection]);

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const navigateToSection = (sectionId) => {
    navigate(`/docs/${sectionId}`);
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
    { id: 'architecture-diagrams', title: 'Architecture Diagrams', icon: <Workflow className="h-4 w-4" /> },
    { id: 'cloud-services', title: 'Cloud Services', icon: <Cloud className="h-4 w-4" /> },
    { id: 'cost-estimation', title: 'Cost Estimation', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'security', title: 'Security', icon: <Shield className="h-4 w-4" /> },
    { id: 'deployment', title: 'Deployment Guides', icon: <Server className="h-4 w-4" /> }
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      {/* Global Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border h-16 shrink-0">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/cloudiverse.png" alt="Cloudiverse" className="h-8 w-auto" />
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-sm font-medium text-text-secondary hover:text-primary transition-colors bg-surface/50 hover:bg-surface border border-border rounded-lg px-3 py-1.5"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </button>
        </div>
      </header>

      <div className="flex flex-1 md:flex-row overflow-hidden h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-surface border-r border-border p-4 overflow-y-auto shrink-0 hidden md:block">
          <div className="flex items-center mb-6 pl-2 pt-2">
            <button onClick={() => navigate('/')} className="mr-2 md:hidden">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              <Book className="h-5 w-5 text-primary" />
              <span className="font-bold text-lg tracking-tight">Documentation</span>
            </div>
          </div>

          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => navigateToSection(section.id)}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${activeSection === section.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-text-secondary hover:bg-surface/80 hover:text-text-primary'
                  }`}
              >
                {section.icon}
                <span className="ml-3 text-sm">{section.title}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Header (Mobile only) */}
          <div className="md:hidden p-4 border-b border-border flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10">
            <span className="font-semibold capitalize">{activeSection.replace('-', ' ')}</span>
          </div>

          <div className="p-4 md:p-12 max-w-5xl mx-auto space-y-12 animate-fade-in">

            {/* Getting Started */}
            {activeSection === 'getting-started' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl font-bold mb-4 tracking-tight">Getting Started</h1>
                  <p className="text-text-secondary text-lg leading-relaxed max-w-3xl">
                    Learn how to design, generate, and deploy cloud infrastructure using Cloudiverse Architect.
                    From idea to production-ready Terraform in minutes.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-surface border border-border rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center"><Terminal className="mr-2 h-5 w-5 text-primary" /> Quick Start</h2>
                    <ol className="space-y-4 text-text-secondary">
                      <li className="flex gap-4">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">1</span>
                        <div>
                          <strong className="text-text-primary block mb-1">Create a Workspace</strong>
                          <span className="text-sm">Describe your app in plain English. AI generates the architecture.</span>
                        </div>
                      </li>
                      <li className="flex gap-4">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">2</span>
                        <div>
                          <strong className="text-text-primary block mb-1">Refine & Cost</strong>
                          <span className="text-sm">Tweak the diagram, review cost estimates, and choose your provider.</span>
                        </div>
                      </li>
                      <li className="flex gap-4">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">3</span>
                        <div>
                          <strong className="text-text-primary block mb-1">Export Terraform</strong>
                          <span className="text-sm">Download the complete Terraform project zip, ready to deploy.</span>
                        </div>
                      </li>
                    </ol>
                  </div>

                  <div className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-center items-center text-center space-y-4">
                    <div className="bg-primary/10 p-4 rounded-full text-primary">
                      <Cloud className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold">Ready to build?</h3>
                    <p className="text-text-secondary text-sm">Start a new project now to see Cloudiverse in action.</p>
                    <button onClick={() => navigate('/workspace/new')} className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-dark transition-colors">
                      New Project
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Terraform Basics */}
            {activeSection === 'terraform-basics' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl font-bold mb-4 tracking-tight">Terraform Basics</h1>
                  <p className="text-text-secondary text-lg max-w-3xl">
                    Terraform is an Infrastructure as Code (IaC) tool that allows you to define, audit, and deploy cloud resources using a human-readable configuration language (HCL).
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="bg-surface border border-border rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-4">Core Concepts</h2>
                    <ul className="space-y-3 text-sm">
                      <li>
                        <strong className="text-white block">Providers</strong>
                        <span className="text-text-secondary">Plugins that interact with cloud APIs (e.g., `aws`, `google`).</span>
                      </li>
                      <li>
                        <strong className="text-white block">Resources</strong>
                        <span className="text-text-secondary">The actual infrastructure components (e.g., `aws_instance`, `google_storage_bucket`).</span>
                      </li>
                      <li>
                        <strong className="text-white block">Modules</strong>
                        <span className="text-text-secondary">Reusable containers for multiple resources. Cloudiverse generates modular code by default.</span>
                      </li>
                      <li>
                        <strong className="text-white block">State</strong>
                        <span className="text-text-secondary">Terraform maps real-world resources to your configuration in a `terraform.tfstate` file.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-surface border border-border rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-4">Prerequisites</h2>
                    <ul className="space-y-2 text-text-secondary list-disc pl-5 text-sm">
                      <li><strong>Terraform CLI:</strong> Version 1.5.0 or higher.</li>
                      <li><strong>Cloud CLI:</strong> AWS CLI, gcloud CLI, or Azure CLI for authentication.</li>
                      <li><strong>Code Editor:</strong> VS Code with the Terraform extension is recommended.</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">Essential Commands</h2>
                  <div className="space-y-4">
                    <CodeBlock
                      id="tf-init"
                      language="bash"
                      code={`# 1. Initialize
# Downloads providers and modules defined in your configuration.
terraform init`}
                    />
                    <CodeBlock
                      id="tf-plan"
                      language="bash"
                      code={`# 2. Plan
# Creates an execution plan, showing what actions Terraform will take.
# Always review this before applying!
terraform plan`}
                    />
                    <CodeBlock
                      id="tf-apply"
                      language="bash"
                      code={`# 3. Apply
# Executes the changes on your cloud provider.
terraform apply`}
                    />
                    <CodeBlock
                      id="tf-destroy"
                      language="bash"
                      code={`# 4. Destroy
# Removes all resources managed by your configuration.
terraform destroy`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Architecture Diagrams */}
            {activeSection === 'architecture-diagrams' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl font-bold mb-4 tracking-tight">Architecture Diagrams</h1>
                  <p className="text-text-secondary text-lg max-w-3xl">
                    The interactive architecture diagram is the heart of Cloudiverse. It visualizes the relationships between your services, networks, and data flows.
                  </p>
                </div>

                <div className="bg-surface border border-border rounded-xl p-6">
                  <h2 className="text-xl font-semibold mb-4">Using the Canvas</h2>
                  <div className="grid md:grid-cols-3 gap-6 text-sm">
                    <div>
                      <h3 className="font-bold text-white mb-2">Navigation</h3>
                      <p className="text-text-secondary">Zoom in/out with your mouse wheel. Click and drag on empty space to pan across the diagram.</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-2">Selection</h3>
                      <p className="text-text-secondary">Click any node to see its details in the side panel. Selected nodes are highlighted.</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-2">Auto-Layout</h3>
                      <p className="text-text-secondary">We use a directed graph algorithm (Dagre) to automatically arrange services in logical tiers.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-surface border border-border rounded-xl p-6">
                  <h2 className="text-xl font-semibold mb-4">Exporting Diagrams</h2>
                  <p className="text-text-secondary mb-4">
                    You can export high-quality images of your architecture for presentations or documentation.
                  </p>
                  <ul className="space-y-2 text-text-secondary list-disc pl-5">
                    <li><strong>Full Graph Capture:</strong> The export function captures the entire diagram, even parts currently off-screen.</li>
                    <li><strong>High Resolution:</strong> Images are exported at 3x pixel density for crisp printing.</li>
                    <li><strong>Transparent Background:</strong> Useful for embedding in dark-mode slides (default background is dark navy).</li>
                  </ul>
                </div>

                <div className="bg-surface border border-border rounded-xl p-6">
                  <h2 className="text-xl font-semibold mb-4">Component Legend</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/5">
                      <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                      <span className="text-sm font-medium">Compute</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/5">
                      <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                      <span className="text-sm font-medium">Database</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/5">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                      <span className="text-sm font-medium">Storage</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/5">
                      <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                      <span className="text-sm font-medium">Networking</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/5">
                      <div className="w-3 h-3 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]"></div>
                      <span className="text-sm font-medium">Security</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cloud Services (Merged from ServiceDocs.jsx) */}
            {activeSection === 'cloud-services' && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-4 mb-2">
                      <h1 className="text-4xl font-bold tracking-tight">Cloud Services</h1>
                      <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold flex items-center">
                        <span className="mr-1">{(SERVICES_DB[activeProvider] || []).length}</span>
                        <span className="capitalize">{activeProvider} Services</span>
                      </div>
                    </div>
                    <p className="text-text-secondary text-lg">
                      Catalog of supported services and their Terraform modules.
                    </p>
                  </div>
                  {/* Provider Tabs */}
                  <div className="flex space-x-1 bg-surface border border-border p-1 rounded-lg self-start">
                    {PROVIDERS.map(provider => (
                      <button
                        key={provider}
                        onClick={() => updateProvider(provider)}
                        className={`px-4 py-2 rounded-md font-bold capitalize transition-all text-sm ${activeProvider === provider
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                          }`}
                      >
                        {provider}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {SERVICES_DB[activeProvider]?.map(service => (
                    <div
                      key={service.id}
                      id={service.id}
                      className="bg-surface border border-border rounded-xl p-6 hover:border-primary/50 transition-colors group flex flex-col"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                          {service.icon}
                        </div>
                        <div className="text-xs font-mono text-gray-500 bg-black/30 px-2 py-1 rounded">
                          {service.id}
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-text-primary mb-2">{service.name}</h3>
                      <p className="text-sm text-text-secondary leading-relaxed mb-4 flex-grow">
                        {service.description}
                      </p>

                      <div className="pt-4 border-t border-border flex items-center justify-between text-xs mt-auto">
                        <span className="text-text-secondary">Terraform Module:</span>
                        <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded font-mono">modules/{service.id}</code>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Empty State */}
                {(!SERVICES_DB[activeProvider] || SERVICES_DB[activeProvider].length === 0) && (
                  <div className="text-center py-20 bg-surface rounded-2xl border border-dashed border-border">
                    <span className="material-icons text-gray-600 text-6xl mb-4">construction</span>
                    <h3 className="text-xl font-bold text-gray-400">Documentation Coming Soon</h3>
                    <p className="text-gray-500">We are currently writing the docs for {activeProvider}.</p>
                  </div>
                )}
              </div>
            )}

            {/* Cost Estimation */}
            {activeSection === 'cost-estimation' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold mb-4">Cost Estimation</h1>
                  <p className="text-text-secondary text-lg max-w-3xl">
                    Cloudiverse integrates with Infracost to provide granular, itemized cost estimates for your infrastructure before you deploy.
                  </p>
                </div>

                <div className="bg-surface border border-border rounded-xl p-6">
                  <h2 className="text-xl font-semibold mb-4">How it Works</h2>
                  <p className="text-text-secondary mb-4">
                    The cost estimation engine parses your generated Terraform plan and maps resources to pricing items from the cloud provider's official API.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-white/5 p-4 rounded-lg">
                      <h4 className="font-bold text-white mb-2">Included Costs</h4>
                      <ul className="text-sm text-text-secondary list-disc pl-4 space-y-1">
                        <li>Compute Instances (hourly rates)</li>
                        <li>Managed Databases (storage + instance)</li>
                        <li>Load Balancers (base price)</li>
                        <li>Block Storage Volumes (GB/month)</li>
                      </ul>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg">
                      <h4 className="font-bold text-white mb-2">Usage Assumptions</h4>
                      <ul className="text-sm text-text-secondary list-disc pl-4 space-y-1">
                        <li>730 hours/month (running 24/7)</li>
                        <li>Standard storage tiers (unless specified)</li>
                        <li>On-demand pricing (no reserved instances)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-surface border border-border rounded-xl p-6">
                  <h2 className="text-xl font-semibold mb-4">Confidence Levels</h2>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-1 rounded text-xs font-bold mr-3 mt-0.5 min-w-[80px] text-center">HIGH</span>
                      <span className="text-text-secondary text-sm">Resources with fixed hourly rates (e.g., EC2, RDS). We know exactly what these cost per hour.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-1 rounded text-xs font-bold mr-3 mt-0.5 min-w-[80px] text-center">MEDIUM</span>
                      <span className="text-text-secondary text-sm">Resources that depend on volume or throughput (e.g., S3 Storage, Data Transfer). We apply reasonable industry averages.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-1 rounded text-xs font-bold mr-3 mt-0.5 min-w-[80px] text-center">LOW</span>
                      <span className="text-text-secondary text-sm">Highly variable costs like Serverless (Lambda invocations) or detailed Network Egress, which heavily depend on your specific app usage.</span>
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
                    Cloudiverse follows "Secure by Design" principles. Every module we generate includes industry-standard security configurations.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-surface border border-border rounded-xl p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center text-primary"><Shield className="mr-2 h-5 w-5" /> Infrastructure Security</h3>
                    <ul className="space-y-3 text-sm text-text-secondary">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5" />
                        <span><strong>Private Subnets:</strong> Databases and internal APIs are deployed in private subnets with no direct internet access.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5" />
                        <span><strong>Security Groups:</strong> Least-privilege rules. Only necessary ports are opened (e.g., port 80/443 for web, 5432 for DB only from web tier).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5" />
                        <span><strong>Encryption:</strong> Data at rest is encrypted using provider-managed keys (KMS) for all storage and databases.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-surface border border-border rounded-xl p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center text-primary"><Zap className="mr-2 h-5 w-5" /> Operational Security</h3>
                    <ul className="space-y-3 text-sm text-text-secondary">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5" />
                        <span><strong>TLS/SSL:</strong> Load balancers are configured to redirect HTTP to HTTPS.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5" />
                        <span><strong>Secrets Management:</strong> Sensitive values like DB passwords should be injected via Secrets Manager (we generate the placeholders).</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-surface border border-border rounded-xl p-6">
                  <h2 className="text-xl font-semibold mb-4">Post-Deployment Checklist</h2>
                  <ul className="space-y-2 text-text-secondary text-sm">
                    <li className="flex items-start">
                      <span className="text-primary mr-2">☐</span>
                      Rotate initial credentials and database passwords immediately after first deploy.
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">☐</span>
                      Review IAM roles granted to the deployment user; revoke admin access if possible.
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">☐</span>
                      Enable CloudTrail (AWS) or Audit Logging (GCP/Azure) for compliance.
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">☐</span>
                      Set up billing alerts to avoid surprise costs.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Deployment Guides (Consolidated) */}
            {activeSection === 'deployment' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold mb-4">Deployment Guides</h1>
                  <p className="text-text-secondary text-lg">
                    Step-by-step instructions for deploying your generated stack to AWS, GCP, or Azure.
                  </p>
                </div>

                <div className="space-y-8">
                  {/* AWS */}
                  <div className="bg-surface border border-border rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-border bg-white/5">
                      <h2 className="text-xl font-bold flex items-center">
                        <span className="mr-3 text-2xl">☁️</span> Deploy to AWS
                      </h2>
                    </div>
                    <div className="p-6 space-y-4">
                      <p className="text-sm text-text-secondary">Requires <code className="text-primary">aws-cli</code> configured with AdministratorAccess.</p>
                      <CodeBlock
                        id="aws-deploy"
                        language="bash"
                        code={`# 1. Configure Credentials
aws configure
# Enter Key ID, Secret Key, Region (e.g., us-east-1)

# 2. Prepare Directory
cd aws/
terraform init

# 3. Review Plan
terraform plan -out=tfplan

# 4. Apply
terraform apply tfplan`}
                      />
                    </div>
                  </div>

                  {/* GCP */}
                  <div className="bg-surface border border-border rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-border bg-white/5">
                      <h2 className="text-xl font-bold flex items-center">
                        <span className="mr-3 text-2xl">🔷</span> Deploy to GCP
                      </h2>
                    </div>
                    <div className="p-6 space-y-4">
                      <p className="text-sm text-text-secondary">Requires <code className="text-primary">gcloud sdk</code> and a Service Account.</p>
                      <CodeBlock
                        id="gcp-deploy"
                        language="bash"
                        code={`# 1. Login & Set Project
gcloud auth login
gcloud config set project [YOUR_PROJECT_ID]

# 2. Enable APIs (Common ones)
gcloud services enable compute.googleapis.com sqladmin.googleapis.com

# 3. Init & Apply
cd gcp/
terraform init
terraform apply`}
                      />
                    </div>
                  </div>

                  {/* Azure */}
                  <div className="bg-surface border border-border rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-border bg-white/5">
                      <h2 className="text-xl font-bold flex items-center">
                        <span className="mr-3 text-2xl">💠</span> Deploy to Azure
                      </h2>
                    </div>
                    <div className="p-6 space-y-4">
                      <p className="text-sm text-text-secondary">Requires <code className="text-primary">azure-cli</code>.</p>
                      <CodeBlock
                        id="azure-deploy"
                        language="bash"
                        code={`# 1. Login
az login

# 2. Register Resource Providers (First time only)
az provider register --namespace Microsoft.Compute
az provider register --namespace Microsoft.Network

# 3. Init & Apply
cd azure/
terraform init
terraform apply`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default Docs;