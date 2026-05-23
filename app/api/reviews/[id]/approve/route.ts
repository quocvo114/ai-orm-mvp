import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "../../../../../lib/supabaseServer";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
  }

  // If service key not configured, respond success so frontend can optimistically update.
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ success: true, warning: "No service key configured; DB not updated" });
  }

  try {
    const { error } = await supabaseServer.from("reviews").update({ status: "Đã giải quyết" }).eq("id", id);
    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
