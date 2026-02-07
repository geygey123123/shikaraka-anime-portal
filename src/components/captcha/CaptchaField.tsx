import React, { useRef } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

interface CaptchaFieldProps {
  onVerify: (token: string) => void;
  onError?: (error: Error) => void;
  onExpire?: () => void;
}

/**
 * CaptchaField component integrates hCaptcha for bot protection
 * Used in registration flow to prevent automated account creation
 */
export const CaptchaField: React.FC<CaptchaFieldProps> = ({ 
  onVerify, 
  onError,
  onExpire 
}) => {
  const captchaRef = useRef<HCaptcha>(null);
  const siteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY;

  // Handle verification success
  const handleVerify = (token: string) => {
    onVerify(token);
  };

  // Handle verification error
  const handleError = (err: string) => {
    const error = new Error(`CAPTCHA verification failed: ${err}`);
    onError?.(error);
  };

  // Handle token expiration
  const handleExpire = () => {
    onExpire?.();
  };

  // Show error if site key is not configured
  if (!siteKey) {
    return (
      <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg">
        <p className="text-sm text-red-500">
          CAPTCHA не настроен. Пожалуйста, добавьте VITE_HCAPTCHA_SITE_KEY в переменные окружения.
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <HCaptcha
        ref={captchaRef}
        sitekey={siteKey}
        onVerify={handleVerify}
        onError={handleError}
        onExpire={handleExpire}
        theme="dark"
      />
    </div>
  );
};
