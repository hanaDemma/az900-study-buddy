import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data } = await supabase
    .from("concept_notes")
    .select("domain, topic")
    .order("domain")
    .order("topic");
  return NextResponse.json(data ?? []);
}