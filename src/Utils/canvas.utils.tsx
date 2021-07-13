import { BoxComponent, CanvasComponent, CanvasData, CanvasLine } from "../Dtos/canvas.dtos";
import { debounce, getComponentByKey, getDevicePixelRatio, getOptionCoordsByKey, log } from "./common.utils";
import { DestroyDraggable, RegisterDraggable } from "./draggable.utils";
import { TimeLogger } from "./timeLogger.utils";
import { drawBoxComponent, drawCanvasDotGrid, drawLine, drawSelectionHandle } from './draw.utils';
import { CANVAS_BG, CANVAS_HEIGHT } from "../Constants/canvas.constants";

let forceStopDebug = true;
let debug = ! forceStopDebug && process.env.NODE_ENV === 'development';

let parentDOM: HTMLDivElement;
let canvasDOM: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D | null;
let handleDataChange: ( data: CanvasData ) => void;
let cwMode: 'editor' | 'viewer';

let canvasDefaultData = {
    selectionStrokeColor: '#7f7f7f',
    selectionLineWidth: 1,
}

let canvasData: CanvasData = {}
let selectedIndex: number;

interface InitCanvasProps {
    parent: HTMLDivElement,
    canvas: HTMLCanvasElement,
    mode?: 'editor' | 'viewer',
    data?: CanvasData,
    updateData?: ( data: CanvasData ) => void,
    onDataChange?: ( data: CanvasData ) => void
}

/**
 * Initialize Canvas.
 * 
 * @param parent Parent DOM.
 * @param canvas Main Canvas DOM.
 * @param mode Mode of canvas workflow.
 * @param data Canvas Data. 
 */
export const InitCanvas = (
    { 
        parent,
        canvas,
        mode,
        data,
        onDataChange,
    } : InitCanvasProps
) => {
    parentDOM = parent;
    canvasDOM = canvas;
    cwMode = mode || 'editor';
    ctx = canvas.getContext("2d");

    if( onDataChange ) {
        handleDataChange = onDataChange;
    }

    if( data ) {
        canvasData = data;
        canvasData.components = canvasData.components || [];
        canvasData.lines = canvasData.lines || [];
    }
    
    canvasRender( false );

    if( cwMode === 'editor' && canvasData ) {
        RegisterDraggable( canvasDOM, canvasData.components, canvasData.lines, canvasRender, RemoveComponent );
    } else {
        DestroyDraggable();
    }
    window.addEventListener( 'resize', debouncRender );
    canvasDOM.addEventListener( 'cwComponentSelected', handleComponentSelect );
}

/**
 * Destroy the canvas events.
 */
export const DestroyCanvas = () => {
    window.removeEventListener( 'resize', debouncRender );
    DestroyDraggable();
    if( debug ) {
        log('Canvas Destroyed');
    }
}

/**
 * Remove component from canvas data.
 * @param index Component index
 */
export const RemoveComponent = ( index: number ) => {
    if( canvasData?.components ) {
        let tempData = { ...canvasData };
        tempData.components = tempData.components?.filter( ( _, i ) => {
            return i !== index;
        } );
        canvasData = tempData;
        handleDataChange( tempData );
    }
}

/**
 * Clear Canvas.
 */
export const ClearCanvas = () => {
    if( canvasDOM && ctx ) {
        ctx.clearRect(0, 0, canvasDOM.width, canvasDOM.height);
        if( debug ) {
            log('Canvas Cleared!');
        }
    }
}

const handleComponentSelect = ( event: CustomEvent ) => {
    if( selectedIndex !== event.detail.index ) {
        selectedIndex = event.detail.index;
        canvasRender( false );
    }
}

/**
 * Debounce the render function for performance optimization.
 */
const debouncRender = debounce( () => canvasRender() );

/**
 * Main render function for canvas.
 */
