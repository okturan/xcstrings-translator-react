import { useState, useEffect, useRef } from "react";
import { getStoredApiKey, setStoredApiKey } from "../utils/apiKeyUtils";
import { APIKeyButton } from "./APIKeyButton";
import { APIKeyForm } from "./APIKeyForm";
import { useClickOutside } from "../hooks/useClickOutside";

interface APIKeyState {
  key: string;
  isEditing: boolean;
  isSaved: boolean;
  isExpanded: boolean;
}

const APIKeyStatus = ({ isSaved }: { isSaved: boolean }) => (
  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full ring-1 ring-blue-700/10">
    {isSaved ? "Saved!" : "Securely Stored"}
  </span>
);

export function APIKeyInput() {
  const [state, setState] = useState<APIKeyState>({
    key: "",
    isEditing: false,
    isSaved: false,
    isExpanded: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, {
    onClickOutside: () => setState((prev) => ({ ...prev, isExpanded: false })),
    enabled: state.isExpanded,
    handleScroll: true,
  });

  useEffect(() => {
    const storedKey = getStoredApiKey();
    if (storedKey) {
      setState((prev) => ({ ...prev, key: storedKey }));
    }
  }, []);

  const handleSave = (newKey: string) => {
    setStoredApiKey(newKey);
    setState((prev) => ({
      ...prev,
      key: newKey,
      isEditing: false,
      isSaved: true,
      isExpanded: false,
    }));
    setTimeout(() => setState((prev) => ({ ...prev, isSaved: false })), 2000);
  };

  const toggleExpanded = () => {
    if (state.isEditing) return;
    setState((prev) => ({ ...prev, isExpanded: !prev.isExpanded }));
  };

  return (
    <div className="absolute right-8 mb-4" ref={containerRef}>
      <button
        onClick={toggleExpanded}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
          state.isExpanded ? "bg-blue-100 text-gray-900" : "bg-gray-50 text-gray-700"
        } hover:bg-blue-100 hover:text-gray-900 active:bg-blue-300 transition-all duration-200 shadow-sm`}
        aria-expanded={state.isExpanded}
        aria-controls="api-key-panel">
        <span className="font-medium">API</span>
        {state.key && (
          <span className="text-green-500" aria-label="API key is set">
            ✓
          </span>
        )}
        {!state.key && (
          <span className="text-xs text-red-500" aria-label="API key needs to be set">
            (Set API Key)
          </span>
        )}
      </button>

      {state.isExpanded && (
        <div
          id="api-key-panel"
          className="absolute right-0 mt-2 w-[32rem] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-10"
          role="dialog"
          aria-label="API Key Settings">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">OpenRouter API Key</h2>
              {!state.isEditing && (
                <APIKeyButton onClick={() => setState((prev) => ({ ...prev, isEditing: true }))}>{state.key ? "Edit" : "Add"}</APIKeyButton>
              )}
            </div>
            {state.key && !state.isEditing && (
              <div className="mt-2">
                <APIKeyStatus isSaved={state.isSaved} />
              </div>
            )}
          </div>

          <div className="p-4">
            {state.isEditing ? (
              <APIKeyForm apiKey={state.key} onSave={handleSave} onCancel={() => setState((prev) => ({ ...prev, isEditing: false }))} />
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="text-gray-500">
                    {state.key ? "API key is set and ready to use." : "Please add your OpenRouter API key to use the translation feature."}
                  </div>
                </div>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-4">
              You can get your API key from{" "}
              <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                OpenRouter
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
