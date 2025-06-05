import {
  Blur,
  Group,
  Image,
  ImageShader,
  SkImage,
} from "@shopify/react-native-skia";
import React, { useImperativeHandle } from "react";
import { useWindowDimensions } from "react-native";
import {
  Easing,
  runOnJS,
  SharedValue,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import FingerLine, { Point } from "./FingerLine";
import {
  MAX_RAIN_LENGTH,
  MAX_RAIN_SPEED,
  MIN_RAIN_LENGTH,
  MIN_RAIN_SPEED,
  MIN_RAIN_WIDTH,
  Rain,
  RAIN_COUNT,
  RAIN_SLOPE,
  RainDropProps,
} from "./Rain";
import { MAX_RAIN_WIDTH } from "./Rain/consts";

// const PADDING_X = 30;
const PADDING_X = 100;
const PADDING_Y = 30;

// const PIXELS_PER_SECOND = 200;
const PIXELS_PER_SECOND = 1000;

export type FoggyWindowRef = {
  foggify: () => void;
  moveCamera: () => void;
};

type FoggyWindowProps = {
  ref?: React.RefObject<FoggyWindowRef>;
  backgroundImage: SkImage;
  fingerLines: SharedValue<Point[]>[];
  currentFingerLine: SharedValue<Point[]>;
};

const FoggyWindow = ({
  ref,
  backgroundImage,
  fingerLines,
  currentFingerLine,
}: FoggyWindowProps) => {
  const { width, height } = useWindowDimensions();
  const fogBlurValue = useSharedValue(0);
  const xValue = useSharedValue(0);

  const imageWidth = backgroundImage?.width() || 1;
  const imageHeight = backgroundImage?.height() || 1;

  const scale = Math.max(
    width / imageWidth,
    (height + PADDING_Y * 2) / imageHeight
  );

  const scaledWidth = imageWidth * scale;
  const scaledHeight = imageHeight * scale;

  const secondImageX = useDerivedValue(() => {
    return xValue.value + scaledWidth - PADDING_X;
  });

  useImperativeHandle(ref, () => {
    return {
      moveCamera,
      foggify,
    };
  });

  const foggify = () => {
    fogBlurValue.value = withTiming(20, {
      duration: 10000,
      easing: Easing.inOut(Easing.ease),
    });
  };

  const moveCamera = () => {
    xValue.value = -PADDING_X;

    const totalDistance = scaledWidth + PADDING_X;
    const duration = (totalDistance / PIXELS_PER_SECOND) * 1000;

    const movePosition = -scaledWidth;

    xValue.value = withTiming(
      movePosition,
      {
        duration: duration,
        easing: Easing.linear,
      },
      (finished) => {
        if (finished) {
          runOnJS(moveCamera)();
        }
      }
    );
  };

  const rainDrops: RainDropProps[] = Array.from({ length: RAIN_COUNT }).map(
    (_, i) => ({
      defaultX: Math.random() * (width + Math.abs(RAIN_SLOPE) * height),
      defaultY: (i / RAIN_COUNT) * height,
      length:
        MIN_RAIN_LENGTH + Math.random() * (MAX_RAIN_LENGTH - MIN_RAIN_LENGTH),
      speed: MAX_RAIN_SPEED + Math.random() * (MAX_RAIN_SPEED - MIN_RAIN_SPEED),
      width: MIN_RAIN_WIDTH + Math.random() * (MAX_RAIN_WIDTH - MIN_RAIN_WIDTH),
      slope: RAIN_SLOPE,
    })
  );

  return (
    <Group>
      <Group>
        <Image
          image={backgroundImage}
          fit="cover"
          x={xValue}
          y={-PADDING_Y}
          width={scaledWidth}
          height={scaledHeight}
        />

        <Image
          image={backgroundImage}
          fit="cover"
          x={secondImageX}
          y={-PADDING_Y}
          width={scaledWidth}
          height={scaledHeight}
        />

        <Blur blur={fogBlurValue} />
      </Group>

      <Group>
        <FingerLine line={currentFingerLine}>
          <ImageShader
            image={backgroundImage}
            fit="cover"
            x={xValue}
            y={-PADDING_Y}
            width={scaledWidth}
            height={scaledHeight}
          />
        </FingerLine>
        <FingerLine line={currentFingerLine}>
          <ImageShader
            image={backgroundImage}
            fit="cover"
            x={secondImageX}
            y={-PADDING_Y}
            width={scaledWidth}
            height={scaledHeight}
          />
        </FingerLine>
      </Group>

      {fingerLines.map((fingerLine, index) => {
        return (
          <Group key={index}>
            <FingerLine line={fingerLine}>
              <ImageShader
                image={backgroundImage}
                fit="cover"
                x={xValue}
                y={-PADDING_Y}
                width={scaledWidth}
                height={scaledHeight}
              />
            </FingerLine>
            <FingerLine line={fingerLine}>
              <ImageShader
                image={backgroundImage}
                fit="cover"
                x={secondImageX}
                y={-PADDING_Y}
                width={scaledWidth}
                height={scaledHeight}
              />
            </FingerLine>
          </Group>
        );
      })}

      <Rain rainDrops={rainDrops} />
    </Group>
  );
};

export default FoggyWindow;
