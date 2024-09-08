"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useChat } from "ai/react";
import { CornerDownLeft, LeafIcon, User } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useRef } from "react";
import Textarea from "react-textarea-autosize";
import { useEnterSubmit } from "./useEnterSubmit";
export const dynamic = "force-dynamic";

const exampleMessages = [
  {
    heading: "What was the most common issue with nextjs?",
    message: `What was the most common issue with nextjs?`,
  },
  {
    heading: "Tell me about the major issues people are having",
    message: "Tell me about the major issues people are having",
  },
  {
    heading: "How frequently ",
    subheading: "is this happening",
    message: `How frequently is this happening`,
  },
  {
    heading: "Suggest solutions",
    subheading: "For top 3 issues, propose fixes",
    message: "For the top 3 most reported issues, can you suggest potential solutions or workarounds?",
  },
];

export default function FancyTextArea() {
  const params = useParams<{ meetId: string }>();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { formRef, onKeyDown } = useEnterSubmit();
  const router = useRouter();
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setInput,
    setMessages,
    error,
  } = useChat({
    api: "/api/chat",
  });

  return (
    <div className="stretch mx-auto flex w-full flex-col items-center py-24 text-custom-light-green">
      <div className="w-full px-4 lg:w-[60ch]">
        {messages.map((m, i) => (
          <div key={m.id}>
            <div className="flex flex-row whitespace-pre-wrap py-4">
              <div
                className={cn(
                  "flex size-8 shrink-0 select-none items-center justify-center rounded-md border shadow",
                  "bg-custom-light-green"
                )}
              >
                {m.role === "user" ? <User className="text-black" /> : <LeafIcon className="text-black" />}
              </div>
              <div className="ml-4">{m.content}</div>
            </div>
            {i < messages.length - 1 && <Separator className="my-4" />}
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 w-full lg:w-3/12">
        <div className="mb-4 grid grid-cols-2 gap-2 px-4 sm:px-0">
          {messages.length === 0 &&
            exampleMessages.map((example, index) => (
              <form key={example.heading} onSubmit={handleSubmit}>
                <button
                  key={example.heading}
                  type="submit"
                  className={`h-full w-full cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 ${
                    index > 1 && "hidden md:block"
                  }`}
                  onClick={() => setInput(example.message)}
                >
                  <div className="text-sm font-semibold">{example.heading}</div>
                  <div className="text-sm text-zinc-600">
                    {example.subheading}
                  </div>
                </button>
              </form>
            ))}
        </div>

        <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12">
              <Textarea
                ref={inputRef}
                tabIndex={0}
                onKeyDown={onKeyDown}
                placeholder="Send a message."
                className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
                autoFocus
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                name="message"
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <div className="absolute right-0 top-[13px] sm:right-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="submit" size="icon" className="bg-custom-light-green text-primary-foreground hover:bg-custom-mid-green/90">
                      <CornerDownLeft />
                      <span className="sr-only">Send message</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Send message</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
