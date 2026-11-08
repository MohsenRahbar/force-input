# Force Input

A lightweight JavaScript library for input validation and normalization.

`force-input` helps control user input in HTML form fields. It supports Persian and English text, numeric-only fields, character limits, and Jalali/Gregorian date validation.

## Features

- Persian text input with English digits
- English text input
- Numeric-only input
- Persian and Arabic digit normalization
- Maximum character length
- Jalali date validation
- Gregorian date validation
- Input validation and normalization
- Customizable error messages
- Lightweight browser-based API

## Installation

Install using npm:

```bash
npm install force-input
```

Build the library:

```bash
npm run build
```

Or include the minified build directly in your HTML:

```html
<script src="https://unpkg.com/force-input/dist/force-input.min.js"></script>
```

The library exposes a global object named `ForceInput`.

## Quick Start

Add a supported class to an input:

```html
<input type="text" class="fa-force">
<input type="text" class="num-force">
<input type="text" class="en-force">
```

Initialize the library:

```html
<script src="dist/force-input.min.js"></script>
```

The library automatically initializes when loaded.

You can also initialize it manually:

```js
ForceInput.init();
```

## Supported Input Classes

### Persian text

| Class | Behavior |
|---|---|
| `fa-force` | Persian letters and English digits |
| `fa-force-res` | Numeric-only input |

Persian and Arabic digits are converted to English digits.

English letters are rejected in `fa-force`.

### English text

| Class | Behavior |
|---|---|
| `en-force` | English letters, digits, spaces and common punctuation |
| `en-force-res` | Numeric-only input |

Persian and Arabic letters are rejected in `en-force`.

### Numeric input

| Class | Behavior |
|---|---|
| `num-force` | Numeric-only input |
| `num-force-res` | Numeric-only input |

Persian and Arabic digits are normalized to English digits.

### Maximum length

Use `len-N` to set the maximum number of characters.

Example:

```html
<input type="text" class="fa-force len-10">
<input type="text" class="num-force len-5">
```

The library prevents input that exceeds the configured length where possible. Deletion remains available.

If multiple `len-N` classes are present, the library's handling of that case should be checked against the implementation.

### Date input

| Class | Date format | Minimum date |
|---|---|---|
| `fa-date` | Jalali `YYYY/MM/DD` | `1278/10/11` |
| `en-date` | Gregorian `YYYY/MM/DD` | `1900/01/01` |

Example:

```html
<input type="text" class="fa-date" placeholder="1405/01/15">
<input type="text" class="en-date" placeholder="2026/04/04">
```

Date input behavior:

- Persian and Arabic digits are converted to English digits.
- Only digits and `/` are accepted.
- The maximum date input length is 10 characters.
- Incomplete dates are not shown as invalid during normal input.
- Complete but invalid dates remain visible and display an error.

## Public API

All public methods are available through the global `ForceInput` object.

### `ForceInput.init(root)`

Initializes the library and attaches event listeners.

It also processes supported inputs inside the specified root.

```js
ForceInput.init();
```

Initialize only a specific container:

```js
const form = document.querySelector("#my-form");

ForceInput.init(form);
```

**Parameter**

| Name | Type | Default |
|---|---|---|
| `root` | `Document` or `Element` | `document` |

Returns the `ForceInput` object.

### `ForceInput.apply(element)`

Applies input normalization and validation to a single element.

```js
const input = document.querySelector(".fa-force");

ForceInput.apply(input);
```

### `ForceInput.refresh(root)`

Processes inputs again inside the specified root.

Useful when new inputs are added dynamically.

```js
const container = document.querySelector("#dynamic-form");

ForceInput.refresh(container);
```

**Parameter**

| Name | Type | Default |
|---|---|---|
| `root` | `Document` or `Element` | `document` |

Returns the `ForceInput` object.

### `ForceInput.validate(element)`

Validates an input without relying only on the visible error state.

```js
const input = document.querySelector(".fa-date");

const result = ForceInput.validate(input);

console.log(result.valid);
console.log(result.message);
```

Return structure:

```js
{
    valid: true,
    message: null
}
```

For invalid values, `valid` is `false` and `message` contains the relevant validation message.

For date inputs, incomplete dates are considered invalid by this programmatic validation method.

### `ForceInput.getValue(element)`

Returns the normalized value of a supported input.

```js
const input = document.querySelector(".num-force");

const value = ForceInput.getValue(input);

console.log(value);
```

This method returns a normalized value without requiring the caller to read the raw input value.

Returns `null` for unsupported elements.

### `ForceInput.config(options)`

Updates library configuration.

Currently, custom error messages can be provided through the `messages` property.

```js
ForceInput.config({
    messages: {
        // Custom message overrides
    }
});
```

Custom message keys and their exact names should be taken from the library's current source code.

Returns the `ForceInput` object.

### `ForceInput.destroy()`

Removes the library's event listeners and generated error elements.

```js
ForceInput.destroy();
```

Call `ForceInput.init()` again to reactivate the library.

Returns the `ForceInput` object.

### `ForceInput.toEnglishDigits(value)`

Converts Persian and Arabic numerals to English digits.

```js
const result = ForceInput.toEnglishDigits("۱۲۳٤٥");

console.log(result); // "12345"
```

## Example

```html
<form id="my-form">
    <input
        type="text"
        class="fa-force"
        placeholder="نام"
    >

    <input
        type="text"
        class="num-force len-10"
        placeholder="شماره"
    >

    <input
        type="text"
        class="fa-date"
        placeholder="1405/01/15"
    >

    <button type="submit">Submit</button>
</form>

<script src="dist/force-input.min.js"></script>

<script>
    const form = document.querySelector("#my-form");

    form.addEventListener("submit", function (event) {
        const inputs = form.querySelectorAll(
            ".fa-force, .num-force, .fa-date"
        );

        let isValid = true;

        inputs.forEach(function (input) {
            const result = ForceInput.validate(input);

            if (!result.valid) {
                isValid = false;
            }
        });

        if (!isValid) {
            event.preventDefault();
        }
    });
</script>
```

## Browser Support

`force-input` is designed for modern browsers that support:

- JavaScript ES2018
- `beforeinput`
- `input`
- `compositionend`
- `classList`

Browser compatibility should be verified against the project's supported browser matrix.

## Dependencies

- [jalaali-js](https://www.npmjs.com/package/jalaali-js) — Jalali date validation and conversion utilities.

## License
MIT