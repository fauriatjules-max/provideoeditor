export interface Keyframe {
  time: number;
  value: number;
  interpolation: 'linear' | 'bezier' | 'ease-in' | 'ease-out';
  bezierHandles?: { x1: number; y1: number; x2: number; y2: number };
}

export class BezierCurve {
  static calculate(t: number, x1: number, y1: number, x2: number, y2: number): number {
    // Implémentation des courbes de Bézier cubiques
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    const p0 = 0;
    const p1 = x1;
    const p2 = x2;
    const p3 = 1;

    const x = uuu * p0 + 3 * uu * t * p1 + 3 * u * tt * p2 + ttt * p3;
    const y = uuu * p0 + 3 * uu * t * y1 + 3 * u * tt * y2 + ttt * p3;

    return y;
  }

  static interpolate(keyframes: Keyframe[], time: number): number {
    if (keyframes.length === 0) return 0;
    if (keyframes.length === 1) return keyframes[0].value;

    // Trouver les keyframes adjacents
    const before = [...keyframes].reverse().find(k => k.time <= time);
    const after = keyframes.find(k => k.time >= time);

    if (!before) return after!.value;
    if (!after) return before.value;
    if (before.time === after.time) return before.value;

    // Calculer la progression normalisée
    const progress = (time - before.time) / (after.time - before.time);

    // Appliquer l'interpolation
    switch (before.interpolation) {
      case 'linear':
        return before.value + (after.value - before.value) * progress;
      
      case 'bezier':
        const handles = before.bezierHandles || { x1: 0.25, y1: 0.25, x2: 0.75, y2: 0.75 };
        const bezierProgress = this.calculate(progress, handles.x1, handles.y1, handles.x2, handles.y2);
        return before.value + (after.value - before.value) * bezierProgress;
      
      case 'ease-in':
        return before.value + (after.value - before.value) * (1 - Math.cos(progress * Math.PI / 2));
      
      case 'ease-out':
        return before.value + (after.value - before.value) * Math.sin(progress * Math.PI / 2);
      
      default:
        return before.value + (after.value - before.value) * progress;
    }
  }
}
