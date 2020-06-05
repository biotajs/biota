require('dotenv').config({ path: './../.env' });
const fs = require('fs');
const fauna = require('faunadb');
const q = fauna.query;
function client() {
  return new fauna.Client({ secret: process.env.FAUNA_TEST_KEY });
  // return new fauna.Client({ secret: process.env.FAUNA_SANDBOX_CLIENT_KEY });
}

const { factory, scaffolds } = require('./../lib/index');

(async () => {
  let res = null;
  const db = client();

  try {
    // let exp = factory.object.validate.query({ ok: 'true' }, { allowAdditionals: false, properties: { other: {} } }, {});
    // let exp = factory.object.validate.query(
    //   { ok: true },
    //   {
    //     allowAdditionals: false,
    //     properties: {
    //       ok: {
    //         type: 'string',
    //         convert: true
    //       },
    //     },
    //   },
    //   {},
    // );
    // let exp = factory.object.validate.query(
    //   { ok: { sub: 'true' } },
    //   {
    //     allowAdditionals: false,
    //     properties: {
    //       ok: {
    //         type: 'object',
    //         properties: {
    //           sub: {
    //             convert: true,
    //             type: 'boolean',
    //           },
    //         },
    //       },
    //     },
    //   },
    //   {},
    // );
    // let exp = factory.object.validate.call(
    //   { ok: 'Main avenue, 1st' },
    //   {
    //     // allowAdditionals: false,
    //     properties: {
    //       ok: {
    //         type: 'string',
    //       },
    //     },
    //   }
    // );
    // let exp = q.Call(
    //   "biota.schema@0.0.1+Validate",
    //   {},
    //   {
    //     value: {
    //       zip: 99400,
    //       city: 'Enontekio',
    //       country: 'Finland',
    //     },
    //     options: {
    //       type: 'object',
    //       properties: {
    //         zip: 'number',
    //         city: 'string',
    //         country: {
    //           type: 'string',
    //           enum: ['France', 'Norway', 'Finland', 'Italy', 'Germany'],
    //         },
    //       },
    //       description: 'Try changing the schema!',
    //     }
    //   }
    // )

    // let exp = factory.validate.validate.call(
    //   {
    //     zip: 99400,
    //     city: 'Enontekio',
    //     country: 'Finland',
    //   },
    //   {
    //     validate: {
    //       type: 'object',
    //       properties: {
    //         zip: 'number',
    //         city: 'string',
    //         country: {
    //           type: 'string',
    //           enum: ['France', 'Norway', 'Finland', 'Italy', 'Germany'],
    //         },
    //       },
    //       description: 'Try changing the schema!',
    //     },
    //   },
    // );

    let exp = factory.object.validate.call(
      {
        zip: 99400,
        city: 'Enontekio',
        country: 'Finland',
      },
      {
        properties: {
          zip: 'number',
          city: 'string',
          country: {
            type: 'string',
            enum: ['France', 'Norway', 'Finland', 'Italy', 'Germany'],
          },
        },
        description: 'Try changing the schema!',
      },
    );

    fs.writeFileSync('./query.json', JSON.stringify(exp, null, 2));
    res = await db.query(exp);

    console.log(res);
    fs.writeFileSync('./res.json', JSON.stringify(res, null, 2));
  } catch (error) {
    console.error(error);
    fs.writeFileSync('./errors.json', JSON.stringify(error, null, 2));
  }
})();
