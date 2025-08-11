import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Turnstile, { TurnstileRef } from "@/components/ui/turnstile";

interface ActivationCodeStepProps {
    formData: { activationCode: string; turnstileToken: string };
    fieldErrors: { activationCode: string; captcha: string };
    isLoading: boolean;
    turnstileRef: React.RefObject<TurnstileRef>;
    onInputChange: (field: string, value: string) => void;
    onFieldValidation: (field: string, value: string) => void;
    onTurnstileVerify: (token: string) => void;
    onTurnstileError: () => void;
}

export const ActivationCodeStep: React.FC<ActivationCodeStepProps> = ({
    formData,
    fieldErrors,
    isLoading,
    turnstileRef,
    onInputChange,
    onFieldValidation,
    onTurnstileVerify,
    onTurnstileError,
}) => {
    return (
        <>
            <div className="space-y-2">
                <Label htmlFor="activationCode">Kod aktywacyjny</Label>
                <Input
                    id="activationCode"
                    type="text"
                    value={formData.activationCode}
                    onChange={(e) => {
                        const value = e.target.value;
                        onInputChange("activationCode", value);
                        if (value.trim().length === 8) {
                            onFieldValidation("activationCode", value);
                        }
                    }}
                    onBlur={() =>
                        onFieldValidation(
                            "activationCode",
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
                            : formData.activationCode.trim().length === 8 &&
                              !fieldErrors.activationCode
                            ? "border-green-500"
                            : ""
                    }
                />
                {formData.activationCode.trim().length === 8 &&
                    !fieldErrors.activationCode && (
                        <div className="text-green-400 text-xs">
                            ✓ Kod aktywacyjny wprowadzony poprawnie
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
                    onVerify={onTurnstileVerify}
                    onError={onTurnstileError}
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
    );
};
