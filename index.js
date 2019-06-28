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

  if ((typeof window !== 'undefined') && (window.XMLHttpRequest || XMLHttpRequest || ActiveXObject)) {
    environment = 'browser';
  }
  if (environment == 'browser') {
    registerName();
  }

  function registerName() {
    try {
      window.Slapform = Slapform;
    } catch (e) {
    }
  }

  function Slapform(account, options) {
    this.account = account || '';
    this.options = options || {};
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

      request.open('POST', 'https://api.slapform.com', true);
      request.setRequestHeader('Content-type', contentType);
      request.setRequestHeader('Accept', accept);
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

      if ((contentType.indexOf('json') > -1)) {
        try {
          payload.data = JSON.stringify(payload.data);
        } catch (e) {
          console.error('AJAX could not stringify data.')
        }
      }

      request.send(payload.data);
      return atomXHR;
    } else {
      // console.log('Slapform: node');
      var https = require('https');
      var options = {
        hostname: 'api.slapform.com',
        // hostname: 'api.INCORRECTTEST.com',
        // port: 443,
        path: '/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // 'Content-Length': Buffer.byteLength(post_data)
        }
      };

      var globalRes;
      var req = https.request(options, function(res) {
        globalRes = res;
        // console.log('statusCode:', res.statusCode);
        // console.log('headers:', res.headers);
        res.on('data', function(d) {
          var resData = JSON.parse(d.toString());
          if (resData && resData.meta && resData.meta.status == 'success') {
            methods.success.call(methods, res, JSON.parse(d.toString()));
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
      req.end();
      return atomXHR;
    }

  }

  return Slapform; // Enable if using UMD
  // module.exports = Slapform; // Enable if using regular module.exports
}));
