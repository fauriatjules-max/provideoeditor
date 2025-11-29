import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Project management
  createProject: (projectData: any) => ipcRenderer.invoke('project:create', projectData),
  saveProject: (projectId: string, data: any) => ipcRenderer.invoke('project:save', projectId, data),

  // Media import
  importMedia: (filePaths: string[]) => ipcRenderer.invoke('media:import', filePaths),

  // Export
  startExport: (projectId: string, settings: any) => ipcRenderer.invoke('export:start', projectId, settings),

  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close')
});

export type ElectronAPI = typeof window.electronAPI;
