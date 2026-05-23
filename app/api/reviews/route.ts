import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase.from("reviews").select("*").order("id", { ascending: false }).limit(20);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, reviews: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
