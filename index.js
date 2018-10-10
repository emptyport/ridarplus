let { spectralProcessor } = require('./spectralProcessor');

let filename = 'small_64bit.mzML';
filename = 'tmt_small.mzML'

let options = {
  reporters: [
    126.127726,
    127.124761,
    128.134436,
    129.131471,
    130.141145
  ],
  controls: [
    126.127726
  ],
  tolerance: 0.002,
  msLevel: 3,
  foldChange: 5,
  outputPath: './'
};

let specProc = spectralProcessor(filename, options);

