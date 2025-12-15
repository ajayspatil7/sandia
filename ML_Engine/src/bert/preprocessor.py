"""
BERT Preprocessor for Shell Script Analysis
Converts raw shell scripts into BERT-compatible text sequences
"""

import re
from typing import Dict, List, Tuple


class ShellScriptPreprocessor:
    """Preprocess shell scripts for BERT analysis"""

    def __init__(self, max_length: int = 512):
        self.max_length = max_length

        # Dangerous command patterns
        self.dangerous_commands = {
            'wget', 'curl', 'nc', 'netcat', 'bash', 'sh', 'eval', 'exec',
            'chmod', 'chown', 'rm', 'dd', 'kill', 'pkill', 'crontab',
            'iptables', 'systemctl', 'service', 'base64', 'openssl',
            'nohup', 'disown', 'python', 'perl', 'ruby', 'php'
        }

        # Suspicious patterns
        self.suspicious_patterns = [
            r'/tmp/',
            r'/dev/null',
            r'/dev/tcp/',
            r'history\s+-c',
            r'>\s*/dev/null',
            r'2>&1',
            r'\|\s*bash',
            r'\|\s*sh',
            r'&&',
            r'\$\(',
            r'`[^`]+`',  # backticks
        ]

    def extract_features(self, script: str) -> Dict[str, any]:
        """Extract semantic features from script"""

        # Clean script
        script_clean = self._clean_script(script)

        # Extract components
        commands = self._extract_commands(script_clean)
        urls = self._extract_urls(script_clean)
        ips = self._extract_ips(script_clean)
        base64_content = self._find_base64(script_clean)
        obfuscation = self._detect_obfuscation(script_clean)

        # Suspicious pattern matches
        suspicious_matches = []
        for pattern in self.suspicious_patterns:
            matches = re.findall(pattern, script_clean, re.IGNORECASE)
            if matches:
                suspicious_matches.extend(matches)

        # Command analysis
        dangerous_cmds = [cmd for cmd in commands if cmd.lower() in self.dangerous_commands]

        return {
            'commands': commands,
            'dangerous_commands': dangerous_cmds,
            'urls': urls,
            'ips': ips,
            'has_base64': len(base64_content) > 0,
            'base64_count': len(base64_content),
            'obfuscation_score': obfuscation,
            'suspicious_patterns': suspicious_matches,
            'total_commands': len(commands),
            'dangerous_ratio': len(dangerous_cmds) / max(len(commands), 1)
        }

    def prepare_for_bert(self, script: str) -> Tuple[str, Dict]:
        """
        Convert script to BERT-friendly text format

        Returns:
            (text_sequence, features)
        """

        features = self.extract_features(script)

        # Create semantic representation
        # Format: [commands] [urls] [patterns] [metadata]

        text_parts = []

        # Add command sequence
        if features['commands']:
            cmd_text = ' '.join(features['commands'][:20])  # First 20 commands
            text_parts.append(f"commands: {cmd_text}")

        # Add dangerous commands
        if features['dangerous_commands']:
            danger_text = ' '.join(features['dangerous_commands'])
            text_parts.append(f"dangerous: {danger_text}")

        # Add URLs
        if features['urls']:
            url_text = ' '.join(features['urls'])
            text_parts.append(f"urls: {url_text}")

        # Add IPs
        if features['ips']:
            ip_text = ' '.join(features['ips'])
            text_parts.append(f"ips: {ip_text}")

        # Add suspicious patterns
        if features['suspicious_patterns']:
            pattern_text = ' '.join(set(features['suspicious_patterns']))
            text_parts.append(f"suspicious: {pattern_text}")

        # Add metadata
        metadata = f"total_commands: {features['total_commands']} dangerous_ratio: {features['dangerous_ratio']:.2f}"
        if features['has_base64']:
            metadata += f" base64_encoded: {features['base64_count']}"
        if features['obfuscation_score'] > 0.3:
            metadata += f" obfuscated: {features['obfuscation_score']:.2f}"

        text_parts.append(metadata)

        # Combine all parts
        text_sequence = ' [SEP] '.join(text_parts)

        # Truncate if too long
        if len(text_sequence) > self.max_length * 4:  # Rough character limit
            text_sequence = text_sequence[:self.max_length * 4]

        return text_sequence, features

    def _clean_script(self, script: str) -> str:
        """Clean script content"""
        # Remove comments but keep the script structure
        lines = []
        for line in script.split('\n'):
            # Remove inline comments but keep command
            line = re.sub(r'#.*$', '', line)
            line = line.strip()
            if line:
                lines.append(line)
        return '\n'.join(lines)

    def _extract_commands(self, script: str) -> List[str]:
        """Extract command names from script"""
        commands = []

        # Simple command extraction (first word after pipes, &&, ||, semicolons, newlines)
        tokens = re.split(r'[;\n\|&]+', script)

        for token in tokens:
            token = token.strip()
            if token:
                # Get first word (command name)
                match = re.match(r'^(\w+)', token)
                if match:
                    commands.append(match.group(1))

        return commands

    def _extract_urls(self, script: str) -> List[str]:
        """Extract URLs from script"""
        url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
        urls = re.findall(url_pattern, script)
        return urls

    def _extract_ips(self, script: str) -> List[str]:
        """Extract IP addresses"""
        ip_pattern = r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b'
        ips = re.findall(ip_pattern, script)
        # Filter out invalid IPs
        valid_ips = []
        for ip in ips:
            parts = ip.split('.')
            if all(0 <= int(p) <= 255 for p in parts):
                valid_ips.append(ip)
        return valid_ips

    def _find_base64(self, script: str) -> List[str]:
        """Find potential base64 encoded content"""
        # Look for long alphanumeric strings that might be base64
        base64_pattern = r'[A-Za-z0-9+/]{20,}={0,2}'
        matches = re.findall(base64_pattern, script)
        return matches

    def _detect_obfuscation(self, script: str) -> float:
        """
        Detect obfuscation level (0.0 - 1.0)

        Indicators:
        - Excessive variable indirection
        - Many escape characters
        - Unusual encoding
        - Complex string manipulations
        """
        score = 0.0

        # Count escape characters
        escapes = len(re.findall(r'\\[^n\s]', script))
        if escapes > 10:
            score += 0.2

        # Count variable indirection
        indirection = len(re.findall(r'\$\{[^}]+\}', script))
        if indirection > 5:
            score += 0.2

        # Check for eval/exec
        if re.search(r'\beval\b|\bexec\b', script):
            score += 0.3

        # Check for base64
        if re.search(r'base64', script, re.IGNORECASE):
            score += 0.2

        # Check for complex substitutions
        substitutions = len(re.findall(r'sed|awk|tr|cut', script))
        if substitutions > 3:
            score += 0.1

        return min(score, 1.0)
