let fs = require('fs');
let xmlConvert = require('xml-js');
let readChunk = require('read-chunk');
 


function getChunk(filename, pos, chunkSize) {
  let chunk = readChunk.sync(filename, pos, chunkSize).toString();
  return chunk;
}

function findSpectra(chunk) {
  let spectra = [];
  let lastInstance = 0;
  let startIndex = chunk.indexOf('<spectrum ', lastInstance);
  let endIndex = chunk.indexOf('</spectrum>', lastInstance+11)+11;

  while(startIndex !== -1 && endIndex !== -1 && endIndex>startIndex) {
    let rawSpectrum = chunk.substring(startIndex, endIndex);
    let parsedSpectrum = xmlConvert.xml2json(rawSpectrum, {compact: true, spaces: 2});
    spectra.push(parsedSpectrum);
    lastInstance = endIndex;
    startIndex = chunk.indexOf('<spectrum ', lastInstance);
    endIndex = chunk.indexOf('</spectrum>', lastInstance+11)+11;
  }

  return { spectra: spectra, lastInstance: lastInstance };

}

function* spectrumIterator(filename, chunkSize=1024*1024) {
  let pos = 0;
  let fileSize = getFilesizeInBytes(filename);
  let readMeta = true;
  let readChromatogram = true;
  let readIndex = true;
  let chunk = "";

  while(pos<fileSize) {
    chunk += getChunk(filename, pos, chunkSize);
    pos += chunkSize;

    if(readMeta) {
      let metaStartIndex = chunk.indexOf('<cvList');
      let metaEndIndex = chunk.indexOf('</dataProcessingList>')+21;
      while(metaStartIndex===-1 || metaEndIndex===-1 || metaEndIndex<metaStartIndex) {
        chunk += getChunk(filename, pos, chunkSize);
        pos += chunkSize;
        metaStartIndex = chunk.indexOf('<cvList ');
        metaEndIndex = chunk.indexOf('</dataProcessingList>')+21;
      }
      let rawMetaInfo = chunk.substring(metaStartIndex, metaEndIndex);
      let parsedMetaInfo = xmlConvert.xml2json(rawMetaInfo, {compact: true, spaces: 2});
      readMeta = false;
      chunk = chunk.substring(metaEndIndex, chunk.length);
      yield {data: parsedMetaInfo, type: 'meta', progress: pos/fileSize};
    }



    let startIndex = chunk.indexOf('<spectrum ');
    console.log(startIndex + pos - chunkSize);
    let endIndex = chunk.indexOf('</spectrum>')+11;
    while(startIndex===-1 || endIndex===-1 || endIndex<startIndex) {
      chunk += getChunk(filename, pos, chunkSize);
      pos += chunkSize;
      startIndex = chunk.indexOf('<spectrum ');
      endIndex = chunk.indexOf('</spectrum>')+11;
    }

    let { spectra, lastInstance } = findSpectra(chunk);
    for(let i=0; i<spectra.length; i++) {
      yield { data: spectra[i], type: 'spectrum', progress: pos/fileSize };
    }
    chunk = chunk.substring(lastInstance, chunk.length);

    if(readChromatogram) {
      let metaStartIndex = chunk.indexOf('<chromatogram ');
      let metaEndIndex = chunk.indexOf('</chromatogram>')+15;
      while(metaStartIndex===-1 || metaEndIndex===-1 || metaEndIndex<metaStartIndex) {
        chunk += getChunk(filename, pos, chunkSize);
        pos += chunkSize;
        metaStartIndex = chunk.indexOf('<chromatogram ');
        metaEndIndex = chunk.indexOf('</chromatogram>')+15;
      }
      let rawMetaInfo = chunk.substring(metaStartIndex, metaEndIndex);
      let parsedMetaInfo = xmlConvert.xml2json(rawMetaInfo, {compact: true, spaces: 2});
      readMeta = false;
      chunk = chunk.substring(metaEndIndex, chunk.length);
      yield {data: parsedMetaInfo, type: 'chromatogram', progress: pos/fileSize};
    }

    if(readIndex) {
      let metaStartIndex = chunk.indexOf('<index ');
      let metaEndIndex = chunk.indexOf('</index>')+8;
      while(metaStartIndex===-1 || metaEndIndex===-1 || metaEndIndex<metaStartIndex) {
        chunk += getChunk(filename, pos, chunkSize);
        pos += chunkSize;
        metaStartIndex = chunk.indexOf('<index ');
        metaEndIndex = chunk.indexOf('</index>')+8;
      }
      let rawMetaInfo = chunk.substring(metaStartIndex, metaEndIndex);
      let parsedMetaInfo = xmlConvert.xml2json(rawMetaInfo, {compact: true, spaces: 2});
      readMeta = false;
      chunk = chunk.substring(metaEndIndex, chunk.length);
      yield {data: parsedMetaInfo, type: 'index', progress: pos/fileSize};
    }

  }
  return pos;  
}
/*
let wstream = fs.createWriteStream('output.mzML');
let generator = spectrumIterator('small_64bit.mzML');

let result = generator.next();

let count = 1;
while(!result.done) {
  console.log(count);
  count++;
  //console.log(result.value.data);
  console.log(result.value.progress);
  console.log(result.value.type);
  result = generator.next();
}
console.log(result);
*/
let filename = 'small_64bit.mzML';
filename = 'tmt_small.mzML'

let { spectralGenerator } = require('./mzmlGenerator.js');
let specGen = spectralGenerator(filename);

let result = specGen.next();
while(!result.done) {
  console.log(result.value.progress);
  result = specGen.next();
}



/*
async function main () {
  const fileLoc = 'small_64bit.mzML';
  console.log(fileLoc);
  const readStream = fs.createReadStream(fileLoc);
  const data = await streamToGenerator(readStream, readHandler)
  console.log(data);
}
 
function * readHandler (read, finish) {
 
  let done, chunk
  while (true) {
    ;[done, chunk] = yield read()
    if (done) break
    let result = xmlConvert.xml2json(chunk.toString());
    console.log(result);
    }  
 
  return yield finish(true);
}

main();
*/