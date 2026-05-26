import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// GET /api/analytics - Get user analytics
export async function GET() {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const isTeacher = session.user.role === "TEACHER" || session.user.role === "SUPER_ADMIN";
    
    if (isTeacher) {
      // Teacher analytics
      const classrooms = await prisma.classroom.findMany({
        where: {
          teacherId: userId,
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
              members: true,
              quizzes: true,
            },
          },
        },
      });
      
      const totalStudents = classrooms.reduce((sum, c) => sum + c._count.members, 0);
      const totalQuizzes = classrooms.reduce((sum, c) => sum + c._count.quizzes, 0);
      
      // Get quiz statistics
      const quizStats = await prisma.quiz.findMany({
        where: {
          createdById: userId,
          status: "COMPLETED",
        },
        include: {
          analytics: true,
        },
      });
      
      const avgParticipation = quizStats.reduce(
        (sum, q) => sum + (q.analytics?.participationRate || 0),
        0
      ) / (quizStats.length || 1);
      
      const avgScore = quizStats.reduce(
        (sum, q) => sum + (q.analytics?.averageScore || 0),
        0
      ) / (quizStats.length || 1);
      
      // Get top performers
      const topPerformers = await prisma.user.findMany({
        where: {
          role: "STUDENT",
          classroomMembers: {
            some: {
              classroom: {
                teacherId: userId,
              },
            },
          },
        },
        take: 5,
        orderBy: {
          quizAnswers: {
            _count: "desc",
          },
        },
        include: {
          _count: {
            select: {
              quizAnswers: true,
            },
          },
        },
      });
      
      return NextResponse.json({
        totalStudents,
        totalQuizzes,
        totalClassrooms: classrooms.length,
        avgParticipation: Math.round(avgParticipation * 100) / 100,
        avgScore: Math.round(avgScore * 100) / 100,
        topPerformers,
        recentQuizzes: quizStats.slice(0, 10),
      });
    } else {
      // Student analytics
      const enrolledClassrooms = await prisma.classroomMember.count({
        where: {
          userId,
          isActive: true,
        },
      });
      
      const quizzesTaken = await prisma.quizAnswer.groupBy({
        by: ["quizId"],
        where: {
          userId,
        },
        _count: {
          id: true,
        },
      });
      
      const totalQuizzes = quizzesTaken.length;
      
      const answers = await prisma.quizAnswer.findMany({
        where: {
          userId,
        },
        select: {
          pointsEarned: true,
          isCorrect: true,
        },
      });
      
      const totalPoints = answers.reduce((sum, a) => sum + (a.pointsEarned || 0), 0);
      const correctAnswers = answers.filter((a) => a.isCorrect).length;
      const accuracy = answers.length > 0 ? (correctAnswers / answers.length) * 100 : 0;
      
      return NextResponse.json({
        enrolledClassrooms,
        totalQuizzes,
        totalPoints,
        accuracy: Math.round(accuracy * 100) / 100,
        totalAnswers: answers.length,
        correctAnswers,
      });
    }
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
