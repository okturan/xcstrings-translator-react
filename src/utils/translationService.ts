import { TranslationRequest } from '../types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'anthropic/claude-3.5-haiku-20241022:beta';

const createTranslationPrompt = ({
  sourceLanguage,
  targetLanguage,
  translationKey,
  comment,
  sourceText,
}: TranslationRequest): string => {
  return `
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

Please proceed with the translation task.`;
};

export const getAITranslation = async (
  translationRequest: TranslationRequest
): Promise<string> => {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: createTranslationPrompt(translationRequest),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error('Translation API request failed');
  }

  const data = await response.json();
  const translation = data.choices[0].message.content.trim();

  // Remove any content between <translation_analysis> tags
  return translation.replace(/<translation_analysis>[\s\S]*?<\/translation_analysis>/g, '').trim();
};
