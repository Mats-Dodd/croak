import { problem, problem_space_cluster } from "@repo/db/schema";
import ActualPage from "./_components/actualPage";
import { createDbClient, count, eq } from "@repo/db";

export default async function Component() {
  const db = await createDbClient(
    process.env.TURSO_DB_URL! as string,
    process.env.TURSO_DB_TOKEN! as string
  );

  const problem_space_clusters = await db.select().from(problem_space_cluster);

  const problem_counts = await db
    .select({
      cluster_id: problem_space_cluster.id,
      count: count(problem.id),
    })
    .from(problem_space_cluster)
    .leftJoin(
      problem,
      eq(problem.problem_space_cluster_id, problem_space_cluster.id)
    )
    .groupBy(problem_space_cluster.id);
  console.log(problem_counts);

  return (
    <>
      <ActualPage
        problem_space_clusters={problem_space_clusters}
        problem_counts={problem_counts}
      />
    </>
  );
}
