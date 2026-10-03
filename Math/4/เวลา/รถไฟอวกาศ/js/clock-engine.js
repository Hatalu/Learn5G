/**
 * Chrono-Express Clock Engine
 * Mathematical and Educational Model for Time (Grade 4 IPST / สสวท.)
 */

class ClockEngine {
  constructor() {
    this.DAY_START_HOUR = 6;  // 06:00 น. เริ่มเวลากลางวัน
    this.NIGHT_START_HOUR = 18; // 18:00 น. เริ่มเวลากลางคืน
  }

  // Normalize minute to 0..1439 (one 24h cycle)
  normalizeMinutes(totalMinutes) {
    const minInDay = 24 * 60;
    return ((totalMinutes % minInDay) + minInDay) % minInDay;
  }

  // Convert total minutes from midnight to { hours, minutes }
  minutesToTime(totalMinutes) {
    const normalized = this.normalizeMinutes(totalMinutes);
    const hours = Math.floor(normalized / 60);
    const minutes = normalized % 60;
    const isDay = hours >= this.DAY_START_HOUR && hours < this.NIGHT_START_HOUR;

    return {
      hours,
      minutes,
      totalMinutes: normalized,
      isDay,
      periodLabel: isDay ? 'กลางวัน' : 'กลางคืน',
      thaiOralName: this.getThaiOralName(hours, minutes)
    };
  }

  // Convert hours and minutes to total minutes
  timeToMinutes(hours, minutes) {
    return hours * 60 + minutes;
  }

  // Pad two digits (e.g. 8 -> "08")
  pad2(n) {
    return n.toString().padStart(2, '0');
  }

  // Format as Thai official 24-hour notation: "08:45 น."
  format24H(hours, minutes) {
    return `${this.pad2(hours)}:${this.pad2(minutes)} น.`;
  }

  // Format elapsed time duration as "X ชั่วโมง Y นาที"
  formatDuration(durationMinutes) {
    const hrs = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    if (hrs === 0) return `${mins} นาที`;
    if (mins === 0) return `${hrs} ชั่วโมง`;
    return `${hrs} ชั่วโมง ${mins} นาที`;
  }

  // Calculate elapsed time between start and end (supports crossing midnight)
  getElapsedMinutes(startTotalMin, endTotalMin) {
    let diff = endTotalMin - startTotalMin;
    if (diff < 0) {
      diff += 24 * 60; // crossed midnight
    }
    return diff;
  }

  // Add duration (in minutes) to a time
  addDuration(hours, minutes, durationMin) {
    const startMin = this.timeToMinutes(hours, minutes);
    const endMin = startMin + durationMin;
    const crossedMidnight = Math.floor(endMin / 1440) > Math.floor(startMin / 1440);
    const resultTime = this.minutesToTime(endMin);
    return {
      ...resultTime,
      crossedMidnight
    };
  }

  // Subtract duration (in minutes) from a time
  subtractDuration(hours, minutes, durationMin) {
    const endMin = this.timeToMinutes(hours, minutes);
    let startMin = endMin - durationMin;
    let crossedBackwardsMidnight = startMin < 0;
    const resultTime = this.minutesToTime(startMin);
    return {
      ...resultTime,
      crossedMidnight: crossedBackwardsMidnight
    };
  }

  // Get rotation degrees for clock hands
  getHandAngles(hours, minutes) {
    const minuteAngle = minutes * 6; // 360 / 60 = 6 deg/min
    const hour12 = hours % 12;
    const hourAngle = hour12 * 30 + minutes * 0.5; // 360 / 12 = 30 deg/hr + 0.5 deg/min
    return {
      minuteAngle,
      hourAngle
    };
  }

  // Thai colloquial / spoken time descriptions to bridge understanding
  getThaiOralName(h, m) {
    const minText = m === 0 ? '' : ` ${m} นาที`;
    if (h === 0 && m === 0) return 'เที่ยงคืนตรง';
    if (h === 12 && m === 0) return 'เที่ยงวันตรง';

    // กลางวัน (06:00 - 17:59)
    if (h === 6) return `หกโมงเช้า${minText}`;
    if (h >= 7 && h <= 11) return `${h - 6} โมงเช้า${minText}`;
    if (h === 12) return `เที่ยง${minText}`;
    if (h === 13) return `บ่ายโมง${minText}`;
    if (h >= 14 && h <= 15) return `บ่าย ${h - 12} โมง${minText}`;
    if (h >= 16 && h <= 18) return `${h - 12} โมงเย็น${minText}`;

    // กลางคืน (19:00 - 05:59)
    if (h >= 19 && h <= 23) return `${h - 18} ทุ่ม${minText}`;
    if (h === 0) return `เที่ยงคืน${minText}`;
    if (h >= 1 && h <= 5) return `ตี ${h}${minText}`;

    return `${this.pad2(h)}:${this.pad2(m)} น.`;
  }
}

window.clockEngine = new ClockEngine();
