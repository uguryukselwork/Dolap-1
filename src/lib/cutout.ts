/**
 * Smart Garment Cutout Engine
 * Automatically removes solid/studio/white backgrounds from clothing images found on Google
 * and trims transparent margins so skirts/tops fit accurately onto a person's photo.
 */

export async function fetchImageAsDataUrl(urlOrData: string): Promise<string> {
  const trimmed = urlOrData.trim();
  if (trimmed.startsWith('data:')) {
    return trimmed;
  }

  // Use server proxy to avoid CORS canvas tainting on external Google/e-commerce image URLs
  const resp = await fetch('/api/proxy-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: trimmed }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || 'Resim bağlantısı yüklenemedi.');
  }

  const json = await resp.json();
  if (!json.success || !json.dataUrl) {
    throw new Error('Geçersiz resim verisi.');
  }
  return json.dataUrl;
}

export async function removeGarmentBackground(
  imageSrc: string,
  tolerance: number = 42
): Promise<string> {
  const safeDataUrl = await fetchImageAsDataUrl(imageSrc);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const maxDim = 650;
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(safeDataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, w, h);
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Sample corner & edge patches to determine dominant background color
        const samplePoints: Array<[number, number]> = [
          [0, 0],
          [w - 1, 0],
          [0, h - 1],
          [w - 1, h - 1],
          [Math.floor(w / 2), 0],
          [0, Math.floor(h / 2)],
          [w - 1, Math.floor(h / 2)],
          [2, 2],
          [w - 3, 2],
          [2, h - 3],
          [w - 3, h - 3],
        ];

        // If already transparent at corners, just trim and return
        let transparentCorners = 0;
        const samples: Array<[number, number, number]> = [];
        for (const [sx, sy] of samplePoints) {
          const idx = (sy * w + sx) * 4;
          if (data[idx + 3] < 30) {
            transparentCorners++;
          } else {
            samples.push([data[idx], data[idx + 1], data[idx + 2]]);
          }
        }

        if (transparentCorners >= 4 || samples.length === 0) {
          resolve(trimTransparentCanvas(canvas));
          return;
        }

        // Compute median background RGB
        const rs = samples.map((s) => s[0]).sort((a, b) => a - b);
        const gs = samples.map((s) => s[1]).sort((a, b) => a - b);
        const bs = samples.map((s) => s[2]).sort((a, b) => a - b);
        const mid = Math.floor(samples.length / 2);
        const bgR = rs[mid];
        const bgG = gs[mid];
        const bgB = bs[mid];

        const colorDist = (r: number, g: number, b: number) => {
          const dr = r - bgR;
          const dg = g - bgG;
          const db = b - bgB;
          return Math.sqrt(dr * dr + dg * dg + db * db);
        };

        // Flood-fill from all 4 outer borders so internal bright parts of the garment are preserved
        const visited = new Uint8Array(w * h);
        const isBg = new Uint8Array(w * h);
        const queue = new Int32Array(w * h);
        let head = 0;
        let tail = 0;

        const softTol = tolerance + 18;

        const tryEnqueue = (x: number, y: number) => {
          if (x < 0 || x >= w || y < 0 || y >= h) return;
          const pos = y * w + x;
          if (visited[pos]) return;
          visited[pos] = 1;

          const idx = pos * 4;
          const dist = colorDist(data[idx], data[idx + 1], data[idx + 2]);
          if (dist <= softTol) {
            isBg[pos] = 1;
            queue[tail++] = pos;
          }
        };

        // Seed all border pixels
        for (let x = 0; x < w; x++) {
          tryEnqueue(x, 0);
          tryEnqueue(x, h - 1);
        }
        for (let y = 0; y < h; y++) {
          tryEnqueue(0, y);
          tryEnqueue(w - 1, y);
        }

        // BFS flood fill
        while (head < tail) {
          const pos = queue[head++];
          const x = pos % w;
          const y = (pos - x) / w;

          if (x > 0) tryEnqueue(x - 1, y);
          if (x < w - 1) tryEnqueue(x + 1, y);
          if (y > 0) tryEnqueue(x, y - 1);
          if (y < h - 1) tryEnqueue(x, y + 1);
        }

        // Apply transparency and soft edge feathering
        for (let pos = 0; pos < w * h; pos++) {
          if (isBg[pos]) {
            const idx = pos * 4;
            const dist = colorDist(data[idx], data[idx + 1], data[idx + 2]);
            if (dist <= tolerance) {
              data[idx + 3] = 0;
            } else {
              // Feather transition at garment boundary
              const ratio = (dist - tolerance) / (softTol - tolerance);
              data[idx + 3] = Math.round(data[idx + 3] * Math.min(1, Math.max(0, ratio)));
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(trimTransparentCanvas(canvas));
      } catch (e) {
        resolve(safeDataUrl);
      }
    };
    img.onerror = () => reject(new Error('Resim okunamadı.'));
    img.src = safeDataUrl;
  });
}

function trimTransparentCanvas(sourceCanvas: HTMLCanvasElement): string {
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;
  const ctx = sourceCanvas.getContext('2d');
  if (!ctx) return sourceCanvas.toDataURL('image/png');

  const data = ctx.getImageData(0, 0, w, h).data;
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const alpha = data[(y * w + x) * 4 + 3];
      if (alpha > 25) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX <= minX || maxY <= minY) {
    return sourceCanvas.toDataURL('image/png');
  }

  // Add 2% breathing room
  const padX = Math.max(2, Math.round((maxX - minX) * 0.02));
  const padY = Math.max(2, Math.round((maxY - minY) * 0.02));
  minX = Math.max(0, minX - padX);
  minY = Math.max(0, minY - padY);
  maxX = Math.min(w - 1, maxX + padX);
  maxY = Math.min(h - 1, maxY + padY);

  const trimW = maxX - minX + 1;
  const trimH = maxY - minY + 1;

  const trimmed = document.createElement('canvas');
  trimmed.width = trimW;
  trimmed.height = trimH;
  const tCtx = trimmed.getContext('2d');
  if (!tCtx) return sourceCanvas.toDataURL('image/png');

  tCtx.drawImage(sourceCanvas, minX, minY, trimW, trimH, 0, 0, trimW, trimH);
  return trimmed.toDataURL('image/png');
}
