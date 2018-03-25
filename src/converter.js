const marked = require('marked');
const getRemoteFile = require('./get-remote-file');
const highlight = require('highlight.js');

marked.setOptions({
  renderer: new marked.Renderer(),
  highlight: code => highlight.highlightAuto(code).value,
  pedantic: false,
  gfm: true,
  tables: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false
});

function Converter(config) {
  this.retrieve = async function retrieve(gist, path, [_from, _to]) {
    const urlpattern = /http:\/\/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    const urlregex = new RegExp(urlpattern);
    let url = '';
    if (path.match(urlregex) === null) {
      // We assume that we deal with a gist file
      url = gist.files[path].raw_url;
    } else {
      url = path;
    }
    // Now we have a url
    const content = await getRemoteFile(url);
    const splitContent = content.split('\n');
    const from = _from || 1;
    const to = _to || splitContent.length - 1;
    return splitContent.slice(from - 1, to + 1).join('\n');
  };

  this.parseMacro = function parseMacro(file, index) {
    const match = file.slice(index).match(/!INCLUDE ([^\s]*)[\s]*([0-9]+)?:?([0-9]+)?/);
    return {
      path: match[1],
      index,
      length: parseInt(match[0].length, 10),
      from: parseInt(match[2], 10),
      to: parseInt(match[3], 10),
    };
  };

  this.replace = function replace(file, macro, content) {
    return file.substr(0, macro.index) + content + file.substr(macro.index + macro.length);
  };

  this.preProcess = async function preProcess(gist, file) {
    let preprocessedFile = file;
    const regexp = /!INCLUDE/g;
    let match;
    const macros = [];
    // Look for macros
    while (match !== null) {
      match = regexp.exec(file);
      if (match !== null) {
        macros.push(this.parseMacro(file, match.index));
      }
    }
    // Retrieve the files mentioned by the macros
    const files = await Promise.all(macros.map(macro =>
      this.retrieve(gist, macro.path, [macro.from, macro.to]))
    );
    // Replace the macros by the files content
    match = regexp.exec(file);
    for (let i = 0; match !== null && i < files.length; i += 1) {
      if (match !== null) {
        const macro = this.parseMacro(preprocessedFile, match.index);
        preprocessedFile = this.replace(preprocessedFile, macro, files[i]);
      }
      match = regexp.exec(preprocessedFile);
    }
    return preprocessedFile;
  };

  this.convert = function convert(file) {
    return marked(file);
  };

  return this;
}

module.exports = Converter;
