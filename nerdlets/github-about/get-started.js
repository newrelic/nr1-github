import React from 'react';

import { TextField, Button, Stack, StackItem } from 'nr1'

export default class GettingStarted extends React.Component {
  render() {
    const { userToken } = this.state || {}
    const { setUserToken } = this.props
    return <div style={{ margin: "16px" }}>
      <Stack>
        <StackItem grow>
          <h1>Integrate with Github</h1>
          <p>
            Get Started by <a href="http://source.datanerd.us/settings/tokens" target="_blank">
              generating a personal access token</a> for your Github account.
          </p>
          <p>
            To see public repostiories, you  won't need to turn on any scopes,
            so we recommend that you keep the scope of your API key to the default
            minimum.
          </p>
        </StackItem>
        <StackItem>
          <img width="200px" height="166px"
            src="https://github.githubassets.com/images/modules/logos_page/Octocat.png" />
        </StackItem>
      </Stack>
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
      <pre>
      // FIXME delete this token!<br/>  
      f5c9264fea5ae4b4873f9c3d1e6e6ac00a7c26e1
      </pre>
    </div>
  }
}