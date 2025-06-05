import { useEffect } from "react";

export const useEffectOnce = (effect: () => void) => {
  useEffect(effect, []);
};
