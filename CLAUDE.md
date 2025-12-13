## Complete Project Context for Claude Code

### **Project Overview**
You're building "Sandia" - an LLM-powered cybersecurity analysis platform that combines large language models with virtualized sandbox environments for comprehensive threat analysis. This is a university final year project with a 10-day development timeline, designed as a proof-of-concept that can scale to production.

### **Core Innovation**
The project demonstrates three key innovations:
1. **Agentic LLM System**: Multi-agent AI architecture where specialized agents collaborate on cybersecurity analysis
2. **Adaptive Monitoring**: Static analysis findings dynamically configure dynamic monitoring tools
3. **Unified Interface**: Dual-mode interface (Basic/Expert) with real-time reasoning graph visualization

### **Technical Architecture**

**System Components:**
- **Frontend**: React web application with drag-drop file upload and real-time analysis visualization
- **Backend**: FastAPI server orchestrating the entire analysis pipeline
- **Analysis Environment**: Ubuntu 24.04 EC2 instance (t2.medium) for isolated malware analysis
- **AI Engine**: AWS Bedrock Claude agent ("SEA-STARS") specialized in static cybersecurity analysis
- **Infrastructure**: AWS cloud services for scalable, secure processing

**Current Development Phase:**
Building the foundational web application that allows users to upload .sh (shell script) files for analysis. This is the minimal viable product focusing on:
- File upload and validation
- Secure transfer to isolated VM environment
- Static analysis processing
- AI-powered threat assessment
- Results presentation to users

### **AWS Infrastructure Setup**
- **EC2 Instance**: Ubuntu 24.04 LTS (i-0e0ac8745e9f36992) with 30GB storage
- **Golden Snapshot**: Created (snap-0b9ab8a91bcf259a0) for clean state restoration
- **Security**: Isolated environment with controlled network access
- **Agent**: SEA-STARS configured in AWS Bedrock for static analysis

### **Analysis Workflow**
1. **User uploads .sh file** via web interface
2. **File transferred to secure VM** for processing
3. **Static analysis tools** extract file characteristics, strings, and behavior indicators
4. **AI agent processes** analysis data and provides threat assessment
5. **Results returned** with threat scoring, behavioral predictions, and recommendations
6. **VM state restored** from golden snapshot for next analysis

### **Target Capabilities**
- **File Type Support**: Initially .sh files, expandable to executables, scripts, and documents
- **Analysis Depth**: File metadata, string extraction, behavioral prediction, threat classification
- **User Experience**: Simple upload → automated analysis → comprehensive reporting
- **Security**: Complete isolation preventing malicious code execution impact

### **Academic Goals**
- Demonstrate practical application of LLMs in cybersecurity
- Show integration of multiple AWS cloud services
- Create working prototype suitable for university evaluation
- Build foundation for potential commercial development

### **Technical Constraints**
- **Timeline**: 10-day development window
- **Scope**: Proof-of-concept focusing on core functionality
- **Platform**: AWS cloud-native architecture
- **User Base**: Initially academic demonstration, designed for security analysts and researchers

### **Development Priorities**
1. **Core functionality**: File upload → analysis → results display
2. **Security isolation**: Safe handling of potentially malicious files
3. **Real-time feedback**: Users see analysis progress and completion
4. **Scalable architecture**: Design supports future expansion
5. **Academic presentation**: Clear demonstration of AI innovation in cybersecurity

### **Current Development Status (Updated)**

**Backend Infrastructure (Complete):**
- **Node.js/Express Server**: Running on port 8000 with full AWS integration
- **AWS S3 Integration**:
  - Jobs bucket: `sandia-jobs` (file uploads)
  - Results bucket: `sandia-analysis-results` (Lambda output)
- **AWS Lambda**: `sandia-file-processor` function for static analysis
  - Comprehensive Python analyzer with 900+ lines of malware analysis logic
  - Outputs: metadata, hashes, strings analysis, commands, threats, behavioral analysis, risk assessment
- **API Endpoints**:
  - `GET /api/files` - List uploaded files from S3
  - `GET /api/files/:fileId` - Get specific file details
  - `DELETE /api/files/:fileId` - Delete file from S3
  - `POST /api/analysis/trigger/:fileId` - Trigger Lambda analysis
  - `GET /api/analysis/results/:fileId` - Fetch analysis results from S3
  - `GET /api/analysis/status/:fileId` - Check analysis status

**Frontend Application (Complete):**
- React 18 + TypeScript with professional cybersecurity-themed UI
- Full routing structure with 7 routes implemented
- Real AWS S3 integration for file management
- Modern workflow: Landing → Upload → Dashboard Selection → File Selection → Analysis

**Implemented Features:**
- ✅ **Multi-step Analysis Workflow**: Users choose STATA (Static) vs DYNAMO (Dynamic) analysis
- ✅ **Real S3 File Integration**: FileSelectionPage fetches actual uploaded files from AWS S3
- ✅ **Professional UI/UX**: Framer Motion animations, responsive design, cybersecurity theme
- ✅ **File Upload System**: Drag-drop interface with validation and progress tracking
- ✅ **Enhanced STATA Dashboard**: 8-tab comprehensive analysis interface
- ✅ **Error Handling**: Comprehensive loading states, error recovery, retry mechanisms
- 🚧 **DYNAMO Dashboard**: Placeholder "Coming Soon" page for dynamic analysis

