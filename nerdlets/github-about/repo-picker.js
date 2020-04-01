import React from 'react';
import PropTypes from 'prop-types';
import { Button, Stack, StackItem, TextField, Spinner } from 'nr1';
import Github from './github';
import Header from './header';

export default class RepoPicker extends React.PureComponent {
  static propTypes = {
    githubUrl: PropTypes.string,
    isSetup: PropTypes.bool,
    userToken: PropTypes.string,
    setRepo: PropTypes.func.isRequired,
    deleteGithubUrl: PropTypes.func.isRequired,
    entity: PropTypes.object,
    repoUrl: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.loadSuggestions = this.loadSuggestions.bind(this);

    this.state = {
      suggestions: null,
      error: null
    };
  }

  componentDidMount() {
    this.loadSuggestions();
  }

  componentDidUpdate(prevProps) {
    const prevEntityId = prevProps.entity && prevProps.entity.id;
    const enitityId = this.props.entity && this.props.entity.id;

    if (
      (prevEntityId !== enitityId && this.props.entity) ||
      (!prevProps.isSetup && this.props.isSetup) ||
      this.props.githubUrl !== prevProps.githubUrl
    ) {
      this.loadSuggestions();
    }
  }

  cleanEntityName() {
    const { entity } = this.props;
    if (!(entity && entity.name)) return null;

    return entity.name
      .replace(/production/i, '')
      .replace(/staging/i, '')
      .replace(/canary/i, '')
      .replace(/\(/i, ' ')
      .replace(/\)/i, ' ')
      .replace(/-/i, ' ')
      .replace(/ EU /, ''); // NR specific?
  }

  getSearchQuery() {
    const cleanName = this.cleanEntityName();
    if (!cleanName) return;

    return `in:name in:readme in:description ${cleanName}`;
  }

  loadSuggestions() {
    const { isSetup, userToken, githubUrl } = this.props;

    if (!isSetup) {
      return;
    }

    this.setState({ error: null });
    const github = new Github({ userToken, githubUrl });

    const path = `search/repositories?q=${encodeURIComponent(
      this.getSearchQuery()
    )}`;

    github.get(path).then(response => {
      if (response instanceof Error) {
        this.setState({ error: response.message });
        return;
      }

      const suggestions =
        response && response.items && response.items.length > 0
          ? response.items
          : [];
      this.setState({ suggestions: suggestions });
    });
  }

  renderSuggestion(item, isSelected) {
    const { setRepo } = this.props;
    const className = isSelected ? 'repo active' : 'repo';

    let buttonType = Button.TYPE.NORMAL;
    let setRepoValue = item.html_url;
    let buttonTitle = 'Set Repository';

    if (isSelected) {
      buttonType = Button.TYPE.DESTRUCTIVE;
      setRepoValue = '';
      buttonTitle = 'Clear';
    }

    return (
      <tr key={item.full_name} className={className}>
        <td>
          <a
            onClick={() => {
              setRepo(setRepoValue);
            }}
          >
            {item.full_name}
          </a>
          <br />
          <small>
            <a target="_blank" href={item.html_url} rel="noopener noreferrer">
              {item.html_url}
            </a>
          </small>
        </td>
        <td>
          <Button
            type={buttonType}
            sizeType={Button.SIZE_TYPE.SMALL}
            onClick={() => setRepo(setRepoValue)}
          >
            {buttonTitle}
          </Button>
        </td>
      </tr>
    );
  }

  renderCustomUrlRow(hasMatch) {
    const { setRepo, repoUrl } = this.props;
    const { customRepo } = this.state;

    return (
      <tr>
        <td>
          <TextField
            defaultValue={hasMatch ? '' : repoUrl}
            placeholder="Paste repository URL here"
            onChange={event =>
              this.setState({ customRepo: event.target.value })
            }
            label="Provide your own repository URL"
          />
        </td>
        <td>
          <Button
            sizeType={Button.SIZE_TYPE.SMALL}
            type={Button.TYPE.PRIMARY}
            onClick={() => setRepo(customRepo || repoUrl)}
          >
            Set Repository
          </Button>
        </td>
      </tr>
    );
  }

  renderSuggestions() {
    const { suggestions } = this.state;
    const { isSetup, repoUrl, entity, githubUrl } = this.props;

    if (!isSetup) {
      return <></>;
    }

    if (!suggestions || suggestions.length === 0 || !entity || !entity.name) {
      return (
        <>
          <Header />
          <table style={{ width: '100%', marginTop: '16px' }}>
            <tbody>
              <tr>
                <td colSpan="2">
                  <p>
                    We couldn't find a reposity to recommend that matches your
                    entity.
                  </p>
                </td>
              </tr>
              {this.renderCustomUrlRow()}
            </tbody>
          </table>
        </>
      );
    }

    let hasMatch = false;
    const GHURL =
      githubUrl && githubUrl.indexOf('api.github.com') === -1
        ? githubUrl.trim()
        : 'https://github.com';
    const searchUrl = `${GHURL}/search?q=${this.getSearchQuery()}`;
    // limit to top 5 suggestions
    return (
      <>
        <Header />
        <h2>Select a Repository</h2>
        <p>
          We've&#160;
          <a href={searchUrl} target="_blank" rel="noopener noreferrer">
            searched GitHub
          </a>
          &#160; for a repository matching <strong>{entity.name}</strong> and
          have come up with these suggestions.
        </p>
        <table style={{ width: '100%', marginTop: '16px' }}>
          <tbody>
            {suggestions.slice(0, 8).map(item => {
              const isSelected = item.html_url === repoUrl;
              hasMatch = hasMatch || isSelected;
              return this.renderSuggestion(item, isSelected);
            })}
            {this.renderCustomUrlRow(hasMatch)}
          </tbody>
        </table>
      </>
    );
  }

  render() {
    const { deleteGithubUrl } = this.props;
    const { error, suggestions } = this.state;

    if (!suggestions && error === null) return <Spinner fillContainer />;

    if (error) {
      return (
        <>
          <h2>An error occurred:</h2>
          <p>{error}</p>
          <Stack>
            <StackItem>
              <Button
                iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__REFRESH}
                type="normal"
                onClick={this.loadSuggestions}
              >
                Try Again
              </Button>
            </StackItem>
            <StackItem>
              <Button
                iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__REFRESH}
                onClick={deleteGithubUrl}
              >
                Reset Url
              </Button>
            </StackItem>
          </Stack>
        </>
      );
    }

    return (
      <Stack directionType="vertical" alignmentType="fill">
        <StackItem>{this.renderSuggestions()}</StackItem>
      </Stack>
    );
  }
}
