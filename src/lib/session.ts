import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "./supabase";

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
  role: "student" | "teacher" | "admin";
  selected_profession_id: string | null;
}

export async function createSession(user: User): Promise<string> {
  const sessionToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const { error } = await supabase.from("user_sessions").insert({
    user_id: user.id,
    session_token: sessionToken,
    expires_at: expiresAt.toISOString(),
  });

  return sessionToken;
}

export async function getSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    if (!sessionToken) {
      return null;
    }

    const { data: session, error } = await supabase
      .from("user_sessions")
      .select(
        `
        user_id,
        expires_at,
        users:user_id (
          id,
          username,
          email,
          full_name,
          role,
          selected_profession_id,
          is_active
        )
      `
      )
      .eq("session_token", sessionToken)
      .single();

    if (error || !session || !session.users) {
      return null;
    }

    // Check if session has expired
    if (new Date(session.expires_at) < new Date()) {
      await supabase
        .from("user_sessions")
        .delete()
        .eq("session_token", sessionToken);
      return null;
    }

    const user = Array.isArray(session.users)
      ? session.users[0]
      : session.users;

    if (!user.is_active) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      selected_profession_id: user.selected_profession_id,
    };
  } catch (error) {
    console.error("Session error:", error);
    return null;
  }
}

export async function deleteSession(sessionToken: string): Promise<void> {
  await supabase
    .from("user_sessions")
    .delete()
    .eq("session_token", sessionToken);
}

export async function setSessionCookie(sessionToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("session_token", sessionToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("session_token", "", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}
