import {
  Blur,
  Canvas,
  Group,
  Image,
  Skia,
  useCanvasRef,
  useImage,
} from "@shopify/react-native-skia";
import React, { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  Easing,
  runOnJS,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const PADDING_X = 30;
const PADDING_Y = 30;

const START_DELAY = 1000;

const PIXELS_PER_SECOND = 200; // 초당 100픽셀 이동

const Main = () => {
  const { width, height } = useWindowDimensions();
  const fogBlurValue = useSharedValue(0);
  const [fogPath, setFogPath] = useState(Skia.Path.Make());
  const canvasRef = useCanvasRef();
  const backgroundImage = useImage(require("./assets/city.jpg"));
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

  useEffect(() => {
    foggify();

    setTimeout(() => {
      moveCamera();
    }, START_DELAY);
  }, [backgroundImage]);

  const clearFogAtPoint = (x: number, y: number) => {
    const path = Skia.Path.Make();
    path.addCircle(x, y, 40);
    setFogPath((prevPath) => {
      const newPath = Skia.Path.Make();
      newPath.addPath(prevPath);
      newPath.addPath(path);
      return newPath;
    });
  };

  const gesture = Gesture.Pan().onUpdate((e) => {
    runOnJS(clearFogAtPoint)(e.x, e.y);
  });

  return (
    <GestureDetector gesture={gesture}>
      <Canvas style={{ flex: 1 }} ref={canvasRef}>
        {backgroundImage && (
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
        )}
      </Canvas>
    </GestureDetector>
  );
};

export { Main };
