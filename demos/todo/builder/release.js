const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const currentPath = process.cwd();
const projectName = 'invoice-fe';
const moment = require('moment');

console.log(moment().format());

fs.copySync(path.join(currentPath, './dist'), path.join(currentPath, '../projects-release/invoice-fe'));
execSync('cd '+ path.join(currentPath, '../projects-release') +' && git add . && git commit -m "release '+ projectName + ' ' + moment().format() +'" && git pull origin master && git push origin master', {
    // cwd: path.join(currentPath, '../project-release')
})

//cp ../dist/* ../../project-release/invoice-fe

//cd ../../project-release/invoice-fe


//git pull origin master
//git push origin master
