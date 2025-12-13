# SANDIA - Cybersecurity Analysis Platform

**S**tatic **A**nd **N**etwork **D**ynamic **I**ntelligence **A**nalyzer

An LLM-powered cybersecurity analysis platform combining large language models with virtualized sandbox environments for comprehensive threat detection and analysis.

## 🎯 Project Overview

SANDIA is a university final year project demonstrating three key innovations:

1. **Agentic LLM System**: Multi-agent AI architecture for collaborative cybersecurity analysis
2. **Adaptive Monitoring**: Static analysis findings dynamically configure monitoring tools
3. **Unified Interface**: Dual-mode interface (Basic/Expert) with real-time reasoning visualization

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                           │
│              React 18 + TypeScript + Tailwind CSS                │
│         (File Upload → Analysis Selection → Results)             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Backend API (Node.js)                       │
│           Express Server - Port 8000 - AWS Integration           │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ↓                             ↓
┌──────────────────────────┐    ┌─────────────────────────────────┐
│      AWS S3 Storage      │    │    AWS Lambda Function          │
│  - sandia-jobs (uploads) │    │  Python Static Analyzer          │
│  - sandia-analysis-      │    │  13 Threat Categories            │
│    results (output)      │    │  12 Behavioral Checks            │
└──────────────────────────┘    └─────────────────────────────────┘
                                             ↓
                                ┌─────────────────────────────────┐
                                │     AWS Bedrock (Optional)      │
                                │   Claude Agent (SEA-STARS)      │
                                │   LLM-Powered Analysis          │
                                └─────────────────────────────────┘
```

## 📁 Project Structure

```
Sandia/
├── sandia-backend/          # Node.js/Express API Server
│   ├── config/              # AWS configuration
│   ├── middleware/          # File upload, validation middleware
│   ├── routes/              # API endpoints
│   │   ├── upload.js        # File upload handling
│   │   ├── files.js         # S3 file management
│   │   ├── analysis.js      # Lambda trigger & results
│   │   └── health.js        # Health check endpoints
│   ├── utils/               # Helper functions
│   ├── server.js            # Main server entry point
│   └── package.json         # Dependencies
│
├── sandia-web/              # React Frontend Application
│   ├── src/
│   │   ├── pages/           # React pages
│   │   │   ├── LandingPage.tsx
│   │   │   ├── AnalyzePage.tsx          # File upload
│   │   │   ├── DashboardSelectionPage.tsx
│   │   │   ├── FileSelectionPage.tsx
│   │   │   ├── EnhancedSTATAPage.tsx    # 8-tab analysis dashboard
│   │   │   └── DynamoPage.tsx           # (Future: Dynamic analysis)
│   │   ├── components/      # Reusable UI components
│   │   ├── services/        # API client
│   │   ├── types/           # TypeScript interfaces
│   │   └── styles/          # CSS/Tailwind styles
│   ├── public/              # Static assets
│   └── package.json         # Dependencies
│
├── experiment_agent/        # AWS Lambda Function
│   └── lambda-package/
│       ├── lambda_analyzer.py   # Static analysis engine (900+ lines)
│       └── lambda_function.py   # Lambda handler
│
├── .gitignore               # Git ignore rules
├── CLAUDE.md                # Project context documentation
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 16+ and npm
- **Python** 3.11+ (for Lambda development)
- **AWS Account** with configured credentials
- **AWS CLI** (optional, for deployment)

### 1. Backend Setup

```bash
cd sandia-backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# AWS Configuration
AWS_REGION=us-east-1
AWS_S3_BUCKET=sandia-jobs
AWS_S3_RESULTS_BUCKET=sandia-analysis-results
AWS_LAMBDA_FUNCTION_NAME=sandia-file-processor
EOF

# Start the server
npm start
```

Backend will run on `http://localhost:8000`

### 2. Frontend Setup

```bash
cd sandia-web

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

### 3. AWS Lambda Setup

The Lambda function is already deployed as `sandia-file-processor`.

**To update the Lambda**:

```bash
cd experiment_agent/lambda-package

# Create deployment package
zip -r lambda-deployment.zip lambda_analyzer.py lambda_function.py

# Upload to Lambda (via AWS Console or CLI)
aws lambda update-function-code \
  --function-name sandia-file-processor \
  --zip-file fileb://lambda-deployment.zip
