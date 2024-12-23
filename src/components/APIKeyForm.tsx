import React, { useState } from 'react';
import { APIKeyButton } from './APIKeyButton';

interface APIKeyFormProps {
  apiKey: string;
  onSave: (key: string) => void;
  onCancel: () => void;
}

export const APIKeyForm = ({ apiKey: initialApiKey, onSave, onCancel }: APIKeyFormProps) => {
  const [key, setKey] = useState(initialApiKey);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) {
      setError('API key is required');
      return;
    }
    setError('');
    onSave(key);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1">
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Enter your OpenRouter API key"
          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          aria-label="API Key"
          aria-invalid={!!error}
          aria-describedby={error ? "api-key-error" : undefined}
        />
        {error && (
          <div id="api-key-error" className="mt-1 text-xs text-red-500">
            {error}
          </div>
        )}
      </div>
      <APIKeyButton onClick={handleSubmit} type="submit">Save</APIKeyButton>
      <APIKeyButton onClick={onCancel} variant="secondary">Cancel</APIKeyButton>
    </form>
  );
};
