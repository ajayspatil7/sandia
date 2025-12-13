// Comprehensive Static Analysis Result Types - Enhanced for Lambda Output

export interface AnalysisMetadata {
  filename: string;
  filepath: string;
  size_bytes: number;
  permissions: string;
  created: string;
  modified: string;
  file_type: string;
  created_readable?: string;
  modified_readable?: string;
}

export interface FileHashes {
  md5: string;
  sha256: string;
  sha1: string;
  file_size?: number;
  ssdeep?: string;
  virustotal_detection?: {
    detected: number;
    total_engines: number;
    permalink?: string;
    scan_date?: string;
  };
}

export interface StringsAnalysis {
  total_strings: number;
  urls_found: string[];
  ip_addresses: string[];
  domains: string[];
  emails: string[];
  file_paths?: string[];
  suspicious_keywords: string[];
  base64_encoded?: Array<{
    encoded: string;
    length: number;
    suspicious: boolean;
  }>;
}

export interface CommandCount {
  command: string;
  count: number;
  purpose?: string;
}

export interface CommandsDetected {
  network?: CommandCount[];
  file_ops?: CommandCount[];
  system?: CommandCount[];
  package?: CommandCount[];
  process?: CommandCount[];
  user?: CommandCount[];
  privilege_escalation?: CommandCount[];
}

export interface MitreAttack {
  tactic: string;
  tactic_name: string;
  technique: string;
  technique_name: string;
}

export interface ThreatIndicator {
  type: string;
  category: string;
  matches: number;
  weight: number;
  score_added: number;
  samples: string[];
  severity?: string;
  mitre_attack?: MitreAttack;
  description?: string;
  remediation?: string;
}

export interface BehavioralAnalysis {
  behaviors: {
    has_network_activity: boolean;
    modifies_system_files: boolean;
    uses_encoding: boolean;
    creates_persistence: boolean;
    escalates_privileges: boolean;
    hides_processes: boolean;
    downloads_files: boolean;
    executes_remote_code: boolean;
    immediate_execution: boolean;
    multi_architecture_targeting: boolean;
    covers_tracks: boolean;
    has_repetitive_patterns: boolean;
  };
  risk_behavior_count: number;
  total_behaviors_checked: number;
  capability_matrix?: {
    can_steal_data: boolean;
    can_encrypt_files: boolean;
    can_ddos: boolean;
    can_mine_crypto: boolean;
    can_spread_laterally: boolean;
    can_escalate_privileges: boolean;
    can_persist: boolean;
    can_hide: boolean;
  };
  code_metrics: {
    total_lines: number;
    unique_lines: number;
    repetition_ratio: number;
    average_line_length?: number;
  };
}

export interface ExecutionAnalysis {
  execution_flow: string[];
  total_execution_steps: number;
  persistence_mechanisms: string[];
  evasion_techniques: string[];
  attack_chain: string[];
  impact_analysis: {
    confidentiality: string;
    integrity: string;
    availability: string;
    scope: string;
  };
}

export interface NetworkConnection {
  ip: string;
  port?: number;
  protocol?: string;
  direction?: string;
  reputation?: string;
  context?: string[];
  geolocation?: string;
  asn?: string;
  organization?: string;
}

export interface NetworkAnalysis {
  connections: NetworkConnection[];
  total_connections: number;
  c2_servers: Array<{
    ip: string;
    confidence: number;
    type: string;
    indicators?: string[];
  }>;
  downloaded_files: Array<{
    url: string;
    method?: string;
    likely_malicious?: boolean;
  }>;
  total_downloads: number;
  traffic_volume?: {
    upload: string;
    download: string;
    estimated?: boolean;
  };
  dns_queries?: Array<{
    domain: string;
    type: string;
    context: string;
  }>;
  ports_used?: number[];
}

export interface CommandSequence {
  sequence: Array<{
    order: number;
    command: string;
    primary_command?: string;
    risk: string;
  }>;
  total_commands: number;
  dangerous_patterns: Array<{
    pattern: string;
    count: number;
    severity: string;
    description: string;
    samples?: string[];
  }>;
  high_risk_commands: number;
}

export interface CodeAnalysis {
  language: string;
  functions_detected: Array<{
    name: string;
    line_start: number;
    lines: number;
  }>;
  total_functions: number;
  variables: Array<{
    name: string;
    value: string;
    suspicious: boolean;
  }>;
  total_variables: number;
  suspicious_variables: number;
  control_flow: {
    conditionals: number;
    loops: number;
    total_branches: number;
  };
  complexity_metrics: {
    estimated_complexity: number;
    complexity_rating: string;
  };
  code_smells: string[];
}

export interface MitreAttackMapping {
  tactics: Array<{
    id: string;
    name: string;
    techniques: Array<{
      id: string;
      name: string;
    }>;
  }>;
  total_tactics: number;
  total_techniques: number;
  coverage_matrix: Record<string, boolean>;
  attack_complexity: string;
}

export interface ExecutiveSummary {
  verdict: string;
  confidence: number;
  primary_threat: string;
  attack_chain: string[];
  malware_family: string;
  family_confidence: number;
  family_description?: string;
  key_findings: string[];
  threat_level: string;
  similar_samples?: number;
}

export interface RiskAssessment {
  risk_score_percentage: number;
  category: 'Safe' | 'Suspicious' | 'Malicious';
  severity: 'low' | 'warning' | 'critical';
  threat_score: number;
  threat_indicators_found: number;
  behavioral_score: number;
  recommendation: string;
}

export interface QuickStats {
  total_threats: number;
  total_commands: number;
  total_ips: number;
  total_urls: number;
  total_downloads: number;
  mitre_tactics: number;
  mitre_techniques: number;
  c2_servers: number;
  dangerous_patterns: number;
  persistence_mechanisms: number;
  evasion_techniques: number;
}

export interface LambdaMetadata {
  execution_id: string;
  function_name: string;
  memory_limit_mb: string;
  analysis_timestamp: string;
  analyzer_version?: string;
}

// Main Analysis Result Interface
export interface StaticAnalysisResult {
  metadata: AnalysisMetadata;
  hashes: FileHashes;
  strings_analysis: StringsAnalysis;
  commands_detected: CommandsDetected;
  threat_indicators: ThreatIndicator[];
  behavioral_analysis: BehavioralAnalysis;
  execution_analysis?: ExecutionAnalysis;
  network_analysis?: NetworkAnalysis;
  command_sequence?: CommandSequence;
  code_analysis?: CodeAnalysis;
  mitre_attack?: MitreAttackMapping;
  executive_summary?: ExecutiveSummary;
  risk_assessment: RiskAssessment;
  quick_stats?: QuickStats;
  lambda_metadata?: LambdaMetadata;
  timestamp: string;
}

// Helper types for the dashboard
export type ThreatCategory = 'Safe' | 'Suspicious' | 'Malicious';
export type SeverityLevel = 'low' | 'warning' | 'critical';
export type Verdict = 'CLEAN' | 'SUSPICIOUS' | 'MALICIOUS';
