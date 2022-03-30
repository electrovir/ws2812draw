import bindings from 'bindings';

const addon = bindings('addon');

export {}

console.log(addon.hello());
console.log(addon.timestamp());
// Prints: 'world'