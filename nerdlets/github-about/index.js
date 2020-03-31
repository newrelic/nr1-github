import React from 'react';
import GithubAbout from './main';
import { NerdletStateContext } from 'nr1';

export default class Wrapper extends React.PureComponent {
  render() {
    return (
      <NerdletStateContext.Consumer>
        {nerdletUrlState => <GithubAbout nerdletUrlState={nerdletUrlState} />}
      </NerdletStateContext.Consumer>
    );
  }
}
