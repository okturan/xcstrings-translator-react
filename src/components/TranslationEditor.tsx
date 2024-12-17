import { useState } from "react";

interface TranslationEditorProps {
  value: string | undefined;
  showEditButton: boolean;
  onSave: (value: string) => Promise<void>;
  translationKey: string;
  sourceText: string;
  targetLanguage: string;
  sourceLanguage: string;
  comment?: string;
}

export const TranslationEditor = ({
  value,
  showEditButton,
  onSave,
  translationKey,
  sourceText,
  sourceLanguage,
  targetLanguage,
  comment,
}: TranslationEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save translation:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value ?? "");
    setIsEditing(false);
  };

  const handleAITranslate = async () => {
    setIsTranslating(true);
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-haiku-20241022:beta",
          messages: [
            {
              role: "user",
              content: `
              You are an AI-powered translator specializing in UI string localization for software applications. Your task is to accurately translate text while preserving its original meaning and formatting, especially considering the context of user interface elements.

You will receive the following inputs:

1. Source language:
<source_language>
${sourceLanguage}
</source_language>

2. Target language:
<target_language>
${targetLanguage}
</target_language>

3. Translation key (a unique identifier for this text):
<translation_key>
${translationKey}
</translation_key>

4. Context (optional information about how the text is used):
<context>
${comment}
</context>

5. Source text (the original text to be translated):
<source_text>
${sourceText}
</source_text>

Instructions:
1. Carefully read the source text and consider any provided context.
2. Conduct a translation analysis inside <translation_analysis> tags, including:
   a. Analyze the source text for any UI-specific terminology or formatting
   b. Consider cultural nuances in the target language
   c. Identify the namespace nesting in translation_key. This will provide context where available.
   d. Plan how to maintain the original tone and style
3. Translate the source text from the source language to the target language.
4. Ensure that your translation:
   - Accurately conveys the original meaning
   - Is appropriate for use in a user interface
   - Maintains any formatting present in the original text (e.g., line breaks, punctuation)
   - Does not include any additional metadata, tags, or additional text unless they were present in the original source text.

Output your translation directly, without any surrounding quotes, tags, or additional text unless they were present in the original source text.

Please proceed with the translation task.`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Translation API request failed");
      }

      const data = await response.json();
      const translation = data.choices[0].message.content.trim();

      // Remove any content between <translation_analysis> tags
      const cleanedTranslation = translation.replace(/<translation_analysis>[\s\S]*?<\/translation_analysis>/g, "").trim();

      setEditValue(cleanedTranslation);
      setIsEditing(true);
    } catch (error) {
      console.error("Failed to get AI translation:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between space-x-2">
        <span>{value}</span>
        <div className="flex space-x-1">
          {showEditButton && (
            <>
              <button
                onClick={handleAITranslate}
                disabled={isTranslating}
                className="px-2 py-1 text-xs text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50"
                title="Translate with AI">
                {isTranslating ? "..." : "🤖"}
              </button>
              <button onClick={() => setIsEditing(true)} className="px-2 py-1 text-xs text-gray-600 rounded hover:bg-gray-200">
                ✍️
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <textarea
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        className="w-full p-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={2}
        disabled={isSaving}
      />
      <div className="flex flex-col space-y-1">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300">
          {isSaving ? "..." : "Save"}
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:bg-gray-50">
          Cancel
        </button>
      </div>
    </div>
  );
};
