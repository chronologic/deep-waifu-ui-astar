import { useMemo } from 'react';
import styled from 'styled-components';
import { Typography, Layout, Divider } from 'antd';

import { useWaifu, useWallet } from '../../hooks';
import { flamingo } from '../colors';
import { CHAIN_ID } from '../../env';
import { NETWORK } from '../../constants';

const { Header } = Layout;
const { Title } = Typography;

const isProd = CHAIN_ID === NETWORK.chainId;

export default function AppHeader() {
  const { address } = useWallet();
  const { onResetState } = useWaifu();

  const addressShort = useMemo(() => {
    if (address) {
      return address.substr(0, 6) + '...' + address.substr(-4);
    }
    return '';
  }, [address]);

  return (
    <FixedHeader>
      <CustomHeader>
        <Header>
          <CustomMenu>
            <a className="title" href="/" onClick={onResetState}>
              <Title>Deep</Title>
              <Title className="titleRed">Waifu</Title>
              <Divider type="vertical" />
              <Title>ディープ</Title>
              <Title className="titleRed">ワイフ</Title>
            </a>
            <ButtonWrapper>
              {!isProd && <div className="envLabel">{NETWORK.chainParams.chainName}</div>}
              {addressShort}
            </ButtonWrapper>
          </CustomMenu>
        </Header>
      </CustomHeader>
    </FixedHeader>
  );
}

const CustomMenu = styled.div`
  display: flex;
  padding-top: 1.2em;
  justify-content: space-between;

  a.title {
    display: flex;
  }

  .ant-btn:hover,
  .ant-btn:focus {
    color: ${flamingo};
    border-color: ${flamingo};
  }

  .walletConnector {
    background-color: white;
    color: rgba(0, 0, 0, 0.85);
    border: 1px solid rgba(0, 0, 0, 0.85);
    border-radius: 3px;
    font-weight: 300;

    &:hover {
      background-color: white;
      transition: all 0.2s ease;
      color: ${flamingo};
      border-color: ${flamingo};
      background-image: none;
    }

    &.hidden {
      visibility: hidden;
    }
  }
`;

const CustomHeader = styled.div`
  .ant-layout-header {
    height: 8em;
    background: white;
    max-width: 960px;
    margin: 0 auto;
    padding: 0 10px;
  }
  .titleRed {
    color: ${flamingo};
  }
  .ant-divider-vertical {
    top: 1.3em;
    height: 1.6em;
    border-left: 2px solid rgba(0, 0, 0, 0.2);
  }
`;

const FixedHeader = styled.div`
  position: fixed;
  z-index: 10;
  width: 100%;
  box-shadow: 0px 1px 0px rgba(0, 0, 0, 0.06);
  background: white;
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;

  .envLabel {
    color: ${flamingo};
    font-weight: bold;
  }
`;
