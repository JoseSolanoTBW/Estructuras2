const _ = require('lodash');

function BrandCar(_node) {
  _.extend(this, _node);
}

module.exports = BrandCar;