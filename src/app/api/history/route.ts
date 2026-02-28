import { NextRequest, NextResponse } from "next/server";
import { getHistory } from "@/lib/supabase";

export async function GET(req: NextRequest) {
    const records = await getHistory(30);
    return NextResponse.json({ records, count: records.length });
}
