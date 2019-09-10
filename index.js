(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    // define(['b'], factory);
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    // module.exports = factory(require('b'));
    module.exports = factory('node');
  } else {
    // Browser globals (root is window)
    // root.returnExports = factory(root.b);
    root.returnExports = factory('browser');
  }
}(this, function (environment) {
  environment = environment || 'node';
  // attach properties to the exports object to define
  // the exported module properties.

  this.extra = '8'; //@@@ Delete later

  // if ((typeof window !== 'undefined') && (window.XMLHttpRequest || XMLHttpRequest || ActiveXObject)) {
  //   environment = 'browser';
  // }
  environment = (Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]') ? 'node' : 'browser';

  if (environment == 'browser') {
    registerName();
  }

  function registerName() {
    // console.log('Registered slapform to window!');
    try {
      window.Slapform = Slapform;
    } catch (e) {
    }
  }

  function Slapform(account, options) {
    this.account = account || '';
    this.options = options || {};
    // this.environment = '';
  };

  var parse = function (req) {
    var result;
    try {
      result = JSON.parse(req.responseText);
    } catch (e) {
      result = req.responseText;
    }
    return [result, req];
  };

  var parseDELETE = function (req) {
    var result;
    try {
      result = JSON.parse(req.responseText);
    } catch (e) {
      result = req.responseText;
    }
    return [result, req];
  };

  function loopErrors(errors) {
    for (var i = 0; i < errors.length; i++) {
      var output = '[' + errors[i].type +' ' + errors[i].code + ']: ' + errors[i].msg;
      if (errors[i].type == 'Warning') {
        console.warn(output);
      } else {
        console.error(output);
      }
    }
  }


  Slapform.prototype.submit = function(payload) {
    var methods = {
      success: function () {},
      error: function () {},
      always: function () {}
    };

    var atomXHR = {
      success: function (callback) {
        methods.success = callback;
        return atomXHR;
      },
      error: function (callback) {
        methods.error = callback;
        return atomXHR;
      },
      always: function (callback) {
        methods.always = callback;
        return atomXHR;
      }
    };

    payload = payload || {};
    payload.environment = payload.environment || environment || 'browser';
    payload.data = payload.data || {};
    payload.account = payload.account || payload.data.slap_email || payload.data.slap_account || '';

    var contentType = 'application/json';
    var accept = 'application/json';

    if (payload.environment == 'browser') {

      // console.log('Slapform: browser');
      var XHR = window.XMLHttpRequest || XMLHttpRequest || ActiveXObject;
      var request = new XHR('MSXML2.XMLHTTP.3.0');

      request.open('POST', 'https://api.slapform.com' + '/' + payload.account, true);
      request.setRequestHeader('Content-type', contentType);
      request.setRequestHeader('Accept', accept);
      // request.setRequestHeader('Referer', window && window.location ? window.location.href : '' );
      request.setRequestHeader('Access-Control-Allow-Origin', '*');
      request.onreadystatechange = function () {
        var req;
        if (request.readyState === 4) {
          req = parse(request);
          if (request.status >= 200 && request.status < 300) {
            if (req[0] && req[0].meta && req[0].meta.status == 'success') {
              methods.success.call(methods, request, req[0]);
            } else {
              methods.error.call(methods, request, req[0].meta.errors);
              loopErrors(req[0].meta.errors);
            }
          } else {
            methods.error.call(methods, request, request.statusText);
          }
          methods.always.call(methods, request);
        }
      };

      // if ((contentType.indexOf('json') > -1)) {
      //   try {
      //     payload.data = JSON.stringify(payload.data);
      //   } catch (e) {
      //     console.error('AJAX could not stringify data.')
      //   }
      // }
      payload.data = stringifyData(payload.data);

      request.send(payload.data);
      return atomXHR;
    } else {
      // console.log('Slapform: node');
      var https = require('https');
      var options = {
        hostname: 'api.slapform.com',
        // hostname: 'api.INCORRECTTEST.com',
        // port: 443,
        path: '/' + payload.account,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // 'Content-Length': Buffer.byteLength(post_data)
        }
      };

      var globalRes;
      var full = '';
      var req = https.request(options, function(res) {
        globalRes = res;

        res.on('data', function(chunk) {
          full += chunk;
        });
        res.on('end', function() {
          // console.log('END > ', full.toString());
          var resData = JSON.parse(full.toString());
          if (resData && resData.meta && resData.meta.status == 'success') {
            methods.success.call(methods, res, JSON.parse(full.toString()));
          } else {
            methods.error.call(methods, res, resData.meta.errors);
            loopErrors(resData.meta.errors);
          }
          methods.always.call(methods, globalRes);
        });

      });
      req.on('error', function(e) {
        methods.error.call(methods, {}, e);
        methods.always.call(methods, globalRes);
      });

      // if ((contentType.indexOf('json') > -1)) {
      //   try {
      //     payload.data = JSON.stringify(payload.data);
      //   } catch (e) {
      //     console.error('Could not stringify data.')
      //   }
      // }
      payload.data = stringifyData(payload.data);
      req.write(payload.data);
      req.end();
      return atomXHR;
    }

  }

  function stringifyData(data) {
    // if ((contentType.indexOf('json') > -1)) {
    // var response = data;
      try {
        data = JSON.stringify(data);
      } catch (e) {
        console.error('Could not stringify data.');
      }
      return data;
    // }
  }

  Slapform.prototype.getResponse = function(payload) {
    var response = {
      meta: {
        status: 'success',
        errors: [],
        referrer: ''
      },
      data: {},
      triggers: {}
    };
    payload = payload || {};
    payload.url = payload.url || window.location.href;
    payload.options = payload.options || {};

    if ((typeof window == 'undefined') || (false)) {
      response.meta.status = 'fail';
      response.meta.errors.push({type: 'error', msg: 'This method is only available in browser environments.', code: ''});
      return response;
    }
    try {
      /* GOTTEN FROM web-manager/query.js */
      payload.url = payload.url.replace(/amp;/g,"");
      payload.url = decodeURIComponent(payload.url);
      var urlPlain = payload.url.split('?')[0] || payload.url;
      var t_params = getParameters(payload.url);
      if (typeof t_params.meta === 'undefined') {
       response.meta.status = 'fail';
       response.meta.errors.push({type: 'error', msg: 'Could not detect query string in URL: ' + payload.url, code: ''});
       return response;
     }
     response = {
       meta: JSON.parse(t_params.meta || "{}"),
       data: JSON.parse(t_params.data || "{}"),
       triggers: JSON.parse(t_params.triggers || "{}")
     }
    } catch (e) {
      response.meta.status = 'fail';
      response.meta.errors.push({type: 'error', msg: e});
      return response;
    }

    return response;
  }

  // function determineEnvironment() {
  //
  // }

  function getParameters(url) {
    var params = {}, queries, temp, i, l;
    // queries = url.split('?')[1].split('&') || [];
    queries = url.split('?')[1];
    queries = (queries) ? queries.split('&') : [];
    for ( i = 0, l = queries.length; i < l; i++ ) {
      temp = queries[i].split('=');
      params[temp[0]] = temp[1];
      // params[temp[0]] = (typeof temp[1] !== 'undefined') ? temp[1].replace(/\+/g, ' ') : "";
    };
    return params;
  }

  return Slapform; // Enable if using UMD
  // module.exports = Slapform; // Enable if using regular module.exports
}));
