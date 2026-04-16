import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { parseInBody } from "@/lib/parsers/inbody";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXT = new Set([".csv", ".xlsx", ".xls"]);

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ data: null, error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ data: null, error: "No file uploaded. Use field name \"file\"." }, { status: 400 });
  }

  // Extension check
  const name = file.name ?? "";
  const dotIdx = name.lastIndexOf(".");
  const ext = dotIdx >= 0 ? name.slice(dotIdx).toLowerCase() : "";
  if (!ALLOWED_EXT.has(ext)) {
    return NextResponse.json(
      { data: null, error: `Unsupported file type "${ext}". Upload a .csv, .xlsx, or .xls file.` },
      { status: 400 }
    );
  }

  // Size check
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ data: null, error: "File exceeds the 5 MB limit." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = parseInBody(buffer, ext);
    return NextResponse.json({ data: result, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to parse file.";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
