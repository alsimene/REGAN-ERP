import { NextRequest, NextResponse } from "next/server";
import LandingAIADE from "landingai-ade";
import { toFile } from "landingai-ade";
import { purchaseOrderJsonSchema } from "@/lib/poExtractionSchema";

export const maxDuration = 60; // seconds (for Vercel)

const ALLOWED_EXTENSIONS = new Set([
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "webp",
  "tiff",
  "tif",
]);

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.LANDING_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Landing AI API key not configured" },
        { status: 500 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 },
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: `Unsupported file type: .${ext}` },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum 20 MB." },
        { status: 400 },
      );
    }

    const client = new LandingAIADE({ apikey: apiKey });

    // Convert the Web File to a Buffer for the SDK
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const adeFile = await toFile(buffer, file.name);

    // Step 1: Parse document to markdown
    const parseResponse = await client.parse({
      document: adeFile,
      model: "dpt-2-latest",
    });

    const markdown = parseResponse.markdown;
    if (!markdown) {
      return NextResponse.json(
        { error: "Failed to parse document — no content extracted" },
        { status: 422 },
      );
    }

    // Step 2: Extract structured data using the PO schema
    // The extract endpoint expects the markdown as a file-like object
    const mdFile = await toFile(
      Buffer.from(markdown, "utf-8"),
      "document.md",
    );

    const extractResponse = await client.extract({
      schema: JSON.stringify(purchaseOrderJsonSchema),
      markdown: mdFile,
    });

    const extraction = extractResponse.extraction;
    if (!extraction) {
      return NextResponse.json(
        { error: "Failed to extract structured data from document" },
        { status: 422 },
      );
    }

    return NextResponse.json({ success: true, data: extraction });
  } catch (err: unknown) {
    console.error("[extract-po] Error:", err);
    const message =
      err instanceof Error ? err.message : "Unknown extraction error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
