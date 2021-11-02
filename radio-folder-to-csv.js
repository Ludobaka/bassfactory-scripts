const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const parseArgs = require('minimist');

function trackInfoFromFileName(filename) {
  /** Remove spaces from string and file extension before splitting to attributes
   * /!\ Does not work for some strings having attributes with '-' inside
   * Like P-Riot - Meditation - DND 2.0 & Grave Records - District 03 FTW
   * TO BE FIXED ???
   */
  const attributes = filename.replace(/\s/g, "").replace(/\.[^/.]+$/, "").split('-');
  const [artist, trackname, label, album, ...rest] = attributes;

  if (rest.length !== 0) {
    console.warn(`Missed track attributes ${rest} for file ${filename}`);
  }

  return {
    artist,
    trackname,
    label,
    album
  }
}

function musicCollectionModelFromFolder(musicFolder) {
  const directory = fs.readdirSync(musicFolder);
  const trackInfos = [];

  for (const file of directory) {
    const trackInfo = trackInfoFromFileName(file);
    trackInfos.push(trackInfo);
  }

  return trackInfos;
}

function writeTracksInfoToCSV(tracksInfo, outputFileName) {
  const csvWriter = createCsvWriter({
    path: outputFileName,
    header: [
      { id: 'artist', title: 'Artist' },
      { id: 'trackname', title: 'Track Name' },
      { id: 'label', title: 'Label' },
      { id: 'album', title: 'Album' },
      { id: 'picked', title: 'Picked' },
    ]
  });

  csvWriter.writeRecords(tracksInfo).then(() => console.log(`CSV written in ${outputFileName}`));
}

function addPickedAttrToTracksInfos(trackInfos, trackPicks) {
  return trackInfos.map(val => {
    const isPicked = trackPicks.some(elem =>
      elem.artist === val.artist && elem.trackname === val.trackname);

    const newVal = Object.assign({}, val);

    if (isPicked) {
      newVal.picked = 'X';
    } else {
      newVal.picked = '';
    }

    return newVal;
  });
}

if (require.main === module) {
  const argv = parseArgs(process.argv.slice(2));

  console.log('Convert some BF Radio Folder(s) to a CSV file');
  console.log('Can also use a picks folder option to get a nice CSV output');
  console.log('Usage : node ./radio-folder-to-csv.js --output=<outputFile> --picks=pickFolder folder1 folder2 ...');

  const libraryFolders = argv._;
  const picksFolder = argv.picks;
  const outputFile = argv.output;

  const trackInfos = [];
  for (const folder of libraryFolders) {
    trackInfos.push(...musicCollectionModelFromFolder(folder));
  }

  const trackPicks = musicCollectionModelFromFolder(picksFolder);

  const trackInfosWithPicked  = addPickedAttrToTracksInfos(trackInfos, trackPicks);

  writeTracksInfoToCSV(trackInfosWithPicked, outputFile);
}