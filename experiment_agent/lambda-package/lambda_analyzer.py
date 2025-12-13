#!/usr/bin/env python3
"""
SANDIA Static Analysis Engine - Lambda-Compatible Version
Comprehensive shell script analysis for threat detection
No subprocess dependencies - pure Python implementation
"""

import os
import json
import hashlib
import re
from datetime import datetime, timezone
from pathlib import Path


class ShellScriptAnalyzer:
    def __init__(self, filepath):
        self.filepath = filepath
        self.filename = os.path.basename(filepath)
        self.results = {
            "metadata": {},
            "hashes": {},
            "strings_analysis": {},
            "commands_detected": [],
            "threat_indicators": [],
            "behavioral_analysis": {},
            "risk_assessment": {},
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        # Enhanced threat patterns with better detection
        self.threat_patterns = {
            "network_operations": {
                "patterns": [r'\bcurl\b', r'\bwget\b', r'\bnc\b', r'\bnetcat\b', 
                           r'\btelnet\b', r'/dev/tcp/', r'/dev/udp/'],
                "weight": 3,
                "category": "Network Communication",
                "count_multiplier": True
            },
            "download_execute": {
                "patterns": [r'(wget|curl).*chmod.*\d{3,4}.*\./', 
                           r'(wget|curl).*-[Oo].*chmod',
                           r'chmod\s+777.*\./'],
                "weight": 5,
                "category": "Download and Execute Pattern",
                "count_multiplier": True
            },
            "reverse_shells": {
                "patterns": [r'/bin/bash\s+-i', r'/bin/sh\s+-i', r'bash\s+-c.*sh\s+-i',
                           r'nc.*-e\s+/bin/(ba)?sh', r'python.*socket.*subprocess'],
                "weight": 5,
                "category": "Reverse Shell"
            },
            "encoding_obfuscation": {
                "patterns": [r'\bbase64\b.*-d', r'\bxxd\b', r'openssl\s+enc',
                           r'echo.*\|.*base64', r'eval\s*\$\('],
                "weight": 4,
                "category": "Obfuscation"
            },
            "privilege_escalation": {
                "patterns": [r'\bsudo\b', r'\bsu\s+', r'chmod\s+[+]?[67]77',
                           r'passwd\b', r'usermod\b', r'adduser\b'],
                "weight": 4,
                "category": "Privilege Escalation",
                "count_multiplier": True
            },
            "persistence": {
                "patterns": [r'crontab', r'systemctl', r'\.bashrc', r'\.profile',
                           r'\.bash_profile', r'/etc/rc\.local', r'systemd.*enable'],
                "weight": 4,
                "category": "Persistence Mechanism"
            },
            "file_operations": {
                "patterns": [r'rm\s+-rf\s+/', r'rm\s+-rf\s+\*', r'rm\s+-rf\s+\.\*',
                           r'>\s*/dev/sda', r'dd\s+if=.*of=/dev/', r'mkfs\b'],
                "weight": 5,
                "category": "Destructive File Operations"
            },
            "data_exfiltration": {
                "patterns": [r'scp\b', r'rsync\b', r'ftp\b', r'nc.*>',
                           r'curl.*--data', r'wget.*--post'],
                "weight": 4,
                "category": "Data Exfiltration"
            },
            "reconnaissance": {
                "patterns": [r'\buname\b', r'\bwhoami\b', r'\bid\b', r'\bhostname\b',
                           r'ifconfig\b', r'ip\s+addr', r'/etc/passwd', r'/etc/shadow'],
                "weight": 2,
                "category": "System Reconnaissance"
            },
            "process_hiding": {
                "patterns": [r'\bnohup\b', r'\bdisown\b', r'&\s*$', r'setsid\b'],
                "weight": 3,
                "category": "Process Hiding"
            },
            "credential_access": {
                "patterns": [r'password', r'passwd', r'ssh.*key', r'private.*key',
                           r'\.aws/credentials', r'API.*KEY', r'token'],
                "weight": 3,
                "category": "Credential Access"
            },
            "multi_architecture": {
                "patterns": [r'(x86_64|mips|arm|i486|i686|powerpc|sparc|m68k).*linux',
                           r'musl|uclibc'],
                "weight": 4,
                "category": "Multi-Architecture Targeting (Botnet Indicator)",
                "count_multiplier": True
            },
            "cover_tracks": {
                "patterns": [r'rm\s+-rf\s+\.\*', r'history\s+-c', r'unset\s+HISTFILE',
                           r'>\s+~/\.bash_history'],
                "weight": 5,
                "category": "Anti-Forensics / Cover Tracks"
            }
        }

    def extract_metadata(self):
        """Extract basic file metadata - Lambda compatible"""
        try:
            stat_info = os.stat(self.filepath)
            
            # Detect file type from extension (no 'file' command in Lambda)
            file_extension = os.path.splitext(self.filepath)[1].lower()
            file_type_map = {
                '.sh': 'Bourne-Again shell script',
                '.bash': 'Bash shell script',
                '.py': 'Python script',
                '.js': 'JavaScript source',
                '.exe': 'PE32 executable',
                '.elf': 'ELF executable',
                '.pl': 'Perl script', 
                '.rb': 'Ruby script'
            }
            
            self.results["metadata"] = {
                "filename": self.filename,
                "filepath": self.filepath,
                "size_bytes": stat_info.st_size,
                "permissions": oct(stat_info.st_mode)[-3:],
                "created": datetime.fromtimestamp(stat_info.st_ctime).isoformat(),
                "modified": datetime.fromtimestamp(stat_info.st_mtime).isoformat(),
                "file_type": file_type_map.get(file_extension, f"Unknown{file_extension}")
            }
            
        except Exception as e:
            self.results["metadata"]["error"] = str(e)

    def generate_hashes(self):
        """Generate file hashes for fingerprinting"""
        try:
            with open(self.filepath, 'rb') as f:
                content = f.read()
                self.results["hashes"] = {
                    "md5": hashlib.md5(content).hexdigest(),
                    "sha256": hashlib.sha256(content).hexdigest(),
                    "sha1": hashlib.sha1(content).hexdigest()
                }
        except Exception as e:
            self.results["hashes"]["error"] = str(e)

    def analyze_strings(self):
        """Extract and analyze strings from file - Pure Python implementation"""
        try:
            # Pure Python string extraction (mimics 'strings' command)
            with open(self.filepath, 'rb') as f:
                content = f.read()
            
            all_strings = []
            current_string = []
            
            for byte in content:
                if 32 <= byte <= 126:  # Printable ASCII range
                    current_string.append(chr(byte))
                else:
                    if len(current_string) >= 4:  # Minimum string length
                        all_strings.append(''.join(current_string))
                    current_string = []
            
            # Don't forget the last string
            if len(current_string) >= 4:
                all_strings.append(''.join(current_string))
            
            # Pattern matching
            urls = []
            ips = []
            domains = []
            emails = []
            
            url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
            ip_pattern = r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b'
            domain_pattern = r'\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}\b'
            email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
            
            for string in all_strings:
                urls.extend(re.findall(url_pattern, string, re.IGNORECASE))
                ips.extend(re.findall(ip_pattern, string))
                domains.extend(re.findall(domain_pattern, string.lower()))
                emails.extend(re.findall(email_pattern, string))
            
            self.results["strings_analysis"] = {
                "total_strings": len(all_strings),
                "urls_found": list(set(urls))[:20],
                "ip_addresses": list(set(ips))[:20],
                "domains": list(set(domains))[:20],
                "emails": list(set(emails))[:10],
                "suspicious_keywords": self._find_suspicious_keywords(all_strings)
            }
            
        except Exception as e:
            self.results["strings_analysis"]["error"] = str(e)

    def _find_suspicious_keywords(self, strings):
        """Find suspicious keywords in strings"""
        keywords = ['password', 'secret', 'token', 'api_key', 'private_key', 
                   'exploit', 'payload', 'backdoor', 'rootkit', 'malware',
                   'botnet', 'ddos', 'flood', 'scanner']
        found = []
        
        for string in strings:
            for keyword in keywords:
                if keyword in string.lower():
                    found.append(string[:100])
                    break
        
        return list(set(found))[:10]

    def detect_commands(self):
        """Detect and categorize shell commands"""
        try:
            with open(self.filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            commands = {
                "network": ['curl', 'wget', 'nc', 'netcat', 'telnet', 'ssh', 'scp', 'ftp'],
                "file_ops": ['rm', 'mv', 'cp', 'chmod', 'chown', 'dd', 'shred'],
                "system": ['systemctl', 'service', 'crontab', 'kill', 'pkill'],
                "package": ['apt', 'apt-get', 'yum', 'dnf', 'pip', 'npm'],
                "process": ['ps', 'top', 'nohup', 'bg', 'fg', 'jobs'],
                "user": ['useradd', 'usermod', 'passwd', 'su', 'sudo']
            }
            
            detected = {}
            for category, cmds in commands.items():
                found = []
                for cmd in cmds:
                    pattern = r'\b' + re.escape(cmd) + r'\b'
                    matches = re.findall(pattern, content)
                    if matches:
                        found.append({
                            "command": cmd,
                            "count": len(matches)
                        })
                if found:
                    detected[category] = found
            
            self.results["commands_detected"] = detected
            
        except Exception as e:
            self.results["commands_detected"] = {"error": str(e)}

    def analyze_threats(self):
        """Analyze for threat indicators with enhanced counting"""
        try:
            with open(self.filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            threat_score = 0
            threats_found = []
            
            for threat_type, config in self.threat_patterns.items():
                count_multiplier = config.get("count_multiplier", False)
                threat_matches = []
                
                for pattern in config["patterns"]:
                    matches = re.findall(pattern, content, re.IGNORECASE | re.MULTILINE)
                    if matches:
                        threat_matches.extend(matches)
                
                if threat_matches:
                    # If count_multiplier is True, add weight for each instance (capped at 5x)
                    if count_multiplier:
                        multiplier = min(len(threat_matches), 5)
                        score_addition = config["weight"] * multiplier
                    else:
                        score_addition = config["weight"]
                    
                    threat_score += score_addition
                    
                    threats_found.append({
                        "type": threat_type,
                        "category": config["category"],
                        "matches": len(threat_matches),
                        "weight": config["weight"],
                        "score_added": score_addition,
                        "samples": [str(m)[:50] for m in threat_matches[:3]]  # Show first 3 samples
                    })
            
            self.results["threat_indicators"] = threats_found
            return threat_score
            
        except Exception as e:
            self.results["threat_indicators"] = [{"error": str(e)}]
            return 0

    def behavioral_analysis(self):
        """Analyze behavioral patterns with enhanced detection"""
        try:
            with open(self.filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            # Count lines for repetition detection
            lines = content.split('\n')
            unique_lines = set(lines)
            
            behaviors = {
                "has_network_activity": bool(re.search(r'curl|wget|nc|telnet', content, re.I)),
                "modifies_system_files": bool(re.search(r'/etc/|/usr/|/var/', content)),
                "uses_encoding": bool(re.search(r'base64|xxd|openssl enc', content, re.I)),
                "creates_persistence": bool(re.search(r'crontab|systemctl|\.bashrc|\.profile', content, re.I)),
                "escalates_privileges": bool(re.search(r'sudo|su\s|chmod.*777', content, re.I)),
                "hides_processes": bool(re.search(r'nohup|disown|&\s*$', content)),
                "downloads_files": bool(re.search(r'curl.*-[Oo]|wget.*-O', content, re.I)),
                "executes_remote_code": bool(re.search(r'(curl|wget).*\|.*(bash|sh)', content, re.I)),
                "immediate_execution": bool(re.search(r'chmod.*\d{3}.*\./', content)),
                "multi_architecture_targeting": len(re.findall(r'(x86_64|mips|arm|i[3-6]86)', content, re.I)) > 3,
                "covers_tracks": bool(re.search(r'rm.*-rf.*\.\*|history.*-c', content, re.I)),
                "has_repetitive_patterns": len(lines) > len(unique_lines) * 1.5
            }
            
            risk_behaviors = sum(1 for v in behaviors.values() if v)
            
            self.results["behavioral_analysis"] = {
                "behaviors": behaviors,
                "risk_behavior_count": risk_behaviors,
                "total_behaviors_checked": len(behaviors),
                "code_metrics": {
                    "total_lines": len(lines),
                    "unique_lines": len(unique_lines),
                    "repetition_ratio": round(len(lines) / max(len(unique_lines), 1), 2)
                }
            }
            
        except Exception as e:
            self.results["behavioral_analysis"]["error"] = str(e)

    def calculate_risk_score(self, threat_score):
        """Calculate final risk score with improved weighting"""
        # Normalize threat score
        threat_percentage = min((threat_score / 100) * 100, 100)
        
        # Behavioral analysis
        behavior_count = self.results["behavioral_analysis"].get("risk_behavior_count", 0)
        total_behaviors = self.results["behavioral_analysis"].get("total_behaviors_checked", 12)
        behavior_percentage = (behavior_count / total_behaviors) * 100
        
        # Weighted average (60% threats, 40% behaviors)
        final_score = (threat_percentage * 0.6) + (behavior_percentage * 0.4)
        
        # Determine category
        if final_score >= 60:
            category = "Malicious"
            severity = "critical"
        elif final_score >= 35:
            category = "Suspicious"
            severity = "warning"
        else:
            category = "Safe"
            severity = "low"
        
        self.results["risk_assessment"] = {
            "risk_score_percentage": round(final_score, 2),
            "category": category,
            "severity": severity,
            "threat_score": threat_score,
            "threat_indicators_found": len(self.results["threat_indicators"]),
            "behavioral_score": round(behavior_percentage, 2),
            "recommendation": self._get_recommendation(category, final_score)
        }

    def _get_recommendation(self, category, score):
        """Get security recommendation based on category"""
        if category == "Malicious":
            return f"CRITICAL: This file exhibits highly malicious behavior (Score: {score:.1f}%). Do NOT execute. Isolate immediately and conduct deep forensic analysis. Likely malware/botnet dropper."
        elif category == "Suspicious":
            return f"WARNING: This file shows suspicious patterns (Score: {score:.1f}%). Review manually before execution. Consider sandbox analysis."
        else:
            return f"This file appears relatively safe (Score: {score:.1f}%). However, always exercise caution with unknown scripts."

    def analyze(self):
        """Run complete analysis pipeline"""
        print(f"[*] Starting analysis of: {self.filename}")
        
        self.extract_metadata()
        print("[+] Metadata extracted")
        
        self.generate_hashes()
        print("[+] Hashes generated")
        
        self.analyze_strings()
        print("[+] Strings analyzed")
        
        self.detect_commands()
        print("[+] Commands detected")
        
        threat_score = self.analyze_threats()
        print(f"[+] Threat analysis complete (Score: {threat_score})")
        
        self.behavioral_analysis()
        print("[+] Behavioral analysis complete")
        
        self.calculate_risk_score(threat_score)
        print(f"[+] Risk assessment: {self.results['risk_assessment']['category']} ({self.results['risk_assessment']['risk_score_percentage']}%)")
        
        return self.results

    def get_results(self):
        """Return results dictionary (Lambda-compatible)"""
        return self.results