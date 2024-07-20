import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField
} from "@mui/material"
import { forwardRef, useEffect, useImperativeHandle, useState, MouseEventHandler } from "react"
import { DeleteConnection, GetConnections, SaveConnection } from "../../wailsjs/go/connection/ConnectionManager"
import { config, connection } from "../../wailsjs/go/models";
import { Connect } from "../../wailsjs/go/main/App";
import { useNotification } from "../hooks/use-notification";
import { ContextMenuHoc, type ContextMenuPropsItem } from "../component/context-menu";

interface ConnectionRef {
  openConnectInfoDialog: () => void
}

const Connection = forwardRef<ConnectionRef>(({ }, ref) => {

  useImperativeHandle(ref, () => ({
    openConnectInfoDialog,
  }))

  const [show] = useNotification();

  const [connectInfoDialog, setConnectInfoDialog] = useState(false);

  const [openBackdrop, setOpenBackdrop] = useState(false);

  const openConnectInfoDialog = () => {
    setSelectedCfg(new connection.ConnectionInfo({
      key: "",
      config: {
        host: "",
        port: ""
      }
    }))
    setConnectInfoDialog(true);
  }

  const closeConnectInfoDialog = () => {
    setConnectInfoDialog(false);
  }

  useEffect(() => {
    getConnections()
  }, [])

  const [connectionConfig, setConnectionConfig] = useState<connection.ConnectionInfo[]>([])

  const [selectedCfg, setSelectedCfg] = useState<connection.ConnectionInfo>()

  const getConnections = async () => {
    const connections = await GetConnections()
    setConnectionConfig(connections)
  }

  const ContextMenu = ContextMenuHoc(
    connectionConfig.map(cfg => {
      const ChildrenItem = (props: { onContextMenu: MouseEventHandler }) =>
        <div
          onContextMenu={props.onContextMenu}
          className={`${cfg.connected ? "bg-red" : ""} color-[var(--text-color)] shadow shadow-blueGray [&:not(:first-child)]:m-t-2 p-3 b-rd-2 cursor-pointer select-none`}
          onDoubleClick={async (event: React.MouseEvent) => {
            event.stopPropagation()
            setOpenBackdrop(true)
            const r = await Connect(cfg.key)
            setOpenBackdrop(false)
            if (r) {
              show({ vertical: 'top', horizontal: 'center', message: r })
              return;
            }
            getConnections()
          }}
        >
          {`${cfg.config.host}:${cfg.config.port}`}
        </div>
      return { k: cfg.key, ChildrenItem }
    })
  )

  return (
    <>
      <Box
        className="p-2 w-50 ml-2 h-90vh overflow-scroll"
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
        open={connectInfoDialog}
        onClose={closeConnectInfoDialog}
        PaperProps={{
          component: 'form',
          onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            const formData = new FormData(event.currentTarget)
            const formJson = Object.fromEntries((formData as any).entries())
            await SaveConnection(new config.Connection(formJson))
            getConnections()
            closeConnectInfoDialog()
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
            defaultValue={selectedCfg?.config?.host}
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
            defaultValue={selectedCfg?.config?.port}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConnectInfoDialog}>CANCAL</Button>
          <Button type="submit">SAVE</Button>
        </DialogActions>
      </Dialog>
      <Backdrop
        sx={{ color: "var(--text-color)", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={openBackdrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  )
})

export { Connection, type ConnectionRef }
