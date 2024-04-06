import './App.css';
import { Box } from "@mui/material"
import { MenuTree } from "./page/MenuTree"
import { GetNodeInfo } from "../wailsjs/go/main/App";
import { useState } from "react";

const App = () => {

    const [nodeInfo, setNodeInfo] = useState("")

    const setSelectNode = async (path: string) => {
        const data = await GetNodeInfo(path);
        setNodeInfo(data)
    }

    return (
        <div id="App">
            <Box sx={{ "--wails-draggable": "drag" }}>
                setting
            </Box>
            <Box className="flex">
                <MenuTree setSelectNode={setSelectNode} />
                <Box className="ml-5">
                    {nodeInfo}
                </Box>
            </Box>
        </div >
    )
}

export default App
