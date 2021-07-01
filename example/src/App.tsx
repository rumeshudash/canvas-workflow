import React, { useState } from 'react'

import CanvasWorkflow from 'canvas-workflow'
import { CanvasData } from 'canvas-workflow/dist/Dtos/canvas.dtos'
import 'canvas-workflow/dist/index.css'

const App = () => {
    const [ data, setData ] = useState<CanvasData>({
        components:[
            { 
                type: 'box',
                title: 'Begin',
                description: 'Begin',
                x: 100,
                y: 100,
                w: 150,
                h: 100,
                fillColor: '#ffffff',
                lineWidth: 1,
                borderRadius: 2,
            }
        ]
    });

    const dataChangeHandle = ( data: CanvasData ) => {
        setData( data );
    }

    return (
        <div>
            <CanvasWorkflow mode='editor' data={data} onDataChange={dataChangeHandle} />
        </div>
    )
}

export default App
