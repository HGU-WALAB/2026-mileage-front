import { LogoIcon } from '@/assets';
import { Button, Heading, Modal } from '@/components';
import { useOpenModal } from '@/hooks';
import { styled, useTheme } from '@mui/material';
import { useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const UpdateConfirmModal = ({ isOpen, onConfirm, onClose }: Props) => {
  const theme = useTheme();
  const { open, toggleModal } = useOpenModal(isOpen);

  useEffect(() => {
    if (isOpen) {
      toggleModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm();
    toggleModal();
    onClose();
  };

  const handleClose = () => {
    toggleModal();
    onClose();
  };

  return (
    <Modal
      open={open}
      toggleModal={handleClose}
      size="medium"
      hasCloseButton
      style={{
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Modal.Body
        position="center"
        style={{
          margin: '2rem auto',
          gap: '2rem',
        }}
      >
        <LogoIcon width="100px" height="100px" />
        <Heading
          as="h2"
          style={{
            overflowWrap: 'normal',
            wordBreak: 'keep-all',
            textAlign: 'center',
          }}
        >
          정보 업데이트시 로그아웃 후 로그인이 필요합니다
        </Heading>
        <S.ConfirmButton label="확인" size="large" onClick={handleConfirm} />
      </Modal.Body>
    </Modal>
  );
};

export default UpdateConfirmModal;

const S = {
  ConfirmButton: styled(Button)`
    width: 300px;
    ${({ theme }) => theme.typography.h3}
  `,
};

