"use client";

import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SurveyStats } from "@/lib/survey/schema";

const PIE_COLORS = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];
const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  color: "var(--foreground)",
  fontSize: "13px",
  fontWeight: 600,
};

function countsToBars(counts: Record<string, number>, sortNumericKeys = false) {
  const entries = Object.entries(counts ?? {});
  if (sortNumericKeys) {
    entries.sort((a, b) => Number(a[0]) - Number(b[0]));
  } else {
    entries.sort((a, b) => b[1] - a[1]);
  }
  return entries.map(([name, value]) => ({ name, value }));
}

function ChartCard({
  title,
  description,
  answered,
  data,
  color = "#0d9488",
}: {
  title: string;
  description: string;
  answered: number;
  data: { name: string; value: number }[];
  color?: string;
}) {
  return (
    <Card className="border-teal-200/60 bg-white/85 shadow-md dark:border-teal-800/40 dark:bg-slate-900/85">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-teal-950 dark:text-teal-50">{title}</CardTitle>
        <CardDescription className="font-medium text-slate-700 dark:text-slate-300">
          {description} · Based on {answered} response{answered === 1 ? "" : "s"}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-72 pt-0">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No responses yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" opacity={0.7} />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--foreground)", fontSize: 12, fontWeight: 600 }}
                axisLine={{ stroke: "var(--muted-foreground)" }}
                tickLine={{ stroke: "var(--muted-foreground)" }}
                interval={0}
                angle={-28}
                textAnchor="end"
                height={60}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "var(--foreground)", fontSize: 12, fontWeight: 600 }}
                axisLine={{ stroke: "var(--muted-foreground)" }}
                tickLine={{ stroke: "var(--muted-foreground)" }}
                width={38}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: "var(--foreground)", fontWeight: 700 }}
                itemStyle={{ color: "var(--foreground)", fontWeight: 600 }}
                cursor={{ fill: "var(--muted)", opacity: 0.45 }}
              />
              <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} name="Responses" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function DonutChartCard({
  title,
  description,
  answered,
  data,
}: {
  title: string;
  description: string;
  answered: number;
  data: { name: string; value: number }[];
}) {
  return (
    <Card className="border-teal-200/60 bg-white/85 shadow-md dark:border-teal-800/40 dark:bg-slate-900/85">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-teal-950 dark:text-teal-50">{title}</CardTitle>
        <CardDescription className="font-medium text-slate-700 dark:text-slate-300">
          {description} · Based on {answered} response{answered === 1 ? "" : "s"}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-72 pt-0">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm font-medium text-muted-foreground">
            No responses yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="44%"
                innerRadius={54}
                outerRadius={88}
                paddingAngle={2}
                stroke="var(--card)"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: "var(--foreground)", fontWeight: 700 }}
                itemStyle={{ color: "var(--foreground)", fontWeight: 600 }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ color: "var(--foreground)", fontSize: 13, fontWeight: 600 }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function SurveyCharts({ stats }: { stats: SurveyStats }) {
  const answered = stats.answered ?? {};
  const severity = countsToBars(stats.severity, true);
  const impact = countsToBars(stats.dailyLifeImpact, true);
  const age = countsToBars(stats.ageGroups);
  const diagnosed = countsToBars(stats.diagnosed);
  const frequency = countsToBars(stats.frequency);
  const areas = countsToBars(stats.areas).slice(0, 10);
  const triggers = countsToBars(stats.triggers).slice(0, 10);
  const treatments = countsToBars(stats.treatments).slice(0, 10);
  const lifeAreas = countsToBars(stats.lifeAreas);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-teal-950 dark:text-teal-50">
            Live results
          </h2>
          <p className="text-sm text-muted-foreground">
            Charts refresh automatically as new anonymous responses arrive.
          </p>
        </div>
        <p className="rounded-full border border-teal-800/15 bg-teal-50/80 px-3 py-1 text-sm font-semibold tabular-nums text-teal-900 dark:border-teal-200/20 dark:bg-teal-950/50 dark:text-teal-100">
          {stats.totalResponses} response{stats.totalResponses === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DonutChartCard
          title="Age groups"
          description="Distribution of reported age ranges"
          answered={answered.ageGroups ?? 0}
          data={age}
        />
        <DonutChartCard
          title="Diagnosed with hyperhidrosis?"
          description="Self-reported diagnosis status"
          answered={answered.diagnosed ?? 0}
          data={diagnosed}
        />
        <ChartCard
          title="Sweating severity (0–10)"
          description="How severe sweating feels on average"
          answered={answered.severity ?? 0}
          data={severity}
          color="#0f766e"
        />
        <ChartCard
          title="Daily life impact (0–10)"
          description="How much sweating affects daily life"
          answered={answered.dailyLifeImpact ?? 0}
          data={impact}
          color="#155e75"
        />
        <ChartCard
          title="How often it happens"
          description="Reported frequency of excessive sweating"
          answered={answered.frequency ?? 0}
          data={frequency}
        />
        <ChartCard
          title="Areas of life affected"
          description="Where respondents feel the biggest impact"
          answered={answered.lifeAreas ?? 0}
          data={lifeAreas}
          color="#0e7490"
        />
        <ChartCard
          title="Most common body areas"
          description="Top reported affected regions"
          answered={answered.areas ?? 0}
          data={areas}
        />
        <ChartCard
          title="Common triggers"
          description="Top reported sweating triggers"
          answered={answered.triggers ?? 0}
          data={triggers}
          color="#0f766e"
        />
      </div>

      <ChartCard
        title="Treatments in use"
        description="What respondents report using currently"
        answered={answered.treatments ?? 0}
        data={treatments}
        color="#0d9488"
      />
    </div>
  );
}
