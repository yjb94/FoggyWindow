import { Group } from "@shopify/react-native-skia";
import React from "react";
import RainDrop, { RainDropProps } from "./RainDrop";

type RainProps = {
  rainDrops: RainDropProps[];
};

export const Rain = ({ rainDrops }: RainProps) => {
  return (
    <Group>
      {rainDrops.map((rainDrop, index) => (
        <RainDrop key={index} {...rainDrop} />
      ))}
    </Group>
  );
};

export default Rain;
