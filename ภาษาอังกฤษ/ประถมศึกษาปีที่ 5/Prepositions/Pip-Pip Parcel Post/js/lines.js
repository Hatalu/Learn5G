/* ═══════════════════════════════════════════════════════════
   PIP-PIP PARCEL POST — บทพูดตัวละคร (ประโยคอังกฤษสั้น ๆ + คำแปลไทยใต้กล่องคำพูด)
   [ผู้พูด, อังกฤษ (พูดและแสดง), ไทย (แสดงอย่างเดียว ไม่พากย์)]
   ผู้พูด: p = Pip (ปิ๊บ นกไปรษณีย์ ผู้นำทาง)   w = Whoosh (ฟู่ว พายุจอมซน)
   ไฟล์เสียง: audio/en/l_<id>.mp3 (ถ้าไม่มีไฟล์ใช้เสียงอ่านอังกฤษของเบราว์เซอร์แทน)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const PP = window.PP = window.PP || {};

  PP.LINES = {
    /* ── เปิดเรื่อง ── */
    intro1: ['p', "Hi! I'm Pip. I deliver parcels!", 'สวัสดี! เราชื่อปิ๊บ เป็นนกไปรษณีย์!'],
    intro2: ['p', 'Oh no! The little words are gone!', 'ตายแล้ว! คำเล็ก ๆ หายหมดเลย!'],
    whooshIntro: ['w', 'Hehe! I blew them all away!', 'ฮิฮิ! ข้าเป่ามันปลิวหมดแล้ว!'],
    intro3: ['p', "Let's get them back. Come on!", 'ไปเอาคืนกัน! ตามมาเลย!'],

    /* ── เปิดแต่ละโซน ── */
    z1: ['p', 'Mailbox Lane! In, on, at.', 'ซอยตู้ไปรษณีย์! in, on, at'],
    z2: ['p', 'Shelf Hill! Under, above, between.', 'เนินชั้นวางของ! under, above, between'],
    z3: ['p', 'Map Square! Find the right place.', 'ลานแผนที่! หาที่ให้ถูกนะ'],
    z4: ['p', 'Clock Tower! At, on, in for time.', 'หอนาฬิกา! at, on, in บอกเวลา'],
    z5: ['p', 'Harbor Station! How do we go?', 'ท่าเรือ! เราไปด้วยวิธีไหน?'],
    z6: ['w', 'You found me! Try my tower!', 'หาข้าเจอแล้วหรือ! ลองหอคอยข้าดู!'],

    /* ── ผลตอบรับ ── */
    yay1: ['p', 'Great job!', 'เก่งมาก!'],
    yay2: ['p', 'Super!', 'สุดยอด!'],
    yay3: ['p', 'You got it!', 'ใช่เลย!'],
    yay4: ['p', 'Perfect!', 'เยี่ยมไปเลย!'],
    yay5: ['p', 'Wow! Well done!', 'ว้าว! ทำได้ดีมาก!'],
    oops1: ['p', 'Not quite. Try again!', 'ยังไม่ใช่ ลองอีกที!'],
    oops2: ['p', 'Almost! Look again.', 'เกือบแล้ว! ดูอีกที'],
    oops3: ['p', "That's okay. Try again.", 'ไม่เป็นไร ลองใหม่นะ'],
    oops4: ['p', 'Hmm. Listen again.', 'อืม ฟังอีกครั้งนะ'],
    hintA: ['p', "Here's a clue!", 'ใบ้ให้นิดนึง!'],
    hintB: ['p', 'Let me help you.', 'ปิ๊บช่วยนะ'],
    goodTry: ['p', 'Good try!', 'พยายามได้ดีมาก!'],

    /* ── ในภารกิจ ── */
    listen: ['p', 'Listen!', 'ฟังนะ!'],
    sayIt: ['p', 'Now you say it!', 'ทีนี้ถึงตาเธอพูด!'],
    tapWord: ['p', 'Tap a word!', 'แตะคำเลย!'],
    micOn: ['p', 'Press the mic and say it.', 'กดไมค์แล้วพูดเลย'],
    micHear: ['p', "I'm listening...", 'ปิ๊บกำลังฟังอยู่...'],
    micRetry: ['p', "I can't hear you. Try again!", 'ปิ๊บยังไม่ได้ยิน ลองอีกที!'],
    findWords: ['p', 'Find the little words!', 'หาคำเล็ก ๆ ให้เจอ!'],
    sortTime: ['p', 'Which little word? At, on or in?', 'ใช้คำไหนดี? at, on หรือ in?'],

    /* ── แผนที่ / ภารกิจพิเศษ ── */
    bonus: ['p', "You're great! Try a challenge?", 'เก่งจัง! ลองข้อท้าทายไหม?'],
    easyOffer: ['p', "Let's practice a little more.", 'ซ้อมอีกนิดนะ'],
    zoneClear: ['p', 'Zone clear! Take your stars!', 'ผ่านโซนแล้ว! รับดาวเลย!'],
    mapStart: ['p', 'Tap the glowing place!', 'แตะที่ที่เรืองแสงเลย!'],
    mapLock: ['p', 'Not open yet. Finish the one before.', 'ยังไม่เปิด เล่นอันก่อนหน้าก่อนนะ'],
    mapDone: ['p', "All done! Let's find Whoosh!", 'ครบแล้ว! ไปหาฟู่วกัน!'],
    whooshHit: ['w', "Ouch! I won't give up!", 'โอ๊ย! ข้ายังไม่ยอมแพ้!'],
    whooshLose: ['w', "Oh no... I give up. I'm sorry!", 'ฮือ ๆ ข้าแพ้แล้ว ข้าขอโทษ!'],
    end1: ['p', 'We did it! The post is safe!', 'เราทำได้! ไปรษณีย์ปลอดภัยแล้ว!'],
    end2: ['p', "You're a great helper. Thank you!", 'เธอเป็นผู้ช่วยที่เก่งมาก ขอบคุณนะ!'],

    /* ── คำถามพูดตอบ ── */
    qWhereCat: ['p', 'Where is the cat?', 'แมวอยู่ที่ไหน?'],
    qWhereParcel: ['p', 'Where is the parcel?', 'พัสดุอยู่ที่ไหน?'],
    qWhereBall: ['p', 'Where is the ball?', 'ลูกบอลอยู่ที่ไหน?'],
    qWhereBird: ['p', 'Where is the bird?', 'นกอยู่ที่ไหน?'],
    qWherePip: ['p', 'Where is Pip?', 'ปิ๊บอยู่ที่ไหน?'],
    qWhereBook: ['p', 'Where is the book?', 'หนังสืออยู่ที่ไหน?'],
    qOpen: ['p', 'When does the post office open?', 'ที่ทำการไปรษณีย์เปิดเมื่อไร?'],
    qGo: ['p', 'How do you go to school?', 'เธอไปโรงเรียนอย่างไร?']
  };
})();
