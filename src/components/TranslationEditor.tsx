import { useState } from "react";
import { getAITranslation } from "../utils/translationService";

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
              <button
                onClick={() => setIsEditing(true)}
                className="px-2 py-1 text-xs text-gray-600 rounded hover:bg-gray-200"
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
        value={editValue}
        onChange={(e) => {
          setEditValue(e.target.value);
          e.target.style.height = "5px";
          e.target.style.height = e.target.scrollHeight + "px";
        }}
        className="w-full h-auto p-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[2.5rem] resize-y overflow-hidden"
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
