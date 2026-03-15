import WonderfulFetch from 'wonderful-fetch';

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

    return WonderfulFetch(`${endpoint}/${resolvedFormId}`, {
      method: 'post',
      response: 'json',
      body: data,
      cacheBreaker: false,
    });
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
