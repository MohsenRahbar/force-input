
(function (window, document) {
    "use strict";

    const ForceInput = {};

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

    const DIGIT_REGEX = /[0-9۰-۹٠-٩]/g;

    const MODES = [
        "fa-force-res",
        "en-force-res",
        "num-force-res",
        "fa-force",
        "en-force",
        "num-force"
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
        return value.replace(DIGIT_REGEX, char => {
            if (DIGIT_MAP[char]) {
                return DIGIT_MAP[char];
            }

            return char;
        });
    }

    function getMaxLength(element) {
        const classes = [...element.classList];

        const limits = classes
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

    function getMessage(mode) {
        if (mode && mode.startsWith("fa-force")) {
            return messages.fa;
        }

        if (mode && mode.startsWith("en-force")) {
            return messages.en;
        }

        return messages.digits;
    }

    // -----------------------------
    // Validation
    // -----------------------------

    function validateCharacter(char, mode) {

        // All numeric modes
        if (
            mode === "num-force" ||
            mode.endsWith("-res")
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

        // Convert Persian and Arabic digits first
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
    // Error message
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
        error.style.display = "block";

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
    // Main processor
    // -----------------------------

    function apply(element) {

        if (
            !(element instanceof HTMLInputElement) &&
            !(element instanceof HTMLTextAreaElement)
        ) {
            return;
        }

        const mode = getMode(element);

        if (!mode) return;

        const maxLength = getMaxLength(element);

        if (maxLength === null && [...element.classList].some(
            name => /^len-\d+$/.test(name)
        )) {
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
            maxLength
        ).value;

        const normalizedSelection = normalize(
            selected,
            mode,
            maxLength
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
            } catch (_) {}
        }

        // Error handling
        if (normalized.tooLong) {
            showError(element, messages.length);
        } else if (normalized.invalid) {
            showError(element, getMessage(mode));
        } else {
            hideError(element);
        }
    }

    function handleBeforeInput(event) {
        const element = event.target;

        if (!isSupported(element)) return;

        const maxLength = getMaxLength(element);

        if (maxLength === null) return;

        // Deletion must always be allowed
        if (event.inputType.startsWith("delete")) return;

        // Let composition finish; validate afterward
        if (event.isComposing) return;

        const start = element.selectionStart ?? element.value.length;
        const end = element.selectionEnd ?? element.value.length;

        const selectedLength = Array.from(
            element.value.slice(start, end)
        ).length;

        const currentLength = Array.from(element.value).length;

        const insertedLength = Array.from(
            event.data || ""
        ).length;

        const nextLength =
            currentLength - selectedLength + insertedLength;

        if (nextLength > maxLength) {
            event.preventDefault();

            showError(element, messages.length);
        }
    }
    document.addEventListener(
    "beforeinput",
    handleBeforeInput
    );
    document.addEventListener("input", function (event) {
    const element = event.target;

    if (!isSupported(element)) return;
    if (element.isComposing) return;

    apply(element);
    });
    // -----------------------------
    // Event listeners
    // -----------------------------

    function isSupported(element) {
        return (
            element instanceof HTMLInputElement ||
            element instanceof HTMLTextAreaElement
        ) && getMode(element) !== null;
    }

    document.addEventListener("input", function (event) {

        const element = event.target;

        if (!isSupported(element)) return;

        if (element.isComposing) return;

        apply(element);
    });

    document.addEventListener("compositionend", function (event) {
        if (isSupported(event.target)) {
            apply(event.target);
        }
    });

    // -----------------------------
    // Public API
    // -----------------------------

    ForceInput.init = function (root = document) {

        if (
            root.matches &&
            root.matches("input, textarea")
        ) {
            apply(root);
        }

        if (root.querySelectorAll) {
            root.querySelectorAll("input, textarea")
                .forEach(apply);
        }

        return ForceInput;
    };

    ForceInput.apply = apply;

    ForceInput.config = function (options = {}) {

        if (options.messages) {
            messages = {
                ...messages,
                ...options.messages
            };
        }

        return ForceInput;
    };

function handleBeforeInput(event) {
    const element = event.target;

    if (!isSupported(element)) return;

    if (event.isComposing) return;

    const mode = getMode(element);
    const maxLength = getMaxLength(element);

    if (event.inputType.startsWith("delete")) return;

    if (event.inputType === "historyUndo" ||
        event.inputType === "historyRedo") return;

    if (event.data === null) return;

    const normalized = normalize(event.data, mode, null);

    // Reject invalid characters before insertion
    if (normalized.invalid) {
        event.preventDefault();
        showError(element, getMessage(mode));
        return;
    }

    const start = element.selectionStart ?? element.value.length;
    const end = element.selectionEnd ?? element.value.length;

    const currentLength = Array.from(element.value).length;
    const selectedLength = Array.from(
        element.value.slice(start, end)
    ).length;

    const insertedLength = Array.from(
        normalized.value
    ).length;

    if (
        maxLength !== null &&
        currentLength - selectedLength + insertedLength > maxLength
    ) {
        event.preventDefault();
        showError(element, messages.length);
    }
}

    ForceInput.toEnglishDigits = toEnglishDigits;

    window.ForceInput = ForceInput;

    // Initial setup
    ForceInput.init();

})(window, document);
