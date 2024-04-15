import { Snackbar, SnackbarOrigin } from "@mui/material"
import { useEffect, useState } from "react"
import { createRoot, Root } from "react-dom/client";

interface State extends SnackbarOrigin {
  open?: boolean;
  message: string;
}

const useNotification = () => {

  const [rootDiv, setRootDiv] = useState<Root | null>(null)

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

    const div = document.createElement("div")
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
