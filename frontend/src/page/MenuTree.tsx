import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { AddNode, DeleteNode, GetNodes, SetWatcherForSelectedNode } from "../../wailsjs/go/main/App";
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { Add, DeleteForever } from '@mui/icons-material';
import { EventsOn } from '../../wailsjs/runtime/runtime';
import { main } from '../../wailsjs/go/models';
import { useLoading } from '../hooks/loading';

interface MenuTreeProps {
  setSelectNode: (path: string) => void
}

interface MenuTreeRef {
}

const MenuTree = forwardRef<MenuTreeRef, MenuTreeProps>((props, ref) => {

  useImperativeHandle(ref, () => ({}))

  const [startLoading, closeLoading] = useLoading();

  const { setSelectNode } = props;

  const [nodeInfoDialog, setNodeInfoDialog] = useState(false);

  const openNodeInfoDialog = () => {
    setNodeInfoDialog(true);
  }

  const closeNodeInfoDialog = () => {
    setNodeInfoDialog(false);
  }

  const [nodes, setNodes] = useState<Array<main.Node>>([new main.Node({
    key: "/",
    path: "/",
    name: "/",
    children: [],
  })]);

  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);

  const [selectedNodePath, setSelectedNodePath] = useState<string>("")

  // 当前点击节点
  useEffect(() => {
    if (!selectedNodePath) {
      return
    }
    // 向父组件传递
    setSelectNode(selectedNodePath)
    // 监听当前节点的子节点
    SetWatcherForSelectedNode(selectedNodePath)
  }, [selectedNodePath])

  // 启动加载
  useEffect(() => {
    // 加载树
    loadChildren("/")
    // 监听子节点改变通知
    EventsOn("childrenNodeChange", async (path: string) => {
      loadChildren(path)
    })
  }, [])

  // 合并新旧子节点数组
  const mergeChildren = (children: Array<main.Node>, ns: Array<main.Node>): Array<main.Node> => {

    const childrenHas = children.filter(c => ns.findIndex(n => c.path === n.path) > -1)
    const nsHas = ns.filter(n => childrenHas.findIndex(c => c.path === n.path) === -1)

    return [...childrenHas, ...nsHas]
  }

  // 加载子路径
  const loadChildren = async (path: string) => {
    // 获取选中的路径的子路径
    const ns = await GetNodes(`${path}`)
    if (path === "/") {
      nodes[0].children = mergeChildren(nodes[0].children, ns)
      if (selectedNodePath !== path) {
        setSelectedNodePath(path)
        setExpandedNodes([path])
      }
    } else {
      const paths = path.split("/");
      let children = nodes[0].children;
      let node = null;
      for (const pathSect of paths.filter(p => p !== "")) {
        node = children.find(r => r.key === pathSect)
        if (node?.children && (node?.children.length !== 0)) {
          children = node.children
        }
      }
      if (node) {
        node.children = mergeChildren(node.children, ns)
      }
    }
    // 设置目录树
    setNodes([...nodes])
  }

  // 选择节点
  const selectNode = async (path: string) => {
    startLoading()
    // 选中的路径
    setSelectedNodePath(path)
    // 加载子节点
    await loadChildren(path)
    // 选中展开
    setExpandedNodes(Array.from(new Set([...expandedNodes, path])))
    closeLoading()
  }

  // 折叠
  const collapse = (path: string) => {
    setExpandedNodes([...expandedNodes.filter(p => p !== path)])
  }

  // 展开
  const expand = (path: string) => {
    setExpandedNodes([...expandedNodes, path])
  }

  // 加载树
  const loadTreeItem = (nodes: Array<main.Node>) => {
    if (!nodes || nodes.length === 0) {
      return
    }
    return nodes?.map(n =>
      <TreeItem
        slots={{
          collapseIcon: () => <ExpandMoreIcon onClick={() => { collapse(n.path) }} />,
          expandIcon: () => <ChevronRightIcon onClick={() => { expand(n.path) }} />
        }}
        key={n.key}
        itemId={n.path}
        label={Label(n.name, n.path)}>
        {loadTreeItem(n.children)}
      </TreeItem>
    )
  }

  // node 显示
  const Label = (name: string, path: string) => {
    return (
      <div className="flex flex-justify-between group">
        <Box onClick={() => selectNode(path)} className="flex-1 text-left">{name}</Box>
        <Box className="flex-content-center group-hover:flex hidden">
          <Add onClick={openNodeInfoDialog} />
          <DeleteForever onClick={(event) => {
            event.stopPropagation()
            DeleteNode(path)
          }} />
        </Box>
      </div>
    )
  }

  return (
    <Box
      className="w-80 ml-2 h-90vh overflow-scroll"
      sx={{
        '::-webkit-scrollbar': {
          display: 'none'
        }
      }}>
      <SimpleTreeView
        className="color-[var(--text-color)]"
        aria-label="node tree navigator"
        expandedItems={expandedNodes}
        selectedItems={selectedNodePath}>
        {loadTreeItem(nodes)}
      </SimpleTreeView>
      <Dialog
        open={nodeInfoDialog}
        onClose={closeNodeInfoDialog}
        PaperProps={{
          component: 'form',
          onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            const formData = new FormData(event.currentTarget)
            const formJson = Object.fromEntries((formData as any).entries())
            formJson['flags'] = Number(formJson['flags'])
            const path = formJson["path"] as string
            if (!path.startsWith("/")) {
              formJson["path"] = (selectedNodePath !== "/" ? selectedNodePath : "") + "/" + path
            }
            console.log(formJson)
            await AddNode(new main.NodeInfo(formJson))
            closeNodeInfoDialog()
          },
        }}
      >
        <DialogTitle>NodeInfo</DialogTitle>
        <DialogContent>
          {/* <DialogContentText>
            To subscribe to this website, please enter your email address here. We
            will send updates occasionally.
          </DialogContentText> */}
          <FormControl
            sx={{ m: 1 }}
            className="!mr-0 !ml-0 w-100% !flex">
            <InputLabel id="demo-multiple-checkbox-label">持久化</InputLabel>
            <Select
              required
              autoFocus
              id="flags"
              name="flags"
              label="持久化"
              defaultValue=""
            >
              <MenuItem value={1}>临时</MenuItem>
              <MenuItem value={2}>永久</MenuItem>
              <MenuItem value={4}>TLL</MenuItem>
            </Select>
          </FormControl>
          <TextField
            autoFocus
            required
            margin="dense"
            id="path"
            name="path"
            label="路径"
            type="text"
            fullWidth
            variant="standard"
            defaultValue=""
          />
          <TextField
            autoFocus
            required
            margin="dense"
            id="info"
            name="info"
            label="内容"
            type="text"
            fullWidth
            variant="standard"
            defaultValue=""
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeNodeInfoDialog}>CANCAL</Button>
          <Button type="submit">SAVE</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
})

export { MenuTree, type MenuTreeRef }
