import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { GetNodes, SetWatcherForSelectedNode } from "../../wailsjs/go/main/App";
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { Add, DeleteForever } from '@mui/icons-material';
import { EventsOn } from '../../wailsjs/runtime/runtime';

interface Node {
  Key: string,
  Path: string,
  Name: string,
  Children: Array<Node>
}

interface MenuTreeProps {
  setSelectNode: (path: string) => void
}

const MenuTree = (props: MenuTreeProps) => {

  const { setSelectNode } = props;

  const [rootNodes, setRootNodes] = useState<Array<Node>>([{
    Key: "/",
    Path: "/",
    Name: "/",
    Children: [],
  }]);

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

  // 加载子路径
  const loadChildren = async (path: string) => {
    // 获取选中的路径的子路径
    const ns = await GetNodes(`${path}`)
    if (path === "/") {
      rootNodes[0].Children = ns
    } else {
      const paths = path.split("/");
      let children = rootNodes[0].Children;
      let node = null;
      for (const pathSect of paths.filter(p => p !== "")) {
        node = children.find(r => r.Key === pathSect)
        if (node?.Children && (node?.Children.length !== 0)) {
          children = node.Children
        }
      }
      if (node) {
        node.Children = ns
      }
    }
    // 设置目录树
    setRootNodes([...rootNodes])
  }

  // 选择节点
  const selectNode = async (path: string) => {
    // 选中的路径
    setSelectedNode(path)
    // 加载子节点
    await loadChildren(path)
    // 选中展开
    setExpandedNodes(Array.from(new Set([...expandedNodes, path])))
    console.log(rootNodes, expandedNodes)
  }

  // 加载树
  const loadTreeItem = (nodes: Array<Node>) => {
    if (!nodes || nodes.length === 0) {
      return
    }
    return nodes?.map(n =>
      <TreeItem
        key={n.Key}
        itemId={n.Path}
        label={Label(n.Name)}
        onClick={() => selectNode(n.Path)}>
        {loadTreeItem(n.Children)}
      </TreeItem>
    )
  }

  // node 显示
  const Label = (name: string) => {
    return (
      <div className="flex flex-justify-between">
        <Box className="text-left">{name}</Box>
        <Box className="flex flex-content-center">
          <Add />
          <DeleteForever />
        </Box>
      </div>
    )
  }

  return (
    <Box
      className="w-80 max-h-screen overflow-scroll"
      sx={{
        '::-webkit-scrollbar': {
          display: 'none'
        }
      }}>
      <SimpleTreeView
        aria-label="file system navigator"
        expandedItems={expandedNodes}
        slots={{ collapseIcon: ExpandMoreIcon, expandIcon: ChevronRightIcon }}
      >
        {loadTreeItem(rootNodes)}
      </SimpleTreeView>
    </Box>
  )
}

export { MenuTree }
