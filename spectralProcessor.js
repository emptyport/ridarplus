let { spectralGenerator } = require('./mzmlGenerator.js');

function spectralProcessor(filename, options) {
  let specGen = spectralGenerator(filename);

  let msTwo = {};
  let msThree = {};

  let result = specGen.next();
  console.log(result.value.data);
  process.exit();
  while(!result.done) {
    let spectrum = result.value.data;
    console.log(spectrum);


    result = specGen.next();
  }
}

module.exports.spectralProcessor = spectralProcessor;