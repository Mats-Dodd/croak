"use client"; // client for now, ill do server magic later
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BotMessageSquare, Bug, Github } from "lucide-react";
import { useState } from "react";
import FancyTextArea from "./fancyTextArea";
import Header from "./header";
import IssuesComponent from "./issues";
import { problem_space_cluster } from "@repo/db/schema";
import PlotGraph from "./PlotGraph";

export type SubtaskMap = {
  [key: string]: SubtaskMap;
};

type ProblemSpaceCluster = typeof problem_space_cluster.$inferSelect;
type ProblemCount = {
  cluster_id: number; // Changed from string to number
  count: number;
};

export default function ActualPage({
  problem_space_clusters,
  problem_counts,
}: {
  problem_space_clusters: ProblemSpaceCluster[];
  problem_counts: ProblemCount[];
}) {
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  const buildIssueTree = (
    clusters: ProblemSpaceCluster[]
  ): Record<string, SubtaskMap> => {
    const issueTree: Record<string, SubtaskMap> = {};
    const clusterMap: Record<number, ProblemSpaceCluster> = {};

    // First, create a map of all clusters
    clusters.forEach((cluster) => {
      clusterMap[cluster.id] = cluster;
    });

    // Then, build the tree structure
    clusters.forEach((cluster) => {
      if (cluster.parent_problem_space_cluster_id === null) {
        // This is a root-level cluster
        issueTree[cluster.cluster_label] = {};
      } else {
        // This is a child cluster
        let currentLevel = issueTree;
        let parent = clusterMap[cluster.parent_problem_space_cluster_id];
        const path = [];

        // Traverse up the tree to find the correct place for this cluster
        while (parent) {
          path.unshift(parent.cluster_label);
          parent =
            parent.parent_problem_space_cluster_id !== null
              ? (clusterMap[parent.parent_problem_space_cluster_id] ??
                undefined)
              : undefined;
        }

        // Create the path in the tree
        path.forEach((label) => {
          if (!currentLevel[label]) {
            currentLevel[label] = {};
          }
          currentLevel = currentLevel[label];
        });

        // Add the current cluster to its parent
        currentLevel[cluster.cluster_label] = {};
      }
    });

    return issueTree;
  };

  const issues = buildIssueTree(problem_space_clusters);

  return (
    <>
      <Header />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 h-screen max-h-screen p-4 text-custom-light-green">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-custom-light-green">
                <Bug className="h-5 w-5 text-custom-green" />
                <span>The Croaks</span>
              </CardTitle>
              <div className="flex items-center gap-2">
                <ToggleGroup type="single" defaultValue="Discord">
                  <ToggleGroupItem value="Discord" aria-label="Toggle bold">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="h-5 w-5 text-custom-light-green"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                      />
                    </svg>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="Github" aria-label="Toggle italic">
                    <Github className="h-5 w-5 text-custom-light-green" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(issues).map(([issueTitle, subIssues]) => (
              <IssuesComponent
                key={issueTitle}
                issueTitle={issueTitle}
                subIssues={subIssues}
                setSelectedIssue={setSelectedIssue}
                problem_space_clusters={problem_space_clusters}
                problem_counts={problem_counts}
              />
            ))}
          </CardContent>
          <PlotGraph />
        </Card>
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-custom-light-green">
              <BotMessageSquare className="h-5 w-5 text-custom-green" />
              <span>
                Chat with issue{selectedIssue && <span>: {selectedIssue}</span>}
              </span>
            </CardTitle>
          </CardHeader>
          <FancyTextArea issue={selectedIssue} />
        </Card>
      </div>
    </>
  );
}
