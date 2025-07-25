import { useEffect } from 'react';

export const SecurityHeaders = () => {
  useEffect(() => {
    // Set security headers via meta tags
    const setMetaTag = (name: string, content: string) => {
      let metaTag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.name = name;
        document.head.appendChild(metaTag);
      }
      metaTag.content = content;
    };

    // Content Security Policy
    setMetaTag('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://www.google.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https: blob:; " +
      "connect-src 'self' https://moczxroojvdjevnorfiy.supabase.co wss://moczxroojvdjevnorfiy.supabase.co https://maps.googleapis.com; " +
      "frame-src 'self' https://www.google.com; " +
      "object-src 'none'; " +
      "base-uri 'self';"
    );

    // X-Frame-Options
    setMetaTag('X-Frame-Options', 'DENY');

    // X-Content-Type-Options
    setMetaTag('X-Content-Type-Options', 'nosniff');

    // Referrer Policy
    setMetaTag('referrer', 'strict-origin-when-cross-origin');

    // Permissions Policy
    setMetaTag('Permissions-Policy', 
      'geolocation=(self), ' +
      'camera=(), ' +
      'microphone=(), ' +
      'payment=(), ' +
      'usb=(), ' +
      'magnetometer=(), ' +
      'gyroscope=(), ' +
      'accelerometer=()'
    );

    // Remove sensitive headers from forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.setAttribute('autocomplete', 'off');
    });

    // Disable right-click context menu on sensitive elements
    const sensitiveElements = document.querySelectorAll('[data-sensitive]');
    sensitiveElements.forEach(element => {
      element.addEventListener('contextmenu', (e) => e.preventDefault());
    });

  }, []);

  return null; // This component only sets up security headers
};

// Helper function to sanitize user input before displaying
export const sanitizeForDisplay = (input: string): string => {
  if (!input) return '';
  
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

// Helper function to validate file uploads
export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
  ];

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }

  // Check file extension matches MIME type
  const extension = file.name.split('.').pop()?.toLowerCase();
  const mimeToExtension: { [key: string]: string[] } = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp'],
    'image/gif': ['gif'],
    'application/pdf': ['pdf'],
  };

  const validExtensions = mimeToExtension[file.type] || [];
  if (extension && !validExtensions.includes(extension)) {
    return { valid: false, error: 'File extension does not match file type' };
  }

  return { valid: true };
};