import { MutableRefObject, useState } from 'react';
import clsx from 'clsx';
import { ChevronUp, ChevronDown, Settings } from 'lucide-react';
import useClickOutside from '../hooks/useClickOutside';

interface ToggleButtonContainerProps {
  children: React.ReactNode;
  deviceSelectors: React.ReactNode;
  icons?: React.ReactNode;
}

const ToggleButtonContainer = ({
  children,
  deviceSelectors,
  icons,
}: ToggleButtonContainerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const buttonRef = useClickOutside(() => {
    setIsOpen(false);
  }, true) as MutableRefObject<HTMLDivElement>;

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="flex items-center bg-nj-grey-900 rounded-full border border-nj-grey-800 shadow-premium relative">
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-4 z-50 animate-slide-up">
          <div className="glass-card min-w-[20rem] p-4 flex flex-col gap-4 shadow-red-glow">
            <div className="flex flex-col gap-3">
              {deviceSelectors}
            </div>
            <div className="flex items-center justify-between border-t border-nj-grey-800 pt-3">
              <div className="flex items-center gap-2">
                {icons}
                <div title="Settings" className="text-nj-grey-400 hover:text-white cursor-pointer p-2 rounded-lg hover:bg-nj-grey-800 transition-colors">
                  <Settings size={20} />
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-nj-grey-500">Settings</span>
            </div>
          </div>
        </div>
      )}
      
      <div
        ref={buttonRef}
        onClick={toggleMenu}
        className="h-full px-2 flex items-center justify-center cursor-pointer text-nj-grey-400 hover:text-white transition-colors"
      >
        {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </div>
      
      <div className="h-full">
        {children}
      </div>
    </div>
  );
};

export default ToggleButtonContainer;
