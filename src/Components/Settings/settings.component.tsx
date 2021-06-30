import React, { useEffect, useState } from 'react'
import { CANVAS_HEIGHT } from '../../Constants/canvas.constants';
import { BoxComponent, CanvasComponent, CanvasData } from '../../Dtos/canvas.dtos';
import { canvasRender } from '../../Utils/canvas.utils';
import { log } from '../../Utils/common.utils';
import Textarea from '../Textarea/textarea.component';
import './settings.component.scss';

interface SettingsProps {
    data: CanvasData;
    canvasRef: React.RefObject<HTMLCanvasElement>;
}

const Settings = ({ data = {}, canvasRef }: SettingsProps) => {

    const [selection, setSelection] = useState<number>(-1);
    const [component, setComponent] = useState<CanvasComponent>();

    useEffect(() => {
        if( canvasRef.current ) {
            canvasRef.current.addEventListener('cwComponentSelected', handleSelectionChange );
            // canvasRef.current.addEventListener('cwComponentMoving', handleComponentMoving );
        }
        return () => {
            if( canvasRef.current ) {
                canvasRef.current.removeEventListener('cwComponentSelected', handleSelectionChange );
                // canvasRef.current.removeEventListener('cwComponentMoving', handleComponentMoving );
            }
        }
    }, [ canvasRef, selection ])

    useEffect(() => {
        if( selection !== -1 && data.components && ! data.components[selection] ) {
            setSelection( -1 );
        }
    }, [data])

    const handleSelectionChange = ( event: CustomEvent ) => {
        setSelection( event.detail.index );
        setComponent( event.detail.component );
    }

    // const handleComponentMoving = ( event: CustomEvent ) => {
    //     if( selection !== -1 ) {
    //         setComponent(undefined);
    //         setComponent( event.detail.components[selection] );
    //     }
    // }

    let comp: any;
    if( component && component.type === 'box' ) {
        comp = component as BoxComponent;
    }
    
    const handleDataChange = ( key: string, value: any ) => {
        if( selection !== -1 && comp ) {
            if( Object.keys( comp ).includes( key ) ) {
                comp[key] = value;
            }

            if( data.components ) {
                data.components[selection] = comp;
                canvasRender();
            }
        }
    }

    return (
        <div className='cw-settings' style={{ height: data.height || CANVAS_HEIGHT }}>
            { selection !== -1 && 
                <div className='component-settings'>
                    <div className='section presentation'>
                        <div className='title'>Presentation</div>
                        <div className='controls'>

                        </div>
                    </div>
                    <div className='section text'>
                        <div className='title'>Text</div>
                        <div className='controls'>
                            { comp && comp.type === 'box' && <div>
                                <div className='form-group'>
                                    <div className='form-control'>
                                        <label>Title:</label>
                                        <input 
                                            type='text' 
                                            placeholder='Title'
                                            defaultValue={comp.title}
                                            onChange={(e) => handleDataChange( 'title', e.target.value )}
                                        />
                                    </div>
                                </div>
                                <div className='form-group'>
                                    <div className='form-control'>
                                        <label>Description:</label>
                                        <Textarea 
                                            placeholder='Description' 
                                            value={comp.description} 
                                            onChange={(value) => handleDataChange( 'description', value )} 
                                        />
                                    </div>
                                </div>
                            </div>}
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default Settings
