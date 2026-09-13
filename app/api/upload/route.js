// app/api/upload/route.js
// Mmiliki/mfanyakazi anapakia picha ya kawaida (JPG/PNG) - hapa inabadilishwa
// kiotomatiki kuwa WebP na kupunguzwa ukubwa (lib/imageProcessing.js).
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit";
import { processAndSaveImage, saveRawVideo } from "@/lib/imageProcessing";

const ALLOWED_SUBFOLDERS = new Set(["bidhaa", "wafanyakazi", "gallery", "video"]);
const ALLOWED_KINDS = new Set(["product", "hero", "profile", "gallery", "video"]);
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const MAX_VIDEO_BYTES = 40 * 1024 * 1024; // video fupi tu (mfano: hadi ~30-40s ubora wa kawaida)
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export async function POST(req) {
  const auth = await requireUser(["admin", "staff"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let formData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Ombi si sahihi." }, { status: 400 });
  }

  const file = formData.get("file");
  const kind = formData.get("kind") || "product";
  const subfolder = formData.get("subfolder") || "bidhaa";

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Hakuna faili lililotumwa." }, { status: 400 });
  }
  if (!ALLOWED_SUBFOLDERS.has(subfolder)) {
    return NextResponse.json({ error: "Eneo la kuhifadhi si sahihi." }, { status: 400 });
  }
  if (!ALLOWED_KINDS.has(kind)) {
    return NextResponse.json({ error: "Aina ya faili si sahihi." }, { status: 400 });
  }

  // ---------- VIDEO ----------
  if (kind === "video") {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Aina ya video si sahihi (MP4/WebM/MOV pekee)." }, { status: 400 });
    }
    if (file.size > MAX_VIDEO_BYTES) {
      return NextResponse.json({ error: "Video ni kubwa mno (upeo 40MB). Punguza muda/ubora wa video." }, { status: 400 });
    }
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await saveRawVideo(buffer, file.type, subfolder);

      await logAudit({
        user: auth.user,
        action: "VIDEO_UPLOAD",
        details: { url: result.url, sizeKb: result.sizeKb, subfolder },
        ip: getClientIp(req),
      });

      return NextResponse.json({ url: result.url, sizeKb: result.sizeKb });
    } catch (err) {
      console.error("Hitilafu ya kupakia video:", err);
      return NextResponse.json({ error: "Imeshindwa kuhifadhi video. Jaribu tena." }, { status: 500 });
    }
  }

  // ---------- PICHA ----------
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return NextResponse.json({ error: "Aina ya faili si sahihi (JPG/PNG/WebP pekee)." }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Picha ni kubwa mno (upeo 12MB)." }, { status: 400 });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await processAndSaveImage(buffer, kind, subfolder);

    await logAudit({
      user: auth.user,
      action: "IMAGE_UPLOAD",
      details: { url: result.url, sizeKb: result.sizeKb, subfolder },
      ip: getClientIp(req),
    });

    return NextResponse.json({ url: result.url, sizeKb: result.sizeKb });
  } catch (err) {
    console.error("Hitilafu ya kupakia picha:", err);
    return NextResponse.json({ error: "Imeshindwa kubadilisha/kuhifadhi picha. Jaribu picha nyingine." }, { status: 500 });
  }
}
