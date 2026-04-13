import { Dialog, DialogContent } from '@mui/material';
import type { PortfolioCvDetail } from '../../apis/cv';
import CvPreviewContent from './CvPreviewContent';

export interface CvPreviewModalProps {
  open: boolean;
  onClose: () => void;
  data: PortfolioCvDetail | undefined;
  isPending: boolean;
  isError: boolean;
  onRequestDelete?: () => void;
  isDeletePending?: boolean;
}

const CvPreviewModal = ({
  open,
  onClose,
  data,
  isPending,
  isError,
  onRequestDelete,
  isDeletePending = false,
}: CvPreviewModalProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: '0.75rem',
          minHeight: isPending ? 'min(58vh, 440px)' : undefined,
          maxHeight: 'min(90dvh, 680px)',
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(83, 127, 241, 0.15)',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
          minHeight: 0,
        }}
      >
        <CvPreviewContent
          active={open}
          layout="modal"
          onClose={onClose}
          closeAriaLabel="닫기"
          data={data}
          isPending={isPending}
          isError={isError}
          onRequestDelete={onRequestDelete}
          isDeletePending={isDeletePending}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CvPreviewModal;
