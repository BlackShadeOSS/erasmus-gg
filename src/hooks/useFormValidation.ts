import { useState, useEffect } from 'react';

export interface ValidationRules {
  activationCode: (code: string) => string;
  username: (username: string, isAvailable?: boolean | null) => string;
  email: (email: string, isAvailable?: boolean | null) => string;
  password: (password: string) => string;
  confirmPassword: (confirmPassword: string, password: string) => string;
}

export const useFormValidation = () => {
  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    activationCode: '',
    captcha: '',
  });

  const polishErrorMessages: { [key: string]: string } = {
    'Username, password, and CAPTCHA are required': 'Nazwa użytkownika, hasło i CAPTCHA są wymagane',
    'CAPTCHA verification failed': 'Weryfikacja CAPTCHA nie powiodła się',
    'Captcha verification failed': 'Weryfikacja captcha nie powiodła się',
    'Passwords do not match': 'Hasła nie są zgodne',
    'Password must be at least 8 characters long': 'Hasło musi mieć co najmniej 8 znaków',
    'Password must contain at least one uppercase letter': 'Hasło musi zawierać co najmniej jedną wielką literę',
    'Password must contain at least one lowercase letter': 'Hasło musi zawierać co najmniej jedną małą literę',
    'Password must contain at least one number': 'Hasło musi zawierać co najmniej jedną cyfrę',
    'Password must contain at least one special character': 'Hasło musi zawierać co najmniej jeden znak specjalny',
    'Username already exists': 'Nazwa użytkownika już istnieje',
    'Email already exists': 'Email już istnieje',
    'Invalid activation code': 'Nieprawidłowy kod aktywacyjny',
    'Activation code expired': 'Kod aktywacyjny wygasł',
    'Activation code already used': 'Kod aktywacyjny już został użyty',
    'Registration failed': 'Rejestracja nie powiodła się',
    'An error occurred. Please try again.': 'Wystąpił błąd. Spróbuj ponownie.',
    'Please complete the captcha': 'Proszę uzupełnić captcha',
    'Internal server error': 'Wewnętrzny błąd serwera',
  };

  const validationRules: ValidationRules = {
    activationCode: (code: string) => {
      if (!code.trim()) return 'Kod aktywacyjny jest wymagany';
      if (code.trim().length !== 8) return 'Kod aktywacyjny musi mieć 8 znaków';
      return '';
    },

    username: (username: string, isAvailable?: boolean | null) => {
      if (!username.trim()) return 'Nazwa użytkownika jest wymagana';
      if (username.trim().length < 3) return 'Nazwa użytkownika musi mieć co najmniej 3 znaki';
      if (isAvailable === false) return 'Nazwa użytkownika już istnieje';
      return '';
    },

    email: (email: string, isAvailable?: boolean | null) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim()) return 'Email jest wymagany';
      if (!emailRegex.test(email)) return 'Nieprawidłowy format email';
      if (isAvailable === false) return 'Email już istnieje';
      return '';
    },

    password: (password: string) => {
      if (!password) return 'Hasło jest wymagane';
      if (password.length < 8) return 'Hasło musi mieć co najmniej 8 znaków';
      if (!/[a-z]/.test(password)) return 'Hasło musi zawierać co najmniej jedną małą literę';
      if (!/[A-Z]/.test(password)) return 'Hasło musi zawierać co najmniej jedną wielką literę';
      if (!/\d/.test(password)) return 'Hasło musi zawierać co najmniej jedną cyfrę';
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)) {
        return 'Hasło musi zawierać co najmniej jeden znak specjalny';
      }
      return '';
    },

    confirmPassword: (confirmPassword: string, password: string) => {
      if (!confirmPassword) return 'Potwierdzenie hasła jest wymagane';
      if (confirmPassword !== password) return 'Hasła nie są zgodne';
      return '';
    },
  };

  const validateField = (
    field: keyof ValidationRules,
    value: string,
    additionalParam?: any
  ) => {
    let errorMessage = '';
    if (field === 'username' || field === 'email') {
      errorMessage = validationRules[field](value, additionalParam);
    } else if (field === 'confirmPassword') {
      errorMessage = validationRules.confirmPassword(value, additionalParam);
    } else {
      errorMessage = validationRules[field](value);
    }
    setFieldErrors(prev => ({ ...prev, [field]: errorMessage }));
    return errorMessage === '';
  };

  const translateError = (errorMessage: string): string => {
    return polishErrorMessages[errorMessage] || errorMessage;
  };

  return {
    fieldErrors,
    setFieldErrors,
    validateField,
    translateError,
  };
};