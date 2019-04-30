'use strict';

var publish = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(bundle, cb) {
    var iota, trytes, transfers, prepTrytes, ret;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            iota = composeAPI({
              provider: bundle.provider
            });
            trytes = asciiToTrytes(bundle.data);
            // Array of transfers which defines transfer recipients and value transferred in IOTAs.

            transfers = [{
              address: bundle.address,
              value: 0, // 1Ki
              tag: bundle.tag ? bundle.tag.toUpperCase() : '', // optional tag of `0-27` trytes
              message: trytes // optional message in trytes
            }];
            prepTrytes = null;
            ret = null;
            _context.prev = 5;
            _context.next = 8;
            return iota.prepareTransfers(bundle.seed, transfers);

          case 8:
            prepTrytes = _context.sent;
            _context.next = 11;
            return iota.sendTrytes(prepTrytes, bundle.depth, bundle.minWeightMagnitude);

          case 11:
            ret = _context.sent;
            return _context.abrupt('return', ret);

          case 15:
            _context.prev = 15;
            _context.t0 = _context['catch'](5);
            throw 'Could not establish a connection to the node ' + _context.t0;

          case 18:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[5, 15]]);
  }));

  return function publish(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var fetch = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(bundle) {
    var iota, address, response, asciiArr;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            iota = composeAPI({
              provider: bundle.provider
            });
            address = bundle.address;
            response = null;
            _context2.prev = 3;
            _context2.next = 6;
            return iota.findTransactionObjects({ addresses: [address] });

          case 6:
            response = _context2.sent;
            _context2.next = 12;
            break;

          case 9:
            _context2.prev = 9;
            _context2.t0 = _context2['catch'](3);
            throw _context2.t0;

          case 12:
            if (!(response && response !== null && response !== '' && response !== undefined)) {
              _context2.next = 19;
              break;
            }

            asciiArr = response.filter(function (res) {
              return res.hash === bundle.hash;
            })[0];

            if (!(!asciiArr || asciiArr === undefined)) {
              _context2.next = 16;
              break;
            }

            throw 'Returned an empty object';

          case 16:
            return _context2.abrupt('return', trytesToAscii(asciiArr.signatureMessageFragment + '9'));

          case 19:
            return _context2.abrupt('return', null);

          case 20:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this, [[3, 9]]);
  }));

  return function fetch(_x3) {
    return _ref2.apply(this, arguments);
  };
}();

var verify = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(bundle, isBinaryInput, docpath) {
    var calculatedHash, tangleHash;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            calculatedHash = hash(docpath, isBinaryInput);
            _context3.next = 3;
            return fetch(bundle);

          case 3:
            tangleHash = _context3.sent;

            tangleHash = tangleHash.replace(/\0/g, '');
            //tangleHash.replace(/\0/g, '') removes u0000
            return _context3.abrupt('return', calculatedHash.trim() === tangleHash.trim());

          case 6:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function verify(_x4, _x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var sha256 = require('js-sha256');

var fs = require('fs');

var _require = require('@iota/core'),
    composeAPI = _require.composeAPI;

var _require2 = require('@iota/converter'),
    asciiToTrytes = _require2.asciiToTrytes,
    trytesToAscii = _require2.trytesToAscii;

function hash(agnosticData, isBinaryInput) {
  var buffer = !isBinaryInput ? fs.readFileSync(agnosticData) : agnosticData;
  var hash = sha256(buffer);
  return hash;
}

module.exports = { hash: hash, publish: publish, fetch: fetch, verify: verify };