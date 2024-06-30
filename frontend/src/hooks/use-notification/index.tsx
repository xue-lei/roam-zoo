import { Snackbar, SnackbarOrigin } from "@mui/material"
import { useContext, useEffect, useState } from "react"
import { createRoot } from "react-dom/client";
import { MessageContext, MessageContextType } from "../../component/provider";

interface State extends SnackbarOrigin {
  open?: boolean;
  message: string;
}

const useNotification = () => {

  const { value: rootDiv, setValue: setRootDiv } = useContext<MessageContextType>(MessageContext)

  const [state, setState] = useState<State>({
    open: false,
    vertical: 'top',
    horizontal: 'center',
    message: "",
  })

  const { vertical, horizontal, open, message } = state;

  const show = (newState: State) => {
    setState({ ...newState, open: true });
  }

  const handleClose = () => {
    setState({ ...state, open: false });
  }

  useEffect(() => {

    if (document.getElementById("message-notify")) {
      return
    }

    const div = document.createElement("div")

    div.id = "message-notify"

    document.body.append(div)
    const root = createRoot(div!)
    setRootDiv(root)

  }, [])

  useEffect(() => {

    if (!rootDiv) {
      return
    }

    rootDiv!.render(
      <Snackbar
        autoHideDuration={1000}
        anchorOrigin={{ vertical, horizontal }}
        open={open}
        onClose={handleClose}
        message={message}
        key={vertical + horizontal}
      />
    )
  }, [open])

  return [
    show
  ]
}

export { useNotification }
