import { useState } from 'react';

export interface PasswordRequirement {
  test: (p: string) => boolean;
  text: string;
  met: boolean;
}

export const usePasswordStrength = () => {
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>([
    { test: (p: string) => p.length >= 8, text: 'Co najmniej 8 znaków', met: false },
    { test: (p: string) => /[a-z]/.test(p), text: 'Jedna mała litera', met: false },
    { test: (p: string) => /[A-Z]/.test(p), text: 'Jedna wielka litera', met: false },
    { test: (p: string) => /\d/.test(p), text: 'Jedna cyfra', met: false },
    { test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(p), text: 'Jeden znak specjalny', met: false },
  ]);

  const calculatePasswordStrength = (password: string) => {
    const requirements = [
      { test: (p: string) => p.length >= 8, text: 'Co najmniej 8 znaków' },
      { test: (p: string) => /[a-z]/.test(p), text: 'Jedna mała litera' },
      { test: (p: string) => /[A-Z]/.test(p), text: 'Jedna wielka litera' },
      { test: (p: string) => /\d/.test(p), text: 'Jedna cyfra' },
      { test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(p), text: 'Jeden znak specjalny' },
    ];

    const passwordReqs = requirements.map(req => ({
      ...req,
      met: password ? req.test(password) : false,
    }));

    const metCount = passwordReqs.filter(req => req.met).length;
    let strengthPercentage = password ? Math.round((metCount / requirements.length) * 100) : 0;

    // Bonus calculations
    if (password) {
      if (password.length > 8) {
        const lengthBonus = Math.min(20, (password.length - 8) * 2);
        strengthPercentage += lengthBonus;
      }

      const varietyTypes = [
        /[a-z]/.test(password),
        /[A-Z]/.test(password),
        /\d/.test(password),
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password),
      ].filter(Boolean).length;

      if (varietyTypes >= 3 && password.length >= 10) {
        strengthPercentage += 10;
      }

      strengthPercentage = Math.min(100, strengthPercentage);
    }

    setPasswordRequirements(passwordReqs);
    setPasswordStrength(strengthPercentage);

    return { requirements: passwordReqs, strengthPercentage };
  };

  const getPasswordStrengthLabel = (strength: number): string => {
    if (strength < 25) return 'Bardzo słabe';
    if (strength < 50) return 'Słabe';
    if (strength < 75) return 'Dobre';
    if (strength < 90) return 'Silne';
    return 'Bardzo silne';
  };

  return {
    passwordStrength,
    passwordRequirements,
    calculatePasswordStrength,
    getPasswordStrengthLabel,
  };
};