import { Add } from "@mui/icons-material"
import { Box } from "@mui/material"
import { useNotification } from "../hooks/use-notification";

interface SideMenuProps {
  addConnection: () => void
}

const SideMenu = (props: SideMenuProps) => {

  const { addConnection } = props;

  const [show] = useNotification()

  return (
    <Box className="w-8 ml-2 h-90vh">
      <Add
        className="border-2 border-solid border-white"
        sx={{ fontSize: 14 }}
        onClick={addConnection}
      />
    </Box>
  )
}

export { SideMenu }
