require('dotenv').config({ path: './../.env' });
const fs = require('fs');
const fauna = require('faunadb');
const q = fauna.query;
function client() {
  return new fauna.Client({ secret: process.env.FAUNA_TEST_KEY });
  // return new fauna.Client({ secret: process.env.FAUNA_SANDBOX_CLIENT_KEY });
}

const { factory } = require('./../lib/index');

(async () => {
  let res = null;
  const db = client();

  try {
    // let exp = factory.validate.validate.callResponse(1, { validate: { type: 'number',  } }, {});
    let exp = factory.validate.validate.callResponse(
      null,
      { validate: { type: 'string', default: 'super', min: 6, max: 2 } },
      { full: false },
    );
    // let exp = factory.string.validate.callResponse(null, { type: 'string', default: "super"  }, {});
    // let exp = factory.validate.validate.callResponse("dezçduzeàfçu", { validate: 'string|min:2|max:3' }, {});
    res = await db.query(exp);

    console.log(res);
    fs.writeFileSync('./res.json', JSON.stringify(res, null, 2));
  } catch (error) {
    console.error(error);
    fs.writeFileSync('./errors.json', JSON.stringify(error, null, 2));
  }
})();
