import './App.css';
import { Box } from "@mui/material"
import { MenuTree } from "./page/MenuTree"
import { GetNodeInfo } from "../wailsjs/go/main/App";
import { useRef, useState } from "react";
import { Close } from '@mui/icons-material';
import { Quit } from '../wailsjs/runtime/runtime';
import { Connection, type ConnectionForwordRef } from './page/Connection';
import { SideMenu } from './page/SideMenu';
import { MessageContext } from './component/provider';
import { Root } from 'react-dom/client';

const App = () => {

    const [messageValue, setMessageValue] = useState<Root | null>(null)

    const connectionRef = useRef<ConnectionForwordRef>(null)

    const [nodeInfo, setNodeInfo] = useState("")

    const setSelectNode = async (path: string) => {
        const data = await GetNodeInfo(path);
        setNodeInfo(data)
    }

    return (
        <MessageContext.Provider value={{ value: messageValue, setValue: setMessageValue }}>
            <div id="App">
                <Box
                    className="flex flex-content-center flex-justify-end p-[6px_6px]"
                    sx={{ "--wails-draggable": "drag" }}
                >
                    <Close
                        className="hover:text-amber hover:transform-rotate-90 !transition-transform-200 cursor-pointer"
                        onClick={Quit}
                    />
                </Box>
                <Box className="flex">
                    <SideMenu addConnection={() => { connectionRef.current!.handleClickOpen() }} />
                    <Connection ref={connectionRef} />
                    <MenuTree setSelectNode={setSelectNode} />
                    <Box className="ml-5">
                        {nodeInfo}
                    </Box>
                </Box>
            </div >
        </MessageContext.Provider>
    )
}

export default App
