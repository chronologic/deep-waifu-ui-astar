import { Typography } from 'antd';

import { useDeepWaifuContract } from '../../hooks';

const { Text } = Typography;

export default function NftCounter() {
  const { itemsLeft } = useDeepWaifuContract();

  if (itemsLeft < 0) {
    return <div />;
  }

  return (
    <Text className="text14">
      Hurry up, there's only <strong> {itemsLeft} NFTs left to mint!</strong>
    </Text>
  );
}
