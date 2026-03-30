import { LoadingIcon } from '@/assets';
import { palette } from '@/styles/palette';

/**
 * 점검·인증 대기, lazy 라우트 청크 로드 등 전체 화면 로딩 UI (대시보드와 동일한 원형 인디케이터).
 */
const FullViewportLoading = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      inset: 0,
      backgroundColor: palette.grey100,
    }}
  >
    <LoadingIcon width={100} height={100} aria-hidden />
  </div>
);

export default FullViewportLoading;
