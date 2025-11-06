import { cn } from '@/lib/utils';
import { LoaderCircle } from 'lucide-react';

const ThemedButton = ({
  text,
  icon,
  loading,
  variant,
  className,
  ...props
}) => {
  let variantStyles = {
    primary: 'theme-bg text-white',
    outlined: 'theme-text',
  };

  return (
    <button
      className={cn(
        'flex-content-center p-2 rounded-md cursor-pointer focus:outline-none border-2 theme-border',
        variantStyles[variant] || variantStyles['primary'],
        className,
      )}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <>
          <LoaderCircle className="animate-spin" />
        </>
      ) : (
        <>
          {icon && <span className="mr-2 inline-block">{icon}</span>}
          {text}
        </>
      )}
    </button>
  );
};
export default ThemedButton;
