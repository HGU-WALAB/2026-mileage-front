import { LoadingIcon } from '@/assets';
import { palette } from '@/styles/palette';

/**
 * Drawer·헤더·하단 네비는 그대로 두고 `<main>` 안 라우트 영역만 채우는 로딩 UI.
 */
const MainContentLoading = () => (
  <div
    style={{
      flex: '1 1 0',
      minHeight: 0,
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      backgroundColor: palette.grey100,
    }}
  >
    <LoadingIcon width={80} height={80} aria-hidden />
  </div>
);

export default MainContentLoading;
