import { BOX_MIN_HEIGHT, BOX_MIN_WIDTH, SELECTION_RESIZE_BOX_CURSORS } from "../Constants/canvas.constants";
import { BoxComponent, CanvasComponent } from "../Dtos/canvas.dtos";
import { getDefaultBoxData, getSelectionBoxCords, getSnapCords, getSnapSize, reversedIndexOf } from "./common.utils";

let cwRender: Function;
let canvasDOM: HTMLCanvasElement;
let cwComponents: CanvasComponent[];
let tempComponents: CanvasComponent[];

let removeComponent: ( index: number ) => void;

let isDragging = false;
let isResizing = false;
let listenMovingCanvas = false;
let isMovingCanvas = false;

let dragCompIndex = -1;
let resizeBoxIndex = -1;

let offset = {x: 0, y: 0};
let resizePrevCompPos = {x: 0, y: 0, w: 0, h: 0};
let prevCursorPos = {x: 0, y: 0};

/**
 * Register draggable events.
 * 
 * @param canvas Canvas
 * @param components Component array
 * @param render Render function of canvas.
 */
export const RegisterDraggable = ( canvas: HTMLCanvasElement, components: CanvasComponent[] = [], render: Function, RemoveComponent: ( index: number ) => void ): void => {
    cwComponents = components;
    canvasDOM = canvas;
    cwRender = render;
    removeComponent = RemoveComponent;

    canvasDOM.addEventListener('mousedown', onMouseDown );
    canvasDOM.addEventListener('mousemove', onMouseMove );
    canvasDOM.addEventListener('keydown', onKeyDown );
    canvasDOM.addEventListener('keyup', onKeyUp );
    canvasDOM.addEventListener('drop', onDrop );
    canvasDOM.addEventListener('dragover', allowDrop );
}

/**
 * Destroy draggable events.
 */
export const DestroyDraggable = (): void => {
    if( canvasDOM ) {
        canvasDOM.removeEventListener('mousedown', onMouseDown );
        canvasDOM.removeEventListener('mousemove', onMouseMove );
        canvasDOM.removeEventListener('keypress', onKeyDown );
        canvasDOM.removeEventListener('dragover', allowDrop );
    }
}

/**
 * Mouse down event.
 * 
 * @param event MouseEvent
 */
const onMouseDown = ( event: MouseEvent ): void => {
    // if( ! cwComponents.length ) return;

    const canvasEvent = getCanvasCursorPos( event );

    // Move canvas
    if( listenMovingCanvas && ! isMovingCanvas ) {
        isMovingCanvas = true;
        prevCursorPos = { ...canvasEvent };
        tempComponents = cwComponents.map(object => ({ ...object }));
        canvasDOM.style.cursor = 'grabbing';
        canvasDOM.addEventListener('mouseup', onMouseUp );
        return;
    }

    const revComponents = [ ...cwComponents ].reverse();
    // Loop each components for hit.
    for( let comp of revComponents ) {
        let compDimension = {
            x: comp.x,
            y: comp.y,
            w: 0,
            h: 0,
        }

        switch( comp.type ) {
            case 'box':
                const c = comp as BoxComponent;
                compDimension.w = c.w;
                compDimension.h = c.h;
                break;
        }

        if( ! isDragging && rectCollision(canvasEvent.x, canvasEvent.y, compDimension ) ) {
            isDragging = true;
            dragCompIndex = reversedIndexOf( revComponents, comp );
            offset.x = canvasEvent.x - comp.x;
            offset.y = canvasEvent.y - comp.y;

            canvasDOM.addEventListener('mouseup', onMouseUp );
            break;
        }

        if( ! isResizing && dragCompIndex !== -1 ) {
            const selectionBoxes = getSelectionBoxCords( compDimension );
            // Loop each selection boxes for hit.
            selectionBoxes.every( ( box, index ) => {
                if( rectCollision(canvasEvent.x, canvasEvent.y, box ) ) {
                    isResizing = true;
                    prevCursorPos = { ...canvasEvent };
                    resizePrevCompPos = { ...compDimension };
                    resizeBoxIndex = index;

                    canvasDOM.addEventListener('mouseup', onMouseUp );
                    return false;
                }

                return true;
            } )
            // Break loop for components if resizing.
            if( isResizing ) {
                break;
            }
        }
    }

    if( ! isDragging && ! isResizing ) {
        dragCompIndex = -1;
        resizeBoxIndex = -1;
    }
    triggerComponentSelect();
}

