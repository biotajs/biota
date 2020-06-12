require('dotenv').config({ path: './../../.env' });
const fs = require('fs');
const fauna = require('faunadb');
const q = fauna.query;
function client() {
  // return new fauna.Client({ secret: process.env.FAUNA_TEST_KEY });
  return new fauna.Client({ secret: process.env.FAUNA_SCHEMA_TEST_KEY });
}

const { factory } = require('@biota/schema');

(async () => {
  let res = null;
  const db = client();

  try {
    let exp = factory.validate.Validate.callResponse(q.Role('employees'), { type: 'role' }, { full: false });
    // let exp = q.Exists(q.Role('employees'))
    res = await db.query(exp);

    console.log(res);
    fs.writeFileSync('./res.json', JSON.stringify(res, null, 2));
  } catch (error) {
    console.error(error);
    fs.writeFileSync('./errors.json', JSON.stringify(error, null, 2));
  }
})();
