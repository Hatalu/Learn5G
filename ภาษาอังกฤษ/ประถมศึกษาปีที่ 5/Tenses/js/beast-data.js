/**
 * Chrono-Beast: Data & Quest Definitions
 * Aligned with Grade 5 English Curriculum (สสวท.)
 * Kid-Friendly Edition: Rich Quests with Dynamic Scenes & Pet Actions
 */

const CHRONO_QUESTS = [
  {
    id: 1,
    beastId: 'dragon',
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
    id: 2,
    beastId: 'dragon',
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
    id: 3,
    beastId: 'dragon',
    scene: 'ruins',
    petAction: 'fight_monster',
    tense: 'past_simple',
    tenseNameTh: 'Past Simple (อดีต)',
    timeClue: 'Yesterday',
    timeClueTh: 'เมื่อวานนี้ (อดีต)',
    sentenceParts: ['Yesterday, our dragon', '_____', 'the dark shadow monster.'],
    correctAnswer: 'defeated',
    meaningTh: 'เมื่อวานนี้ มังกรของเราได้เอาชนะมอนสเตอร์เงาทมิฬไปแล้ว',
    cards: [
      { text: 'defeated', tense: 'past_simple', labelTh: 'เอาชนะไปแล้วในอดีต (V.2)', isCorrect: true },
      { text: 'defeats', tense: 'present_simple', labelTh: 'เอาชนะเป็นประจำ (V.1 + s)', isCorrect: false },
      { text: 'is defeating', tense: 'present_continuous', labelTh: 'กำลังเอาชนะอยู่ตอนนี้', isCorrect: false },
      { text: 'will defeat', tense: 'future_simple', labelTh: 'จะเอาชนะในอนาคต', isCorrect: false }
    ]
  },
  {
    id: 4,
    beastId: 'dragon',
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
    id: 5,
    beastId: 'tiger',
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
      { text: 'are roaring', tense: 'present_continuous', labelTh: 'กำลังคำราม (are + V-ing หลายตัว)', isCorrect: true },
      { text: 'is roaring', tense: 'present_continuous', labelTh: 'ใช้กับตัวเดียว (is roaring)', isCorrect: false },
      { text: 'roars', tense: 'present_simple', labelTh: 'คำรามเป็นประจำ (V.1 + s)', isCorrect: false },
      { text: 'roared', tense: 'past_simple', labelTh: 'คำรามไปแล้วในอดีต', isCorrect: false }
    ]
  },
  {
    id: 6,
    beastId: 'tiger',
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
    id: 7,
    beastId: 'tiger',
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
    id: 8,
    beastId: 'tiger',
    scene: 'forest',
    petAction: 'hunt',
    tense: 'future_simple',
    tenseNameTh: 'Future Simple (อนาคต)',
    timeClue: 'Next week',
    timeClueTh: 'สัปดาห์หน้า (อนาคต)',
    sentenceParts: ['Next week, the tiger', '_____', 'through the cyber forest.'],
    correctAnswer: 'will run',
    meaningTh: 'สัปดาห์หน้า เจ้าเสือจะวิ่งทะยานผ่านป่าไซเบอร์',
    cards: [
      { text: 'will run', tense: 'future_simple', labelTh: 'จะวิ่งในอนาคต (will + V.1)', isCorrect: true },
      { text: 'runs', tense: 'present_simple', labelTh: 'วิ่งเป็นประจำ (V.1 + s)', isCorrect: false },
      { text: 'is running', tense: 'present_continuous', labelTh: 'กำลังวิ่งอยู่ตอนนี้', isCorrect: false },
      { text: 'ran', tense: 'past_simple', labelTh: 'วิ่งไปแล้วในอดีต (V.2)', isCorrect: false }
    ]
  },
  {
    id: 9,
    beastId: 'gryphon',
    scene: 'storm',
    petAction: 'catch_lightning',
    tense: 'present_continuous',
    tenseNameTh: 'Present Continuous (กำลังทำอยู่)',
    timeClue: 'now',
    timeClueTh: 'ตอนนี้เลย',
    sentenceParts: ['Look! It', '_____', 'lightning sparks in the clouds now!'],
    correctAnswer: 'is catching',
    meaningTh: 'ดูนั่นสิ! มันกำลังจับประกายสายฟ้าในเมฆอยู่ตอนนี้เลย!',
    cards: [
      { text: 'is catching', tense: 'present_continuous', labelTh: 'กำลังจับอยู่ตอนนี้ (is + V-ing)', isCorrect: true },
      { text: 'catches', tense: 'present_simple', labelTh: 'จับเป็นประจำ (V.1 + es)', isCorrect: false },
      { text: 'caught', tense: 'past_simple', labelTh: 'จับไปแล้วในอดีต (V.2)', isCorrect: false },
      { text: 'will catch', tense: 'future_simple', labelTh: 'จะจับในอนาคต', isCorrect: false }
    ]
  },
  {
    id: 10,
    beastId: 'gryphon',
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
    id: 11,
    beastId: 'lion',
    scene: 'temple',
    petAction: 'defend',
    tense: 'present_simple',
    tenseNameTh: 'Present Simple (ปัจจุบัน/กิจวัตร)',
    timeClue: 'every single day',
    timeClueTh: 'ทุกๆ วัน (กิจวัตรประจำ)',
    sentenceParts: ['The guardians', '_____', 'the Time Temple every single day.'],
    correctAnswer: 'protect',
    meaningTh: 'เหล่าผู้พิทักษ์ปกป้องวิหารกาลเวลาอยู่เสมอทุกๆ วัน',
    cards: [
      { text: 'protect', tense: 'present_simple', labelTh: 'ปกป้องเป็นประจำ (ประธานพหูพจน์)', isCorrect: true },
      { text: 'protects', tense: 'present_simple', labelTh: 'เติม s (ใช้เมื่อประธานคนเดียว)', isCorrect: false },
      { text: 'is protecting', tense: 'present_continuous', labelTh: 'กำลังปกป้อง', isCorrect: false },
      { text: 'protected', tense: 'past_simple', labelTh: 'ปกป้องไปแล้วในอดีต', isCorrect: false }
    ]
  },
  {
    id: 12,
    beastId: 'phoenix',
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
    id: 13,
    beastId: 'wolf',
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
    id: 14,
    beastId: 'unicorn',
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
    id: 15,
    beastId: 'bear',
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
    id: 16,
    beastId: 'stag',
    scene: 'forest',
    petAction: 'hunt',
    tense: 'past_simple',
    tenseNameTh: 'Past Simple (อดีต)',
    timeClue: 'Yesterday morning',
    timeClueTh: 'เมื่อวานตอนเช้า (อดีต)',
    sentenceParts: ['Yesterday morning, the emerald stag', '_____', 'through the magical woods.'],
    correctAnswer: 'walked',
    meaningTh: 'เมื่อวานตอนเช้า กวางมรกตได้เดินผ่านป่าเวทมนตร์ไปแล้ว',
    cards: [
      { text: 'walked', tense: 'past_simple', labelTh: 'เดินไปแล้วในอดีต (V.2 เติม -ed)', isCorrect: true },
      { text: 'walks', tense: 'present_simple', labelTh: 'เดินเป็นประจำ (V.1 + s)', isCorrect: false },
      { text: 'is walking', tense: 'present_continuous', labelTh: 'กำลังเดินอยู่ตอนนี้', isCorrect: false },
      { text: 'will walk', tense: 'future_simple', labelTh: 'จะเดินในอนาคต', isCorrect: false }
    ]
  }
];

window.CHRONO_QUESTS = CHRONO_QUESTS;