```

## 📊 Analysis Workflow

1. **Upload**: User uploads `.sh` file via web interface
2. **Store**: File transferred to S3 bucket (`sandia-jobs`)
3. **Analyze**: Backend triggers Lambda function
4. **Process**: Lambda runs static analysis:
   - File metadata extraction
   - Hash generation (MD5, SHA1, SHA256)
   - String extraction (URLs, IPs, domains, emails)
   - Command detection (6 categories)
   - Threat pattern matching (13 categories)
   - Behavioral analysis (12 behaviors)
   - Risk scoring algorithm
5. **Results**: Analysis output stored in S3 (`sandia-analysis-results`)
6. **Display**: Frontend fetches and visualizes results in 8-tab dashboard

## 🔍 Analysis Capabilities

### Static Analysis (STATA)

**13 Threat Categories**:
- Network Operations
- Download & Execute Patterns
- Reverse Shells
- Encoding/Obfuscation
- Privilege Escalation
- Persistence Mechanisms
- Destructive File Operations
- Data Exfiltration
- System Reconnaissance
- Process Hiding
- Credential Access
- Multi-Architecture Targeting
- Anti-Forensics/Cover Tracks

**12 Behavioral Checks**:
- Network activity detection
- System file modification
- Encoding usage
- Persistence creation
- Privilege escalation
- Process hiding
- File downloads
- Remote code execution
- Immediate execution patterns
- Multi-architecture targeting
- Track covering
- Repetitive patterns

### Risk Scoring

**Algorithm**: Weighted average
- 60% Threat Pattern Score
- 40% Behavioral Score

**Categories**:
- **Malicious** (≥60%): Critical threat, do not execute
- **Suspicious** (≥35%): Manual review required
- **Safe** (<35%): Relatively safe, exercise caution

## 🎨 Frontend Features

### 8-Tab Analysis Dashboard

1. **Overview**: Risk gauge, verdict, key findings, attack chain
2. **Threats**: Threat indicators with severity, MITRE ATT&CK mapping
3. **Behavior**: 12 behavioral flags, capability matrix, impact analysis
4. **Network**: C2 servers, connections, downloads, DNS queries
5. **Commands**: Dangerous patterns, execution sequence, categorization
6. **Hashes & Strings**: File hashes, URLs, IPs, suspicious keywords
7. **Code Analysis**: Complexity metrics, functions, variables, control flow
8. **MITRE ATT&CK**: Tactics, techniques, coverage matrix

### UI Features
- Framer Motion animations
- Responsive design (mobile-first)
- Collapsible sidebar navigation
- Copy-to-clipboard for hashes/IPs/URLs
- Color-coded severity indicators
- Real-time loading states

## 🔧 API Endpoints

### Backend API (Port 8000)

```
GET  /                                  - API information
GET  /api/health                        - Health check
GET  /api/health/aws                    - AWS services health
POST /api/upload/file                   - Upload file to S3
GET  /api/upload/status/:jobId          - Check upload status
GET  /api/files                         - List uploaded files
GET  /api/files/:fileId                 - Get file details
DELETE /api/files/:fileId               - Delete file
POST /api/analysis/trigger/:fileId      - Trigger Lambda analysis
GET  /api/analysis/results/:fileId      - Get analysis results
GET  /api/analysis/status/:fileId       - Check analysis status
```

## 🛠️ Technology Stack

### Frontend
- **React** 18 with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Vite** as build tool
- **React Router** for navigation

### Backend
- **Node.js** with Express
- **AWS SDK** for S3 and Lambda
- **Multer** for file uploads
- **CORS**, **Helmet**, **Rate Limiting** for security

### Analysis Engine
- **Python** 3.11
- **Boto3** (AWS SDK)
- **Regex-based** pattern matching
- **Pure Python** implementation (Lambda-compatible)

### Infrastructure
- **AWS S3** - File storage
- **AWS Lambda** - Serverless analysis
- **AWS Bedrock** - LLM agent (optional)

## 🔐 Security Features

- **Rate limiting**: 100 requests/15min, 10 uploads/15min
- **File validation**: Type, size, extension checks
- **Isolated execution**: Lambda sandboxing
- **Credential management**: Environment variables
- **CORS protection**: Whitelist-based
- **Input sanitization**: File content validation

## 📈 Future Enhancements

### Machine Learning Integration
1. **GNN for Code Flow Analysis** (High Priority)
2. **AWS Bedrock LLM Integration** (High Priority)
3. **LSTM Command Sequence Modeling**
4. **Anomaly Detection for Obfuscation**
5. **Random Forest Risk Scoring**
6. **Malware Family Classification**

### Dynamic Analysis (DYNAMO)
- VM-based execution monitoring
- System call tracing
- Network traffic analysis
- Behavioral runtime analysis

## 📝 Development Notes

### Running Both Servers

```bash
# Terminal 1 - Backend
cd sandia-backend && npm start

# Terminal 2 - Frontend
cd sandia-web && npm run dev
```

### Killing Processes

```bash
# If multiple Node processes are running
killall -9 node

# Or find specific port
lsof -ti:8000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### Git Workflow

```bash
# Check status
git status

# Stage changes
git add .

# Commit
git commit -m "feat: description"

# View history
git log --oneline --graph
```

## 🎓 Academic Context

This is a **final year university project** demonstrating:
- Integration of LLMs in cybersecurity
- AWS cloud-native architecture
- Full-stack development skills
- Security analysis automation
- UI/UX design for technical tools

**Timeline**: 10-day development window
**Scope**: Proof-of-concept for academic evaluation
**Future**: Foundation for potential commercial development

## 📄 License

This project is developed as an academic project. All rights reserved.

## 👥 Contributors

- **Developer**: Ajay S Patil
- **Institution**: RV University
- **Year**: 2024-2025

## 🔗 References

- AWS Lambda Documentation
- AWS Bedrock Documentation
- React + TypeScript Best Practices
- MITRE ATT&CK Framework
- OWASP Security Guidelines
