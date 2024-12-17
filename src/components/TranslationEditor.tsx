import { useState } from "react";

interface TranslationEditorProps {
  value: string | undefined;
  showEditButton: boolean;
  onSave: (value: string) => Promise<void>;
}

export const TranslationEditor = ({ value, showEditButton, onSave }: TranslationEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value ?? "");
  const [isSaving, setIsSaving] = useState(false);

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

  if (!isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <span>{value}</span>
        {showEditButton && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
          >
            Edit
          </button>
        )}
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
          className="px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isSaving ? "..." : "Save"}
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
