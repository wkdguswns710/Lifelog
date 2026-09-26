"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 마우스/터치를 통일해서 다루는 드래그 정렬 훅(단일 목록용).
 * HTML5 네이티브 드래그(draggable/dragstart)는 모바일 터치에서 동작하지 않아서,
 * Pointer Events + elementFromPoint로 직접 구현했다.
 *
 * 사용법: 드래그 손잡이에 onPointerDown={(e) => startDrag(e, id)}를 걸고,
 * 각 행에는 data-drag-id={id}를 달아준다.
 */
export function usePointerReorder<T>(
  items: T[],
  getId: (item: T) => number,
  onReorder: (newItems: T[]) => void
) {
  const [dragId, setDragId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const dragStartYRef = useRef(0);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const endDrag = useCallback(() => {
    setDragId(null);
    setOverId(null);
  }, []);

  const startDrag = useCallback((e: React.PointerEvent, id: number) => {
    e.preventDefault();
    dragStartYRef.current = e.clientY;
    setDragOffsetY(0);
    setDragId(id);
  }, []);

  useEffect(() => {
    if (dragId === null) return;

    function handleMove(e: PointerEvent) {
      setDragOffsetY(e.clientY - dragStartYRef.current);
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const row = el?.closest<HTMLElement>("[data-drag-id]");
      const id = row ? Number(row.dataset.dragId) : null;
      setOverId(id !== null && !Number.isNaN(id) ? id : null);
    }

    function handleUp() {
      setOverId((currentOverId) => {
        if (currentOverId !== null && currentOverId !== dragId) {
          const list = itemsRef.current;
          const fromIndex = list.findIndex((item) => getId(item) === dragId);
          const toIndex = list.findIndex((item) => getId(item) === currentOverId);
          if (fromIndex !== -1 && toIndex !== -1) {
            const next = [...list];
            const [moved] = next.splice(fromIndex, 1);
            next.splice(toIndex, 0, moved);
            onReorder(next);
          }
        }
        return null;
      });
      setDragId(null);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", endDrag);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", endDrag);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragId, getId, onReorder, endDrag]);

  return { dragId, overId, dragOffsetY, startDrag };
}
