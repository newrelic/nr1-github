import React from 'react';

import { TextField, Button, Stack, StackItem } from 'nr1'

export default class Setup extends React.PureComponent {

  renderRepoUrlInput() {
    const { githubUrlValue } = this.state || {}
    const { githubUrl, setGithub } = this.props

    const enabled = githubUrlValue && githubUrlValue.startsWith("https://")

    return <>
      <h3>Github Enterprise URL</h3>
      <p>
        First, specify the URL for your Github repository. Note if your
        instance is on your private network, youn need to be connected to
        that VPN for this to work correctly.
      </p>
      <Stack alignmentType="center">
        <StackItem grow>
          <TextField autofocus
            label="Github URL"
            type={TextField.TYPE.URL}
            defaultValue={githubUrl}
            onChange={({ target }) => this.setState({ githubUrlValue: target.value })}
          />
        </StackItem>
        <StackItem>
          <Button
            onClick={() => setGithub(githubUrlValue)}
            disabled={!enabled}
            type={githubUrl ? "normal" : "primary"}>
            {githubUrl ? "Update " : "Set "} Your Organization's Github URL
        </Button>
        </StackItem>
      </Stack>
    </>
  }

  renderUserTokenInput() {
    const { userToken } = this.state || {}
    const { setUserToken, githubUrl } = this.props

    return <>
      <h3>Personal Access Token</h3>
      <p>
        Now, <a href={`${githubUrl}/settings/tokens`} target="_blank">
          generate a personal access token</a> for your Github account. You don't
        need to give the token any special access scopes.
      </p>
      <Stack alignmentType="center">
        <StackItem grow>
          <TextField autofocus
            label="Github Token"
            placeholder="Paste your user token here"
            onChange={({ target }) => this.setState({ userToken: target.value })}
          />
        </StackItem>
        <StackItem>
          <Button
            onClick={() => setUserToken(userToken)}
            disabled={!userToken || userToken.length != 40}
            type="primary">
            Set Your Github Token
          </Button>
        </StackItem>
      </Stack>
      <p>
        <strong>Remember</strong> if using a private github repository, be sure you are
        connected to your organization's private network to access it.
      </p>
    </>

  }

  renderDeleteUserToken() {
    const { setUserToken, githubUrl } = this.props
    return <>
      <h3>Personal Access Token</h3>
      <Stack alignmentType="center" fill>
        <StackItem grow>
          <p>
            You have provided a Github personal access token, which you
            can <a href={`${githubUrl}/settings/tokens`} target="_blank">
            delete from Github</a>. You can also delete your token from 
            New Relic's secure storage.
          </p>
        </StackItem>
        <StackItem>
          <Button onClick={() => setUserToken(null)}
            sizeType="slim" type="destructive">
            Delete my User Token
          </Button>

        </StackItem>
      </Stack>
    </>
  }

  render() {
    return <div style={{ margin: "16px" }}>
      <Stack>
        <StackItem grow>
          <h1>Integrate with Github</h1>
          <p>
            Ever wondered what a Service does, or who has been working on it recenlty?
            Answer these questions and more with this Github integration!
          </p>
        </StackItem>
        <StackItem>
          <img width="200px" height="166px"
            src="https://github.githubassets.com/images/modules/logos_page/Octocat.png" />
        </StackItem>
      </Stack>
      {this.renderRepoUrlInput()}
      {this.props.githubUrl && !this.props.github && this.renderUserTokenInput()}
      {this.props.githubUrl && this.props.github && this.renderDeleteUserToken()}
    </div>
  }
}