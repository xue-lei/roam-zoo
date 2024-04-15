import './App.css';
import { Box } from "@mui/material"
import { MenuTree } from "./page/MenuTree"
import { GetNodeInfo } from "../wailsjs/go/main/App";
import { useRef, useState } from "react";
import { Close } from '@mui/icons-material';
import { Quit } from '../wailsjs/runtime/runtime';
import { Connection, type ConnectionForwordRef } from './page/Connection';
import { SideMenu } from './page/SideMenu';

const App = () => {

    const connectionRef = useRef<ConnectionForwordRef>(null)

    const [nodeInfo, setNodeInfo] = useState("")

    const setSelectNode = async (path: string) => {
        const data = await GetNodeInfo(path);
        setNodeInfo(data)
    }

    return (
        <div id="App">
            <Box
                className="flex flex-content-center flex-justify-end p-1"
                sx={{ "--wails-draggable": "drag" }}
            >
                <Close
                    className="hover:text-amber cursor-pointer"
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
    )
}

export default App
