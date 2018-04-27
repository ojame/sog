var fs = require('fs');

module.exports = async (dir, handler) =>
  new Promise((resolve, reject) => {
    fs.readdir(dir, async function(error, list) {
      if (error) {
        return done(error);
      }

      let contents = [];

      const _p = path =>
        new Promise((_resolve, _reject) => {
          try {
            const file = JSON.parse(fs.readFileSync(path).toString());
            _resolve(file);
          } catch (e) {
            _reject(e);
          }
        });

      for (let i in list) {
        const _contents = await _p(`${dir}/${list[i]}`);
        contents.push(_contents);
      }

      resolve(contents);
    });
  });
