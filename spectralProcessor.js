let { spectralGenerator } = require('./mzmlGenerator.js');
var base64 = require('base64-js');
var pako = require('pako');

function  decodeData(raw, bitType, isCompressed) {
  let buffer = base64.toByteArray(raw);
  if (isCompressed) {
    buffer = pako.inflate(buffer);
  }

  if (bitType === '32') {
    return new Float32Array(buffer.buffer);
  }
  else if (bitType === '64') {
    return new Float64Array(buffer.buffer);
  }
  else {
    return [];
  }
}

function getMSLevel(cvParam) {
  for(let i=0; i<cvParam.length; i++) {
    let item = cvParam[i];
    if(item._attributes.name === 'ms level') {
      let msLevel = parseInt(item._attributes.value);
      return msLevel;
    }
  }
  return -1;
}

function spectralProcessor(filename, options) {
  let specGen = spectralGenerator(filename);

  let msTwo = {};
  let msThree = {};

  let count = 0;
  let result = specGen.next();
  while(!result.done) {
    if(count>0) { break; }
    let spectrum = result.value.data.spectrum;
    let msLevel = getMSLevel(spectrum.cvParam);
    switch(msLevel) {
      case 1:
        msTwo = {};
        msThree = {};
        break;
      case 2:
        msTwo[spectrum._attributes.id] = spectrum;
        break;
      case 3:
        msThree[spectrum._attributes.id] = spectrum;
        break;
      default:
        break;
    }

    count++;
    result = specGen.next();
  }
}

module.exports.spectralProcessor = spectralProcessor;