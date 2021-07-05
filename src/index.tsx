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

    return (
        <div className={`canvas-workflow`} >
            <Toolbar />
            <div className='cw-wrapper' ref={parentRef}>
                <canvas ref={canvasRef} tabIndex={1}></canvas>
            </div>
            <Settings data={cwData} canvasRef={canvasRef} />
        </div>
    )
}

export default ConvasWorkflow;