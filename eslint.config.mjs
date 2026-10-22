import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Fetch-on-mount via useEffect adalah pola standar app ini;
      // rule baru Next 16 terlalu agresif untuk kasus fetch API.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]);

export default eslintConfig;
