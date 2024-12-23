import { useState, useEffect, useCallback } from 'react';
import { getStoredApiKey, setStoredApiKey } from '../utils/apiKeyUtils';

interface ButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit';
}

const Button = ({ onClick, variant = 'primary', children, className = '', type = 'button' }: ButtonProps) => {
  const baseStyles = 'px-3 py-1.5 text-xs rounded-md transition-colors shadow-sm';
  const variantStyles = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'text-gray-700 bg-gray-50 hover:bg-gray-100'
  };

  return (
    <button
      onClick={onClick}
      type={type}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

interface APIKeyFormProps {
  apiKey: string;
  onSave: (key: string) => void;
  onCancel: () => void;
}

const APIKeyForm = ({ apiKey: initialApiKey, onSave, onCancel }: APIKeyFormProps) => {
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
      <Button onClick={handleSubmit} type="submit">Save</Button>
      <Button onClick={onCancel} variant="secondary">Cancel</Button>
    </form>
  );
};

interface APIKeyStatusProps {
  isSaved: boolean;
}

const APIKeyStatus = ({ isSaved }: APIKeyStatusProps) => (
  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full ring-1 ring-blue-700/10">
    {isSaved ? 'Saved!' : 'Securely Stored'}
  </span>
);

export function APIKeyInput() {
  const [apiKey, setApiKey] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const storedKey = getStoredApiKey();
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleSave = useCallback((newKey: string) => {
    setStoredApiKey(newKey);
    setApiKey(newKey);
    setIsEditing(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  }, []);

  const toggleExpanded = useCallback(() => {
    if (isEditing) return;
    setIsExpanded(!isExpanded);
  }, [isEditing, isExpanded]);

  return (
    <div className="absolute right-8 mb-4">
      <button
        onClick={toggleExpanded}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
          isExpanded ? 'bg-blue-50 text-gray-900' : 'bg-gray-50 text-gray-700'
        } hover:bg-blue-50 hover:text-gray-900 transition-all duration-200 shadow-sm`}
        aria-expanded={isExpanded}
        aria-controls="api-key-panel"
      >
        <span className="font-medium">API</span>
        {apiKey && <span className="text-green-500" aria-label="API key is set">✓</span>}
        {!apiKey && <span className="text-xs text-red-500" aria-label="API key needs to be set">(Set API Key)</span>}
      </button>

      {isExpanded && (
        <div
          id="api-key-panel"
          className="absolute right-0 mt-2 w-[32rem] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-10"
          role="dialog"
          aria-label="API Key Settings"
        >
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">OpenRouter API Key</h2>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>
                  {apiKey ? 'Edit' : 'Add'}
                </Button>
              )}
            </div>
            {apiKey && !isEditing && (
              <div className="mt-2">
                <APIKeyStatus isSaved={isSaved} />
              </div>
            )}
          </div>

          <div className="p-4">
            {isEditing ? (
              <APIKeyForm
                apiKey={apiKey}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="text-gray-500">
                    {apiKey
                      ? 'API key is set and ready to use.'
                      : 'Please add your OpenRouter API key to use the translation feature.'}
                  </div>
                </div>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-4">
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
        </div>
      )}
    </div>
  );
}
