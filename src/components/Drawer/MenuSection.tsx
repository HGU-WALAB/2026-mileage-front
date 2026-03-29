import {
  DRAWER_MENU_ENTRIES,
  isRouteActiveForNav,
  type DrawerMenuEntry,
} from '@/constants/drawerMenu';
import { getOpacityColor } from '@/utils/getOpacityColor';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import {
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

function isGroup(entry: DrawerMenuEntry): entry is Extract<
  DrawerMenuEntry,
  { kind: 'group' }
> {
  return entry.kind === 'group';
}

const MenuSection = () => {
  const theme = useTheme();
  const location = useLocation();
  /**
   * 그룹 펼침 override. 없으면 `groupActive`를 기본값으로 사용.
   * 서브 경로에서도 헤더 클릭으로 접었다 펼 수 있음.
   */
  const [groupExpandedOverride, setGroupExpandedOverride] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    setGroupExpandedOverride(prev => {
      const next = { ...prev };
      let changed = false;
      for (const entry of DRAWER_MENU_ENTRIES) {
        if (
          isGroup(entry) &&
          !entry.isGroupActive(location.pathname) &&
          next[entry.id] !== undefined
        ) {
          delete next[entry.id];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [location.pathname]);

  const listButtonSx = {
    borderRadius: '.5rem',
    '&:hover': {
      backgroundColor: getOpacityColor(theme.palette.white, 0.2),
    },
    '&.Mui-selected': {
      backgroundColor: getOpacityColor(theme.palette.white, 0.2),
      boxShadow: `0 .25rem 1.25rem ${getOpacityColor(theme.palette.black, 0.2)}`,
      '&:hover': {
        backgroundColor: getOpacityColor(theme.palette.white, 0.4),
      },
    },
  } as const;

  return (
    <List
      disablePadding
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        width: '100%',
        flexShrink: 0,
      }}
    >
      {DRAWER_MENU_ENTRIES.map(entry => {
        if (isGroup(entry)) {
          const groupActive = entry.isGroupActive(location.pathname);
          const expanded =
            groupExpandedOverride[entry.id] !== undefined
              ? groupExpandedOverride[entry.id]
              : groupActive;

          return (
            <ListItem
              key={entry.id}
              disablePadding
              sx={{
                display: 'block',
                color: theme.palette.white,
              }}
            >
              <ListItemButton
                selected={groupActive}
                onClick={() => {
                  setGroupExpandedOverride(prev => ({
                    ...prev,
                    [entry.id]: !expanded,
                  }));
                }}
                sx={{
                  ...listButtonSx,
                  pr: 1,
                }}
              >
                <ListItemIcon style={{ minWidth: '2.5rem' }}>
                  <entry.icon style={{ color: theme.palette.white }} />
                </ListItemIcon>
                <ListItemText
                  primary={entry.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      ...theme.typography.body1,
                      color: theme.palette.white,
                    },
                  }}
                />
                <ExpandMoreIcon
                  sx={{
                    color: theme.palette.white,
                    transition: theme.transitions.create('transform', {
                      duration: theme.transitions.duration.shortest,
                    }),
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </ListItemButton>
              <Collapse in={expanded} timeout="auto" unmountOnExit>
                <List
                  component="div"
                  disablePadding
                  dense
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    width: '100%',
                    boxSizing: 'border-box',
                    mt: '0.25rem',
                    pl: '0.5rem',
                    ml: '1.15rem',
                    borderLeft: `2px solid ${getOpacityColor(theme.palette.white, 0.25)}`,
                  }}
                >
                  {entry.children.map(child => {
                    const childSelected = isRouteActiveForNav(
                      location.pathname,
                      child.route,
                    );
                    return (
                      <ListItem
                        key={child.id}
                        disablePadding
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'stretch',
                          color: theme.palette.white,
                        }}
                      >
                        <ListItemButton
                          component={RouterLink}
                          to={child.route}
                          selected={childSelected}
                          sx={{
                            ...listButtonSx,
                            flex: 1,
                            py: 0.75,
                            pl: '0.85rem',
                            minHeight: 40,
                          }}
                        >
                          <ListItemText
                            primary={child.text}
                            sx={{
                              '& .MuiListItemText-primary': {
                                ...theme.typography.body2,
                                fontWeight: childSelected ? 600 : 400,
                                color: getOpacityColor(
                                  theme.palette.white,
                                  childSelected ? 1 : 0.85,
                                ),
                              },
                            }}
                          />
                        </ListItemButton>
                        <S.SelectedMark isSelected={childSelected} />
                      </ListItem>
                    );
                  })}
                </List>
              </Collapse>
            </ListItem>
          );
        }

        const leafSelected = location.pathname === entry.route;

        return (
          <ListItem
            key={entry.id}
            disablePadding
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'stretch',
              color: theme.palette.white,
            }}
          >
            <ListItemButton
              component={RouterLink}
              to={entry.route}
              selected={leafSelected}
              sx={{
                ...listButtonSx,
                flex: 1,
              }}
            >
              <ListItemIcon style={{ minWidth: '2.5rem' }}>
                <entry.icon style={{ color: theme.palette.white }} />
              </ListItemIcon>
              <ListItemText
                primary={entry.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    ...theme.typography.body1,
                    color: theme.palette.white,
                  },
                }}
              />
            </ListItemButton>
            <S.SelectedMark isSelected={leafSelected} />
          </ListItem>
        );
      })}
    </List>
  );
};

export default MenuSection;

const S = {
  SelectedMark: styled('div')<{ isSelected: boolean }>`
    align-self: stretch;
    background-color: ${({ theme }) => theme.palette.white};
    border-radius: 0.5rem;
    flex-shrink: 0;
    margin-left: 0.5rem;
    visibility: ${({ isSelected }) => (isSelected ? 'visible' : 'hidden')};
    width: 10px;
  `,
};
