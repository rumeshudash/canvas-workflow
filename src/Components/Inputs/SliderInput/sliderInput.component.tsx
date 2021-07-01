import React from 'react'
import Slider, { createSliderWithTooltip } from 'rc-slider';
import 'rc-slider/assets/index.css';
import './sliderInput.component.scss';

interface SliderProps {
    value?: number;
    min?: number;
    max?:number;
    onChange?: ( value: number ) => void;
    onAfterChange?: ( value: number ) => void;
}

const SliderWithTooltip = createSliderWithTooltip(Slider);

const SliderInput = ({ value, min, max, onChange, onAfterChange } : SliderProps) => {
    return (
        <SliderWithTooltip defaultValue={value} min={min} max={max} onChange={onChange} onAfterChange={onAfterChange} />
    )
}

export default SliderInput
