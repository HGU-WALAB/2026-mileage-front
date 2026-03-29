import { putPortfolioSettings } from '../../apis/portfolio';
import type { DraggableSectionKey } from '../../constants/constants';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';

export function usePortfolioSectionOrderDragDrop(
  sectionOrder: DraggableSectionKey[],
  setSectionOrder: (
    v:
      | DraggableSectionKey[]
      | ((p: DraggableSectionKey[]) => DraggableSectionKey[]),
  ) => void,
) {
  const [draggedId, setDraggedId] = useState<DraggableSectionKey | null>(null);
  const [dragOverId, setDragOverId] = useState<DraggableSectionKey | null>(
    null,
  );

  const handleDragStart = useCallback((id: DraggableSectionKey) => {
    setDraggedId(id);
  }, []);

  const handleDragOver = useCallback(
    (_e: React.DragEvent<HTMLElement>, targetId: DraggableSectionKey) => {
      setDragOverId(targetId);
    },
    [],
  );

  const handleDragLeave = useCallback((_e: React.DragEvent<HTMLElement>) => {
    setDragOverId(null);
  }, []);

  const handleDrop = useCallback(
    (targetId: DraggableSectionKey) => {
      if (draggedId == null || draggedId === targetId) {
        setDraggedId(null);
        setDragOverId(null);
        return;
      }
      const fromIdx = sectionOrder.indexOf(draggedId);
      const toIdx = sectionOrder.indexOf(targetId);
      if (fromIdx === -1 || toIdx === -1) {
        setDraggedId(null);
        setDragOverId(null);
        return;
      }
      const next = [...sectionOrder];
      const [removed] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, removed);
      setSectionOrder(next);
      setDraggedId(null);
      setDragOverId(null);
      putPortfolioSettings({ section_order: next })
        .then(() => {
          toast.success('변경사항이 저장되었습니다.', {
            position: 'top-center',
          });
        })
        .catch(() => {
          toast.error('섹션 순서 저장에 실패했습니다.');
        });
    },
    [draggedId, sectionOrder, setSectionOrder],
  );

  return {
    dragOverId,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}
