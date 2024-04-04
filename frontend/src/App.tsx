import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { GetNodes } from "../wailsjs/go/main/App";
import './App.css';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';

interface Node {
    Key: string,
    Path: string,
    Name: string,
    Children: Array<Node>
}

const App = () => {
    const [rootNodes, setRootNodes] = useState<Array<Node>>();
    const [expandedNodes, setExpandedNodes] = useState<string[]>([]);


    useEffect(() => {
        GetNodes("/").then(ns => {
            if (ns.length > 0) { setRootNodes(ns) }
        });
    }, [])


    useEffect(() => {
        console.log(rootNodes)
    }, [rootNodes])


    const loadChildren = (path: string) => {
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

    return (
        <div id="App">
            <Box>
                setting
            </Box>
            <Box className="flex">
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
                                label={<div className="text-left">{n.Name}</div>}
                                onClick={() => loadChildren(n.Path)}>
                                {n?.Children?.map(nc =>
                                    <TreeItem
                                        key={nc.Key}
                                        itemId={nc.Path}
                                        label={<div className="text-left">{nc.Name}</div>}
                                    />
                                )}
                            </TreeItem>
                        )}
                    </SimpleTreeView>
                </Box>
                <Box className="ml-5">
                    work
                </Box>
            </Box>
        </div >
    )
}

export default App
