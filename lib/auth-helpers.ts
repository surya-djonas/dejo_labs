import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

export async function requireAuth() {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect("/auth/signin");
  }
  
  return session;
}

export async function requireRole(allowedRoles: Role[]) {
  const session = await requireAuth();
  
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/unauthorized");
  }
  
  return session;
}

export async function requireTeacher() {
  return requireRole([Role.TEACHER, Role.SUPER_ADMIN]);
}

export async function requireAdmin() {
  return requireRole([Role.SUPER_ADMIN]);
}

export async function requireStudent() {
  return requireRole([Role.STUDENT, Role.TEACHER, Role.SUPER_ADMIN]);
}
