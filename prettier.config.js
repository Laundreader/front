//  @ts-check

/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
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

	plugins: ["prettier-plugin-tailwindcss"],
	tailwindStylesheet: "./src/styles.css",
	tailwindFunctions: ["clsx"],
};

export default config;
