import env from "@/env";
import { and, createDbClient, eq } from "@repo/db";
import {
  github_issue_source,
  problem_space_cluster,
  problem,
} from "@repo/db/schema";
import { z } from "zod";
import Papa from "papaparse";
import fs from "fs";
import ora from "ora";

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
  const spinner = ora("Uploading clusters").start();

  try {
    const db = await createDbClient(env.TURSO_DB_URL, env.TURSO_DB_TOKEN);

    spinner.text = "Deleting existing data";
    await db.delete(problem_space_cluster);
    await db.delete(github_issue_source);
    await db.delete(problem);

    const csvFile = fs.readFileSync("./input/input.csv", "utf8");

    const clusters = new Map();
    const subclusters = new Map();

    spinner.text = "Processing problem space clusters";
    // First Papa.parse: Get unique problem space clusters
    await new Promise<void>((resolve, reject) => {
      Papa.parse<CsvRow>(csvFile, {
        header: true,
        complete: async (results) => {
          try {
            const validatedData = results.data
              .map((row) => CsvRowSchema.safeParse(row))
              .filter(
                (result): result is z.SafeParseSuccess<CsvRow> => result.success
              )
              .map((result) => result.data);

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
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        error: (error: any) => reject(error),
      });
    });

    spinner.text = "Fetching processed clusters";
    const res_clusters = await db
      .select({
        problem_space_cluster_id: problem_space_cluster.id,
        cluster: problem_space_cluster.cluster,
        cluster_label: problem_space_cluster.cluster_label,
      })
      .from(problem_space_cluster);

    spinner.text = "Processing subclusters and adding problems";
    // Process subclusters and add problems to the database
    for (const {
      problem_space_cluster_id,
      cluster,
      cluster_label,
    } of res_clusters) {
      // Parse CSV file to find matching rows
      await new Promise<void>((resolve, reject) => {
        Papa.parse<CsvRow>(csvFile, {
          header: true,
          complete: async (results) => {
            try {
              const matchingRows = results.data
                .filter((row) => {
                  const parsedRow = CsvRowSchema.safeParse(row);
                  if (!parsedRow.success) {
                    console.log("Skipping row:", row);
                    return false;
                  }
                  return (
                    parsedRow.success &&
                    parsedRow.data.subcluster === cluster.toString() &&
                    parsedRow.data.subcluster_label === cluster_label
                  );
                })
                .map((row) => CsvRowSchema.parse(row));

              for (const row of matchingRows) {
                // Insert GitHub issue
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

                // Insert problem
                await db.insert(problem).values({
                  problem_space_cluster_id,
                  source_type: "github",
                  source_id: githubIssue.issue_id,
                  process_text: `${row.title}\n\n${row.body}`,
                });
              }
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          error: (error: any) => reject(error),
        });
      });
    }

    spinner.succeed("Subclusters uploaded successfully");
  } catch (error) {
    spinner.fail(`Error uploading subclusters: ${error}`);
    throw error;
  }
}
