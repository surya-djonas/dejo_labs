import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// POST /api/classrooms/[id]/join - Join classroom with invite code
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const { inviteCode } = await request.json();
    
    // Find classroom
    const classroom = await prisma.classroom.findUnique({
      where: { 
        id: params.id,
        inviteCode,
      },
    });
    
    if (!classroom) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 404 }
      );
    }
    
    // Check if already a member
    const existingMember = await prisma.classroomMember.findUnique({
      where: {
        classroomId_userId: {
          classroomId: params.id,
          userId: session.user.id,
        },
      },
    });
    
    if (existingMember) {
      return NextResponse.json(
        { error: "Already a member of this classroom" },
        { status: 400 }
      );
    }
    
    // Add member
    const member = await prisma.classroomMember.create({
      data: {
        classroomId: params.id,
        userId: session.user.id,
      },
    });
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "join_classroom",
        entity: "classroom",
        entityId: params.id,
        metadata: { classroomName: classroom.name },
      },
    });
    
    return NextResponse.json({ success: true, member });
  } catch (error) {
    console.error("Error joining classroom:", error);
    return NextResponse.json(
      { error: "Failed to join classroom" },
      { status: 500 }
    );
  }
}
