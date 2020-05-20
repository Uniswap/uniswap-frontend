import React from 'react'
import styled from 'styled-components'

import Button from "@material-ui/core/Button";
import { Link } from '../../theme'
import Web3Status from '../Web3Status'
import { darken } from 'polished'
import './header.css';
import DMMLogo from '../../assets/images/dmm-logo.svg';
import FiatAdapter from 'fiat-adapter';


class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fiatAdapterOpen: false,
    };
  }

  render() {

    return (
      <div className={'navbar'}>
        <div className={'content'}>
          <div className={'logoWrapper'}>
            <div className={'logo'}>
              <img src={DMMLogo} alt={"DMM Logo"}/>
            </div>
            <div className={'logoText'}>
              DMM <span className={'swapText'}></span>
            </div>
          </div>
          <div className={'buttonsWrapper'}>
            <div className={'purchaseCryptoButton'}>
              <Button className={'loadWallet'} onClick={() => this.setState({ fiatAdapterOpen: true })}>
                Buy Crypto
              </Button>
            </div>
            <div className={'connectWalletButton'}>
              <Web3Status />
              {/*this.state.isLoading ? (
                <CircularProgress className={'progressBar'} color={"inherit"}/>
              ) : (
                <Button className={`${'loadWallet'} ${isWalletLoaded && 'loaded'}`}
                        onClick={() => this.props.loadWallet()}>
                  {isWalletLoaded ? (
                    <div>
                      <div>{'0x' + DmmWeb3Service.onboard.getState().address.substring(2, 4) + '...' + DmmWeb3Service.onboard.getState().address.slice(-4)}</div>
                      <div className={'walletConnected'}>Wallet Connected</div>
                    </div>
                  ) : "Connect Wallet"}
                </Button>
              )*/}
            </div>
          </div>
        </div>
        <FiatAdapter
          open={this.state.fiatAdapterOpen}
          onClose={() => this.setState({ fiatAdapterOpen: false })}
          allowedCryptos={['DAI', 'USDC']}
        />
      </div>
    )
  }
}

export default Header;

/*export default function Header() {
  return (
    <HeaderFrame>
      <HeaderElement>
        <Title>
          <Nod>
            <Link id="link" href="https://uniswap.io">
              <span role="img" aria-label="unicorn">
                🦄{'  '}
              </span>
            </Link>
          </Nod>
          <Link id="link" href="https://uniswap.io">
            <h1 id="title">Uniswap</h1>
          </Link>
        </Title>
      </HeaderElement>
      <HeaderElement>
        <Web3Status />
      </HeaderElement>
    </HeaderFrame>
  )
}*/
