import { createContext } from "react";

export const ChiaWalletContext = createContext({
  connected: false,
  address: "",
  setChiaWalletContext: (_: any) => {},
})