/**
 * Mouse move event.
 * 
 * @param event MouseEvent
 */
const onMouseMove = ( event: MouseEvent ): void => {
    const canvasEvent = getCanvasCursorPos( event );

    if( listenMovingCanvas ) {
        if( isMovingCanvas ) {

            // Move canvas.
            let cursorChangeX = prevCursorPos.x - canvasEvent.x;
            let cursorChangeY = prevCursorPos.y - canvasEvent.y;

            for( let index = 0; index < cwComponents.length; index++ ) {
                cwComponents[index].x = tempComponents[index].x - cursorChangeX;
                cwComponents[index].y = tempComponents[index].y - cursorChangeY;
            }
            cwRender();
        }
    } else if( isDragging && ! isResizing && dragCompIndex !== -1 ) {

        // Drag component.
        const cords = getSnapCords( canvasEvent.x - offset.x, canvasEvent.y - offset.y );
        cwComponents[dragCompIndex].x = cords.x;
        cwComponents[dragCompIndex].y = cords.y;
        cwRender();
    } else if( isResizing && dragCompIndex !== -1 ) {

        // Resize box draw.
        let cursorChangeX = prevCursorPos.x - canvasEvent.x;
        let cursorChangeY = prevCursorPos.y - canvasEvent.y;

        let cursorChangeReverseX = canvasEvent.x - prevCursorPos.x;
        let cursorChangeReverseY = canvasEvent.y - prevCursorPos.y;

        if( [ 0, 6, 7 ].includes( resizeBoxIndex ) ) {
            cwComponents[dragCompIndex].x = resizePrevCompPos.x - cursorChangeX;
            cwComponents[dragCompIndex].w = resizePrevCompPos.w + cursorChangeX;
        }
        if( [ 0, 1, 2 ].includes( resizeBoxIndex ) ) {
            cwComponents[dragCompIndex].y = resizePrevCompPos.y - cursorChangeY;
            cwComponents[dragCompIndex].h = resizePrevCompPos.h + cursorChangeY;
        }
        if( [ 2, 3, 4 ].includes( resizeBoxIndex ) ) {
            cwComponents[dragCompIndex].w = resizePrevCompPos.w + cursorChangeReverseX;
        }
        if( [ 4, 5, 6 ].includes( resizeBoxIndex ) ) {
            cwComponents[dragCompIndex].h = resizePrevCompPos.h + cursorChangeReverseY;
        }

        // Maintain minimum weidth and height.
        if( cwComponents[dragCompIndex].w <= BOX_MIN_WIDTH ) {
            cwComponents[dragCompIndex].w = BOX_MIN_WIDTH;
        }
        if( cwComponents[dragCompIndex].h <= BOX_MIN_HEIGHT ) {
            cwComponents[dragCompIndex].h = BOX_MIN_HEIGHT;
        }

        const cords = getSnapCords( cwComponents[dragCompIndex].x, cwComponents[dragCompIndex].y );
        const size = getSnapSize( cwComponents[dragCompIndex].w, cwComponents[dragCompIndex].h );

        cwComponents[dragCompIndex].x = cords.x;
        cwComponents[dragCompIndex].y = cords.y;
        cwComponents[dragCompIndex].w = size.w;
        cwComponents[dragCompIndex].h = size.h;

        cwRender();
    } else {
        canvasDOM.style.cursor = 'default';
        cwComponents.every( ( comp, index ) => {
            let compDimension = {
                x: comp.x,
                y: comp.y,
                w: 0,
                h: 0,
            }
    
            switch( comp.type ) {
                case 'box':
                    const c = comp as BoxComponent;
                    compDimension.w = c.w;
                    compDimension.h = c.h;
                    break;
            }

            if( rectCollision(canvasEvent.x, canvasEvent.y, compDimension ) ) {
                canvasDOM.style.cursor = 'move'; // On hover over draggable box.
                return false;
            }

            let selectionBoxActive = false;
            if( index === dragCompIndex ) {
                const selectionBoxes = getSelectionBoxCords( compDimension );
                selectionBoxes.every( ( box, index ) => {
                    if( rectCollision(canvasEvent.x, canvasEvent.y, box ) ) {
                        canvasDOM.style.cursor = SELECTION_RESIZE_BOX_CURSORS[index] || 'move';
                        selectionBoxActive = true;
                        return false;
                    }
                    return true;
                } )
            }

            if( selectionBoxActive ) return false;
            return true;
        } );
    }
}

