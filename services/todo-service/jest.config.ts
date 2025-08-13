import type { Config } from "jest";

const config: Config = {
	preset: "ts-jest",
	testEnvironment: "node",
	roots: ["<rootDir>/src", "<rootDir>/test"],
	testMatch: ["**/*.spec.ts", "**/*.e2e-spec.ts"],
	reporters: [
		"default",
		[
			"jest-junit",
			{
				outputDirectory: "<rootDir>/reports/junit",
				outputName: "junit.xml",
			},
		],
		[
			"jest-html-reporters",
			{
				publicPath: "<rootDir>/reports/html",
				filename: "index.html",
				expand: true,
			},
		],
	],
	collectCoverage: true,
	coverageDirectory: "<rootDir>/reports/coverage",
	coverageReporters: ["text", "lcov", "html"],
	transform: {
		"^.+\\.ts$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.json" }],
	},
	moduleFileExtensions: ["ts", "js", "json"],
};

export default config;
