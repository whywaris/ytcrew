import { ToolHowToStep } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface ToolHowToProps {
  steps: ToolHowToStep[];
  toolName: string;
}

export function ToolHowTo({ steps, toolName }: ToolHowToProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <section className="my-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          How to Use the {toolName}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Follow these simple steps to get started in seconds
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step) => (
          <Card key={step.stepNumber} className="relative overflow-hidden bg-card/60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary font-bold text-sm">
                  {step.stepNumber}
                </span>
                <CardTitle className="text-base">{step.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
