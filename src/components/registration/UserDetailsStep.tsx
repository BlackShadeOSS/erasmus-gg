import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UserDetailsStepProps {
    formData: { username: string; email: string };
    fieldErrors: { username: string; email: string };
    availabilityChecks: {
        username: { isChecking: boolean; isAvailable: boolean | null };
        email: { isChecking: boolean; isAvailable: boolean | null };
    };
    isLoading: boolean;
    onInputChange: (field: string, value: string) => void;
    onFieldValidation: (
        field: string,
        value: string,
        isAvailable?: boolean | null
    ) => void;
}

export const UserDetailsStep: React.FC<UserDetailsStepProps> = ({
    formData,
    fieldErrors,
    availabilityChecks,
    isLoading,
    onInputChange,
    onFieldValidation,
}) => {
    return (
        <>
            <div className="space-y-2">
                <Label htmlFor="username">Nazwa użytkownika</Label>
                <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => {
                        const value = e.target.value;
                        onInputChange("username", value);
                        onFieldValidation("username", value);
                    }}
                    onBlur={() =>
                        onFieldValidation(
                            "username",
                            formData.username,
                            availabilityChecks.username.isAvailable
                        )
                    }
                    placeholder="Wprowadź nazwę użytkownika"
                    required
                    disabled={isLoading}
                    className={
                        fieldErrors.username
                            ? "border-red-500"
                            : availabilityChecks.username.isAvailable === true
                            ? "border-green-500"
                            : availabilityChecks.username.isAvailable === false
                            ? "border-red-500"
                            : ""
                    }
                />
                {availabilityChecks.username.isChecking && (
                    <div className="text-amber-400 text-xs">
                        Sprawdzanie dostępności...
                    </div>
                )}
                {availabilityChecks.username.isAvailable === true && (
                    <div className="text-green-400 text-xs">
                        ✓ Nazwa użytkownika jest dostępna
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
                        onInputChange("email", value);
                        onFieldValidation("email", value);
                    }}
                    onBlur={() =>
                        onFieldValidation(
                            "email",
                            formData.email,
                            availabilityChecks.email.isAvailable
                        )
                    }
                    placeholder="Wprowadź adres email"
                    required
                    disabled={isLoading}
                    className={
                        fieldErrors.email
                            ? "border-red-500"
                            : availabilityChecks.email.isAvailable === true
                            ? "border-green-500"
                            : availabilityChecks.email.isAvailable === false
                            ? "border-red-500"
                            : ""
                    }
                />
                {availabilityChecks.email.isChecking && (
                    <div className="text-amber-400 text-xs">
                        Sprawdzanie dostępności...
                    </div>
                )}
                {availabilityChecks.email.isAvailable === true && (
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
    );
};
