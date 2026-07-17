import { memo } from 'react';

const HeaderComponent = memo(() => {
  return (
    <div className="mb-12 flex flex-col items-center text-center">
      <div className="mb-4 transform hover:scale-105 transition-transform duration-200">
        <h1 className="text-4xl font-extrabold mb-2 flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          <span role="img" aria-label="globe" className="text-4xl text-blue-200 animate-pulse">
            🌐
          </span>
          String Catalog Translator
        </h1>
      </div>
      <p className="text-gray-600 max-w-2xl text-lg leading-relaxed">
        Review Apple <span className="font-mono text-blue-600">.xcstrings</span> catalogs,
        preserve their structure, and export production-ready translations.
      </p>
      <div className="mt-6 flex items-center gap-3 bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg shadow-sm">
        <div className="bg-white p-2 rounded-full shadow-sm">
          <span role="img" aria-label="ai" className="text-2xl">
            🤖
          </span>
        </div>
        <p className="text-gray-700">
          Local-first manual editing with optional <span className="font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">AI</span> assistance
        </p>
      </div>
    </div>
  );
});

export const Header = memo(HeaderComponent);
