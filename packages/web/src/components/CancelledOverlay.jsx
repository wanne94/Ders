import React from 'react';

const CancelledOverlay = ({ 
  show = false, 
  text = 'OTKAZANO',
  variant = 'diagonal' // 'diagonal' or 'full'
}) => {
  if (!show) return null;

  if (variant === 'diagonal') {
    return (
      <div
        className="absolute inset-0 z-10 pointer-events-none overflow-hidden"
        role="img"
        aria-label={`Predavanje je ${text.toLowerCase()}`}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 w-[200%] h-12 bg-red-500 shadow-lg" />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 text-white font-extrabold text-base tracking-wider whitespace-nowrap drop-shadow-lg">
          {text}
        </span>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 pointer-events-none"
      role="img"
      aria-label={`Predavanje je ${text.toLowerCase()}`}
    >
      <h6 className="text-white font-extrabold text-center text-base sm:text-lg md:text-2xl drop-shadow-lg">
        {text}
      </h6>
    </div>
  );
};

export default CancelledOverlay;