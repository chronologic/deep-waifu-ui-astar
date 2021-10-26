import { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { Typography, Space, Button, Image, Row, Col, Card, Input, Badge, Form, message } from 'antd';
import { ethers } from 'ethers';

import { useDeepWaifuContract, useWaifu, useWallet } from '../../hooks';
import { htmlToDataUrl, sleep, srcToFile } from '../../utils';
import { apiService } from '../../services';
import { SECOND_MILLIS } from '../../constants';
import { IMintStatus } from '../../types';
import { Certificate } from '../certificate';
import { KaomojiLoader, NftCounter } from '../shared';

const { Title, Text } = Typography;

interface ICertificateParams {
  id: number;
  name: string;
  holder: string;
}

const emailRegex =
  /^([a-zA-Z0-9_\-+.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9-]+\.)+))([a-zA-Z]{2,10}|[0-9]{1,3})(\]?)$/i;
const MAX_NAME_LENGTH = 24;

export default function MintForm() {
  const history = useHistory();
  const [form] = Form.useForm();
  const { state, onUpdateState, onResetState } = useWaifu();
  const [resumeMint, setResumeMint] = useState(false);
  const [paying, setPaying] = useState(false);
  const [minting, setMinting] = useState(false);
  const [certificateParams, setCertificateParams] = useState<ICertificateParams>({} as any);
  const { connected, connect } = useWallet();
  const { priceWei, onPayForMint } = useDeepWaifuContract();

  const waitForMint = useCallback(async (tx: string): Promise<IMintStatus> => {
    return new Promise(async (resolve, reject) => {
      try {
        while (true) {
          await sleep(3 * SECOND_MILLIS);
          const res = await apiService.mintStatus(tx);
          if (res.status === 'minted') {
            return resolve(res);
          } else if (res.status === 'error') {
            return reject(new Error(res.message));
          }
        }
      } catch (e) {
        reject(e);
      }
    });
  }, []);

  const getCertificateFile = useCallback(async (params: ICertificateParams) => {
    setCertificateParams(params);
    await sleep(100); // give time to rerender
    const dataUrl = await htmlToDataUrl('#certificate');

    return srcToFile(dataUrl, 'certificate.png', 'image/png');
  }, []);

  const handleMint = useCallback(async () => {
    const { name, email } = await form.validateFields();

    if (!connected) {
      setResumeMint(true);
      return connect();
    }

    try {
      (window as any).heap.identify(email);
    } catch (e) {
      console.error(e as any);
    }

    try {
      setPaying(true);
      const { tx, payer, id } = await onPayForMint();
      message.success('Payment successful!');
      setMinting(true);
      const certificate = await getCertificateFile({ id, name, holder: payer });
      await apiService.mint({ tx, waifu: state.waifu!, certificate, name });
      const res = await waitForMint(tx);

      onUpdateState({
        id: res.id,
        tx: res.tx,
        metadataLink: res.metadataLink,
        certificateLink: res.certificateLink,
        name,
        holder: payer,
      });

      message.success('Your Waifu has been minted!');
      history.push('/certificate');
    } catch (e) {
      message.error((e as any).message);
    } finally {
      setPaying(false);
      setMinting(false);
    }
  }, [connect, connected, form, getCertificateFile, history, onPayForMint, onUpdateState, state.waifu, waitForMint]);

  useEffect(() => {
    if (connected && resumeMint) {
      setResumeMint(false);
      handleMint();
    }
  }, [connected, handleMint, resumeMint]);

  const handleReset = useCallback(() => {
    onResetState();
    history.push('/');
  }, [history, onResetState]);

  return (
    <Form form={form}>
      {minting && <KaomojiLoader message="Your Waifu is being minted! This may take a while" />}
      <CertificateForm>
        <Card hoverable>
          <Row className="flow">
            <Col>
              <CertificateImage>
                <Card className="certImage">
                  <Space direction="vertical" size="large">
                    <Image width={280} preview={false} src={state.waifuDataUrl || state.selfieDataUrl} />
                    <Button type="link" danger onClick={handleReset}>
                      Re-upload selfie
                    </Button>
                  </Space>
                </Card>
              </CertificateImage>
            </Col>
            <Col>
              <Space direction="vertical">
                <Title className="title30">Certificate of Adoption</Title>
                <Text className="titleJumbo">養子縁組証明書</Text>
                <Text strong className="text14">
                  Let it be known to all that the holder of the DeepWaifu known by the name of
                </Text>
                <Form.Item
                  name="name"
                  label=""
                  rules={[
                    {
                      required: true,
                      message: "Please provide your Waifu's name",
                    },
                    {
                      max: MAX_NAME_LENGTH,
                      message: `Name can be at most ${MAX_NAME_LENGTH} characters long`,
                    },
                  ]}
                >
                  <Input size="large" placeholder="DeepWaifu’s Name" disabled={minting || paying} />
                </Form.Item>
                <Text strong className="text14">
                  has agreed to provide a loving home for this waifu and promised to keep it safe.
                </Text>
                <Form.Item
                  name="email"
                  label=""
                  rules={[
                    {
                      required: true,
                      message: 'Please provide your email',
                    },
                    {
                      pattern: emailRegex,
                      message: 'Please provide valid email',
                    },
                  ]}
                >
                  <Input size="large" type="email" placeholder="Your Email" disabled={minting || paying} />
                </Form.Item>
                <Text className="text12">Your email will be kept private</Text>
              </Space>
            </Col>
          </Row>
        </Card>
      </CertificateForm>
      <MintButtonWrapper>
        <Space direction="vertical" size="middle">
          <div className="switch">
            <Space direction="horizontal">
              <Image className="shidenLogo" height={36} preview={false} src={'../img/shiden-logo-red.svg'} />
              <BadgeWrapper>
                <Badge count={`Pay ${ethers.utils.formatEther(priceWei)} SDN`} style={{ backgroundColor: 'black' }} />
              </BadgeWrapper>
            </Space>
          </div>
          <Button type="primary" size="large" danger loading={minting || paying} onClick={handleMint}>
            Mint DeepWaifu NFT
          </Button>
          <NftCounter />
        </Space>
      </MintButtonWrapper>
      <CertificateContainer>
        <Certificate
          className="certificate"
          id={certificateParams.id}
          name={certificateParams.name}
          holder={certificateParams.holder}
          waifuDataUrl={state.waifuDataUrl}
        />
      </CertificateContainer>
    </Form>
  );
}

const CertificateForm = styled.div`
  text-align: center;
`;

const BadgeWrapper = styled.div`
  min-width: 110px;
`;

const CertificateImage = styled.div`
  .certImage {
    width: 310px;
    height: 310px;
    margin: 0 3em 1em 0;
  }
  .ant-card-body {
    padding: 1em;
  }
`;

const MintButtonWrapper = styled.div`
  text-align: center;
  margin: 1em 0 2em 0;
`;

const CertificateContainer = styled.div`
  flex-grow: 0;
  flex-shrink: 0;
  width: 640px;
  height: 451px;
  position: absolute;
  left: -9000px;
  top: -9000px;

  .certificate {
    position: absolute;
  }
`;
