import { select } from "@inquirer/prompts";
import scripts from "./definitions";
import type { Selection } from "./definitions";
import chalk from "chalk";

displayOptions();

async function displayOptions(
  options: Selection[] = scripts,
  parentOptions: Selection[] | undefined = undefined,
  currentPath: string[] = [""]
) {
  printCurrentPath(currentPath);

  options = addGoBackOptionIfNeeded(options, parentOptions);

  const choiceIndex = await getUserChoice(options);

  await handleChoice(choiceIndex, options, parentOptions, currentPath);
}

function printCurrentPath(currentPath: string[]) {
  console.log("");
  if (currentPath.length > 1) {
    console.log(`📁 ${chalk.blue(`${currentPath.slice(1).join(" ➔  ")}`)}`);
  }
}

function addGoBackOptionIfNeeded(
  options: Selection[],
  parentOptions: Selection[] | undefined
): Selection[] {
  if (parentOptions && !options.some((option) => option.name === "← Go Back")) {
    return [
      ...options,
      {
        name: "← Go Back",
        description: "Return to the previous menu",
        onSelect: [],
      },
    ];
  }
  return options;
}

async function getUserChoice(options: Selection[]): Promise<number> {
  const choices = options.map((option, index) => {
    const isFolder = Array.isArray(option.onSelect);
    const icon = isFolder && option.name !== "← Go Back" ? "📁 " : "";
    return {
      name: `${icon}${option.name}`,
      value: index,
    };
  });

  const answer = await select({
    message: "Select an action:",
    choices: choices,
  });

  return answer;
}

async function handleChoice(
  choiceIndex: number,
  options: Selection[],
  parentOptions: Selection[] | undefined,
  currentPath: string[]
) {
  if (options[choiceIndex].name === "← Go Back") {
    currentPath.pop();
    await displayOptions(parentOptions, undefined, currentPath);
    return;
  }

  const selectedScript = options[choiceIndex];
  if (selectedScript) {
    await executeSelection(selectedScript, options, parentOptions, currentPath);
  } else {
    console.error("Action not found");
  }
}

async function executeSelection(
  selectedScript: Selection,
  options: Selection[],
  parentOptions: Selection[] | undefined,
  currentPath: string[]
) {
  if (typeof selectedScript.onSelect === "function") {
    try {
      await selectedScript.onSelect();
    } catch (error) {
      console.log("");
      console.log("----------------------------------------------");
      console.error(error);
      console.log("----------------------------------------------");
    }
    await displayOptions(options, parentOptions, currentPath);
  } else if (Array.isArray(selectedScript.onSelect)) {
    currentPath.push(selectedScript.name);
    await displayOptions(selectedScript.onSelect, options, currentPath);
  } else {
    console.error("Invalid onSelect type");
  }
}
