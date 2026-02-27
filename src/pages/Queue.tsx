import React from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import TrackList from '../components/TrackList';
import { ListMusic, GripVertical, Trash2 } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Track } from '../types';
import { formatTime, cn } from '../utils/helpers';

interface SortableTrackItemProps extends React.HTMLAttributes<HTMLDivElement> {
  key?: string | number;
  track: Track;
  index: number;
  onRemove: (index: number) => void;
}

function SortableTrackItem({ track, index, onRemove, ...props }: SortableTrackItemProps) {
  const { playTrack, queue } = usePlayerStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-4 px-4 py-2 text-sm text-gray-400 hover:bg-white/10 rounded-md transition-colors cursor-pointer",
        isDragging && "bg-white/20 shadow-xl opacity-80"
      )}
      onClick={() => playTrack(track, queue)}
      {...props}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="w-8 flex justify-center cursor-grab active:cursor-grabbing text-gray-500 hover:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="flex-1 flex items-center gap-3 overflow-hidden">
        <img src={track.artwork} alt={track.title} className="w-10 h-10 object-cover" loading="lazy" />
        <div className="truncate">
          <div className="truncate text-base text-white">{track.title}</div>
          <div className="truncate text-sm group-hover:text-white transition-colors">{track.artist}</div>
        </div>
      </div>

      <div className="w-10 text-right">{formatTime(track.duration)}</div>
      
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 p-2"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function Queue() {
  const { queue, currentTrack, reorderQueue, removeFromQueue } = usePlayerStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = queue.findIndex((t) => t.id === active.id);
      const newIndex = queue.findIndex((t) => t.id === over.id);
      reorderQueue(oldIndex, newIndex);
    }
  };

  return (
    <div className="p-6 pb-24 h-full overflow-y-auto bg-[#121212]">
      <h1 className="text-3xl font-bold text-white mb-8">Queue</h1>

      {currentTrack && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Now Playing</h2>
          <TrackList tracks={[currentTrack]} showHeader={false} />
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-white mb-4">Next Up</h2>
        {queue.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={queue.map(t => t.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1">
                {queue.map((track, index) => (
                  <SortableTrackItem 
                    key={`${track.id}-${index}`} 
                    track={track} 
                    index={index} 
                    onRemove={removeFromQueue} 
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center text-gray-400 mt-10">
            <ListMusic className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p>No tracks in queue.</p>
          </div>
        )}
      </div>
    </div>
  );
}

