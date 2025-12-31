'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';

interface ActivityModalProps {
  isOpen: boolean;
  activityName: string;
  isCompleted: boolean;
  onClose: () => void;
}

export default function ActivityModal({ isOpen, activityName, isCompleted, onClose }: ActivityModalProps) {
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
        <div className="text-center">
          {isCompleted && (
            <div 
              className="mx-auto mb-4 w-32 h-32 opacity-80"
              style={{
                backgroundImage: 'url(/tree.svg)',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: 'contain'
              }}
            />
          )}
          <h2 className="text-2xl font-bold text-black mb-4 break-words">
            {activityName}
          </h2>
          {isCompleted && (
            <p className="text-primary-600 font-semibold">クリア済み</p>
          )}
        </div>
      </div>
    </div>
  );
}

