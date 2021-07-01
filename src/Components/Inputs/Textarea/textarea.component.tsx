import React, { useState } from 'react';
import './textarea.component.scss';

const Textarea = (
    { 
        value, 
        placeholder, 
        onChange 
    }: { 
        value?: string, 
        placeholder?: string,
        onChange?: ( value: string ) => void 
    }
) => {
    const [data, setData] = useState(value);

    return (
        <div className="textarea-wrap" data-replicated-value={data}>
            <textarea placeholder={placeholder} onChange={(e) => { setData( e.target.value ); onChange && onChange( e.target.value ) } } value={data}></textarea>
        </div>
    )
}

export default Textarea;
