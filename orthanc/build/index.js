/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./events/message.ts":
/*!***************************!*\
  !*** ./events/message.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "onMessage": () => (/* binding */ onMessage)
/* harmony export */ });
/* harmony import */ var _palantir_protocol__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./palantir-protocol */ "./events/palantir-protocol.ts");

const onMessage = (palantirWebSocket, rawMessage, isBinary) => {
  if (isBinary) {
    throw new Error('[onMessage] Binary messages not supported.');
  }

  let message = parseMessage(rawMessage);
  console.log({
    message
  });
  palantirWebSocket.socket.send(deliveryMessage(message.id));

  switch (message.type) {
    case _palantir_protocol__WEBPACK_IMPORTED_MODULE_0__.PQLClientMessageTypes.ConnectionInit:
      console.log('[ConnectionInit] should add user');
      let user = JSON.parse(message.data);
      palantirWebSocket.users.addUser(user);
      palantirWebSocket.socketToUserIdMap.set(palantirWebSocket.socket, user.id);
      break;
    // case PQLClientMessageTypes.Disconnected:
    //   console.log('[Disconnected] should remove user')
    //   let { userId }: { userId: string } = JSON.parse(message.data)
    //   if (!userId) return
    //   palantirWebSocket.users.removeUser(userId)
  }
};

function deliveryMessage(messageId) {
  let message = {
    id: messageId,
    type: _palantir_protocol__WEBPACK_IMPORTED_MODULE_0__.PQLServerMessageTypes.Delivery
  };
  return JSON.stringify(message);
}

function parseMessage(message) {
  try {
    let buffer = Buffer.from(message);
    let messageString = buffer.toString('utf-8');
    let messageObject = JSON.parse(messageString);

    if (!messageValidation(messageObject)) {
      throw new Error('Message received but is not validated');
    }

    return messageObject;
  } catch (error) {
    throw new Error('Faild to parse message');
  }
}

function messageValidation(message) {
  if (typeof message !== 'object') {
    return false;
  }

  if ('id' in message && 'type' in message && 'data' in message) {
    return true;
  }

  return false;
}

/***/ }),

/***/ "./events/palantir-protocol.ts":
/*!*************************************!*\
  !*** ./events/palantir-protocol.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PQLClientMessageTypes": () => (/* binding */ PQLClientMessageTypes),
/* harmony export */   "PQLServerMessageTypes": () => (/* binding */ PQLServerMessageTypes)
/* harmony export */ });
let PQLClientMessageTypes;

(function (PQLClientMessageTypes) {
  PQLClientMessageTypes[PQLClientMessageTypes["ConnectionInit"] = 0] = "ConnectionInit";
  PQLClientMessageTypes[PQLClientMessageTypes["Disconnected"] = 1] = "Disconnected";
})(PQLClientMessageTypes || (PQLClientMessageTypes = {}));

let PQLServerMessageTypes;

(function (PQLServerMessageTypes) {
  PQLServerMessageTypes[PQLServerMessageTypes["Delivery"] = 0] = "Delivery";
})(PQLServerMessageTypes || (PQLServerMessageTypes = {}));

/***/ }),

/***/ "./model/Users.ts":
/*!************************!*\
  !*** ./model/Users.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Users": () => (/* binding */ Users)
/* harmony export */ });
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Users {
  constructor() {
    _defineProperty(this, "users", void 0);

    _defineProperty(this, "addUser", user => {
      // check if user already exists in model
      if (this.users[user.id]) {
        console.warn('[Model] [Users] [addUser] user already exists');
        return;
      } // add user


      this.users[user.id] = user;
    });

    _defineProperty(this, "removeUser", userId => {
      let filteredUsers = {};

      for (let key in this.users) {
        if (key !== userId) {
          filteredUsers[key] = this.users[key];
        }
      }

      this.users = filteredUsers;
    });

    _defineProperty(this, "getUsers", () => {
      return this.users;
    });

    this.users = {};
  }

}

/***/ }),

/***/ "uWebSockets.js":
/*!*********************************!*\
  !*** external "uWebSockets.js" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("uWebSockets.js");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!******************!*\
  !*** ./index.ts ***!
  \******************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var uWebSockets_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! uWebSockets.js */ "uWebSockets.js");
/* harmony import */ var uWebSockets_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(uWebSockets_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _events_message__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./events/message */ "./events/message.ts");
/* harmony import */ var _model_Users__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./model/Users */ "./model/Users.ts");
/* Minimal SSL/non-SSL example */



const port = 3001;
const app = uWebSockets_js__WEBPACK_IMPORTED_MODULE_0___default().App();
const users = new _model_Users__WEBPACK_IMPORTED_MODULE_2__.Users();
const socketToUserIdMap = new Map();
app.ws('/*', {
  open: ws => {
    console.log('open called');
    console.log('users', users.getUsers());
  },
  message: (ws, message, isBinary) => {
    let palantirWebSocket = {
      socket: ws,
      users,
      socketToUserIdMap
    };
    (0,_events_message__WEBPACK_IMPORTED_MODULE_1__.onMessage)(palantirWebSocket, message, isBinary);
  },
  drain: ws => {
    console.log('WebSocket backpressure: ' + ws.getBufferedAmount());
  },
  close: (ws, code, message) => {
    let palantirWebSocket = {
      socket: ws,
      users,
      socketToUserIdMap
    };
    console.log({
      ws,
      userId: socketToUserIdMap.get(ws)
    });
    console.log('WebSocket closed');
  }
});
app.any('/palantir', res => {
  res.end('Time? What time do you think we have?');
});
app.listen(port, token => {
  if (token) {
    console.log(`Isengard is listening on ${port}`);
  } else {
    console.log('So you have chosen… death.');
  }
});
})();

/******/ })()
;