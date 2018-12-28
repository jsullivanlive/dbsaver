# cloudanswers hackathon project dec 2018

Salesforce admin/consultant toolkit

Learn all the key things about your org(s), check performance, know in advance about configuration issues, etc.

## Dev

    nvm use # optional
    npm i
    nf start -j Procfile-dev

## TODO

- [x] salesforce auth
- [x] add settings so user can turn on/off alerts
- [x] generate image with map of recent sessions to spot weird locations
- [x] show top browsers in bar chart
- [ ] show new locations
- [ ] show new oauth apps
- [ ] show popular browsers
- [ ] alert about new users being created, especially ones with bigger privs
- [ ] send email when new oauths are being used a lot
- [ ] send email when managed packages are updated
- [ ] send email when tests fail and say what was in the audit trail
- [ ] send email about new logins
- [ ] audit trail alerts
- [ ] strange IPs
- [ ] large loads alert
- [ ] largest approval process bottlenecks alert
- [ ] stale records alerts
- [ ] new reports/dashboards
- [ ] stats borrowed from logz, checkmarx, tinfoil, etc.
- [ ] dead man switch
- [ ] load testing
- [ ] transaction timing

### Original Ideas:

- salesforce benchmarking tool (to know if your instance is slow)
- super user tool which gives you total visibility into your org and anything that's happening
  - alert for any security weirdness
  - get proactive notifications if someone else changed a lot of records in your org
  - get notified of new users
  - see if any code was deployed or tests stop working
  - get notified about common problems in your org that should be fixed
- marketing software for building sites and lead forms from within salesforce so you don't have to buy wordpress
- backup tool so you can own your data backups
- AI powered admin assistant which learns from all admin changes in all orgs and recommends fields, reports, and workflows to create
- machine learning wizard to feed data into common regression algos
- faster salesforce mobile app
- more open/transparent salesforce appexchange
- open source esignature + payment page hosted on force.com sites so you can just install and get going selling stuff instead of having to buy docusign, integrate, then figure out the payment stuff, etc.
- markov chains to predict the next thing that is likely to happen to a record when you're viewing it

License: AGPLv3

You are permitted to use this source code as long as you tell your users where you got it from and give them the link to the github repository. All changes must be made public.
