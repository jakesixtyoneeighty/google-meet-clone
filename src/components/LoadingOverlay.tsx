import React from 'react';
import Image from 'next/image';

const LoadingOverlay = () => {
  return (
    <div className="z-50 fixed inset-0 flex flex-col items-center justify-center gap-8 bg-black">
      <div className="relative w-32 h-32 animate-pulse">
        <Image
          src="/branding/loadingstate.svg"
          alt="Loading NakedJake Live"
          fill
          className="object-contain"
        />
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="text-2xl font-bold tracking-tighter text-white uppercase italic">Initializing</div>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-nj-red rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-1.5 h-1.5 bg-nj-red rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1.5 h-1.5 bg-nj-red rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
