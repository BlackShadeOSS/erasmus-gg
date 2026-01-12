import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "./supabase";

const DEBUG = false;

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "your-secret-key"
);

export interface UserSession {
  id: string;
  username: string;
  email: string;
  role: "student" | "teacher" | "admin";
  fullName?: string;
  selectedProfessionId?: string;
  [key: string]: any;
}

export async function createToken(user: UserSession): Promise<string> {
  return await new SignJWT(user as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserSession;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token");

  if (!token) return null;

  return verifyToken(token.value);
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
}

export function requireAuth(allowedRoles?: string[]) {
  return async (request: NextRequest) => {
    const token = request.cookies.get("auth-token");

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const user = await verifyToken(token.value);

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return null;
  };
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function authenticateUser(username: string, password: string) {
  try {
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("is_active", true)
      .single();

    if (error || !user) {
      return { success: false, error: "Invalid username or password" };
    }

    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      return { success: false, error: "Invalid username or password" };
    }

    // Update last login
    await supabaseAdmin
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", user.id);

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        selected_profession_id: user.selected_profession_id,
      },
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return { success: false, error: "Authentication failed" };
  }
}

export async function validateActivationCode(code: string) {
  try {
    if (DEBUG) {
      console.log("=== ACTIVATION CODE VALIDATION START ===");
      console.log("Input code analysis:", {
        original: `"${code}"`,
        length: code.length,
        type: typeof code,
        trimmed: `"${code.trim()}"`,
        upperCase: `"${code.toUpperCase()}"`,
        lowerCase: `"${code.toLowerCase()}"`,
        hasWhitespace: /\s/.test(code),
        charCodes: Array.from(code).map(
          (c, i) => `${i}:"${c}"(${c.charCodeAt(0)})`
        ),
        isString: typeof code === "string",
        constructor: code.constructor.name,
      });
    }

    // Get all activation codes for comparison
    const { data: allCodes, error: allError } = await supabaseAdmin
      .from("activation_codes")
      .select("code, status, id")
      .eq("status", "active");

    console.log(
      "All active codes in database:",
      allCodes?.map((c) => ({
        id: c.id,
        code: `"${c.code}"`,
        length: c.code.length,
        charCodes: c.code
          .split("")
          .map(
            (char: string, i: number) => `${i}:"${char}"(${char.charCodeAt(0)})`
          ),
      }))
    );

    // Try exact match
    console.log("Attempting exact match query...");
    const { data: exactMatch, error: exactError } = await supabaseAdmin
      .from("activation_codes")
      .select("*")
      .eq("code", code)
      .eq("status", "active")
      .single();

    console.log("Exact match result:", {
      found: !!exactMatch,
      data: exactMatch,
      error: exactError
        ? {
            message: exactError.message,
            code: exactError.code,
            details: exactError.details,
          }
        : null,
    });

    // Try trimmed version
    const trimmedCode = code.trim();
    if (trimmedCode !== code) {
      console.log("Trying trimmed version:", `"${trimmedCode}"`);
      const { data: trimmedMatch, error: trimmedError } = await supabaseAdmin
        .from("activation_codes")
        .select("*")
        .eq("code", trimmedCode)
        .eq("status", "active")
        .single();

      console.log("Trimmed match result:", {
        found: !!trimmedMatch,
        error: trimmedError,
      });

      if (trimmedMatch) {
        console.log("SUCCESS: Found match with trimmed code");
        return { success: true, activationCode: trimmedMatch };
      }
    }

    // Try case-insensitive search
    console.log("Trying case-insensitive search...");
    const { data: caseInsensitive, error: caseError } = await supabaseAdmin
      .from("activation_codes")
      .select("*")
      .ilike("code", code)
      .eq("status", "active");

    console.log("Case-insensitive search result:", caseInsensitive);

    if (exactMatch) {
      console.log(
        "SUCCESS: Found exact match, checking additional constraints..."
      );

      // Check if code has expired
      if (
        exactMatch.expires_at &&
        new Date(exactMatch.expires_at) < new Date()
      ) {
        console.log("FAILURE: Activation code has expired");
        return { success: false, error: "Activation code has expired" };
      }

      // Check if code has reached max uses
      if (exactMatch.used_count >= exactMatch.max_uses) {
        console.log("FAILURE: Activation code has reached maximum uses");
        return {
          success: false,
          error: "Activation code has reached maximum uses",
        };
      }

      console.log("SUCCESS: All validation checks passed");
      return { success: true, activationCode: exactMatch };
    }

    console.log("FAILURE: No matching activation code found");
    return { success: false, error: "Invalid activation code" };
  } catch (error) {
    console.error("Activation code validation error:", error);
    return { success: false, error: "Validation failed" };
  }
}

export async function registerUser(
  username: string,
  email: string,
  password: string,
  activationCode: string
) {
  try {
    console.log("registerUser called with:", {
      username,
      email,
      activationCode: `"${activationCode}"`,
      activationCodeLength: activationCode.length,
    });

    // Validate activation code
    console.log("Validating activation code...");
    const codeValidation = await validateActivationCode(activationCode);
    console.log("Code validation result:", codeValidation);

    if (!codeValidation.success) {
      console.log("Code validation failed:", codeValidation.error);
      return { success: false, error: codeValidation.error };
    }

    // Check if username or email already exists
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("username, email")
      .or(`username.eq.${username},email.eq.${email}`)
      .single();

    if (existingUser) {
      return { success: false, error: "Username or email already exists" };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .insert({
        username,
        email,
        password_hash: hashedPassword,
        role: "student",
        activation_code_id: codeValidation.activationCode!.id,
        selected_profession_id: codeValidation.activationCode!.profession_id,
      })
      .select()
      .single();

    if (userError) {
      return { success: false, error: "Failed to create user" };
    }

    // Update activation code usage
    await supabaseAdmin
      .from("activation_codes")
      .update({
        used_count: codeValidation.activationCode!.used_count + 1,
        status:
          codeValidation.activationCode!.used_count + 1 >=
          codeValidation.activationCode!.max_uses
            ? "used"
            : "active",
      })
      .eq("id", codeValidation.activationCode!.id);

    return { success: true, user };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Registration failed" };
  }
}

export async function verifyTurnstileToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: token,
        }),
      }
    );

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return false;
  }
}

export async function verifyAdminAuth(request: NextRequest): Promise<{
  isValid: boolean;
  user: UserSession | null;
}> {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return { isValid: false, user: null };
    }

    const user = await verifyToken(token);

    if (!user || user.role !== "admin") {
      return { isValid: false, user: null };
    }

    return { isValid: true, user };
  } catch (error) {
    console.error("Admin auth verification error:", error);
    return { isValid: false, user: null };
  }
}
