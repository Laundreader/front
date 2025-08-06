//  @ts-check

/** @type {import('prettier').Config} */
const config = {
	printWidth: 80,
	useTabs: true,
	tabWidth: 2,
	singleQuote: false,
	quoteProps: "as-needed",
	trailingComma: "all",
	arrowParens: "always",
	bracketSpacing: true,
	semi: true,
	endOfLine: "lf",

	htmlWhitespaceSensitivity: "css",
	bracketSameLine: false,
	singleAttributePerLine: false,
	jsxSingleQuote: false,
	proseWrap: "preserve",
	embeddedLanguageFormatting: "auto",
};

export default config;
