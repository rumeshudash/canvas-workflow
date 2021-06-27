import { BoxComponent, CanvasComponent } from "../Dtos/canvas.dtos";
import { log, reversedIndexOf } from "./common.utils";

let cwComponents: CanvasComponent[];
let canvasDOM: HTMLCanvasElement;
let cwRender: Function;

let isDragging = false;
let dragCompIndex = -1;
let offset = {x: 0, y: 0};

export const RegisterDraggable = ( canvas: HTMLCanvasElement, components: CanvasComponent[], render: Function ) => {
    cwComponents = components;
    canvasDOM = canvas;
    cwRender = render;

    canvasDOM.addEventListener('mousedown', onMouseDown );
    canvasDOM.addEventListener('mousemove', onMouseMove );
}

export const DestroyDraggable = () => {
    if( canvasDOM ) {
        canvasDOM.removeEventListener('mousedown', onMouseDown );
        canvasDOM.removeEventListener('mousemove', onMouseMove );
    }
}

const onMouseDown = ( event: MouseEvent ) => {
    if( ! cwComponents.length ) return;

    const revComponents = [ ...cwComponents ].reverse();
    const canvasEvent = getCanvasEvent( event );
    for( let comp of revComponents ) {
        if( ! isDragging && comp.type === 'box' 
            && rectCollision(canvasEvent.x, canvasEvent.y, comp as BoxComponent )  
        ) {
            isDragging = true;
            dragCompIndex = reversedIndexOf( revComponents, comp );
            offset.x = canvasEvent.x - comp.x;
            offset.y = canvasEvent.y - comp.y;

            canvasDOM.addEventListener('mouseup', onMouseUp );
            break;
        }
    }
    triggerComponentSelect();
}

const onMouseMove = ( event: MouseEvent ) => {
    const canvasEvent = getCanvasEvent( event );
    canvasDOM.style.cursor = 'default';
    if( dragCompIndex !== -1 ) {
        cwComponents[dragCompIndex].x = canvasEvent.x - offset.x;
        cwComponents[dragCompIndex].y = canvasEvent.y - offset.y;
        cwRender();

        canvasDOM.style.cursor = 'move';
    } else {
        for( let comp of cwComponents ) {
            if( comp.type === 'box' 
                && rectCollision(canvasEvent.x, canvasEvent.y, comp as BoxComponent ) 
            ) {
                canvasDOM.style.cursor = 'move'; // On hover over draggable box.
                break;
            }
        }
    }
}

const onMouseUp = () => {
    isDragging = false;
    dragCompIndex = -1;
    canvasDOM.removeEventListener('mouseup', onMouseUp );
}

const rectCollision = ( x: number, y: number, rect: BoxComponent ) => {
    if(
        x > rect.x
        && y > rect.y
        && x < ( rect.w + rect.x )
        && y < ( rect.h + rect.y )
    ) {
        return true;
    }
    return false;
}

const getCanvasEvent = ( event: MouseEvent ): { x: number, y: number} => {
    const canvasRect = canvasDOM.getBoundingClientRect();
    return { x: event.clientX - canvasRect.left, y: event.clientY - canvasRect.top }
}

const triggerComponentSelect = () => {
    if( canvasDOM ) {
        const event = new CustomEvent('cwComponentSelected', { 
            detail:  { 
                index: dragCompIndex, 
                component: cwComponents[dragCompIndex] 
            } 
        });
        canvasDOM.dispatchEvent( event );
    }
}