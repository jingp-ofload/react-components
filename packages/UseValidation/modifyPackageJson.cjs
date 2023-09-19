const packageJson = require('./package.json')
const fs = require('fs');

delete packageJson.devDependencies;
delete packageJson.scripts;

let packageString = JSON.stringify(packageJson, undefined, 4);

packageString = packageString.replaceAll('dist/', '');

fs.writeFileSync('dist/package.json', packageString);