/**
 * Mouse up event.
 */
const onMouseUp = (): void => {
    if ( isMovingCanvas ) {
        canvasDOM.style.cursor = 'grab';
    }
    isDragging = false;
    isResizing = false;
    isMovingCanvas = false;
    tempComponents = [];
    canvasDOM.removeEventListener('mouseup', onMouseUp );
}

/**
 * Key down event.
 * 
 * @param event KeyboardEvent
 */
const onKeyDown = ( event: KeyboardEvent ): void => {
    if( event.key === ' ' && ! listenMovingCanvas ) {
        event.preventDefault();
        canvasDOM.style.cursor = 'grab'
        listenMovingCanvas = true;
    } if( ( event.key.toLowerCase() === 'delete' || event.key.toLowerCase() === 'backspace' ) && dragCompIndex !== -1 ) {
        event.preventDefault();
        const tempIndex = dragCompIndex;
        dragCompIndex = -1;
        setTimeout( () => {
            removeComponent( tempIndex );
            triggerComponentSelect();
        }, 100 )
    }
}

/**
 * Key up event.
 * 
 * @param event KeyboardEvent
 */
const onKeyUp = ( event: KeyboardEvent ): void => {
    if( event.key === ' ' ) {
        listenMovingCanvas = false;
        isMovingCanvas = false;
        tempComponents = [];
        canvasDOM.style.cursor = 'default'
    }
}

/**
 * Allow drop over canvas.
 * 
 * @param ev Event
 */
const allowDrop = ( event: any ): any => {
    event.preventDefault();
} 

const onDrop = ( event: any ) => {
    event.preventDefault();
    if( event.dataTransfer ) {
        const id = event.dataTransfer.getData('id');
        const cursorPos = getCanvasCursorPos( event );

        switch( id ) {
            case 'box':
                const length = cwComponents.push( getDefaultBoxData( cursorPos.x, cursorPos.y ) );
                dragCompIndex = length - 1;
                triggerComponentSelect();
                cwRender();
                break;
        }
    }

}

/**
 * Rectangular collision detection.
 * 
 * @param x Cursor X.
 * @param y Cursor Y
 * @param rect Rectangle coords.
 * @returns boolean
 */
const rectCollision = ( x: number, y: number, rect: { x: number, y: number, w: number, h: number } ): boolean => {
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

/**
 * Get cursor position in canvas.
 * 
 * @param event MouseEvent
 * @returns object
 */
const getCanvasCursorPos = ( event: MouseEvent ): { x: number, y: number} => {
    const canvasRect = canvasDOM.getBoundingClientRect();
    return { x: event.clientX - canvasRect.left, y: event.clientY - canvasRect.top }
}

/**
 * Trigger component select event. 'cwComponentSelected'
 */
const triggerComponentSelect = (): void => {
    if( canvasDOM ) {
        canvasDOM.dispatchEvent( new CustomEvent('cwComponentSelected', { 
            detail:  { 
                index: dragCompIndex, 
                component: cwComponents[dragCompIndex] 
            } 
        }) );
    }
}

/**
 * Trigger component moving event. 'cwComponentMoving'
 */
// const triggerComponentMoving = (): void => {
//     if( canvasDOM ) {
//         canvasDOM.dispatchEvent( new CustomEvent('cwComponentMoving', { 
//             detail:  { 
//                 components: cwComponents,
//             }
//         }) );
//     }
// }