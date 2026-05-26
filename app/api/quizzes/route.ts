import { NextRequest, NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { quizSchema } from "@/lib/validations";

// POST /api/quizzes - Create new quiz
export async function POST(request: NextRequest) {
  try {
    const session = await requireTeacher();
    const body = await request.json();
    
    // Validate input
    quizSchema.parse(body);
    
    const { classroomId, questions, ...quizData } = body;
    
    // Verify teacher owns classroom
    const classroom = await prisma.classroom.findFirst({
      where: {
        id: classroomId,
        teacherId: session.user.id,
      },
    });
    
    if (!classroom) {
      return NextResponse.json(
        { error: "Classroom not found or unauthorized" },
        { status: 404 }
      );
    }
    
    // Calculate total points
    const totalPoints = questions.reduce((sum: number, q: { points?: number }) => sum + (q.points || 1), 0);
    
    // Create quiz with questions
    const quiz = await prisma.quiz.create({
      data: {
        ...quizData,
        classroomId,
        createdById: session.user.id,
        totalPoints,
        questions: {
          create: questions.map((q: Record<string, unknown>, index: number) => ({
            ...q,
            order: index,
          })),
        },
      },
      include: {
        questions: true,
      },
    });
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "create_quiz",
        entity: "quiz",
        entityId: quiz.id,
        metadata: { 
          quizTitle: quiz.title,
          classroomId,
        },
      },
    });
    
    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}

// GET /api/quizzes - List quizzes
export async function GET(request: NextRequest) {
  try {
    const session = await requireTeacher();
    const searchParams = request.nextUrl.searchParams;
    const classroomId = searchParams.get("classroomId");
    
    const quizzes = await prisma.quiz.findMany({
      where: {
        ...(classroomId ? { classroomId } : {}),
        createdById: session.user.id,
        deletedAt: null,
      },
      include: {
        classroom: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            questions: true,
            answers: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return NextResponse.json(quizzes);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}
