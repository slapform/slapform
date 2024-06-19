<p align="center">
  <a href="https://slapform.com">
    <img src="https://cdn.itwcreativeworks.com/assets/slapform/images/logo/slapform-brandmark-blue-x.svg" width="100px">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/package-json/v/slapform/slapform.svg">
  <br>
  <img src="https://img.shields.io/librariesio/release/npm/slapform.svg">
  <img src="https://img.shields.io/bundlephobia/min/slapform.svg">
  <img src="https://img.shields.io/codeclimate/maintainability-percentage/slapform/slapform.svg">
  <img src="https://img.shields.io/npm/dm/slapform.svg">
  <img src="https://img.shields.io/node/v/slapform.svg">
  <img src="https://img.shields.io/website/https/itwcreativeworks.com.svg">
  <img src="https://img.shields.io/github/license/slapform/slapform.svg">
  <img src="https://img.shields.io/github/contributors/slapform/slapform.svg">
  <img src="https://img.shields.io/github/last-commit/slapform/slapform.svg">
  <br>
  <br>
  <a href="https://slapform.com">Site</a> | <a href="https://www.npmjs.com/package/slapform">NPM Module</a> | <a href="https://github.com/slapform/slapform">GitHub Repo</a>
  <br>
  <br>
  <strong>slapform</strong> is the official npm module of <a href="https://slapform.com">Slapform</a>, a backend form processing service for contact forms, payment forms, and much more—perfectly suited for static sites!
  <br>
</p>

## 🌐 Slapform Works in Node AND browser environments
Yes, this module works in both Node and browser environments, including compatibility with [Webpack](https://www.npmjs.com/package/webpack) and [Browserify](https://www.npmjs.com/package/browserify)!

## 🦄 Features
* Submit data via HTML forms, AJAX requests, or our custom npm module
* Submissions are sent directly to your email
* Access your submissions stored in our secure cloud server for up to 12 months
* Spam protection
* Zapier integration—connect Slapform with *any* service!

## 📦 Install Slapform
### Option 1: Install via npm
Install with npm if you plan to use Slapform in a Node project or in the browser.
```shell
npm install slapform
```
If you plan to use `slapform` in a browser environment, you will probably need to use [Webpack](https://www.npmjs.com/package/webpack), [Browserify](https://www.npmjs.com/package/browserify), or a similar service to compile it.

```js
const slapform = new (require('slapform'));
```

### Option 2: Install via CDN
Install with CDN if you plan to use Slapform only in a browser environment.
```html
<script src="https://cdn.jsdelivr.net/npm/slapform@latest/dist/index.min.js"></script>
<script type="text/javascript">
  var slapform = new Slapform(); // The script above exposes the global variable 'Slapform'
</script>
```

### Option 3: Use without installation
You can also use Slapform without installing any additional libraries by using HTML forms or jQuery's AJAX. Please see the section below for details.

## 🚀 Create a free form
Slapform is **free**! You just need to [create a form](https://slapform.com/dashboard/forms/new).

After creating a form, you will get your **form ID** that you can use in your forms!

## ⚡️ Using Slapform
### Via the npm module or the CDN
After you have followed the install step, you can start using `slapform` with your website or software!
```js
slapform.submit({
  // Replace this with the form ID that submissions should be sent to
  form: '{form_id}',
  // The data you want submitted and emailed to you
  data: {
    name: 'Jon Snow',
    message: 'Hello World!'
  }
})
.then(function (response) {
  // This function runs only on success
  console.log('Success!', response);
})
.catch(function (response) {
  // This function runs only on error
  console.log('Fail!', response);
})
.finally(function () {
  // This function runs regardless of success or error
  console.log('This always runs!');
});
```

### Via an HTML form
You can use Slapform without installing this npm module or any other javascript simply by using an HTML form and pointing the `action` to our endpoint!
```html
<form method="POST"
  action="https://api.slapform.com/{form_id}">
  <input type="email" name="email">
  <textarea type="text" name="message"></textarea>
  <button type="submit">Submit</button>
</form>
<!-- Just copy/paste this on your site and change '{form_id}' to your form ID! -->
```

## 🧩 Extending Capabilities
### Using Advanced Name Triggers
In addition to sending simple data, you can take advantage of advanced name triggers to submit with your data. These will trigger special events on the server such as webhooks or the ability to process payments.
```js
slapform.submit({
  // Replace this with the form ID that submissions should be sent to
  form: '{form_id}',

  // The data you want submitted and emailed to you
  data: {
    name: 'Jon Snow',
    message: 'Hello World! This is my first Slapform submission.',
    slap_subject: 'My Favorite Message',
    slap_replyto: 'custom@replyto.com'
    slap_debug: false,
    slap_honey: ''
  }
})
```

For a more in-depth overview of how these triggers work, please see the [Slapform name trigger documentation](https://slapform.com/docs/name-triggers/).

## 📝 What Can Slapform do?
Slapform is a [form backend service](https://slapform.com) that you can use to submit data without managing a backend server. Slapform allows you to focus on the fun and productive parts of web development without worrying about building another form processing backend. Slapform works perfect as a [Jekyll contact form](https://slapform.com/docs/make-a-jekyll-contact-form/) or a [static site contact form](https://slapform.com/).

## 🗨️ Final Words
If you are still having difficulty, we would love for you to post
a question to [the Slapform issues page](https://github.com/slapform/slapform/issues). It is much easier to answer questions that include your code and relevant files! So if you can provide them, we'd be extremely grateful (and more likely to help you find the answer!)

## 📚 Projects Using this Library
[Somiibo](https://somiibo.com/): A Social Media Bot with an open-source module library. <br>
[JekyllUp](https://jekyllup.com/): A website devoted to sharing the best Jekyll themes. <br>
[Slapform](https://slapform.com/): A backend processor for your HTML forms on static sites. <br>
[SoundGrail Music App](https://app.soundgrail.com/): A resource for producers, musicians, and DJs. <br>
[Hammock Report](https://hammockreport.com/): An API for exploring and listing backyard products. <br>

Ask us to have your project listed! :)
