import { Flex } from '@/components';
import { styled } from '@mui/material';

const Footer = () => {
  return (
    <S.Container>
      <Flex.Column gap="1rem">
        <Flex.Row align="center" wrap="wrap" gap="1rem" justify="space-between">
          <Flex.Row align="center" gap="1rem">
            <S.ServiceName>H-DevPo</S.ServiceName>
            <S.Description>
              한동대학교 SW전공생을 위한 커리어 성장 지원 서비스
            </S.Description>
          </Flex.Row>
          <S.Link href="mailto:pyc50633@handong.edu">문의하기</S.Link>
        </Flex.Row>

        <Flex.Row align="center" wrap="wrap" gap="1rem">
          <S.Text>© {new Date().getFullYear()} WALAB. All rights reserved.</S.Text>
          <S.Text>Developed by 이유현, 김나임, 최혜림, 권채은, 황유민</S.Text>
        </Flex.Row>
      </Flex.Column>
    </S.Container>
  );
};

export default Footer;

const S = {
  Container: styled('footer')`
    border-top: 1px solid ${({ theme }) => theme.palette.grey[300]};
    margin-top: auto;
    padding: 2rem 1.5rem;
    width: 100%;
  `,
  ServiceName: styled('strong')`
    color: ${({ theme }) => theme.palette.primary.main};
    font-size: 1.1rem;
    font-weight: 600;
  `,
  Description: styled('p')`
    color: ${({ theme }) => theme.palette.text.secondary};
    font-size: 0.9rem;
    margin: 0;
  `,
  Text: styled('p')`
    color: ${({ theme }) => theme.palette.text.disabled};
    font-size: 0.75rem;
    margin: 0;
  `,
  Link: styled('a')`
    color: ${({ theme }) => theme.palette.primary.main};
    font-size: 0.85rem;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  `,
};











