import React, { useEffect, useState } from 'react'

import CanvasWorkflow from 'canvas-workflow'
import { CanvasData } from 'canvas-workflow/dist/Dtos/canvas.dtos'
import 'canvas-workflow/dist/index.css'

const App = () => {
    const [data, setData] = useState<CanvasData>();

    useEffect(() => {
        setData({
            components:[
                { 
                    type: 'box',
                    text: 'Rumesh',
                    x: 100,
                    y: 100,
                    w: 150,
                    h: 100,
                    fillColor: 'red',
                    strokeColor: 'green',
                    lineWidth: 1,
                    borderRadius: 5,
                }
            ]
        })
    }, [])

    const dataChangeHandle = ( data: CanvasData ) => {
        setData( data );
    }

    return (
        <div>
            <CanvasWorkflow mode='editor' data={data} onDataChange={dataChangeHandle} />
            {/* <CanvasWorkflow mode='viewer' data={data} /> */}
        </div>
    )
}

export default App
