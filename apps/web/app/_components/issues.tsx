import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@radix-ui/react-collapsible";
import { problem_space_cluster } from "@repo/db/schema";
import { ChevronDownIcon, Bug } from "lucide-react";

type ProblemSpaceCluster = typeof problem_space_cluster.$inferSelect;
type ProblemCount = {
  cluster_id: number; // Changed from string to number
  count: number;
};

// Recursive component to render sub-issues and set the selected issue
const SubIssueComponent = ({
  title,
  subIssues,
  setSelectedIssue,
  problem_space_clusters,
  problem_counts,
}: {
  title: string;
  subIssues?: Record<string, any>;
  setSelectedIssue: (issueTitle: string) => void;
  problem_space_clusters: ProblemSpaceCluster[];
  problem_counts: ProblemCount[];
}) => {
  const hasSubIssues = subIssues && Object.keys(subIssues).length > 0;

  return (
    <Collapsible>
      <CollapsibleTrigger
        className="flex items-center justify-between w-full text-custom-light-green"
        onClick={() => setSelectedIssue(title)} // Set the issue title on click
      >
        <span className="flex items-center">
          <Bug size={10} className="text-custom-light-green mr-2" />
          <span>{title}</span>
          <span className="text-custom-light-green ml-2">
            {
              problem_counts.find(
                (count) =>
                  count.cluster_id ===
                  problem_space_clusters.find(
                    (cluster) => cluster.cluster_label === title
                  )?.id
              )?.count
            }
            {" - "}
            problems
          </span>
        </span>

        {hasSubIssues ? (
          <ChevronDownIcon className="h-4 w-4 text-custom-light-green" />
        ) : null}
      </CollapsibleTrigger>
      {hasSubIssues && (
        <CollapsibleContent className="ml-4">
          {Object.entries(subIssues).map(([subIssueTitle, subIssueContent]) => (
            <SubIssueComponent
              key={subIssueTitle}
              title={subIssueTitle}
              subIssues={subIssueContent}
              setSelectedIssue={setSelectedIssue} // Pass the setter function down
              problem_space_clusters={problem_space_clusters}
              problem_counts={problem_counts}
            />
          ))}
        </CollapsibleContent>
      )}
    </Collapsible>
  );
};

// Main component
export default function IssuesComponent({
  issueTitle,
  subIssues,
  setSelectedIssue,
  problem_space_clusters,
  problem_counts,
}: {
  issueTitle: string;
  subIssues: Record<string, any>;
  setSelectedIssue: (issueTitle: string) => void;
  problem_space_clusters: ProblemSpaceCluster[];
  problem_counts: ProblemCount[];
}) {
  return (
    <div>
      <Collapsible className="w-full">
        <CollapsibleTrigger
          className="flex items-center justify-between font-semibold w-full text-custom-light-green"
          onClick={() => setSelectedIssue(issueTitle)} // Set the main issue title
        >
          <span className="flex items-center">
            <Bug size={15} className="text-custom-green mr-2" />
            <span>{issueTitle}</span>
            <span className="text-custom-light-green ml-2">
              {
                problem_counts.find(
                  (count) =>
                    count.cluster_id ===
                    problem_space_clusters.find(
                      (cluster) => cluster.cluster_label === issueTitle
                    )?.id
                )?.count
              }
              {" - "}
              problems
            </span>
          </span>
          <ChevronDownIcon className="h-4 w-4 text-custom-light-green" />
        </CollapsibleTrigger>
        <CollapsibleContent className="ml-4 space-y-2">
          {Object.entries(subIssues).map(([subIssueTitle, subIssueContent]) => (
            <SubIssueComponent
              key={subIssueTitle}
              title={subIssueTitle}
              subIssues={subIssueContent}
              setSelectedIssue={setSelectedIssue} // Pass the setter function down
              problem_space_clusters={problem_space_clusters}
              problem_counts={problem_counts}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
