import {
  Blur,
  Group,
  Image,
  SkPath,
  useImage,
} from "@shopify/react-native-skia";
import React, { useEffect, useImperativeHandle } from "react";
import { useWindowDimensions } from "react-native";
import {
  Easing,
  runOnJS,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const PADDING_X = 30;
const PADDING_Y = 30;

const PIXELS_PER_SECOND = 200; // 초당 100픽셀 이동

export type WindowRef = {
  foggify: () => void;
  moveCamera: () => void;
};

type WindowProps = {
  ref?: React.RefObject<WindowRef>;
  fogPath: SkPath;
  onReady?: () => void;
};

const Window = ({ ref, fogPath, onReady }: WindowProps) => {
  const { width, height } = useWindowDimensions();
  const fogBlurValue = useSharedValue(0);
  const xValue = useSharedValue(0);

  const backgroundImage = useImage(require("./assets/city.jpg"));

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

  useEffect(() => {
    if (backgroundImage) {
      onReady?.();
    }
  }, [backgroundImage]);

  useImperativeHandle(ref, () => {
    return {
      moveCamera,
      foggify,
    };
  });

  const foggify = () => {
    fogBlurValue.value = withTiming(10, { duration: 10000 });
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

  return (
    <Group>
      <Image
        image={backgroundImage}
        fit="cover"
        x={xValue}
        y={-PADDING_Y}
        width={scaledWidth}
        height={scaledHeight}
      >
        <Blur blur={fogBlurValue} />
      </Image>

      <Image
        image={backgroundImage}
        fit="cover"
        x={secondImageX}
        y={-PADDING_Y}
        width={scaledWidth}
        height={scaledHeight}
      >
        <Blur blur={fogBlurValue} />
      </Image>

      <Group clip={fogPath}>
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
      </Group>
    </Group>
  );
};

export default Window;
