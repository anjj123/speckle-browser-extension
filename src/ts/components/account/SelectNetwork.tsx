import * as React from 'react'
import t from '../../services/i18n'
import Progress from './Progress'
import { withRouter, RouteComponentProps } from 'react-router'
import {
  Button as StyledButton,
  ContentContainer,
  TopSection
} from '../basic-components'
import { HOME_ROUTE } from '../../constants/routes'
import { Divider } from 'semantic-ui-react'
import styled from 'styled-components'
import NetworkList from './NetworkList'

interface ISelectNetworkProps extends RouteComponentProps {}

interface ISelectNetworkState {
  search: string
}

class SelectNetwork extends React.Component<ISelectNetworkProps, ISelectNetworkState> {

  state = {
    search: ''
  }

  gotoDashboard = () => {
    this.props.history.push(HOME_ROUTE)
  }

  handleChange = (event) => {
    this.setState({ search: event.target.value })
  }

  render () {

    return (
      <ContentContainer>
        <TopSection>
          <Progress step={3}/>
        </TopSection>
        <NetworkSection>
          <NetworkList search={this.state.search}/>
        </NetworkSection>
        <ChainQuote><span>More chains</span> coming soon</ChainQuote>
        <Divider />
        <StyledButton type='button' onClick={this.gotoDashboard}>
          {t('selectNetwork')}
        </StyledButton>
      </ContentContainer>
    )
  }
}

export default withRouter(SelectNetwork)

export const NetworkSection = styled.div`
  width: 100%
  margin: 8px 0 9px
  text-align: center
`

export const ChainQuote = styled.h3`
{
margin-top: 0px
opacity: 0.6
color: #3e5860
font-size: 14px
font-family: Nunito
text-align: center
}
> span {
  opacity: 1;
  font-weight: bold;
  color: #000000
}
`
