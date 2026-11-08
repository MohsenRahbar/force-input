# Force Input

A lightweight JavaScript library for input validation and normalization.

`force-input` helps control user input in HTML form fields. It supports Persian and English text, numeric-only fields, character limits, and Jalali/Gregorian date validation.

## Features

- Persian text input with English digits
- English text input
- Persian-only and English-only text fields
- Numeric-only input
- Persian and Arabic digit normalization
- Maximum character length
- Jalali date validation
- Gregorian date validation
- Input validation and normalization
- Customizable error messages
- Automatic initialization
- Lightweight browser-based API

## Installation

Install using npm:

```bash
npm install force-input
```

## Usage

### Using a script tag

Include the minified build in your HTML:

```html
<script src="https://unpkg.com/force-input@1.0.0/dist/force-input.min.js"></script>
```

The library exposes a global object named `ForceInput` and automatically initializes supported inputs when loaded.

### Using the local build

```html
<script src="dist/force-input.min.js"></script>
```

## Quick Start

Add one of the supported classes to your input elements:

```html
<input type="text" class="fa-force" placeholder="نام">

<input type="text" class="en-force" placeholder="Name">

<input type="text" class="num-force" placeholder="Number">

<input type="text" class="fa-date" placeholder="1405/01/15">
```

The library automatically detects and initializes these inputs.

You can also initialize it manually:

```js
ForceInput.init();
```

## Supported Input Classes

### Persian text

| Class | Behavior |
|---|---|
| `fa-force` | Persian letters, English digits and supported punctuation |
| `fa-force-res` | Persian letters and ordinary spaces only |

- Persian and Arabic digits are converted to English digits in `fa-force`.
- English letters are rejected in `fa-force`.
- `fa-force-res` does not accept digits or punctuation.

### English text

| Class | Behavior |
|---|---|
| `en-force` | English letters, digits, spaces and common punctuation |
| `en-force-res` | English letters and ordinary spaces only |

- Persian and Arabic letters are rejected in `en-force`.
- `en-force-res` does not accept digits or punctuation.

### Numeric input

| Class | Behavior |
|---|---|
| `num-force` | Numeric-only input |
| `num-force-res` | Numeric-only input |

Persian and Arabic digits are normalized to English digits.

### Maximum length

Use `len-N` to set the maximum number of characters.

Examples:

```html
<input type="text" class="fa-force len-50">

<input type="text" class="num-force len-10">

<input type="text" class="en-force len-30">
```

Behavior:

- Prevents input that exceeds the configured length where possible.
- Allows deletion even when the input has reached its limit.
- Normalizes the value after input as a fallback.

Use one `len-N` class per input.

### Date input

| Class | Date format | Minimum date |
|---|---|---|
| `fa-date` | Jalali `YYYY/MM/DD` | `1278/10/11` |
| `en-date` | Gregorian `YYYY/MM/DD` | `1900/01/01` |

Examples:

```html
<input
    type="text"
    class="fa-date"
    placeholder="1405/01/15"
>

<input
    type="text"
    class="en-date"
    placeholder="2026/04/04"
>
```

Date input behavior:

- Persian and Arabic digits are converted to English digits.
- Only digits and `/` are accepted.
- The maximum input length is 10 characters.
- Incomplete dates do not show a date validation error during normal input.
- Complete but invalid dates remain visible and display an error.
- Calendar validity and minimum date are checked.

## Public API

All public methods are available through the global `ForceInput` object.

### `ForceInput.init(root)`

Initializes the library and attaches event listeners to supported inputs.

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

Processes supported inputs again inside the specified root.

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

Validates an input programmatically.

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

For invalid values:

- `valid` is `false`.
- `message` contains the relevant validation message.

For date inputs, incomplete dates are considered invalid by this programmatic validation method.

### `ForceInput.getValue(element)`

Returns the normalized value of a supported input.

```js
const input = document.querySelector(".num-force");

const value = ForceInput.getValue(input);

console.log(value);
```

Returns `null` for unsupported elements.

### `ForceInput.config(options)`

Updates library configuration.

Custom error messages can be provided through the `messages` property.

```js
ForceInput.config({
    messages: {
        // Custom message overrides
    }
});
```

Message keys depend on the library's configured message definitions.

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

## Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Force Input Example</title>
</head>
<body>

    <form id="my-form">

        <input
            type="text"
            class="fa-force"
            placeholder="نام"
        >

        <input
            type="text"
            class="fa-force-res"
            placeholder="نام فارسی"
        >

        <input
            type="text"
            class="en-force"
            placeholder="Name"
        >

        <input
            type="text"
            class="en-force-res"
            placeholder="English name"
        >

        <input
            type="text"
            class="num-force len-10"
            placeholder="Number"
        >

        <input
            type="text"
            class="fa-date"
            placeholder="1405/01/15"
        >

        <input
            type="text"
            class="en-date"
            placeholder="2026/04/04"
        >

        <button type="submit">Submit</button>

    </form>

    <script src="dist/force-input.min.js"></script>

    <script>
        const form = document.querySelector("#my-form");

        form.addEventListener("submit", function (event) {

            const inputs = form.querySelectorAll(
                ".fa-force, .fa-force-res, " +
                ".en-force, .en-force-res, " +
                ".num-force, .num-force-res, " +
                ".fa-date, .en-date"
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

</body>
</html>
```

## Important Notes

- `force-input` works with HTML input elements.
- Input validation is performed on the client side.
- Client-side validation does not replace server-side validation.
- Always validate important data on your backend.
- The library automatically initializes supported inputs when its script is loaded.
- Use `ForceInput.refresh()` when adding new supported inputs dynamically.

## Browser Support

`force-input` is designed for modern browsers that support:

- JavaScript ES2018
- `beforeinput`
- `input`
- `compositionend`
- `classList`

Browser compatibility should be verified against the browsers targeted by your project.

## Dependencies

- [jalaali-js](https://www.npmjs.com/package/jalaali-js) — Jalali date validation and conversion utilities.

## License

MIT License.