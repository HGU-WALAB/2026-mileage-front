import { Flex, Heading } from '@/components';
import { boxShadow } from '@/styles/common';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { styled, useTheme } from '@mui/material';
import {
  type DragEvent,
  type ReactNode,
  useCallback,
} from 'react';

import type { DraggableSectionKey } from '../../constants/constants';

interface DraggableSectionProps {
  sectionId: DraggableSectionKey;
  title: string;
  icon?: ReactNode;
  headerRight?: ReactNode;
  onDragStart: (id: DraggableSectionKey) => void;
  onDragOver: (e: DragEvent<HTMLElement>, targetId: DraggableSectionKey) => void;
  onDragLeave: (e: DragEvent<HTMLElement>) => void;
  onDrop: (targetId: DraggableSectionKey) => void;
  isDragOver?: boolean;
  children: ReactNode;
}

const DraggableSection = ({
  sectionId,
  title,
  icon,
  headerRight,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragOver = false,
  children,
}: DraggableSectionProps) => {
  const theme = useTheme();

  const handleDragStart = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.dataTransfer.setData('sectionId', sectionId);
      e.dataTransfer.effectAllowed = 'move';
      onDragStart(sectionId);
    },
    [sectionId, onDragStart],
  );

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      onDragOver(e, sectionId);
    },
    [sectionId, onDragOver],
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      onDrop(sectionId);
    },
    [sectionId, onDrop],
  );

  return (
    <S.Section
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={onDragLeave}
      onDrop={handleDrop}
      $isDragOver={isDragOver}
    >
      <S.Header
        align="center"
        gap="0.5rem"
        justify={headerRight != null ? 'space-between' : undefined}
      >
        <Flex.Row align="center" gap="0.5rem">
          <S.DragHandle
            onMouseDown={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
          >
            <DragIndicatorIcon
              sx={{ fontSize: 20, color: theme.palette.grey[500] }}
            />
          </S.DragHandle>
          {icon != null && <S.IconWrap>{icon}</S.IconWrap>}
          <Heading
            as="h3"
            style={{
              fontWeight: 700,
              margin: 0,
              fontSize: '1.125rem',
              lineHeight: '1.5',
              color: theme.palette.text.primary,
            }}
          >
            {title}
          </Heading>
        </Flex.Row>
        {headerRight != null && <S.HeaderRight>{headerRight}</S.HeaderRight>}
      </S.Header>
      <S.Content>{children}</S.Content>
    </S.Section>
  );
};

export default DraggableSection;

const S = {
  Section: styled('section')<{ $isDragOver?: boolean }>`
    background-color: ${({ theme }) => theme.palette.background.paper};
    border-radius: 0.75rem;
    padding: 1.25rem;
    width: 100%;
    ${boxShadow};
    opacity: ${({ $isDragOver }) => ($isDragOver ? 0.85 : 1)};
    transition: opacity 0.15s ease;
  `,
  Header: styled(Flex.Row)`
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  `,
  DragHandle: styled('div')`
    cursor: grab;
    display: flex;
    align-items: center;
    &:active {
      cursor: grabbing;
    }
  `,
  IconWrap: styled('div')`
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  HeaderRight: styled('div')`
    flex-shrink: 0;
  `,
  Content: styled('div')`
    width: 100%;
  `,
};
