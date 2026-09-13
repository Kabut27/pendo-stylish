import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit";
import { getSettings, updateSettings } from "@/lib/getSettings";
import { parseJsonBody, ValidationError } from "@/lib/validators";

export async function GET() {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const settings = await getSettings();
  return NextResponse.json({ settings });
}

export async function PUT(req) {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await parseJsonBody(req);
    if (body.latitude && Number.isNaN(Number(body.latitude))) {
      throw new ValidationError("Latitude si sahihi.");
    }
    if (body.longitude && Number.isNaN(Number(body.longitude))) {
      throw new ValidationError("Longitude si sahihi.");
    }
    const settings = await updateSettings(body);

    await logAudit({
      user: auth.user,
      action: "SETTINGS_UPDATE",
      details: body,
      ip: getClientIp(req),
    });

    return NextResponse.json({ settings });
  } catch (err) {
    if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Hitilafu ya server. Jaribu tena." }, { status: 500 });
  }
}
