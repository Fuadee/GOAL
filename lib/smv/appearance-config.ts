export const APPEARANCE_DIMENSION_KEY = 'look' as const;

export const APPEARANCE_CATEGORY_KEYS = ['style', 'body', 'grooming'] as const;
export type AppearanceCategoryKey = (typeof APPEARANCE_CATEGORY_KEYS)[number];

export type AppearanceLevelDefinition = {
  level: number;
  title: string;
  description: string;
  criteria: string[];
};

export type AppearanceCategoryDefinition = {
  key: AppearanceCategoryKey;
  titleTh: string;
  shortDescription: string;
  maxScore: number;
  levels: AppearanceLevelDefinition[];
};

export const APPEARANCE_CATEGORIES: Record<AppearanceCategoryKey, AppearanceCategoryDefinition> = {
  style: {
    key: 'style',
    titleTh: 'การแต่งตัว',
    shortDescription: 'ยกระดับลุคจากพื้นฐานสู่ signature style ที่น่าเชื่อถือ',
    maxScore: 40,
    levels: [
      {
        level: 1,
        title: 'พื้นฐานไม่พัง',
        description: 'ทำให้ภาพรวมดูสะอาด เรียบร้อย และไม่โทรม',
        criteria: ['เสื้อผ้าสะอาด', 'ไม่ยับ', 'ไม่มีกลิ่น', 'รองเท้าไม่ดูโทรมเกินไป']
      },
      {
        level: 2,
        title: 'ดูปกติและเรียบร้อย',
        description: 'เริ่มมีลุคมาตรฐานที่ใส่แล้วดูเหมาะสมกับสถานที่',
        criteria: ['มีชุดที่ใส่แล้วดูโอเคอย่างน้อย 1-2 ชุด', 'ผมไม่รก', 'การแต่งตัวดูเหมาะสมกับสถานที่', 'ภาพรวมดูเป็นผู้ใหญ่ขึ้น']
      },
      {
        level: 3,
        title: 'ดูดีและเข้ากับตัวเอง',
        description: 'รู้จักเลือกทรงและสีให้เข้ากับรูปร่างของตัวเอง',
        criteria: ['เลือกเสื้อผ้าเข้ากับรูปร่างตัวเอง', 'สีและทรงโดยรวมเข้ากัน', 'เริ่มมีสไตล์ชัด', 'ถ่ายรูปออกมาดูดีขึ้น']
      },
      {
        level: 4,
        title: 'มีสไตล์ชัดและดึงดูด',
        description: 'สร้าง signature look ที่คนจดจำและชื่นชมได้',
        criteria: ['มี signature look', 'คนอื่นเริ่มชมลุคหรือสไตล์', 'แต่งตัวแล้วดูมั่นใจ', 'ภาพรวมดู attractive ขึ้นจริง']
      }
    ]
  },
  body: {
    key: 'body',
    titleTh: 'การรักษาหุ่น / ร่างกาย',
    shortDescription: 'พัฒนาร่างกายจากไม่โทรม ไปสู่ fit และมี presence',
    maxScore: 30,
    levels: [
      {
        level: 1,
        title: 'ร่างกายเริ่มโอเค',
        description: 'เริ่มวางวินัยร่างกายและไม่ปล่อยตัว',
        criteria: ['ไม่ปล่อยตัวหนักเกินไป', 'เริ่มดูแลน้ำหนัก', 'มีการขยับร่างกายหรือออกกำลังกายบ้าง', 'ภาพรวมไม่ดูโทรม']
      },
      {
        level: 2,
        title: 'หุ่นเริ่มดีขึ้น',
        description: 'รูปร่างเริ่มกระชับและเห็นผลจากวินัย',
        criteria: ['รูปร่างเริ่มกระชับ', 'ใส่เสื้อแล้วดูดีขึ้น', 'มีวินัยเรื่องกินหรือออกกำลังกายมากขึ้น', 'คนใกล้ตัวเริ่มเห็นความเปลี่ยนแปลง']
      },
      {
        level: 3,
        title: 'ฟิตและดูดีจริง',
        description: 'รูปร่างส่งเสริมเสน่ห์และความมั่นใจได้ชัดเจน',
        criteria: ['หุ่นดูดีชัด', 'มี presence มากขึ้นเวลาแต่งตัว', 'รูปร่างส่งเสริมเสน่ห์โดยรวม', 'ภาพรวมดู fit / attractive ขึ้นจริง']
      }
    ]
  },
  grooming: {
    key: 'grooming',
    titleTh: 'การดูแลผิว / Grooming',
    shortDescription: 'ดูแลความสะอาดและผิวพรรณแบบมีระบบจนเห็นผลจริง',
    maxScore: 30,
    levels: [
      {
        level: 1,
        title: 'ดูแลตัวเองขั้นพื้นฐานดี',
        description: 'สร้างความสะอาดและ routine ขั้นพื้นฐานให้สม่ำเสมอ',
        criteria: ['ล้างหน้า / อาบน้ำ / ดูแลความสะอาดสม่ำเสมอ', 'ใช้ผลิตภัณฑ์ระดับพื้นฐานในระดับหนึ่ง', 'ไม่ปล่อยให้หน้าหรือผิวดูโทรมเกินไป', 'ภาพรวมดูสะอาดขึ้น']
      },
      {
        level: 2,
        title: 'ดูแลตัวเองแบบมีระบบ',
        description: 'มี routine และเลือกเครื่องมือที่เหมาะกับตัวเอง',
        criteria: ['มี routine ชัดขึ้น', 'เลือกใช้ผลิตภัณฑ์เหมาะกับตัวเอง', 'มีการใช้ของเสริม เช่น กันแดด เซรั่ม หรืออาหารเสริมบางอย่าง', 'ภาพรวมผิวหรือ grooming ดูดีขึ้นชัดเจน']
      },
      {
        level: 3,
        title: 'Top Grooming / เห็นผลจริง',
        description: 'เน้นผลลัพธ์จริง ไม่ใช่แค่ใช้ของแพง',
        criteria: ['ใช้ผลิตภัณฑ์ระดับดีมากหรือ targeted จริง', 'อาจมีการทำ treatment หรือดูแลเชิงจริงจัง', 'ผิวโดยรวมดูดีขึ้นมาก เห็นผลจริง', 'ภาพรวมออกมาดูสะอาด ดูแพง ดูมีคลาสขึ้นจริง']
      }
    ]
  }
};

export const APPEARANCE_TOTAL_SCORE = 100;

export function getAppearanceCategoryDefinition(key: AppearanceCategoryKey) {
  return APPEARANCE_CATEGORIES[key];
}
