require('dotenv').config({ path: './../.env' });
const { deploy } = require('../lib');

(async () => {
  await deploy(process.env.FAUNA_SANDBOX_ADMIN_KEY);
})();