export const canvasRender = ( triggerDataChange = true ) => {
    if( parentDOM && canvasDOM && ctx ) {
        let parentDim = parentDOM.getBoundingClientRect();
        let pixelRatio = getDevicePixelRatio( ctx ); // Device pixel ratio.

        // Manage pixel ratio of canvas according to device pixel ratio.
        canvasDOM.width = parentDim.width * pixelRatio;
        canvasDOM.height = ( canvasData.height || CANVAS_HEIGHT ) * pixelRatio;
        canvasDOM.style.width = parentDim.width + "px";
        canvasDOM.style.height = ( canvasData.height || CANVAS_HEIGHT ) + "px";
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        ClearCanvas();
    
        if( debug ) {
            log('Rendering...');
            log('Data:', {canvasData, canvasDefaultData} );
            TimeLogger.start();
        }
        
        setCanvasBG();

        // Draw canvas grid.
        drawCanvasDotGrid( canvasData, canvasDOM, ctx );

        // Render components.
        if( canvasData?.components ) {
            canvasData.components.forEach( ( component ) => {
                renderComponents(component);
            } );
        }

        // Render lines.
        if( canvasData?.lines ) {
            canvasData.lines.forEach( ( line ) => {
                renderLine(line);
            } );
        }

        if( debug ) {
            TimeLogger.stop('Render');
            log('Render Completed');
        }

        // Handle data change.
        if( triggerDataChange ) {
            handleDataChange( canvasData );
        }
    }
}

/**
 * Fill background of canvas.
 */
const setCanvasBG = () => {
    if( canvasDOM && ctx ) {
        ctx.translate(0.5, 0.5); // Smoothening canvas.
        ctx.fillStyle = canvasData.background || CANVAS_BG;
        ctx.fillRect(0, 0, canvasDOM.width, canvasDOM.height);
    }
}

/**
 * Render component in canvas.
 * @param component Canvas Component
 */
const renderComponents = ( component: CanvasComponent ) => {
    processBaseComponent( component );
    switch( component.type ) {
        case 'box':
            drawBoxComponent( component as BoxComponent, ctx );
            break;
    }
    drawSelectionHandle( component, canvasData, selectedIndex, canvasDefaultData, cwMode, ctx );
}

/**
 * Render component in canvas.
 * @param component Canvas Component
 */
const renderLine = ( line: CanvasLine ) => {
    const startComp = getComponentByKey( line.componentKey, canvasData.components || [] );
    const endComp = getComponentByKey( line.targetKey, canvasData.components || [] );
    const startOptionCoords = getOptionCoordsByKey( line.optionKey, startComp );

    if( ctx && startComp && endComp && startOptionCoords ) {
        let points = {
            start: {
                x: startOptionCoords.x - 5,
                y: startOptionCoords.y + (startOptionCoords.h / 2),
            },
            end: { 
                x: endComp.x,
                y: endComp.y,
            }
        }

        // When target goes right.
        if( startOptionCoords.x + 50 < endComp.x ) {
            points.end.y = endComp.y + (endComp.h / 2);
        }
        // When target goes left.
        if( startOptionCoords.x > endComp.x ) {
            points.end.x = endComp.x + (endComp.w / 2);
        }
        // When target goes fully left of box.
        if( (startOptionCoords.x - startComp.w) > endComp.x ) {
            points.end.x = endComp.x + endComp.w;
        }
        // When target goes fully above of box.
        if( (startOptionCoords.y - ( startOptionCoords.y - startComp.y )) > (endComp.y + endComp.h) ) {
            points.end.y = endComp.y + endComp.h;
        }
        // When target goes fully left of box.
        if( (startOptionCoords.x - startComp.w) > (endComp.x + endComp.w) ) {
            points.end.y = endComp.y + (endComp.h / 2);
        }

        drawLine( ctx, points );
    }
    // drawSelectionHandle( component, canvasData, selectedIndex, canvasDefaultData, cwMode, ctx );
}

/**
 * Process Base of component.
 * 
 * @param component Canvas Component.
 */
const processBaseComponent = ( component: CanvasComponent ) => {
    // Register editor mode.
    if( cwMode === 'editor' && ctx ) {
        drawLine( ctx, { start: {x: 10, y: 10 }, end: { x: 100, y: 10 } } )
    }
}