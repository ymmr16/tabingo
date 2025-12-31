'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-xl p-8 w-[70vw] aspect-[4/3] relative flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 text-primary-500 text-4xl sm:text-6xl md:text-8xl hover:text-primary-600 z-10"
        >
          <FontAwesomeIcon icon={faCircleXmark} />
        </button>
        <div className="text-center space-y-4">
          <p className="text-lg sm:text-xl font-bold text-black">
            タップでミッションの詳細が表示されます。
          </p>
          <p className="text-lg sm:text-xl font-bold text-black">
            長押しでミッションクリア！
          </p>
        </div>
      </div>
    </div>
  );
}

