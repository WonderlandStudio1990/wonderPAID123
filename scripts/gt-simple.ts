#!/usr/bin/env ts-node
import { spawn } from 'child_process';
import { execSync } from 'child_process';

interface StackInfo {
  branch: string;
  stackSize: number;
  hasConflicts: boolean;
  warnings: string[];
  needsSync: boolean;
  uncommittedChanges: boolean;
  stackHealth: 'good' | 'needs_attention' | 'has_issues';
}

class GraphiteMonitor {
  private startTime: number = Date.now();
  private warnings: string[] = [];
  private currentArgs: string[] = [];

  async executeCommand(args: string[]): Promise<void> {
    this.currentArgs = args;
    const command = args[0] || 'unknown';
    const stackInfo = await this.getStackInfo();
    
    // Pre-command checks and fixes
    await this.preCommandChecks(command, stackInfo);
    
    console.log(`[Graphite Monitor] Executing '${command}' command...`);
    if (stackInfo.stackSize > 0) {
      console.log(`[Graphite Monitor] Current stack size: ${stackInfo.stackSize}`);
      console.log(`[Graphite Monitor] Stack health: ${stackInfo.stackHealth}`);
    }

    try {
      await new Promise<void>((resolve, reject) => {
        const gt = spawn('gt', this.currentArgs, { stdio: 'inherit' });

        gt.on('exit', async (code) => {
          if (code === 0) {
            await this.logSuccess(command, stackInfo);
            resolve();
          } else {
            reject(new Error(`Command failed with code ${code}`));
          }
        });

        gt.on('error', reject);
      });

      // Post-command checks and fixes
      await this.postCommandChecks(command, stackInfo);
    } catch (error) {
      await this.handleError(command, error as Error, stackInfo);
      process.exit(1);
    }
  }

  private async preCommandChecks(command: string, stackInfo: StackInfo): Promise<void> {
    console.log('[Graphite Monitor] Running pre-command checks...');

    if (command === 'submit' && stackInfo.needsSync) {
      console.log('⚠ Stack needs sync with main. Running gt sync first...');
      await this.runCommand(['sync']);
    }

    if (stackInfo.hasConflicts) {
      console.log('⚠ Detected conflicts in stack. Please resolve conflicts first.');
      console.log('Suggestion: Run these commands:');
      console.log('1. gt sync');
      console.log('2. Resolve any conflicts');
      console.log('3. gt modify --all');
      process.exit(1);
    }

    if (command === 'create' && stackInfo.uncommittedChanges) {
      console.log('ℹ Found uncommitted changes. Adding --all flag automatically.');
      this.currentArgs.push('--all');
    }
  }

  private async postCommandChecks(command: string, stackInfo: StackInfo): Promise<void> {
    console.log('[Graphite Monitor] Running post-command checks...');

    // After submit, check if we need to sync
    if (command === 'submit') {
      const newStackInfo = await this.getStackInfo();
      if (newStackInfo.needsSync) {
        console.log('ℹ Syncing stack after submit...');
        await this.runCommand(['sync']);
      }
    }

    // After create, verify branch was created
    if (command === 'create') {
      const newStackInfo = await this.getStackInfo();
      if (newStackInfo.stackSize <= stackInfo.stackSize) {
        console.log('⚠ Branch might not have been created properly.');
        console.log('Suggestion: Check your changes and try again.');
      }
    }
  }

