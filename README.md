# Apple Platform Strings Translation Tool

A specialized tool for translating Localizable.xcstrings files using AI. This tool streamlines the localization process by providing context-aware translations while maintaining the structure and formatting of your Apple platform string files.

## About .xcstrings

The .xcstrings format is Apple's modern localization resource format used in Xcode for macOS, iOS, watchOS, and tvOS applications. It uses a structured JSON format that efficiently manages string variations, pluralization rules, and provides valuable context for translators. This format is designed to handle complex localization scenarios while maintaining a clean, organized structure that's both human-readable and machine-processable.

## Live Demo

Try the tool now at [https://xcstrings-translator-react.pages.dev/](https://xcstrings-translator-react.pages.dev/)

## Features

- 🔄 Direct support for Localizable.xcstrings files
- 🤖 AI-powered translations via OpenRouter
- 🌍 Support for multiple target languages
- 📝 Preserves string contexts and comments
- 🎯 Maintains string formatting and placeholders
- 💾 Export translations back to xcstrings format

## Getting Started

1. Clone and install dependencies:
```bash
git clone https://github.com/okturan/xcstrings-translator-react.git
cd xcstrings-translator-react
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Set up your OpenRouter API key:
   - Visit [OpenRouter](https://openrouter.ai/keys) to get your API key
   - When you launch the app, you'll see an API key input section at the top
   - Enter your key - it will be securely stored in your browser

## Usage

1. Load your Localizable.xcstrings file using the file picker
2. Select your target language
3. Use the AI translation feature to generate translations
4. Review and edit translations as needed
5. Export the updated strings file

The tool maintains all metadata, comments, and formatting from your original xcstrings file while adding the new translations.

## Development

Built with:
- React + TypeScript for robust frontend development
- Vite for lightning-fast builds
- Tailwind CSS for styling
- OpenRouter API (Claude) for AI translations

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
