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
    function isInputElement(element) {
      return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement;
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
      var _a, _b;
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
      const start = (_a = element.selectionStart) != null ? _a : element.value.length;
      const end = (_b = element.selectionEnd) != null ? _b : start;
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
      attachListeners();
      if (isInputElement(root)) {
        apply(root);
      }
      if (root.querySelectorAll) {
        root.querySelectorAll("input, textarea").forEach(apply);
      }
      return ForceInput;
    };
    ForceInput.apply = apply;
    ForceInput.refresh = function(root = document2) {
      if (isInputElement(root)) {
        apply(root);
      }
      if (root.querySelectorAll) {
        root.querySelectorAll("input, textarea").forEach(apply);
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
