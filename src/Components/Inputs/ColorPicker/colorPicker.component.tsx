import React, { useEffect, useRef, useState } from 'react'
import { SketchPicker, ColorResult } from 'react-color';
import './colorPicker.component.scss';

interface ColorPickerProps {
    type?: 'fill' | 'stroke',
    value?: string,
    colors?: string[],
    onChange?: ( value: string ) => void;
}

const ColorPicker = ({ type = 'fill', colors, value = '#00000000', onChange }: ColorPickerProps ) => {

    const pickerWidth = 172;
    const transparentBG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==";

    const [showPopup, setShowPopup] = useState(false);
    const [val, setVal] = useState(value);

    const boxRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if( boxRef.current && popupRef.current ) {
            const boxBound = boxRef.current.getBoundingClientRect();
            popupRef.current.style.left = (boxBound.x + (boxBound.width / 2) - (pickerWidth / 2) - 5) + 'px';
        }
    }, [boxRef.current, popupRef.current]);

    const handleChange = ( color: ColorResult ) => {
        if( val !== color.hex && typeof onChange === 'function' ) {
            onChange( color.hex );
        }
        setVal( color.hex );
    }

    let colorBoxStyle: {} = {};
    let colorFilStyle: {} = { background: val };

    if( type === 'stroke' ) {
        if( val === 'transparent' || val === '#00000000' ) {
            colorBoxStyle = { backgroundImage: `url(${transparentBG})` };
        } else {
            colorBoxStyle = { background: val};
        }
        colorFilStyle = {};
    } else {
        if( val === 'transparent' || val === '#00000000' ) {
            colorFilStyle = { background: '#ffffff', backgroundImage: `url(${transparentBG})` };
        }
    }


    return (
        <div className='color-picker'>
            <div ref={boxRef} className='color-box' onClick={ () => setShowPopup( ! showPopup ) } style={colorBoxStyle}>
                <div className='color-fill' style={colorFilStyle} />
            </div>
            <div ref={popupRef} className={`popup ${! showPopup && 'hide' }`}>
                <div className='popup-cover' onClick={ () => setShowPopup( false ) }/>
                <SketchPicker
                    color={val}
                    presetColors={colors && colors}
                    width={`${pickerWidth}px`} 
                    onChange={handleChange}
                />
            </div>
        </div>
    )
}

export default ColorPicker
