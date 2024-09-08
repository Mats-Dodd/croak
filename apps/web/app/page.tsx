import { problem_space_cluster } from "@repo/db/schema";
import ActualPage from "./_components/actualPage";
import { createDbClient } from "@repo/db";

export default async function Component() {
  const db = await createDbClient(
    process.env.TURSO_DB_URL! as string,
    process.env.TURSO_DB_TOKEN! as string
  );

  const problem_space_clusters = await db.select().from(problem_space_cluster);
  console.log(problem_space_clusters);

  return (
    <>
      <ActualPage problem_space_clusters={problem_space_clusters} />
    </>
  );
}
