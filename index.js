// import native addon
const addonGreet = require('bindings')('greet');

console.log(addonGreet.greetHello('dude'));

// expose module API
exports.hello = addonGreet.greetHello;