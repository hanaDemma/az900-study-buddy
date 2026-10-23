import { supabase } from "./supabase";

function tokens(q: string) {
  const words = q.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  const bigrams = words.slice(0, -1).map((w, i) => `${w} ${words[i + 1]}`);
  return [...new Set([...words, ...bigrams])];
}

export async function retrieveNotes(question: string) {
  const { data } = await supabase
    .from("concept_notes").select("*")
    .overlaps("keywords", tokens(question)).limit(3);
  return data ?? [];
}

export async function getNoteByTopic(topic: string) {
  const { data } = await supabase
    .from("concept_notes").select("*").eq("topic", topic).limit(1);
  return data ?? [];
}

export async function getGlossary() {
  const { data } = await supabase.from("glossary").select("term_en, explanation_am");
  return data ?? [];
}