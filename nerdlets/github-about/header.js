import React from 'react';
import PropTypes from 'prop-types';
import GitHubLogo from '../../assets/github-logo.svg';
import { Stack, StackItem } from 'nr1';
import { isUrlSafe } from '../shared/utils';

export default function Header({ repoUrl, username, timestamp }) {
  return (
    <div className="header">
      <Stack
        verticalType={Stack.VERTICAL_TYPE.CENTER}
        className="header-stack"
        fullWidth
      >
        <StackItem>
          <img src={GitHubLogo} className="github-logo" />
        </StackItem>
        <StackItem className="repo-link-stack">
          {isUrlSafe(repoUrl) && (
            <a
              href={repoUrl}
              target="_blank"
              className="repo-link"
              rel="noopener noreferrer"
            >
              {repoUrl}
            </a>
          )}
          <span>
            RepoURL updated by {username} at {timestamp}
          </span>
        </StackItem>
      </Stack>
    </div>
  );
}

Header.propTypes = {
  repoUrl: PropTypes.string,
  username: PropTypes.string,
  timestamp: PropTypes.string
};
