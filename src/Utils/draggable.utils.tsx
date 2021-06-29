import { BOX_MIN_HEIGHT, BOX_MIN_WIDTH, SELECTION_RESIZE_BOX_CURSORS } from "../Constants/canvas.constants";
import { BoxComponent, CanvasComponent } from "../Dtos/canvas.dtos";
import { getSelectionBoxCords, log, reversedIndexOf } from "./common.utils";

let cwComponents: CanvasComponent[];
let canvasDOM: HTMLCanvasElement;
let cwRender: Function;

let isDragging = false;
let isResizing = false;
let dragCompIndex = -1;
let resizeBoxIndex = -1;
let offset = {x: 0, y: 0};
let resizePrevCompPos = {x: 0, y: 0, w: 0, h: 0};
let resizeCursorPos = {x: 0, y: 0};

export const RegisterDraggable = ( canvas: HTMLCanvasElement, components: CanvasComponent[], render: Function ): void => {
    cwComponents = components;
    canvasDOM = canvas;
    cwRender = render;

    canvasDOM.addEventListener('mousedown', onMouseDown );
    canvasDOM.addEventListener('mousemove', onMouseMove );
}

export const DestroyDraggable = (): void => {
    if( canvasDOM ) {
        canvasDOM.removeEventListener('mousedown', onMouseDown );
        canvasDOM.removeEventListener('mousemove', onMouseMove );
    }
}

const onMouseDown = ( event: MouseEvent ): void => {
    if( ! cwComponents.length ) return;

    const revComponents = [ ...cwComponents ].reverse();
    const canvasEvent = getCanvasEvent( event );
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
                    resizeCursorPos = { ...canvasEvent };
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

const onMouseMove = ( event: MouseEvent ): void => {
    const canvasEvent = getCanvasEvent( event );
    if( isDragging && ! isResizing && dragCompIndex !== -1 ) {

        cwComponents[dragCompIndex].x = canvasEvent.x - offset.x;
        cwComponents[dragCompIndex].y = canvasEvent.y - offset.y;
        cwRender();
    } else if( isResizing && dragCompIndex !== -1 ) {

        // Resize box draw.
        let cursorChangeX = resizeCursorPos.x - canvasEvent.x;
        let cursorChangeY = resizeCursorPos.y - canvasEvent.y;

        let cursorChangeReverseX = canvasEvent.x - resizeCursorPos.x;
        let cursorChangeReverseY = canvasEvent.y - resizeCursorPos.y;

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

        cwRender();
    } else {
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

            canvasDOM.style.cursor = 'default';

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

const onMouseUp = (): void => {
    isDragging = false;
    isResizing = false;
    canvasDOM.removeEventListener('mouseup', onMouseUp );
}

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

const getCanvasEvent = ( event: MouseEvent ): { x: number, y: number} => {
    const canvasRect = canvasDOM.getBoundingClientRect();
    return { x: event.clientX - canvasRect.left, y: event.clientY - canvasRect.top }
}

const triggerComponentSelect = (): void => {
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