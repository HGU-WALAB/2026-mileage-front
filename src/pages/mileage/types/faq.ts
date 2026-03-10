export interface FAQListItem {
  title: string;
  desc?: string[];
}

export interface FAQItem {
  category: string;
  list: FAQListItem[];
}

export interface ContactInfoResponse {
  contactInfo: string;
}
