import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import type { FormContextType } from '../types';

const FormContext = createContext<FormContextType | undefined>(undefined);

interface FormProviderProps {
  children: ReactNode;
  initialValues?: Record<string, unknown>;
}

export function FormProvider({ children, initialValues = {} }: FormProviderProps) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setFieldValue = useCallback((name: string, value: unknown) => {
    // Security: Prevent prototype pollution attacks
    if (name === '__proto__' || name === 'constructor' || name === 'prototype') {
      console.warn(`[sir-forms] Ignoring dangerous field name: ${name}`);
      return;
    }

    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear field error when value changes
    setErrors((prev) => {
      if (prev[name]) {
        const next = { ...prev };
        delete next[name];
        return next;
      }
      return prev;
    });
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  const value: FormContextType = useMemo(
    () => ({
      isSubmitting,
      errors,
      values,
      setFieldValue,
      setErrors,
      setIsSubmitting,
      reset,
    }),
    [isSubmitting, errors, values, setFieldValue, reset],
  );

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

export function useForm(): FormContextType {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within FormProvider');
  }
  return context;
}
