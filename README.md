<p align="center">
  <a href="https://slapform.com">
    <img src="https://cdn.itwcreativeworks.com/assets/slapform/images/logo/slapform-brandmark-blue-x.svg" width="100px">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/package-json/v/slapform/slapform.svg">
  <img src="https://img.shields.io/bundlephobia/min/slapform.svg">
  <img src="https://img.shields.io/npm/dm/slapform.svg">
  <img src="https://img.shields.io/node/v/slapform.svg">
  <img src="https://img.shields.io/github/license/slapform/slapform.svg">
  <br>
  <br>
  <a href="https://slapform.com">Site</a> | <a href="https://www.npmjs.com/package/slapform">NPM Module</a> | <a href="https://github.com/slapform/slapform">GitHub Repo</a>
  <br>
  <br>
  <strong>Slapform</strong> is the official npm module for <a href="https://slapform.com">Slapform</a>, a backend form processing service for contact forms, payment forms, and more—perfectly suited for static sites.
</p>

## Quick start

### 1. Create a form

Go to [slapform.com/dashboard/forms/new](https://slapform.com/dashboard/forms/new) to create your form. Copy the **Form ID** when you're done.

### 2. Add to your site

**Script tag** (no build tools needed):

```html
<script src="https://cdn.jsdelivr.net/npm/slapform@latest/dist/slapform.min.js"></script>
<script>
  var slapform = new Slapform();

  slapform.submit('YOUR_FORM_ID', {
    name: 'Jon Snow',
    message: 'Hello World!',
  })
  .then(function (response) {
    console.log('Success!', response);
  })
  .catch(function (error) {
    console.error('Failed:', error.message);
  });
</script>
```

**NPM**:

```
npm install slapform
```

```js
// ESM
import Slapform from 'slapform';

// CommonJS
const Slapform = require('slapform');
```

```js
const slapform = new Slapform({ formId: 'YOUR_FORM_ID' });

const response = await slapform.submit({
  name: 'Jon Snow',
  message: 'Hello World!',
});
```

## HTML form (no JavaScript needed)

You can use Slapform without any JavaScript by pointing your HTML form's `action` to the API:

```html
<form method="POST" action="https://api.slapform.com/YOUR_FORM_ID">
  <input type="email" name="email">
  <textarea name="message"></textarea>
  <button type="submit">Submit</button>
</form>
```

## API

### `new Slapform(options)`

| Option | Default | Description |
|--------|---------|-------------|
| `formId` | `''` | Your form ID (also accepts `form`) |
| `endpoint` | `'https://api.slapform.com'` | API endpoint |

### `slapform.submit(formId?, data, options?)`

Submits form data. Returns a promise that resolves with the API response.

- **formId** (optional) — Form ID string. Overrides the constructor's `formId`
- **data** — Object with the fields you want to submit
- **options** — Optional overrides for `formId` and `endpoint`

```js
// Pass formId inline
slapform.submit('YOUR_FORM_ID', { message: 'Hello' });

// Or use the constructor default and just pass data
const sf = new Slapform({ formId: 'YOUR_FORM_ID' });
sf.submit({ message: 'Hello' });

// Override formId via options
sf.submit({ message: 'Hello' }, { formId: 'DIFFERENT_FORM_ID' });
```

### Name triggers

Use special field names to trigger server-side behavior:

```js
slapform.submit('YOUR_FORM_ID', {
  name: 'Jon Snow',
  message: 'Hello World!',
  slap_subject: 'My Favorite Message',
  slap_replyto: 'custom@replyto.com',
  slap_debug: false,
  slap_honey: '',
});
```

See the [name trigger documentation](https://slapform.com/docs/name-triggers/) for details.

## Features

- Submit data via HTML forms, AJAX, or this npm module
- Submissions are sent directly to your email
- Access submissions stored securely for up to 12 months
- Spam protection
- Zapier integration

## Development

```bash
npm start        # Watch mode - rebuilds on file changes
npm run build    # One-time build (ESM, CJS, IIFE)
npm test         # Run tests
```

### Build outputs

| File | Format | Use case |
|------|--------|----------|
| `dist/index.mjs` | ESM | `import` in modern bundlers |
| `dist/index.js` | CJS | `require()` in Node.js |
| `dist/slapform.min.js` | IIFE (minified) | `<script>` tag / CDN |

## License

MIT
