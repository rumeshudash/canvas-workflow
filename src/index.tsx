import React, { createRef, useEffect, useState } from 'react'
import { BoxComponent, CanvasData } from './Dtos/canvas.dtos';
import { DestroyCanvas, InitCanvas } from './Utils/canvas.utils';
import { IsEqualObject } from './Utils/common.utils';
import Toolbar from './Components/Toolbar/toolbar.component';
import Settings from './Components/Settings/settings.component';
import './styles.scss'

interface Props {
    mode?: 'editor' | 'viewer';
    data?: CanvasData;
    onDataChange?( data: CanvasData ): void;
}

const ConvasWorkflow = ({ mode = 'editor', data = {}, onDataChange }: Props) => {

    const [cwMode, setCwMode] = useState(mode);
    const [cwData, setCwData] = useState<CanvasData>({});

    const canvasRef = createRef<HTMLCanvasElement>();
    const parentRef = createRef<HTMLDivElement>();

    useEffect(() => {
        if( cwMode !== mode ) {
            setCwMode(mode);
        }
        if( ! IsEqualObject( data, cwData ) ) {
            setCwData(data);
        }
    }, [mode, data]);

    useEffect(() => {
        if( canvasRef.current && parentRef.current ) {
            InitCanvas({
                parent: parentRef.current,
                canvas: canvasRef.current,
                mode: cwMode,
                data: cwData,
                onDataChange,
            });
        }

        return () => {
            DestroyCanvas();
        }
    }, [canvasRef, parentRef, cwMode, cwData, cwData.components ])

    const addRandomBox = () => {
        const randomX = Math.floor( Math.random() * ( canvasRef.current && parseInt( canvasRef.current.style.width ) || 100 ) );
        const randomY = Math.floor( Math.random() * ( canvasRef.current && parseInt( canvasRef.current.style.height ) || 100 ) );
        // const randomRadius = Math.floor( Math.random() * 15 );

        const comp: BoxComponent = {
            type: 'box',
            title: 'Random',
            description: 'Random ' + randomX + ':' + randomY,
            x: randomX,
            y: randomY,
            w: 150,
            h: 100,
            fillColor: '#ffffff',
            strokeColor: '#ccc',
            borderRadius: 2,
        }
        setCwData( { ...cwData, components: [ ...cwData?.components || [], comp ] });
    }

    const clearAll = () => {
        setCwData( { ...cwData, components: [] } );
    }

    return (
        <div className={`canvas-workflow`} >
            <Toolbar />
            <div className='cw-wrapper' ref={parentRef}>
                <canvas ref={canvasRef} tabIndex={1}></canvas>
            </div>
            <div>
                <Settings data={cwData} canvasRef={canvasRef} />
                <button onClick={addRandomBox}>Add Random Box</button>
                <button onClick={clearAll}>Clear All</button>
            </div>
        </div>
    )
}

export default ConvasWorkflow;