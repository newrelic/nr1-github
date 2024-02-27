[![New Relic One Catalog Project header](https://github.com/newrelic/opensource-website/raw/master/src/images/categories/New_Relic_One_Catalog_Project.png)](https://opensource.newrelic.com/oss-category/#new-relic-one-catalog-project)

# GitHub Integration

![CI](https://github.com/newrelic/nr1-github/workflows/CI/badge.svg) ![GitHub release (latest SemVer including pre-releases)](https://img.shields.io/github/v/release/newrelic/nr1-github?include_prereleases&sort=semver) [![Snyk](https://snyk.io/test/github/newrelic/nr1-github/badge.svg)](https://snyk.io/test/github/newrelic/nr1-github)

## Usage

GitHub Integration connects services and applications in New Relic to an associated GitHub repository.

The GitHub Integration application will display quick access to the repository, a list of the most active source code contributors and the README.

This information is easily accessible in context when looking at individual services or applications.

## Screen Shots

![screenshot 1](catalog/screenshots/nr1-github-01.png)

![screenshot 2](catalog/screenshots/nr1-github-02.png)

![screenshot 3](catalog/screenshots/nr1-github-03.png)

![screenshot 4](catalog/screenshots/nr1-github-04.png)

![screenshot 5](catalog/screenshots/nr1-github-05.png)

## Dependencies

- A public or private enterprise instance of GitHub.
- The ability to generate a personal access token in GitHub.
- Requires at least one of [`New Relic APM`](https://newrelic.com/platform/application-monitoring), [`New Relic Browser`](https://newrelic.com/platform/browser-monitoring) or [`New Relic Mobile`](https://newrelic.com/platform/mobile-monitoring).

### Using GitHub Personal Access Tokens

Integration with GitHub requires the user to create or use a private
access token as a one-time setup step. This GitHub personal access token
increases security, because it ensures each user can only see repositories
they have access to. New Relic will store that access token, but the user
can easily delete it from New Relic's storage at any time.

We recommend creating a dedicated personal access token for this application only,
and you should give that token `read only` permissions. See
[GitHub's doc on access tokens](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line)
for full instructions.

Personal access tokens are stored in New Relic's [NerdStorageVault](https://developer.newrelic.com/explore-docs/nerdstoragevault/), and are accessible only to the user account that stored it, and the `Nerdpack` which created it. The data is encrypted in transmission and at rest (within the underlying database).

### Setting GitHub URL

To keep your Personal Access Token secure, you are no longer able to set an account-wide GitHub URL. GitHub URLs are now scoped to an individual user. If a URL has been setup by someone in your account, it will be suggested to you and you can choose to set it if you trust the source.

## Enabling this App

This App is available via the New Relic Catalog. 

To enable it in your account, go to `Add Data > Apps and Visualzations` and search for "Github Integration". Click the `Github Integration` card, and then click the `Add this App` button to add it to your account(s).

Once subscribed: 
1. navigate to an APM, Browser or Mobile app via the Entity Explorer in New Relic One
2. locate and click the `Github Integration` menu item in the secondary left-nav, found under `More Views` (note: on the first time accessing the app, you may be prompted to enable it)

#### Manual Deployment
If you need to customize the app, fork the codebase and follow the instructions on how to [Customize a Nerdpack](https://developer.newrelic.com/build-apps/customize-nerdpack). If you have a change you feel everyone can benefit from, please submit a PR!

## Support

<a href="https://github.com/newrelic?q=nrlabs-viz&amp;type=all&amp;language=&amp;sort="><img src="https://user-images.githubusercontent.com/1786630/214122263-7a5795f6-f4e3-4aa0-b3f5-2f27aff16098.png" height=50 /></a>

This project is actively maintained by the New Relic Labs team. Connect with us directly by [creating issues](../../issues) or [asking questions in the discussions section](../../discussions) of this repo.

We also encourage you to bring your experiences and questions to the [Explorers Hub](https://discuss.newrelic.com) where our community members collaborate on solutions and new ideas.

New Relic has open-sourced this project, which is provided AS-IS WITHOUT WARRANTY OR DEDICATED SUPPORT.

## Security

As noted in our [security policy](https://github.com/newrelic/nr1-github/security/policy), New Relic is committed to the privacy and security of our customers and their data. We believe that providing coordinated disclosure by security researchers and engaging with the security community are important means to achieve our security goals.

If you believe you have found a security vulnerability in this project or any of New Relic's products or websites, we welcome and greatly appreciate you reporting it to New Relic through [HackerOne](https://hackerone.com/newrelic).

## Contributing

Contributions are welcome (and if you submit a Enhancement Request, expect to be invited to contribute it yourself :grin:). Please review our [Contributors Guide](CONTRIBUTING.md).

Keep in mind that when you submit your pull request, you'll need to sign the CLA via the click-through using CLA-Assistant. If you'd like to execute our corporate CLA, or if you have any questions, please drop us an email at opensource+nr1-github@newrelic.com.

## Open Source License

This project is distributed under the [Apache 2 license](LICENSE).

