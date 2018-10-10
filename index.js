let { spectralGenerator } = require('./mzmlGenerator.js');

let filename = 'small_64bit.mzML';
filename = 'tmt_small.mzML'

let specGen = spectralGenerator(filename);

let result = specGen.next();
while(!result.done) {
  console.log(result.value.progress);
  result = specGen.next();
}
