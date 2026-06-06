var fs = require('fs');
var k = fs.readFileSync(process.env.USERPROFILE + '/.ssh/vocos_deploy', 'utf8');
console.log('Key length:', k.length, 'chars');
console.log('Type:', k.split('\n')[0]);
