import React, { useEffect, useReducer, useState } from 'react';
import { BsPlus, BsTrash } from 'react-icons/bs';
import Select from 'react-select';
import {
    BORDER_LINE_WIDTH,
    BORDER_RADIUS,
    CANVAS_BG,
    CANVAS_COLOR_LIST,
    CANVAS_GRID_COLOR,
    CANVAS_HEIGHT,
    DEFAULT_BOX_ICON,
    DEFAULT_SHOW_GRID,
    FONT_FAMILY,
    FONT_SIZE,
    MAX_BORDER_RADIUS,
    MAX_FONT_SIZE,
    MAX_LINE_WIDTH,
    MIN_CANVAS_HEIGHT,
    MIN_FONT_SIZE,
    STROKE_COLOR,
    TEXT_COLOR
} from '../../Constants/canvas.constants';
import {
    BoxComponent,
    CanvasComponent,
    CanvasData,
    Option
} from '../../Dtos/canvas.dtos';
import { canvasRender } from '../../Utils/canvas.utils';
import {
    getAvailableFontList,
    getFAIcons,
    getSelectedIcon,
    getUniqueKey
} from '../../Utils/common.utils';
import Collapse from '../Collapse/collapse.component';
import ColorPicker from '../Inputs/ColorPicker/colorPicker.component';
import NumberInput from '../Inputs/NumberInput/numberInput.component';
import SliderInput from '../Inputs/SliderInput/sliderInput.component';
import Textarea from '../Inputs/Textarea/textarea.component';
import './settings.component.scss';

interface SettingsProps {
    data: CanvasData;
    canvasRef: React.RefObject<HTMLCanvasElement>;
}

