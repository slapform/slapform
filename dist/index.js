var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.js
var index_exports = {};
__export(index_exports, {
  Slapform: () => Slapform,
  default: () => index_default2
});
module.exports = __toCommonJS(index_exports);

// node_modules/wonderful-fetch/dist/index.mjs
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
function normalizeOptions(url, options) {
  url = url || options.url;
  if (!url) {
    throw new Error("No URL provided.");
  }
  options = options || {};
  options.timeout = options.timeout || 6e4;
  options.tries = typeof options.tries === "undefined" ? 1 : options.tries;
  options.log = typeof options.log === "undefined" ? false : options.log;
  options.method = (options.method || "get").toLowerCase();
  options.cacheBreaker = typeof options.cacheBreaker === "undefined" ? true : options.cacheBreaker;
  options.contentType = (typeof options.contentType === "undefined" ? "" : options.contentType).toLowerCase();
  options.response = (typeof options.response === "undefined" ? "raw" : options.response).toLowerCase();
  options.output = typeof options.output === "undefined" ? "body" : options.output;
  options.authorization = typeof options.authorization === "undefined" ? false : options.authorization;
  options.attachResponseHeaders = typeof options.attachResponseHeaders === "undefined" ? false : options.attachResponseHeaders;
  options.download = options.download || false;
  options.headers = options.headers || {};
  options.query = options.query || {};
  options.body = options.body || null;
  return { url, options };
}
function buildRequest(url, options) {
  const bodyIsObject = options.body && typeof options.body === "object";
  const bodyIsFormData = bodyIsObject && typeof options.body.append === "function";
  const config = {
    method: options.method,
    headers: { ...options.headers },
    body: null
  };
  if (options.body) {
    if (bodyIsFormData) {
      config.body = options.body;
    } else if (bodyIsObject) {
      config.body = JSON.stringify(options.body);
    } else {
      config.body = options.body;
    }
  }
  if (bodyIsObject && !bodyIsFormData || options.contentType === "json") {
    config.headers["Content-Type"] = "application/json";
  }
  if (config.method === "get") {
    delete config.body;
    delete config.headers["Content-Type"];
  }
  if (options.authorization) {
    const auth = options.authorization;
    config.headers["Authorization"] = auth.match(/^Bearer |^Basic |^Digest /) ? auth : `Bearer ${auth}`;
  }
  const urlObj = new URL(url);
  Object.keys(options.query).forEach(function(key) {
    urlObj.searchParams.set(key, options.query[key]);
  });
  const cacheBreaker = options.cacheBreaker === true ? Math.floor(Date.now() / 1e3) : options.cacheBreaker;
  if (cacheBreaker) {
    urlObj.searchParams.set("cb", cacheBreaker);
  }
  if (options.log) {
    console.log("Fetch configuration:", {
      bodyIsFormData,
      bodyIsObject,
      options,
      config
    });
  }
  return { url: urlObj.toString(), config };
}
function parseHeaders(res) {
  const headers = {};
  if (!res || !res.headers) {
    return headers;
  }
  res.headers.forEach(function(value, key) {
    try {
      headers[key] = JSON.parse(value);
    } catch (e) {
      headers[key] = value;
    }
  });
  return headers;
}
async function parseResponse(res, options) {
  if (options.response === "raw") {
    return res;
  }
  const text = await res.text();
  if (options.response === "json") {
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(`Response is not JSON: ${e}`);
    }
  }
  return text;
}
function formatOutput(res, result, options) {
  if (options.output === "body") {
    return result;
  }
  return {
    status: res.status,
    headers: parseHeaders(res),
    body: result
  };
}
function buildError(res, options) {
  const headers = parseHeaders(res);
  return res.text().then(function(text) {
    const error = new Error(text || res.statusText || "Unknown error");
    error.status = res.status;
    if (headers["bm-properties"]) {
      try {
        Object.keys(headers["bm-properties"]).forEach(function(key) {
          error[key] = headers["bm-properties"][key];
        });
      } catch (e) {
        console.warn("Failed to add bm-properties to error object", e);
      }
    }
    if (options.attachResponseHeaders) {
      Object.keys(headers).forEach(function(key) {
        if (key !== "bm-properties") {
          error[key] = headers[key];
        }
      });
    }
    return error;
  });
}
function sleep(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  });
}
async function executeWithRetry(fn, options) {
  const maxTries = options.tries;
  const infinite = maxTries === 0;
  let lastError;
  for (let attempt = 1; infinite || attempt <= maxTries; attempt++) {
    if (attempt > 1) {
      const delay = Math.min(3e3 * (attempt - 1), 6e4);
      await sleep(delay);
    }
    if (options.log) {
      console.log(`Fetch (${attempt}/${options.tries}): attempt`);
    }
    let controller;
    let timeoutId;
    if (options.timeout > 0) {
      controller = new AbortController();
      timeoutId = setTimeout(function() {
        controller.abort();
      }, options.timeout);
    }
    try {
      const result = await fn(controller ? controller.signal : void 0);
      clearTimeout(timeoutId);
      return result;
    } catch (e) {
      clearTimeout(timeoutId);
      if (e.name === "AbortError") {
        lastError = new Error("Request timed out");
      } else {
        lastError = e;
      }
      if (!infinite && attempt >= maxTries) {
        throw lastError;
      }
    }
  }
}
function handleDownload(res, options) {
  const { Readable } = __require("stream");
  const jetpack = __require("fs-jetpack");
  const mime = __require("mime-types");
  const path = __require("path");
  return new Promise(function(resolve, reject) {
    const type = res.headers.get("content-type");
    const ext = (mime.extension(type) || "").replace("jpeg", "jpg");
    if (!jetpack.exists(options.download)) {
      const dir = path.dirname(options.download);
      jetpack.dir(dir);
    }
    const existingExt = path.extname(options.download);
    if (!existingExt) {
      options.download += `.${ext}`;
    }
    const nodeStream = Readable.fromWeb(res.body);
    const fileStream = jetpack.createWriteStream(options.download);
    nodeStream.pipe(fileStream);
    nodeStream.on("error", function(e) {
      reject(new Error(`Failed to download: ${e}`));
    });
    fileStream.on("finish", function() {
      resolve({
        res,
        path: options.download
      });
    });
  });
}
async function WonderfulFetch(url, options) {
  const normalized = normalizeOptions(url, options);
  url = normalized.url;
  options = normalized.options;
  const { url: requestUrl, config } = buildRequest(url, options);
  return executeWithRetry(async function(signal) {
    const fetchConfig = { ...config };
    if (signal) {
      fetchConfig.signal = signal;
    }
    const fetchFn = typeof window !== "undefined" && window.fetch || fetch;
    if (options.log) {
      console.log("Fetching:", requestUrl);
    }
    const res = await fetchFn(requestUrl, fetchConfig);
    if (res.ok && options.download) {
      const result2 = await handleDownload(res, options);
      return formatOutput(res, result2, options);
    }
    if (!res.ok) {
      const error = await buildError(res, options);
      throw error;
    }
    const result = await parseResponse(res, options);
    return formatOutput(res, result, options);
  }, options);
}
if (typeof window !== "undefined") {
  window.WonderfulFetch = WonderfulFetch;
}
var index_default = WonderfulFetch;

// src/index.js
var VERSION = "3.0.2";
var DEFAULT_ENDPOINT = "https://api.slapform.com";
var Slapform = class {
  constructor(options) {
    options = options || {};
    this.formId = options.formId || options.form || "";
    this.endpoint = options.endpoint || DEFAULT_ENDPOINT;
  }
  async submit(formId, data, options) {
    if (typeof formId === "object") {
      options = data;
      data = formId;
      formId = void 0;
    }
    options = options || {};
    const resolvedFormId = formId || options.formId || options.form || this.formId;
    const endpoint = options.endpoint || this.endpoint;
    if (!resolvedFormId) {
      throw new Error("Slapform: form ID is required");
    }
    data = Object.assign({}, data, {
      _version: VERSION,
      _source: "library",
      _referrer: getLocation()
    });
    return index_default(`${endpoint}/${resolvedFormId}`, {
      method: "post",
      response: "json",
      body: data,
      cacheBreaker: false
    });
  }
};
Slapform.version = VERSION;
function getLocation() {
  try {
    return window.location.href;
  } catch (e) {
    return null;
  }
}
if (typeof window !== "undefined") {
  window.Slapform = Slapform;
}
var index_default2 = Slapform;
module.exports=module.exports.default||module.exports;
