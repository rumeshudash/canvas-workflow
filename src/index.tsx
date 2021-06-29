import React, { createRef, useEffect, useState } from 'react'
import { BoxComponent, CanvasData } from './Dtos/canvas.dtos';
import './styles.scss'
import { DestroyCanvas, InitCanvas } from './Utils/canvas.utils';
import { log } from './Utils/common.utils';

interface Props {
    mode?: 'editor' | 'viewer';
    defaultData?: CanvasData;
    data?: CanvasData;
    onDataChange?( data: CanvasData ): void;
}

const ConvasWorkflow = ({ mode = 'editor', defaultData, data, onDataChange }: Props) => {

    const [cwMode, setCwMode] = useState(mode);
    const [cwData, setCwData] = useState<CanvasData | undefined>(data || defaultData);

    const canvasRef = createRef<HTMLCanvasElement>();
    const parentRef = createRef<HTMLDivElement>();

    useEffect(() => {
        setCwMode(mode);
        setCwData(data);
    }, [mode, data])

    useEffect(() => {
        if( canvasRef.current && parentRef.current ) {
            InitCanvas({
                parent: parentRef.current,
                canvas: canvasRef.current,
                mode: cwMode,
                data: cwData,
            });
        }

        return () => {
            DestroyCanvas();
        }
    }, [canvasRef, parentRef, cwMode, cwData ])

    const addRandomBox = () => {
        const randomX = Math.floor( Math.random() * ( canvasRef.current?.width || 100 ) );
        const randomY = Math.floor( Math.random() * ( canvasRef.current?.height || 100 ) );
        // const randomRadius = Math.floor( Math.random() * 15 );

        const comp: BoxComponent = {
            type: 'box',
            x: randomX,
            y: randomY,
            w: 100,
            h: 100,
            fillColor: '#ffffff',
            strokeColor: '#ccc',
            title: 'Random',
            description: 'Random ' + randomX + ':' + randomY,
            borderRadius: 2,
        }
        setCwData( { ...cwData, components: [ ...cwData?.components || [], comp ] })
    }

    const clearAll = () => {
        setCwData( { ...cwData, components: [] } );
    }

    return (
        <div className={`canvas-workflow`} >
            <div className='cw-tools'>
                <div className=''>
                    <div>Tool Box</div>
                </div>
            </div>
            <div className='cw-wrapper' ref={parentRef}>
                <canvas ref={canvasRef}></canvas>
            </div>
            <div className='cw-settings'>
                <div onClick={()=>setCwMode('viewer')}>settings</div>
                <button onClick={addRandomBox}>Add Random Box</button>
                <button onClick={clearAll}>Clear All</button>
            </div>
        </div>
    )
}

export default ConvasWorkflow;