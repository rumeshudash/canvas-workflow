import React, { useEffect, useReducer, useState } from 'react'
import { 
    CANVAS_BG, 
    CANVAS_COLOR_LIST, 
    CANVAS_HEIGHT, 
    FONT_FAMILY, 
    FONT_SIZE, 
    MIN_CANVAS_HEIGHT, 
    MIN_FONT_SIZE, 
    MAX_FONT_SIZE, 
    STROKE_COLOR, 
    TEXT_COLOR, 
    BORDER_RADIUS, 
    MAX_BORDER_RADIUS, 
    LINE_WIDTH, 
    MAX_LINE_WIDTH, 
    DEFAULT_SHOW_GRID,
    CANVAS_GRID_COLOR
} from '../../Constants/canvas.constants';
import { BoxComponent, CanvasComponent, CanvasData } from '../../Dtos/canvas.dtos';
import { canvasRender } from '../../Utils/canvas.utils';
import { getAvailableFontList } from '../../Utils/common.utils';
import Textarea from '../Inputs/Textarea/textarea.component';
import NumberInput from '../Inputs/NumberInput/numberInput.component';
import ColorPicker from '../Inputs/ColorPicker/colorPicker.component';
import SliderInput from '../Inputs/SliderInput/sliderInput.component';
import './settings.component.scss';

interface SettingsProps {
    data: CanvasData;
    canvasRef: React.RefObject<HTMLCanvasElement>;
}

const Settings = ({ data = {}, canvasRef }: SettingsProps) => {

    const [selection, setSelection] = useState<number>(-1);
    const [component, setComponent] = useState<CanvasComponent>();
    const [height, setHeight] = useState( data.height || CANVAS_HEIGHT );
    const [fonts, setFonts] = useState<string[]>([]);
    const [, forceUpdate] = useReducer(x => x + 1, 0);

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
    }, [ canvasRef.current, selection ])

    useEffect(() => {
        if( selection !== -1 && data.components && ! data.components[selection] ) {
            setSelection( -1 );
        }
    }, [data])

    const handleSelectionChange = ( event: CustomEvent ) => {
        setSelection( -1 );
        setSelection( event.detail.index );
        setComponent( undefined );
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
        forceUpdate();
        canvasRender();
    }

    const handleComponentDataChange = ( key: string, value: any ) => {
        if( selection !== -1 ) {
            if( data.components && data.components[selection] ) {
                const newComponent = { ...data.components[selection] }
                newComponent[key] = value;
                data.components[selection] = newComponent;

                setComponent( data.components[selection] );
                canvasRender();
            }
        }
    }

    return (
        <div className='cw-settings'>
            { selection === -1 &&
                <div className='canvas-settings'>
                    <div className='section presentation'>
                        <div className='title'>Canvas Settings</div>
                        <div className='controls'>
                            <div className='form-group'>
                                <div className='form-control'>
                                    <label>Background:</label>
                                    <ColorPicker 
                                        type='fill'
                                        value={data.background || CANVAS_BG} 
                                        colors={CANVAS_COLOR_LIST}
                                        onChange={( value ) => handleDataChange( 'background',value ) } 
                                    />
                                </div>
                            </div>
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
                                <div className='form-control inline'>
                                    <label>Show Grid:</label>
                                    <input 
                                        type='checkbox' 
                                        defaultChecked={typeof data.showGrid !== 'undefined' ? data.showGrid : DEFAULT_SHOW_GRID}
                                        onChange={ ( e ) => handleDataChange( 'showGrid', e.target.checked )} 
                                    />
                                </div>
                            </div>
                            { ( data.showGrid || ( typeof data.showGrid === 'undefined' && DEFAULT_SHOW_GRID ) ) && 
                                <div className='form-group'>
                                    <div className='form-control'>
                                        <label>Grid Color:</label>
                                        <ColorPicker
                                            type='fill'
                                            value={data.gridColor || CANVAS_GRID_COLOR} 
                                            colors={CANVAS_COLOR_LIST}
                                            onChange={( value ) => handleDataChange( 'gridColor',value ) } 
                                        />
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            }
            { selection !== -1 && 
                <div className='component-settings'>
                    <div className='section presentation'>
                        <div className='title'>Presentation</div>
                        <div className='controls'>
                            { comp && comp.type === 'box' && <div>
                                <div className='form-group'>
                                    <div className='form-control'>
                                        <label>Fill:</label>
                                        <ColorPicker 
                                            type='fill'
                                            value={comp.fillColor || 'transparent'} 
                                            colors={CANVAS_COLOR_LIST}
                                            onChange={( value ) => handleComponentDataChange( 'fillColor',value ) } 
                                        />
                                    </div>
                                    <div className='form-control'>
                                        <label>Outline:</label>
                                        <ColorPicker
                                            type='stroke'
                                            value={comp.strokeColor || STROKE_COLOR} 
                                            colors={CANVAS_COLOR_LIST}
                                            onChange={( value ) => handleComponentDataChange( 'strokeColor',value ) } 
                                        />
                                    </div>
                                </div>
                                <div className='form-group'>
                                    <div className='form-control'>
                                        <label>Outline Width: <strong>{ comp.lineWidth || BORDER_RADIUS } px</strong></label>
                                        <SliderInput
                                            value={ comp.lineWidth || LINE_WIDTH } 
                                            min={1}
                                            max={MAX_LINE_WIDTH}
                                            onAfterChange={( value ) => handleComponentDataChange( 'lineWidth', value )}
                                        />
                                    </div>
                                </div>
                                <div className='form-group'>
                                    <div className='form-control'>
                                        <label>Border Radius: <strong>{ typeof comp.borderRadius !== 'undefined' ? comp.borderRadius : BORDER_RADIUS } px</strong></label>
                                        <SliderInput
                                            value={ typeof comp.borderRadius !== 'undefined' ? comp.borderRadius : BORDER_RADIUS } 
                                            max={MAX_BORDER_RADIUS}
                                            onAfterChange={( value ) => handleComponentDataChange( 'borderRadius', value )}
                                        />
                                    </div>
                                </div>
                            </div>}
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
                                        <label>Font Size: <strong>{comp.fontSize || FONT_SIZE}px</strong></label>
                                        <SliderInput
                                            value={comp.fontSize || FONT_SIZE} 
                                            min={MIN_FONT_SIZE}
                                            max={MAX_FONT_SIZE}
                                            onAfterChange={( value ) => handleComponentDataChange( 'fontSize', value )}
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
                                <div className='form-group'>
                                    <div className='form-control'>
                                        <label>Text Color:</label>
                                        <ColorPicker
                                            type='fill'
                                            value={comp.textColor || TEXT_COLOR} 
                                            colors={CANVAS_COLOR_LIST}
                                            onChange={( value ) => handleComponentDataChange( 'textColor',value ) } 
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
