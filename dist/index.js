(function (root, factory) {
  // https://github.com/umdjs/umd/blob/master/templates/returnExports.js
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.returnExports = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  var environment = (Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]') ? 'node' : 'browser';
  var SOURCE = 'library';
  var VERSION = '2.0.9';

  function Slapform(form, options) {
    this.form = form || '';
    this.options = options || {};
    // this.environment = '';
  };

  var parse = function (req) {
    var result;
    // console.log('RAW', req.responseText);
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
      if (errors[i].type === 'Warning') {
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
    payload.form = payload.form || payload.account || payload.data.slap_email || payload.data.slap_account || '';
    payload.endpoint = payload.endpoint || 'https://api.slapform.com';

    // var contentType = 'application/json';
    // var accept = 'application/json';
    var contentType = 'application/json; charset=utf-8';
    var accept = 'application/json, text/javascript, */*; q=0.01';

    // Set values
    payload.data._version = VERSION;
    payload.data._source = SOURCE;
    payload.data._referrer = getLocation();

    return new Promise(function(resolve, reject) {
      if (payload.environment === 'browser') {

        // console.log('Slapform: browser');
        var XHR = window.XMLHttpRequest || XMLHttpRequest || ActiveXObject;
        var request = new XHR('MSXML2.XMLHTTP.3.0');

        request.open('POST', payload.endpoint + '/' + payload.form, true);
        request.setRequestHeader('Content-type', contentType);
        request.setRequestHeader('Accept', accept);
        // request.setRequestHeader('Referer', window && window.location ? window.location.href : '' );
        // request.setRequestHeader('Access-Control-Allow-Origin', '*');
        request.onreadystatechange = function () {
          var req;
          if (request.readyState === 4) {
            req = parse(request);
            if (request.status >= 200 && request.status < 300) {
              if (req[0] && req[0].meta && req[0].meta.status === 'success') {
                return resolve(req[0]);
              } else {
                var errors = req[0].meta && req[0].meta.errors ? req[0].meta.errors : [];
                loopErrors(errors);
                return reject(req[0]);
              }
            } else {
              // methods.error.call(methods, request, request.statusText);
              return reject(generateErrorResponse(request.statusText));
            }
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
      } else {
        // console.log('Slapform: node');
        var url = require('url');
        var parsedURL = url.parse(payload.endpoint);
        var request = parsedURL.protocol === 'https:' ? require('https') : require('http');

        var options = {
          // hostname: 'api.slapform.com',
          hostname: parsedURL.hostname,
          // hostname: 'api.INCORRECTTEST.com',
          // port: 443,
          path: '/' + payload.form,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            // 'Content-Length': Buffer.byteLength(post_data)
          }
        };
        if (parsedURL.port) {
          options.port = parsedURL.port;
        }

        // console.log('----parsedURL', parsedURL);

        // var globalRes;
        var full = '';
        var req = request.request(options, function(res) {
          // globalRes = res;

          res.on('data', function(chunk) {
            full += chunk;
          });
          res.on('end', function() {
            var resData;
            try {
              resData = JSON.parse(full.toString());
            } catch (e) {
              resData = full.toString();
            }
            if (resData && resData.meta && resData.meta.status === 'success') {
              // methods.success.call(methods, res, resData);
              return resolve(resData);
            } else {
              // methods.error.call(methods, res, resData.meta.errors);
              loopErrors(resData.meta.errors);
              return reject(resData);
            }
            // methods.always.call(methods, globalRes);
          });

        });
        req.on('error', function(e) {
          return reject(generateErrorResponse(e));
          // methods.error.call(methods, {}, e);
          // methods.always.call(methods, globalRes);
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
      }
    });

  }

  function getLocation() {
    try {
      return window.location.href;
    } catch (e) {
      return null;
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

  Slapform.prototype.onSubmission = function (cb) {
    function queryStringParse(queryString) {
      if (queryString) {
        var params = {}, queries, temp, i, l;
        queryString = queryString.replace(/amp;/g, '')
        queries = (queryString.indexOf('?') > -1) ? queryString.split('?')[1].split('&') : [];
        for ( i = 0, l = queries.length; i < l; i++ ) {
          temp = queries[i].split('=');
          params[temp[0]] = (typeof temp[1] !== 'undefined') ? decodeURIComponent(temp[1]).replace(/\+/g, ' ') : '';
        }
        return params;
      } else {
        return {}
      }
    };
    function tryParse(obj) {
      try {
        return JSON.parse(obj);
      } catch (e) {
        return obj;
      }
    }
    var stateCheck = setInterval(() => {
      if (document.readyState === 'complete') {
        clearInterval(stateCheck);
        // document ready
        var qs = queryStringParse(window.location.search);
        var submission = {
          meta: tryParse(qs.meta || '{}'),
          data: tryParse(qs.data || '{}'),
          integrations: tryParse(qs.integrations || '{}'),
          triggers: tryParse(qs.triggers || '{}')
        }

        // Fixes
        submission.meta.errors = submission.meta.errors || [];
        submission.meta.referrer = submission.meta.referrer || 'https://slapform.com';

        if (!submission.meta.status) {
          submission.meta.status = 'fail';
          submission.meta.errors =
          [
            {
              code: '0000',
              type: 'Error',
              msg: 'Unknown error. Please contact the support team of the website that owns this form.'
            }
          ];
          console.error('There is no submission to process.');
        }
        cb(submission);

      }
    }, 100);
  }

  // Register
  if (environment === 'browser') {
    try {
      window.Slapform = Slapform;
    } catch (e) {
    }
  }

  // Just return a value to define the module export.
  // This example returns an object, but the module
  // can return a function as the exported value.
  return Slapform; // Enable if using UMD

}));
