import { FC, PropsWithChildren, useLayoutEffect, useState } from "react";
import { Provider } from "@react-spectrum/provider";
import { theme } from "@react-spectrum/theme-default";
import { useNonNullableContext } from "../../hooks/useNonNullableContext";
import { audioPlayerStateContext } from "../AudioPlayer/Context/StateContext";
import { DOMRefValue } from "@react-types/shared";
import { ProviderProps } from "@react-types/provider";
import React from "react";

export interface SpectrumProviderProps {
  rootContainerProps?: Omit<
    ProviderProps & React.RefAttributes<DOMRefValue<HTMLDivElement>>,
    "children"
  >;
}

export const SpectrumProvider: FC<PropsWithChildren<SpectrumProviderProps>> = ({
  children,
  rootContainerProps,
}) => {
  const { playerPlacement: contextPlayerPlacement } = useNonNullableContext(
    audioPlayerStateContext
  );
  const [placementState, setPlacementState] = useState<{
    bottom?: number;
    top?: number;
    left?: number;
    right?: number;
  }>();

  // Extract className and UNSAFE_className to merge them and avoid passing className to Provider
  const { className, UNSAFE_className, ...otherRootProps } = (rootContainerProps || {}) as any;
  const mergedClassName = `rm-audio-player-provider ${UNSAFE_className || ""} ${className || ""}`.trim();

  useLayoutEffect(() => {
    if (contextPlayerPlacement) {
      const placementValidation = () => {
        switch (contextPlayerPlacement) {
          case "bottom":
            return { bottom: 0 };
          case "top":
            return { top: 0 };
          case "bottom-left":
            return { bottom: 0, left: 0 };
          case "bottom-right":
            return { bottom: 0, right: 0 };
          case "top-left":
            return { top: 0, left: 0 };
          case "top-right":
            return { top: 0, right: 0 };
          default:
            break;
        }
      };
      setPlacementState(placementValidation());
    }
  }, [contextPlayerPlacement]);

  return (
    <Provider
      theme={theme}
      colorScheme="dark"
      width={"100%"}
      position={
        contextPlayerPlacement === "static" || !contextPlayerPlacement
          ? "static"
          : "fixed"
      }
      UNSAFE_className={mergedClassName}
      {...placementState}
      {...otherRootProps}
    >
      {children}
    </Provider>
  );
};
