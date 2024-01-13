import { useEffect, useState } from 'react';
import './App.css';
import { GetRootNodes } from "../wailsjs/go/main/App";

const App = () => {
    const [rootNodes, setRootNodes] = useState<string[]>();

    useEffect(() => {
        GetRootNodes().then(ns => setRootNodes(ns));
    }, [])

    return (
        <div id="App">
            <div id="result" className="result">
                {rootNodes?.map(t =>
                    <div key={t} className="mt-2 mb-2">
                        {t}
                    </div>
                )}
            </div>
        </div>
    )
}

export default App
