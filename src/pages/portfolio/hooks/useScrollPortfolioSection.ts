import { useCallback } from 'react';

import type { PortfolioPromptQualityCardKey } from '../constants/constants';
import { scrollPortfolioSectionIntoView } from '../PortfolioPage/utils/scrollPortfolioSection';

export function useScrollPortfolioSection() {
  return useCallback((key: PortfolioPromptQualityCardKey) => {
    scrollPortfolioSectionIntoView(key);
  }, []);
}

