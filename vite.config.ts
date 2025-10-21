/// <reference types="vitest/config" />

// https://vitejs.dev/config/
import fs from "fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import svgr from "vite-plugin-svgr";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import viteReact from "@vitejs/plugin-react";

const dirname =
	typeof __dirname !== "undefined"
		? __dirname
		: path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig(({ mode }) => {
	return {
		server:
			mode === "development"
				? {
						https: {
							key: fs.readFileSync(path.resolve(__dirname, "./cert/key.pem")),
							cert: fs.readFileSync(path.resolve(__dirname, "./cert/cert.pem")),
						},
					}
				: {},
		plugins: [
			tanstackRouter({
				autoCodeSplitting: true,
			}),
			viteReact(),
			tailwindcss(),
			svgr(),
		],
		test: {
			globals: true,
			environment: "jsdom",
			projects: [
				{
					extends: true,
					plugins: [
						// The plugin will run tests for the stories defined in your Storybook config
						// See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
						storybookTest({
							configDir: path.join(dirname, ".storybook"),
						}),
					],
					test: {
						name: "storybook",
						browser: {
							enabled: true,
							headless: true,
							provider: "playwright",
							instances: [
								{
									browser: "chromium",
								},
							],
						},
						setupFiles: [".storybook/vitest.setup.ts"],
					},
				},
			],
		},
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
	};
});
