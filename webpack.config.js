const path = require('path');

module.exports = {
  entry: path.join(__dirname, 'src', 'dotabuffStrat.js'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
