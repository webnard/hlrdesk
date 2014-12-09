var sass    = require('node-sass'),
    path    = require('path'),
    fs      = require('fs'),
    Promise = require('bluebird');

module.exports = function KoaSassy(sassDir, cssPrefix, options) {

  options = options || {};

  var re = new RegExp("^" + cssPrefix + "(.*)\\.css$");

  return function *(next) {
    var _this = this;
    var matches = re.exec(_this.request.url);

    if(!matches) {
      yield next;
      return;
    }

    var filename = matches[1];
    var cssFilepath = null;
   
    if(options.outDir) {
      cssFilepath = path.join(options.outDir, filename + '.css');
    }

    function render(filepath) {
      sass.render({
        file: filepath,
        outputStyle: options.outputStyle,
        success: function success(css) {
          _this.status = 200;
          _this.body = css;
          _this.response.type = 'text/css';
          //callback();
        },
        error: function error(e) {
          console.error(e);
          _this.status = 500;
          //callback();
        }
      });

      if(options.outDir) {
        sass.renderFile({
          file: filepath,
          outFile: cssFilepath,
          error: function error(e) {
            console.error(e);
          },
          outputStyle: options.outputStyle,
          success: function noop() {},
        });
      }
    };

    var sassFilepath = path.join(sassDir, filename + '.sass');
    fs.stat(sassFilepath, function(e, stat) {
      if(e) {
        var scssFilepath = path.join(sassDir, filename + '.scss');
        fs.stat(scssFilepath, function(e, stat) {
          if(e) {
            console.error("Could not find either " + sassFilepath + " or " + scssFilepath);
            _this.status = 500;
            //callback();
          }
          else
          {
            if(options.outDir) {
              fs.stat(cssFilepath, function(e, cssStat) {
                if(e || cssStat.mtime < stat.mtime) {
                  render(scssFilepath);
                } 
                else
                {
                  fs.readFile(cssFilepath, function(contents) {
                    _this.status = 200;
                    _this.body = contents;
                    _this.response.type = 'text/css';
                    yield next;
                    //callback();
                  });
                }
              });
            }
            else
            {
              render(scssFilepath);
            }
          }
        });
      }
      else
      {
        if(options.outDir) {
          fs.stat(cssFilepath, function(e, cssStat) {
            if(e || cssStat.mtime < stat.mtime) {
              render(sassFilepath);
            } 
            else
            {
              fs.readFile(cssFilepath, function(contents) {
                _this.status = 200;
                _this.body = contents;
                _this.response.type = 'text/css';
                //callback();
              });
            }
          });
        }
        else
        {
          render(sassFilepath);
        }
      }
    });
  }
};
