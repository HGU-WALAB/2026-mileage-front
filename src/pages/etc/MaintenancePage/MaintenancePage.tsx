import { MaintenanceStatus } from '@/types/maintenance';
import { Typography, useTheme } from '@mui/material';
import { Flex } from '@/components';
import { getOpacityColor } from '@/utils/getOpacityColor';
import { BackgroundImg } from '@/assets';

interface MaintenancePageProps {
  status: MaintenanceStatus;
}


const MaintenancePage = ({ status }: MaintenancePageProps) => {
  const theme = useTheme();
  const year = new Date().getFullYear();

  // 서버에서 받은 데이터 로그 출력
  console.log('점검 페이지 표시 데이터:', {
    maintenanceMode: status.maintenanceMode,
    message: status.message,
    estimatedTime: status.estimatedTime,
    isAllowedUser: status.isAllowedUser,
  });

  return (
    <Flex.Column
      justify="center"
      align="center"
      width="100vw"
      height="100vh"
      style={{
        backgroundImage: `url(${BackgroundImg})`,
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backdropFilter: 'blur(1.875rem)',
        backgroundColor: getOpacityColor(theme.palette.white, 0.1),
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 배경 장식 요소들 */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: `linear-gradient(45deg, ${getOpacityColor(
            theme.palette.white,
            0.2,
          )}, ${getOpacityColor(theme.palette.primary.light, 0.3)})`,
          backdropFilter: 'blur(10px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: `linear-gradient(45deg, ${getOpacityColor(
            theme.palette.secondary.light,
            0.2,
          )}, ${getOpacityColor(theme.palette.white, 0.3)})`,
          backdropFilter: 'blur(10px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '20%',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: `linear-gradient(45deg, ${getOpacityColor(
            theme.palette.primary.main,
            0.2,
          )}, ${getOpacityColor(theme.palette.secondary.main, 0.3)})`,
          backdropFilter: 'blur(10px)',
        }}
      />

      {/* 메인 컨텐츠 카드 (커스텀 UI) */}
      <Flex.Column
        align="center"
        justify="center"
        padding="1.75rem"
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '980px',
        }}
      >
        <section
          role="region"
          aria-label="시스템 점검 안내"
          style={{
            width: '100%',
            borderRadius: 22,
            backgroundColor: theme.palette.white,
            border: `1px solid ${getOpacityColor(theme.palette.grey300, 0.8)}`,
            boxShadow: `0 18px 50px ${getOpacityColor(theme.palette.black, 0.18)}`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* subtle moving highlight */}
          <div
            style={{
              position: 'absolute',
              inset: -2,
              background: `radial-gradient(700px 220px at 20% 0%, ${getOpacityColor(
                theme.palette.primary.light,
                0.18,
              )}, transparent 55%), radial-gradient(700px 220px at 80% 0%, ${getOpacityColor(
                theme.palette.secondary.light,
                0.18,
              )}, transparent 55%)`,
              filter: 'blur(10px)',
              opacity: 0.9,
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: '1.1fr 0.9fr',
              gap: 22,
              padding: 34,
            }}
          >
            {/* 왼쪽 영역 */}
            <div>
              <div
                aria-label="안내 배지"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 999,
                  border: `1px solid ${getOpacityColor(theme.palette.primary.main, 0.18)}`,
                  background: getOpacityColor(theme.palette.primary.light, 0.08),
                  fontSize: 14,
                  color: theme.palette.text.secondary,
                  letterSpacing: 0.2,
                  width: 'fit-content',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="maintenance-badge" x1="3" y1="12" x2="21" y2="12" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#2F6BFF" />
                      <stop offset="1" stopColor="#29D3FF" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M3 12c2.4 0 2.4-6 4.8-6S10.2 18 12.6 18 15 6 17.4 6 19.8 12 21 12"
                    stroke="url(#maintenance-badge)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                시스템 점검 안내
              </div>

              <h1
                style={{
                  margin: '14px 0 10px',
                  fontSize: 'clamp(24px, 3.2vw, 38px)',
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  color: theme.palette.text.primary,
                }}
              >
                한동대 SW마일리지 장학금 신청 시스템 일시 중단
              </h1>

              <p
                style={{
                  margin: '10px 0 0',
                  fontSize: 'clamp(15px, 1.6vw, 17px)',
                  lineHeight: 1.75,
                  color: theme.palette.text.secondary,
                  whiteSpace: 'pre-line',
                }}
              >
                한동대 SW마일리지 장학금 신청기간 전까지{'\n'}
                시스템 점검 및 2025년 2학기 데이터 업데이트를 위하여{'\n'}
                신청 시스템을 일시 중단합니다.
              </p>

              <div
                aria-label="추가 정보"
                style={{
                  marginTop: 18,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 12px',
                    borderRadius: 14,
                    border: `1px solid ${getOpacityColor(theme.palette.grey300, 0.9)}`,
                    background: theme.palette.grey100,
                    color: theme.palette.text.secondary,
                    fontSize: 13,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="#29D3FF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  데이터 업데이트 진행 중
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 12px',
                    borderRadius: 14,
                    border: `1px solid ${getOpacityColor(theme.palette.grey300, 0.9)}`,
                    background: theme.palette.grey100,
                    color: theme.palette.text.secondary,
                    fontSize: 13,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="3" stroke="#29D3FF" strokeWidth="2" />
                    <path
                      d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1l2.1-2.1M17 7l2.1-2.1"
                      stroke="#29D3FF"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  시스템 안정화 점검
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 12px',
                    borderRadius: 14,
                    border: `1px solid ${getOpacityColor(theme.palette.grey300, 0.9)}`,
                    background: theme.palette.grey100,
                    color: theme.palette.text.secondary,
                    fontSize: 13,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" stroke="#29D3FF" strokeWidth="2" />
                    <path
                      d="M12 7v5l3 2"
                      stroke="#29D3FF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  신청기간 전 재오픈 예정
                </div>
              </div>
            </div>

            {/* 오른쪽 영역 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 8,
              }}
            >
              <div
                aria-label="상태 패널"
                style={{
                  width: '100%',
                  maxWidth: 360,
                  borderRadius: 20,
                  border: `1px solid ${getOpacityColor(theme.palette.grey300, 0.9)}`,
                  backgroundColor: theme.palette.grey100,
                  padding: '18px 16px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: '-40%',
                    background:
                      'conic-gradient(from 210deg, rgba(47,107,255,0) 0deg, rgba(47,107,255,0.18) 70deg, rgba(41,211,255,0.16) 140deg, rgba(123,97,255,0.10) 210deg, rgba(47,107,255,0) 360deg)',
                    filter: 'blur(22px)',
                    opacity: 0.65,
                    pointerEvents: 'none',
                  }}
                />

                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      width: 140,
                      height: 140,
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
                      <defs>
                        <linearGradient id="maintenance-ring" x1="22" y1="18" x2="118" y2="122" gradientUnits="userSpaceOnUse">
                          <stop stopColor={theme.palette.primary.main} stopOpacity="0.95" />
                          <stop offset="1" stopColor={theme.palette.secondary.main} stopOpacity="0.85" />
                        </linearGradient>
                        <linearGradient id="maintenance-screen" x1="40" y1="54" x2="102" y2="98" gradientUnits="userSpaceOnUse">
                          <stop stopColor={getOpacityColor(theme.palette.white, 0.9)} />
                          <stop offset="1" stopColor={getOpacityColor(theme.palette.grey100, 1)} />
                        </linearGradient>
                        <filter id="maintenance-soft" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="6" />
                        </filter>
                      </defs>

                      <circle cx="38" cy="44" r="18" fill={theme.palette.secondary.light} opacity="0.25" filter="url(#maintenance-soft)" />
                      <circle cx="106" cy="92" r="22" fill={theme.palette.primary.main} opacity="0.2" filter="url(#maintenance-soft)" />

                      <circle cx="70" cy="70" r="48" stroke="url(#maintenance-ring)" strokeWidth="6" opacity="0.95" />
                      <circle cx="70" cy="70" r="35" stroke="rgba(255,255,255,.18)" strokeWidth="2" />

                      <rect
                        x="42"
                        y="50"
                        width="56"
                        height="36"
                        rx="10"
                        fill="url(#maintenance-screen)"
                        stroke="rgba(255,255,255,.20)"
                      />
                      <rect
                        x="34"
                        y="88"
                        width="72"
                        height="10"
                        rx="5"
                        fill="rgba(255,255,255,.10)"
                        stroke="rgba(255,255,255,.14)"
                      />

                      <path d="M70 78V62" stroke={theme.palette.secondary.main} strokeWidth="3" strokeLinecap="round" />
                      <path
                        d="M64 66l6-6 6 6"
                        stroke={theme.palette.secondary.main}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      <circle cx="52" cy="60" r="2" fill={getOpacityColor(theme.palette.grey400, 0.9)} />
                      <circle cx="88" cy="74" r="2" fill={getOpacityColor(theme.palette.grey400, 0.9)} />
                    </svg>
                  </div>

                  {/* 점검 메시지 */}
                  <Typography
                    component="p"
                    style={{
                      fontSize: 14,
                      color: theme.palette.text.primary,
                      lineHeight: 1.7,
                      margin: 0,
                      fontWeight: 500,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {status.message || '🔨 시스템 점검 중입니다.\n잠시만 기다려주세요.'}
                  </Typography>

                  {/* 예상 완료 시간 */}
                  <Flex.Row
                    align="center"
                    justify="center"
                    gap="0.5rem"
                    style={{
                      marginTop: '0.75rem',
                      padding: '0.55rem 1.2rem',
                      borderRadius: 999,
                      backgroundColor: getOpacityColor(theme.palette.primary.light, 0.12),
                      border: `1px solid ${getOpacityColor(theme.palette.primary.main, 0.25)}`,
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        fontSize: 16,
                      }}
                    >
                      ⏰
                    </span>
                    <Typography
                      component="span"
                      style={{
                        fontSize: 13,
                        color: theme.palette.primary.dark,
                        fontWeight: 600,
                      }}
                    >
                      예상 완료 시간: {status.estimatedTime || '30분 후'}
                    </Typography>
                  </Flex.Row>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      padding: '10px 12px',
                      borderRadius: 14,
                      border: `1px solid ${getOpacityColor(theme.palette.grey300, 0.9)}`,
                      background: theme.palette.grey100,
                      color: theme.palette.text.secondary,
                      fontSize: 12,
                      width: '100%',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" stroke={getOpacityColor(theme.palette.grey400, 0.9)} strokeWidth="2" />
                      <path d="M12 10v7" stroke={theme.palette.secondary.main} strokeWidth="2" strokeLinecap="round" />
                      <path d="M12 7.2h.01" stroke={theme.palette.secondary.main} strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    <span
                      style={{
                        flex: 1,
                        textAlign: 'left',
                        lineHeight: 1.5,
                        wordBreak: 'keep-all',
                      }}
                    >
                      문의: 히즈넷-AI컴퓨터전자 공지사항의 SW중심대 마일리지 공지를 확인해주세요
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 하단 푸터 (새로고침 문구 제거) */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              padding: '14px 20px 18px',
              borderTop: `1px solid ${getOpacityColor(theme.palette.grey200, 1)}`,
              color: theme.palette.text.secondary,
              fontSize: 12,
            }}
          >
            <div>© {year} Handong Global University · SW중심대학 사업단</div>
          </div>
        </section>
      </Flex.Column>

      {/* 하단 장식 */}
      <div
        style={{
          position: 'absolute',
          bottom: '-50px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${getOpacityColor(
            theme.palette.white,
            0.1,
          )}, transparent)`,
          backdropFilter: 'blur(10px)',
        }}
      />
    </Flex.Column>
  );
};

export default MaintenancePage;
