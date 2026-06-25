async function callAiSearch(query) {
  const apiKey = process.env.INTEGRATIONS_API_KEY || "missing";
  if (apiKey === "missing") {
    console.error("INTEGRATIONS_API_KEY not found");
    process.exit(1);
  }

  const response = await fetch(
    "https://app-cfkom5or162p-api-zYm4ze3j7XvL.gateway.appmedo.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Gateway-Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: query }] }] }),
    }
  );

  if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
  if (!response.body) throw new Error("No response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let fullText = "";
  const sources = [];
  const webSearchQueries = [];
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const dataStr = line.slice(6).trim();
      if (dataStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(dataStr);
        const candidate = parsed?.candidates?.[0];
        if (!candidate) continue;

        const textChunk = candidate?.content?.parts?.[0]?.text ?? "";
        fullText += textChunk;

        const meta = candidate?.groundingMetadata;
        if (meta) {
          for (const chunk of meta.groundingChunks ?? []) {
            if (chunk?.web?.uri) {
              sources.push({ uri: chunk.web.uri, title: chunk.web.title ?? "" });
            }
          }
          for (const q of meta.webSearchQueries ?? []) {
            if (!webSearchQueries.includes(q)) webSearchQueries.push(q);
          }
        }
      } catch {
        // skip
      }
    }
  }

  return { text: fullText, sources, webSearchQueries };
}

(async () => {
  const result = await callAiSearch(
    "Top 20 innovative ideas and features to add to an educational platform for students (primary, middle school, high school, university). Focus on gamification, AI tutoring, spaced repetition, collaborative learning, adaptive learning, study tracking, and engagement. Cite specific successful examples from platforms like Duolingo, Anki, Notion, Khan Academy, Quizlet, Coursera, etc."
  );
  console.log(JSON.stringify(result, null, 2));
})();
