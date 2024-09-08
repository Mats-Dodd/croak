import { envObjects } from "./definitions";
import { writeFileSync } from "fs";
import { join } from "path";
import ora from "ora";

import { readFileSync, existsSync } from "fs";

const headerComment = `
# Info: 

####################################
#
# Environment variables for the CLI are weird, you don't need to add all the environment variables here, just the ones necessary for the scripts you want to run.
# When you run a script, it will tell you which environment variables are missing.
#
# If you want to add a new environment variable, you need to add it to the env.ts file. (This file gets regenerated when you run the CLI so don't edit this file directly)
#
# Read more in the README.md file.
#
####################################
\n\n
`;

const generateEnvExample = () => {
  const example = envObjects.map(
    (envObject) => `# ${envObject.instructions}\n${envObject.env_name}=`
  );
  const exampleContent = example.join("\n\n");
  const filePath = join(__dirname, "../.env.example");

  const newContent = headerComment + exampleContent;

  if (existsSync(filePath)) {
    const currentContent = readFileSync(filePath, "utf-8");
    if (currentContent !== newContent) {
      writeFileSync(filePath, newContent);
      const spinner = ora("Updating .env.example").start();
      spinner.succeed("Updated .env.example");
      console.log("");
    }
  } else {
    writeFileSync(filePath, newContent);
    const spinner = ora("Creating .env.example").start();
    spinner.succeed("Created .env.example");
    console.log("");
  }
};

generateEnvExample();