const Settings = ({ data = {}, canvasRef }: SettingsProps) => {
    const [selection, setSelection] = useState<number>(-1);
    const [component, setComponent] = useState<CanvasComponent>();
    const [fonts, setFonts] = useState<string[]>([]);
    const [, forceUpdate] = useReducer((x) => x + 1, 0);

    const fAIcons = getFAIcons();

    useEffect(() => {
        // List of available fonts.
        setFonts(getAvailableFontList());
    }, []);

    useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.addEventListener(
                'cwComponentSelected',
                handleSelectionChange
            );
        }
        return () => {
            if (canvasRef.current) {
                canvasRef.current.removeEventListener(
                    'cwComponentSelected',
                    handleSelectionChange
                );
            }
        };
    }, [canvasRef.current, selection]);

    useEffect(() => {
        if (
            selection !== -1 &&
            data.components &&
            !data.components[selection]
        ) {
            setSelection(-1);
        }
    }, [data]);

    const handleSelectionChange = (event: CustomEvent) => {
        if (selection !== event.detail.index) {
            setSelection(event.detail.index);
            setComponent(undefined);
            setComponent(event.detail.component);
            forceUpdate();
        }
    };

    let comp: any;
    if (component && component.type === 'box') {
        comp = component as BoxComponent;
    }

    const handleDataChange = (key: string, value: any) => {
        data[key] = value;
        if (key === 'height') {
            if (value && value < MIN_CANVAS_HEIGHT) {
                data[key] = MIN_CANVAS_HEIGHT;
            } else if (!value) {
                data[key] = CANVAS_HEIGHT;
            }
        }
        forceUpdate();
        canvasRender();
    };

    const handleComponentDataChange = (key: string, value: any) => {
        if (selection !== -1) {
            if (data.components && data.components[selection]) {
                const newComponent = { ...data.components[selection] };
                newComponent[key] = value;
                data.components[selection] = newComponent;

                setComponent(data.components[selection]);
                canvasRender();
            }
        }
    };

    const handleComponentOptionChange = (
        index: number,
        key: string,
        value: any
    ) => {
        if (selection !== -1) {
            if (data.components && data.components[selection]?.options) {
                const newComponent = { ...data.components[selection] };
                if (newComponent.options && newComponent.options[index]) {
                    newComponent.options[index][key] = value;
                    data.components[selection] = newComponent;
                    setComponent(data.components[selection]);
                    canvasRender();
                }
            }
        }
    };

    const addNewOption = () => {
        if (data.components && data.components[selection]?.options) {
            const newOption: Option = {
                key: getUniqueKey(),
                name: 'Always'
            };
            const newComponent = { ...data.components[selection] };
            if (newComponent.options && newComponent.options.length > 0) {
                newComponent.options.push(newOption);
            } else {
                newComponent.options = [newOption];
            }
            data.components[selection] = newComponent;
            setComponent(data.components[selection]);
            canvasRender();
        }
    };

    const removeOption = (index: number) => {
        const confirmation = window.confirm(
            'Are you sure want to delete this option?'
        );

        if (
            confirmation &&
            data.components &&
            data.components[selection]?.options
        ) {
            const newComponent = { ...data.components[selection] };
            if (newComponent.options && newComponent.options.length > 0) {
                if (data.lines && data.lines.length > 0) {
                    // Remove unused line.
                    data.lines = data.lines.filter(
                        (line) =>
                            newComponent.options &&
                            line.optionKey !== newComponent.options[index].key
                    );
                }

                newComponent.options = newComponent.options.filter(
                    (_, i) => i !== index
                );
                data.components[selection] = newComponent;
                setComponent(data.components[selection]);
                canvasRender();
            }
        }
    };

    const reactSelectStyles = {
        control: (provided: {}) => ({
            ...provided,
            border: '1px solid black',
            borderRadius: 0
        }),
        option: (provided: {}, state: any) => ({
            ...provided,
            color: state.isSelected ? 'white' : 'black'
        })
    };

    return (
        <div className='cw-settings'>
            {selection === -1 && (
                <div className='canvas-settings'>
                    <Collapse title='Canvas Settings'>
                        <div>
                            <div className='form-group'>
                                <div className='form-control'>
                                    <label>Background:</label>
                                    <ColorPicker
                                        type='fill'
                                        value={data.background || CANVAS_BG}
                                        colors={CANVAS_COLOR_LIST}
                                        onChange={(value) =>
                                            handleDataChange(
                                                'background',
                                                value
                                            )
                                        }
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
                                        onBlur={(value) =>
                                            handleDataChange('height', value)
                                        }
                                    />
                                </div>
                            </div>
                            <div className='form-group'>
                                <div className='form-control inline'>
                                    <label>Show Grid:</label>
                                    <input
                                        type='checkbox'
                                        defaultChecked={
                                            typeof data.showGrid !== 'undefined'
                                                ? data.showGrid
                                                : DEFAULT_SHOW_GRID
                                        }
                                        onChange={(e) =>
                                            handleDataChange(
                                                'showGrid',
                                                e.target.checked
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            {(data.showGrid ||
                                (typeof data.showGrid === 'undefined' &&
                                    DEFAULT_SHOW_GRID)) && (
                                <div className='form-group'>
                                    <div className='form-control'>
                                        <label>Grid Color:</label>
                                        <ColorPicker
                                            type='fill'
                                            value={
                                                data.gridColor ||
                                                CANVAS_GRID_COLOR
                                            }
                                            colors={CANVAS_COLOR_LIST}
                                            onChange={(value) =>
                                                handleDataChange(
                                                    'gridColor',
                                                    value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </Collapse>
                </div>
            )}
            {selection !== -1 && (
                <div className='component-settings'>
                    <Collapse title='Presentation'>
                        {comp && comp.type === 'box' && (
                            <div>
                                <div className='form-group'>
                                    <div className='form-control'>
                                        <label>Fill:</label>
                                        <ColorPicker
                                            type='fill'
                                            value={
                                                comp.fillColor || 'transparent'
                                            }
                                            colors={CANVAS_COLOR_LIST}
                                            onChange={(value) =>
                                                handleComponentDataChange(
                                                    'fillColor',
                                                    value
                                                )
                                            }
                                        />
                                    </div>
                                    <div className='form-control'>
                                        <label>Outline:</label>
                                        <ColorPicker
                                            type='stroke'
                                            value={
                                                comp.strokeColor || STROKE_COLOR
                                            }
                                            colors={CANVAS_COLOR_LIST}
                                            onChange={(value) =>
                                                handleComponentDataChange(
                                                    'strokeColor',
                                                    value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <div className='form-group'>
                                    <div className='form-control'>
                                        <label>
                                            Outline Width:{' '}
                                            <strong>
                                                {comp.lineWidth ||
                                                    BORDER_RADIUS}{' '}
                                                px
                                            </strong>
                                        </label>
                                        <SliderInput
                                            value={
                                                comp.lineWidth ||
                                                BORDER_LINE_WIDTH
                                            }
                                            min={1}
                                            max={MAX_LINE_WIDTH}
                                            onAfterChange={(value) =>
                                                handleComponentDataChange(
                                                    'lineWidth',
                                                    value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <div className='form-group'>
                                    <div className='form-control'>
                                        <label>
                                            Border Radius:{' '}
                                            <strong>
                                                {typeof comp.borderRadius !==
                                                'undefined'
                                                    ? comp.borderRadius
                                                    : BORDER_RADIUS}{' '}
                                                px
                                            </strong>
                                        </label>
                                        <SliderInput
                                            value={
                                                typeof comp.borderRadius !==
                                                'undefined'
                                                    ? comp.borderRadius
                                                    : BORDER_RADIUS
                                            }
                                            max={MAX_BORDER_RADIUS}
                                            onAfterChange={(value) =>
                                                handleComponentDataChange(
                                                    'borderRadius',
                                                    value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </Collapse>
                    <Collapse title='Text'>
                        {comp?.type === 'box' && (
                            <div>
                                <div className='form-group'>
                                    <div className='form-control'>
                                        <label>Title:</label>
                                        <input
                                            type='text'
                                            placeholder='Title'
                                            defaultValue={comp.title}
                                            onChange={(e) =>
                                                handleComponentDataChange(
                                                    'title',
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <div className='form-group'>
                                    <div className='form-control'>
                                        <label>Description:</label>
                                        <Textarea
                                            placeholder='Description'
                                            value={comp.description}
                                            onChange={(value) =>
                                                handleComponentDataChange(
                                                    'description',
                                                    value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <div className='form-group'>
                                    <div className='form-control'>
                                        <label>Icon:</label>
                                        <Select
                                            defaultValue={getSelectedIcon(
                                                fAIcons,
                                                comp.icon || DEFAULT_BOX_ICON
                                            )}
                                            onChange={(selected) =>
                                                handleComponentDataChange(
                                                    'icon',
                                                    selected?.key ||
                                                        DEFAULT_BOX_ICON
                                                )
                                            }
                                            options={fAIcons}
                                            isSearchable
                                            formatOptionLabel={(data) => {
                                                return (
                                                    <span
                                                        style={{
                                                            textTransform:
                                                                'capitalize'
                                                        }}
                                                    >
                                                        <i className='far'>
                                                            {data.key}
                                                        </i>{' '}
                                                        {data.label}
                                                    </span>
                                                );
                                            }}
                                            styles={reactSelectStyles}
                                        />
                                    </div>
                                </div>
                                <div className='form-group'>
                                    <div className='form-control'>
                                        <label>
                                            Font Size:{' '}
                                            <strong>
                                                {comp.fontSize || FONT_SIZE}px
                                            </strong>
                                        </label>
                                        <SliderInput
                                            value={comp.fontSize || FONT_SIZE}
                                            min={MIN_FONT_SIZE}
                                            max={MAX_FONT_SIZE}
                                            onAfterChange={(value) =>
                                                handleComponentDataChange(
                                                    'fontSize',
                                                    value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <div className='form-group'>
                                    <div className='form-control'>
                                        <label>Font Family:</label>
                                        <select
                                            defaultValue={
                                                comp.fontFamily || FONT_FAMILY
                                            }
                                            onChange={(e) =>
                                                handleComponentDataChange(
                                                    'fontFamily',
                                                    e.target.value
                                                )
                                            }
                                        >
                                            {fonts.length > 0 &&
                                                fonts.map((font) => (
                                                    <option
                                                        key={font}
                                                        value={font}
                                                    >
                                                        {font}
                                                    </option>
                                                ))}
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
                                            onChange={(value) =>
                                                handleComponentDataChange(
                                                    'textColor',
                                                    value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </Collapse>
                    <Collapse title='Options'>
                        <div className='option-list'>
                            {comp?.options &&
                                comp.options.map(
                                    (option: Option, index: number) => (
                                        <div
                                            key={option.key}
                                            className='form-group'
                                        >
                                            <div className='form-control inline'>
                                                <input
                                                    className='full-width'
                                                    type='text'
                                                    defaultValue={option.name}
                                                    onChange={(e) =>
                                                        handleComponentOptionChange(
                                                            index,
                                                            'name',
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                <button
                                                    className='btn-link btn-danger'
                                                    onClick={() =>
                                                        removeOption(index)
                                                    }
                                                >
                                                    <BsTrash />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                )}
                        </div>
                        <button
                            className='btn-subtle btn-success'
                            onClick={addNewOption}
                        >
                            <BsPlus /> Add Option
                        </button>
                    </Collapse>
                </div>
            )}
        </div>
    );
};

export default Settings;
