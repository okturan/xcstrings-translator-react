import { useState, useEffect } from 'react';

const API_KEY_STORAGE_KEY = 'openrouter_api_key';

export function APIKeyInput() {
  const [apiKey, setApiKey] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    setIsEditing(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold mb-2">OpenRouter API Key</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit
          </button>
        )}
      </div>
      {isEditing ? (
        <div className="flex gap-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your OpenRouter API key"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            {apiKey ? (
              <div className="text-gray-600">API key is set {isSaved && <span className="text-green-500 ml-2">✓ Saved</span>}</div>
            ) : (
              <div className="text-red-500">No API key set. Please add your OpenRouter API key to use the translation feature.</div>
            )}
          </div>
        </div>
      )}
      <p className="mt-2 text-sm text-gray-500">
        You can get your API key from{' '}
        <a
          href="https://openrouter.ai/keys"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          OpenRouter
        </a>
      </p>
    </div>
  );
}

export const getStoredApiKey = () => {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
};
