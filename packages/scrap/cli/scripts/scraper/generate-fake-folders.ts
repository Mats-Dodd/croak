import env from "@/env";
import { createDbClient } from "@repo/db";
import { problem, problem_space, problem_space_cluster } from "@repo/db/schema";

export async function generateFakeData() {
  const db = createDbClient(env.TURSO_DB_URL, env.TURSO_DB_TOKEN);
  // Generate problem spaces
  const problemSpaceIds: number[] = [];
  const totalProblemSpaces = 300;

  for (let i = 0; i < totalProblemSpaces; i++) {
    const result = await db
      .insert(problem_space)
      .values({
        parent_problem_space_id:
          i === 0 ? null : problemSpaceIds[Math.floor(Math.random() * i)],
      })
      .returning({ insertedId: problem_space.id });

    problemSpaceIds.push(result[0].insertedId);
  }

  // Generate problem space clusters
  const problemSpaceClusterIds = [];
  for (let i = 0; i < 30; i++) {
    const result = await db
      .insert(problem_space_cluster)
      .values({
        problem_space_id:
          problemSpaceIds[Math.floor(Math.random() * problemSpaceIds.length)],
        cluster: Math.floor(Math.random() * 5),
        cluster_label: `Cluster ${Math.floor(Math.random() * 5)}`,
      })
      .returning({ insertedId: problem_space_cluster.id });

    problemSpaceClusterIds.push(result[0].insertedId);
  }

  // Generate problems
  for (let i = 0; i < 100; i++) {
    await db.insert(problem).values({
      problem_space_cluster_id:
        problemSpaceClusterIds[
          Math.floor(Math.random() * problemSpaceClusterIds.length)
        ],
      source_type: Math.random() > 0.5 ? "discord" : "github",
      source_id: Math.floor(Math.random() * 1000),
      process_text: `Fake problem ${i + 1}`,
    });
  }

  console.log("Fake data generated successfully!");
}
