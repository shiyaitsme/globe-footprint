import { CanvasTexture, ImageLoader, Loader, SRGBColorSpace } from "three";
import type { LoadingManager } from "three";

/**
 * A few of our planet textures are plain (non-panoramic) photos of one
 * hemisphere of a sphere rather than true 360° equirectangular maps. Wrapped
 * directly around a sphere, their left/right edges don't match up — the
 * wrap seam shows up as a hard, ugly cut between two unrelated slices of the
 * photo (and often lands mid-hemisphere since the photo's outer edges,
 * shot at a grazing angle, look flat/washed out compared to its center).
 *
 * This loader crops the sharpest, most detailed central strip of the source
 * image and mirror-tiles it across the full width, so both seams (the
 * sphere's wrap-around edge, and the mirror fold in the middle) land on
 * matching columns and blend seamlessly. Trade-off: the far hemisphere ends
 * up a mirrored duplicate of the near one — fine for a decorative gas-giant
 * look, not something you'd want for a real map, which is why Earth's
 * texture (an actual equirectangular Blue Marble image, already seamless)
 * doesn't go through this loader.
 */
const CORE_FRACTION = 0.6;

export class SeamlessEquirectTextureLoader extends Loader<CanvasTexture> {
  private imageLoader: ImageLoader;

  constructor(manager?: LoadingManager) {
    super(manager);
    this.imageLoader = new ImageLoader(this.manager);
  }

  load(
    url: string,
    onLoad?: (texture: CanvasTexture) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: unknown) => void
  ): CanvasTexture {
    const texture = new CanvasTexture(document.createElement("canvas"));
    texture.colorSpace = SRGBColorSpace;

    this.imageLoader.load(
      url,
      (image) => {
        texture.image = buildMirrorTiledCanvas(image);
        texture.needsUpdate = true;
        onLoad?.(texture);
      },
      onProgress,
      onError
    );

    return texture;
  }
}

function buildMirrorTiledCanvas(image: HTMLImageElement): HTMLCanvasElement {
  const { width, height } = image;
  const coreWidth = Math.round(width * CORE_FRACTION);
  const coreX = Math.round((width - coreWidth) / 2);

  const canvas = document.createElement("canvas");
  canvas.width = coreWidth * 2;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(image, coreX, 0, coreWidth, height, 0, 0, coreWidth, height);

  ctx.save();
  ctx.translate(coreWidth * 2, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(image, coreX, 0, coreWidth, height, 0, 0, coreWidth, height);
  ctx.restore();

  return canvas;
}
