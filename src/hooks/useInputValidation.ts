import { useState, useCallback } from 'react';

interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

interface UseInputValidationReturn {
  value: string;
  error: string | null;
  isValid: boolean;
  setValue: (value: string) => void;
  validate: () => boolean;
  reset: () => void;
}

export const useInputValidation = (
  initialValue: string = '',
  rules: ValidationRule[] = []
): UseInputValidationReturn => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback((): boolean => {
    // Sanitize input first
    const sanitizedValue = sanitizeInput(value);
    setValue(sanitizedValue);

    for (const rule of rules) {
      if (!rule.test(sanitizedValue)) {
        setError(rule.message);
        return false;
      }
    }
    setError(null);
    return true;
  }, [value, rules]);

  const handleSetValue = useCallback((newValue: string) => {
    setValue(newValue);
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
  }, [initialValue]);

  return {
    value,
    error,
    isValid: error === null && value !== '',
    setValue: handleSetValue,
    validate,
    reset,
  };
};

// Input sanitization function
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove potential XSS patterns
  let sanitized = input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/onload=/gi, '')
    .replace(/onclick=/gi, '')
    .replace(/onerror=/gi, '')
    .replace(/on\w+=/gi, ''); // Remove any on* event handlers

  // Trim and limit length
  sanitized = sanitized.trim();
  
  return sanitized;
};

// Common validation rules
export const validationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    test: (value) => value.trim().length > 0,
    message,
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    test: (value) => /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value),
    message,
  }),

  minLength: (length: number, message?: string): ValidationRule => ({
    test: (value) => value.length >= length,
    message: message || `Must be at least ${length} characters`,
  }),

  maxLength: (length: number, message?: string): ValidationRule => ({
    test: (value) => value.length <= length,
    message: message || `Must be no more than ${length} characters`,
  }),

  phone: (message = 'Please enter a valid phone number'): ValidationRule => ({
    test: (value) => /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, '')),
    message,
  }),

  url: (message = 'Please enter a valid URL'): ValidationRule => ({
    test: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),

  noHtml: (message = 'HTML tags are not allowed'): ValidationRule => ({
    test: (value) => !/<[^>]*>/.test(value),
    message,
  }),

  rating: (message = 'Rating must be between 1 and 5'): ValidationRule => ({
    test: (value) => {
      const num = parseInt(value);
      return num >= 1 && num <= 5;
    },
    message,
  }),
};