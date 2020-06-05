require('dotenv').config({ path: '../../.env' });
const fs = require('fs');

const { deploy } = require('@biota/builder');

(async () => {
  try {
    res = await deploy(process.env.FAUNA_BUILDER_TEST_KEY);

    fs.writeFileSync('./res.json', JSON.stringify(res, null, 2));
  } catch (error) {
    console.error(error);
    fs.writeFileSync('./errors.json', JSON.stringify(error, null, 2));
  }
})();
