import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { GetNodes, SetWatcherForSelectedNode } from "../../wailsjs/go/main/App";
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { Add, DeleteForever } from '@mui/icons-material';
import { EventsOn } from '../../wailsjs/runtime/runtime';
import { main } from '../../wailsjs/go/models';

interface MenuTreeProps {
  setSelectNode: (path: string) => void
}

const MenuTree = (props: MenuTreeProps) => {

  const { setSelectNode } = props;

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
          <Add />
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
        aria-label="node tree navigator"
        expandedItems={expandedNodes}>
        {loadTreeItem(nodes)}
      </SimpleTreeView>
    </Box>
  )
}

export { MenuTree }
