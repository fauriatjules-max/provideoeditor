import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { FFmpegOrchestrator } from '@provideoeditor/ffmpeg-orchestrator';
import { ProjectManager } from '@provideoeditor/core';

const __dirname = dirname(fileURLToPath(import.meta.url));

class ProVideoEditor {
  private mainWindow: BrowserWindow | null = null;
  private projectManager: ProjectManager;
  private ffmpegOrchestrator: FFmpegOrchestrator;

  constructor() {
    this.projectManager = new ProjectManager();
    this.ffmpegOrchestrator = new FFmpegOrchestrator();
    this.setupApp();
  }

  private setupApp() {
    app.whenReady().then(() => this.createWindow());
    
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') app.quit();
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) this.createWindow();
    });

    this.setupIPC();
  }

  private async createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1600,
      height: 900,
      minWidth: 1200,
      minHeight: 700,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, 'preload.js')
      },
      titleBarStyle: 'hiddenInset',
      show: false
    });

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
    });

    if (process.env.NODE_ENV === 'development') {
      await this.mainWindow.loadURL('http://localhost:5173');
    } else {
      await this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    }
  }

  private setupIPC() {
    // Gestion des projets
    ipcMain.handle('project:create', async (_, projectData) => {
      return await this.projectManager.createProject(projectData);
    });

    ipcMain.handle('project:save', async (_, projectId, data) => {
      return await this.projectManager.saveProject(projectId, data);
    });

    // Import de médias
    ipcMain.handle('media:import', async (_, filePaths) => {
      return await this.ffmpegOrchestrator.importMedia(filePaths);
    });

    // Export de projet
    ipcMain.handle('export:start', async (_, projectId, settings) => {
      return await this.ffmpegOrchestrator.exportProject(projectId, settings);
    });

    // Gestion des fenêtres
    ipcMain.handle('window:minimize', () => {
      this.mainWindow?.minimize();
    });

    ipcMain.handle('window:maximize', () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow?.maximize();
      }
    });

    ipcMain.handle('window:close', () => {
      this.mainWindow?.close();
    });
  }
}

new ProVideoEditor();
