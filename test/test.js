const pkg = require('../package.json');
const assert = require('assert');

describe(`${pkg.name}`, () => {
  const Slapform = require('../dist/index.js');

  // Store original fetch so we can restore it
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('constructor', () => {
    it('should create an instance with defaults', () => {
      const sf = new Slapform();
      assert.strictEqual(sf.formId, '');
      assert.strictEqual(sf.endpoint, 'https://api.slapform.com');
    });

    it('should accept formId and endpoint options', () => {
      const sf = new Slapform({ formId: 'test@example.com', endpoint: 'https://custom.api.com' });
      assert.strictEqual(sf.formId, 'test@example.com');
      assert.strictEqual(sf.endpoint, 'https://custom.api.com');
    });

    it('should accept legacy form option', () => {
      const sf = new Slapform({ form: 'test@example.com' });
      assert.strictEqual(sf.formId, 'test@example.com');
    });

    it('should prefer formId over form', () => {
      const sf = new Slapform({ formId: 'preferred', form: 'legacy' });
      assert.strictEqual(sf.formId, 'preferred');
    });

    it('should handle no arguments', () => {
      const sf = new Slapform();
      assert.ok(sf instanceof Slapform);
    });

    it('should handle empty options', () => {
      const sf = new Slapform({});
      assert.strictEqual(sf.formId, '');
      assert.strictEqual(sf.endpoint, 'https://api.slapform.com');
    });
  });

  describe('.submit()', () => {
    it('should be a function', () => {
      const sf = new Slapform({ formId: 'test@example.com' });
      assert.strictEqual(typeof sf.submit, 'function');
    });

    it('should return a promise', () => {
      const sf = new Slapform({ formId: 'test@example.com' });

      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const result = sf.submit({ message: 'hello' });
      assert.ok(result instanceof Promise);
    });

    it('should throw if no form ID is provided', async () => {
      const sf = new Slapform();
      await assert.rejects(() => sf.submit({ message: 'hello' }), {
        message: 'Slapform: form ID is required',
      });
    });

    it('should throw if formId is empty on both constructor and options', async () => {
      const sf = new Slapform({ formId: '' });
      await assert.rejects(() => sf.submit({ message: 'hello' }, { formId: '' }));
    });

    it('should use formId from constructor', async () => {
      let calledUrl;

      global.fetch = (url) => {
        calledUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'success' }),
        });
      };

      const sf = new Slapform({ formId: 'my-form' });
      await sf.submit({ message: 'test' });

      assert.strictEqual(calledUrl, 'https://api.slapform.com/my-form');
    });

    it('should accept formId as first argument', async () => {
      let calledUrl;

      global.fetch = (url) => {
        calledUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'success' }),
        });
      };

      const sf = new Slapform();
      await sf.submit('inline-form', { message: 'test' });

      assert.strictEqual(calledUrl, 'https://api.slapform.com/inline-form');
    });

    it('should prioritize inline formId over constructor formId', async () => {
      let calledUrl;

      global.fetch = (url) => {
        calledUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'success' }),
        });
      };

      const sf = new Slapform({ formId: 'default-form' });
      await sf.submit('override-form', { message: 'test' });

      assert.strictEqual(calledUrl, 'https://api.slapform.com/override-form');
    });

    it('should allow overriding formId via options', async () => {
      let calledUrl;

      global.fetch = (url) => {
        calledUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'success' }),
        });
      };

      const sf = new Slapform({ formId: 'default-form' });
      await sf.submit({ message: 'test' }, { formId: 'override-form' });

      assert.strictEqual(calledUrl, 'https://api.slapform.com/override-form');
    });

    it('should allow overriding endpoint per submission', async () => {
      let calledUrl;

      global.fetch = (url) => {
        calledUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'success' }),
        });
      };

      const sf = new Slapform({ formId: 'my-form' });
      await sf.submit({ message: 'test' }, { endpoint: 'https://custom.api.com' });

      assert.strictEqual(calledUrl, 'https://custom.api.com/my-form');
    });

    it('should send POST request with correct headers', async () => {
      let calledOptions;

      global.fetch = (url, options) => {
        calledOptions = options;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'success' }),
        });
      };

      const sf = new Slapform({ formId: 'my-form' });
      await sf.submit({ message: 'test' });

      assert.strictEqual(calledOptions.method, 'POST');
      assert.strictEqual(calledOptions.headers['Content-Type'], 'application/json');
      assert.strictEqual(calledOptions.headers['Accept'], 'application/json');
    });

    it('should include user data in request body', async () => {
      let sentBody;

      global.fetch = (url, options) => {
        sentBody = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'success' }),
        });
      };

      const sf = new Slapform({ formId: 'my-form' });
      await sf.submit({ name: 'Jon', message: 'Hello' });

      assert.strictEqual(sentBody.name, 'Jon');
      assert.strictEqual(sentBody.message, 'Hello');
    });

    it('should attach metadata (_version, _source, _referrer)', async () => {
      let sentBody;

      global.fetch = (url, options) => {
        sentBody = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'success' }),
        });
      };

      const sf = new Slapform({ formId: 'my-form' });
      await sf.submit({ message: 'test' });

      assert.strictEqual(sentBody._version, pkg.version);
      assert.strictEqual(sentBody._source, 'library');
      assert.ok('_referrer' in sentBody);
    });

    it('should not mutate the original data object', async () => {
      global.fetch = () => {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'success' }),
        });
      };

      const sf = new Slapform({ formId: 'my-form' });
      const data = { message: 'test' };
      await sf.submit(data);

      assert.strictEqual(Object.keys(data).length, 1);
      assert.strictEqual(data.message, 'test');
      assert.strictEqual(data._version, undefined);
    });

    it('should resolve with parsed JSON on success', async () => {
      const expected = { status: 'success', submissionId: 'abc123' };

      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(expected),
      });

      const sf = new Slapform({ formId: 'my-form' });
      const result = await sf.submit({ message: 'test' });

      assert.deepStrictEqual(result, expected);
    });

    it('should throw on non-ok HTTP response with error text', async () => {
      global.fetch = () => Promise.resolve({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Bad Request'),
      });

      const sf = new Slapform({ formId: 'my-form' });
      await assert.rejects(() => sf.submit({ message: 'test' }), {
        message: 'Bad Request',
      });
    });

    it('should throw with HTTP status when error body is empty', async () => {
      global.fetch = () => Promise.resolve({
        ok: false,
        status: 500,
        text: () => Promise.resolve(''),
      });

      const sf = new Slapform({ formId: 'my-form' });
      await assert.rejects(() => sf.submit({ message: 'test' }), {
        message: 'HTTP 500',
      });
    });

    it('should throw on network error', async () => {
      global.fetch = () => Promise.reject(new Error('fetch failed'));

      const sf = new Slapform({ formId: 'my-form' });
      await assert.rejects(() => sf.submit({ message: 'test' }), {
        message: 'fetch failed',
      });
    });

    it('should handle 403 forbidden response', async () => {
      global.fetch = () => Promise.resolve({
        ok: false,
        status: 403,
        text: () => Promise.resolve('Form is disabled'),
      });

      const sf = new Slapform({ formId: 'my-form' });
      await assert.rejects(() => sf.submit({ message: 'test' }), {
        message: 'Form is disabled',
      });
    });

    it('should handle 409 duplicate response', async () => {
      global.fetch = () => Promise.resolve({
        ok: false,
        status: 409,
        text: () => Promise.resolve('Duplicate submission'),
      });

      const sf = new Slapform({ formId: 'my-form' });
      await assert.rejects(() => sf.submit({ message: 'test' }), {
        message: 'Duplicate submission',
      });
    });
  });
});
