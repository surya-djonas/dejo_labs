import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, BarChart, Calendar, Plus } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/auth/signin");
  }
  
  const { user } = session;
  const isTeacher = user.role === "TEACHER" || user.role === "SUPER_ADMIN";
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Classroom Quiz</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.name} ({user.role})
            </span>
            <Link href="/api/auth/signout">
              <Button variant="outline" size="sm">Sign Out</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user.name?.split(" ")[0]}!
          </h2>
          <p className="text-muted-foreground">
            {isTeacher
              ? "Manage your classrooms, create quizzes, and track student performance."
              : "Join your classes, take quizzes, and track your progress."}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <QuickActionCard
            icon={<BookOpen className="h-6 w-6" />}
            title="My Classrooms"
            description={isTeacher ? "Manage classes" : "View enrolled classes"}
            href="/classrooms"
          />
          {isTeacher && (
            <QuickActionCard
              icon={<Plus className="h-6 w-6" />}
              title="Create Quiz"
              description="Design a new quiz"
              href="/quizzes/create"
            />
          )}
          <QuickActionCard
            icon={<BarChart className="h-6 w-6" />}
            title="Analytics"
            description="View performance data"
            href="/analytics"
          />
          <QuickActionCard
            icon={<Calendar className="h-6 w-6" />}
            title="Schedule"
            description="Upcoming sessions"
            href="/schedule"
          />
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title={isTeacher ? "Total Students" : "Enrolled Classes"}
            value="24"
            change="+3 this week"
          />
          <StatCard
            title={isTeacher ? "Quizzes Created" : "Quizzes Taken"}
            value="12"
            change="+2 this week"
          />
          <StatCard
            title={isTeacher ? "Avg. Participation" : "Average Score"}
            value={isTeacher ? "87%" : "92%"}
            change="+5% improvement"
          />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest classroom activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ActivityItem
                title="Mathematics Quiz"
                description="Completed by 18/20 students"
                time="2 hours ago"
              />
              <ActivityItem
                title="Physics Live Class"
                description="Session ended with 95% attendance"
                time="Yesterday"
              />
              <ActivityItem
                title="Chemistry Assignment"
                description="Due date approaching"
                time="2 days ago"
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function QuickActionCard({ icon, title, description, href }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="pt-6">
          <div className="text-primary mb-4">{icon}</div>
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function StatCard({ title, value, change }: {
  title: string;
  value: string;
  change: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground mb-2">{title}</p>
        <p className="text-3xl font-bold mb-1">{value}</p>
        <p className="text-xs text-green-600">{change}</p>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ title, description, time }: {
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex items-start gap-4 pb-4 border-b last:border-0">
      <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <p className="text-xs text-muted-foreground">{time}</p>
    </div>
  );
}
