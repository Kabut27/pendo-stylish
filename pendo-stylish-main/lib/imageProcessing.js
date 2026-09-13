// lib/imageProcessing.js
// Kila picha inayopakiwa na mmiliki/mfanyakazi inabadilishwa kiotomatiki kuwa WebP
// na kupunguzwa ukubwa - mmiliki hahitaji kujua chochote kuhusu hili.

import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { nanoid } from "nanoid";

const MAX_WIDTHS = {
  product: 1200,
  hero: 1920,
  profile: 500,
  gallery: 1000,
};

const QUALITY = 78; // ubora mzuri, ukubwa mdogo (WebP)

/**
 * Hifadhi picha iliyopakiwa: badilisha kuwa WebP, punguza upana kama inahitajika.
 * @param {Buffer} inputBuffer - bytes za picha ya awali (jpg/png/n.k)
 * @param {"product"|"hero"|"profile"|"gallery"} kind
 * @param {string} subfolder - mfano "bidhaa", "wafanyakazi", "gallery"
 * @returns {Promise<{url: string, filePath: string, sizeKb: number}>}
 */
export async function processAndSaveImage(inputBuffer, kind, subfolder) {
  const maxWidth = MAX_WIDTHS[kind] || 1200;
  const uploadDir = process.env.UPLOAD_DIR || "public/uploads";
  const targetDir = path.join(process.cwd(), uploadDir, subfolder);
  await fs.mkdir(targetDir, { recursive: true });

  const filename = `${subfolder}-${Date.now()}-${nanoid(8)}.webp`;
  const filePath = path.join(targetDir, filename);

  const metadata = await sharp(inputBuffer).metadata();
  const shouldResize = (metadata.width || 0) > maxWidth;

  let pipeline = sharp(inputBuffer).rotate(); // .rotate() bila param = auto-orient kwa EXIF
  if (shouldResize) {
    pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
  }

  const outputBuffer = await pipeline
    .webp({ quality: QUALITY, effort: 4 })
    .toBuffer();

  await fs.writeFile(filePath, outputBuffer);

  const publicUrl = `/uploads/${subfolder}/${filename}`;
  return {
    url: publicUrl,
    filePath,
    sizeKb: Math.round(outputBuffer.length / 1024),
  };
}

const VIDEO_EXT_BY_MIME = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

/**
 * Hifadhi video ya bidhaa kama ilivyo (haichakatwi/haibanywi - sharp haifanyi kazi na video).
 * @param {Buffer} inputBuffer
 * @param {string} mimeType - mfano "video/mp4"
 * @param {string} subfolder - mfano "video"
 */
export async function saveRawVideo(inputBuffer, mimeType, subfolder) {
  const ext = VIDEO_EXT_BY_MIME[mimeType] || "mp4";
  const uploadDir = process.env.UPLOAD_DIR || "public/uploads";
  const targetDir = path.join(process.cwd(), uploadDir, subfolder);
  await fs.mkdir(targetDir, { recursive: true });

  const filename = `${subfolder}-${Date.now()}-${nanoid(8)}.${ext}`;
  const filePath = path.join(targetDir, filename);
  await fs.writeFile(filePath, inputBuffer);

  const publicUrl = `/uploads/${subfolder}/${filename}`;
  return { url: publicUrl, filePath, sizeKb: Math.round(inputBuffer.length / 1024) };
}

/**
 * Futa picha ya zamani kwenye disk kwa usalama (kama ipo). Haisimamishi kama haipo.
 * (Inafanya kazi pia kwa video kwa sababu inaangalia tu njia ya /uploads/.)
 */
export async function deleteImageIfExists(publicUrl) {
  if (!publicUrl || !publicUrl.startsWith("/uploads/")) return;
  try {
    const fullPath = path.join(process.cwd(), "public", publicUrl);
    await fs.unlink(fullPath);
  } catch {
    // haipo - hakuna tatizo
  }
}
