import type { Metadata } from "next";
import { RfqView } from "@/components/views";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  locale: "ar",
  path: "/rfq",
  title: "طلب عرض أسعار الطيران والشارتر | سيتيكو للطيران",
  description:
    "طلب فوري لرحلات الشارتر الجوي والشحن في جنوب السودان وشرق أفريقيا. مطابقة الطائرات والحمولة ومكتب العمليات على مدار الساعة.",
});

export default function ArabicRfqPage() {
  return <RfqView locale="ar" />;
}
