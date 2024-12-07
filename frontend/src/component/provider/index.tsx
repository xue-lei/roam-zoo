import { createContext } from "react";
import { Root } from "react-dom/client";

interface RootDivContextType {
  rootDiv: Root | null,
  setRootDiv: (value: Root) => void
}


const MessageContext = createContext<RootDivContextType>({ rootDiv: null, setRootDiv: () => { } })

const Loading = createContext<RootDivContextType>({ rootDiv: null, setRootDiv: () => { } })

export { MessageContext, Loading, type RootDivContextType }
