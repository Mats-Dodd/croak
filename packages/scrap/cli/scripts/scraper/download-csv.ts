import { env } from "@/env";
import { createDbClient } from "@repo/db";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { unparse } from "papaparse";
import ora from "ora";

export async function downloadCsv() {
  const db = createDbClient(env.TURSO_DB_URL, env.TURSO_DB_TOKEN);
  const spinner = ora("Fetching data...").start();
  const batchSize = 1000;
  let offset = 0;
  let allData: { problem: string }[] = [];

  try {
    while (true) {
      const result = await db.run(sql`
        SELECT 
          dc.name || ': ' || dm.content AS problem
        FROM 
          discord_channel dc
        JOIN 
          (SELECT 
            channel_id, 
            MIN(message_sent_at) AS first_message_time
          FROM 
            discord_message
          GROUP BY 
            channel_id) first_message
        ON 
          dc.id = first_message.channel_id
        JOIN 
          discord_message dm
        ON 
          first_message.channel_id = dm.channel_id
        AND 
          first_message.first_message_time = dm.message_sent_at
        WHERE 
          dc.name IS NOT NULL AND dc.name != ''
        LIMIT ${batchSize}
        OFFSET ${offset};
      `);

      if (result.rows.length === 0) break;

      const mappedRows = result.rows.map((row) => ({
        problem: row.problem as string,
      }));
      allData = allData.concat(mappedRows);
      offset += batchSize;
      spinner.text = `Fetched ${allData.length} records...`;
    }

    spinner.succeed(
      `Data fetched successfully. Total records: ${allData.length}`
    );

    const csvContent = unparse(allData, {
      header: true,
      columns: ["problem"],
    });

    const outputDir = path.join(process.cwd(), "output");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const fileName = `thread_first_messages_${Date.now()}.csv`;
    const filePath = path.join(outputDir, fileName);

    fs.writeFileSync(filePath, csvContent);

    console.log(`CSV file saved: ${filePath}`);
  } catch (error) {
    spinner.fail("Error fetching data");
    console.error("Error details:", error);
    throw error;
  }
}
