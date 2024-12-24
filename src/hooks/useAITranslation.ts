import { useState } from "react";
import { toast } from "react-toastify";
import { getAITranslation } from "../utils/translationService";
import { useModels } from "../contexts/model";

interface UseAITranslationProps {
  sourceLanguage: string;
  targetLanguage: string;
  translationKey: string;
  sourceText: string;
  comment?: string;
}

export const useAITranslation = ({
  sourceLanguage,
  targetLanguage,
  translationKey,
  sourceText,
  comment,
}: UseAITranslationProps) => {
  const { selectedModel } = useModels();
  const [isTranslating, setIsTranslating] = useState(false);

  const translate = async () => {
    setIsTranslating(true);
    try {
      const translation = await getAITranslation({
        sourceLanguage,
        targetLanguage,
        translationKey,
        sourceText,
        comment,
      }, selectedModel);

      return translation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get AI translation";
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsTranslating(false);
    }
  };

  return {
    translate,
    isTranslating,
  };
};
