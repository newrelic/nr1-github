# nr1-github

Integrate New Relic One with GitHub (either public or private enterprise instance)
to bring more context to your entities.

Associate any service or application with its github repository as a one-time action
and then you can quickly see that applcition's README file, as well as a list
of most active source code contributors

## Screen Shots

![screenshot 1](./screenshots/screenshot-1.png)

![screenshot 2](./screenshots/screenshot-2.png)

## Using GitHub Access Tokens

Integration with github requires the user to create or use a private
access token as a one-time setup step. New Relic will securerly store
that access token, but the user can easily delete it from New Relic's storage
at any time.

Every user must provide their own Github personal access token to increase
security and allow the user to see only the repositories they have access to.

Personal access tokens are securely stored with New Relic One's `UserStorage`
API's

