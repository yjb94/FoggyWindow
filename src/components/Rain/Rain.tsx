import { Group } from "@shopify/react-native-skia";
import React from "react";
import { useWindowDimensions } from "react-native";
import RainDrop, { RainDropProps } from "./RainDrop";

const RAIN_COUNT = 50;

const MIN_RAIN_LENGTH = 20;
const MAX_RAIN_LENGTH = 40;

const MIN_RAIN_WIDTH = 1;
const MAX_RAIN_WIDTH = 2;

const MIN_SPEED = 2500;
const MAX_SPEED = 3500;

const SLOPE = -0.1;

export const Rain = () => {
  const { width, height } = useWindowDimensions();

  const rainDrops: RainDropProps[] = Array.from({ length: RAIN_COUNT }).map(
    (_, i) => ({
      defaultX: Math.random() * (width + Math.abs(SLOPE) * height),
      defaultY: (i / RAIN_COUNT) * height,
      length:
        MIN_RAIN_LENGTH + Math.random() * (MAX_RAIN_LENGTH - MIN_RAIN_LENGTH),
      speed: MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED),
      width: MIN_RAIN_WIDTH + Math.random() * (MAX_RAIN_WIDTH - MIN_RAIN_WIDTH),
      slope: SLOPE,
    })
  );

  return (
    <Group>
      {rainDrops.map((rainDrop, index) => (
        <RainDrop key={index} {...rainDrop} />
      ))}
    </Group>
  );
};

export default Rain;
