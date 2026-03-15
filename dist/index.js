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
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var VERSION = "3.0.1";
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
    const response = await fetch(`${endpoint}/${resolvedFormId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}`);
    }
    return response.json();
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
var index_default = Slapform;
module.exports=module.exports.default||module.exports;
