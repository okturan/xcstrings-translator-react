import { useContext } from "react";
import { StringsContext } from "./context";

export const useStrings = () => {
  const context = useContext(StringsContext);
  if (!context) {
    throw new Error("useStrings must be used within a StringsProvider");
  }
  return context;
};