  private async getStackInfo(): Promise<StackInfo> {
    try {
      // Get current branch
      const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      
      // Get stack information using gt log
      const stackOutput = execSync('gt log --oneline 2>/dev/null || true', { encoding: 'utf8' });
      const stackSize = stackOutput.split('\n').filter(line => line.trim()).length;
      
      // Check for conflicts
      const statusOutput = execSync('git status', { encoding: 'utf8' });
      const hasConflicts = statusOutput.includes('Unmerged paths') || 
                          statusOutput.includes('fix conflicts');

      // Check if sync needed
      const syncNeeded = await this.checkIfSyncNeeded();

      // Check for uncommitted changes
      const uncommittedChanges = statusOutput.includes('Changes not staged') ||
                                statusOutput.includes('Untracked files');

      // Determine stack health
      const stackHealth = this.determineStackHealth({
        hasConflicts,
        needsSync: syncNeeded,
        uncommittedChanges,
        warnings: this.warnings
      });

      return {
        branch,
        stackSize,
        hasConflicts,
        warnings: this.warnings,
        needsSync: syncNeeded,
        uncommittedChanges,
        stackHealth
      };
    } catch (error) {
      return {
        branch: 'unknown',
        stackSize: 0,
        hasConflicts: false,
        warnings: [],
        needsSync: false,
        uncommittedChanges: false,
        stackHealth: 'needs_attention'
      };
    }
  }

  private async checkIfSyncNeeded(): Promise<boolean> {
    try {
      const mainBehind = execSync('git rev-list HEAD..origin/main --count', { encoding: 'utf8' }).trim();
      return parseInt(mainBehind, 10) > 0;
    } catch {
      return false;
    }
  }

  private determineStackHealth(info: Partial<StackInfo>): StackInfo['stackHealth'] {
    if (info.hasConflicts) return 'has_issues';
    if (info.needsSync || info.warnings?.length) return 'needs_attention';
    return 'good';
  }

  private async runCommand(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = spawn('gt', args, { stdio: 'inherit' });
      process.on('exit', code => code === 0 ? resolve() : reject());
      process.on('error', reject);
    });
  }

  private async logSuccess(command: string, stackInfo: StackInfo): Promise<void> {
    const duration = Date.now() - this.startTime;
    console.log('\n[Graphite Monitor] Command Summary:');
    console.log(`✓ '${command}' completed successfully in ${duration}ms`);
    
    if (stackInfo.stackSize > 0) {
      console.log(`✓ Stack size: ${stackInfo.stackSize} branch(es)`);
      console.log(`✓ Stack health: ${stackInfo.stackHealth}`);
    }
    
    if (stackInfo.hasConflicts) {
      console.log('⚠ Stack has conflicts that need resolution');
    }

    if (stackInfo.needsSync) {
      console.log('ℹ Stack needs to be synced with main');
    }

    if (stackInfo.warnings.length > 0) {
      console.log('\nWarnings:');
      stackInfo.warnings.forEach(warning => console.log(`⚠ ${warning}`));
    }
  }

  private async handleError(command: string, error: Error, stackInfo: StackInfo): Promise<void> {
    const duration = Date.now() - this.startTime;
    console.error('\n[Graphite Monitor] Error Summary:');
    console.error(`✗ '${command}' failed after ${duration}ms`);
    console.error(`✗ Error: ${error.message}`);
    
    if (stackInfo.hasConflicts) {
      console.error('\nPossible cause: Stack conflicts detected');
      console.error('Suggestion: Run `gt sync` to update your stack');
    }

    if (command === 'submit' && stackInfo.stackSize === 0) {
      console.error('\nPossible cause: No changes to submit');
      console.error('Suggestion: Make sure you have committed changes to submit');
    }

    if (stackInfo.needsSync) {
      console.error('\nPossible cause: Stack is behind main');
      console.error('Suggestion: Run `gt sync` to update your stack');
    }

    // Provide command-specific help
    switch (command) {
      case 'create':
        console.error('\nFor create issues, try:');
        console.error('1. gt sync');
        console.error('2. gt create --all --message "your message"');
        break;
      case 'submit':
        console.error('\nFor submit issues, try:');
        console.error('1. gt sync');
        console.error('2. gt modify --all (if you have changes)');
        console.error('3. gt submit --stack');
        break;
      case 'modify':
        console.error('\nFor modify issues, try:');
        console.error('1. gt sync');
        console.error('2. Resolve any conflicts');
        console.error('3. gt modify --all');
        break;
    }
  }
}

// Run the command with monitoring
const monitor = new GraphiteMonitor();
monitor.executeCommand(process.argv.slice(2));