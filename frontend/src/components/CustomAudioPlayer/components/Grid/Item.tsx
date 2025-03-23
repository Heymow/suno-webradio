import { View, ViewProps } from "@react-spectrum/view";
import React, { forwardRef } from "react";
import { DOMRefValue } from "@react-types/shared";

export interface GridItemProps extends Omit<ViewProps<any>, "children"> {
  visible?: boolean;
  children: React.ReactNode;
}

export const GridItem = forwardRef<
  React.RefAttributes<DOMRefValue<HTMLElement>>,
  GridItemProps
>(({ children, visible = true, ...viewProps }, ref) => {
  return (
    <View
      justifySelf={"center"}
      padding={visible ? "0 5px" : undefined}
      ref={ref as any}
      {...viewProps}
    >
      {visible && children}
    </View>
  );
});
GridItem.displayName = "GridItem";
