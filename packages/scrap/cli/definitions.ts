import { downloadCsv } from "./scripts/scraper/download-csv";
import { generateFakeData } from "./scripts/scraper/generate-fake-folders";
import { threadIdScraper } from "./scripts/scraper/thread-id-scraper";
import { threadMessageScraper } from "./scripts/scraper/thread-message-scraper";

export type Selection = {
  name: string;
  description: string;
  onSelect: (() => Promise<void>) | Selection[];
};

// Add custom actions here. Read the README for more information.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const scripts: Selection[] = [
  {
    name: "Thread Id Scraper",
    description: "Scraper for thread ids",
    onSelect: threadIdScraper,
  },
  {
    name: "Thread Message Scraper",
    description: "Scraper for thread messages",
    onSelect: threadMessageScraper,
  },
  {
    name: "Download CSV",
    description: "Download CSV",
    onSelect: downloadCsv,
  },
  {
    name: "Generate Fake Data",
    description: "Generate Fake Data",
    onSelect: generateFakeData,
  },
] as const;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default scripts;
