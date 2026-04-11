export const STATUS_LEVELS = [
  {
    level: 1,
    title: 'มีรายได้',
    english_label: 'Income Starter',
    income_threshold: 10000,
    short_description: 'เริ่มมีรายได้ของตัวเอง',
    identity_text: 'คนที่เริ่มยืนบนขาตัวเองได้'
  },
  {
    level: 2,
    title: 'อยู่รอดด้วยตัวเอง',
    english_label: 'Self-Sustaining',
    income_threshold: 20000,
    short_description: 'เลี้ยงตัวเองได้โดยไม่พึ่งคนอื่น',
    identity_text: 'คนที่เริ่มคุมชีวิตตัวเองได้'
  },
  {
    level: 3,
    title: 'เริ่มมีเงินเหลือ',
    english_label: 'Stable Earner',
    income_threshold: 30000,
    short_description: 'ไม่ใช่แค่พออยู่ แต่เริ่มมีส่วนเกิน',
    identity_text: 'คนที่เริ่มดูมั่นคงขึ้น'
  },
  {
    level: 4,
    title: 'เหนือค่าเฉลี่ย',
    english_label: 'Above Average',
    income_threshold: 50000,
    short_description: 'รายได้สูงกว่าคนทั่วไปอย่างชัดเจน',
    identity_text: 'คนที่เริ่มดูมีอนาคตและมีมูลค่า'
  },
  {
    level: 5,
    title: 'คนเงินดี',
    english_label: 'Well-Off',
    income_threshold: 70000,
    short_description: 'เริ่มดูมีฐานะและมีอิสระมากขึ้น',
    identity_text: 'คนที่ชีวิตเริ่มไม่ธรรมดา'
  },
  {
    level: 6,
    title: 'เกือบแตะแสน',
    english_label: 'Pre-High Value',
    income_threshold: 90000,
    short_description: 'เข้าใกล้จุดเปลี่ยนของผู้ชายที่รายได้สูง',
    identity_text: 'คนที่กำลังจะข้ามจากธรรมดาไปเป็นของจริง'
  },
  {
    level: 7,
    title: 'รายได้เกินแสน',
    english_label: 'High Value',
    income_threshold: 100000,
    short_description: 'จุดที่รายได้เริ่มทำให้คนมองคุณต่างออกไป',
    identity_text: 'ผู้ชายที่สังคมเริ่มรู้สึกว่ามีระดับ'
  },
  {
    level: 8,
    title: 'ตัวท็อป',
    english_label: 'Top Tier',
    income_threshold: 300000,
    short_description: 'รายได้ระดับที่คนส่วนใหญ่เอื้อมไม่ถึง',
    identity_text: 'คนที่เข้าสู่โลกของผู้เล่นระดับสูง'
  },
  {
    level: 9,
    title: 'ชนชั้นนำ',
    english_label: 'Elite',
    income_threshold: 500000,
    short_description: 'รายได้ระดับอำนาจและอิทธิพลทางการเงิน',
    identity_text: 'คนที่ไม่ได้แค่มีเงิน แต่มีแรงกระเพื่อม'
  },
  {
    level: 10,
    title: 'ผู้เล่นระดับอำนาจ',
    english_label: 'Power Player',
    income_threshold: 1000000,
    short_description: 'รายได้ระดับที่เงินกลายเป็นเครื่องมือสร้างเกม',
    identity_text: 'คนที่อยู่ในสนามอีกระดับหนึ่ง'
  }
] as const;

export type StatusLevelDefinition = (typeof STATUS_LEVELS)[number];
