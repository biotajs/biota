const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './../../../../.env') });
const { deploy } = require('@biota/core');

module.exports = function setup() {
  // return deploy(process.env.FAUNA_CORE_TEST_KEY);
};
