import bindings from 'bindings';

const addon = bindings('addon');

export {}

console.log(addon.hello());
console.log(addon.test());
// Prints: 'world'