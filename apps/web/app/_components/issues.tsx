import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@radix-ui/react-collapsible";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";

// Recursive component to render sub-issues and set the selected issue
const SubIssueComponent = ({
  title,
  subIssues,
  setSelectedIssue,
}: {
  title: string;
  subIssues?: Record<string, any>;
  setSelectedIssue: (issueTitle: string) => void;
}) => {
  const hasSubIssues = subIssues && Object.keys(subIssues).length > 0;

  return (
    <Collapsible>
      <CollapsibleTrigger
        className="flex items-center justify-between w-full"
        onClick={() => setSelectedIssue(title)} // Set the issue title on click
      >
        <span>{title}</span>
        {hasSubIssues ? <ChevronDownIcon className="h-4 w-4" /> : null}
      </CollapsibleTrigger>
      {hasSubIssues && (
        <CollapsibleContent className="ml-4">
          {Object.entries(subIssues).map(([subIssueTitle, subIssueContent]) => (
            <SubIssueComponent
              key={subIssueTitle}
              title={subIssueTitle}
              subIssues={subIssueContent}
              setSelectedIssue={setSelectedIssue} // Pass the setter function down
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
}: {
  issueTitle: string;
  subIssues: Record<string, any>;
  setSelectedIssue: (issueTitle: string) => void;
}) {
  return (
    <div>
      <Collapsible className="w-full">
        <CollapsibleTrigger
          className="flex items-center justify-between w-full"
          onClick={() => setSelectedIssue(issueTitle)} // Set the main issue title
        >
          <span>{issueTitle}</span>
          <ChevronDownIcon className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="ml-4 space-y-2">
          {Object.entries(subIssues).map(([subIssueTitle, subIssueContent]) => (
            <SubIssueComponent
              key={subIssueTitle}
              title={subIssueTitle}
              subIssues={subIssueContent}
              setSelectedIssue={setSelectedIssue} // Pass the setter function down
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
