import React, { ChangeEvent, useEffect, useState } from 'react'

interface NumberInputProps {
    defaultValue?: number, 
    value?: number, 
    min?: number,
    max?: number,
    placeholder?: string,
    onChange?: ( value: number ) => void,
    onBlur?: ( value: number ) => void,
}

const NumberInput = ({ 
    defaultValue, 
    value, 
    min,
    max,
    placeholder,
    onChange,
    onBlur, 
}: NumberInputProps ) => {

    const [val, setVal] = useState( defaultValue || 0 );

    useEffect(() => {
        if( value ) {
            setVal( value );
        }
    }, [value])

    const handleChange = ( data: number ) => {
        if( typeof onChange !== 'undefined' ){
            onChange( data );
        }
        setVal( data );
    }

    const handleBlur = ( data: number ) => {
        if( typeof min !== 'undefined' && data < min ) data = min;
        if( typeof max !== 'undefined' && data > max ) data = max;

        if( typeof onBlur !== 'undefined' ) {
            onBlur( data );
        }
        setVal( data );
    }

    return (
        <input 
            type='number' 
            value={val} 
            placeholder={placeholder} 
            onChange={ ( e ) => handleChange( parseInt(e.target.value) ) } 
            onBlur={ ( e ) => handleBlur( parseInt(e.target.value) ) } 
        />
    )
}

export default NumberInput
