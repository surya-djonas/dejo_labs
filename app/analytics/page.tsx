"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Target, Clock, Award } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track performance and engagement metrics</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="h-6 w-6" />}
            title="Total Students"
            value="1,234"
            change="+12%"
            changeType="positive"
          />
          <StatCard
            icon={<Target className="h-6 w-6" />}
            title="Avg. Accuracy"
            value="87.5%"
            change="+5.2%"
            changeType="positive"
          />
          <StatCard
            icon={<Clock className="h-6 w-6" />}
            title="Avg. Response Time"
            value="45s"
            change="-8s"
            changeType="positive"
          />
          <StatCard
            icon={<Award className="h-6 w-6" />}
            title="Participation Rate"
            value="92%"
            change="+3%"
            changeType="positive"
          />
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Student accuracy over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Chart.js integration ready</p>
                  <p className="text-sm">Line chart showing performance trends</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Question Performance</CardTitle>
              <CardDescription>Correct vs. incorrect answers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Chart.js integration ready</p>
                  <p className="text-sm">Bar chart showing question statistics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performers */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Top Performers
              </CardTitle>
              <CardDescription>Students with highest scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Alice Johnson", score: 98, accuracy: 98 },
                  { name: "Bob Smith", score: 95, accuracy: 96 },
                  { name: "Carol White", score: 93, accuracy: 94 },
                  { name: "David Brown", score: 91, accuracy: 92 },
                  { name: "Eve Davis", score: 89, accuracy: 90 },
                ].map((student, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Score: {student.score} | Accuracy: {student.accuracy}%
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${student.accuracy}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Quizzes</CardTitle>
              <CardDescription>Latest quiz performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: "Mathematics - Algebra", participants: 45, avgScore: 87 },
                  { title: "Physics - Mechanics", participants: 42, avgScore: 82 },
                  { title: "Chemistry - Reactions", participants: 48, avgScore: 90 },
                  { title: "Biology - Cells", participants: 44, avgScore: 85 },
                ].map((quiz, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">{quiz.title}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Participants</p>
                        <p className="font-semibold">{quiz.participants}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg. Score</p>
                        <p className="font-semibold">{quiz.avgScore}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  change,
  changeType,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">{icon}</div>
          <span
            className={`text-sm font-semibold ${
              changeType === "positive" ? "text-green-600" : "text-red-600"
            }`}
          >
            {change}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
