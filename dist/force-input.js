(() => {
  // src/force-input.js
  (function(window2, document2) {
    "use strict";
    const ForceInput = {};
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
    const DIGIT_REGEX = /[0-9۰-۹٠-٩]/g;
    const MODES = [
      "fa-force-res",
      "en-force-res",
      "num-force-res",
      "fa-force",
      "en-force",
      "num-force"
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
      return value.replace(DIGIT_REGEX, (char) => {
        if (DIGIT_MAP[char]) {
          return DIGIT_MAP[char];
        }
        return char;
      });
    }
    function getMaxLength(element) {
      const classes = [...element.classList];
      const limits = classes.map((name) => name.match(/^len-(\d+)$/)).filter(Boolean).map((match) => Number(match[1]));
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
    function validateCharacter(char, mode) {
      if (mode === "num-force" || mode.endsWith("-res")) {
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
      if (error && error.hasAttribute("data-force-error")) {
        error.textContent = "";
        error.style.display = "none";
      }
    }
    function apply(element) {
      var _a, _b;
      if (!(element instanceof HTMLInputElement) && !(element instanceof HTMLTextAreaElement)) {
        return;
      }
      const mode = getMode(element);
      if (!mode) return;
      const maxLength = getMaxLength(element);
      if (maxLength === null && [...element.classList].some(
        (name) => /^len-\d+$/.test(name)
      )) {
        return;
      }
      const oldValue = element.value;
      const start = (_a = element.selectionStart) != null ? _a : oldValue.length;
      const end = (_b = element.selectionEnd) != null ? _b : oldValue.length;
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
      const maxLength = getMaxLength(element);
      if (maxLength === null) return;
      if (event.inputType.startsWith("delete")) return;
      if (event.isComposing) return;
      const start = (_a = element.selectionStart) != null ? _a : element.value.length;
      const end = (_b = element.selectionEnd) != null ? _b : element.value.length;
      const selectedLength = Array.from(
        element.value.slice(start, end)
      ).length;
      const currentLength = Array.from(element.value).length;
      const insertedLength = Array.from(
        event.data || ""
      ).length;
      const nextLength = currentLength - selectedLength + insertedLength;
      if (nextLength > maxLength) {
        event.preventDefault();
        showError(element, messages.length);
      }
    }
    document2.addEventListener(
      "beforeinput",
      handleBeforeInput
    );
    document2.addEventListener("input", function(event) {
      const element = event.target;
      if (!isSupported(element)) return;
      if (element.isComposing) return;
      apply(element);
    });
    function isSupported(element) {
      return (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) && getMode(element) !== null;
    }
    document2.addEventListener("input", function(event) {
      const element = event.target;
      if (!isSupported(element)) return;
      if (element.isComposing) return;
      apply(element);
    });
    document2.addEventListener("compositionend", function(event) {
      if (isSupported(event.target)) {
        apply(event.target);
      }
    });
    ForceInput.init = function(root = document2) {
      if (root.matches && root.matches("input, textarea")) {
        apply(root);
      }
      if (root.querySelectorAll) {
        root.querySelectorAll("input, textarea").forEach(apply);
      }
      return ForceInput;
    };
    ForceInput.apply = apply;
    ForceInput.config = function(options = {}) {
      if (options.messages) {
        messages = {
          ...messages,
          ...options.messages
        };
      }
      return ForceInput;
    };
    function handleBeforeInput(event) {
      var _a, _b;
      const element = event.target;
      if (!isSupported(element)) return;
      if (event.isComposing) return;
      const mode = getMode(element);
      const maxLength = getMaxLength(element);
      if (event.inputType.startsWith("delete")) return;
      if (event.inputType === "historyUndo" || event.inputType === "historyRedo") return;
      if (event.data === null) return;
      const normalized = normalize(event.data, mode, null);
      if (normalized.invalid) {
        event.preventDefault();
        showError(element, getMessage(mode));
        return;
      }
      const start = (_a = element.selectionStart) != null ? _a : element.value.length;
      const end = (_b = element.selectionEnd) != null ? _b : element.value.length;
      const currentLength = Array.from(element.value).length;
      const selectedLength = Array.from(
        element.value.slice(start, end)
      ).length;
      const insertedLength = Array.from(
        normalized.value
      ).length;
      if (maxLength !== null && currentLength - selectedLength + insertedLength > maxLength) {
        event.preventDefault();
        showError(element, messages.length);
      }
    }
    ForceInput.toEnglishDigits = toEnglishDigits;
    window2.ForceInput = ForceInput;
    ForceInput.init();
  })(window, document);
})();
