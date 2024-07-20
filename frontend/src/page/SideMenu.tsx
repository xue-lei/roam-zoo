import { Add } from "@mui/icons-material"
import { Box, Fab } from "@mui/material"

interface SideMenuProps {
  addConnection: () => void
}

const SideMenu = (props: SideMenuProps) => {

  const { addConnection } = props;

  return (
    <Box className="p-t-2 w-10 ml-2 h-90vh">
      <Fab
        size="small"
        color="primary"
        aria-label="add"
        className="!w-8 !h-8 !min-h-8"
        onClick={addConnection} >
        <Add />
      </Fab>
    </Box>
  )
}

export { SideMenu }
