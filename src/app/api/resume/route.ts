export const runtime = "nodejs";

import { NextResponse } from "next/server";
// @ts-ignore
import PDFParser from "pdf2json";
import * as path from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const resume = formData.get("resume") as File | null;

    if (!resume) {
      return NextResponse.json(
        { error: "No resume uploaded" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await resume.arrayBuffer());

    const pdfParser = new PDFParser();

    const extractedText: string = await new Promise((resolve, reject) => {
      let text = "";

      pdfParser.on("pdfParser_dataError", (err: any) => {
        reject(err.parserError);
      });

      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        pdfData.Pages.forEach((page: any) => {
          page.Texts.forEach((t: any) => {
            const encodedText = t.R[0].T; // Get the encoded text segment

            // ✅ FIX: Use try/catch to safely decode text and prevent URIError crashes.
            try {
                // Attempt standard decoding
                text += decodeURIComponent(encodedText) + " ";
            } catch (e) {
                // If decoding fails (URI malformed), append the raw, encoded text instead.
                // This ensures the application doesn't crash.
                console.warn(`Failed to decode PDF text segment: ${encodedText}`);
                text += encodedText + " "; 
            }
          });
        });
        resolve(text);
      });

      pdfParser.parseBuffer(buffer);
    });

    const cleanText = extractedText.replace(/\s+/g, " ").trim();

    if (cleanText.length < 20) {
      return NextResponse.json(
        { error: "Resume text is too short or cannot be extracted." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      text: cleanText,
    });

  } catch (err) {
    console.error("Resume API Error:", err);
    return NextResponse.json(
      { error: "Failed to process resume." },
      { status: 500 }
    );
  }
}