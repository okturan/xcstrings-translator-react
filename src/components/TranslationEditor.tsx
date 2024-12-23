import { useState, useEffect, useRef, memo } from "react";
import { getAITranslation } from "../utils/translationService";
import { LoadingSpinner } from "./LoadingSpinner";

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

export const TranslationEditor = memo(
  ({ value, showEditButton, onSave, translationKey, sourceText, sourceLanguage, targetLanguage, comment }: TranslationEditorProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value ?? "");

    // Update editValue when value or targetLanguage changes
    useEffect(() => {
      setEditValue(value ?? "");
    }, [value, targetLanguage]);

    const [isSaving, setIsSaving] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustTextareaHeight = (element: HTMLTextAreaElement, initialLoad = false) => {
      const lineHeight = 20; // Approximate line height in pixels
      const paddingHeight = 8; // Total vertical padding (4px top + 4px bottom)
      const charsPerLine = 60; // Number of characters per line

      // Reset height to auto to get proper scrollHeight
      element.style.height = "auto";

      // Calculate number of lines based on character count
      const textLength = element.value.length;
      const lines = Math.ceil(textLength / charsPerLine);
      const minLines = initialLoad ? Math.max(lines + 1, 1) : Math.max(lines, 1);

      // Set minimum height based on number of lines
      const minHeight = minLines * lineHeight + paddingHeight;

      // Set height to either minHeight or scrollHeight, whichever is larger
      element.style.height = `${Math.max(minHeight, element.scrollHeight)}px`;
    };

    useEffect(() => {
      if (isEditing && textareaRef.current) {
        adjustTextareaHeight(textareaRef.current, true);
      }
    }, [isEditing]);

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
        const translation = await getAITranslation({
          sourceLanguage,
          targetLanguage,
          translationKey,
          sourceText,
          comment,
        });

        setEditValue(translation);
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
          <div className="flex items-center space-x-1">
            {showEditButton && (
              <>
                <button
                  onClick={handleAITranslate}
                  disabled={isTranslating}
                  className="inline-flex items-center justify-center w-8 h-8 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Translate with AI">
                  {isTranslating ? (
                    <span className="flex items-center justify-center w-full h-full">
                      <LoadingSpinner size="sm" />
                    </span>
                  ) : (
                    "🤖"
                  )}
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={isTranslating}
                  className="inline-flex items-center justify-center w-8 h-8 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Edit manually">
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
          ref={textareaRef}
          value={editValue}
          onChange={(e) => {
            setEditValue(e.target.value);
            adjustTextareaHeight(e.target);
          }}
          className="w-full p-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[2.5rem] resize-y"
          disabled={isSaving}
        />
        <div className="flex flex-col space-y-1">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center justify-center w-16 h-7 text-xs text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed">
            {isSaving ? (
              <span className="flex items-center justify-center w-full h-full">
                <LoadingSpinner size="sm" color="white" />
              </span>
            ) : (
              "Save"
            )}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="inline-flex items-center justify-center w-16 h-7 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed">
            Cancel
          </button>
        </div>
      </div>
    );
  },
);
