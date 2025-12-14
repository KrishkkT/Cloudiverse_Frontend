# Project Structure

This document outlines the file structure of the Multi-Cloud AI Infrastructure Planner frontend.

```
frontend/
├── public/                         # Static assets
├── src/                            # Source code
│   ├── components/                 # Reusable UI components
│   │   ├── Navbar.jsx              # Top navigation bar
│   │   └── Sidebar.jsx             # Side navigation menu
│   ├── context/                    # React context providers
│   │   └── AuthContext.jsx         # Authentication context
│   ├── pages/                      # Page components
│   │   ├── Login.jsx               # User login page
│   │   ├── Register.jsx            # User registration page
│   │   ├── Dashboard.jsx           # Main dashboard with projects
│   │   ├── ProjectDetail.jsx       # Project details and requirements
│   │   ├── CloudComparison.jsx     # Cloud service comparison
│   │   ├── TerraformViewer.jsx     # Terraform code viewer
│   │   ├── CostEstimation.jsx      # Cost analysis and visualization
│   │   └── Settings.jsx            # User settings page
│   ├── App.css                     # Global styles
│   ├── App.jsx                     # Main application component
│   └── main.jsx                    # Application entry point
├── index.html                      # HTML template
├── package.json                    # Project dependencies and scripts
├── vite.config.js                  # Vite build configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration
├── .eslintrc.cjs                   # ESLint configuration
├── README.md                       # Project documentation
├── GETTING_STARTED.md              # Setup and usage guide
├── PROJECT_STRUCTURE.md            # This file
├── setup.js                        # Cross-platform setup script
├── setup.bat                       # Windows setup script
├── start-dev.js                    # Cross-platform dev server script
├── start-dev.bat                   # Windows dev server script
├── build-project.js                # Cross-platform build script
├── build.bat                       # Windows build script
├── verify-setup.js                 # Cross-platform verification script
└── verify-setup.bat                # Windows verification script
```

## Key Directories

### `src/components/`
Contains reusable UI components that are used across multiple pages.

### `src/context/`
Contains React Context providers for managing global state, such as authentication.

### `src/pages/`
Contains page-level components that correspond to different routes in the application.

### Root Configuration Files
- `vite.config.js`: Configuration for the Vite build tool
- `tailwind.config.js`: Configuration for Tailwind CSS
- `postcss.config.js`: Configuration for PostCSS
- `package.json`: Project dependencies and scripts

## Scripts

Cross-platform JavaScript scripts and Windows batch files are provided for common tasks:
- Setup: `setup.js` / `setup.bat`
- Development server: `start-dev.js` / `start-dev.bat`
- Production build: `build-project.js` / `build.bat`
- Verification: `verify-setup.js` / `verify-setup.bat`