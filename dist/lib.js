'use strict';

var fetch = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(bundle) {
    var iota, address, response, asciiArr;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            iota = composeAPI({
              provider: bundle.provider
            });
            address = bundle.address;
            response = null;
            _context.prev = 3;
            _context.next = 6;
            return iota.findTransactionObjects({ addresses: [address] });

          case 6:
            response = _context.sent;
            _context.next = 12;
            break;

          case 9:
            _context.prev = 9;
            _context.t0 = _context['catch'](3);
            throw _context.t0;

          case 12:
            if (!(response && response !== null && response !== '' && response !== undefined)) {
              _context.next = 19;
              break;
            }

            asciiArr = response.filter(function (res) {
              return res.hash === bundle.hash;
            })[0];

            if (!(!asciiArr || asciiArr === undefined)) {
              _context.next = 16;
              break;
            }

            throw 'Returned an empty object';

          case 16:
            return _context.abrupt('return', trytesToAscii(asciiArr.signatureMessageFragment + '9'));

          case 19:
            return _context.abrupt('return', null);

          case 20:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[3, 9]]);
  }));

  return function fetch(_x) {
    return _ref.apply(this, arguments);
  };
}();

var verify = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(bundle, isBinaryInput, docpath) {
    var calculatedHash, tangleHash, verified;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            calculatedHash = hash(docpath, isBinaryInput);
            tangleHash = null;
            _context2.prev = 2;
            _context2.next = 5;
            return fetch(bundle);

          case 5:
            tangleHash = _context2.sent;

            tangleHash = tangleHash.replace(/\0/g, '');
            //tangleHash.replace(/\0/g, '') removes u0000
            verified = calculatedHash.trim() === tangleHash.trim();
            return _context2.abrupt('return', verified);

          case 11:
            _context2.prev = 11;
            _context2.t0 = _context2['catch'](2);
            throw _context2.t0;

          case 14:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this, [[2, 11]]);
  }));

  return function verify(_x2, _x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var sha1 = require('js-sha1');
var fs = require('fs');

var _require = require('@iota/core'),
    composeAPI = _require.composeAPI;

var _require2 = require('@iota/converter'),
    asciiToTrytes = _require2.asciiToTrytes,
    trytesToAscii = _require2.trytesToAscii;

var axios = require('axios');

function hash(agnosticData, isBinaryInput) {
  var buffer = !isBinaryInput ? fs.readFileSync(agnosticData) : agnosticData;
  var hash = sha1(buffer);
  return hash;
}

function publish(bundle, cb) {
  var iota = composeAPI({
    provider: bundle.provider
  });
  var trytes = asciiToTrytes(bundle.data);

  // Array of transfers which defines transfer recipients and value transferred in IOTAs.
  var transfers = [{
    address: bundle.address,
    value: 0, // 1Ki
    tag: 'BLUEPRINT9', // optional tag of `0-27` trytes
    message: trytes // optional message in trytes
  }];
  iota.prepareTransfers(bundle.seed, transfers).then(function (trytes) {
    return iota.sendTrytes(trytes, bundle.depth, bundle.minWeightMagnitude);
  }).then(function (ret) {
    cb(ret);
  }).catch(function (err) {
    // catch and throw again for user propagation
    throw 'there some error ' + err;
  });
}

module.exports = { hash: hash, publish: publish, fetch: fetch, verify: verify };