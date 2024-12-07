import { Backdrop, CircularProgress } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { RootDivContextType, Loading } from "../../component/provider";

const useLoading = () => {
  const { rootDiv, setRootDiv } = useContext<RootDivContextType>(Loading)

  const [isLoading, setLoadingState] = useState(false);

  const openLoading = () => {
    setLoadingState(true);
  }

  const closeLoading = () => {
    setLoadingState(false);
  }

  useEffect(() => {

    if (document.getElementById("loading")) {
      return
    }

    const div = document.createElement("div")

    div.id = "loading"

    document.body.append(div)
    const root = createRoot(div!)
    setRootDiv(root)

  }, [])

  useEffect(() => {

    if (!rootDiv) {
      return
    }

    rootDiv!.render(
      <Backdrop
        sx={{ color: "var(--text-color)", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    )
  }, [isLoading])

  return [
    openLoading, closeLoading
  ]
}

export { useLoading }
