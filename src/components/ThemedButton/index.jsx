import { cn } from '@/lib/utils';
import { LoaderCircle } from 'lucide-react';

const ThemedButton = ({ text, icon, loading, className, ...props }) => {
  return (
    <button
      className={cn(
        'w-full flex-content-center theme-bg rounded-md text-white cursor-pointer focus:outline-none',
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
