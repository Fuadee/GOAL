import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { LEVELS } from "@/lib/running/levels";
import { cn } from "@/lib/utils";

export function LevelProgressCard({ currentLevel }: { currentLevel: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Level Progression</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {LEVELS.map((level) => {
          const active = level.level === currentLevel;
          const completed = level.level < currentLevel;

          return (
            <div
              key={level.level}
              className={cn(
                "rounded-lg border p-4",
                active && "border-slate-900 bg-slate-900 text-white",
                completed && "border-emerald-200 bg-emerald-50"
              )}
            >
              <p className="font-medium">{level.label}</p>
              <p className={cn("text-sm", active ? "text-slate-200" : "text-slate-500")}>{level.durationLabel}</p>
              <p className={cn("text-sm", active ? "text-slate-300" : "text-slate-600")}>{level.description}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
