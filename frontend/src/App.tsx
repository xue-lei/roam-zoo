import './App.css';
import { Box } from "@mui/material"
import { MenuTree } from "./page/MenuTree"
import { GetNodeInfo } from "../wailsjs/go/main/App";
import { useRef, useState } from "react";
import { Close } from '@mui/icons-material';
import { Quit } from '../wailsjs/runtime/runtime';
import { Connection, ConnectionRef } from './page/Connection';
import { SideMenu } from './page/SideMenu';
import { Loading, MessageContext } from './component/provider';
import { Root } from 'react-dom/client';
import { Tree } from './component/tree';

const App = () => {

    const [messageRootDiv, setMessageRootDiv] = useState<Root | null>(null)

    const [loadingRootDiv, setLoadingRootDiv] = useState<Root | null>(null)

    const connectionRef = useRef<ConnectionRef>(null)

    const [nodeInfo, setNodeInfo] = useState("")

    const setSelectNode = async (path: string) => {
        const data = await GetNodeInfo(path);
        setNodeInfo(data)
    }

    return (
        <MessageContext.Provider value={{ rootDiv: messageRootDiv, setRootDiv: setMessageRootDiv }}>
            <Loading.Provider value={{ rootDiv: loadingRootDiv, setRootDiv: setLoadingRootDiv }}>
                <div id="App">
                    <Box
                        className="flex flex-justify-between p-[6px_6px]"
                        sx={{ "--wails-draggable": "drag" }}
                    >
                        <div className="flex color-black">
                            <Tree />
                            home
                        </div>
                        <Close
                            className="color-[var(--text-color)] hover:text-amber hover:transform-rotate-90 !transition-transform-200 cursor-pointer"
                            onClick={Quit}
                        />
                    </Box>
                    <Box className="flex">
                        <SideMenu addConnection={() => { connectionRef.current!.openConnectInfoDialog() }} />
                        <Connection ref={connectionRef} />
                        <MenuTree setSelectNode={setSelectNode} />
                        <Box className="p-t-2 ml-5 color-[var(--text-color)]">
                            {nodeInfo}
                        </Box>
                    </Box>
                </div >
            </Loading.Provider >
        </MessageContext.Provider>
    )
}

export default App
