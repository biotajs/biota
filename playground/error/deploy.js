require('dotenv').config({ path: '../../.env' });
const fs = require('fs');

const { deploy } = require('@biota/error');

(async () => {
  try {
    res = await deploy(process.env.FAUNA_ERROR_TEST_KEY);

    fs.writeFileSync('./res.json', JSON.stringify(res, null, 2));
  } catch (error) {
    console.error(error);
    fs.writeFileSync('./errors.json', JSON.stringify(error, null, 2));
  }
})();
