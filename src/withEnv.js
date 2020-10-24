const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

[ '.env.local', '.env.development', '.env']
    .forEach((name, index) => {
      if(fs.existsSync(path.resolve(process.cwd(), name))) {
        console.log('Load: ' +name)
        dotenv.config({ path: name })
      }
    });
