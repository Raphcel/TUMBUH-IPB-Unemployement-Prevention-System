import { useEffect } from 'react';

export function useCloseOnScroll(isOpen, close, ignoredRef) {
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return undefined;

    const closeDropdown = () => close();
    const handleScroll = (event) => {
      if (
        ignoredRef?.current &&
        event.target instanceof Node &&
        ignoredRef.current.contains(event.target)
      ) {
        return;
      }

      close();
    };

    window.addEventListener('resize', closeDropdown);
    window.addEventListener('scroll', handleScroll, true);
    document.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', closeDropdown);
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [close, ignoredRef, isOpen]);
}
