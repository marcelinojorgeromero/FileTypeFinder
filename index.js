const fs = require('fs');
const path = require('path');

const readChunk = require('read-chunk');
const fileType = require('file-type');

const Glob = require('glob').Glob;
const inquirer = require('inquirer');

const colors = require('./console-colors');

const questions = [
    {
        type: 'input',
        name: 'path',
        message: 'Path to search:',
        validate: value => {
            return fs.existsSync(value) ? true : 'Folder does not exist, please try again...';
        }
    },
    {
        type: 'input',
        name: 'filesShown',
        message: 'Number of files to show: (0 for all)',
        default: 0,
        validate: value => {
            var valid = !isNaN(parseInt(value)) && value > -1;
            return valid || 'Please enter a number';
        },
        filter: Number
    }
];

function main() {
    inquirer.prompt(questions).then(answers => {
        //console.log(JSON.stringify(answers, null, '  '));
        
        searchFiles(answers.path, answers.filesShown);
    });
}

function searchFiles(path, limit) {

    let mg = new Glob(path + '/**/*.*', { nodir: true }, (err, res) => {
        if (err) {
            console.log('Error', err);
            return;
        }

        //console.log(res);
        /*if (limit > 0){
            res = res.slice(0, limit);
        }

        res.forEach((value, index) => {
            let mimeFileTypeObj = findMimeFileType(value);
            if (mimeFileTypeObj == null) {
                console.log(`${index}) ${colors.bg.White}${colors.fg.Red}${value} file type couldn't be found!`, colors.Reset);
                return;
            }
            let mimeType = mimeFileTypeObj.hasOwnProperty('mime') ? mimeFileTypeObj['mime'] : '';

            if (mimeType === '') console.log(`${colors.bg.White}${colors.fg.Red}Mime not found for ${value}!`, colors.Reset);

            console.log(`${index + 1}) ${colors.fg.Magenta}${value}${colors.fg.White}: ${colors.fg.Blue}${JSON.stringify(mimeFileTypeObj)}${colors.fg.White}, Is video?: ${mimeType.startsWith('video') ? 'Yes' : 'No'}`, colors.Reset);
        });*/
    });

    let counter = 0;
    mg.on('match', filename => {
        ++counter;
        if (limit > 0 && counter == limit) {
            mg.abort();
        }

        let mimeFileTypeObj = findMimeFileType(filename);
        if (mimeFileTypeObj == null) {
            console.log(`${counter}) ${colors.bg.White}${colors.fg.Red}${filename} mime file info couldn't be found but the extension is "${findFileExtension(filename)}".`, colors.Reset);
            return;
        }
        let mimeType = mimeFileTypeObj.hasOwnProperty('mime') ? mimeFileTypeObj['mime'] : '';

        if (mimeType === '') console.log(`${colors.bg.White}${colors.fg.Red}Mime not found for ${filename}!`, colors.Reset);

        console.log(`${counter}) ${colors.fg.Magenta}${filename}${colors.fg.White}: ${colors.fg.Blue}${JSON.stringify(mimeFileTypeObj)}${colors.fg.White}, Is video?: ${mimeType.startsWith('video') ? colors.fg.Green + 'Yes' : colors.fg.Red + 'No'}`, colors.Reset);
    });
}

function findMimeFileType(fileName){
    let buffer = readChunk.sync(fileName, 0, 4100);
    return fileType(buffer);
}

function findFileExtension(fileName){
    return path.extname(fileName);
}

main();
