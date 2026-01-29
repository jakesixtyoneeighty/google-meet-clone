import React from 'react';
import clsx from 'clsx';

export interface TextFieldProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  label: React.ReactNode;
  placeholder: string;
  icon?: React.ReactNode;
}

const TextField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon,
  className,
  ...props
}: TextFieldProps) => {
  return (
    <div className="flex flex-col w-full">
      <label className="mb-2 block text-sm font-medium text-nj-grey-400">
        {label}
      </label>
      <div className="relative group">
        {icon && (
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-nj-grey-500 group-focus-within:text-nj-red transition-colors">
            {icon}
          </span>
        )}
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="off"
          className={clsx(
            'w-full h-12 bg-nj-grey-900/50 border border-nj-grey-800 rounded-lg py-2.5 pr-4 outline-none transition-all duration-200 text-white placeholder:text-nj-grey-600 focus:border-nj-red focus:bg-nj-grey-900 focus:ring-1 focus:ring-nj-red/20 disabled:opacity-50',
            icon ? 'pl-12' : 'pl-4',
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
};

export default TextField;
