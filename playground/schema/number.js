require('dotenv').config({ path: './../.env' });
const fs = require('fs');
const fauna = require('faunadb');
const q = fauna.query;
function client() {
  return new fauna.Client({ secret: process.env.FAUNA_TEST_KEY });
}

const { factory, scaffolds } = require('./../lib/index');

(async () => {
  let res = null;
  const db = client();

  try {
    // let exp = factory.number.validate.query([1, 2], { nbItems: 2 }, {});
    let exp = factory.number.validate.query(
      null,
      {
        min: 0,
        max: 2,
        default: 0,
      },
      {},
    );
    res = await db.query(exp);

    console.log(res);
    fs.writeFileSync('./res.json', JSON.stringify(res, null, 2));
  } catch (error) {
    console.error(error);
    fs.writeFileSync('./errors.json', JSON.stringify(error, null, 2));
  }
})();
