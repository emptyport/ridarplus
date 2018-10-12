let { spectralProcessor } = require('./spectralProcessor');

let filename;
//filename = 'small_64bit.mzML';
//filename = 'tmt_small.mzML';
filename = 'tmt.mzML';

let options = {
  reporters: [
    126.127726,
    127.124761,
    127.131081,
    128.128116,
    128.134436,
    129.131471,
    129.137790,
    130.134825,
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

