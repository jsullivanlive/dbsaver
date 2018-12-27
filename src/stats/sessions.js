const StaticMaps = require("staticmaps");
const path = require("path");
const fs = require("fs");

async function sessions(keyPrefix, conn, storage) {
  let sessions = await conn
    .sobject("AuthSession")
    .select("*, LoginGeo.*, LoginHistory.*")
    .where("CreatedDate = last_n_days:7")
    .execute();

  // store so we can do some long term history without killing the salesforce api
  storage.archive(keyPrefix, "AuthSession", sessions);

  const map = new StaticMaps({
    width: 600,
    height: 400
  });

  for (const sess of sessions) {
    map.addMarker({
      img: `${__dirname}/noun_map pin_626096-50.png`, // i have paid account on thenounproject.com ,
      offsetX: 25,
      offsetY: 50,
      width: 50,
      height: 50,
      coord: [sess.LoginGeo.Longitude, sess.LoginGeo.Latitude]
    });
  }
  var key = path.join(
    keyPrefix,
    "_email_images",
    new Date().toISOString() + ".png"
  );

  // FIXME send buffer straight to S3 without local file, was making glibc errors
  var tempfile = "temp.png";
  var mapUrl;
  await map
    .render()
    .then(() => map.image.save(tempfile))
    .then(() => {
      var data = fs.readFileSync(tempfile);

      return storage.put(key, data, false);
    })
    .then(() => {
      const ONE_MONTH = 60 * 60 * 24 * 30;
      mapUrl = storage.signedGetUrl(key, ONE_MONTH);
    })
    .catch(function(err) {
      console.log(err);
    });
  var browsers = {};
  sessions
    .map(sess => sess.LoginHistory.Browser)
    .map(b => (browsers[b] ? browsers[b]++ : (browsers[b] = 1)));
  return {
    mapUrl: mapUrl,
    browsers: browsers,
    platforms: sessions.map(sess => sess.LoginHistory.Platform),
    failures: sessions.map(sess => sess.LoginHistory.Status !== "Success"),
    sessions_count: sessions.length,
    html: `
        <div>
            <img src="${mapUrl}"/>
            Browsers: ${Object.keys(browsers)}
        </div>
    `
  };
}

module.exports = sessions;
