import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, TextField } from '@mui/material';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { AddNode, GetNodes, SetWatcherForSelectedNode } from "../../wailsjs/go/main/App";
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { Add, DeleteForever } from '@mui/icons-material';
import { EventsOn } from '../../wailsjs/runtime/runtime';
import { main } from '../../wailsjs/go/models';

interface MenuTreeProps {
  setSelectNode: (path: string) => void
}

interface MenuTreeRef {
}

const MenuTree = forwardRef<MenuTreeRef, MenuTreeProps>((props, ref) => {

  useImperativeHandle(ref, () => ({
  }))

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

  const [selectedNode, setSelectedNode] = useState<string>()

  // 当前点击节点
  useEffect(() => {
    if (!selectedNode) {
      return
    }
    // 向父组件传递
    setSelectNode(selectedNode)
    // 监听当前节点的子节点
    SetWatcherForSelectedNode(selectedNode)
  }, [selectedNode])

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
    // 选中的路径
    setSelectedNode(path)
    // 加载子节点
    await loadChildren(path)
    // 选中展开
    setExpandedNodes(Array.from(new Set([...expandedNodes, path])))
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
          <DeleteForever />
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
        expandedItems={expandedNodes}>
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
            console.log(formData, formJson)
            formJson['flags'] = Number(formJson['flags'])
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
          <TextField
            autoFocus
            required
            margin="dense"
            id="path"
            name="path"
            label="Path"
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
            label="Info"
            type="text"
            fullWidth
            variant="standard"
            defaultValue=""
          />
          <Select
            autoFocus
            id="flags"
            name="flags"
            label="Flags"
            className="w-100%"
            defaultValue={1}
          >
            <MenuItem value={1}>临时</MenuItem>
          </Select>
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
