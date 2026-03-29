import {
  PORTFOLIO_SECTION_ELEMENT_ID,
  type PortfolioPromptQualityCardKey,
} from '../../constants/constants';

export function scrollPortfolioSectionIntoView(
  key: PortfolioPromptQualityCardKey,
) {
  document
    .getElementById(PORTFOLIO_SECTION_ELEMENT_ID[key])
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
