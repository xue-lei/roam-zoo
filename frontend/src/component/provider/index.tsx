import { createContext } from "react";
import { Root } from "react-dom/client";

interface MessageContextType {
  value: Root | null,
  setValue: (value: Root) => void
}


const MessageContext = createContext<MessageContextType>({ value: null, setValue: () => { } })

export { MessageContext, type MessageContextType }
