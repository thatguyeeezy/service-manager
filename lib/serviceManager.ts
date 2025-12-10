import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';

export interface ServiceProcess {
  pid: number;
  process: ChildProcess;
  startTime: Date;
}

class ServiceManager {
  private processes: Map<number, ServiceProcess> = new Map();
  private logCallbacks: Map<number, Set<(data: string, type: 'stdout' | 'stderr') => void>> = new Map();

  async startService(
    serviceId: number,
    command: string,
    workingDir: string,
    envVars?: string
  ): Promise<number> {
    // Parse environment variables
    const env: NodeJS.ProcessEnv = { ...process.env };
    if (envVars) {
      try {
        const parsed = JSON.parse(envVars);
        Object.assign(env, parsed);
      } catch (e) {
        // If not JSON, try parsing as key=value pairs
        envVars.split('\n').forEach(line => {
          const [key, ...valueParts] = line.split('=');
          if (key && valueParts.length > 0) {
            env[key.trim()] = valueParts.join('=').trim();
          }
        });
      }
    }

    // Ensure working directory exists
    if (!fs.existsSync(workingDir)) {
      throw new Error(`Working directory does not exist: ${workingDir}`);
    }

    // Parse command (handle both string and array formats)
    const commandParts = command.trim().split(/\s+/);
    const executable = commandParts[0];
    const args = commandParts.slice(1);

    // Spawn process
    const childProcess = spawn(executable, args, {
      cwd: workingDir,
      env,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    if (!childProcess.pid) {
      throw new Error('Failed to start process');
    }

    const serviceProcess: ServiceProcess = {
      pid: childProcess.pid,
      process: childProcess,
      startTime: new Date(),
    };

    this.processes.set(serviceId, serviceProcess);

    // Handle stdout
    childProcess.stdout?.on('data', (data: Buffer) => {
      const message = data.toString();
      this.broadcastLog(serviceId, message, 'stdout');
    });

    // Handle stderr
    childProcess.stderr?.on('data', (data: Buffer) => {
      const message = data.toString();
      this.broadcastLog(serviceId, message, 'stderr');
    });

    // Handle process exit
    childProcess.on('exit', (code, signal) => {
      this.processes.delete(serviceId);
      this.broadcastLog(serviceId, `Process exited with code ${code}${signal ? ` (signal: ${signal})` : ''}\n`, 'system');
    });

    // Handle errors
    childProcess.on('error', (error) => {
      this.broadcastLog(serviceId, `Process error: ${error.message}\n`, 'stderr');
      this.processes.delete(serviceId);
    });

    return childProcess.pid;
  }

  async stopService(serviceId: number, stopCommand?: string): Promise<boolean> {
    const serviceProcess = this.processes.get(serviceId);
    
    if (!serviceProcess) {
      // Try to kill by PID from database if process not in memory
      return false;
    }

    if (stopCommand) {
      // Execute custom stop command
      try {
        const stopParts = stopCommand.trim().split(/\s+/);
        const stopExecutable = stopParts[0];
        const stopArgs = stopParts.slice(1);
        
        spawn(stopExecutable, stopArgs, {
          shell: true,
          stdio: 'ignore',
        });
        
        // Wait a bit then force kill if still running
        setTimeout(() => {
          if (this.processes.has(serviceId)) {
            serviceProcess.process.kill('SIGTERM');
            setTimeout(() => {
              if (this.processes.has(serviceId)) {
                serviceProcess.process.kill('SIGKILL');
              }
            }, 5000);
          }
        }, 2000);
      } catch (error) {
        // Fall back to kill
        serviceProcess.process.kill('SIGTERM');
        setTimeout(() => {
          if (this.processes.has(serviceId)) {
            serviceProcess.process.kill('SIGKILL');
          }
        }, 5000);
      }
    } else {
      // Default: graceful shutdown
      serviceProcess.process.kill('SIGTERM');
      setTimeout(() => {
        if (this.processes.has(serviceId)) {
          serviceProcess.process.kill('SIGKILL');
        }
      }, 5000);
    }

    return true;
  }

  async killService(serviceId: number): Promise<boolean> {
    const serviceProcess = this.processes.get(serviceId);
    if (!serviceProcess) {
      return false;
    }

    serviceProcess.process.kill('SIGKILL');
    this.processes.delete(serviceId);
    return true;
  }

  isServiceRunning(serviceId: number): boolean {
    const serviceProcess = this.processes.get(serviceId);
    if (!serviceProcess) {
      return false;
    }

    // Check if process is still alive
    try {
      process.kill(serviceProcess.pid, 0);
      return true;
    } catch {
      this.processes.delete(serviceId);
      return false;
    }
  }

  getServicePid(serviceId: number): number | null {
    const serviceProcess = this.processes.get(serviceId);
    return serviceProcess?.pid || null;
  }

  subscribeToLogs(serviceId: number, callback: (data: string, type: 'stdout' | 'stderr') => void): () => void {
    if (!this.logCallbacks.has(serviceId)) {
      this.logCallbacks.set(serviceId, new Set());
    }
    this.logCallbacks.get(serviceId)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.logCallbacks.get(serviceId);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.logCallbacks.delete(serviceId);
        }
      }
    };
  }

  private broadcastLog(serviceId: number, data: string, type: 'stdout' | 'stderr'): void {
    const callbacks = this.logCallbacks.get(serviceId);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data, type);
        } catch (error) {
          console.error('Error in log callback:', error);
        }
      });
    }
  }

  getAllRunningServices(): number[] {
    return Array.from(this.processes.keys());
  }
}

export const serviceManager = new ServiceManager();

