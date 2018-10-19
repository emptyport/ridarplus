let { spectralProcessor } = require('./spectralProcessor');

let filename;
//filename = 'small_64bit.mzML';
//filename = 'tmt_small.mzML';
filename = '..\\R.I.D.A.R-master\\TCGA_AO-A12D_AN-A04A_BH-A0AV_117C_W_BI_20130416_H-PM_f01.mzML';

let options = {
  reporters: [
    114.11060,
    115.10770,
    116.11100,
    117.11440
  ],
  controls: [
    117.11440
  ],
  tolerance: 0.002,
  msLevel: 2,
  foldChange: 2,
  outputPath: './'
};

let specProc = spectralProcessor(filename, options);

