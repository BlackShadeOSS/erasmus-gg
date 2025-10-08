"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BorderBeam } from "@/components/ui/border-beam";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TurnstileRef } from "@/components/ui/turnstile";
import NoiseFilter from "@/components/NoiseFilter";
import GlowingCircle from "@/components/ui/glowing-circle";
import NavBar from "@/components/NavBar";
import Link from "next/link";

import { useFormValidation } from "@/hooks/useFormValidation";
import { useAvailabilityCheck } from "@/hooks/useAvailabilityCheck";
import { usePasswordStrength } from "@/hooks/usePasswordStrength";
import { ActivationCodeStep } from "@/components/registration/ActivationCodeStep";
import { UserDetailsStep } from "@/components/registration/UserDetailsStep";
import { PasswordStep } from "@/components/registration/PasswordStep";

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

  const router = useRouter();
  const turnstileRef = useRef<TurnstileRef>(
    null
  ) as React.RefObject<TurnstileRef>;

  const { fieldErrors, setFieldErrors, validateField, translateError } =
    useFormValidation();
  const { availabilityChecks, checkAvailability } = useAvailabilityCheck();
  const {
    passwordStrength,
    passwordRequirements,
    calculatePasswordStrength,
    getPasswordStrengthLabel,
  } = usePasswordStrength();

  // Debounced availability checks
  useEffect(() => {
    if (currentStep !== 2) return;

    if (formData.username.trim().length >= 3) {
      const timeoutId = setTimeout(() => {
        checkAvailability("username", formData.username).then((isAvailable) => {
          validateUserDetailsField("username", formData.username, isAvailable);
        });
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [formData.username, currentStep]);

  useEffect(() => {
    if (currentStep !== 2) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email.trim() && emailRegex.test(formData.email)) {
      const timeoutId = setTimeout(() => {
        checkAvailability("email", formData.email).then((isAvailable) => {
          validateUserDetailsField("email", formData.email, isAvailable);
        });
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [formData.email, currentStep]);

  // Wrapper functions to match component prop types
  const validateActivationCodeField = (field: string, value: string) => {
    return validateField(field as "activationCode", value);
  };

  const validateUserDetailsField = (
    field: string,
    value: string,
    isAvailable?: boolean | null
  ) => {
    return validateField(field as "username" | "email", value, isAvailable);
  };

  const validatePasswordField = (field: string, value: string) => {
    return validateField(field as "password", value);
  };

  const validateConfirmPasswordField = (
    confirmPassword: string,
    password: string
  ) => {
    return validateField("confirmPassword", confirmPassword, password);
  };

  // Validation functions
  const isStep1Valid = () => {
    return (
      formData.activationCode.trim().length === 8 &&
      formData.turnstileToken &&
      !fieldErrors.activationCode &&
      !fieldErrors.captcha
    );
  };

  const isStep2Valid = () => {
    return (
      !availabilityChecks.username.isChecking &&
      !availabilityChecks.email.isChecking &&
      formData.username.trim().length >= 3 &&
      formData.email.trim() &&
      availabilityChecks.username.isAvailable === true &&
      availabilityChecks.email.isAvailable === true &&
      !fieldErrors.username &&
      !fieldErrors.email
    );
  };

  const isStep3Valid = () => {
    const passwordRequirementsMet = passwordRequirements.every(
      (req) => req.met
    );
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

  // Event handlers
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handlePasswordChange = (password: string) => {
    calculatePasswordStrength(password);
    validatePasswordField("password", password);
  };

  const handleConfirmPasswordChange = (
    confirmPassword: string,
    password: string
  ) => {
    validateConfirmPasswordField(confirmPassword, password);
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
  };

  // Navigation
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
          setError(translateError(data.error || "Invalid activation code"));
          turnstileRef.current?.reset();
          setFormData((prev) => ({ ...prev, turnstileToken: "" }));
        }
      } catch (error) {
        setError(translateError("An error occurred. Please try again."));
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
      setError(translateError("An error occurred. Please try again."));
      turnstileRef.current?.reset();
      setFormData((prev) => ({ ...prev, turnstileToken: "" }));
    } finally {
      setIsLoading(false);
    }
  };

  const getStepInfo = () => {
    const steps = [
      {
        title: "Kod aktywacyjny",
        description: "Wprowadź kod aktywacyjny otrzymany od nauczyciela",
      },
      {
        title: "Dane użytkownika",
        description: "Wprowadź nazwę użytkownika i adres email",
      },
      { title: "Hasło", description: "Utwórz bezpieczne hasło" },
    ];
    return steps[currentStep - 1];
  };

  return (
    <div className="min-h-screen md:h-screen text-white overflow-x-hidden">
      <NavBar />
      <div>
        <GlowingCircle />
        <GlowingCircle isRight={true} />
      </div>

      <div className="flex items-center justify-center min-h-screen md:h-screen p-4 md:overflow-y-auto">
        <Card className="w-full max-w-md overflow-hidden relative">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <h2 className="text-4xl font-bold text-amber-200">VocEnglish</h2>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              {getStepInfo().title}
            </CardTitle>
            <CardDescription className="text-center">
              {getStepInfo().description}
            </CardDescription>
            <div className="flex justify-center space-x-2 mt-4">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full ${
                    currentStep >= step ? "bg-amber-200" : "bg-neutral-600"
                  }`}
                />
              ))}
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {currentStep === 1 && (
                <ActivationCodeStep
                  formData={formData}
                  fieldErrors={fieldErrors}
                  isLoading={isLoading}
                  turnstileRef={turnstileRef}
                  onInputChange={handleInputChange}
                  onFieldValidation={validateActivationCodeField}
                  onTurnstileVerify={handleTurnstileVerify}
                  onTurnstileError={handleTurnstileError}
                />
              )}

              {currentStep === 2 && (
                <UserDetailsStep
                  formData={formData}
                  fieldErrors={fieldErrors}
                  availabilityChecks={availabilityChecks}
                  isLoading={isLoading}
                  onInputChange={handleInputChange}
                  onFieldValidation={validateUserDetailsField}
                />
              )}

              {currentStep === 3 && (
                <PasswordStep
                  formData={formData}
                  fieldErrors={fieldErrors}
                  passwordStrength={passwordStrength}
                  passwordRequirements={passwordRequirements}
                  isLoading={isLoading}
                  turnstileRef={turnstileRef}
                  onInputChange={handleInputChange}
                  onPasswordChange={handlePasswordChange}
                  onConfirmPasswordChange={handleConfirmPasswordChange}
                  onTurnstileVerify={handleTurnstileVerify}
                  onTurnstileError={handleTurnstileError}
                  getPasswordStrengthLabel={getPasswordStrengthLabel}
                />
              )}

              {error && (
                <div className="text-red-400 text-sm text-center">{error}</div>
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
                      (currentStep === 1 && !isStep1Valid()) ||
                      (currentStep === 2 && !isStep2Valid())
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
                    {isLoading ? "Rejestracja..." : "Zarejestruj się"}
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
