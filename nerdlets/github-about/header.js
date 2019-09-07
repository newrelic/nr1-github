import GitHubLogo from '../../assets/github-logo.svg'
import { Stack, StackItem } from 'nr1'

export default function Header({repoUrl}) {
  return <div className="header">
    <Stack directionType={Stack.DIRECTION_TYPE.HORIZONTAL} alignmentType={Stack.ALIGNMENT_TYPE.CENTER} className="header-stack">
      <StackItem>
        <img src={GitHubLogo} className="github-logo"/>
      </StackItem>
      <StackItem className="repo-link-stack">
        {repoUrl && <a href={repoUrl} target="_blank" className="repo-link">{repoUrl}</a>}
      </StackItem>
    </Stack>
  </div>
}