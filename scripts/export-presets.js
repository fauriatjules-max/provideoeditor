export const ExportPresets = {
  h264_1080p: {
    codec: 'libx264',
    preset: 'slow',
    crf: 18,
    resolution: '1920x1080',
    audioCodec: 'aac',
    audioBitrate: '192k'
  },
  h265_4k: {
    codec: 'libx265',
    preset: 'medium',
    crf: 20,
    resolution: '3840x2160',
    audioCodec: 'aac',
    audioBitrate: '256k'
  },
  prores: {
    codec: 'prores_ks',
    profile: 'hq',
    resolution: '1920x1080',
    audioCodec: 'pcm_s16le'
  }
};

export function getFFmpegArgs(preset) {
  const args = ['-c:v', preset.codec];
  
  if (preset.preset) args.push('-preset', preset.preset);
  if (preset.crf) args.push('-crf', preset.crf.toString());
  if (preset.resolution) args.push('-s', preset.resolution);
  if (preset.audioCodec) args.push('-c:a', preset.audioCodec);
  if (preset.audioBitrate) args.push('-b:a', preset.audioBitrate);
  
  return args;
}
