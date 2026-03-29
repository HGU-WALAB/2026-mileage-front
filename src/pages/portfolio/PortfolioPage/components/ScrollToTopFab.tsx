import { navigationBarHeight } from '@/constants/layoutSize';
import { MAX_RESPONSIVE_WIDTH } from '@/constants/system';
import { palette } from '@/styles/palette';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useCallback } from 'react';

import { scrollMainToTop, useMainScrollPast } from '../hooks';

const SCROLL_THRESHOLD = 300;

const ScrollToTopFab = () => {
  const visible = useMainScrollPast(SCROLL_THRESHOLD);
  const isMobile = useMediaQuery(MAX_RESPONSIVE_WIDTH);

  const handleClick = useCallback(() => {
    scrollMainToTop();
  }, []);

  if (!visible) return null;

  return (
    <S.Wrapper $isMobile={isMobile}>
      <S.Fab type="button" aria-label="맨 위로" onClick={handleClick}>
        <KeyboardArrowUpIcon sx={{ fontSize: 26, color: palette.white }} />
      </S.Fab>
    </S.Wrapper>
  );
};

export default ScrollToTopFab;

const S = {
  Wrapper: styled('div')<{ $isMobile: boolean }>`
    position: fixed;
    right: 1rem;
    bottom: ${({ $isMobile }) =>
      $isMobile ? `calc(${navigationBarHeight}px + 1rem)` : '1.5rem'};
    z-index: 20;
  `,
  Fab: styled('button')`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    padding: 0;
    border: none;
    border-radius: 50%;
    background-color: ${palette.blue500};
    color: ${palette.white};
    cursor: pointer;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
    transition:
      background-color 0.15s ease,
      transform 0.15s ease;

    &:hover {
      background-color: ${palette.blue600};
    }

    &:focus-visible {
      outline: 2px solid ${palette.blue400};
      outline-offset: 2px;
    }
  `,
};
