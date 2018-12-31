const fs = require("fs");
const request = require("request");

async function download(url, file) {
  return new Promise((resolve, reject) => {
    request(url)
      .pipe(fs.createWriteStream(file))
      .on("finish", resolve);
  });
}

// TODO check date or use cache or s3 or something more efficient?

function hpHosts() {
  // request("https://hosts-file.net/download/hosts.zip").pipe(
  //   fs.createWriteStream("temp/hphosts.zip")
  // );
}

async function ipsum() {
  await download(
    "https://raw.githubusercontent.com/stamparm/ipsum/master/ipsum.txt",
    "temp/ipsum.txt"
  );
}

(async _ => {
  await ipsum();
})();
