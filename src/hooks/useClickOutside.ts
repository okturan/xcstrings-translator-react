import { useEffect, RefObject } from 'react';

interface UseClickOutsideOptions {
  onClickOutside: () => void;
  enabled?: boolean;
  handleScroll?: boolean;
}

export const useClickOutside = (
  ref: RefObject<HTMLElement>,
  { onClickOutside, enabled = true, handleScroll = false }: UseClickOutsideOptions
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside();
      }
    };

    const handleScrollEvent = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        if (rect.top < 0) {
          onClickOutside();
        }
      }
    };

    document.addEventListener('mousedown', handleClick);
    if (handleScroll) {
      window.addEventListener('scroll', handleScrollEvent);
    }

    return () => {
      document.removeEventListener('mousedown', handleClick);
      if (handleScroll) {
        window.removeEventListener('scroll', handleScrollEvent);
      }
    };
  }, [ref, onClickOutside, enabled, handleScroll]);
};
