interface LanguageSelectorProps {
  selectedLanguage: string;
  availableLanguages: string[];
  sourceLanguage: string;
  onLanguageChange: (language: string) => void;
}

export const LanguageSelector = ({ selectedLanguage, availableLanguages, sourceLanguage, onLanguageChange }: LanguageSelectorProps) => {
  return (
    <div className="sticky top-0 pt-4">
      <h3 className="text-sm font-semibold bg-white rounded-lg border border-gray-200 text-gray-900 text-center mb-3 p-2">Target Language</h3>
      <div className="flex flex-col gap-1.5 bg-white rounded-lg border border-gray-200 p-2 shadow-sm">
        {availableLanguages.map((lang) => (
          <button
            key={lang}
            onClick={() => onLanguageChange(lang)}
            className={`text-left px-3 py-2 text-sm rounded-md transition-all duration-200 
              ${
                selectedLanguage === lang
                  ? "bg-blue-50 text-black-900 font-semibold ring-1 ring-blue-700/10 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}>
            {lang === sourceLanguage ? (
              <div className="flex flex-col">
                <span>{lang}</span>
                <span className="text-xs text-blue-400 font-light">source</span>
              </div>
            ) : (
              lang
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
