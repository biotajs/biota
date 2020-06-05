const { Builder, factory } = require('./../lib/index');


const build = new Builder({ lib: '@biota/builder', version: "0.0.1", path: 'action' });

console.log(build.methodName("Strings", null));
console.log(factory.action.log.udfName());
