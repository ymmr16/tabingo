'use client';

interface ErrorModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export default function ErrorModal({ isOpen, message, onClose }: ErrorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md mx-4">
        <h2 className="text-xl font-bold text-black mb-4">エラー</h2>
        <p className="text-black mb-6">{message}</p>
        <button
          onClick={onClose}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}

