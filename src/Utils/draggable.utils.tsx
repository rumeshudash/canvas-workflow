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
}

export const DestroyDraggable = () => {
    if( canvasDOM ) {
        canvasDOM.removeEventListener('mousedown', onMouseDown );
    }
}

const onMouseDown = ( event: MouseEvent ) => {
    if( ! cwComponents.length ) return;

    const revComponents = [ ...cwComponents ].reverse();
    const canvasEvent = getCanvasEvent( event );
    // revComponents.reverse();
    revComponents.map( ( comp ) => {
        if( ! isDragging && comp.type === 'box' 
            && rectCollision(canvasEvent.x, canvasEvent.y, comp as BoxComponent )  
        ) {
            isDragging = true;
            dragCompIndex = reversedIndexOf( revComponents, comp );
            offset.x = canvasEvent.x - comp.x;
            offset.y = canvasEvent.y - comp.y;

            canvasDOM.addEventListener('mousemove', onMouseMove );
            canvasDOM.addEventListener('mouseup', onMouseUp );

            return;
        }
    } )
}

const onMouseMove = ( event: MouseEvent ) => {
    if( dragCompIndex !== -1 ) {
        const canvasEvent = getCanvasEvent( event );

        cwComponents[dragCompIndex].x = canvasEvent.x - offset.x;
        cwComponents[dragCompIndex].y = canvasEvent.y - offset.y;
        cwRender();
    }
}

const onMouseUp = () => {
    isDragging = false;
    dragCompIndex = -1;
    canvasDOM.removeEventListener('mousemove', onMouseMove );
    canvasDOM.removeEventListener('mouseup', onMouseUp );
}

const rectCollision = ( x: number, y: number, rect: BoxComponent ) => {
    if(
        rect.x > 0 && x > rect.x
        && rect.y > 0 && y > rect.y
        && x < ( rect.w + rect.x )
        && y < ( rect.h + rect.y )
    ) {
        log('Collision: ', rect.text);
        return true;
    }
    return false;
}

const getCanvasEvent = ( event: MouseEvent ): { x: number, y: number} => {
    const canvasRect = canvasDOM.getBoundingClientRect();
    return { x: event.clientX - canvasRect.left, y: event.clientY - canvasRect.top }
}