import { useState } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePlaylistModal({ isOpen, onClose }: CreatePlaylistModalProps) {
  const [name, setName] = useState('');
  const { createPlaylist } = usePlayerStore();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      createPlaylist(name.trim());
      setName('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-[#1f1f22] p-6 rounded-lg w-80">
        <h2 className="text-white text-lg font-bold mb-4">Create Playlist</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Playlist name"
          className="w-full p-2 mb-4 bg-[#0B0B0D] text-white rounded"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">Cancel</button>
          <button type="submit" className="bg-white text-[#0B0B0D] px-4 py-2 rounded font-bold">Create</button>
        </div>
      </form>
    </div>
  );
}
