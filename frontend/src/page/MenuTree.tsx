import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { GetNodes } from "../../wailsjs/go/main/App";
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { Add, DeleteForever } from '@mui/icons-material';

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

  useEffect(() => {
    loadChildren("/")
  }, [])

  // 加载子路径
  const loadChildren = async (path: string) => {
    // 选中的路径
    setSelectNode(path)
    // 获取选中的路径的子路径
    const ns = await GetNodes(`${path}`)
    if (path === "/") {
      rootNodes[0].Children = ns
    } else {
      const paths = path.split("/");
      let children = rootNodes[0].Children;
      for (const pathSect of paths.filter(p => p !== "")) {
        const node = children.find(r => r.Key === pathSect)
        if (node?.Children && (node?.Children.length !== 0)) {
          children = node.Children
          continue
        }
        node!.Children = ns
      }
    }
    // 设置目录树
    setRootNodes([...rootNodes])
    // 选中展开
    setExpandedNodes([...expandedNodes, path])
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
        onClick={() => loadChildren(n.Path)}>
        {loadTreeItem(n.Children)}
      </TreeItem>
    )
  }

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
