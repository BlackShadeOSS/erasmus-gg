"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Turnstile, { TurnstileRef } from "@/components/ui/turnstile";
import { LineShadowText } from "@/components/ui/line-shadow-text";
import NoiseFilter from "@/components/NoiseFilter";
import { BorderBeam } from "@/components/ui/border-beam";
import GlowingCircle from "@/components/ui/glowing-circle";
import NavBar from "@/components/NavBar";
import Link from "next/link";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    turnstileToken: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    username: "",
    password: "",
    captcha: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const turnstileRef = useRef<TurnstileRef>(null);

  // Polish error messages mapping
  const polishErrorMessages: { [key: string]: string } = {
    "Username, password, and CAPTCHA are required":
      "Nazwa użytkownika, hasło i CAPTCHA są wymagane",
    "CAPTCHA verification failed": "Weryfikacja CAPTCHA nie powiodła się",
    "Invalid username or password": "Nieprawidłowa nazwa użytkownika lub hasło",
    "User not found": "Użytkownik nie znaleziony",
    "Invalid password": "Nieprawidłowe hasło",
    "Login failed": "Logowanie nie powiodło się",
    "An error occurred. Please try again.": "Wystąpił błąd. Spróbuj ponownie.",
    "Please complete the captcha": "Proszę uzupełnić captcha",
    "Captcha verification failed": "Weryfikacja captcha nie powiodła się",
    "Internal server error": "Wewnętrzny błąd serwera",
  };

  const validateField = (field: string, value: string) => {
    let errorMessage = "";

    switch (field) {
      case "username":
        if (!value.trim()) {
          errorMessage = "Nazwa użytkownika jest wymagana";
        } else if (value.trim().length < 3) {
          errorMessage = "Nazwa użytkownika musi mieć co najmniej 3 znaki";
        }
        break;
      case "password":
        if (!value) {
          errorMessage = "Hasło jest wymagane";
        } else if (value.length < 8) {
          errorMessage = "Hasło musi mieć co najmniej 8 znaków";
        }
        break;
    }

    setFieldErrors((prev) => ({
      ...prev,
      [field]: errorMessage,
    }));

    return errorMessage === "";
  };

  const translateError = (errorMessage: string): string => {
    return polishErrorMessages[errorMessage] || errorMessage;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({ username: "", password: "", captcha: "" });
    setIsLoading(true);

    // Validate all fields
    const isUsernameValid = validateField("username", formData.username);
    const isPasswordValid = validateField("password", formData.password);

    if (!formData.turnstileToken) {
      setFieldErrors((prev) => ({
        ...prev,
        captcha: "Proszę uzupełnić captcha",
      }));
      setIsLoading(false);
      return;
    }

    if (!isUsernameValid || !isPasswordValid) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (data.success) {
        const redirectPath =
          data.redirectTo ||
          (data.user?.role === "admin" ? "/admin-panel" : "/dashboard");
        router.push(redirectPath);
      } else {
        setError(translateError(data.error || "Login failed"));
        turnstileRef.current?.reset();
        setFormData((prev) => ({ ...prev, turnstileToken: "" }));
        setFieldErrors((prev) => ({ ...prev, captcha: "" }));
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(translateError("An error occurred. Please try again."));
      turnstileRef.current?.reset();
      setFormData((prev) => ({ ...prev, turnstileToken: "" }));
      setFieldErrors((prev) => ({ ...prev, captcha: "" }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTurnstileVerify = (token: string) => {
    setFormData((prev) => ({ ...prev, turnstileToken: token }));
    setFieldErrors((prev) => ({ ...prev, captcha: "" }));
  };

  const handleTurnstileError = () => {
    setFieldErrors((prev) => ({
      ...prev,
      captcha: "Weryfikacja captcha nie powiodła się",
    }));
    setFormData((prev) => ({ ...prev, turnstileToken: "" }));
    turnstileRef.current?.reset();
  };

  return (
    <div className="min-h-screen text-white overflow-x-hidden">
      <NavBar />

      <div>
        <GlowingCircle />
        <GlowingCircle isRight={true} />
      </div>

      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md overflow-hidden relative">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <h2 className="text-4xl font-bold text-amber-200">VocEnglish</h2>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Zaloguj się
            </CardTitle>
            <CardDescription className="text-center">
              Wpisz swoje dane aby się zalogować
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nazwa użytkownika</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      username: value,
                    }));
                    // Clear error when user starts typing
                    if (fieldErrors.username) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        username: "",
                      }));
                    }
                  }}
                  onBlur={() => validateField("username", formData.username)}
                  required
                  disabled={isLoading}
                  className={fieldErrors.username ? "border-red-500" : ""}
                />
                {fieldErrors.username && (
                  <div className="text-red-400 text-xs">
                    {fieldErrors.username}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Hasło</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        password: value,
                      }));
                      // Clear error when user starts typing
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          password: "",
                        }));
                      }
                    }}
                    onBlur={() => validateField("password", formData.password)}
                    required
                    disabled={isLoading}
                    className={
                      fieldErrors.password ? "border-red-500 pr-10" : "pr-10"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <div className="text-red-400 text-xs">
                    {fieldErrors.password}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Turnstile
                  ref={turnstileRef}
                  onVerify={handleTurnstileVerify}
                  onError={handleTurnstileError}
                />
                {fieldErrors.captcha && (
                  <div className="text-red-400 text-xs text-center">
                    {fieldErrors.captcha}
                  </div>
                )}
              </div>

              {error && (
                <div className="text-red-400 text-sm text-center">{error}</div>
              )}

              <Button
                type="submit"
                className="w-full hover:bg-stone-200"
                disabled={isLoading || !formData.turnstileToken}
              >
                {isLoading ? "Logowanie..." : "Zaloguj się"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-neutral-400">
              Nie masz konta?{" "}
              <Link
                href="/register"
                className="text-amber-200 hover:text-stone-200"
              >
                Zarejestruj się
              </Link>
            </div>
          </CardContent>
          <BorderBeam
            duration={4}
            size={300}
            reverse
            className="from-transparent via-amber-200 to-transparent "
          />
        </Card>
      </div>

      <NoiseFilter className="-z-10" />
    </div>
  );
}
