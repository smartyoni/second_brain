import { useState } from 'react';

export function useDragSort<T extends { id: string }>(
  items: T[],
  onReorder: (newItems: T[]) => void
) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (id: string, e: React.DragEvent) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (targetId: string, e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const currentIndex = items.findIndex((item) => item.id === draggedId);
    const targetIndex = items.findIndex((item) => item.id === targetId);

    if (currentIndex === -1 || targetIndex === -1) {
      setDraggedId(null);
      return;
    }

    const updated = [...items];
    const [movedItem] = updated.splice(currentIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    onReorder(updated);
    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  return {
    draggedId,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  };
}
