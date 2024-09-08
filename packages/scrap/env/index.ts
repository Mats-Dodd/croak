import Bun from "bun";

import { envObjects } from "./definitions";
import type { EnvVarNames, EnvType } from "./definitions";
import chalk from "chalk";

export const env: EnvType = new Proxy({} as EnvType, {
  get: (_, key: EnvVarNames) => {
    const option = envObjects.find((opt) => opt.env_name === key);
    if (option) {
      const envValue = Bun.env[key];

      console.log(
        `Script Requesting: ${chalk.bold(key)}: ${chalk.green(envValue)}`
      );

      if (envValue === undefined || envValue === "") {
        console.log(
          `Environment variable ${chalk.red(key)} not found. Follow These Instructions: ${chalk.yellow(option.instructions)}`
        );
        process.exit(0);
      }

      if (envValue === "null" || envValue === "undefined") {
        console.log(
          `Environment variable ${chalk.red(key)} is set to "null" or "undefined". These are not valid values for this environment variable.`
        );
        process.exit(0);
      }

      const parsed = option.schema.safeParse(envValue);
      if (!parsed.success) {
        console.log(
          `Schema mismatch for ${chalk.red(key)}: expected format does not match the provided value.`
        );
        process.exit(0);
      }

      return parsed.data;
    }

    console.log(
      `Environment variable ${chalk.red(key)} not found in the ${chalk.red(
        "./packages/scripts-cli/env/definitions.ts"
      )} file. ${chalk.yellow(
        "Please read the README.md file to learn how to add a new environment variable."
      )}`
    );
    process.exit(0);
  },
});

export default env;
