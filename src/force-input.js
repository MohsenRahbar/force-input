import * as jalaali from "jalaali-js";


(function (window, document) {
    "use strict";

    const ForceInput = {};
    const isValidJalaaliDate = jalaali.isValidJalaaliDate;
    const toJalaali = jalaali.toJalaali;
    // -----------------------------
    // Configuration
    // -----------------------------

    const DEFAULT_MESSAGES = {
        fa: "لطفاً فقط حروف فارسی وارد کنید.",
        en: "لطفاً فقط حروف انگلیسی وارد کنید.",
        digits: "لطفاً فقط اعداد انگلیسی وارد کنید.",
        length: "تعداد کاراکترهای وارد شده بیشتر از حد مجاز است."
    };

    let messages = { ...DEFAULT_MESSAGES };

    const DIGIT_MAP = {
        "۰": "0", "۱": "1", "۲": "2", "۳": "3",
        "۴": "4", "۵": "5", "۶": "6", "۷": "7",
        "۸": "8", "۹": "9",

        "٠": "0", "١": "1", "٢": "2", "٣": "3",
        "٤": "4", "٥": "5", "٦": "6", "٧": "7",
        "٨": "8", "٩": "9"
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

    // -----------------------------
    // Helpers
    // -----------------------------

    function getMode(element) {
        const found = MODES.filter(mode =>
            element.classList.contains(mode)
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
        return value.replace(DIGIT_REGEX, char => DIGIT_MAP[char]);
    }

    function getMaxLength(element) {
        const limits = [...element.classList]
            .map(name => name.match(/^len-(\d+)$/))
            .filter(Boolean)
            .map(match => Number(match[1]));

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
        return [...element.classList].some(name =>
            /^len-\d+$/.test(name)
        );
    }

function getMessage(mode) {
    if (
        mode === "fa-letter-force-res" ||
        mode === "fa-force" ||
        mode === "fa-force-res"
    ) {
        return messages.fa;
    }

    if (
        mode === "en-letter-force-res" ||
        mode === "en-force" ||
        mode === "en-force-res"
    ) {
        return messages.en;
    }

    return messages.digits;
}

    // -----------------------------
    // Validation
    // -----------------------------

    function validateCharacter(char, mode) {
        // Persian letters and spaces only
        if (mode === "fa-force-res") {
            return /^[\u0621-\u063A\u0641-\u064A\u067E\u0686\u0698\u06A9\u06AF\u06BE\u06CC ]$/u.test(char);
        }

        // English letters and spaces only
        if (mode === "en-force-res") {
            return /^[A-Za-z ]$/.test(char);
        }

        // Numeric modes
        if (
            mode === "num-force" ||
            mode === "num-force-res"
        ) {
            return /^[0-9]$/.test(char);
        }

        // Persian text + English digits
        if (mode === "fa-force") {
            return /^[\u0600-\u06FF0-9\s.,!?،؛؟:()\-_'"/]$/u.test(char);
        }

        // English text + English digits
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

            if (
                maxLength !== null &&
                Array.from(result).length >= maxLength
            ) {
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

    // -----------------------------
// Date validation
// -----------------------------

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

    // Incomplete date
    if (value.length < 10) {
        return {
            complete: false,
            valid: false,
            invalid: normalized.invalid
        };
    }

    // Expected format: YYYY/MM/DD
    if (!/^\d{4}\/\d{2}\/\d{2}$/.test(value)) {
        return {
            complete: true,
            valid: false,
            invalid: normalized.invalid
        };
    }

    const [year, month, day] = value.split("/").map(Number);

    const validCalendarDate = isValidJalaaliDate(
        year,
        month,
        day
    );

    // Minimum date: 1278/10/11
    const isAfterMinimum =
        year > 1278 ||
        (year === 1278 && month > 10) ||
        (year === 1278 && month === 10 && day >= 11);

    return {
        complete: true,
        valid: validCalendarDate && isAfterMinimum && !normalized.invalid,
        invalid: normalized.invalid
    };
}

function validateGregorianDate(value) {
    const normalized = normalizeDate(value);
    value = normalized.value;

    // Incomplete date
    if (value.length < 10) {
        return {
            complete: false,
            valid: false,
            invalid: normalized.invalid
        };
    }

    // Expected format: YYYY/MM/DD
    if (!/^\d{4}\/\d{2}\/\d{2}$/.test(value)) {
        return {
            complete: true,
            valid: false,
            invalid: normalized.invalid
        };
    }

    const [year, month, day] = value.split("/").map(Number);

    const isLeapYear =
        year % 400 === 0 ||
        (year % 4 === 0 && year % 100 !== 0);

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

    const validCalendarDate =
        year >= 1900 &&
        month >= 1 &&
        month <= 12 &&
        day >= 1 &&
        day <= daysInMonth[month - 1];

    return {
        complete: true,
        valid: validCalendarDate && !normalized.invalid,
        invalid: normalized.invalid
    };
}

    // -----------------------------
    // Error handling
    // -----------------------------

    function getErrorElement(element) {
        let error = element.nextElementSibling;

        if (
            error &&
            error.hasAttribute("data-force-error")
        ) {
            return error;
        }

        error = document.createElement("small");

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

        if (
            error &&
            error.hasAttribute("data-force-error")
        ) {
            error.textContent = "";
            error.style.display = "none";
        }
    }

    // -----------------------------
    // Element helpers
    // -----------------------------

    function isInputElement(element) {
        return (
            element instanceof HTMLInputElement ||
            element instanceof HTMLTextAreaElement
        );
    }

    function isSupported(element) {
        return (
            isInputElement(element) &&
            getMode(element) !== null
        );
    }

    // -----------------------------
    // Main processor
    // -----------------------------

    function apply(element) {
        if (!isInputElement(element)) {
            return;
        }

        const mode = getMode(element);

        if (!mode) {
            return;
        }
        // Date inputs
if (mode === "fa-date" || mode === "en-date") {
    const originalValue = element.value;
    const cursorPosition =
        element.selectionStart ?? originalValue.length;

    const normalized = normalizeDate(originalValue);

    // تاریخ حداکثر ۱۰ کاراکتر
    const nextValue = normalized.value.slice(0, 10);

    if (nextValue !== originalValue) {
        // تعداد کاراکترهای حذف‌شده قبل از مکان‌نما
        const normalizedCursor = normalizeDate(
            originalValue.slice(0, cursorPosition)
        ).value.slice(0, 10).length;

        element.value = nextValue;

        try {
            element.setSelectionRange(
                normalizedCursor,
                normalizedCursor
            );
        } catch (_) {}
    }

    if (normalized.invalid) {
        showError(element, "لطفاً فقط عدد و / وارد کنید.");
        return;
    }

    if (element.value.length < 10) {
        hideError(element);
        return;
    }

    const result = mode === "fa-date"
        ? validateJalaliDate(element.value)
        : validateGregorianDate(element.value);

    if (!result.valid) {
        showError(
            element,
            "تاریخ وارد شده معتبر نیست یا خارج از محدوده مجاز است."
        );
    } else {
        hideError(element);
    }

    return;
}

        const maxLength = getMaxLength(element);

        // Invalid multiple length classes
        if (maxLength === null && hasLengthClass(element)) {
            return;
        }

        const oldValue = element.value;

        const start = element.selectionStart ?? oldValue.length;
        const end = element.selectionEnd ?? oldValue.length;

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
                // Some input types do not support selection ranges.
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

    // -----------------------------
    // Event handlers
    // -----------------------------

function handleBeforeInput(event) {
    const element = event.target;

    if (!isSupported(element)) return;
    if (event.isComposing) return;

    const mode = getMode(element);

    // حذف و Undo/Redo را مسدود نکن
    if (
        event.inputType.startsWith("delete") ||
        event.inputType === "historyUndo" ||
        event.inputType === "historyRedo"
    ) {
        return;
    }

    if (event.data === null) return;

    const isDateMode = mode === "fa-date" || mode === "en-date";

    // اعتبارسنجی کاراکترهای ورودی
    const normalized = isDateMode
        ? normalizeDate(event.data)
        : normalize(event.data, mode, null);

    if (normalized.invalid) {
        event.preventDefault();

        showError(
            element,
            isDateMode
                ? "لطفاً فقط عدد و / وارد کنید."
                : getMessage(mode)
        );

        return;
    }

    const start = element.selectionStart ?? element.value.length;
    const end = element.selectionEnd ?? start;

    const currentLength = Array.from(element.value).length;
    const selectedLength = Array.from(
        element.value.slice(start, end)
    ).length;

    const insertedLength = Array.from(normalized.value).length;

    const maxLength = isDateMode ? 10 : getMaxLength(element);

    if (maxLength !== null) {
        const resultingLength =
            currentLength - selectedLength + insertedLength;

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

    // -----------------------------
    // Event listeners
    // -----------------------------

    let listenersAttached = false;

    function attachListeners() {
        if (listenersAttached) return;

        document.addEventListener("beforeinput", handleBeforeInput);
        document.addEventListener("input", handleInput);
        document.addEventListener("compositionend", handleCompositionEnd);

        listenersAttached = true;
    }

    function detachListeners() {
        if (!listenersAttached) return;

        document.removeEventListener("beforeinput", handleBeforeInput);
        document.removeEventListener("input", handleInput);
        document.removeEventListener("compositionend", handleCompositionEnd);

        listenersAttached = false;
    }

    // -----------------------------
    // Public API
    // -----------------------------

    ForceInput.init = function (root = document) {
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

    ForceInput.refresh = function (root = document) {
        if (isInputElement(root)) {
            apply(root);
        }

        if (root.querySelectorAll) {
            root.querySelectorAll("input, textarea").forEach(apply);
        }

        return ForceInput;
    };

    ForceInput.validate = function (element) {
        if (!isSupported(element)) {
            return {
                valid: true,
                message: null
            };
        }

        const mode = getMode(element);

        if (mode === "fa-date" || mode === "en-date") {
            const result = mode === "fa-date"
                ? validateJalaliDate(element.value)
                : validateGregorianDate(element.value);

            if (!result.complete) {
                return {
                    valid: false,
                    message: "تاریخ کامل وارد نشده است."
                };
            }

            return {
                valid: result.valid,
                message: result.valid
                    ? null
                    : "تاریخ وارد شده معتبر نیست یا خارج از محدوده مجاز است."
            };
        }

        const maxLength = getMaxLength(element);
        const result = normalize(element.value, mode, maxLength);

        return {
            valid: !result.invalid &&
                !result.tooLong &&
                result.value === element.value,

            message: result.invalid
                ? getMessage(mode)
                : result.tooLong
                    ? messages.length
                    : null
        };
    };

    ForceInput.getValue = function (element) {
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

    ForceInput.config = function (options = {}) {
        if (options.messages) {
            messages = {
                ...messages,
                ...options.messages
            };
        }

        return ForceInput;
    };

    ForceInput.destroy = function () {
        detachListeners();

        document.querySelectorAll("[data-force-error]").forEach((element) => {
            element.remove();
        });

        return ForceInput;
    };

    ForceInput.toEnglishDigits = toEnglishDigits;

    // -----------------------------
    // Initial setup
    // -----------------------------

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

    window.ForceInput = ForceInput;

    ForceInput.init();

})(window, document);
