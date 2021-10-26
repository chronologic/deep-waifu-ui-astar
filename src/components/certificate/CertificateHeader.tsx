import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Typography, Layout, Space, Button, Row, Col } from 'antd';
import { FilePdfFilled } from '@ant-design/icons';
import jsPdf from 'jspdf';
import { useHistory } from 'react-router-dom';

import { CHAIN_ID, SHARE_URL } from '../../env';
import { useWaifu } from '../../hooks';
import { flamingo, whitesmoke, bluegrey } from '../colors';
import { AppHeader, Confetti } from '../shared';
import { OrderPillow } from '../pillow';
import { htmlToDataUrl } from '../../utils';
import Certificate from './Certificate';
import { EXPLORERS } from '../../constants';

const { Content } = Layout;
const { Title } = Typography;

export default function CertificateHeader() {
  const history = useHistory();
  const { state, onResetState } = useWaifu();

  const handlePrintPDF = useCallback(async () => {
    const dataUrl = await htmlToDataUrl('#certificate', 2);
    printPDF(dataUrl);
  }, []);

  const handleReset = useCallback(async () => {
    onResetState();
    history.push('/');
  }, [history, onResetState]);

  const tweetUrl = useMemo(() => {
    const certId = state.certificateLink?.split('/').reverse()[0];
    return `https://twitter.com/intent/tweet?text=Check%20out%20my%20%23DeepWaifu!%20%0A%0A${SHARE_URL}/c/${certId}`;
  }, [state.certificateLink]);

  const explorerUrl = useMemo(() => {
    return EXPLORERS[CHAIN_ID] + 'tx/' + state.tx;
  }, [state.tx]);

  return (
    <Layout>
      <Confetti />
      <AppHeader />
      <CustomContent id="upload">
        <Content>
          <Row className="mainTitle">
            <Title className="titleRed">(´｡• ω •｡`)</Title>
            <Title>&nbsp;Your DeepWaifu NFT has been listed!</Title>
          </Row>
          <Row className="flow">
            <Col flex="640px">
              <Certificate holder={state.holder} id={state.id} name={state.name} waifuDataUrl={state.waifuDataUrl} />
              <br />
              <br />
              <Mint>
                <Space direction="vertical" size="middle">
                  <div className="mintBtn">
                    <Space direction="horizontal" size="large">
                      <Button danger size="large" href={tweetUrl} target="_blank" rel="noreferrer">
                        Tweet it!
                      </Button>
                      <Button type="primary" size="large" danger onClick={handleReset}>
                        Mint another!
                      </Button>
                    </Space>
                  </div>
                  <div className="mintBtn">
                    <Space direction="horizontal" size="large">
                      <Button type="link" danger target="_blank" rel="noreferer noopener" href={explorerUrl}>
                        View on Explorer
                      </Button>
                      <Button id="print" onClick={handlePrintPDF} type="link" danger icon={<FilePdfFilled />}>
                        Download PDF
                      </Button>
                    </Space>
                  </div>
                </Space>
              </Mint>
            </Col>
            <Col flex="auto">
              <OrderPillow />
            </Col>
          </Row>
        </Content>
      </CustomContent>
    </Layout>
  );
}

function printPDF(dataUrl: string) {
  const pdf = new jsPdf({
    orientation: 'landscape',
    unit: 'px',
    format: [1280, 902],
  });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(`certificate_of_adoption_${new Date().toISOString()}.pdf`);
}

const Mint = styled.div`
  text-align: center;
  margin: 2em 0;

  .ant-switch {
    background-color: ${flamingo};
  }
  .ant-switch-checked {
    background-color: black;
  }
  .ant-switch-checked:focus {
    box-shadow: 0 0 0 2px rgb(235 87 87 / 20%);
  }
  .mintBtn {
    display: block;
  }
`;

const CustomContent = styled.div`
  background: ${whitesmoke};

  .ant-layout-content {
    max-width: 960px;
    margin: 8em auto 0 auto;
    padding: 0 10px;
  }
  .ant-input:hover,
  .ant-input:focus,
  .ant-input-focused {
    border-color: ${flamingo};
    box-shadow: 0 0 0 2px rgb(235 87 87 / 20%);
  }

  .mainTitle {
    display: flex;
    padding: 1em 0 2em;
  }

  .certificate {
    text-align: center;
  }

  .titleFeaturesRed {
    font-size: 16px;
    color: ${flamingo};
  }
  .titleFeatures {
    font-size: 16px;
  }
  .titleRed {
    color: ${flamingo};
  }
  .title30 {
    font-size: 30px;
    margin: 0px;
    margin-top: 0px !important;
    color: ${bluegrey};
  }
  .titleJumbo {
    font-family: Hachi Maru Pop;
    font-style: normal;
    font-weight: normal;
    font-size: 18px;
    line-height: 36px;
    color: ${flamingo};
  }
  .text14 {
    font-size: 14px;
  }
  .text12 {
    font-size: 12px;
  }
  .text8 {
    font-size: 8px;
    color: ${bluegrey};
  }
  .flow {
    flex-flow: initial;
  }
`;
