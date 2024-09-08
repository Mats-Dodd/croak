import env from "@/env";
import { createDbClient } from "@repo/db";
import {
  github_issue_source,
  problem_space_cluster,
  problem,
} from "@repo/db/schema";
import { z } from "zod";
import Papa from "papaparse";
import fs from "fs";

const CsvRowSchema = z
  .object({
    cluster: z.string(),
    cluster_label: z.string(),
    subcluster: z.string(),
    subcluster_label: z.string(),
    number: z.string(),
    title: z.string(),
    body: z.string(),
  })
  .passthrough();

type CsvRow = z.infer<typeof CsvRowSchema>;

export async function uploadClusters() {
  const db = await createDbClient(env.TURSO_DB_URL, env.TURSO_DB_TOKEN);

  await db.delete(problem_space_cluster);
  await db.delete(github_issue_source);
  await db.delete(problem);

  const csvFile = fs.readFileSync("./input/input.csv", "utf8");

  const firstRow = Papa.parse<CsvRow>(csvFile, {
    header: true,
    preview: 1,
  }).data[0];

  console.log("First row:", firstRow);

  Papa.parse<CsvRow>(csvFile, {
    header: true,
    complete: async (results) => {
      const clusters = new Map();
      const subclusters = new Map();

      // Validate CSV data
      const validatedData = results.data
        .map((row) => {
          try {
            const parsedRow = CsvRowSchema.safeParse(row);
            if (parsedRow.success) {
              return parsedRow.data;
            } else {
              console.log("Invalid row:", row, "Error:", parsedRow.error);
              return null;
            }
          } catch (error) {
            console.error("Invalid row:", row, "Error:", error);
            return null;
          }
        })
        .filter((row): row is CsvRow => row !== null);

      // First pass: Create problem_space_clusters
      for (const row of validatedData) {
        if (!clusters.has(row.cluster)) {
          const [parentCluster] = await db
            .insert(problem_space_cluster)
            .values({
              cluster: parseInt(row.cluster),
              cluster_label: row.cluster_label,
            })
            .returning();
          clusters.set(row.cluster, parentCluster.id);
        }

        const subclusterKey = `${row.cluster}-${row.subcluster}`;
        if (!subclusters.has(subclusterKey)) {
          const [subCluster] = await db
            .insert(problem_space_cluster)
            .values({
              parent_problem_space_cluster_id: clusters.get(row.cluster),
              cluster: parseInt(row.subcluster),
              cluster_label: row.subcluster_label,
            })
            .returning();
          subclusters.set(subclusterKey, subCluster.id);
        }
      }

      // Second pass: Insert github_issue_sources and problems
      for (const row of validatedData) {
        const [githubIssue] = await db
          .insert(github_issue_source)
          .values({
            issue_id: parseInt(row.number),
            title: row.title,
            body: row.body,
          })
          .onConflictDoNothing()
          .returning();

        if (!githubIssue) {
          console.log("Skipping row:", row);
          continue;
        }

        await db.insert(problem).values({
          problem_space_cluster_id: subclusters.get(
            `${row.cluster}-${row.subcluster}`
          ),
          source_type: "github",
          source_id: githubIssue.issue_id,
          process_text: `${row.title}\n\n${row.body}`,
        });
      }
    },
  });
}
