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

  const [rootNodes, setRootNodes] = useState<Array<Node>>();
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);


  useEffect(() => {
    GetNodes("/").then(ns => {
      if (ns.length > 0) { setRootNodes(ns) }
    });
  }, [])

  const loadChildren = (path: string) => {
    setSelectNode(path)
    GetNodes(`${path}`).then(ns => {
      if (!rootNodes) {
        return
      }
      if (expandedNodes.includes(path)) {
        setExpandedNodes(expandedNodes.filter(e => e !== path))
        return
      }
      const i = rootNodes?.findIndex(r => r.Path === path)
      rootNodes[i].Children = ns
      setRootNodes([...rootNodes])
      setExpandedNodes([...expandedNodes, path])
    });
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
        {rootNodes?.map(n =>
          <TreeItem
            key={n.Key}
            itemId={n.Path}
            label={Label(n.Name)}
            onClick={() => loadChildren(n.Path)}>
            {n?.Children?.map(nc =>
              <TreeItem
                key={nc.Key}
                itemId={nc.Path}
                onClick={() => setSelectNode(nc.Path)}
                label={Label(nc.Name)}
              />
            )}
          </TreeItem>
        )}
      </SimpleTreeView>
    </Box>
  )
}

export { MenuTree }
