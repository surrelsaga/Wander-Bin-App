// src/services/gemini.js — calls our serverless function; key lives server-side.

export async function identifyTrash(imageFile) {
  try {
    const data = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(imageFile);
    });

    const res = await fetch("/api/identify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, mimeType: imageFile.type }),
    });
    if (!res.ok) throw new Error(`identify failed: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Gemini Scan Error:", error);
    return null;
  }
}
