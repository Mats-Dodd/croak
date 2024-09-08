"use client"; // client for now, ill do server magic later
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import IssuesComponent from "./_components/issues";
import { useState } from "react";
import MessageComponent from "./_components/message";
import { Github, BotMessageSquare, Bug } from "lucide-react";
import Header from "./_components/header";

export type SubtaskMap = {
  [key: string]: SubtaskMap;
}

export default function Component() {
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  const issues: Record<string, SubtaskMap> = {
    "Main Issues": {
      "Subtask 1": {
        "Subtask 1.1": {
          "Subtask 1.1.1": {},
          "Subtask 1.1.2": {},
        },
        "Subtask 1.2": {},
      },
      "Subtask 2": {},
      "Subtask 3": {
        "Subtask 3.1": {},
      },
    },
    "Main Issues 2": {
      "Subtask 1": {
        "Subtask 1.1": {
          "Subtask 1.1.1": {},
          "Subtask 1.1.2": {},
        },
        "Subtask 1.2": {},
      },
    }
  };

  return (
    <>
      <Header />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 h-screen p-4 text-custom-light-green">
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
          { Object.entries(issues).map(([issueTitle, subIssues]) => (
            <IssuesComponent
              key={issueTitle}
              issueTitle={issueTitle}
              subIssues={subIssues}
              setSelectedIssue={setSelectedIssue}
            />
          ))}
        </CardContent>
      </Card>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-custom-light-green">
            <BotMessageSquare className="h-5 w-5 text-custom-green" />
            <span>Chat with issue</span>
          </CardTitle>
          <CardDescription>
            {selectedIssue && <span>{selectedIssue}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 h-full overflow-auto">
          <MessageComponent
            avatarSrc="/placeholder-user.jpg"
            avatarFallback="AI"
            name="AI Assistant"
            message="I'm here to help with your issue. How can I assist you today?"
          />
          <MessageComponent
            avatarSrc="/placeholder-user.jpg"
            avatarFallback="User"
            name="You"
            message="I'm having trouble with the latest feature release. Can you help me troubleshoot?"
          />
          <MessageComponent
            avatarSrc="/placeholder-user.jpg"
            avatarFallback="AI"
            name="AI Assistant"
            message="Sure, let's take a look. Can you provide more details about the issue you're experiencing?"
          />
        </CardContent>
        <div className="sticky bottom-0 w-full bg-background px-4 py-2">
          <Input
            type="text"
            placeholder="Type your message..."
            className="w-full"
          />
        </div>
      </Card>
    </div>
    </>
  );
}
