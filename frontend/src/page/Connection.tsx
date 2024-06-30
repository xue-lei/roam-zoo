import { Backdrop, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from "@mui/material"
import { forwardRef, useEffect, useImperativeHandle, useState, MouseEventHandler } from "react"
import { DeleteConnection, GetConnections, SaveConnection } from "../../wailsjs/go/connection/ConnectionManager"
import { config } from "../../wailsjs/go/models";
import { Connect } from "../../wailsjs/go/main/App";
import { useNotification } from "../hooks/use-notification";
import { ContextMenuHoc, type ContextMenuPropsItem } from "../component/context-menu";

interface ConnectionForwordRef {
  handleClickOpen: () => void
}

const Connection = forwardRef<ConnectionForwordRef>(({ }, ref) => {

  useImperativeHandle(ref, () => ({
    handleClickOpen,
  }))

  const [show] = useNotification();

  const [open, setOpen] = useState(false);

  const [openBackdrop, setOpenBackdrop] = useState(false);


  const handleClickOpen = () => {
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
  }

  useEffect(() => {
    getConnections()
  }, [])

  const [connectionMap, setConnectionMap] = useState<{ [key: string]: config.Connection }>({})

  const [selectedKey, setSelectedKey] = useState<string>("")

  const getConnections = async () => {
    const connections = await GetConnections()
    setConnectionMap(connections)
  }

  const ContextMenu = ContextMenuHoc(
    Object.keys(connectionMap).map(k => {
      const ChildrenItem = (props: { onContextMenu: MouseEventHandler }) =>
        <div
          onContextMenu={props.onContextMenu}
          className="[&:not(:first-child)]:m-t-2 p-3 border-solid b-rd-2 border-2 border-rose-4  cursor-pointer select-none"
          onDoubleClick={async (event: React.MouseEvent) => {
            event.stopPropagation()
            setOpenBackdrop(true)
            const r = await Connect(k)
            setOpenBackdrop(false)
            if (r) {
              show({ vertical: 'top', horizontal: 'center', message: r })
              return;
            }
            setSelectedKey(k)
          }}
        >
          {`${connectionMap[k].host}:${connectionMap[k].port}`}
        </div>
      return { k, ChildrenItem }
    })
  )

  return (
    <>
      <Box
        className="w-50 ml-2 h-90vh overflow-scroll"
        sx={{
          '::-webkit-scrollbar': {
            display: 'none'
          }
        }}>
        <ContextMenu
          menus={[
            {
              key: "DELETE",
              node: ({ k, close }: ContextMenuPropsItem) =>
                <MenuItem
                  onClick={async () => {
                    if (k) {
                      await DeleteConnection(k)
                      getConnections()
                    } else {
                      close()
                    }
                  }}>
                  DELETE
                </MenuItem>
            }
          ]}
        />
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
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={openBackdrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  )
})

export { Connection, type ConnectionForwordRef }
