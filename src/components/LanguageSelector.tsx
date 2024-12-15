interface LanguageSelectorProps {
  selectedLanguage: string;
  availableLanguages: string[];
  sourceLanguage: string;
  onLanguageChange: (language: string) => void;
}

export const LanguageSelector = ({ selectedLanguage, availableLanguages, sourceLanguage, onLanguageChange }: LanguageSelectorProps) => {
  return (
    <div className="mb-4">
      <label htmlFor="language-select" className="block text-xs font-medium text-gray-700 mb-1">
        Select Target Language
      </label>
      <select
        id="language-select"
        value={selectedLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="block w-full max-w-xs rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500">
        {availableLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {lang === sourceLanguage ? `${lang} (source)` : lang}
          </option>
        ))}
      </select>
    </div>
  );
};
