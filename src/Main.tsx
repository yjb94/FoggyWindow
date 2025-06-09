import { Canvas, useImage } from "@shopify/react-native-skia";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS, SharedValue, useSharedValue } from "react-native-reanimated";
import { Point } from "./components/FingerLine";
import FoggyWindow, { FoggyWindowRef } from "./components/FoggyWindow";

const START_DELAY = 1000;
const FADE_DURATION = 2000;

const Main = () => {
  const backgroundImage = useImage(require("./assets/night.jpg"));

  const windowRef = useRef<FoggyWindowRef>(null);

  const lineIndex = useSharedValue(0);
  const [fingerLines, setFingerLines] = useState<SharedValue<Point[]>[]>([]);
  const currentFingerLine = useSharedValue<Point[]>([]);

  useEffect(() => {
    if (!windowRef.current) return;

    windowRef.current.foggify();

    setTimeout(() => {
      windowRef.current.moveCamera();
    }, START_DELAY);
  }, [windowRef, backgroundImage]);

  useEffect(() => {
    currentFingerLine.value = [];
  }, [fingerLines]);

  const gesture = Gesture.Pan()
    .onBegin((e) => {
      currentFingerLine.value = [
        {
          x: e.x,
          y: e.y,
          timestamp: Date.now(),
        },
      ];
    })
    .onUpdate((e) => {
      currentFingerLine.value = [
        ...currentFingerLine.value,
        {
          x: e.x,
          y: e.y,
          timestamp: Date.now(),
        },
      ];
    })
    .onEnd(() => {
      "worklet";
      lineIndex.value++;
      runOnJS(setFingerLines)([...fingerLines, currentFingerLine]);
    });

  return (
    <GestureDetector gesture={gesture}>
      <Canvas style={styles.container}>
        <FoggyWindow
          ref={windowRef}
          fingerLines={fingerLines}
          currentFingerLine={currentFingerLine}
          backgroundImage={backgroundImage}
        />
      </Canvas>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export { Main };
