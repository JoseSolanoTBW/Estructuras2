const _ = require('lodash');

function DetailCarBrand(fields) {
    console.log(fields);
  _.extend(this, {
    title: fields[0],
    img: fields[1],
    cars: fields[2].map(function (c) {
      return {
        name: c.name,
        img: c.image       
      }
    }),
    agents: fields[3].map(function (c) {
        return {
          name: c.name,
          email: c.email,
          phone: c.phone       
        }
      }),
    types: fields[4].map(function (c) {
        return {
          title: c.name,
          doors: c.doors     
        }
      }),
    agencies: fields[5].map(function (c) {
        return {
          title: c.name       
        }
      }),
      type : fields[6]
  });
}

module.exports = DetailCarBrand;
