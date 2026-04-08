import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginPopup({ isOpen, onClose }: LoginPopupProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#181818] rounded-2xl p-6 w-full max-w-sm border border-white/10 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-white mb-4">Login to see best taste of music for yourself</h2>
        <button
          onClick={() => {
            onClose();
            navigate('/login');
          }}
          className="w-full py-3 bg-green-500 text-black font-bold rounded-full hover:bg-green-400 transition-all"
        >
          OK
        </button>
      </div>
    </div>
  );
}