**Complete Route Structure:**
```
/ (Landing) → /analyze (Upload) → /dashboard (Choose Analysis Type)
    ↓
/stata-files (Select S3 File) → /stata?fileId=123 (Analysis Results)
    ↓
/dynamo (Coming Soon - Dynamic Analysis)
```

**Technical Implementation:**
- **API Integration**: Real backend calls to localhost:8000
- **State Management**: React hooks with proper loading/error states
- **File Processing**: Smart file type detection, metadata display, status tracking
- **Navigation**: Seamless flow between analysis steps with back navigation
- **Responsive Design**: Mobile-first approach with professional aesthetics

**Key Components Built:**
1. **LandingPage** - Project introduction and entry point
2. **AnalyzePage** - File upload interface with drag-drop
3. **DashboardSelectionPage** - Choose between STATA/DYNAMO analysis types
4. **FileSelectionPage** - Real S3 file selection with metadata display
5. **EnhancedSTATAPage** - Comprehensive 8-tab static analysis dashboard (see details below)
6. **DynamoPage** - Placeholder for future dynamic analysis
7. **HomePage** - Main dashboard/navigation hub

**EnhancedSTATAPage - 8-Tab Dashboard:**
Located at: `src/pages/EnhancedSTATAPage.tsx`

The comprehensive analysis dashboard displays all Lambda analyzer output across 8 organized tabs:

1. **Overview Tab**:
   - Verdict with confidence percentage
   - Risk score gauge (animated)
   - Primary threat and malware family
   - Attack chain visualization
   - Key findings list
   - Quick stats grid (8 stat cards)
   - Recommendation banner

2. **Threats Tab**:
   - Expandable threat indicator cards
   - Severity badges (critical/high/medium/low)
   - Sample evidence
   - MITRE ATT&CK mapping per threat
   - Remediation advice

3. **Behavior Tab**:
   - 12 behavioral checkboxes (network activity, system modification, encoding, persistence, etc.)
   - Capability matrix (8 capabilities: data theft, encryption, DDoS, crypto mining, etc.)
   - Execution flow timeline
   - Impact analysis (CIA triad: Confidentiality, Integrity, Availability)
   - Code metrics (lines, uniqueness, repetition ratio)

4. **Network Tab**:
   - C2 servers (highlighted in red with confidence scores)
   - Network connections with geolocation/ASN/organization
   - Downloaded files list with malicious likelihood
   - Traffic volume statistics
   - DNS queries

5. **Commands Tab**:
   - Dangerous patterns section with severity
   - Command execution sequence with risk levels
   - Commands grouped by category (network, file_ops, system, package, process, user, privilege_escalation)

6. **Hashes & Strings Tab**:
   - File hashes (MD5, SHA1, SHA256) with copy-to-clipboard
   - VirusTotal detection results
   - URLs found (with external link icons)
   - IP addresses discovered
   - Suspicious keywords
   - File paths extracted

7. **Code Analysis Tab**:
   - Complexity metrics and rating
   - Functions detected (with line numbers)
   - Variables (flagged if suspicious)
   - Control flow analysis (conditionals, loops, branches)
   - Code smells

8. **MITRE ATT&CK Tab**:
   - Tactics with associated techniques
   - Coverage matrix (12 standard tactics)
   - Attack complexity rating

**Dashboard Features:**
- Sidebar navigation (open by default, collapsible via toggle button)
- Framer Motion animations for smooth transitions
- Expandable/collapsible sections with state management
- Copy-to-clipboard for hashes, IPs, URLs
- Color-coded severity indicators
- Responsive design with mobile bottom navigation
- Loading and error states
- Auto-polling for analysis results (5-second wait after trigger)

**TypeScript Types:**
All Lambda output properly typed in `src/types/analysis.ts`:
- `StaticAnalysisResult` - Main interface
- `AnalysisMetadata`, `FileHashes`, `StringsAnalysis`, `CommandsDetected`
- `ThreatIndicator`, `BehavioralAnalysis`, `RiskAssessment`
- Optional fields: `ExecutionAnalysis`, `NetworkAnalysis`, `CommandSequence`, `CodeAnalysis`, `MitreAttackMapping`, `ExecutiveSummary`, `QuickStats`

**Known Lambda Output Structure:**
The Lambda currently outputs these fields (some optional fields like `executive_summary`, `network_analysis`, `command_sequence` may not be populated):
- `metadata` (filename, filepath, size, permissions, created, modified, file_type)
- `hashes` (md5, sha256, sha1)
- `strings_analysis` (urls, ips, domains, emails, suspicious keywords)
- `commands_detected` (network, file_ops, system, etc.)
- `threat_indicators` (array with type, category, matches, weight, samples)
- `behavioral_analysis` (behaviors object, risk counts, code metrics)
- `risk_assessment` (score, category, severity, recommendation)
- `timestamp`, `lambda_metadata`

**Important Notes:**
- S3 auto-trigger has been disabled (removed bucket notification configuration)
- Lambda invocation is API-triggered only via backend
- Multiple Node.js processes may accumulate - use `killall -9 node` before restart
- Frontend dev server runs on port 3000, backend on 8000

**Next Development Phase:**
- Populate missing Lambda fields (executive_summary, network_analysis, etc.)
- Dynamic analysis (DYNAMO) system development
- Real-time analysis progress tracking with WebSocket
- Enhanced visualization (graphs, charts, timelines)

This context should give Claude Code a comprehensive understanding of what you're building and why, enabling it to write appropriate code that fits your specific architecture and requirements.