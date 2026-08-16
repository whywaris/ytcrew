import { Badge } from "@/components/ui/badge";

export interface ToolHeaderProps {
  title: string;
  description: string;
  badgeText?: string;
}

export function ToolHeader({
  title,
  description,
  badgeText,
}: ToolHeaderProps) {
  return (
    <div className="space-y-3 text-center max-w-3xl mx-auto pb-6">
      {badgeText && (
        <div className="flex items-center justify-center">
          <Badge variant="accent">
            {badgeText}
          </Badge>
        </div>
      )}
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
