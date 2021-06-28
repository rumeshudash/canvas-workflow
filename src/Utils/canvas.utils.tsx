import { BorderRadius, BoxComponent, CanvasComponent, CanvasData } from "../Dtos/canvas.dtos";
import { debounce, formatBorderRadius, getSelectionBoxCords, log } from "./common.utils";
import { DestroyDraggable, RegisterDraggable } from "./draggable.utils";
import { TimeLogger } from "./timeLogger.utils";

let forceStopDebug = true;
let debug = ! forceStopDebug && process.env.NODE_ENV === 'development';

let parentDOM: HTMLDivElement;
let canvasDOM: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D | null;
let cwMode: 'editor' | 'viewer';

let canvasDefaultData = {
    height: 500,
    background: '#efefef',
    hoverColor: '#0000ff',
    strokeColor: '#000000',
    selectionStrokeColor: '#7f7f7f',
    selectionLineWidth: 1,
    lineWidth: 1,
    fontSize: 16,
    fontFamily: 'Arial',
    borderRadius: 3,
}

let canvasData: CanvasData = {}
let selectedIndex: number;

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
    if( cwMode === 'editor' && canvasData?.components?.length ) {
        RegisterDraggable( canvasDOM, canvasData.components, canvasRender );
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
    canvasDOM.removeEventListener( 'cwComponentSelected', handleComponentSelect );
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
        if( debug ) {
            log('Canvas Cleared!');
        }
    }
}

const handleComponentSelect = ( event: CustomEvent ) => {
    selectedIndex = event.detail.index;
    canvasRender();
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
        ctx.translate(0.5, 0.5); // Smoothening canvas.
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
    drawSelectionHandle( component );
}

/**
 * Process Base of component.
 * 
 * @param component Canvas Component.
 */
const processBaseComponent = ( component: CanvasComponent ) => {
    // Register editor mode.
    if( cwMode === 'editor' ) {
        
    }
}

/**
 * Draw box selection border or indicator.
 * 
 * @param component Canvas Component
 */
const drawSelectionHandle = ( component: CanvasComponent ) => {
    if( 
        ctx 
        && cwMode === 'editor'
        && selectedIndex > -1 
        && canvasData.components?.length 
        && selectedIndex === canvasData.components.indexOf(component) 
    ) {
        let strokeOffset = 3;
        let dashedLine = true;
        let compDimension = {
            x: component.x,
            y: component.y,
            w: 0,
            h: 0,
        }

        switch( component.type ) {
            case 'box':
                const comp = component as BoxComponent;
                compDimension.w = comp.w;
                compDimension.h = comp.h;
                // dashedLine = false;
                break;
        }

        // Draw border for selections.
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = canvasData.selectionLineWidth || canvasDefaultData.selectionLineWidth;
        if( dashedLine ) {
            ctx.setLineDash([5, 5])
        }
        ctx.strokeStyle = canvasData.selectionStrokeColor || canvasDefaultData.selectionStrokeColor;
        ctx.rect( 
            compDimension.x - strokeOffset, 
            compDimension.y - strokeOffset,
            compDimension.w + (strokeOffset * 2),
            compDimension.h + (strokeOffset * 2),
        )
        ctx.stroke();
        ctx.restore();

        // Draw border points
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = canvasData.selectionStrokeColor || canvasDefaultData.selectionStrokeColor;
        let boxSize = 7;
        
        const selectionBoxes = getSelectionBoxCords( compDimension, strokeOffset, boxSize );
        for( let box of selectionBoxes ) {
            ctx.rect( box.x, box.y, box.w, box.h );
        }

        ctx.fill();
        ctx.restore();
    }
}

/**
 * Draw Box component.
 * 
 * @param component Box Component
 * @returns void
 */
const drawBoxComponent = ( component: BoxComponent ) => {
    if( ! ctx ) return;

    const padding = 5;
    const fontSize = component.fontSize || canvasDefaultData.fontSize;

    ctx.save(); // Save the default state to restore later.
    ctx.beginPath();
    drawRoundedRect( ctx, component.x, component.y, component.w, component.h, component.borderRadius );
    if( component.fillColor ) {
        // Draw box fill
        ctx.fillStyle = component.fillColor;
        ctx.fill();
    }

    // Draw box stroke or border.
    ctx.lineWidth = component.lineWidth || canvasDefaultData.lineWidth;
    ctx.strokeStyle = component.strokeColor || component.fillColor || canvasDefaultData.strokeColor;
    ctx.stroke();
    ctx.clip(); // Clip inner elements inside box.

    // Draw box text.
    ctx.font = `${fontSize}px ${component.fontFamily}`;
    ctx.fillStyle = component.textColor || canvasDefaultData.strokeColor;
    ctx.fillText( 
        component.text, component.x + padding + ctx.lineWidth, 
        component.y + padding + fontSize + ctx.lineWidth - 5,
    );
    ctx.restore(); // Restore default state.

}

const drawRoundedRect = ( ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, borderRadius?: BorderRadius ) => {
    const radius = formatBorderRadius( borderRadius || canvasDefaultData.borderRadius );
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
}