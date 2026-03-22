import { Button, Flex } from '@/components';
import { UpdateConfirmModal, UpdateSucceedModal } from '.';
import { useLogin } from '@/pages/auth/hooks';
import { styled } from '@mui/material';
import { useState } from 'react';

const RefreshUserInfoButton = () => {
  const { handleHisnetAuth, isLoginSucceed } = useLogin();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleRefreshAuth = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmUpdate = () => {
    handleHisnetAuth();
  };

  return (
    <Flex.Row justify="center">
      <S.RefreshButton
        label="정보 업데이트하기"
        size="large"
        onClick={handleRefreshAuth}
      />
      <UpdateConfirmModal
        isOpen={isConfirmModalOpen}
        onConfirm={handleConfirmUpdate}
        onClose={() => setIsConfirmModalOpen(false)}
      />
      <UpdateSucceedModal isSucceed={isLoginSucceed} />
    </Flex.Row>
  );
};

export default RefreshUserInfoButton;

const S = {
  RefreshButton: styled(Button)`
    box-sizing: border-box;
    height: 4rem;
    padding: 1rem 4rem;
    ${({ theme }) => theme.typography.h4}
  `,
};
