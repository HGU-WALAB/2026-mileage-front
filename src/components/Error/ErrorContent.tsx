import { EmptyBoxImg } from '@/assets';
import { Flex, Heading } from '@/components';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { useTheme } from '@mui/material';
import { AxiosError } from 'axios';
import { FallbackProps } from 'react-error-boundary';

export const ErrorContent = ({ error }: FallbackProps | { error: AxiosError }) => {
  const theme = useTheme();
  const axiosError = error as AxiosError;
  return (
    <Flex.Column gap="1rem" align="center">
      <EmptyBoxImg width={75} height={75} />
      <Heading
        as="h2"
        style={{ fontSize: '1rem', color: theme.palette.grey300 }}
      >
        {getErrorMessage(String(axiosError.response?.status))}
      </Heading>
    </Flex.Column>
  );
};

