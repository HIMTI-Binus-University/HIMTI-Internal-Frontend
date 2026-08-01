import { useId, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { ResourceMarkdown } from "@/components/resource-markdown";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExpandableMarkdownProps {
  children: string;
  className?: string;
}

export const ExpandableMarkdown = ({
  children,
  className,
}: ExpandableMarkdownProps) => {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const expandable = children.length > 240 || children.split("\n").length > 3;

  return (
    <div>
      <div id={id}>
        <ResourceMarkdown
          className={cn(expandable && !expanded && "line-clamp-3", className)}
        >
          {children}
        </ResourceMarkdown>
      </div>
      {expandable && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-1 h-8 px-2"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? <ChevronUp /> : <ChevronDown />}
          {expanded ? "Show less" : "Show more"}
        </Button>
      )}
    </div>
  );
};
