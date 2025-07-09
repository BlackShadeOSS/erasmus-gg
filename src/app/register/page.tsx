"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

import { BorderBeam } from "@/components/ui/border-beam";
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
import GlowingCircle from "@/components/ui/glowing-circle";
import NavBar from "@/components/NavBar";
import Link from "next/link";

export default function RegisterPage() {
    const [currentStep, setCurrentStep] = useState(1);
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
    const [fieldErrors, setFieldErrors] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        activationCode: "",
        captcha: "",
    });
    const [passwordStrength, setPasswordStrength] = useState(0); // 0-100 strength indicator
    const [passwordRequirements, setPasswordRequirements] = useState<
        Array<{ test: (p: string) => boolean; text: string; met: boolean }>
    >([
        {
            test: (p: string) => p.length >= 8,
            text: "Co najmniej 8 znaków",
            met: false,
        },
        {
            test: (p: string) => /[a-z]/.test(p),
            text: "Jedna mała litera",
            met: false,
        },
        {
            test: (p: string) => /[A-Z]/.test(p),
            text: "Jedna wielka litera",
            met: false,
        },
        { test: (p: string) => /\d/.test(p), text: "Jedna cyfra", met: false },
        {
            test: (p: string) =>
                /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(p),
            text: "Jeden znak specjalny",
            met: false,
        },
    ]);
    const [availabilityChecks, setAvailabilityChecks] = useState({
        username: { isChecking: false, isAvailable: null as boolean | null },
        email: { isChecking: false, isAvailable: null as boolean | null },
    });
    const router = useRouter();
    const turnstileRef = useRef<TurnstileRef>(null);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Polish error messages mapping
    const polishErrorMessages: { [key: string]: string } = {
        "Username, password, and CAPTCHA are required":
            "Nazwa użytkownika, hasło i CAPTCHA są wymagane",
        "CAPTCHA verification failed": "Weryfikacja CAPTCHA nie powiodła się",
        "Captcha verification failed": "Weryfikacja captcha nie powiodła się",
        "Passwords do not match": "Hasła nie są zgodne",
        "Password must be at least 8 characters long":
            "Hasło musi mieć co najmniej 8 znaków",
        "Password must contain at least one uppercase letter":
            "Hasło musi zawierać co najmniej jedną wielką literę",
        "Password must contain at least one lowercase letter":
            "Hasło musi zawierać co najmniej jedną małą literę",
        "Password must contain at least one number":
            "Hasło musi zawierać co najmniej jedną cyfrę",
        "Password must contain at least one special character":
            "Hasło musi zawierać co najmniej jeden znak specjalny",
        "Username already exists": "Nazwa użytkownika już istnieje",
        "Email already exists": "Email już istnieje",
        "Invalid activation code": "Nieprawidłowy kod aktywacyjny",
        "Activation code expired": "Kod aktywacyjny wygasł",
        "Activation code already used": "Kod aktywacyjny już został użyty",
        "Registration failed": "Rejestracja nie powiodła się",
        "An error occurred. Please try again.":
            "Wystąpił błąd. Spróbuj ponownie.",
        "Please complete the captcha": "Proszę uzupełnić captcha",
        "Internal server error": "Wewnętrzny błąd serwera",
    };

    // Simplified check availability function
    const checkAvailability = async (
        field: "username" | "email",
        value: string
    ) => {
        if (!value.trim()) return;

        // Save the current value being checked to detect race conditions
        const valueBeingChecked = value.trim();

        // Set checking state
        setAvailabilityChecks((prev) => ({
            ...prev,
            [field]: { isChecking: true, isAvailable: null },
        }));

        try {
            const response = await fetch(`/api/auth/check-availability`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ field, value: valueBeingChecked }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Get current value after request completes
            const currentValue =
                field === "username"
                    ? formData.username.trim()
                    : formData.email.trim();

            // Only update if the value hasn't changed during the request
            if (currentValue === valueBeingChecked) {
                setAvailabilityChecks((prev) => ({
                    ...prev,
                    [field]: { isChecking: false, isAvailable: data.available },
                }));

                // Update field validation with the availability result
                if (field === "username") {
                    validateUsername(valueBeingChecked, data.available);
                } else {
                    validateEmail(valueBeingChecked, data.available);
                }
            } else {
                // If value changed during the request, reset the checking state
                // but don't update availability yet since a new check will be triggered
                setAvailabilityChecks((prev) => ({
                    ...prev,
                    [field]: {
                        isChecking: false,
                        isAvailable: prev[field].isAvailable,
                    },
                }));
            }
        } catch (error) {
            console.error("Availability check error:", error);
            setAvailabilityChecks((prev) => ({
                ...prev,
                [field]: { isChecking: false, isAvailable: null },
            }));
        }
    };

    // Validation functions
    const validateActivationCode = (code: string) => {
        let errorMessage = "";

        if (!code.trim()) {
            errorMessage = "Kod aktywacyjny jest wymagany";
        } else if (code.trim().length !== 8) {
            errorMessage = "Kod aktywacyjny musi mieć 8 znaków";
        }

        setFieldErrors((prev) => ({ ...prev, activationCode: errorMessage }));
        return errorMessage === "";
    };

    const validateUsername = (
        username: string,
        isAvailable?: boolean | null
    ) => {
        let errorMessage = "";

        if (!username.trim()) {
            errorMessage = "Nazwa użytkownika jest wymagana";
        } else if (username.trim().length < 3) {
            errorMessage = "Nazwa użytkownika musi mieć co najmniej 3 znaki";
        } else if (isAvailable === false) {
            errorMessage = "Nazwa użytkownika już istnieje";
        }

        setFieldErrors((prev) => ({ ...prev, username: errorMessage }));
        return errorMessage === "";
    };

    const validateEmail = (email: string, isAvailable?: boolean | null) => {
        let errorMessage = "";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email.trim()) {
            errorMessage = "Email jest wymagany";
        } else if (!emailRegex.test(email)) {
            errorMessage = "Nieprawidłowy format email";
        } else if (isAvailable === false) {
            errorMessage = "Email już istnieje";
        }

        setFieldErrors((prev) => ({ ...prev, email: errorMessage }));
        return errorMessage === "";
    };

    const validatePassword = (password: string) => {
        let errorMessage = "";

        if (!password) {
            errorMessage = "Hasło jest wymagane";
        } else if (password.length < 8) {
            errorMessage = "Hasło musi mieć co najmniej 8 znaków";
        } else if (!/[a-z]/.test(password)) {
            errorMessage = "Hasło musi zawierać co najmniej jedną małą literę";
        } else if (!/[A-Z]/.test(password)) {
            errorMessage =
                "Hasło musi zawierać co najmniej jedną wielką literę";
        } else if (!/\d/.test(password)) {
            errorMessage = "Hasło musi zawierać co najmniej jedną cyfrę";
        } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)) {
            errorMessage =
                "Hasło musi zawierać co najmniej jeden znak specjalny";
        }

        // Update password strength and requirements
        const strengthData = getPasswordStrength(password);
        setPasswordRequirements(strengthData.requirements);
        setPasswordStrength(strengthData.strengthPercentage);

        // Only set error message if not empty
        if (errorMessage) {
            setFieldErrors((prev) => ({ ...prev, password: errorMessage }));
        } else {
            setFieldErrors((prev) => ({ ...prev, password: "" }));
        }

        return errorMessage === "";
    };

    const validateConfirmPassword = (
        confirmPassword: string,
        password: string
    ) => {
        let errorMessage = "";

        if (!confirmPassword) {
            errorMessage = "Potwierdzenie hasła jest wymagane";
        } else if (confirmPassword !== password) {
            errorMessage = "Hasła nie są zgodne";
        }

        setFieldErrors((prev) => ({ ...prev, confirmPassword: errorMessage }));
        return errorMessage === "";
    };

    // Function to get password strength label
    const getPasswordStrengthLabel = (strength: number): string => {
        if (strength < 25) return "Bardzo słabe";
        if (strength < 50) return "Słabe";
        if (strength < 75) return "Dobre";
        if (strength < 90) return "Silne";
        return "Bardzo silne";
    };

    // Function to check if passwords match
    const doPasswordsMatch = (): boolean => {
        if (!formData.confirmPassword) return false;
        return formData.password === formData.confirmPassword;
    };

    const getPasswordStrength = (password: string) => {
        const requirements = [
            {
                test: (p: string) => p.length >= 8,
                text: "Co najmniej 8 znaków",
            },
            { test: (p: string) => /[a-z]/.test(p), text: "Jedna mała litera" },
            {
                test: (p: string) => /[A-Z]/.test(p),
                text: "Jedna wielka litera",
            },
            { test: (p: string) => /\d/.test(p), text: "Jedna cyfra" },
            {
                test: (p: string) =>
                    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(p),
                text: "Jeden znak specjalny",
            },
        ];

        const passwordReqs = requirements.map((req) => ({
            ...req,
            met: password ? req.test(password) : false,
        }));

        // Calculate basic strength as a percentage of requirements met
        const metCount = passwordReqs.filter((req) => req.met).length;
        let strengthPercentage = password
            ? Math.round((metCount / requirements.length) * 100)
            : 0;

        // Bonus points for additional complexity
        if (password) {
            // Length bonus (up to 20% extra)
            if (password.length > 8) {
                const lengthBonus = Math.min(20, (password.length - 8) * 2);
                strengthPercentage += lengthBonus;
            }

            // Variety bonus (mix of character types)
            const varietyTypes = [
                /[a-z]/.test(password), // lowercase
                /[A-Z]/.test(password), // uppercase
                /\d/.test(password), // numbers
                /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password), // special chars
            ].filter(Boolean).length;

            if (varietyTypes >= 3 && password.length >= 10) {
                strengthPercentage += 10;
            }

            // Cap at 100%
            strengthPercentage = Math.min(100, strengthPercentage);
        }

        return {
            requirements: passwordReqs,
            strengthPercentage,
        };
    };

    const translateError = (errorMessage: string): string => {
        return polishErrorMessages[errorMessage] || errorMessage;
    };

    // Step validation functions
    const isStep1Valid = () => {
        return (
            formData.activationCode.trim().length === 8 &&
            formData.turnstileToken &&
            !fieldErrors.activationCode &&
            !fieldErrors.captcha
        );
    };

    const isStep2Valid = () => {
        // If still checking availability, return false
        if (
            availabilityChecks.username.isChecking ||
            availabilityChecks.email.isChecking
        ) {
            return false;
        }

        return (
            formData.username.trim().length >= 3 &&
            formData.email.trim() &&
            availabilityChecks.username.isAvailable === true &&
            availabilityChecks.email.isAvailable === true &&
            !fieldErrors.username &&
            !fieldErrors.email
        );
    };

    const isStep3Valid = () => {
        // Define the password requirements for validation
        const hasMinLength = formData.password.length >= 8;
        const hasLowercase = /[a-z]/.test(formData.password);
        const hasUppercase = /[A-Z]/.test(formData.password);
        const hasNumber = /\d/.test(formData.password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(
            formData.password
        );

        // Check if all password requirements are met
        const passwordRequirementsMet =
            hasMinLength &&
            hasLowercase &&
            hasUppercase &&
            hasNumber &&
            hasSpecialChar;

        return (
            passwordRequirementsMet &&
            formData.confirmPassword &&
            formData.password === formData.confirmPassword &&
            formData.turnstileToken &&
            !fieldErrors.password &&
            !fieldErrors.confirmPassword &&
            !fieldErrors.captcha
        );
    };

    // Step navigation functions
    const nextStep = async () => {
        if (currentStep === 1) {
            if (!isStep1Valid()) return;

            setIsLoading(true);
            try {
                const response = await fetch("/api/test/activation-code", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        code: formData.activationCode,
                        turnstileToken: formData.turnstileToken,
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    setCurrentStep(2);
                    setError("");
                } else {
                    setError(
                        translateError(data.error || "Invalid activation code")
                    );
                    turnstileRef.current?.reset();
                    setFormData((prev) => ({ ...prev, turnstileToken: "" }));
                }
            } catch (error) {
                setError(
                    translateError("An error occurred. Please try again.")
                );
                turnstileRef.current?.reset();
                setFormData((prev) => ({ ...prev, turnstileToken: "" }));
            } finally {
                setIsLoading(false);
            }
        } else if (currentStep === 2) {
            if (!isStep2Valid()) return;
            setCurrentStep(3);
            setFormData((prev) => ({ ...prev, turnstileToken: "" }));
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setError("");
        }
    };

    // Final registration submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isStep3Valid()) return;

        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                router.push(data.redirectTo);
            } else {
                setError(translateError(data.error || "Registration failed"));
                turnstileRef.current?.reset();
                setFormData((prev) => ({ ...prev, turnstileToken: "" }));
            }
        } catch (error) {
            console.error("Registration error:", error);
            setError(translateError("An error occurred. Please try again."));
            turnstileRef.current?.reset();
            setFormData((prev) => ({ ...prev, turnstileToken: "" }));
        } finally {
            setIsLoading(false);
        }
    };

    // Turnstile handlers
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
    };

    // Debounced availability check
    useEffect(() => {
        // Only run when on step 2
        if (currentStep !== 2) return;

        // Don't check if username is too short
        if (formData.username.trim().length < 3) {
            // Reset the availability check for username if it's too short
            setAvailabilityChecks((prev) => ({
                ...prev,
                username: { isChecking: false, isAvailable: null },
            }));
            return;
        }

        // Check username availability with debounce
        const timeoutId = setTimeout(() => {
            checkAvailability("username", formData.username);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [formData.username, currentStep]);

    useEffect(() => {
        // Only run when on step 2
        if (currentStep !== 2) return;

        // Check if email is valid before checking availability
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim() || !emailRegex.test(formData.email)) {
            // Reset the availability check for email if it's invalid
            setAvailabilityChecks((prev) => ({
                ...prev,
                email: { isChecking: false, isAvailable: null },
            }));
            return;
        }

        // Check email availability with debounce
        const timeoutId = setTimeout(() => {
            checkAvailability("email", formData.email);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [formData.email, currentStep]);

    const getStepTitle = () => {
        switch (currentStep) {
            case 1:
                return "Kod aktywacyjny";
            case 2:
                return "Dane użytkownika";
            case 3:
                return "Hasło";
            default:
                return "Rejestracja";
        }
    };

    const getStepDescription = () => {
        switch (currentStep) {
            case 1:
                return "Wprowadź kod aktywacyjny otrzymany od nauczyciela";
            case 2:
                return "Wprowadź nazwę użytkownika i adres email";
            case 3:
                return "Utwórz bezpieczne hasło";
            default:
                return "Utwórz nowe konto";
        }
    };

    return (
        <div className="min-h-screen md:h-screen md:overflow-hidden text-white">
            <NavBar />

            <div>
                <GlowingCircle />
                <GlowingCircle isRight={true} />
            </div>

            <div className="flex items-center justify-center min-h-screen md:h-screen p-4 md:overflow-y-auto">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <div className="flex justify-center mb-4">
                            <h2 className="text-4xl font-bold text-amber-200">
                                VocEnglish
                            </h2>
                        </div>
                        <CardTitle className="text-2xl font-bold text-center">
                            {getStepTitle()}
                        </CardTitle>
                        <CardDescription className="text-center">
                            {getStepDescription()}
                        </CardDescription>
                        <div className="flex justify-center space-x-2 mt-4">
                            {[1, 2, 3].map((step) => (
                                <div
                                    key={step}
                                    className={`w-3 h-3 rounded-full ${
                                        currentStep >= step
                                            ? "bg-amber-200"
                                            : "bg-neutral-600"
                                    }`}
                                />
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Step 1: Activation Code */}
                            {currentStep === 1 && (
                                <>
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
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    activationCode: value,
                                                }));
                                                if (
                                                    fieldErrors.activationCode
                                                ) {
                                                    setFieldErrors((prev) => ({
                                                        ...prev,
                                                        activationCode: "",
                                                    }));
                                                }
                                                // Real-time validation for activation code
                                                if (value.trim().length === 8) {
                                                    validateActivationCode(
                                                        value
                                                    );
                                                }
                                            }}
                                            onBlur={() =>
                                                validateActivationCode(
                                                    formData.activationCode
                                                )
                                            }
                                            placeholder="Wprowadź kod aktywacyjny (8 znaków)"
                                            required
                                            disabled={isLoading}
                                            maxLength={8}
                                            className={
                                                fieldErrors.activationCode
                                                    ? "border-red-500"
                                                    : formData.activationCode.trim()
                                                          .length === 8 &&
                                                      !fieldErrors.activationCode
                                                    ? "border-green-500"
                                                    : ""
                                            }
                                        />
                                        {formData.activationCode.trim()
                                            .length === 8 &&
                                            !fieldErrors.activationCode && (
                                                <div className="text-green-400 text-xs">
                                                    ✓ Kod aktywacyjny
                                                    wprowadzony poprawnie
                                                </div>
                                            )}
                                        {fieldErrors.activationCode && (
                                            <div className="text-red-400 text-xs">
                                                {fieldErrors.activationCode}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Turnstile
                                            ref={turnstileRef}
                                            onVerify={handleTurnstileVerify}
                                            onError={handleTurnstileError}
                                        />
                                        {formData.turnstileToken && (
                                            <div className="text-green-400 text-xs text-center">
                                                ✓ CAPTCHA zweryfikowana
                                            </div>
                                        )}
                                        {fieldErrors.captcha && (
                                            <div className="text-red-400 text-xs text-center">
                                                {fieldErrors.captcha}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Step 2: Username and Email */}
                            {currentStep === 2 && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="username">
                                            Nazwa użytkownika
                                        </Label>
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

                                                // Clear error if user is typing
                                                if (fieldErrors.username) {
                                                    setFieldErrors((prev) => ({
                                                        ...prev,
                                                        username: "",
                                                    }));
                                                }

                                                // Validate on every change for immediate feedback
                                                validateUsername(value);
                                            }}
                                            onBlur={() => {
                                                // Run one more validation on blur, but pass current availability state
                                                validateUsername(
                                                    formData.username,
                                                    availabilityChecks.username
                                                        .isAvailable
                                                );
                                            }}
                                            placeholder="Wprowadź nazwę użytkownika"
                                            required
                                            disabled={isLoading}
                                            className={
                                                fieldErrors.username
                                                    ? "border-red-500"
                                                    : availabilityChecks
                                                          .username
                                                          .isAvailable === true
                                                    ? "border-green-500"
                                                    : availabilityChecks
                                                          .username
                                                          .isAvailable === false
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                        {availabilityChecks.username
                                            .isChecking && (
                                            <div className="text-amber-400 text-xs">
                                                Sprawdzanie dostępności...
                                            </div>
                                        )}
                                        {availabilityChecks.username
                                            .isAvailable === true && (
                                            <div className="text-green-400 text-xs">
                                                ✓ Nazwa użytkownika jest
                                                dostępna
                                            </div>
                                        )}
                                        {fieldErrors.username && (
                                            <div className="text-red-400 text-xs">
                                                {fieldErrors.username}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2 mb-10">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    email: value,
                                                }));

                                                // Clear error if user is typing
                                                if (fieldErrors.email) {
                                                    setFieldErrors((prev) => ({
                                                        ...prev,
                                                        email: "",
                                                    }));
                                                }

                                                // Validate on every change for immediate feedback
                                                validateEmail(value);
                                            }}
                                            onBlur={() => {
                                                // Run one more validation on blur, but pass current availability state
                                                validateEmail(
                                                    formData.email,
                                                    availabilityChecks.email
                                                        .isAvailable
                                                );
                                            }}
                                            placeholder="Wprowadź adres email"
                                            required
                                            disabled={isLoading}
                                            className={
                                                fieldErrors.email
                                                    ? "border-red-500"
                                                    : availabilityChecks.email
                                                          .isAvailable === true
                                                    ? "border-green-500"
                                                    : availabilityChecks.email
                                                          .isAvailable === false
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                        {availabilityChecks.email
                                            .isChecking && (
                                            <div className="text-amber-400 text-xs">
                                                Sprawdzanie dostępności...
                                            </div>
                                        )}
                                        {availabilityChecks.email
                                            .isAvailable === true && (
                                            <div className="text-green-400 text-xs">
                                                ✓ Email jest dostępny
                                            </div>
                                        )}
                                        {fieldErrors.email && (
                                            <div className="text-red-400 text-xs">
                                                {fieldErrors.email}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Step 3: Password */}
                            {currentStep === 3 && (
                                <>
                                    {/* Password fields stacked vertically */}
                                    <div className="space-y-1">
                                        {/* Password field */}
                                        <div className="space-y-1">
                                            <Label
                                                htmlFor="password"
                                                className="text-sm"
                                            >
                                                Hasło
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={formData.password}
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value;
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            password: value,
                                                        }));

                                                        // Clear error when user starts typing
                                                        if (
                                                            fieldErrors.password
                                                        ) {
                                                            setFieldErrors(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    password:
                                                                        "",
                                                                })
                                                            );
                                                        }

                                                        // Always validate password on change
                                                        validatePassword(value);

                                                        // Update confirm password validation if needed
                                                        if (
                                                            formData.confirmPassword
                                                        ) {
                                                            validateConfirmPassword(
                                                                formData.confirmPassword,
                                                                value
                                                            );
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        // Just validate the password
                                                        validatePassword(
                                                            formData.password
                                                        );
                                                    }}
                                                    placeholder="Wprowadź hasło"
                                                    required
                                                    disabled={isLoading}
                                                    className={
                                                        fieldErrors.password
                                                            ? "border-red-500 pr-10"
                                                            : passwordStrength >
                                                              0
                                                            ? passwordStrength <
                                                              25
                                                                ? "border-red-500 pr-10"
                                                                : passwordStrength <
                                                                  50
                                                                ? "border-orange-500 pr-10"
                                                                : passwordStrength <
                                                                  75
                                                                ? "border-yellow-500 pr-10"
                                                                : "border-green-500 pr-10"
                                                            : "pr-10"
                                                    }
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            !showPassword
                                                        )
                                                    }
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff size={18} />
                                                    ) : (
                                                        <Eye size={18} />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Confirm Password field */}
                                        <div className="space-y-1">
                                            <Label
                                                htmlFor="confirmPassword"
                                                className="text-sm"
                                            >
                                                Potwierdź hasło
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="confirmPassword"
                                                    type={
                                                        showConfirmPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={
                                                        formData.confirmPassword
                                                    }
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value;
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            confirmPassword:
                                                                value,
                                                        }));
                                                        if (
                                                            fieldErrors.confirmPassword
                                                        ) {
                                                            setFieldErrors(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    confirmPassword:
                                                                        "",
                                                                })
                                                            );
                                                        }

                                                        // Validate on change for immediate feedback
                                                        validateConfirmPassword(
                                                            value,
                                                            formData.password
                                                        );
                                                    }}
                                                    onBlur={() =>
                                                        validateConfirmPassword(
                                                            formData.confirmPassword,
                                                            formData.password
                                                        )
                                                    }
                                                    placeholder="Potwierdź hasło"
                                                    required
                                                    disabled={isLoading}
                                                    className={
                                                        fieldErrors.confirmPassword
                                                            ? "border-red-500 pr-10"
                                                            : formData.confirmPassword &&
                                                              formData.password ===
                                                                  formData.confirmPassword
                                                            ? "border-green-500 pr-10"
                                                            : "pr-10"
                                                    }
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowConfirmPassword(
                                                            !showConfirmPassword
                                                        )
                                                    }
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff size={18} />
                                                    ) : (
                                                        <Eye size={18} />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Password strength meter and requirements - always visible */}
                                        <div className="mt-3">
                                            {/* Strength meter - always visible */}
                                            <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-300 ease-in-out ${
                                                        !formData.password
                                                            ? "bg-neutral-600"
                                                            : passwordStrength <
                                                              25
                                                            ? "bg-red-500"
                                                            : passwordStrength <
                                                              50
                                                            ? "bg-orange-500"
                                                            : passwordStrength <
                                                              75
                                                            ? "bg-yellow-500"
                                                            : passwordStrength <
                                                              90
                                                            ? "bg-green-500"
                                                            : "bg-blue-500"
                                                    }`}
                                                    style={{
                                                        width: formData.password
                                                            ? `${passwordStrength}%`
                                                            : "0%",
                                                    }}
                                                ></div>
                                            </div>

                                            {/* Always show the requirements list - more compact */}
                                            <div className="mt-3 p-2 bg-neutral-800 border border-neutral-600 rounded-md shadow-lg w-full">
                                                <div className="flex justify-between items-center mb-1">
                                                    <div className="text-xs font-medium text-neutral-300">
                                                        Wymagania:
                                                    </div>
                                                    {formData.password ? (
                                                        <span
                                                            className={`text-xs font-medium ${
                                                                passwordStrength <
                                                                25
                                                                    ? "text-red-400"
                                                                    : passwordStrength <
                                                                      50
                                                                    ? "text-orange-400"
                                                                    : passwordStrength <
                                                                      75
                                                                    ? "text-yellow-400"
                                                                    : passwordStrength <
                                                                      90
                                                                    ? "text-green-400"
                                                                    : "text-blue-400"
                                                            }`}
                                                        >
                                                            {getPasswordStrengthLabel(
                                                                passwordStrength
                                                            )}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-medium text-neutral-400">
                                                            Wprowadź hasło
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Password requirements in a more evenly distributed layout - 2 columns */}
                                                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                                                    {passwordRequirements.map(
                                                        (req, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center space-x-1 text-xs"
                                                            >
                                                                <span
                                                                    className={
                                                                        req.met
                                                                            ? "text-green-400"
                                                                            : "text-red-400"
                                                                    }
                                                                >
                                                                    {req.met
                                                                        ? "✓"
                                                                        : "○"}
                                                                </span>
                                                                <span
                                                                    className={
                                                                        req.met
                                                                            ? "text-green-400"
                                                                            : "text-red-400"
                                                                    }
                                                                >
                                                                    {req.text}
                                                                </span>
                                                            </div>
                                                        )
                                                    )}

                                                    {/* Passwords match indicator in the requirements grid */}
                                                    <div className="flex items-center space-x-1 text-xs">
                                                        <span
                                                            className={
                                                                formData.confirmPassword &&
                                                                formData.password ===
                                                                    formData.confirmPassword
                                                                    ? "text-green-400"
                                                                    : "text-red-400"
                                                            }
                                                        >
                                                            {formData.confirmPassword &&
                                                            formData.password ===
                                                                formData.confirmPassword
                                                                ? "✓"
                                                                : "○"}
                                                        </span>
                                                        <span
                                                            className={
                                                                formData.confirmPassword &&
                                                                formData.password ===
                                                                    formData.confirmPassword
                                                                    ? "text-green-400"
                                                                    : "text-red-400"
                                                            }
                                                        >
                                                            Hasła są zgodne
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
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
                                </>
                            )}

                            {error && (
                                <div className="text-red-400 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <div className="flex space-x-2">
                                {currentStep > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={prevStep}
                                        disabled={isLoading}
                                        className="flex-1"
                                    >
                                        Wstecz
                                    </Button>
                                )}
                                {currentStep < 3 ? (
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={
                                            isLoading ||
                                            (currentStep === 1 &&
                                                !isStep1Valid()) ||
                                            (currentStep === 2 &&
                                                !isStep2Valid())
                                        }
                                        className="flex-1 hover:bg-stone-200"
                                    >
                                        {isLoading ? "Sprawdzanie..." : "Dalej"}
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={isLoading || !isStep3Valid()}
                                        className="flex-1 hover:bg-stone-200"
                                    >
                                        {isLoading
                                            ? "Rejestracja..."
                                            : "Zarejestruj się"}
                                    </Button>
                                )}
                            </div>
                        </form>

                        <div className="mt-4 text-center text-sm text-neutral-400">
                            Masz już konto?{" "}
                            <Link
                                href="/login"
                                className="text-amber-200 hover:text-stone-200"
                            >
                                Zaloguj się
                            </Link>
                        </div>
                    </CardContent>
                    <BorderBeam
                        duration={4}
                        size={200}
                        reverse
                        className="from-transparent via-amber-200 to-transparent"
                    />
                </Card>
            </div>

            <NoiseFilter className="-z-10" />
        </div>
    );
}
