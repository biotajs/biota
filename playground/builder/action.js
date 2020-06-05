require('dotenv').config({ path: './../.env' });
const fs = require('fs');
const fauna = require('faunadb');
const q = fauna.query;
function client() {
  return new fauna.Client({ secret: process.env.FAUNA_TEST_KEY });
}

const { action } = require('./../lib/index');

(async () => {
  let res = null;
  const db = client();

  try {
    let exp = action.log.query('insert', q.Ref(q.Collection('todos'), '264592780846694923'));
    // res = exp
    res = await db.query(exp);

    console.log(res);
    fs.writeFileSync('./res.json', JSON.stringify(res, null, 2));
  } catch (error) {
    console.error(error);
    fs.writeFileSync('./errors.json', JSON.stringify(error, null, 2));
  }
})();
