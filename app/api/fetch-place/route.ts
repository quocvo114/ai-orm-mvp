import { NextRequest, NextResponse } from "next/server";
import supabaseServer from "../../../lib/supabaseServer";

type PlaceReview = { author_name?: string; rating?: number; text?: string; time?: number };

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { placeId } = body;
  if (!placeId) return NextResponse.json({ success: false, error: "Missing placeId" }, { status: 400 });

  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return NextResponse.json({ success: false, error: "Missing GOOGLE_PLACES_API_KEY" }, { status: 500 });

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=name,reviews&key=${key}`;
  try {
    const r = await fetch(url);
    const data = await r.json();
    const reviews: PlaceReview[] = (data.result?.reviews ?? []).slice(0, 5).map((rev: any) => ({ author_name: rev.author_name, rating: rev.rating, text: rev.text, time: rev.time }));

    // try persist to Supabase if service key available
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const rows = reviews.map((rv) => ({ author: rv.author_name ?? "Unknown", rating: rv.rating ?? 5, text: rv.text ?? "", source: "Google Maps", date: new Date((rv.time ?? Date.now() / 1000) * 1000).toISOString(), status: "Chờ xử lý" }));
        await supabaseServer.from("reviews").insert(rows);
      } catch (e) {
        console.error("Persist reviews error", e);
      }
    }

    return NextResponse.json({ success: true, reviews });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
