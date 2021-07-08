import React, { useEffect, useState } from 'react'

import CanvasWorkflow from 'canvas-workflow'
import { CanvasData } from 'canvas-workflow/dist/Dtos/canvas.dtos'
import 'canvas-workflow/dist/index.css'

const App = () => {
    const [ data, setData ] = useState<CanvasData>({});

    useEffect(() => {
        setData( { ...data, height: window.innerHeight } );
        // eslint-disable-next-line
    }, []);

    const dataChangeHandle = ( data: CanvasData ) => {
        setData( data );
        // console.log( data );
    }

    return (
        <div>
            <CanvasWorkflow mode='editor' data={data} onDataChange={dataChangeHandle} />
        </div>
    )
}

export default App
