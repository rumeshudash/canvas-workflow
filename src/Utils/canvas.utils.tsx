import { BoxComponent, CanvasComponent, CanvasData } from "../Dtos/canvas.dtos";
import { debounce, log } from "./common.utils";
import { DestroyDraggable, RegisterDraggable } from "./draggable.utils";
import { TimeLogger } from "./timeLogger.utils";

let debug = process.env.NODE_ENV === 'development';

let parentDOM: HTMLDivElement;
let canvasDOM: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D | null;
let cwMode: 'editor' | 'viewer';

let canvasDefaultData = {
    height: 500,
    background: '#eeeeee',
    hoverColor: '#0000ff',
    strokeColor: '#000000',
    lineWidth: 1,
    fontSize: 16,
    fontFamily: 'Arial',
}

let canvasData: CanvasData = {}

interface InitCanvasProps {
    parent: HTMLDivElement,
    canvas: HTMLCanvasElement,
    mode?: 'editor' | 'viewer',
    data?: CanvasData,
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
    } : InitCanvasProps
) => {
    parentDOM = parent;
    canvasDOM = canvas;
    cwMode = mode || 'editor';

    ctx = canvas.getContext("2d");

    if( data ) {
        canvasData = data;
    }
    
    canvasRender();
    if( canvasData?.components?.length ) {
        RegisterDraggable( canvasDOM, canvasData.components, canvasRender );
    }
    window.addEventListener( 'resize', debouncRender );
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
 * Clear Canvas.
 */
export const ClearCanvas = () => {
    if( canvasDOM && ctx ) {
        ctx.clearRect(0, 0, canvasDOM.width, canvasDOM.height);
        log('Canvas Cleared!');
    }
}

/**
 * Debounce the render function for performance optimization.
 */
const debouncRender = debounce( () => canvasRender() );

/**
 * Main render function for canvas.
 */
const canvasRender = ( ) => {
    if( parentDOM && canvasDOM && ctx ) {
        let parentDim = parentDOM.getBoundingClientRect();
        canvasDOM.width = parentDim.width;
        canvasDOM.height = canvasData.height || canvasDefaultData.height;
    
        ClearCanvas();
    
        if( debug ) {
            log('Rendering...');
            log('Data:', {canvasData, canvasDefaultData} );
            TimeLogger.start();
        }
        
        setCanvasBG();

        if( canvasData?.components ) {
            canvasData.components.forEach( ( component ) => {
                renderComponents(component);
            } );
        }
            
        if( debug ) {
            TimeLogger.stop('Render');
            log('Render Completed');
        }
    }
}

/**
 * Fill background of canvas.
 */
const setCanvasBG = () => {
    if( canvasDOM && ctx ) {
        // ctx.imageSmoothingEnabled = true;
        ctx.translate(0.5, 0.5);
        ctx.fillStyle = canvasData.background || canvasDefaultData.background;
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
            drawBoxComponent( component as BoxComponent );
            break;
    }
}

/**
 * Process Base of component.
 * 
 * @param component Canvas Component.
 */
const processBaseComponent = ( component: CanvasComponent ) => {
    // Register editor mode.
    if( cwMode === 'editor' ) {
        // Register draggable.
        if( typeof component.draggable === 'undefined' || component.draggable ) {

        }
    }
}

const drawBoxComponent = ( component: BoxComponent ) => {
    if( ! ctx ) return;

    // ctx.imageSmoothingEnabled = true;

    const padding = 5;
    const fontSize = component.fontSize || canvasDefaultData.fontSize;

    ctx.save();
    ctx.beginPath();
    if( component.fillColor ) {
        ctx.fillStyle = component.fillColor;
        ctx.rect(component.x, component.y, component.w, component.h);
        ctx.fill();
    }

    ctx.lineWidth = component.lineWidth || canvasDefaultData.lineWidth;
    ctx.strokeStyle = component.strokeColor || canvasDefaultData.strokeColor;
    ctx.rect(component.x, component.y, component.w, component.h);
    ctx.stroke();
    ctx.clip();

    ctx.font = `${fontSize}px ${component.fontFamily}`;
    ctx.fillStyle = component.textColor || canvasDefaultData.strokeColor;
    ctx.fillText( 
        component.text, component.x + padding + ctx.lineWidth, 
        component.y + padding + fontSize + ctx.lineWidth - 5,
    );
    ctx.restore();
}