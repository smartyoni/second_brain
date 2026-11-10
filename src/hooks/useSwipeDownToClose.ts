import { useState, useRef, useCallback } from 'react';

interface UseSwipeDownToCloseOptions {
  onClose?: () => void;
  threshold?: number;
  velocityThreshold?: number;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

export function useSwipeDownToClose({
  onClose,
  threshold = 60,
  velocityThreshold = 0.4,
  scrollContainerRef,
}: UseSwipeDownToCloseOptions) {
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const startYRef = useRef<number>(0);
  const startXRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const isEligibleSwipeRef = useRef<boolean>(false);
  const isHeaderDragRef = useRef<boolean>(false);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, isHeader = false) => {
      if (!onClose || isClosing) return;
      const touch = e.touches[0];
      startYRef.current = touch.clientY;
      startXRef.current = touch.clientX;
      startTimeRef.current = Date.now();
      isHeaderDragRef.current = isHeader;

      if (isHeader) {
        isEligibleSwipeRef.current = true;
      } else if (scrollContainerRef?.current) {
        // 리스트 스크롤이 최상단에 있을 때만 스와이프 다운 허용
        isEligibleSwipeRef.current = scrollContainerRef.current.scrollTop <= 2;
      } else {
        isEligibleSwipeRef.current = true;
      }
    },
    [onClose, isClosing, scrollContainerRef]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isEligibleSwipeRef.current || isClosing) return;
      const touch = e.touches[0];
      const deltaY = touch.clientY - startYRef.current;
      const deltaX = touch.clientX - startXRef.current;

      // 리스트 영역 드래그 중 스크롤이 아래로 내려가면 스와이프 취소
      if (!isHeaderDragRef.current && scrollContainerRef?.current && scrollContainerRef.current.scrollTop > 2) {
        isEligibleSwipeRef.current = false;
        setTranslateY(0);
        setIsDragging(false);
        return;
      }

      // 위로 당기는 것은 무시
      if (deltaY <= 0) {
        if (translateY !== 0) {
          setTranslateY(0);
          setIsDragging(false);
        }
        return;
      }

      // 수평 이동(좌우 스와이프)이 더 큰 경우 스와이프 무시
      if (Math.abs(deltaX) > Math.abs(deltaY) && !isDragging) {
        return;
      }

      setIsDragging(true);
      setTranslateY(deltaY);
    },
    [isClosing, isDragging, scrollContainerRef, translateY]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isEligibleSwipeRef.current || isClosing) {
        setIsDragging(false);
        setTranslateY(0);
        return;
      }

      const touch = e.changedTouches[0];
      const deltaY = touch.clientY - startYRef.current;
      const elapsedTime = Math.max(Date.now() - startTimeRef.current, 1);
      const velocity = deltaY / elapsedTime; // px per ms

      const shouldClose = deltaY > threshold || (deltaY > 30 && velocity > velocityThreshold);

      if (shouldClose && onClose) {
        setIsClosing(true);
        // 아래로 완전히 떨어지는 애니메이션 후 닫기
        setTranslateY(window.innerHeight || 600);
        setTimeout(() => {
          onClose();
          setIsClosing(false);
          setTranslateY(0);
          setIsDragging(false);
        }, 180);
      } else {
        // 복귀 애니메이션
        setTranslateY(0);
        setIsDragging(false);
      }

      isEligibleSwipeRef.current = false;
      isHeaderDragRef.current = false;
    },
    [isClosing, onClose, threshold, velocityThreshold]
  );

  return {
    translateY,
    isDragging,
    isClosing,
    headerTouchHandlers: {
      onTouchStart: (e: React.TouchEvent) => handleTouchStart(e, true),
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchEnd,
    },
    contentTouchHandlers: {
      onTouchStart: (e: React.TouchEvent) => handleTouchStart(e, false),
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchEnd,
    },
  };
}
