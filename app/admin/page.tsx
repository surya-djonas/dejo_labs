import { requireAdmin } from "@/lib/auth-helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, School, FileQuestion, Activity } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  await requireAdmin();
  
  // Fetch statistics
  const totalUsers = await prisma.user.count();
  const totalClassrooms = await prisma.classroom.count();
  const totalQuizzes = await prisma.quiz.count();
  const activeUsers = await prisma.user.count({
    where: {
      isActive: true,
      isSuspended: false,
    },
  });
  
  const recentUsers = await prisma.user.findMany({
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      isActive: true,
      isSuspended: true,
    },
  });
  
  const recentActivity = await prisma.activityLog.findMany({
    take: 20,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
  
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Platform management and monitoring</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="h-6 w-6" />}
            title="Total Users"
            value={totalUsers.toString()}
            subtitle={`${activeUsers} active`}
          />
          <StatCard
            icon={<School className="h-6 w-6" />}
            title="Classrooms"
            value={totalClassrooms.toString()}
            subtitle="All platforms"
          />
          <StatCard
            icon={<FileQuestion className="h-6 w-6" />}
            title="Quizzes"
            value={totalQuizzes.toString()}
            subtitle="Total created"
          />
          <StatCard
            icon={<Activity className="h-6 w-6" />}
            title="Active Sessions"
            value="12"
            subtitle="Live now"
          />
        </div>

        {/* Recent Users */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2">Name</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Role</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="py-3">{user.name}</td>
                      <td className="py-3 text-muted-foreground">{user.email}</td>
                      <td className="py-3">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3">
                        {user.isSuspended ? (
                          <span className="text-red-600">Suspended</span>
                        ) : user.isActive ? (
                          <span className="text-green-600">Active</span>
                        ) : (
                          <span className="text-gray-600">Inactive</span>
                        )}
                      </td>
                      <td className="py-3 text-muted-foreground text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Platform activity log</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((log) => (
                <div key={log.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="font-medium">
                      {log.user.name} - {log.action.replace("_", " ")}
                    </p>
                    <p className="text-sm text-muted-foreground">{log.user.email}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">{icon}</div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
