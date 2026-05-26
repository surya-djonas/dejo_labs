import { NextRequest, NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { classroomSchema } from "@/lib/validations";
import { generateInviteCode } from "@/lib/utils";

// GET /api/classrooms - List user's classrooms
export async function GET() {
  try {
    const session = await requireTeacher();
    
    const classrooms = await prisma.classroom.findMany({
      where: {
        teacherId: session.user.id,
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
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return NextResponse.json(classrooms);
  } catch (error) {
    console.error("Error fetching classrooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch classrooms" },
      { status: 500 }
    );
  }
}

// POST /api/classrooms - Create new classroom
export async function POST(request: NextRequest) {
  try {
    const session = await requireTeacher();
    const body = await request.json();
    
    // Validate input
    const validatedData = classroomSchema.parse(body);
    
    // Generate unique invite code
    let inviteCode = generateInviteCode();
    let existing = await prisma.classroom.findUnique({
      where: { inviteCode },
    });
    
    while (existing) {
      inviteCode = generateInviteCode();
      existing = await prisma.classroom.findUnique({
        where: { inviteCode },
      });
    }
    
    // Create classroom
    const classroom = await prisma.classroom.create({
      data: {
        ...validatedData,
        inviteCode,
        teacherId: session.user.id,
      },
    });
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "create_classroom",
        entity: "classroom",
        entityId: classroom.id,
        metadata: { classroomName: classroom.name },
      },
    });
    
    return NextResponse.json(classroom, { status: 201 });
  } catch (error) {
    console.error("Error creating classroom:", error);
    return NextResponse.json(
      { error: "Failed to create classroom" },
      { status: 500 }
    );
  }
}
