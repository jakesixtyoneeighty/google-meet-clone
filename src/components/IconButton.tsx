import { ReactNode } from 'react';
import clsx from 'clsx';
import { AlertCircle } from 'lucide-react';

export interface IconButtonProps {
  icon: ReactNode;
  onClick?: () => void;
  active?: boolean;
  variant?: 'primary' | 'secondary';
  alert?: boolean;
  title?: string;
  className?: string;
}

const IconButton = ({
  active = false,
  alert = false,
  icon,
  onClick,
  variant = 'primary',
  title,
  className,
}: IconButtonProps) => {
  const alertIcon = (
    <div className="absolute -top-1 -right-1 text-nj-red bg-black rounded-full shadow-red-glow">
      <AlertCircle size={16} fill="currentColor" className="text-white" />
    </div>
  );

  if (variant === 'primary')
    return (
      <button
        onClick={onClick}
        title={title}
        className={clsx(
          'relative h-10 w-10 rounded-lg inline-flex items-center justify-center transition-all duration-200 hover:bg-nj-grey-800 text-nj-grey-400 hover:text-white disabled:opacity-50',
          className
        )}
      >
        {icon}
        {alert && alertIcon}
      </button>
    );
  else
    return (
      <button
        onClick={onClick}
        title={title}
        className={clsx(
          'relative h-12 w-12 rounded-full inline-flex items-center justify-center transition-all duration-200 border border-nj-grey-700 active:scale-95 disabled:opacity-50',
          active
            ? 'bg-nj-red border-nj-red text-white hover:bg-red-700 shadow-red-glow'
            : 'bg-nj-grey-900/50 text-white hover:bg-nj-grey-800 hover:border-nj-grey-600',
          className
        )}
      >
        {icon}
        {alert && alertIcon}
      </button>
    );
};

export default IconButton;
