import ActualPage from "./_components/actualPage";
import { createDbClient } from "@repo/db";

export default async function Component() {
  const db = await createDbClient(
    process.env.TURSO_DB_URL! as string,
    process.env.TURSO_DB_TOKEN! as string
  );

  const problems = await db.query.problem_space.findMany();
  console.log(problems);

  return (
    <>
      <ActualPage />
    </>
  );
}
