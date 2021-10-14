import { useEffect, useState } from 'react';
import { Typography } from 'antd';

import { SECOND_MILLIS } from '../../constants';

const { Text } = Typography;

export default function NftCounter() {
  const [itemsLeft, setItemsLeft] = useState(0);

  return (
    <Text className="text14">
      Hurry up, there's only <strong> {itemsLeft} NFTs left to mint!</strong>
    </Text>
  );
}
