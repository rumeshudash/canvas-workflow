import React, { useEffect, useState } from 'react'
import { CANVAS_BG, CANVAS_COLOR_LIST, CANVAS_HEIGHT, FONT_FAMILY, MIN_CANVAS_HEIGHT } from '../../Constants/canvas.constants';
import { BoxComponent, CanvasComponent, CanvasData } from '../../Dtos/canvas.dtos';
import { canvasRender } from '../../Utils/canvas.utils';
import { getAvailableFontList, log } from '../../Utils/common.utils';
import Textarea from '../Inputs/Textarea/textarea.component';
import NumberInput from '../Inputs/NumberInput/numberInput.component';
import './settings.component.scss';
import ColorPicker from '../Inputs/ColorPicker/colorPicker.component';

interface SettingsProps {
    data: CanvasData;
    canvasRef: React.RefObject<HTMLCanvasElement>;
}

const Settings = ({ data = {}, canvasRef }: SettingsProps) => {

    const [selection, setSelection] = useState<number>(-1);
    const [component, setComponent] = useState<CanvasComponent>();
    const [height, setHeight] = useState( data.height || CANVAS_HEIGHT );
    const [fonts, setFonts] = useState<string[]>([]);

    useEffect(() => {
        // List of available fonts.
        setFonts(getAvailableFontList());

    }, [])

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
        setSelection( -1 );
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
        data[key] = value;
        if( key === 'height' ) {
            if( value && value < MIN_CANVAS_HEIGHT ) {
                data[key] = MIN_CANVAS_HEIGHT;
            } else if( ! value ) {
                data[key] = CANVAS_HEIGHT;
            }
            setHeight( data[key] || CANVAS_HEIGHT );
        }
        canvasRender();
    }

    const handleComponentDataChange = ( key: string, value: any ) => {
        if( selection !== -1 && comp ) {
            comp[key] = value;

            if( data.components ) {
                data.components[selection] = comp;
                canvasRender();
            }
        }
    }

    return (
        <div className='cw-settings' style={{ height: height }}>
            { selection === -1 &&
                <div className='canvas-settings'>
                    <div className='section presentation'>
                        <div className='title'>Canvas Settings</div>
                        <div className='controls'>
                            <div className='form-group'>
                                <div className='form-control'>
                                    <label>Height:</label>
                                    <NumberInput
                                        placeholder='Height'
                                        min={MIN_CANVAS_HEIGHT}
                                        value={data.height || CANVAS_HEIGHT}
                                        onBlur={( value ) => handleDataChange( 'height',value )}
                                    />
                                </div>
                            </div>
                            <div className='form-group'>
                                <div className='form-control'>
                                    <label>Background:</label>
                                    <ColorPicker 
                                        value={data.background || CANVAS_BG} 
                                        colors={CANVAS_COLOR_LIST}
                                        onChange={( value ) => handleDataChange( 'background',value ) } 
                                    />
                                </div>
                                {/* <div className='form-control'>
                                    <label>Fill Color:</label>
                                    <ColorPicker type='stroke' />
                                </div> */}
                            </div>
                        </div>
                    </div>
                </div>
            }
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
                                            onChange={(e) => handleComponentDataChange( 'title', e.target.value )}
                                        />
                                    </div>
                                </div>
                                <div className='form-group'>
                                    <div className='form-control'>
                                        <label>Description:</label>
                                        <Textarea 
                                            placeholder='Description' 
                                            value={comp.description} 
                                            onChange={(value) => handleComponentDataChange( 'description', value )} 
                                        />
                                    </div>
                                </div>
                                <div className='form-group'>
                                    <div className='form-control'>
                                        <label>Font Family:</label>
                                        <select defaultValue={comp.fontFamily || FONT_FAMILY} onChange={( e ) => handleComponentDataChange( 'fontFamily', e.target.value ) }>
                                            { fonts.length > 0 && fonts.map( ( font ) => (
                                                <option key={font} value={font}>{font}</option>
                                            ) ) }
                                        </select>
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
