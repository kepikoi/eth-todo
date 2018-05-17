/* eslint-disable no-console */
const
    sass = require("node-sass")
    , path = require("path")
    , fs = require("fs")
    , input = "style.scss"
    , output = "style.css"
    , file = path.join(__dirname, "public", input)
    , outFile = path.join(__dirname, "public", output)
;

const result = sass.renderSync({
    file,
    outFile,
    outputStyle: "compressed",
    sourceMap: true, // or an absolute or relative (to outFile) path
});

fs.writeFileSync(outFile, result.css);
console.log("build success", result);

module.exports = file;