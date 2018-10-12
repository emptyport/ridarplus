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

// https://stackoverflow.com/questions/8584902/get-closest-number-out-of-array
function closestIdx(num, arr) {
  var mid;
  var lo = 0;
  var hi = arr.length - 1;
  while (hi - lo > 1) {
      mid = Math.floor ((lo + hi) / 2);
      if (arr[mid] < num) {
          lo = mid;
      } else {
          hi = mid;
      }
  }
  if (num - arr[lo] <= arr[hi] - num) {
      return lo;
  }
  return hi;
}

function extractSpectrum(spectrum) {
  let intensities, mz;
  let binaryDataArray = spectrum.binaryDataArrayList.binaryDataArray;
  for(let i=0; i<binaryDataArray.length; i++) {
    let rawData = binaryDataArray[i].binary._text;
    let cvParam = binaryDataArray[i].cvParam;
    let bitType = '';
    let isCompressed = false;
    let type = '';
    for(let j=0; j<cvParam.length; j++) {
      let name = cvParam[j]._attributes.name;
      switch(name) {
        case '64-bit float':
          bitType = '64';
          break;
        case '32-bit float':
          bitType = '32';
          break;
        case 'zlib compression':
          isCompressed = true;
          break;
        case 'm/z array':
          type = 'mz';
          break;
        case 'intensity array':
          type = 'intensity'
          break;
        default:
          break;
      }

      if(type==='intensity') {
        intensities = decodeData(rawData, bitType, isCompressed);
      }
      if(type==='mz') {
        mz = decodeData(rawData, bitType, isCompressed);
      }
    }
  }

  return { intensities, mz };
}

function getSignificantSpectra(msTwo, msThree, options) {
  let significantSpectra = [];

  let spectraWithReporters;
  switch(options.msLevel) {
    case 2:
      spectraWithReporters = msTwo;
      break;
    case 3:
      spectraWithReporters = msThree;
      break;
    default:
      return significantSpectra;
  }

  for (let key in spectraWithReporters) {
    if (spectraWithReporters.hasOwnProperty(key)) {
      let currentSpectrum = spectraWithReporters[key];
      let reporterIntensities = {};
      let numMissed = 0;
      for(let i=0; i<options.reporters.length; i++) {
        let reporter = options.reporters[i];
        let reporterIndex = -1;
        let { intensities, mz } = extractSpectrum(currentSpectrum);
        reporterIndex = closestIdx(reporter, mz);
        let repMz = mz[reporterIndex];
        let repInt = intensities[reporterIndex];
        if(Math.abs(repMz - reporter) < options.tolerance) {
          reporterIntensities[reporter] = repInt;
        }
        else {
          reporterIntensities[reporter] = 0;
          numMissed++;
        }
      }


    }
  }




  
console.log('here');

  return significantSpectra;
}

function writeSignificantSpectra(significantSpectra, options) {



  return true;
}

function spectralProcessor(filename, options) {
  let specGen = spectralGenerator(filename);

  let msTwo = {};
  let msThree = {};

  //count_stuff
  let count = 0;
  let result = specGen.next();
  while(!result.done) {
    //count_stuff
    if(count>100) { break; }
    let spectrum = result.value.data.spectrum;
    let msLevel = getMSLevel(spectrum.cvParam);
    switch(msLevel) {
      case 1:
        let significantSpectra = getSignificantSpectra(msTwo, msThree, options);
        let wroteSpectra = writeSignificantSpectra(significantSpectra, options);
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
    //count_stuff
    count++;
    result = specGen.next();
  }
}

module.exports.spectralProcessor = spectralProcessor;