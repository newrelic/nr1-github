import React from 'react';
import PropTypes from 'prop-types';
import GitHubLogo from '../../assets/github-logo.svg';
import { Stack, StackItem } from 'nr1';
import { sanitizeUrl } from '../shared/utils';

export default function Header({ repoUrl }) {
  const safeRepoUrl = sanitizeUrl(repoUrl);

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
        {safeRepoUrl && (
          <StackItem className="repo-link-stack">
            <a
              href={safeRepoUrl}
              target="_blank"
              className="repo-link"
              rel="noopener noreferrer"
            >
              {safeRepoUrl}
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
