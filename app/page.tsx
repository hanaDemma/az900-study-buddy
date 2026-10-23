"use client";
import { useEffect, useRef, useState } from "react";

type Topic = { domain: string; topic: string };
type Msg = { role: "user" | "bot"; text: string; related?: string[] };
type Lang = "en" | "am";

const DOMAINS: Record<string, string> = {
  cloud_concepts: "Cloud concepts",
  azure_architecture: "Azure architecture and services",
  management_governance: "Management and governance",
};

const UI = {
  en: {
    placeholder: "Ask about an Azure concept...",
    send: "Send",
    empty: "Pick a topic or ask a question to start.",
    thinking: "Thinking...",
    error: "Something went wrong. Please try again.",
    related: "Explore next",
    topics: "Topics",
  },
  am: {
    placeholder: "ስለ Azure ጽንሰ-ሀሳብ ይጠይቁ...",
    send: "ላክ",
    empty: "ርዕስ ይምረጡ ወይም ጥያቄ ይጠይቁ።",
    thinking: "በማሰብ ላይ...",
    error: "ችግር ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።",
    related: "ቀጥሎ ይመልከቱ",
    topics: "ርዕሶች",
  },
};

function renderText(t: string) {
  return t.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <span key={i}>{part}</span>
  );
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const t = UI[lang];

  useEffect(() => {
    fetch("/api/topics").then((r) => r.json()).then(setTopics).catch(() => {});
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(question: string, topic?: string) {
    if (!question.trim() || loading) return;
    setError(false);
    setMessages((m) => [...m, { role: "user", text: topic ?? question }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, language: lang, topic }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const known = new Set(topics.map((x) => x.topic));
      const related = (data.related ?? []).filter((r: string) => known.has(r));
      setMessages((m) => [...m, { role: "bot", text: data.answer, related }]);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const grouped = topics.reduce<Record<string, string[]>>((acc, x) => {
    (acc[x.domain] ||= []).push(x.topic);
    return acc;
  }, {});

  return (
    <div className="flex h-screen flex-col bg-slate-50 text-slate-900">
      <header className="flex items-center justify-between border-b bg-white px-4 py-3">
        <h1 className="text-lg font-semibold text-teal-700">AZ-900 Study Buddy</h1>
        <div className="flex overflow-hidden rounded-lg border text-sm">
          {(["en", "am"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1.5 ${lang === l ? "bg-teal-600 text-white" : "bg-white text-slate-700"}`}
            >
              {l === "en" ? "EN" : "አማ"}
            </button>
          ))}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-64 overflow-y-auto border-r bg-white p-4 md:block">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t.topics}</p>
          {Object.entries(grouped).map(([domain, list]) => (
            <div key={domain} className="mb-4">
              <p className="mb-1 text-sm font-medium text-teal-800">{DOMAINS[domain] ?? domain}</p>
              {list.map((topic) => (
                <button
                  key={topic}
                  onClick={() => send(`Explain: ${topic}`, topic)}
                  className="block w-full rounded px-2 py-1 text-left text-sm text-slate-700 hover:bg-teal-50"
                >
                  {topic}
                </button>
              ))}
            </div>
          ))}
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="border-b bg-white p-2 md:hidden">
            <select
              className="w-full rounded border p-2 text-sm"
              defaultValue=""
              onChange={(e) => e.target.value && send(`Explain: ${e.target.value}`, e.target.value)}
            >
              <option value="">{t.topics}</option>
              {topics.map((x) => (
                <option key={x.topic} value={x.topic}>{x.topic}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && <p className="mt-10 text-center text-slate-500">{t.empty}</p>}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user" ? "bg-teal-600 text-white" : "border bg-white shadow-sm"
                  }`}
                >
                  {renderText(m.text)}
                  {m.related && m.related.length > 0 && (
                    <div className="mt-3 border-t pt-2">
                      <p className="mb-1 text-xs text-slate-500">{t.related}</p>
                      <div className="flex flex-wrap gap-2">
                        {m.related.map((r) => (
                          <button
                            key={r}
                            onClick={() => send(`Explain: ${r}`, r)}
                            className="rounded-full border border-teal-300 px-3 py-1 text-xs text-teal-800 hover:bg-teal-50"
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && <p className="text-sm text-slate-500">{t.thinking}</p>}
            {error && <p className="text-sm text-red-600">{t.error}</p>}
            <div ref={endRef} />
          </div>

          <div className="border-t bg-white p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
                placeholder={t.placeholder}
                className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-teal-500"
              />
              <button
                onClick={() => send(input)}
                disabled={loading}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {t.send}
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-slate-500">
              Unofficial study aid. Not affiliated with Microsoft.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}