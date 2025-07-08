"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

import { cn } from "@/lib/utils";
import GlowingCircle from "@/components/ui/glowing-circle";
import NavBar from "@/components/NavBar";
import Link from "next/link";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        activationCode: "",
        turnstileToken: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const turnstileRef = useRef<TurnstileRef>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (!formData.turnstileToken) {
            setError("Please complete the captcha");
            setIsLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            console.log("Submitting registration with data:", {
                username: formData.username,
                email: formData.email,
                activationCode: formData.activationCode,
                activationCodeLength: formData.activationCode.length,
                turnstileToken: formData.turnstileToken
                    ? "PROVIDED"
                    : "MISSING",
            });

            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                router.push(data.redirectTo);
            } else {
                setError(data.error || "Registration failed");
                // Reset Turnstile on error so user can try again
                turnstileRef.current?.reset();
                setFormData((prev) => ({ ...prev, turnstileToken: "" }));
            }
        } catch (error) {
            console.error("Registration error:", error);
            setError("An error occurred. Please try again.");
            // Reset Turnstile on error so user can try again
            turnstileRef.current?.reset();
            setFormData((prev) => ({ ...prev, turnstileToken: "" }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleTurnstileVerify = (token: string) => {
        setFormData((prev) => ({ ...prev, turnstileToken: token }));
    };

    const handleTurnstileError = () => {
        setError("Captcha verification failed");
        setFormData((prev) => ({ ...prev, turnstileToken: "" }));
        // Reset will be handled automatically by Turnstile on error
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-white">
            <NavBar />

            <div>
                <GlowingCircle />
                <GlowingCircle isRight={true} />
            </div>

            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <div className="flex justify-center mb-4">
                            <LineShadowText
                                className="italic text-amber-200 text-4xl"
                                shadowColor="#fdef7b"
                            >
                                VocEnglish
                            </LineShadowText>
                        </div>
                        <CardTitle className="text-2xl font-bold text-center">
                            Zarejestruj się
                        </CardTitle>
                        <CardDescription className="text-center">
                            Utwórz nowe konto używając kodu aktywacyjnego
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">
                                    Nazwa użytkownika
                                </Label>
                                <Input
                                    id="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            username: e.target.value,
                                        }))
                                    }
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            email: e.target.value,
                                        }))
                                    }
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Hasło</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            password: e.target.value,
                                        }))
                                    }
                                    required
                                    disabled={isLoading}
                                    minLength={8}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">
                                    Potwierdź hasło
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            confirmPassword: e.target.value,
                                        }))
                                    }
                                    required
                                    disabled={isLoading}
                                    minLength={8}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="activationCode">
                                    Kod aktywacyjny
                                </Label>
                                <Input
                                    id="activationCode"
                                    type="text"
                                    value={formData.activationCode}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        console.log(
                                            "Activation code input changed:",
                                            {
                                                value: value,
                                                rawValue: `"${value}"`,
                                                length: value.length,
                                                hasWhitespace: /\s/.test(value),
                                                charCodes: value
                                                    .split("")
                                                    .map(
                                                        (c, i) =>
                                                            `${i}:"${c}"(${c.charCodeAt(
                                                                0
                                                            )})`
                                                    ),
                                            }
                                        );
                                        setFormData((prev) => ({
                                            ...prev,
                                            activationCode: value,
                                        }));
                                    }}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Turnstile
                                    ref={turnstileRef}
                                    onVerify={handleTurnstileVerify}
                                    onError={handleTurnstileError}
                                />
                            </div>

                            {error && (
                                <div className="text-red-400 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading || !formData.turnstileToken}
                            >
                                {isLoading
                                    ? "Rejestracja..."
                                    : "Zarejestruj się"}
                            </Button>
                        </form>

                        <div className="mt-4 text-center text-sm text-neutral-400">
                            Masz już konto?{" "}
                            <Link
                                href="/login"
                                className="text-amber-200 hover:text-amber-300"
                            >
                                Zaloguj się
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <NoiseFilter className="-z-10" />
        </div>
    );
}
