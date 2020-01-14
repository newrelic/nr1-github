import React from 'react';
import PropTypes from 'prop-types';
import GitHubLogo from '../../assets/github-logo.svg';
import { Stack, StackItem } from 'nr1';

export default function Header({ repoUrl }) {
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
        {repoUrl && (
          <StackItem className="repo-link-stack">
            <a
              href={repoUrl}
              target="_blank"
              className="repo-link"
              rel="noopener noreferrer"
            >
              {repoUrl}
            </a>
          </StackItem>
        )}
      </Stack>
    </div>
  );
}

Header.propTypes = {
  repoUrl: PropTypes.string
};
