import * as React from 'react';

type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

export function useToast() {
  const toast = React.useCallback((props: ToastProps) => {
    // Simple console logging for now - you can enhance this with a proper toast UI later
    if (props.variant === 'destructive') {
      console.error(`${props.title}: ${props.description}`);
    } else {
      console.log(`${props.title}: ${props.description}`);
    }
  }, []);

  return { toast };
}
