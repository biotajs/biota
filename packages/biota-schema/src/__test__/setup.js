const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './../../../../.env') });
const { deploy } = require('@biota/schema');

module.exports = function setup() {
  return deploy(process.env.FAUNA_SCHEMA_TEST_KEY);
};
