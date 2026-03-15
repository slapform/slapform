const VERSION = '{version}';
const DEFAULT_ENDPOINT = 'https://api.slapform.com';

class Slapform {
  constructor(options) {
    options = options || {};

    this.formId = options.formId || options.form || '';
    this.endpoint = options.endpoint || DEFAULT_ENDPOINT;
  }

  async submit(formId, data, options) {
    // If formId is an object, shift arguments: submit(data, options?)
    if (typeof formId === 'object') {
      options = data;
      data = formId;
      formId = undefined;
    }

    options = options || {};

    const resolvedFormId = formId || options.formId || options.form || this.formId;
    const endpoint = options.endpoint || this.endpoint;

    if (!resolvedFormId) {
      throw new Error('Slapform: form ID is required');
    }

    // Attach metadata
    data = Object.assign({}, data, {
      _version: VERSION,
      _source: 'library',
      _referrer: getLocation(),
    });

    const response = await fetch(`${endpoint}/${resolvedFormId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}`);
    }

    return response.json();
  }
}

Slapform.version = VERSION;

function getLocation() {
  try {
    return window.location.href;
  } catch (e) {
    return null;
  }
}

// Browser environment
if (typeof window !== 'undefined') {
  window.Slapform = Slapform;
}

export default Slapform;
export { Slapform };
