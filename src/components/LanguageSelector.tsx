interface LanguageSelectorProps {
  selectedLanguage: string;
  availableLanguages: string[];
  sourceLanguage: string;
  onLanguageChange: (language: string) => void;
}

export const LanguageSelector = ({ selectedLanguage, availableLanguages, sourceLanguage, onLanguageChange }: LanguageSelectorProps) => {
  return (
    <div className="sticky top-0 pt-4">
      <h3 className="text-xs font-medium text-gray-700 mb-2">Target Language</h3>
      <div className="flex flex-col gap-1">
        {availableLanguages.map((lang) => (
          <button
            key={lang}
            onClick={() => onLanguageChange(lang)}
            className={`text-left px-3 py-2 text-sm rounded-md transition-colors
              ${selectedLanguage === lang ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-100"}`}>
            {lang === sourceLanguage ? `${lang} (source)` : lang}
          </button>
        ))}
      </div>
    </div>
  );
};
