import { AlarmClock, BedSingle, CigaretteOff, Droplets, MoonStar, ThermometerSun, Wind, Dumbbell } from 'lucide-react';
import type { ComponentType } from 'react';

export type TopicCard = {
  title: string;
  body: string;
  icon: ComponentType<{ className?: string }>;
};

export type SituationCard = {
  title: string;
  body: string;
};

export type SecretSauceTopic = {
  id: string;
  label: string;
  emoji: string;
  title: string;
  subtitle: string;
  cards: [TopicCard, TopicCard, TopicCard, TopicCard];
  situations: [SituationCard, SituationCard, SituationCard];
};

export const SECRET_SAUCE_TOPICS: SecretSauceTopic[] = [
  {
    id: 'sleep',
    label: 'Sleep Cycle',
    emoji: '🌙',
    title: 'ตื่นให้ตรงเวลา แล้วระบบชีวิตจะนิ่งขึ้น',
    subtitle: 'Sleep cycle ไม่ต้อง perfect แต่ต้องคุมจังหวะให้สม่ำเสมอ',
    cards: [
      {
        title: 'Anchor Wake Time',
        body: 'ตั้งเวลาตื่นหลักทุกวัน เช่น 07:30 (+/- ไม่เกิน 1 ชั่วโมง) เพื่อรีเซ็ตนาฬิกาชีวิตให้ตรงเสมอ',
        icon: AlarmClock
      },
      {
        title: 'No Long Nap',
        body: 'งีบได้เมื่อจำเป็น แต่จำกัดราว 20–30 นาทีพอ เพื่อไม่ให้ร่างกายหลุดโหมดกลางคืน',
        icon: BedSingle
      },
      {
        title: 'Control Night',
        body: 'ลดการกระตุ้นก่อนนอน เช่น binge content หรือไถมือถือยาว เป้าคือให้สมองค่อย ๆ ดรอป',
        icon: MoonStar
      },
      {
        title: 'No Smoke Before Bed',
        body: 'หลีกเลี่ยงบุหรี่ก่อนนอนอย่างน้อย 2 ชั่วโมง เพื่อลดการรบกวนคุณภาพการหลับลึก',
        icon: CigaretteOff
      }
    ],
    situations: [
      {
        title: 'เมื่อคืนเที่ยวถึงตี 3',
        body: 'ยังคงเวลาตื่นหลัก, งีบสั้นได้, และกลับเข้านอนเร็วขึ้นคืนนี้แทนการนอนชดเชยยาว'
      },
      {
        title: 'ง่วงตอนบ่าย',
        body: 'เลือกงีบ 20 นาทีหรือลุกเดินรับแสง อย่าลากเป็นการนอนยาวที่กระทบคืนถัดไป'
      },
      {
        title: 'นอนไม่หลับบนเตียง',
        body: 'ลุกออกจากเตียงชั่วคราว ลดแสง ลดสิ่งกระตุ้น แล้วค่อยกลับมานอนเมื่อเริ่มง่วง'
      }
    ]
  },
  {
    id: 'hydration',
    label: 'Hydration',
    emoji: '💧',
    title: 'น้ำต้องมาเป็นจังหวะ ไม่ใช่ดื่มหนักทีเดียว',
    subtitle: 'คีย์สำคัญคือเติมสม่ำเสมอทั้งวัน เพื่อพลังงาน สมาธิ และการฟื้นตัวที่นิ่งกว่า',
    cards: [
      {
        title: 'ดื่มสม่ำเสมอคือแกนหลัก',
        body: 'ร่างกายต้องการน้ำต่อเนื่องทั้งวัน ไม่ใช่ปล่อยขาดแล้วค่อยดื่มรวดเดียวในช่วงสั้น ๆ',
        icon: Droplets
      },
      {
        title: 'สัญญาณขาดน้ำที่เจอบ่อย',
        body: 'ง่วงง่าย ปวดหัว สมาธิหลุด ปากแห้ง หรือปัสสาวะสีเข้ม คือสัญญาณที่ควรเติมน้ำทันที',
        icon: ThermometerSun
      },
      {
        title: 'วิธีง่ายที่ทำได้จริง',
        body: 'ดื่มหลังตื่น ก่อนมื้ออาหารพอประมาณ หลังเสียเหงื่อ และวางขวดน้ำไว้ใกล้ตัวเสมอ',
        icon: Wind
      },
      {
        title: 'จุดพลาดที่ทำให้หลุด',
        body: 'รอจนกระหาย ดื่มแต่น้ำหวานหรือกาแฟ หรือดื่มทีเดียวมากเกิน ล้วนทำให้สมดุลน้ำแกว่ง',
        icon: Dumbbell
      }
    ],
    situations: [
      {
        title: 'วันที่อากาศร้อน',
        body: 'แบ่งจิบน้ำถี่ขึ้นตลอดวัน อย่ารอคอแห้ง เพราะร่างกายเสียเหงื่อมากกว่าปกติ'
      },
      {
        title: 'วันที่ออกกำลังกาย',
        body: 'เติมก่อนเริ่ม ระหว่างพัก และหลังจบ เพื่อให้แรงไม่ตกและฟื้นตัวเร็วขึ้น'
      },
      {
        title: 'วันที่อยู่ห้องแอร์ทั้งวัน',
        body: 'แม้ไม่รู้สึกร้อนก็ยังเสียน้ำได้ จัดรอบจิบน้ำเป็นช่วงเวลาเพื่อกันลืม'
      }
    ]
  }
];
