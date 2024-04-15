import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material"
import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { GetConnections, SaveConnection } from "../../wailsjs/go/connection/ConnectionManager"
import { config } from "../../wailsjs/go/models";
import { Connect } from "../../wailsjs/go/main/App";
import { useNotification } from "../hooks/use-notification";

interface ConnectionForwordRef {
  handleClickOpen: () => void
}

const Connection = forwardRef<ConnectionForwordRef>(({ }, ref) => {

  useImperativeHandle(ref, () => ({
    handleClickOpen
  }))

  const [show] = useNotification();

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    getConnections()
  }, [])

  const [connectionMap, setConnectionMap] = useState<{ [key: string]: config.Connection }>({})

  const [selectedKey, setSelectedKey] = useState<string>("")

  const getConnections = async () => {
    const connections = await GetConnections()
    setConnectionMap(connections)
  }

  return (
    <>
      <Box
        className="w-50 ml-2 h-90vh overflow-scroll"
        sx={{
          '::-webkit-scrollbar': {
            display: 'none'
          }
        }}>
        {Object.keys(connectionMap).map(k =>
          <div
            className="p-3 border-solid b-rd-2 border-2 border-rose-4 [&:not(:first-child)]:m-t-2 cursor-pointer"
            key={k}
            onDoubleClick={async (event: React.MouseEvent) => {
              event.stopPropagation()
              const r = await Connect(k)
              if (r) {
                show({ vertical: 'top', horizontal: 'center', message: r })
              }
              setSelectedKey(k)
            }}
          >
            {`${connectionMap[k].host}:${connectionMap[k].port}`}
          </div>
        )}
      </Box>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            const formData = new FormData(event.currentTarget)
            const formJson = Object.fromEntries((formData as any).entries())
            await SaveConnection(new config.Connection(formJson))
            getConnections()
            handleClose()
          },
        }}
      >
        <DialogTitle>Connection</DialogTitle>
        <DialogContent>
          {/* <DialogContentText>
            To subscribe to this website, please enter your email address here. We
            will send updates occasionally.
          </DialogContentText> */}
          <TextField
            autoFocus
            required
            margin="dense"
            id="host"
            name="host"
            label="Host"
            type="text"
            fullWidth
            variant="standard"
            defaultValue={connectionMap[selectedKey]?.host}
          />
          <TextField
            autoFocus
            required
            margin="dense"
            id="port"
            name="port"
            label="Port"
            type="text"
            fullWidth
            variant="standard"
            defaultValue={connectionMap[selectedKey]?.port}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>CANCAL</Button>
          <Button type="submit">SAVE</Button>
        </DialogActions>
      </Dialog>
    </>
  )
})

export { Connection, type ConnectionForwordRef }
