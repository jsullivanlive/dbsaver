if (!process.env.SENDGRID_API_KEY)
  throw new Error("missing env var: SENDGRID_API_KEY");

var helper = require("sendgrid").mail;
var sg = require("sendgrid")(process.env.SENDGRID_API_KEY);

async function send(to_email, subject, content_text) {
  var from_email = new helper.Email("officer-k@cloudanswers.com");
  var to_email = new helper.Email("officer-k@cloudanswers.com");
  var content = new helper.Content("text/plain", content_text);
  var mail = new helper.Mail(from_email, subject, to_email, content);

  // TODO
  var request = sg.emptyRequest({
    method: "POST",
    path: "/v3/mail/send",
    body: mail.toJSON()
  });

  return new Promise((resolve, reject) => {
    sg.API(request, function(error, response) {
      if (error) return reject(error);
      console.log(response.statusCode);
      console.log(response.body);
      console.log(response.headers);
    });
  });
}

module.exports = {
  send: send
};
