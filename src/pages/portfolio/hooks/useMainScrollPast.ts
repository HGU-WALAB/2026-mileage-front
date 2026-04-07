import { useEffect, useState } from 'react';

function getScrollMain(): HTMLElement | null {
  return document.querySelector('main');
}

/** 레이아웃 `<main>` 스크롤이 threshold(px) 이상인지 */
export function useMainScrollPast(thresholdPx: number) {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const main = getScrollMain();
    if (!main) return;
    const onScroll = () => {
      setPast(main.scrollTop >= thresholdPx);
    };
    onScroll();
    main.addEventListener('scroll', onScroll, { passive: true });
    return () => main.removeEventListener('scroll', onScroll);
  }, [thresholdPx]);

  return past;
}

export function scrollMainToTop() {
  getScrollMain()?.scrollTo({ top: 0, behavior: 'smooth' });
}

