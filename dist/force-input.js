(() => {
  // node_modules/jalaali-js/dist/index.js
  var BREAKS = [
    -61,
    9,
    38,
    199,
    426,
    686,
    756,
    818,
    1111,
    1181,
    1210,
    1635,
    2060,
    2097,
    2192,
    2262,
    2324,
    2394,
    2456,
    3178
  ];
  var MIN_JALAALI_YEAR = BREAKS[0];
  var MAX_JALAALI_YEAR = BREAKS[BREAKS.length - 1] - 1;
  function toJalaali(gyOrDate, gm, gd) {
    if (gyOrDate instanceof Date) return d2j(g2d(gyOrDate.getFullYear(), gyOrDate.getMonth() + 1, gyOrDate.getDate()));
    return d2j(g2d(gyOrDate, gm, gd));
  }
  function toGregorian(jy, jm, jd) {
    return d2g(j2d(jy, jm, jd));
  }
  function isValidJalaaliDate(jy, jm, jd) {
    return jy >= MIN_JALAALI_YEAR && jy <= MAX_JALAALI_YEAR && jm >= 1 && jm <= 12 && jd >= 1 && jd <= jalaaliMonthLength(jy, jm);
  }
  function isLeapJalaaliYear(jy) {
    return jalCalLeap(jy) === 0;
  }
  function jalaaliMonthLength(jy, jm) {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    return isLeapJalaaliYear(jy) ? 30 : 29;
  }
  function jalCal(jy) {
    const { gy, march, jump, n } = jalCalCore(jy);
    return {
      leap: leapFromCycle(jump, n),
      gy,
      march
    };
  }
  function jalCalShort(jy) {
    const { gy, march } = jalCalCore(jy);
    return {
      gy,
      march
    };
  }
  function j2d(jy, jm, jd) {
    const r = jalCalShort(jy);
    return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
  }
  var FIRST_JALAALI_JDN = j2d(MIN_JALAALI_YEAR, 1, 1);
  var LAST_JALAALI_JDN = j2d(MAX_JALAALI_YEAR, 12, jalaaliMonthLength(MAX_JALAALI_YEAR, 12));
  function d2j(jdn) {
    if (jdn < FIRST_JALAALI_JDN || jdn > LAST_JALAALI_JDN) throw new RangeError(`Invalid Julian Day number ${jdn}: outside the supported Jalaali range [${MIN_JALAALI_YEAR}, ${MAX_JALAALI_YEAR}]`);
    const gy = d2g(jdn).gy;
    let jy = Math.min(gy - 621, MAX_JALAALI_YEAR);
    const r = jalCal(jy);
    let k = jdn - g2d(r.gy, 3, r.march);
    if (k >= 0) {
      if (k <= 185) return {
        jy,
        jm: 1 + div(k, 31),
        jd: mod(k, 31) + 1
      };
      k -= 186;
    } else {
      jy -= 1;
      k += 179;
      if (r.leap === 1) k += 1;
    }
    return {
      jy,
      jm: 7 + div(k, 30),
      jd: mod(k, 30) + 1
    };
  }
  function g2d(gy, gm, gd) {
    let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408;
    d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
    return d;
  }
  function d2g(jdn) {
    let j = 4 * jdn + 139361631;
    j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
    const i = div(mod(j, 1461), 4) * 5 + 308;
    const gd = div(mod(i, 153), 5) + 1;
    const gm = mod(div(i, 153), 12) + 1;
    return {
      gy: div(j, 1461) - 100100 + div(8 - gm, 6),
      gm,
      gd
    };
  }
  function jalCalCore(jy) {
    if (!Number.isFinite(jy) || jy < MIN_JALAALI_YEAR || jy > MAX_JALAALI_YEAR) throw new RangeError(`Invalid Jalaali year ${jy}: must be a finite number between ${MIN_JALAALI_YEAR} and ${MAX_JALAALI_YEAR} (inclusive)`);
    const gy = jy + 621;
    let leapJ = -14;
    let jp = BREAKS[0];
    let jm = 0;
    let jump = 0;
    for (let i = 1; i < BREAKS.length; i += 1) {
      jm = BREAKS[i];
      jump = jm - jp;
      if (jy < jm) break;
      leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
      jp = jm;
    }
    const n = jy - jp;
    leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
    if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
    const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
    return {
      gy,
      march: 20 + leapJ - leapG,
      jump,
      n
    };
  }
  function leapFromCycle(jump, n) {
    let adjusted = n;
    if (jump - n < 6) adjusted = n - jump + div(jump + 4, 33) * 33;
    let leap = mod(mod(adjusted + 1, 33) - 1, 4);
    if (leap === -1) leap = 4;
    return leap;
  }
  function jalCalLeap(jy) {
    if (!Number.isFinite(jy) || jy < MIN_JALAALI_YEAR || jy > MAX_JALAALI_YEAR) throw new RangeError(`Invalid Jalaali year ${jy}: must be a finite number between ${MIN_JALAALI_YEAR} and ${MAX_JALAALI_YEAR} (inclusive)`);
    let jp = BREAKS[0];
    let jm = 0;
    let jump = 0;
    for (let i = 1; i < BREAKS.length; i += 1) {
      jm = BREAKS[i];
      jump = jm - jp;
      if (jy < jm) break;
      jp = jm;
    }
    return leapFromCycle(jump, jy - jp);
  }
  function div(a, b) {
    return ~~(a / b);
  }
  function mod(a, b) {
    return a - ~~(a / b) * b;
  }

  // src/force-input.js
  (function(window2, document2) {
    "use strict";
    const ForceInput = {};
    const isValidJalaaliDate2 = isValidJalaaliDate;
    const toJalaali2 = toJalaali;
    function injectCalendarStyles() {
      if (document2.getElementById("force-input-calendar-styles")) {
        return;
      }
      const style = document2.createElement("style");
      style.id = "force-input-calendar-styles";
      style.textContent = `
            .force-date-wrapper {
                position: relative;
                display: flex;
                align-items: center;
                width: 100%;
                min-width: 0;
            }

            .force-date-wrapper > input {
                flex: 1;
                min-width: 0;
            }

            .force-calendar-trigger {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex: 0 0 auto;
                width: 38px;
                height: 38px;
                margin-inline-start: 6px;
                padding: 0;
                border: 1px solid #ccc;
                border-radius: 6px;
                background: #fff;
                color: #444;
                cursor: pointer;
            }

            .force-calendar-trigger:hover {
                background: #f3f4f6;
            }

            .force-calendar-trigger svg {
                display: block;
            }

            .force-calendar-popover {
                position: absolute;
                top: calc(100% + 8px);
                inset-inline-start: 0;
                z-index: 9999;
                width: 310px;
                padding: 12px;
                border: 1px solid #ddd;
                border-radius: 10px;
                background: #fff;
                color: #222;
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
                box-sizing: border-box;
                font-family: inherit;
            }

            .force-calendar-popover[hidden] {
                display: none;
            }

            .force-calendar-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 4px;
                margin-bottom: 12px;
                width: 100%;
                box-sizing: border-box;
            }

            .force-calendar-header > button[data-calendar-action] {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex: 0 0 25px;
                width: 25px;
                height: 32px;
                padding: 0;
                border: 1px solid #ddd;
                border-radius: 5px;
                background: #fff;
                color: #222;
                font-size: 17px;
                cursor: pointer;
            }

            .force-calendar-header > button[data-calendar-action]:hover {
                background: #f3f4f6;
            }

            .force-calendar-header button:hover {
                background: #f3f4f6;
            }

            .force-calendar-month {
                flex: 1;
                min-width: 0;
                height: 32px;
                padding: 0 4px;
                border: 1px solid #ddd;
                border-radius: 5px;
                background: #fff;
                font: inherit;
            }
            .force-calendar-month-picker {
                position: relative;
                flex: 1 1 auto;
                min-width: 75px;
            }

            .force-calendar-month-trigger {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 7px;
                width: 100%;
                height: 36px;
                padding: 0 8px;
                border: 1px solid #ddd;
                border-radius: 6px;
                background: #fff;
                color: #222;
                font: inherit;
                font-size: 13px;
                cursor: pointer;
                white-space: nowrap;
            }

            .force-calendar-month-trigger:hover {
                background: #f3f4f6;
            }

            .force-calendar-month-arrow {
                font-size: 11px;
                color: #777;
                transition: transform 0.2s ease;
            }

            .force-calendar-month-picker.is-open
            .force-calendar-month-arrow {
                transform: rotate(180deg);
            }

            .force-calendar-month-menu {
                position: absolute;
                bottom: calc(100% + 5px);
                top: auto;
                inset-inline-start: 0;
                z-index: 10001;

                width: 100%;
                min-width: 115px;
                max-height: 220px;
                overflow-y: auto;

                padding: 5px;
                border: 1px solid #ddd;
                border-radius: 7px;
                background: #fff;
                box-shadow: 0 5px 16px rgba(0, 0, 0, 0.14);
                box-sizing: border-box;
            }

            .force-calendar-month-menu[hidden] {
                display: none;
            }

            .force-calendar-month-option {
                display: block;
                width: 100%;
                min-height: 34px;
                padding: 7px 10px;
                border: 0;
                border-radius: 5px;
                background: transparent;
                color: #333;
                text-align: center;
                font: inherit;
                font-size: 13px;
                cursor: pointer;
                box-sizing: border-box;
            }

            .force-calendar-month-option:hover:not(:disabled) {
                background: #f0f2f5;
            }

            .force-calendar-month-option.active {
                background: #e8eefc;
                color: #2455a4;
                font-weight: 700;
            }

            .force-calendar-month-option:disabled {
                color: #bbb;
                cursor: not-allowed;
                opacity: 0.5;
            }

            .force-calendar-month-option:hover {
                background: #f0f2f5;
            }

            .force-calendar-month-option.active {
                background: #e8eefc;
                color: #2455a4;
                font-weight: 700;
            }
            .force-calendar-month-option:disabled {
                color: #bbb;
                cursor: not-allowed;
                opacity: 0.5;
            }

            .force-calendar-year {
                flex: 0 0 76px;
                width: 76px;
                min-width: 76px;
                height: 36px;
                padding: 0 3px;
                border: 1px solid #ddd;
                border-radius: 6px;
                box-sizing: border-box;
                text-align: center;
                font-size: 16px;
                font-weight: 700;
            }

            .force-calendar-year {
                flex: 0 0 82px;
                width: 82px;
                min-width: 82px;
                height: 32px;
                padding: 0 4px;
                border: 1px solid #ddd;
                border-radius: 5px;
                box-sizing: border-box;
                text-align: center;
                font: inherit;
            }

            .force-calendar-grid {
                display: grid;
                grid-template-columns: repeat(7, minmax(0, 1fr));
                gap: 4px;
                text-align: center;
            }

            .force-calendar-weekday,
            .force-calendar-empty,
            .force-calendar-day {
                display: flex;
                align-items: center;
                justify-content: center;
                min-width: 0;
                height: 34px;
                box-sizing: border-box;
            }

            .force-calendar-weekday {
                color: #666;
                font-size: 12px;
                font-weight: 600;
            }

            .force-calendar-day {
                width: 100%;
                padding: 0;
                border: 0;
                border-radius: 6px;
                background: transparent;
                color: #222;
                font: inherit;
                cursor: pointer;
            }

            .force-calendar-day:hover:not(:disabled) {
                background: #e8eefc;
            }

            .force-calendar-day:disabled {
                color: #bbb;
                cursor: not-allowed;
                opacity: 0.5;
            }
        `;
      (document2.head || document2.documentElement).appendChild(style);
    }
    const DEFAULT_MESSAGES = {
      fa: "\u0644\u0637\u0641\u0627\u064B \u0641\u0642\u0637 \u062D\u0631\u0648\u0641 \u0641\u0627\u0631\u0633\u06CC \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F.",
      en: "\u0644\u0637\u0641\u0627\u064B \u0641\u0642\u0637 \u062D\u0631\u0648\u0641 \u0627\u0646\u06AF\u0644\u06CC\u0633\u06CC \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F.",
      digits: "\u0644\u0637\u0641\u0627\u064B \u0641\u0642\u0637 \u0627\u0639\u062F\u0627\u062F \u0627\u0646\u06AF\u0644\u06CC\u0633\u06CC \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F.",
      length: "\u062A\u0639\u062F\u0627\u062F \u06A9\u0627\u0631\u0627\u06A9\u062A\u0631\u0647\u0627\u06CC \u0648\u0627\u0631\u062F \u0634\u062F\u0647 \u0628\u06CC\u0634\u062A\u0631 \u0627\u0632 \u062D\u062F \u0645\u062C\u0627\u0632 \u0627\u0633\u062A."
    };
    let messages = { ...DEFAULT_MESSAGES };
    const DIGIT_MAP = {
      "\u06F0": "0",
      "\u06F1": "1",
      "\u06F2": "2",
      "\u06F3": "3",
      "\u06F4": "4",
      "\u06F5": "5",
      "\u06F6": "6",
      "\u06F7": "7",
      "\u06F8": "8",
      "\u06F9": "9",
      "\u0660": "0",
      "\u0661": "1",
      "\u0662": "2",
      "\u0663": "3",
      "\u0664": "4",
      "\u0665": "5",
      "\u0666": "6",
      "\u0667": "7",
      "\u0668": "8",
      "\u0669": "9"
    };
    const DIGIT_REGEX = /[۰-۹٠-٩]/g;
    const MODES = [
      "fa-force-res",
      "en-force-res",
      "num-force-res",
      "fa-force",
      "en-force",
      "num-force",
      "fa-date",
      "en-date",
      "fa-letter-force-res",
      "en-letter-force-res"
    ];
    const CALENDAR_MONTHS = {
      "fa-date": [
        "\u0641\u0631\u0648\u0631\u062F\u06CC\u0646",
        "\u0627\u0631\u062F\u06CC\u0628\u0647\u0634\u062A",
        "\u062E\u0631\u062F\u0627\u062F",
        "\u062A\u06CC\u0631",
        "\u0645\u0631\u062F\u0627\u062F",
        "\u0634\u0647\u0631\u06CC\u0648\u0631",
        "\u0645\u0647\u0631",
        "\u0622\u0628\u0627\u0646",
        "\u0622\u0630\u0631",
        "\u062F\u06CC",
        "\u0628\u0647\u0645\u0646",
        "\u0627\u0633\u0641\u0646\u062F"
      ],
      "en-date": [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ]
    };
    function getInitialCalendarDate(input, mode) {
      const validation = mode === "fa-date" ? validateJalaliDate(input.value) : validateGregorianDate(input.value);
      if (validation.valid) {
        const [year, month] = input.value.split("/").map(Number);
        return { year, month };
      }
      const today = /* @__PURE__ */ new Date();
      if (mode === "fa-date") {
        const date = toJalaali2(
          today.getFullYear(),
          today.getMonth() + 1,
          today.getDate()
        );
        return {
          year: date.jy,
          month: date.jm
        };
      }
      return {
        year: today.getFullYear(),
        month: today.getMonth() + 1
      };
    }
    function getCalendarMonthInfo(year, month, mode) {
      if (mode === "fa-date") {
        const daysInMonth = jalaaliMonthLength(year, month);
        const firstDay = toGregorian(year, month, 1);
        const weekday = new Date(
          firstDay.gy,
          firstDay.gm - 1,
          firstDay.gd
        ).getDay();
        return {
          daysInMonth,
          startOffset: (weekday + 1) % 7
        };
      }
      return {
        daysInMonth: new Date(year, month, 0).getDate(),
        startOffset: new Date(year, month - 1, 1).getDay()
      };
    }
    function isCalendarDayAllowed(year, month, day, mode) {
      if (mode === "fa-date") {
        if (!isValidJalaaliDate2(year, month, day)) {
          return false;
        }
        if (year < 1278 || year === 1278 && month < 10 || year === 1278 && month === 10 && day < 11) {
          return false;
        }
        return true;
      }
      const date = new Date(year, month - 1, day);
      if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return false;
      }
      return year >= 1900;
    }
    function renderCalendarDays(input, popover) {
      const mode = getMode(input);
      const isJalali = mode === "fa-date";
      const state = popover._calendarState;
      if (!state) return;
      const weekdays = isJalali ? ["\u0634", "\u06CC", "\u062F", "\u0633", "\u0686", "\u067E", "\u062C"] : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
      const { daysInMonth, startOffset } = getCalendarMonthInfo(
        state.year,
        state.month,
        mode
      );
      const grid = document2.createElement("div");
      grid.className = "force-calendar-grid";
      weekdays.forEach((day) => {
        const cell = document2.createElement("div");
        cell.className = "force-calendar-weekday";
        cell.textContent = day;
        grid.appendChild(cell);
      });
      for (let i = 0; i < startOffset; i++) {
        const empty = document2.createElement("div");
        empty.className = "force-calendar-empty";
        grid.appendChild(empty);
      }
      for (let day = 1; day <= daysInMonth; day++) {
        const button = document2.createElement("button");
        button.type = "button";
        button.className = "force-calendar-day";
        button.textContent = day;
        const allowed = isCalendarDayAllowed(
          state.year,
          state.month,
          day,
          mode
        );
        button.disabled = !allowed;
        button.addEventListener("click", () => {
          if (!allowed) return;
          const year = String(state.year).padStart(4, "0");
          const month = String(state.month).padStart(2, "0");
          const selectedDay = String(day).padStart(2, "0");
          input.value = `${year}/${month}/${selectedDay}`;
          input.dispatchEvent(
            new Event("input", { bubbles: true })
          );
          input.dispatchEvent(
            new Event("change", { bubbles: true })
          );
          popover.hidden = true;
          const wrapper = input.closest(".force-date-wrapper");
          const trigger = wrapper == null ? void 0 : wrapper.querySelector(
            ".force-calendar-trigger"
          );
          if (trigger) {
            trigger.setAttribute("aria-expanded", "false");
          }
        });
        grid.appendChild(button);
      }
      popover.appendChild(grid);
    }
    function getMode(element) {
      const found = MODES.filter(
        (mode) => element.classList.contains(mode)
      );
      if (found.length > 1) {
        console.warn(
          "ForceInput: Conflicting classes:",
          found,
          element
        );
        return null;
      }
      return found[0] || null;
    }
    function toEnglishDigits(value) {
      return value.replace(DIGIT_REGEX, (char) => DIGIT_MAP[char]);
    }
    function getMaxLength(element) {
      const limits = [...element.classList].map((name) => name.match(/^len-(\d+)$/)).filter(Boolean).map((match) => Number(match[1]));
      if (limits.length > 1) {
        console.warn(
          "ForceInput: Multiple length classes:",
          element
        );
        return null;
      }
      return limits.length ? limits[0] : null;
    }
    function hasLengthClass(element) {
      return [...element.classList].some(
        (name) => /^len-\d+$/.test(name)
      );
    }
    function getMessage(mode) {
      if (mode === "fa-letter-force-res" || mode === "fa-force" || mode === "fa-force-res") {
        return messages.fa;
      }
      if (mode === "en-letter-force-res" || mode === "en-force" || mode === "en-force-res") {
        return messages.en;
      }
      return messages.digits;
    }
    function validateCharacter(char, mode) {
      if (mode === "fa-force-res") {
        return /^[\u0621-\u063A\u0641-\u064A\u067E\u0686\u0698\u06A9\u06AF\u06BE\u06CC ]$/u.test(char);
      }
      if (mode === "en-force-res") {
        return /^[A-Za-z ]$/.test(char);
      }
      if (mode === "num-force" || mode === "num-force-res") {
        return /^[0-9]$/.test(char);
      }
      if (mode === "fa-force") {
        return /^[\u0600-\u06FF0-9\s.,!?،؛؟:()\-_'"/]$/u.test(char);
      }
      if (mode === "en-force") {
        return /^[A-Za-z0-9\s.,!?;:'"()\-_/\\@#&+%=]$/.test(char);
      }
      return true;
    }
    function normalize(value, mode, maxLength) {
      value = toEnglishDigits(value);
      const characters = Array.from(value);
      let result = "";
      let invalid = false;
      let tooLong = false;
      for (const char of characters) {
        if (!validateCharacter(char, mode)) {
          invalid = true;
          continue;
        }
        if (maxLength !== null && Array.from(result).length >= maxLength) {
          tooLong = true;
          continue;
        }
        result += char;
      }
      return {
        value: result,
        invalid,
        tooLong
      };
    }
    function isPossibleDateInput(value, mode) {
      const parts = value.split("/");
      if (parts.length > 3) return false;
      const [year = "", month = "", day = ""] = parts;
      if (year.length > 4 || month.length > 2 || day.length > 2) {
        return false;
      }
      if (month.length === 1) {
        if (!/^[0-9]$/.test(month)) return false;
      }
      if (month.length === 2) {
        const m2 = Number(month);
        if (m2 < 1 || m2 > 12) return false;
      }
      if (day.length && month.length !== 2) {
        return false;
      }
      if (!day.length) return true;
      const m = Number(month);
      const d = Number(day);
      const y = Number(year);
      let maxDay;
      if (mode === "fa-date") {
        if (m <= 6) {
          maxDay = 31;
        } else if (m <= 11) {
          maxDay = 30;
        } else {
          maxDay = year.length === 4 && isValidJalaaliDate2(y, 12, 30) ? 30 : 29;
        }
      } else {
        const isLeapYear = y % 400 === 0 || y % 4 === 0 && y % 100 !== 0;
        const daysInMonth = [
          31,
          isLeapYear ? 29 : 28,
          31,
          30,
          31,
          30,
          31,
          31,
          30,
          31,
          30,
          31
        ];
        maxDay = year.length === 4 ? daysInMonth[m - 1] : m === 2 ? 29 : daysInMonth[m - 1];
      }
      if (day.length === 1) {
        return d >= 1 && d <= Math.min(3, maxDay);
      }
      return d >= 1 && d <= maxDay;
    }
    function normalizeDate(value) {
      value = toEnglishDigits(value);
      let result = "";
      let invalid = false;
      for (const char of Array.from(value)) {
        if (/^[0-9/]$/.test(char)) {
          result += char;
        } else {
          invalid = true;
        }
      }
      return {
        value: result,
        invalid
      };
    }
    function validateJalaliDate(value) {
      const normalized = normalizeDate(value);
      value = normalized.value;
      if (value.length < 10) {
        return {
          complete: false,
          valid: false,
          invalid: normalized.invalid
        };
      }
      if (!/^\d{4}\/\d{2}\/\d{2}$/.test(value)) {
        return {
          complete: true,
          valid: false,
          invalid: normalized.invalid
        };
      }
      const [year, month, day] = value.split("/").map(Number);
      const validCalendarDate = isValidJalaaliDate2(
        year,
        month,
        day
      );
      const isAfterMinimum = year > 1278 || year === 1278 && month > 10 || year === 1278 && month === 10 && day >= 11;
      return {
        complete: true,
        valid: validCalendarDate && isAfterMinimum && !normalized.invalid,
        invalid: normalized.invalid
      };
    }
    function validateGregorianDate(value) {
      const normalized = normalizeDate(value);
      value = normalized.value;
      if (value.length < 10) {
        return {
          complete: false,
          valid: false,
          invalid: normalized.invalid
        };
      }
      if (!/^\d{4}\/\d{2}\/\d{2}$/.test(value)) {
        return {
          complete: true,
          valid: false,
          invalid: normalized.invalid
        };
      }
      const [year, month, day] = value.split("/").map(Number);
      const isLeapYear = year % 400 === 0 || year % 4 === 0 && year % 100 !== 0;
      const daysInMonth = [
        31,
        isLeapYear ? 29 : 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31
      ];
      const validCalendarDate = year >= 1900 && month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1];
      return {
        complete: true,
        valid: validCalendarDate && !normalized.invalid,
        invalid: normalized.invalid
      };
    }
    function getErrorElement(element) {
      let error = element.nextElementSibling;
      if (error && error.hasAttribute("data-force-error")) {
        return error;
      }
      error = document2.createElement("small");
      error.setAttribute("data-force-error", "");
      error.setAttribute("role", "alert");
      error.style.display = "none";
      error.style.color = "#dc2626";
      error.style.fontSize = "12px";
      error.style.marginTop = "5px";
      element.insertAdjacentElement("afterend", error);
      return error;
    }
    function showError(element, message) {
      const error = getErrorElement(element);
      error.textContent = message;
      error.style.display = "block";
    }
    function hideError(element) {
      const error = element.nextElementSibling;
      if (error && error.hasAttribute("data-force-error")) {
        error.textContent = "";
        error.style.display = "none";
      }
    }
    function createDateWrapper(input) {
      var _a;
      if ((_a = input.parentElement) == null ? void 0 : _a.classList.contains("force-date-wrapper")) {
        return input.parentElement;
      }
      const wrapper = document2.createElement("div");
      wrapper.className = "force-date-wrapper";
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);
      return wrapper;
    }
    function createCalendarPopover(wrapper) {
      let popover = wrapper.querySelector(
        ".force-calendar-popover"
      );
      if (popover) {
        return popover;
      }
      const input = wrapper.querySelector("input");
      const mode = getMode(input);
      const initialDate = getInitialCalendarDate(input, mode);
      popover = document2.createElement("div");
      popover.className = "force-calendar-popover";
      popover.hidden = true;
      popover.setAttribute("role", "dialog");
      popover.setAttribute("aria-label", "Calendar");
      popover.dataset.year = String(initialDate.year);
      popover.dataset.month = String(initialDate.month);
      wrapper.appendChild(popover);
      renderCalendarHeader(popover, input);
      return popover;
    }
    function createCalendarButton(wrapper) {
      let button = wrapper.querySelector(".force-calendar-trigger");
      if (button) {
        return button;
      }
      button = document2.createElement("button");
      button.type = "button";
      button.className = "force-calendar-trigger";
      button.setAttribute("aria-label", "Open calendar");
      button.setAttribute("aria-haspopup", "dialog");
      button.setAttribute("aria-expanded", "false");
      button.innerHTML = `
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
        `;
      button.addEventListener("click", () => {
        const popover = createCalendarPopover(wrapper);
        const isOpen = !popover.hidden;
        if (!isOpen) {
          const input = wrapper.querySelector("input");
          renderCalendarHeader(input, popover);
        }
        popover.hidden = isOpen;
        button.setAttribute("aria-expanded", String(!isOpen));
      });
      wrapper.appendChild(button);
      return button;
    }
    const PERSIAN_MONTHS = [
      "\u0641\u0631\u0648\u0631\u062F\u06CC\u0646",
      "\u0627\u0631\u062F\u06CC\u0628\u0647\u0634\u062A",
      "\u062E\u0631\u062F\u0627\u062F",
      "\u062A\u06CC\u0631",
      "\u0645\u0631\u062F\u0627\u062F",
      "\u0634\u0647\u0631\u06CC\u0648\u0631",
      "\u0645\u0647\u0631",
      "\u0622\u0628\u0627\u0646",
      "\u0622\u0630\u0631",
      "\u062F\u06CC",
      "\u0628\u0647\u0645\u0646",
      "\u0627\u0633\u0641\u0646\u062F"
    ];
    const ENGLISH_MONTHS = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];
    function getCalendarInitialDate(input, mode) {
      const today = /* @__PURE__ */ new Date();
      let year;
      let month;
      const match = /^(\d{4})\/(\d{2})\/(\d{2})$/.exec(input.value);
      if (match) {
        year = Number(match[1]);
        month = Number(match[2]);
        if (month >= 1 && month <= 12) {
          return { year, month };
        }
      }
      if (mode === "fa-date") {
        const jalaliToday = toJalaali2(today);
        return {
          year: jalaliToday.jy,
          month: jalaliToday.jm
        };
      }
      return {
        year: today.getFullYear(),
        month: today.getMonth() + 1
      };
    }
    function isBeforeMinimumDate(year, month, mode) {
      if (mode === "fa-date") {
        return year < 1278 || year === 1278 && month < 10;
      }
      return year < 1900;
    }
    function renderCalendarHeader(input, popover) {
      const mode = getMode(input);
      const isJalali = mode === "fa-date";
      const months = isJalali ? PERSIAN_MONTHS : ENGLISH_MONTHS;
      const minYear = isJalali ? 1278 : 1900;
      if (!popover._calendarState) {
        popover._calendarState = getCalendarInitialDate(input, mode);
      }
      const state = popover._calendarState;
      const monthOptions = months.map((month, index) => {
        const monthNumber = index + 1;
        const disabled = isBeforeMinimumDate(
          state.year,
          monthNumber,
          mode
        );
        return `
            <button
                type="button"
                class="force-calendar-month-option ${monthNumber === state.month ? "active" : ""}"
                data-month="${monthNumber}"
                ${disabled ? "disabled" : ""}
            >${month}</button>
        `;
      }).join("");
      popover.innerHTML = `
        <div class="force-calendar-header" dir="${isJalali ? "rtl" : "ltr"}">

            <button type="button"
                data-calendar-action="prev-year"
                aria-label="Previous year">\xAB</button>

            <button type="button"
                data-calendar-action="prev-month"
                aria-label="Previous month">\u2039</button>

            <div class="force-calendar-month-picker">

                <button
                    type="button"
                    class="force-calendar-month-trigger"
                    aria-expanded="false"
                    aria-haspopup="true"
                >
                    <span>${months[state.month - 1]}</span>
                    <span class="force-calendar-month-arrow">\u25BE</span>
                </button>

                <div class="force-calendar-month-menu" hidden>
                    ${monthOptions}
                </div>

            </div>

            <input
                class="force-calendar-year"
                type="number"
                min="${minYear}"
                step="1"
                value="${state.year}"
                aria-label="${isJalali ? "\u0633\u0627\u0644" : "Year"}"
                title="${isJalali ? "\u0633\u0627\u0644 \u0631\u0627 \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F" : "Enter year"}"
            >

            <button type="button"
                data-calendar-action="next-month"
                aria-label="Next month">\u203A</button>

            <button type="button"
                data-calendar-action="next-year"
                aria-label="Next year">\xBB</button>

        </div>
    `;
      const monthPicker = popover.querySelector(
        ".force-calendar-month-picker"
      );
      const monthTrigger = popover.querySelector(
        ".force-calendar-month-trigger"
      );
      const monthMenu = popover.querySelector(
        ".force-calendar-month-menu"
      );
      monthTrigger.addEventListener("click", () => {
        const isOpen = !monthMenu.hidden;
        monthMenu.hidden = isOpen;
        monthPicker.classList.toggle("is-open", !isOpen);
        monthTrigger.setAttribute(
          "aria-expanded",
          String(!isOpen)
        );
      });
      monthMenu.querySelectorAll("[data-month]").forEach((button) => {
        button.addEventListener("click", () => {
          state.month = Number(button.dataset.month);
          renderCalendarHeader(input, popover);
        });
      });
      const yearInput = popover.querySelector(
        ".force-calendar-year"
      );
      yearInput.addEventListener("change", () => {
        const year = Number(yearInput.value);
        if (!Number.isInteger(year) || year < minYear) {
          renderCalendarHeader(input, popover);
          return;
        }
        state.year = year;
        if (isBeforeMinimumDate(state.year, state.month, mode)) {
          state.month = isJalali ? 10 : 1;
        }
        renderCalendarHeader(input, popover);
      });
      popover.querySelectorAll("[data-calendar-action]").forEach((button) => {
        button.addEventListener("click", () => {
          const action = button.dataset.calendarAction;
          if (action === "prev-year") {
            state.year--;
          } else if (action === "next-year") {
            state.year++;
          } else if (action === "prev-month") {
            state.month--;
            if (state.month < 1) {
              state.month = 12;
              state.year--;
            }
          } else if (action === "next-month") {
            state.month++;
            if (state.month > 12) {
              state.month = 1;
              state.year++;
            }
          }
          if (isBeforeMinimumDate(state.year, state.month, mode)) {
            state.year = minYear;
            state.month = isJalali ? 10 : 1;
          }
          renderCalendarHeader(input, popover);
        });
      });
      renderCalendarDays(input, popover);
    }
    function prepareDateInput(input) {
      if (!isDateInput(input)) return;
      const wrapper = createDateWrapper(input);
      createCalendarButton(wrapper);
    }
    function isInputElement(element) {
      return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement;
    }
    function isDateInput(element) {
      const mode = getMode(element);
      return mode === "fa-date" || mode === "en-date";
    }
    function isSupported(element) {
      return isInputElement(element) && getMode(element) !== null;
    }
    function apply(element) {
      var _a, _b, _c;
      if (!isInputElement(element)) {
        return;
      }
      const mode = getMode(element);
      if (!mode) {
        return;
      }
      if (!mode) {
        return;
      }
      if (mode === "fa-date" || mode === "en-date") {
        const originalValue = element.value;
        const cursorPosition = (_a = element.selectionStart) != null ? _a : originalValue.length;
        const normalized2 = normalizeDate(originalValue);
        const nextValue = normalized2.value.slice(0, 10);
        if (nextValue !== originalValue) {
          const normalizedCursor = normalizeDate(
            originalValue.slice(0, cursorPosition)
          ).value.slice(0, 10).length;
          element.value = nextValue;
          try {
            element.setSelectionRange(
              normalizedCursor,
              normalizedCursor
            );
          } catch (_) {
          }
        }
        if (normalized2.invalid) {
          showError(element, "\u0644\u0637\u0641\u0627\u064B \u0641\u0642\u0637 \u0639\u062F\u062F \u0648 / \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F.");
          return;
        }
        if (element.value.length < 10) {
          hideError(element);
          return;
        }
        const result = mode === "fa-date" ? validateJalaliDate(element.value) : validateGregorianDate(element.value);
        if (!result.valid) {
          showError(
            element,
            "\u062A\u0627\u0631\u06CC\u062E \u0648\u0627\u0631\u062F \u0634\u062F\u0647 \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A \u06CC\u0627 \u062E\u0627\u0631\u062C \u0627\u0632 \u0645\u062D\u062F\u0648\u062F\u0647 \u0645\u062C\u0627\u0632 \u0627\u0633\u062A."
          );
        } else {
          hideError(element);
        }
        return;
      }
      const maxLength = getMaxLength(element);
      if (maxLength === null && hasLengthClass(element)) {
        return;
      }
      const oldValue = element.value;
      const start = (_b = element.selectionStart) != null ? _b : oldValue.length;
      const end = (_c = element.selectionEnd) != null ? _c : oldValue.length;
      const prefix = oldValue.slice(0, start);
      const selected = oldValue.slice(start, end);
      const normalized = normalize(
        oldValue,
        mode,
        maxLength
      );
      const normalizedPrefix = normalize(
        prefix,
        mode,
        null
      ).value;
      const normalizedSelection = normalize(
        selected,
        mode,
        null
      ).value;
      if (normalized.value !== oldValue) {
        element.value = normalized.value;
        const newStart = normalizedPrefix.length;
        const newEnd = Math.min(
          newStart + normalizedSelection.length,
          normalized.value.length
        );
        try {
          element.setSelectionRange(newStart, newEnd);
        } catch (_) {
        }
      }
      if (normalized.tooLong) {
        showError(element, messages.length);
      } else if (normalized.invalid) {
        showError(element, getMessage(mode));
      } else {
        hideError(element);
      }
    }
    function handleBeforeInput(event) {
      var _a, _b, _c, _d;
      const element = event.target;
      if (!isSupported(element)) return;
      if (event.isComposing) return;
      const mode = getMode(element);
      if (event.inputType.startsWith("delete") || event.inputType === "historyUndo" || event.inputType === "historyRedo") {
        return;
      }
      if (event.data === null) return;
      const isDateMode = mode === "fa-date" || mode === "en-date";
      const normalized = isDateMode ? normalizeDate(event.data) : normalize(event.data, mode, null);
      if (normalized.invalid) {
        event.preventDefault();
        showError(
          element,
          isDateMode ? "\u0644\u0637\u0641\u0627\u064B \u0641\u0642\u0637 \u0639\u062F\u062F \u0648 / \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F." : getMessage(mode)
        );
        return;
      }
      if (isDateMode) {
        const start2 = (_a = element.selectionStart) != null ? _a : element.value.length;
        const end2 = (_b = element.selectionEnd) != null ? _b : start2;
        const nextValue = element.value.slice(0, start2) + normalized.value + element.value.slice(end2);
        if (!isPossibleDateInput(nextValue, mode)) {
          event.preventDefault();
          const parts = nextValue.split("/");
          const month = parts[1] || "";
          const day = parts[2] || "";
          if (day.length > 0 && month.length !== 2) {
            showError(
              element,
              "\u0644\u0637\u0641\u0627\u064B \u062A\u0627\u0631\u06CC\u062E \u0631\u0627 \u0628\u0627 \u0641\u0631\u0645\u062A YYYY/MM/DD \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F. \u0645\u062B\u0627\u0644: 1382/05/01"
            );
          } else {
            showError(
              element,
              "\u0645\u0627\u0647 \u06CC\u0627 \u0631\u0648\u0632 \u0648\u0627\u0631\u062F \u0634\u062F\u0647 \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A."
            );
          }
          return;
        }
      }
      const start = (_c = element.selectionStart) != null ? _c : element.value.length;
      const end = (_d = element.selectionEnd) != null ? _d : start;
      const currentLength = Array.from(element.value).length;
      const selectedLength = Array.from(
        element.value.slice(start, end)
      ).length;
      const insertedLength = Array.from(normalized.value).length;
      const maxLength = isDateMode ? 10 : getMaxLength(element);
      if (maxLength !== null) {
        const resultingLength = currentLength - selectedLength + insertedLength;
        if (resultingLength > maxLength) {
          event.preventDefault();
          showError(element, getMessage("length"));
        }
      }
    }
    function handleInput(event) {
      const element = event.target;
      if (!isSupported(element)) return;
      if (element.isComposing) return;
      apply(element);
    }
    function handleCompositionEnd(event) {
      const element = event.target;
      if (isSupported(element)) {
        apply(element);
      }
    }
    let listenersAttached = false;
    function attachListeners() {
      if (listenersAttached) return;
      document2.addEventListener("beforeinput", handleBeforeInput);
      document2.addEventListener("input", handleInput);
      document2.addEventListener("compositionend", handleCompositionEnd);
      listenersAttached = true;
    }
    function detachListeners() {
      if (!listenersAttached) return;
      document2.removeEventListener("beforeinput", handleBeforeInput);
      document2.removeEventListener("input", handleInput);
      document2.removeEventListener("compositionend", handleCompositionEnd);
      listenersAttached = false;
    }
    ForceInput.init = function(root = document2) {
      injectCalendarStyles();
      attachListeners();
      if (isInputElement(root)) {
        prepareDateInput(root);
        apply(root);
      }
      if (root.querySelectorAll) {
        root.querySelectorAll("input, textarea").forEach((element) => {
          prepareDateInput(element);
          apply(element);
        });
      }
      return ForceInput;
    };
    ForceInput.apply = apply;
    ForceInput.refresh = function(root = document2) {
      if (isInputElement(root)) {
        prepareDateInput(root);
        apply(root);
      }
      if (root.querySelectorAll) {
        root.querySelectorAll("input, textarea").forEach((element) => {
          prepareDateInput(element);
          apply(element);
        });
      }
      return ForceInput;
    };
    ForceInput.validate = function(element) {
      if (!isSupported(element)) {
        return {
          valid: true,
          message: null
        };
      }
      const mode = getMode(element);
      if (mode === "fa-date" || mode === "en-date") {
        const result2 = mode === "fa-date" ? validateJalaliDate(element.value) : validateGregorianDate(element.value);
        if (!result2.complete) {
          return {
            valid: false,
            message: "\u062A\u0627\u0631\u06CC\u062E \u06A9\u0627\u0645\u0644 \u0648\u0627\u0631\u062F \u0646\u0634\u062F\u0647 \u0627\u0633\u062A."
          };
        }
        return {
          valid: result2.valid,
          message: result2.valid ? null : "\u062A\u0627\u0631\u06CC\u062E \u0648\u0627\u0631\u062F \u0634\u062F\u0647 \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A \u06CC\u0627 \u062E\u0627\u0631\u062C \u0627\u0632 \u0645\u062D\u062F\u0648\u062F\u0647 \u0645\u062C\u0627\u0632 \u0627\u0633\u062A."
        };
      }
      const maxLength = getMaxLength(element);
      const result = normalize(element.value, mode, maxLength);
      return {
        valid: !result.invalid && !result.tooLong && result.value === element.value,
        message: result.invalid ? getMessage(mode) : result.tooLong ? messages.length : null
      };
    };
    ForceInput.getValue = function(element) {
      if (!isSupported(element)) {
        return null;
      }
      const mode = getMode(element);
      if (mode === "fa-date" || mode === "en-date") {
        return normalizeDate(element.value).value.slice(0, 10);
      }
      const maxLength = getMaxLength(element);
      return normalize(
        element.value,
        mode,
        maxLength
      ).value;
    };
    ForceInput.config = function(options = {}) {
      if (options.messages) {
        messages = {
          ...messages,
          ...options.messages
        };
      }
      return ForceInput;
    };
    ForceInput.destroy = function() {
      detachListeners();
      document2.querySelectorAll("[data-force-error]").forEach((element) => {
        element.remove();
      });
      return ForceInput;
    };
    ForceInput.toEnglishDigits = toEnglishDigits;
    console.log(
      "Jalali valid:",
      validateJalaliDate("1405/08/17")
    );
    console.log(
      "Jalali invalid:",
      validateJalaliDate("1404/12/30")
    );
    console.log(
      "Gregorian valid:",
      validateGregorianDate("2024/02/29")
    );
    console.log(
      "Gregorian invalid:",
      validateGregorianDate("2023/02/29")
    );
    console.log(
      "Gregorian below minimum:",
      validateGregorianDate("1899/12/31")
    );
    window2.ForceInput = ForceInput;
    ForceInput.init();
  })(window, document);
})();
