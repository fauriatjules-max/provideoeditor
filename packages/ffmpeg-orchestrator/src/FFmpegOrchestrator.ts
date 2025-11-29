import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface MediaInfo {
  id: string;
  filePath: string;
  duration: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
}

export interface ExportSettings {
  format: 'mp4' | 'mov' | 'avi';
  codec: 'h264' | 'h265' | 'prores';
  resolution: '720p' | '1080p' | '4k';
  bitrate: string;
  preset: 'fast' | 'medium' | 'slow';
}

export class FFmpegOrchestrator {
  private proxyDir: string;

  constructor() {
    this.proxyDir = join(process.cwd(), 'proxies');
    this.ensureProxyDir();
  }

  private async ensureProxyDir() {
    try {
      await fs.access(this.proxyDir);
    } catch {
      await fs.mkdir(this.proxyDir, { recursive: true });
    }
  }

  async importMedia(filePaths: string[]): Promise<MediaInfo[]> {
    const mediaInfos: MediaInfo[] = [];

    for (const filePath of filePaths) {
      const mediaInfo = await this.analyzeMedia(filePath);
      mediaInfos.push(mediaInfo);
      await this.generateProxy(mediaInfo);
    }

    return mediaInfos;
  }

  private analyzeMedia(filePath: string): Promise<MediaInfo> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) reject(err);

        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

        resolve({
          id: `media_${Date.now()}`,
          filePath,
          duration: metadata.format.duration || 0,
          width: videoStream?.width || 0,
          height: videoStream?.height || 0,
          fps: this.parseFPS(videoStream?.r_frame_rate),
          codec: videoStream?.codec_name || 'unknown'
        });
      });
    });
  }

  private parseFPS(fpsString?: string): number {
    if (!fpsString) return 30;
    const [num, den] = fpsString.split('/').map(Number);
    return den ? num / den : num;
  }

  private generateProxy(mediaInfo: MediaInfo): Promise<string> {
    return new Promise((resolve, reject) => {
      const proxyPath = join(this.proxyDir, `${mediaInfo.id}_proxy.mp4`);

      ffmpeg(mediaInfo.filePath)
        .outputOptions([
          '-c:v libx264',
          '-preset veryfast',
          '-crf 23',
          '-vf scale=1280:-2',
          '-c:a aac',
          '-b:a 128k'
        ])
        .output(proxyPath)
        .on('end', () => resolve(proxyPath))
        .on('error', reject)
        .run();
    });
  }

  async exportProject(projectId: string, settings: ExportSettings): Promise<string> {
    // Implémentation de l'exportation basée sur le projet et les settings
    // Cette fonction va générer un fichier de commande FFmpeg complexe
    // en fonction de la timeline et des effets

    const outputPath = join(process.cwd(), 'exports', `${projectId}_export.${settings.format}`);
    
    // Pour l'instant, retourne un chemin fictif
    return outputPath;
  }
}
