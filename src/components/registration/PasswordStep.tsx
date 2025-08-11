import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Turnstile, { TurnstileRef } from "@/components/ui/turnstile";
import { PasswordRequirement } from "@/hooks/usePasswordStrength";

interface PasswordStepProps {
    formData: {
        password: string;
        confirmPassword: string;
        turnstileToken: string;
    };
    fieldErrors: { password: string; confirmPassword: string; captcha: string };
    passwordStrength: number;
    passwordRequirements: PasswordRequirement[];
    isLoading: boolean;
    turnstileRef: React.RefObject<TurnstileRef>;
    onInputChange: (field: string, value: string) => void;
    onPasswordChange: (password: string) => void;
    onConfirmPasswordChange: (
        confirmPassword: string,
        password: string
    ) => void;
    onTurnstileVerify: (token: string) => void;
    onTurnstileError: () => void;
    getPasswordStrengthLabel: (strength: number) => string;
}

export const PasswordStep: React.FC<PasswordStepProps> = ({
    formData,
    fieldErrors,
    passwordStrength,
    passwordRequirements,
    isLoading,
    turnstileRef,
    onInputChange,
    onPasswordChange,
    onConfirmPasswordChange,
    onTurnstileVerify,
    onTurnstileError,
    getPasswordStrengthLabel,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <>
            <div className="space-y-1">
                <div className="space-y-1">
                    <Label htmlFor="password" className="text-sm">
                        Hasło
                    </Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => {
                                const value = e.target.value;
                                onInputChange("password", value);
                                onPasswordChange(value);
                                if (formData.confirmPassword) {
                                    onConfirmPasswordChange(
                                        formData.confirmPassword,
                                        value
                                    );
                                }
                            }}
                            placeholder="Wprowadź hasło"
                            required
                            disabled={isLoading}
                            className={
                                fieldErrors.password
                                    ? "border-red-500 pr-10"
                                    : passwordStrength > 0
                                    ? passwordStrength < 25
                                        ? "border-red-500 pr-10"
                                        : passwordStrength < 50
                                        ? "border-orange-500 pr-10"
                                        : passwordStrength < 75
                                        ? "border-yellow-500 pr-10"
                                        : "border-green-500 pr-10"
                                    : "pr-10"
                            }
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
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

                <div className="space-y-1">
                    <Label htmlFor="confirmPassword" className="text-sm">
                        Potwierdź hasło
                    </Label>
                    <div className="relative">
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={(e) => {
                                const value = e.target.value;
                                onInputChange("confirmPassword", value);
                                onConfirmPasswordChange(
                                    value,
                                    formData.password
                                );
                            }}
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
                                setShowConfirmPassword(!showConfirmPassword)
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

                <div className="mt-3">
                    <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 ease-in-out ${
                                !formData.password
                                    ? "bg-neutral-600"
                                    : passwordStrength < 25
                                    ? "bg-red-500"
                                    : passwordStrength < 50
                                    ? "bg-orange-500"
                                    : passwordStrength < 75
                                    ? "bg-yellow-500"
                                    : passwordStrength < 90
                                    ? "bg-green-500"
                                    : "bg-blue-500"
                            }`}
                            style={{
                                width: formData.password
                                    ? `${passwordStrength}%`
                                    : "0%",
                            }}
                        />
                    </div>

                    <div className="mt-3 p-2 bg-neutral-800 border border-neutral-600 rounded-md shadow-lg w-full">
                        <div className="flex justify-between items-center mb-1">
                            <div className="text-xs font-medium text-neutral-300">
                                Wymagania:
                            </div>
                            {formData.password ? (
                                <span
                                    className={`text-xs font-medium ${
                                        passwordStrength < 25
                                            ? "text-red-400"
                                            : passwordStrength < 50
                                            ? "text-orange-400"
                                            : passwordStrength < 75
                                            ? "text-yellow-400"
                                            : passwordStrength < 90
                                            ? "text-green-400"
                                            : "text-blue-400"
                                    }`}
                                >
                                    {getPasswordStrengthLabel(passwordStrength)}
                                </span>
                            ) : (
                                <span className="text-xs font-medium text-neutral-400">
                                    Wprowadź hasło
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                            {passwordRequirements.map((req, index) => (
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
                                        {req.met ? "✓" : "○"}
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
                            ))}

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
                    onVerify={onTurnstileVerify}
                    onError={onTurnstileError}
                />
                {fieldErrors.captcha && (
                    <div className="text-red-400 text-xs text-center">
                        {fieldErrors.captcha}
                    </div>
                )}
            </div>
        </>
    );
};
