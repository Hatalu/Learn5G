/**
 * Chrono-Beast: Data & Quest Definitions
 * Aligned with Grade 5 English Curriculum (สสวท.)
 * Kid-Friendly Edition: Rich Quests grouped by Pet Companion (10 Pets)
 * Covering 4 Tenses: Past Simple, Present Simple, Present Continuous, Future Simple
 */

const CHRONO_QUESTS_BY_PET = {
  // 1. Dragon (Ignis Drake - มังกรเพลิงกาลเวลา)
  1: [
    {
      id: 'd1',
      petId: 1,
      beastType: 'dragon',
      scene: 'volcano',
      petAction: 'breathe_fire',
      tense: 'present_simple',
      tenseNameTh: 'Present Simple (ปัจจุบัน/กิจวัตร)',
      timeClue: 'every morning',
      timeClueTh: 'ทุกๆ เช้า (กิจวัตร)',
      sentenceParts: ['Ignis the dragon', '_____', 'fire from the mountain every morning.'],
      correctAnswer: 'breathes',
      meaningTh: 'มังกร Ignis พ่นไฟออกจากภูเขาเป็นประจำทุกๆ เช้า',
      cards: [
        { text: 'breathes', tense: 'present_simple', labelTh: 'กิจวัตรประจำ (V.1 + s)', isCorrect: true },
        { text: 'is breathing', tense: 'present_continuous', labelTh: 'กำลังพ่นไฟตอนนี้', isCorrect: false },
        { text: 'breathed', tense: 'past_simple', labelTh: 'พ่นไฟไปแล้วเมื่อวาน', isCorrect: false },
        { text: 'will breathe', tense: 'future_simple', labelTh: 'จะพ่นไฟในอนาคต', isCorrect: false }
      ]
    },
    {
      id: 'd2',
      petId: 1,
      beastType: 'dragon',
      scene: 'castle',
      petAction: 'attack_castle',
      tense: 'present_continuous',
      tenseNameTh: 'Present Continuous (กำลังทำอยู่)',
      timeClue: 'Look! / right now',
      timeClueTh: 'ดูนั่นสิ! / ตอนนี้เลย',
      sentenceParts: ['Look! The dragon', '_____', 'the crystal castle right now!'],
      correctAnswer: 'is attacking',
      meaningTh: 'ดูนั่นสิ! มังกรกำลังโจมตีปราสาทคริสตัลในตอนนี้เลย!',
      cards: [
        { text: 'is attacking', tense: 'present_continuous', labelTh: 'กำลังโจมตีตอนนี้ (is + V-ing)', isCorrect: true },
        { text: 'attacks', tense: 'present_simple', labelTh: 'โจมตีเป็นประจำ (V.1 + s)', isCorrect: false },
        { text: 'attacked', tense: 'past_simple', labelTh: 'โจมตีไปแล้วในอดีต (V.2)', isCorrect: false },
        { text: 'will attack', tense: 'future_simple', labelTh: 'จะโจมตีในอนาคต (will + V.1)', isCorrect: false }
      ]
    },
    {
      id: 'd3',
      petId: 1,
      beastType: 'dragon',
      scene: 'ruins',
      petAction: 'fight_monster',
      tense: 'past_simple',
      tenseNameTh: 'Past Simple (อดีต)',
      timeClue: 'Yesterday',
      timeClueTh: 'เมื่อวานนี้ (อดีต)',
      sentenceParts: ['Yesterday, our red dragon', '_____', 'the dark shadow monster.'],
      correctAnswer: 'defeated',
      meaningTh: 'เมื่อวานนี้ มังกรสีแดงของเราได้เอาชนะมอนสเตอร์เงาทมิฬไปแล้ว',
      cards: [
        { text: 'defeated', tense: 'past_simple', labelTh: 'เอาชนะไปแล้วในอดีต (V.2)', isCorrect: true },
        { text: 'defeats', tense: 'present_simple', labelTh: 'เอาชนะเป็นประจำ (V.1 + s)', isCorrect: false },
        { text: 'is defeating', tense: 'present_continuous', labelTh: 'กำลังเอาชนะอยู่ตอนนี้', isCorrect: false },
        { text: 'will defeat', tense: 'future_simple', labelTh: 'จะเอาชนะในอนาคต', isCorrect: false }
      ]
    },
    {
      id: 'd4',
      petId: 1,
      beastType: 'dragon',
      scene: 'galaxy',
      petAction: 'flying',
      tense: 'future_simple',
      tenseNameTh: 'Future Simple (อนาคต)',
      timeClue: 'Tomorrow',
      timeClueTh: 'วันพรุ่งนี้ (อนาคต)',
      sentenceParts: ['Tomorrow, our dragon', '_____', 'across the galaxy.'],
      correctAnswer: 'will soar',
      meaningTh: 'วันพรุ่งนี้ มังกรของเราจะทะยานบินข้ามกาแล็กซี',
      cards: [
        { text: 'will soar', tense: 'future_simple', labelTh: 'จะทะยานในอนาคต (will + V.1)', isCorrect: true },
        { text: 'soars', tense: 'present_simple', labelTh: 'ทะยานเป็นประจำ (V.1 + s)', isCorrect: false },
        { text: 'is soaring', tense: 'present_continuous', labelTh: 'กำลังทะยานตอนนี้', isCorrect: false },
        { text: 'soared', tense: 'past_simple', labelTh: 'ทะยานไปแล้วในอดีต', isCorrect: false }
      ]
    },
    {
      id: 'd5',
      petId: 1,
      beastType: 'dragon',
      scene: 'volcano',
      petAction: 'breathe_fire',
      tense: 'present_simple',
      tenseNameTh: 'Present Simple (ปัจจุบัน/กิจวัตร)',
      timeClue: 'always',
      timeClueTh: 'เสมอๆ (กิจวัตร)',
      sentenceParts: ['The fire dragon always', '_____', 'its gold treasure cave.'],
      correctAnswer: 'protects',
      meaningTh: 'มังกรไฟปกป้องถ้ำสมบัติสีทองของมันอยู่เสมอ',
      cards: [
        { text: 'protects', tense: 'present_simple', labelTh: 'ปกป้องเป็นประจำ (V.1 + s)', isCorrect: true },
        { text: 'is protecting', tense: 'present_continuous', labelTh: 'กำลังปกป้องตอนนี้', isCorrect: false },
        { text: 'protected', tense: 'past_simple', labelTh: 'ปกป้องไปแล้วในอดีต', isCorrect: false },
        { text: 'will protect', tense: 'future_simple', labelTh: 'จะปกป้องในอนาคต', isCorrect: false }
      ]
    },
    {
      id: 'd6',
      petId: 1,
      beastType: 'dragon',
      scene: 'volcano',
      petAction: 'flying',
      tense: 'past_simple',
      tenseNameTh: 'Past Simple (อดีต)',
      timeClue: 'Last week',
      timeClueTh: 'สัปดาห์ที่แล้ว (อดีต)',
      sentenceParts: ['Last week, the great dragon', '_____', 'over the fiery volcano.'],
      correctAnswer: 'flew',
      meaningTh: 'สัปดาห์ที่แล้ว มังกรผู้ยิ่งใหญ่ได้บินข้ามภูเขาไฟอันร้อนระอุไปแล้ว',
      cards: [
        { text: 'flew', tense: 'past_simple', labelTh: 'บินไปแล้วในอดีต (fly -> flew)', isCorrect: true },
        { text: 'flies', tense: 'present_simple', labelTh: 'บินเป็นประจำ (V.1 + es)', isCorrect: false },
        { text: 'is flying', tense: 'present_continuous', labelTh: 'กำลังบินอยู่ตอนนี้', isCorrect: false },
        { text: 'will fly', tense: 'future_simple', labelTh: 'จะบินในอนาคต', isCorrect: false }
      ]
    }
  ],

  // 2. Tiger (Frostfang Tiger - เสือเขี้ยวดาบน้ำแข็ง)
  2: [
    {
      id: 't1',
      petId: 2,
      beastType: 'tiger',
      scene: 'snow',
      petAction: 'roar',
      tense: 'present_continuous',
      tenseNameTh: 'Present Continuous (กำลังทำอยู่)',
      timeClue: 'Listen! / at the moment',
      timeClueTh: 'ฟังดูสิ! / ณ ตอนนี้',
      sentenceParts: ['Listen! The frosty tigers', '_____', 'in the snowy forest at the moment!'],
      correctAnswer: 'are roaring',
      meaningTh: 'ฟังดูสิ! ฝูงเสือเหมันต์กำลังคำรามในป่าหิมะ ณ วินาทีนี้!',
      cards: [
        { text: 'are roaring', tense: 'present_continuous', labelTh: 'กำลังคำราม (are + V-ing)', isCorrect: true },
        { text: 'is roaring', tense: 'present_continuous', labelTh: 'ใช้กับตัวเดียว (is roaring)', isCorrect: false },
        { text: 'roars', tense: 'present_simple', labelTh: 'คำรามเป็นประจำ (V.1 + s)', isCorrect: false },
        { text: 'roared', tense: 'past_simple', labelTh: 'คำรามไปแล้วในอดีต', isCorrect: false }
      ]
    },
    {
      id: 't2',
      petId: 2,
      beastType: 'tiger',
      scene: 'snow',
      petAction: 'hunt',
      tense: 'present_simple',
      tenseNameTh: 'Present Simple (ปัจจุบัน/กิจวัตร)',
      timeClue: 'usually',
      timeClueTh: 'โดยปกติ / เป็นประจำ',
      sentenceParts: ['Frostfang usually', '_____', 'shiny ice crystals on the mountain.'],
      correctAnswer: 'hunts',
      meaningTh: 'Frostfang มักจะออกล่าผลึกน้ำแข็งประกายแวววาวบนภูเขาเป็นประจำ',
      cards: [
        { text: 'hunts', tense: 'present_simple', labelTh: 'ออกล่าเป็นประจำ (V.1 + s)', isCorrect: true },
        { text: 'hunt', tense: 'present_simple', labelTh: 'รูปไม่เติม s (ใช้กับหลายตัว)', isCorrect: false },
        { text: 'is hunting', tense: 'present_continuous', labelTh: 'กำลังออกล่าตอนนี้', isCorrect: false },
        { text: 'hunted', tense: 'past_simple', labelTh: 'ล่าไปแล้วในอดีต', isCorrect: false }
      ]
    },
    {
      id: 't3',
      petId: 2,
      beastType: 'tiger',
      scene: 'snow',
      petAction: 'sleeping',
      tense: 'past_simple',
      tenseNameTh: 'Past Simple (อดีต)',
      timeClue: 'Last night',
      timeClueTh: 'เมื่อคืนนี้ (อดีต)',
      sentenceParts: ['Last night, the cyber tiger', '_____', 'inside the secret glacier cave.'],
      correctAnswer: 'slept',
      meaningTh: 'เมื่อคืนนี้ เสือไซเบอร์นอนหลับอยู่ในถ้ำธารน้ำแข็งลับ',
      cards: [
        { text: 'slept', tense: 'past_simple', labelTh: 'นอนหลับไปแล้ว (เปลี่ยนรูป V.2)', isCorrect: true },
        { text: 'sleeped', tense: 'past_simple', labelTh: 'รูปที่ผิดหลักไวยากรณ์', isCorrect: false },
        { text: 'sleeps', tense: 'present_simple', labelTh: 'นอนเป็นประจำ (V.1 + s)', isCorrect: false },
        { text: 'is sleeping', tense: 'present_continuous', labelTh: 'กำลังนอนอยู่ตอนนี้', isCorrect: false }
      ]
    },
    {
      id: 't4',
      petId: 2,
      beastType: 'tiger',
      scene: 'snow',
      petAction: 'hunt',
      tense: 'future_simple',
      tenseNameTh: 'Future Simple (อนาคต)',
      timeClue: 'Next week',
      timeClueTh: 'สัปดาห์หน้า (อนาคต)',
      sentenceParts: ['Next week, the ice tiger', '_____', 'through the snowy valley.'],
      correctAnswer: 'will run',
      meaningTh: 'สัปดาห์หน้า เจ้าเสือน้ำแข็งจะวิ่งทะยานผ่านหุบเขาหิมะ',
      cards: [
        { text: 'will run', tense: 'future_simple', labelTh: 'จะวิ่งในอนาคต (will + V.1)', isCorrect: true },
        { text: 'runs', tense: 'present_simple', labelTh: 'วิ่งเป็นประจำ (V.1 + s)', isCorrect: false },
        { text: 'is running', tense: 'present_continuous', labelTh: 'กำลังวิ่งอยู่ตอนนี้', isCorrect: false },
        { text: 'ran', tense: 'past_simple', labelTh: 'วิ่งไปแล้วในอดีต (V.2)', isCorrect: false }
      ]
    },
    {
      id: 't5',
      petId: 2,
      beastType: 'tiger',
      scene: 'snow',
      petAction: 'hunt',
      tense: 'present_continuous',
      tenseNameTh: 'Present Continuous (กำลังทำอยู่)',
      timeClue: 'Look! / right now',
      timeClueTh: 'ดูสิ! / ตอนนี้เลย',
      sentenceParts: ['Look! The white tiger', '_____', 'across the frozen river now!'],
      correctAnswer: 'is jumping',
      meaningTh: 'ดูสิ! เสือขาวกำลังกระโดดข้ามแม่น้ำน้ำแข็งในตอนนี้เลย!',
      cards: [
        { text: 'is jumping', tense: 'present_continuous', labelTh: 'กำลังกระโดด (is + V-ing)', isCorrect: true },
        { text: 'jumps', tense: 'present_simple', labelTh: 'กระโดดเป็นประจำ (V.1 + s)', isCorrect: false },
        { text: 'jumped', tense: 'past_simple', labelTh: 'กระโดดไปแล้วในอดีต', isCorrect: false },
        { text: 'will jump', tense: 'future_simple', labelTh: 'จะกระโดดในอนาคต', isCorrect: false }
      ]
    }
  ],

  // 3. Gryphon (Storm Gryphon - กริฟฟอนวายุอัสนี)
  3: [
    {
      id: 'g1',
      petId: 3,
      beastType: 'gryphon',
      scene: 'storm',
      petAction: 'catch_lightning',
      tense: 'present_continuous',
      tenseNameTh: 'Present Continuous (กำลังทำอยู่)',
      timeClue: 'now',
      timeClueTh: 'ตอนนี้เลย',
      sentenceParts: ['Look! The storm gryphon', '_____', 'lightning sparks in the clouds now!'],
      correctAnswer: 'is catching',
      meaningTh: 'ดูนั่นสิ! กริฟฟอนวายุกำลังจับประกายสายฟ้าในก้อนเมฆอยู่ตอนนี้เลย!',
      cards: [
        { text: 'is catching', tense: 'present_continuous', labelTh: 'กำลังจับอยู่ตอนนี้ (is + V-ing)', isCorrect: true },
        { text: 'catches', tense: 'present_simple', labelTh: 'จับเป็นประจำ (V.1 + es)', isCorrect: false },
        { text: 'caught', tense: 'past_simple', labelTh: 'จับไปแล้วในอดีต (V.2)', isCorrect: false },
        { text: 'will catch', tense: 'future_simple', labelTh: 'จะจับในอนาคต', isCorrect: false }
      ]
    },
    {
      id: 'g2',
      petId: 3,
      beastType: 'gryphon',
      scene: 'storm',
      petAction: 'flying',
      tense: 'past_simple',
      tenseNameTh: 'Past Simple (อดีต)',
      timeClue: 'Two hours ago',
      timeClueTh: '2 ชั่วโมงที่แล้ว (อดีต)',
      sentenceParts: ['Two hours ago, the great gryphon', '_____', 'high above the stormy clouds.'],
      correctAnswer: 'flew',
      meaningTh: 'สองชั่วโมงที่แล้ว กริฟฟอนผู้ยิ่งใหญ่ได้บินสูงเหนือเมฆพายุไปแล้ว',
      cards: [
        { text: 'flew', tense: 'past_simple', labelTh: 'บินไปแล้วในอดีต (fly -> flew)', isCorrect: true },
        { text: 'flies', tense: 'present_simple', labelTh: 'บินเป็นประจำ (V.1 + es)', isCorrect: false },
        { text: 'is flying', tense: 'present_continuous', labelTh: 'กำลังบินอยู่ตอนนี้', isCorrect: false },
        { text: 'will fly', tense: 'future_simple', labelTh: 'จะบินในอนาคต', isCorrect: false }
      ]
    },
    {
      id: 'g3',
      petId: 3,
      beastType: 'gryphon',
      scene: 'storm',
      petAction: 'defend',
      tense: 'present_simple',
      tenseNameTh: 'Present Simple (ปัจจุบัน/กิจวัตร)',
      timeClue: 'always',
      timeClueTh: 'เสมอๆ (กิจวัตร)',
      sentenceParts: ['The lightning gryphon always', '_____', 'the high thunder tower.'],
      correctAnswer: 'guards',
      meaningTh: 'กริฟฟอนสายฟ้าเฝ้าอารักขาหอคอยอัสนีสูงตระหง่านอยู่เสมอ',
      cards: [
        { text: 'guards', tense: 'present_simple', labelTh: 'เฝ้าเป็นประจำ (V.1 + s)', isCorrect: true },
        { text: 'is guarding', tense: 'present_continuous', labelTh: 'กำลังเฝ้าตอนนี้', isCorrect: false },
        { text: 'guarded', tense: 'past_simple', labelTh: 'เฝ้าไปแล้วในอดีต', isCorrect: false },
        { text: 'will guard', tense: 'future_simple', labelTh: 'จะเฝ้าในอนาคต', isCorrect: false }
      ]
    },
    {
      id: 'g4',
      petId: 3,
      beastType: 'gryphon',
      scene: 'storm',
      petAction: 'flying',
      tense: 'future_simple',
      tenseNameTh: 'Future Simple (อนาคต)',
      timeClue: 'Tomorrow',
      timeClueTh: 'วันพรุ่งนี้ (อนาคต)',
      sentenceParts: ['Tomorrow, the golden gryphon', '_____', 'into the electric storm.'],
      correctAnswer: 'will dive',
      meaningTh: 'วันพรุ่งนี้ กริฟฟอนสีทองจะดิ่งเวหาเข้าสู่พายุไฟฟ้า',
      cards: [
        { text: 'will dive', tense: 'future_simple', labelTh: 'จะดิ่งในอนาคต (will + V.1)', isCorrect: true },
        { text: 'dives', tense: 'present_simple', labelTh: 'ดิ่งเป็นประจำ (V.1 + s)', isCorrect: false },
        { text: 'is diving', tense: 'present_continuous', labelTh: 'กำลังดิ่งตอนนี้', isCorrect: false },
        { text: 'dived', tense: 'past_simple', labelTh: 'ดิ่งไปแล้วในอดีต', isCorrect: false }
      ]
    }
  ],

  // 4. Phoenix (Solar Phoenix - นกฟีนิกซ์สุริยะ)
  4: [
    {
      id: 'p1',
      petId: 4,
      beastType: 'phoenix',
      scene: 'volcano',
      petAction: 'breathe_fire',
      tense: 'present_continuous',
      tenseNameTh: 'Present Continuous (กำลังทำอยู่)',
      timeClue: 'Look! / right now',
      timeClueTh: 'ดูสิ! / ตอนนี้เลย',
      sentenceParts: ['Look! The golden phoenix', '_____', 'from the volcano crater right now!'],
      correctAnswer: 'is rising',
      meaningTh: 'ดูสิ! นกฟีนิกซ์สีทองกำลังบินทะยานขึ้นจากปากปล่องภูเขาไฟในตอนนี้เลย!',
      cards: [
        { text: 'is rising', tense: 'present_continuous', labelTh: 'กำลังพุ่งขึ้นมา (is + V-ing)', isCorrect: true },
        { text: 'rises', tense: 'present_simple', labelTh: 'พุ่งขึ้นเป็นประจำ (V.1 + s)', isCorrect: false },
        { text: 'rose', tense: 'past_simple', labelTh: 'พุ่งขึ้นไปแล้วในอดีต (V.2)', isCorrect: false },
        { text: 'will rise', tense: 'future_simple', labelTh: 'จะพุ่งขึ้นในอนาคต', isCorrect: false }
      ]
    },
    {
      id: 'p2',
      petId: 4,
      beastType: 'phoenix',
      scene: 'volcano',
      petAction: 'flying',
      tense: 'present_simple',
      tenseNameTh: 'Present Simple (ปัจจุบัน/กิจวัตร)',
      timeClue: 'every day',
      timeClueTh: 'ทุกๆ วัน (กิจวัตร)',
      sentenceParts: ['The solar phoenix', '_____', 'brightly in the sky every day.'],
      correctAnswer: 'shines',
      meaningTh: 'นกฟีนิกซ์สุริยะส่องประกายเจิดจ้าบนท้องฟ้าทุกๆ วัน',
      cards: [
        { text: 'shines', tense: 'present_simple', labelTh: 'ส่องแสงเสมอ (V.1 + s)', isCorrect: true },
        { text: 'is shining', tense: 'present_continuous', labelTh: 'กำลังส่องแสง', isCorrect: false },
        { text: 'shone', tense: 'past_simple', labelTh: 'ส่องแสงไปแล้วในอดีต', isCorrect: false },
        { text: 'will shine', tense: 'future_simple', labelTh: 'จะส่องแสงในอนาคต', isCorrect: false }
      ]
    },
    {
      id: 'p3',
      petId: 4,
      beastType: 'phoenix',
      scene: 'volcano',
      petAction: 'breathe_fire',
      tense: 'past_simple',
      tenseNameTh: 'Past Simple (อดีต)',
      timeClue: 'Yesterday',
      timeClueTh: 'เมื่อวานนี้ (อดีต)',
      sentenceParts: ['Yesterday, the fire bird', '_____', 'back to life from the ashes.'],
      correctAnswer: 'came',
      meaningTh: 'เมื่อวานนี้ วิหคเพลิงได้ฟื้นคืนชีพกลับมาจากเถ้าถ่าน',
      cards: [
        { text: 'came', tense: 'past_simple', labelTh: 'กลับมาแล้วในอดีต (come -> came)', isCorrect: true },
        { text: 'comes', tense: 'present_simple', labelTh: 'กลับมาเป็นประจำ', isCorrect: false },
        { text: 'is coming', tense: 'present_continuous', labelTh: 'กำลังกลับมา', isCorrect: false },
        { text: 'will come', tense: 'future_simple', labelTh: 'จะกลับมาในอนาคต', isCorrect: false }
      ]
    },
    {
      id: 'p4',
      petId: 4,
      beastType: 'phoenix',
      scene: 'volcano',
      petAction: 'flying',
      tense: 'future_simple',
      tenseNameTh: 'Future Simple (อนาคต)',
      timeClue: 'Tomorrow',
      timeClueTh: 'วันพรุ่งนี้ (อนาคต)',
      sentenceParts: ['Tomorrow, the holy phoenix', '_____', 'the burnt forest with tears.'],
      correctAnswer: 'will heal',
      meaningTh: 'วันพรุ่งนี้ ฟีนิกซ์ศักดิ์สิทธิ์จะเยียวยาป่าที่ถูกเผาด้วยน้ำตาของมัน',
      cards: [
        { text: 'will heal', tense: 'future_simple', labelTh: 'จะเยียวยาในอนาคต (will + V.1)', isCorrect: true },
        { text: 'heals', tense: 'present_simple', labelTh: 'เยียวยาเป็นประจำ (V.1 + s)', isCorrect: false },
        { text: 'is healing', tense: 'present_continuous', labelTh: 'กำลังเยียวยาตอนนี้', isCorrect: false },
        { text: 'healed', tense: 'past_simple', labelTh: 'เยียวยาไปแล้วในอดีต', isCorrect: false }
      ]
    }
  ],

  // 5. Wolf (Shadow Wolf - หมาป่าเงาทมิฬ)
  5: [
    {
      id: 'w1',
      petId: 5,
      beastType: 'wolf',
      scene: 'galaxy',
      petAction: 'hunt',
      tense: 'past_simple',
      tenseNameTh: 'Past Simple (อดีต)',
      timeClue: 'Last night',
      timeClueTh: 'เมื่อคืนนี้ (อดีต)',
      sentenceParts: ['Last night, the shadow wolf', '_____', 'under the glowing purple moon.'],
      correctAnswer: 'ran',
      meaningTh: 'เมื่อคืนนี้ เจ้าหมาป่าเงาได้วิ่งท่องไปใต้ดวงจันทร์สีม่วง',
      cards: [
        { text: 'ran', tense: 'past_simple', labelTh: 'วิ่งไปแล้วในอดีต (run -> ran)', isCorrect: true },
        { text: 'runs', tense: 'present_simple', labelTh: 'วิ่งเป็นประจำ (V.1 + s)', isCorrect: false },
        { text: 'is running', tense: 'present_continuous', labelTh: 'กำลังวิ่งตอนนี้', isCorrect: false },
        { text: 'will run', tense: 'future_simple', labelTh: 'จะวิ่งในอนาคต', isCorrect: false }
      ]
    },
    {
      id: 'w2',
      petId: 5,
      beastType: 'wolf',
      scene: 'galaxy',
      petAction: 'roar',
      tense: 'present_continuous',
      tenseNameTh: 'Present Continuous (กำลังทำอยู่)',
      timeClue: 'Listen! / right now',
      timeClueTh: 'ฟังดูสิ! / ตอนนี้เลย',
      sentenceParts: ['Listen! The shadow wolf', '_____', 'at the crescent moon right now!'],
      correctAnswer: 'is howling',
      meaningTh: 'ฟังดูสิ! หมาป่าเงากำลังหอนรับดวงจันทร์เสี้ยวในตอนนี้เลย!',
      cards: [
        { text: 'is howling', tense: 'present_continuous', labelTh: 'กำลังหอนตอนนี้ (is + V-ing)', isCorrect: true },
        { text: 'howls', tense: 'present_simple', labelTh: 'หอนเป็นประจำ (V.1 + s)', isCorrect: false },
        { text: 'howled', tense: 'past_simple', labelTh: 'หอนไปแล้วในอดีต', isCorrect: false },
        { text: 'will howl', tense: 'future_simple', labelTh: 'จะหอนในอนาคต', isCorrect: false }
      ]
    },
    {
      id: 'w3',
      petId: 5,
      beastType: 'wolf',
      scene: 'galaxy',
      petAction: 'hunt',
      tense: 'present_simple',
      tenseNameTh: 'Present Simple (ปัจจุบัน/กิจวัตร)',
      timeClue: 'always',
      timeClueTh: 'เสมอๆ (กิจวัตร)',
      sentenceParts: ['The shadow wolf always', '_____', 'silently in the dark forest.'],
      correctAnswer: 'hunts',
      meaningTh: 'หมาป่าเงาออกล่าอย่างเงียบเชียบในป่ามืดมิดอยู่เสมอ',
      cards: [
        { text: 'hunts', tense: 'present_simple', labelTh: 'ออกล่าเสมอ (V.1 + s)', isCorrect: true },
        { text: 'is hunting', tense: 'present_continuous', labelTh: 'กำลังออกล่า', isCorrect: false },
        { text: 'hunted', tense: 'past_simple', labelTh: 'ล่าไปแล้วในอดีต', isCorrect: false },
        { text: 'will hunt', tense: 'future_simple', labelTh: 'จะล่าในอนาคต', isCorrect: false }
      ]
    },
    {
      id: 'w4',
      petId: 5,
      beastType: 'wolf',
      scene: 'galaxy',
      petAction: 'hunt',
      tense: 'future_simple',
      tenseNameTh: 'Future Simple (อนาคต)',
      timeClue: 'Soon',
      timeClueTh: 'ในไม่ช้า (อนาคต)',
      sentenceParts: ['Soon, the alpha wolf', '_____', 'the whole pack across the valley.'],
      correctAnswer: 'will lead',
      meaningTh: 'ในไม่ช้า จ่าฝูงหมาป่าจะนำพาฝูงทั้งหมดข้ามหุบเขาไป',
      cards: [
        { text: 'will lead', tense: 'future_simple', labelTh: 'จะนำทางในอนาคต (will + V.1)', isCorrect: true },
        { text: 'leads', tense: 'present_simple', labelTh: 'นำทางเป็นประจำ (V.1 + s)', isCorrect: false },
        { text: 'is leading', tense: 'present_continuous', labelTh: 'กำลังนำทางตอนนี้', isCorrect: false },
        { text: 'led', tense: 'past_simple', labelTh: 'นำทางไปแล้วในอดีต (V.2)', isCorrect: false }
      ]
    }
  ],

  // 6. Bear (Gaia Earth Bear - หมีพสุธาโบราณ)
  6: [
    {
      id: 'b1',
      petId: 6,
      beastType: 'bear',
      scene: 'forest',
      petAction: 'roar',
      tense: 'future_simple',
      tenseNameTh: 'Future Simple (อนาคต)',
      timeClue: 'Tomorrow',
      timeClueTh: 'วันพรุ่งนี้ (อนาคต)',
      sentenceParts: ['Tomorrow, the ancient bear', '_____', 'the great green forest.'],
      correctAnswer: 'will explore',
      meaningTh: 'วันพรุ่งนี้ เจ้าหมีโบราณจะออกสำรวจป่าเขียวขจีอันยิ่งใหญ่',
      cards: [
        { text: 'will explore', tense: 'future_simple', labelTh: 'จะออกสำรวจ (will + V.1)', isCorrect: true },
        { text: 'explores', tense: 'present_simple', labelTh: 'สำรวจเป็นประจำ (V.1 + s)', isCorrect: false },
        { text: 'is exploring', tense: 'present_continuous', labelTh: 'กำลังสำรวจตอนนี้', isCorrect: false },
        { text: 'explored', tense: 'past_simple', labelTh: 'สำรวจไปแล้วในอดีต', isCorrect: false }
      ]
    },
    {
      id: 'b2',
      petId: 6,
      beastType: 'bear',
      scene: 'forest',
      petAction: 'roar',
      tense: 'present_continuous',
      tenseNameTh: 'Present Continuous (กำลังทำอยู่)',
      timeClue: 'Look! / right now',
      timeClueTh: 'ดูสิ! / ตอนนี้เลย',
      sentenceParts: ['Look! The earth bear', '_____', 'the giant tree right now!'],
      correctAnswer: 'is shaking',
      meaningTh: 'ดูสิ! หมีพสุธากำลังเขย่าต้นไม้ยักษ์ในตอนนี้เลย!',
      cards: [
        { text: 'is shaking', tense: 'present_continuous', labelTh: 'กำลังเขย่าตอนนี้ (is + V-ing)', isCorrect: true },
        { text: 'shakes', tense: 'present_simple', labelTh: 'เขย่าเป็นประจำ (V.1 + s)', isCorrect: false },
        { text: 'shook', tense: 'past_simple', labelTh: 'เขย่าไปแล้วในอดีต (V.2)', isCorrect: false },
        { text: 'will shake', tense: 'future_simple', labelTh: 'จะเขย่าในอนาคต', isCorrect: false }
      ]
    },
    {
      id: 'b3',
      petId: 6,
      beastType: 'bear',
      scene: 'forest',
      petAction: 'hunt',
      tense: 'present_simple',
      tenseNameTh: 'Present Simple (ปัจจุบัน/กิจวัตร)',
      timeClue: 'every afternoon',
      timeClueTh: 'ทุกๆ บ่าย (กิจวัตร)',
      sentenceParts: ['The giant bear usually', '_____', 'sweet berries every afternoon.'],
      correctAnswer: 'eats',
      meaningTh: 'พญาหมียักษ์มักจะกินผลเบอร์รี่หวานหอมทุกๆ ช่วงบ่าย',
      cards: [
        { text: 'eats', tense: 'present_simple', labelTh: 'กินเป็นประจำ (V.1 + s)', isCorrect: true },
        { text: 'eat', tense: 'present_simple', labelTh: 'รูปไม่เติม s (ใช้กับหลายตัว)', isCorrect: false },
        { text: 'is eating', tense: 'present_continuous', labelTh: 'กำลังกินตอนนี้', isCorrect: false },
        { text: 'ate', tense: 'past_simple', labelTh: 'กินไปแล้วในอดีต (V.2)', isCorrect: false }
      ]
    },
    {
      id: 'b4',
      petId: 6,
      beastType: 'bear',
      scene: 'forest',
      petAction: 'sleeping',
      tense: 'past_simple',
      tenseNameTh: 'Past Simple (อดีต)',
      timeClue: 'Last winter',
      timeClueTh: 'ฤดูหนาวที่แล้ว (อดีต)',
      sentenceParts: ['Last winter, the stone bear', '_____', 'peacefully inside the cave.'],
      correctAnswer: 'slept',
      meaningTh: 'ฤดูหนาวที่แล้ว หมีศิลาได้นอนหลับจำศีลอย่างสงบอยู่ภายในถ้ำ',
      cards: [
        { text: 'slept', tense: 'past_simple', labelTh: 'นอนหลับไปแล้ว (sleep -> slept)', isCorrect: true },
        { text: 'sleeps', tense: 'present_simple', labelTh: 'นอนเป็นประจำ (V.1 + s)', isCorrect: false },
        { text: 'is sleeping', tense: 'present_continuous', labelTh: 'กำลังนอนตอนนี้', isCorrect: false },
        { text: 'will sleep', tense: 'future_simple', labelTh: 'จะนอนในอนาคต', isCorrect: false }
      ]
    }
  ],

  // 7. Fox (Mystic Star Fox - จิ้งจอกดาราเวท)
  7: [
    {
      id: 'f1',
      petId: 7,
      beastType: 'fox',
      scene: 'galaxy',
      petAction: 'catch_lightning',
      tense: 'present_continuous',
      tenseNameTh: 'Present Continuous (กำลังทำอยู่)',
      timeClue: 'Look! / right now',
      timeClueTh: 'ดูนั่นสิ! / ตอนนี้เลย',
      sentenceParts: ['Look! The nine-tailed fox', '_____', 'with cosmic starlight right now!'],
      correctAnswer: 'is glowing',
      meaningTh: 'ดูนั่นสิ! จิ้งจอกเก้าหางกำลังเปล่งประกายแสงดวงดาวในตอนนี้เลย!',
      cards: [
        { text: 'is glowing', tense: 'present_continuous', labelTh: 'กำลังเปล่งแสง (is + V-ing)', isCorrect: true },
        { text: 'glows', tense: 'present_simple', labelTh: 'เปล่งแสงเสมอ (V.1 + s)', isCorrect: false },
        { text: 'glowed', tense: 'past_simple', labelTh: 'เปล่งแสงไปแล้วในอดีต', isCorrect: false },
        { text: 'will glow', tense: 'future_simple', labelTh: 'จะเปล่งแสงในอนาคต', isCorrect: false }
      ]
    },
    {
      id: 'f2',
      petId: 7,
      beastType: 'fox',
      scene: 'galaxy',
      petAction: 'hunt',
      tense: 'present_simple',
      tenseNameTh: 'Present Simple (ปัจจุบัน/กิจวัตร)',
      timeClue: 'often',
      timeClueTh: 'บ่อยๆ (กิจวัตร)',
      sentenceParts: ['The magical fox often', '_____', 'under the shimmering aurora.'],
      correctAnswer: 'dances',
      meaningTh: 'จิ้งจอกเวทมนตร์มักจะร่ายรำใต้แสงออโรร่าระยิบระยับอยู่บ่อยๆ',
      cards: [
        { text: 'dances', tense: 'present_simple', labelTh: 'ร่ายรำบ่อยๆ (V.1 + s)', isCorrect: true },
        { text: 'is dancing', tense: 'present_continuous', labelTh: 'กำลังร่ายรำตอนนี้', isCorrect: false },
        { text: 'danced', tense: 'past_simple', labelTh: 'ร่ายรำไปแล้วในอดีต', isCorrect: false },
        { text: 'will dance', tense: 'future_simple', labelTh: 'จะร่ายรำในอนาคต', isCorrect: false }
      ]
    },
    {
      id: 'f3',
      petId: 7,
      beastType: 'fox',
      scene: 'galaxy',
      petAction: 'hunt',
      tense: 'past_simple',
      tenseNameTh: 'Past Simple (อดีต)',
      timeClue: 'Yesterday',
      timeClueTh: 'เมื่อวานนี้ (อดีต)',
      sentenceParts: ['Yesterday, the astral fox', '_____', 'a fallen magical star.'],
      correctAnswer: 'found',
      meaningTh: 'เมื่อวานนี้ จิ้งจอกดาราได้พบดวงดาวเวทมนตร์ที่ตกลงมา',
      cards: [
        { text: 'found', tense: 'past_simple', labelTh: 'พบเจอไปแล้ว (find -> found)', isCorrect: true },
        { text: 'finds', tense: 'present_simple', labelTh: 'พบเจอเป็นประจำ (V.1 + s)', isCorrect: false },
        { text: 'is finding', tense: 'present_continuous', labelTh: 'กำลังค้นหาตอนนี้', isCorrect: false },
        { text: 'will find', tense: 'future_simple', labelTh: 'จะพบเจอในอนาคต', isCorrect: false }
      ]
    },
    {
      id: 'f4',
      petId: 7,
      beastType: 'fox',
      scene: 'galaxy',
      petAction: 'flying',
      tense: 'future_simple',
      tenseNameTh: 'Future Simple (อนาคต)',
      timeClue: 'Next month',
      timeClueTh: 'เดือนหน้า (อนาคต)',
      sentenceParts: ['Next month, the cosmic fox', '_____', 'to a distant galaxy.'],
      correctAnswer: 'will travel',
      meaningTh: 'เดือนหน้า จิ้งจอกคอสมิกจะเดินทางไปยังดวงดาวกาแล็กซีอันไกลโพ้น',
      cards: [
        { text: 'will travel', tense: 'future_simple', labelTh: 'จะเดินทางในอนาคต (will + V.1)', isCorrect: true },
        { text: 'travels', tense: 'present_simple', labelTh: 'เดินทางเป็นประจำ (V.1 + s)', isCorrect: false },
        { text: 'is traveling', tense: 'present_continuous', labelTh: 'กำลังเดินทางตอนนี้', isCorrect: false },
        { text: 'traveled', tense: 'past_simple', labelTh: 'เดินทางไปแล้วในอดีต', isCorrect: false }
      ]
    }
  ],

  // 8. Lion (Golden Sun Lion - สิงโตสุริยันสีทอง)
  8: [
    {
      id: 'l1',
      petId: 8,
      beastType: 'lion',
      scene: 'temple',
      petAction: 'defend',
      tense: 'present_simple',
      tenseNameTh: 'Present Simple (ปัจจุบัน/กิจวัตร)',
      timeClue: 'always',
      timeClueTh: 'เสมอๆ (กิจวัตร)',
      sentenceParts: ['The golden lion always', '_____', 'the ancient sun temple.'],
      correctAnswer: 'protects',
      meaningTh: 'สิงโตสีทองปกป้องวิหารสุริยันโบราณอยู่เสมอ',
      cards: [
        { text: 'protects', tense: 'present_simple', labelTh: 'ปกป้องเป็นประจำ (V.1 + s)', isCorrect: true },
        { text: 'is protecting', tense: 'present_continuous', labelTh: 'กำลังปกป้องตอนนี้', isCorrect: false },
        { text: 'protected', tense: 'past_simple', labelTh: 'ปกป้องไปแล้วในอดีต', isCorrect: false },
        { text: 'will protect', tense: 'future_simple', labelTh: 'จะปกป้องในอนาคต', isCorrect: false }
      ]
    },
    {
      id: 'l2',
      petId: 8,
      beastType: 'lion',
      scene: 'temple',
      petAction: 'roar',
      tense: 'present_continuous',
      tenseNameTh: 'Present Continuous (กำลังทำอยู่)',
      timeClue: 'Listen! / now',
      timeClueTh: 'ฟังดูสิ! / ตอนนี้',
      sentenceParts: ['Listen! The sun lion', '_____', 'loudly on top of the rock now!'],
      correctAnswer: 'is roaring',
      meaningTh: 'ฟังดูสิ! สิงโตสุริยันกำลังคำรามกึกก้องบนยอดหินในตอนนี้เลย!',
      cards: [
        { text: 'is roaring', tense: 'present_continuous', labelTh: 'กำลังคำราม (is + V-ing)', isCorrect: true },
        { text: 'roars', tense: 'present_simple', labelTh: 'คำรามเป็นประจำ (V.1 + s)', isCorrect: false },
        { text: 'roared', tense: 'past_simple', labelTh: 'คำรามไปแล้วในอดีต', isCorrect: false },
        { text: 'will roar', tense: 'future_simple', labelTh: 'จะคำรามในอนาคต', isCorrect: false }
      ]
    },
    {
      id: 'l3',
      petId: 8,
      beastType: 'lion',
      scene: 'temple',
      petAction: 'defend',
      tense: 'past_simple',
      tenseNameTh: 'Past Simple (อดีต)',
      timeClue: 'Two days ago',
      timeClueTh: '2 วันที่แล้ว (อดีต)',
      sentenceParts: ['Two days ago, the royal lion', '_____', 'the sacred golden crown.'],
      correctAnswer: 'guarded',
      meaningTh: 'สองวันที่แล้ว สิงโตผู้สง่างามได้เฝ้าอารักขามงกุฎทองคำศักดิ์สิทธิ์',
      cards: [
        { text: 'guarded', tense: 'past_simple', labelTh: 'เฝ้าไปแล้วในอดีต (V.2 เติม -ed)', isCorrect: true },
        { text: 'guards', tense: 'present_simple', labelTh: 'เฝ้าเป็นประจำ (V.1 + s)', isCorrect: false },
        { text: 'is guarding', tense: 'present_continuous', labelTh: 'กำลังเฝ้าตอนนี้', isCorrect: false },
        { text: 'will guard', tense: 'future_simple', labelTh: 'จะเฝ้าในอนาคต', isCorrect: false }
      ]
    },
    {
      id: 'l4',
      petId: 8,
      beastType: 'lion',
      scene: 'temple',
      petAction: 'roar',
      tense: 'future_simple',
      tenseNameTh: 'Future Simple (อนาคต)',
      timeClue: 'Tomorrow',
      timeClueTh: 'วันพรุ่งนี้ (อนาคต)',
      sentenceParts: ['Tomorrow at sunrise, its mane', '_____', 'like pure gold.'],
      correctAnswer: 'will shine',
      meaningTh: 'วันพรุ่งนี้ยามพระอาทิตย์ขึ้น แผงคอของมันจะเปล่งประกายดั่งทองคำบริสุทธิ์',
      cards: [
        { text: 'will shine', tense: 'future_simple', labelTh: 'จะส่องประกาย (will + V.1)', isCorrect: true },
        { text: 'shines', tense: 'present_simple', labelTh: 'ส่องประกายประจำ (V.1 + s)', isCorrect: false },
        { text: 'is shining', tense: 'present_continuous', labelTh: 'กำลังส่องประกาย', isCorrect: false },
        { text: 'shone', tense: 'past_simple', labelTh: 'ส่องประกายไปแล้วในอดีต', isCorrect: false }
      ]
    }
  ],

  // 9. Stag (Emerald Forest Stag - กวางมรกตไพรสณฑ์)
  9: [
    {
      id: 's1',
      petId: 9,
      beastType: 'stag',
      scene: 'forest',
      petAction: 'hunt',
      tense: 'past_simple',
      tenseNameTh: 'Past Simple (อดีต)',
      timeClue: 'Yesterday morning',
      timeClueTh: 'เมื่อวานตอนเช้า (อดีต)',
      sentenceParts: ['Yesterday morning, the emerald stag', '_____', 'through the misty woods.'],
      correctAnswer: 'walked',
      meaningTh: 'เมื่อวานตอนเช้า กวางมรกตได้เดินผ่านป่าหมอกไปแล้ว',
      cards: [
        { text: 'walked', tense: 'past_simple', labelTh: 'เดินไปแล้วในอดีต (V.2 เติม -ed)', isCorrect: true },
        { text: 'walks', tense: 'present_simple', labelTh: 'เดินเป็นประจำ (V.1 + s)', isCorrect: false },
        { text: 'is walking', tense: 'present_continuous', labelTh: 'กำลังเดินอยู่ตอนนี้', isCorrect: false },
        { text: 'will walk', tense: 'future_simple', labelTh: 'จะเดินในอนาคต', isCorrect: false }
      ]
    },
    {
      id: 's2',
      petId: 9,
      beastType: 'stag',
      scene: 'forest',
      petAction: 'hunt',
      tense: 'present_simple',
      tenseNameTh: 'Present Simple (ปัจจุบัน/กิจวัตร)',
      timeClue: 'usually',
      timeClueTh: 'โดยปกติ (กิจวัตร)',
      sentenceParts: ['The forest stag usually', '_____', 'water from the crystal spring.'],
      correctAnswer: 'drinks',
      meaningTh: 'กวางแห่งป่ามักจะดื่มน้ำจากตาน้ำคริสตัลเป็นประจำ',
      cards: [
        { text: 'drinks', tense: 'present_simple', labelTh: 'ดื่มเป็นประจำ (V.1 + s)', isCorrect: true },
        { text: 'drink', tense: 'present_simple', labelTh: 'รูปไม่เติม s', isCorrect: false },
        { text: 'is drinking', tense: 'present_continuous', labelTh: 'กำลังดื่มน้ำตอนนี้', isCorrect: false },
        { text: 'drank', tense: 'past_simple', labelTh: 'ดื่มไปแล้วในอดีต (V.2)', isCorrect: false }
      ]
    },
    {
      id: 's3',
      petId: 9,
      beastType: 'stag',
      scene: 'forest',
      petAction: 'hunt',
      tense: 'present_continuous',
      tenseNameTh: 'Present Continuous (กำลังทำอยู่)',
      timeClue: 'Look! / now',
      timeClueTh: 'ดูสิ! / ตอนนี้',
      sentenceParts: ['Look! The noble stag', '_____', 'across the green meadow now!'],
      correctAnswer: 'is running',
      meaningTh: 'ดูสิ! พญากวางผู้สง่างามกำลังวิ่งข้ามทุ่งหญ้าเขียวขจีในตอนนี้เลย!',
      cards: [
        { text: 'is running', tense: 'present_continuous', labelTh: 'กำลังวิ่งตอนนี้ (is + V-ing)', isCorrect: true },
        { text: 'runs', tense: 'present_simple', labelTh: 'วิ่งเป็นประจำ (V.1 + s)', isCorrect: false },
        { text: 'ran', tense: 'past_simple', labelTh: 'วิ่งไปแล้วในอดีต (V.2)', isCorrect: false },
        { text: 'will run', tense: 'future_simple', labelTh: 'จะวิ่งในอนาคต', isCorrect: false }
      ]
    },
    {
      id: 's4',
      petId: 9,
      beastType: 'stag',
      scene: 'forest',
      petAction: 'hunt',
      tense: 'future_simple',
      tenseNameTh: 'Future Simple (อนาคต)',
      timeClue: 'Next week',
      timeClueTh: 'สัปดาห์หน้า (อนาคต)',
      sentenceParts: ['Next week, the spirit stag', '_____', 'travelers through the deep forest.'],
      correctAnswer: 'will guide',
      meaningTh: 'สัปดาห์หน้า กวางวิญญาณจะนำทางเหล่านักเดินทางผ่านป่าลึก',
      cards: [
        { text: 'will guide', tense: 'future_simple', labelTh: 'จะนำทางในอนาคต (will + V.1)', isCorrect: true },
        { text: 'guides', tense: 'present_simple', labelTh: 'นำทางเป็นประจำ (V.1 + s)', isCorrect: false },
        { text: 'is guiding', tense: 'present_continuous', labelTh: 'กำลังนำทางตอนนี้', isCorrect: false },
        { text: 'guided', tense: 'past_simple', labelTh: 'นำทางไปแล้วในอดีต', isCorrect: false }
      ]
    }
  ],

  // 10. Unicorn (Celestial Moon Unicorn - ยูนิคอร์นจันทราสวรรค์)
  10: [
    {
      id: 'u1',
      petId: 10,
      beastType: 'unicorn',
      scene: 'galaxy',
      petAction: 'sleeping',
      tense: 'present_simple',
      tenseNameTh: 'Present Simple (ปัจจุบัน/กิจวัตร)',
      timeClue: 'always',
      timeClueTh: 'เสมอๆ (กิจวัตร)',
      sentenceParts: ['The celestial unicorn always', '_____', 'peacefully under the starry sky.'],
      correctAnswer: 'sleeps',
      meaningTh: 'ยูนิคอร์นแห่งดวงดาวมักจะนอนหลับอย่างสงบใต้ท้องฟ้าดวงดาวอยู่เสมอ',
      cards: [
        { text: 'sleeps', tense: 'present_simple', labelTh: 'นอนหลับเสมอ (V.1 + s)', isCorrect: true },
        { text: 'is sleeping', tense: 'present_continuous', labelTh: 'กำลังนอนอยู่ตอนนี้', isCorrect: false },
        { text: 'slept', tense: 'past_simple', labelTh: 'นอนหลับไปแล้วในอดีต (V.2)', isCorrect: false },
        { text: 'will sleep', tense: 'future_simple', labelTh: 'จะนอนในอนาคต', isCorrect: false }
      ]
    },
    {
      id: 'u2',
      petId: 10,
      beastType: 'unicorn',
      scene: 'galaxy',
      petAction: 'catch_lightning',
      tense: 'present_continuous',
      tenseNameTh: 'Present Continuous (กำลังทำอยู่)',
      timeClue: 'Look! / right now',
      timeClueTh: 'ดูนั่นสิ! / ตอนนี้เลย',
      sentenceParts: ['Look! The unicorn horn', '_____', 'with rainbow light right now!'],
      correctAnswer: 'is glowing',
      meaningTh: 'ดูนั่นสิ! เขาของยูนิคอร์นกำลังเปล่งประกายแสงสีรุ้งในตอนนี้เลย!',
      cards: [
        { text: 'is glowing', tense: 'present_continuous', labelTh: 'กำลังเปล่งแสง (is + V-ing)', isCorrect: true },
        { text: 'glows', tense: 'present_simple', labelTh: 'เปล่งแสงเสมอ (V.1 + s)', isCorrect: false },
        { text: 'glowed', tense: 'past_simple', labelTh: 'เปล่งแสงไปแล้วในอดีต', isCorrect: false },
        { text: 'will glow', tense: 'future_simple', labelTh: 'จะเปล่งแสงในอนาคต', isCorrect: false }
      ]
    },
    {
      id: 'u3',
      petId: 10,
      beastType: 'unicorn',
      scene: 'galaxy',
      petAction: 'catch_lightning',
      tense: 'past_simple',
      tenseNameTh: 'Past Simple (อดีต)',
      timeClue: 'Last night',
      timeClueTh: 'เมื่อคืนนี้ (อดีต)',
      sentenceParts: ['Last night, the moon unicorn', '_____', 'a hurt bird with its horn.'],
      correctAnswer: 'healed',
      meaningTh: 'เมื่อคืนนี้ ยูนิคอร์นจันทราได้รักษาลูกนกที่บาดเจ็บด้วยเขาของมัน',
      cards: [
        { text: 'healed', tense: 'past_simple', labelTh: 'รักษาไปแล้วในอดีต (V.2 เติม -ed)', isCorrect: true },
        { text: 'heals', tense: 'present_simple', labelTh: 'รักษาเป็นประจำ (V.1 + s)', isCorrect: false },
        { text: 'is healing', tense: 'present_continuous', labelTh: 'กำลังรักษาตอนนี้', isCorrect: false },
        { text: 'will heal', tense: 'future_simple', labelTh: 'จะรักษาในอนาคต', isCorrect: false }
      ]
    },
    {
      id: 'u4',
      petId: 10,
      beastType: 'unicorn',
      scene: 'galaxy',
      petAction: 'flying',
      tense: 'future_simple',
      tenseNameTh: 'Future Simple (อนาคต)',
      timeClue: 'Tomorrow',
      timeClueTh: 'วันพรุ่งนี้ (อนาคต)',
      sentenceParts: ['Tomorrow, the unicorn', '_____', 'the stars with its magic horn.'],
      correctAnswer: 'will touch',
      meaningTh: 'วันพรุ่งนี้ ยูนิคอร์นจะสัมผัสดวงดาวด้วยเขาเวทมนตร์ของมัน',
      cards: [
        { text: 'will touch', tense: 'future_simple', labelTh: 'จะสัมผัสในอนาคต (will + V.1)', isCorrect: true },
        { text: 'touches', tense: 'present_simple', labelTh: 'สัมผัสเป็นประจำ (V.1 + es)', isCorrect: false },
        { text: 'is touching', tense: 'present_continuous', labelTh: 'กำลังสัมผัสตอนนี้', isCorrect: false },
        { text: 'touched', tense: 'past_simple', labelTh: 'สัมผัสไปแล้วในอดีต', isCorrect: false }
      ]
    }
  ]
};

window.CHRONO_QUESTS_BY_PET = CHRONO_QUESTS_BY_PET;
