import { Accordion, Flex, Heading, Text } from '@/components';
import { FAQ } from '@/pages/mileage/constants/faq';
import { MAX_RESPONSIVE_WIDTH } from '@/constants/system';
import { useGetFAQContactDescQuery } from '@/pages/dashboard/hooks';
import { boxShadow } from '@/styles/common';
import { FAQItem, FAQListItem } from '@/pages/mileage/types/faq';
import { styled, useMediaQuery, useTheme } from '@mui/material';
import { useMemo } from 'react';

const FAQSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(MAX_RESPONSIVE_WIDTH);
  const { data: contactDesc } = useGetFAQContactDescQuery();

  const faqData = useMemo(() => {
    const faqList: FAQItem[] = FAQ.map(faq => ({ ...faq }));
    const contactFaqIndex = faqList.findIndex(
      faq => faq.category === '기타 서비스 문의',
    );

    if (contactFaqIndex !== -1 && contactDesc?.contactInfo) {
      faqList[contactFaqIndex] = {
        ...faqList[contactFaqIndex],
        list: faqList[contactFaqIndex].list.map((item, index) => {
          if (index === 0) {
            return {
              ...item,
              desc: [contactDesc.contactInfo],
            };
          }
          return item;
        }),
      };
    }

    return faqList;
  }, [contactDesc]);

  return (
    <S.Container height="fit-content" width="100%" gap="1rem">
      <Heading as="h2" color={theme.palette.primary.main}>
        자주 묻는 질문
      </Heading>
      <S.Grid isMobile={isMobile}>
        {faqData.map(faq => (
          <Accordion
            key={`faq-accordion-${faq.category}`}
            title={faq.category}
            desc={<FAQDescBox list={faq.list} />}
          />
        ))}
      </S.Grid>
    </S.Container>
  );
};

export default FAQSection;

const FAQDescBox = ({ list }: { list: FAQListItem[] }) => {
  return (
    <Flex.Column
      height="fit-content"
      padding="0 1rem"
      style={{ minHeight: '150px' }}
    >
      <Flex.Column gap=".5rem">
        {list.map((item, index) => (
          <Flex.Column key={index}>
            <Text bold>{item.title}</Text>
            {Array.isArray(item?.desc)
              ? item.desc.map((desc, i) => (
                  <Text key={i} style={{ wordBreak: 'keep-all' }}>
                    {desc}
                  </Text>
                ))
              : item?.desc && (
                  <Text style={{ wordBreak: 'keep-all' }}>{item.desc}</Text>
                )}
          </Flex.Column>
        ))}
      </Flex.Column>
    </Flex.Column>
  );
};

const S = {
  Container: styled(Flex.Column)`
    background-color: ${({ theme }) => theme.palette.white};
    border-radius: 1rem;
    margin-bottom: 2rem;
    padding: 1rem;
    ${boxShadow}
  `,
  Grid: styled('div')<{ isMobile: boolean }>`
    display: grid;
    gap: 1rem;
    grid-template-columns: ${({ isMobile }) =>
      isMobile ? 'repeat(1, 1fr)' : 'repeat(2, 1fr)'};
  `,
};
