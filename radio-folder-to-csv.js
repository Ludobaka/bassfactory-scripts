const fs = require('fs');

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

if (require.main === module) {
  const argv = parseArgs(process.argv.slice(2));

  console.log('Convert some BF Radio Folder(s) to a CSV file');
  console.log('Usage : node ./radio-folder-to-csv.js folder1 folder2 ...');

  const folders = argv._;

  const trackInfos = [];
  for (const folder of folders) {
    trackInfos.push(...musicCollectionModelFromFolder(folder));
  }
}