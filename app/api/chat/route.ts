import { NextRequest, NextResponse } from "next/server";
import { retrieveNotes, getNoteByTopic, getGlossary } from "@/lib/retrieve";
import { buildSystemPrompt } from "@/lib/prompt";

const FOOTER = "Unofficial study aid. Verify on Microsoft Learn.";

export async function POST(req: NextRequest) {
  try {
    const { question, language, topic } = await req.json();
    if (!question?.trim()) {
      return NextResponse.json({ error: "Empty question" }, { status: 400 });
    }

    const [notes, glossary] = await Promise.all([
      topic ? getNoteByTopic(topic) : retrieveNotes(question),
      getGlossary(),
    ]);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY!,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: buildSystemPrompt(language, notes, glossary) }],
          },
          contents: [{ role: "user", parts: [{ text: question }] }],
          generationConfig: { maxOutputTokens: 700, temperature: 0.3 },
        }),
      }
    );
    if (!res.ok) throw new Error(`LLM ${res.status}: ${await res.text()}`);

    const data = await res.json();
    const raw = (data.candidates?.[0]?.content?.parts ?? [])
      .map((p: any) => p.text ?? "")
      .join("");

    const clean = raw.replace(/\n*Unofficial\s*study\s*aid[\s\S]*$/i, "").trim();

    return NextResponse.json({
      answer: `${clean}\n\n${FOOTER}`,
      topics: notes.map((n: any) => n.topic),
      related: [...new Set(notes.flatMap((n: any) => n.related_topics ?? []))],
    });
  } catch (e: any) {
    console.error("CHAT ERROR:", e?.message);
           return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}