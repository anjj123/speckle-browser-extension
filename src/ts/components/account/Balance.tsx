import React from 'react'
import t from '../../services/i18n'
import { connect } from 'react-redux'
import { IAppState } from '../../background/store/all'
import { Title, SecondaryText } from '../basic-components'
import { ChainProperties } from '@polkadot/types'
import ApiPromise from '@polkadot/api/promise'
import { formatBalance } from '@polkadot/util'
import styled from 'styled-components'

class Balance extends React.Component<IBalanceProps, IBalanceState> {

  state: IBalanceState = {
    balance: undefined,
    tries: 1
  }

  get api (): ApiPromise {
    const api = this.props.apiContext.api
    if (api) return api
    throw new Error(t('apiError'))
  }

  get chainProperties (): ChainProperties {
    const chainProperties = this.state.chainProperties
    if (chainProperties) return chainProperties
    throw new Error(t('apiError'))
  }

  updateBalance = (address: string) => {
    if (this.props.apiContext.apiReady) {
      this.setState({ ...this.state, tries: 1 })
      if (this.state.chainProperties) {
        this.doUpdate(address)
        return
      }
      this.api.rpc.system.properties().then(properties => {
        const chainProperties = (properties as ChainProperties)
        this.setState({ ...this.state, chainProperties: chainProperties })
        this.doUpdate(address)
      })
    } else if (this.state.tries <= 10) {
      const nextTry = setTimeout(this.updateBalance, 1000)
      this.setState({ ...this.state, tries: this.state.tries + 1, nextTry: nextTry })
    } else {
      this.setState({ ...this.state, balance: t('balanceNA') })
    }
  }

  private doUpdate = (address: string) => {
    console.log(address)
    formatBalance.setDefaults({
      decimals: this.chainProperties.tokenDecimals,
      unit: this.chainProperties.tokenSymbol
    })
    this.api.query.balances.freeBalance(address).then(result => {
      const formattedBalance = formatBalance(result.toString())
      this.setState({ ...this.state, balance: formattedBalance })
    })
  }

  componentDidMount (): void {
    this.updateBalance(this.props.address)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.address !== this.props.address) {
      this.updateBalance(nextProps.address)
    }
  }

  componentWillUnmount (): void {
    this.state.nextTry && clearTimeout(this.state.nextTry)
  }

  render () {
    return this.state.balance !== undefined ? this.renderBalance() : this.renderPlaceHolder()
  }

  renderPlaceHolder () {
    return (
      <BalanceBox>
        <SecondaryText>
          {t('getBalance')}
        </SecondaryText>
      </BalanceBox>
    )
  }

  renderBalance () {
    return (
      <BalanceBox>
        <Title>
          {this.state.balance}
        </Title>
      </BalanceBox>
    )
  }
}

const BalanceBox = styled.div`
  width: 215px;
  height: 73px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px 0 rgba(62, 88, 96, 0.1);
`

const mapStateToProps = (state: IAppState) => {
  return {
    apiContext: state.apiContext
  }
}

type StateProps = ReturnType<typeof mapStateToProps>

interface IBalanceProps extends StateProps {
  address: string
}

interface IBalanceState {
  balance?: string
  tries: number,
  nextTry?: any,
  chainProperties?: ChainProperties
}

export default connect(mapStateToProps)(Balance)
