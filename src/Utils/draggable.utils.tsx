import {
    BOX_MIN_HEIGHT,
    BOX_MIN_WIDTH,
    OPTION_HEIGHT,
    SELECTION_RESIZE_BOX_CURSORS
} from '../Constants/canvas.constants';
import { CanvasComponent, CanvasData, CanvasLine } from '../Dtos/canvas.dtos';
import {
    getDefaultBoxData,
    getDrawLineButtonCords,
    getLineJoints,
    getLinePath,
    getSelectionBoxCords,
    getSnapCords,
    getSnapSize,
    linePointCollision,
    rectCollision,
    reversedIndexOf
} from './common.utils';
import { drawLine, drawLineHover } from './draw.utils';

let cwRender: Function;
let canvasDOM: HTMLCanvasElement;
let cwComponents: CanvasComponent[];
let cwData: CanvasData;
let tempComponents: CanvasComponent[];

let removeComponent: (index: number) => void;

let isDragging = false;
let isResizing = false;
let listenMovingCanvas = false;
let isMovingCanvas = false;
let isDrawingLine = false;
let isMovingJoint = false;
let isLineHover = false;

let dragCompIndex = -1;
let dragLineIndex = -1;
let resizeBoxIndex = -1;
let startDrawLineIndex = -1;

let offset = { x: 0, y: 0 };
let resizePrevCompPos = { x: 0, y: 0, w: 0, h: 0 };
let prevCursorPos = { x: 0, y: 0 };
let lineStartPos = { x: 0, y: 0 };

/**
 * Register draggable events.
 *
 * @param canvas Canvas
 * @param components Component array
 * @param render Render function of canvas.
 */
export const RegisterDraggable = (
    canvas: HTMLCanvasElement,
    canvasData: CanvasData,
    render: Function,
    RemoveComponent: (index: number) => void
): void => {
    cwComponents = canvasData.components || [];
    cwData = canvasData;
    canvasDOM = canvas;
    cwRender = render;
    removeComponent = RemoveComponent;

    canvasDOM.addEventListener('mousedown', onMouseDown);
    canvasDOM.addEventListener('mousemove', onMouseMove);
    canvasDOM.addEventListener('keydown', onKeyDown);
    canvasDOM.addEventListener('keyup', onKeyUp);
    canvasDOM.addEventListener('drop', onDrop);
    canvasDOM.addEventListener('dragover', allowDrop);
};

/**
 * Destroy draggable events.
 */
export const DestroyDraggable = (): void => {
    if (canvasDOM) {
        canvasDOM.removeEventListener('mousedown', onMouseDown);
        canvasDOM.removeEventListener('mousemove', onMouseMove);
        canvasDOM.removeEventListener('keypress', onKeyDown);
        canvasDOM.removeEventListener('dragover', allowDrop);
    }
};

/**
 * Mouse down event.
 *
 * @param event MouseEvent
 */
const onMouseDown = (event: MouseEvent): void => {
    const canvasEvent = getCanvasCursorPos(event);

    // Move canvas
    if (listenMovingCanvas && !isMovingCanvas) {
        isMovingCanvas = true;
        prevCursorPos = { ...canvasEvent };
        tempComponents = cwComponents.map((object) => ({ ...object }));
        canvasDOM.style.cursor = 'grabbing';
        canvasDOM.addEventListener('mouseup', onMouseUp);
        return;
    }

    if (
        !isMovingCanvas &&
        !isDragging &&
        !isDrawingLine &&
        dragCompIndex > -1
    ) {
        const arrowBoxes = getDrawLineButtonCords(cwComponents[dragCompIndex]);
        arrowBoxes.reverse().every((box, index) => {
            if (rectCollision(canvasEvent.x, canvasEvent.y, box)) {
                lineStartPos.x = box.x - 5;
                lineStartPos.y = box.y + OPTION_HEIGHT / 2;
                isDrawingLine = true;
                startDrawLineIndex = index;
                canvasDOM.addEventListener('mouseup', onMouseUp);
                return false;
            }
            return true;
        });
    }

    if (!isMovingJoint && cwData.lines) {
        const revLines = [...cwData.lines].reverse();
        for (let line of revLines) {
            const linePath = getLinePath(line, cwComponents);
            const joints = getLineJoints(line, linePath, cwComponents);
            if (linePath && linePointCollision(canvasEvent, linePath, joints)) {
                dragLineIndex = reversedIndexOf(revLines, line);
                isMovingJoint = true;
                canvasDOM.addEventListener('mouseup', onMouseUp);
                break;
            }
        }
    }

    if (!isMovingJoint) {
        const revComponents = [...cwComponents].reverse();
        // Loop each components for hit.
        for (let comp of revComponents) {
            let compDimension = {
                x: comp.x,
                y: comp.y,
                w: comp.w,
                h: comp.h
            };

            if (
                !isDragging &&
                rectCollision(canvasEvent.x, canvasEvent.y, compDimension)
            ) {
                isDragging = true;
                dragCompIndex = reversedIndexOf(revComponents, comp);
                offset.x = canvasEvent.x - comp.x;
                offset.y = canvasEvent.y - comp.y;

                canvasDOM.addEventListener('mouseup', onMouseUp);
                break;
            }

            if (!isResizing && dragCompIndex !== -1) {
                const selectionBoxes = getSelectionBoxCords(compDimension);
                // Loop each selection boxes for hit.
                selectionBoxes.every((box, index) => {
                    if (rectCollision(canvasEvent.x, canvasEvent.y, box)) {
                        isResizing = true;
                        prevCursorPos = { ...canvasEvent };
                        resizePrevCompPos = { ...compDimension };
                        resizeBoxIndex = index;

                        canvasDOM.addEventListener('mouseup', onMouseUp);
                        return false;
                    }

                    return true;
                });
                // Break loop for components if resizing.
                if (isResizing) {
                    break;
                }
            }
        }
    }

    if (!isDragging && !isResizing && !isDrawingLine) {
        dragCompIndex = -1;
        resizeBoxIndex = -1;
        startDrawLineIndex = -1;
    }

    if (!isMovingJoint) {
        dragLineIndex = -1;
    }

    triggerComponentSelect();
    triggerLineSelect();
};

/**
 * Mouse move event.
 *
 * @param event MouseEvent
 */
const onMouseMove = (event: MouseEvent): void => {
    const canvasEvent = getCanvasCursorPos(event);
    const ctx = canvasDOM.getContext('2d');

    if (listenMovingCanvas) {
        if (isMovingCanvas) {
            // Move canvas.
            let cursorChangeX = prevCursorPos.x - canvasEvent.x;
            let cursorChangeY = prevCursorPos.y - canvasEvent.y;

            for (let index = 0; index < cwComponents.length; index++) {
                const cords = getSnapCords(
                    tempComponents[index].x - cursorChangeX,
                    tempComponents[index].y - cursorChangeY
                );
                cwComponents[index].x = cords.x;
                cwComponents[index].y = cords.y;
            }
            cwRender();
        }
    } else if (
        isDrawingLine &&
        !isDragging &&
        !isResizing &&
        dragCompIndex !== -1 &&
        ctx
    ) {
        canvasDOM.style.cursor = 'grabbing';
        cwRender();
        drawLine(ctx, { start: lineStartPos, end: canvasEvent });
    } else if (isDragging && !isResizing && dragCompIndex !== -1) {
        // Drag component.
        const cords = getSnapCords(
            canvasEvent.x - offset.x,
            canvasEvent.y - offset.y
        );
        cwComponents[dragCompIndex].x = cords.x;
        cwComponents[dragCompIndex].y = cords.y;
        cwRender();
    } else if (isResizing && dragCompIndex !== -1) {
        // Resize box draw.
        let cursorChangeX = prevCursorPos.x - canvasEvent.x;
        let cursorChangeY = prevCursorPos.y - canvasEvent.y;

        let cursorChangeReverseX = canvasEvent.x - prevCursorPos.x;
        let cursorChangeReverseY = canvasEvent.y - prevCursorPos.y;

        if ([0, 6, 7].includes(resizeBoxIndex)) {
            cwComponents[dragCompIndex].x = resizePrevCompPos.x - cursorChangeX;
            cwComponents[dragCompIndex].w = resizePrevCompPos.w + cursorChangeX;
        }
        if ([0, 1, 2].includes(resizeBoxIndex)) {
            cwComponents[dragCompIndex].y = resizePrevCompPos.y - cursorChangeY;
            cwComponents[dragCompIndex].h = resizePrevCompPos.h + cursorChangeY;
        }
        if ([2, 3, 4].includes(resizeBoxIndex)) {
            cwComponents[dragCompIndex].w =
                resizePrevCompPos.w + cursorChangeReverseX;
        }
        if ([4, 5, 6].includes(resizeBoxIndex)) {
            cwComponents[dragCompIndex].h =
                resizePrevCompPos.h + cursorChangeReverseY;
        }

        // Maintain minimum weidth and height.
        if (cwComponents[dragCompIndex].w <= BOX_MIN_WIDTH) {
            cwComponents[dragCompIndex].w = BOX_MIN_WIDTH;
        }
        if (cwComponents[dragCompIndex].h <= BOX_MIN_HEIGHT) {
            cwComponents[dragCompIndex].h = BOX_MIN_HEIGHT;
        }

        const cords = getSnapCords(
            cwComponents[dragCompIndex].x,
            cwComponents[dragCompIndex].y
        );
        const size = getSnapSize(
            cwComponents[dragCompIndex].w,
            cwComponents[dragCompIndex].h
        );

        cwComponents[dragCompIndex].x = cords.x;
        cwComponents[dragCompIndex].y = cords.y;
        cwComponents[dragCompIndex].w = size.w;
        cwComponents[dragCompIndex].h = size.h;

        cwRender();
    } else {
        canvasDOM.style.cursor = 'default';

        if (ctx && cwData.lines) {
            if (isLineHover) {
                cwRender(false);
                isLineHover = false;
            }

            const revLines = [...cwData.lines].reverse();

            revLines.every((line) => {
                const linePath = getLinePath(line, cwComponents);
                const joints = getLineJoints(line, linePath, cwComponents);
                const originalIndex = reversedIndexOf(revLines, line);

                if (
                    linePath &&
                    linePointCollision(canvasEvent, linePath, joints)
                ) {
                    canvasDOM.style.cursor = 'crosshair';

                    if (originalIndex !== dragLineIndex) {
                        cwRender(false);
                        drawLineHover(ctx, linePath, joints);
                        drawLine(ctx, linePath, joints);
                        isLineHover = true;
                    }
                    return false;
                }
                return true;
            });
        }

        if (dragCompIndex > -1) {
            getDrawLineButtonCords(cwComponents[dragCompIndex]).every((box) => {
                if (rectCollision(canvasEvent.x, canvasEvent.y, box)) {
                    canvasDOM.style.cursor = 'grab';
                    return false;
                }
                return true;
            });
        }

        cwComponents.every((comp, index) => {
            let compDimension = {
                x: comp.x,
                y: comp.y,
                w: comp.w,
                h: comp.h
            };

            if (rectCollision(canvasEvent.x, canvasEvent.y, compDimension)) {
                canvasDOM.style.cursor = 'move'; // On hover over draggable box.
                return false;
            }

            let selectionBoxActive = false;
            if (index === dragCompIndex) {
                const selectionBoxes = getSelectionBoxCords(compDimension);
                selectionBoxes.every((box, index) => {
                    if (rectCollision(canvasEvent.x, canvasEvent.y, box)) {
                        canvasDOM.style.cursor =
                            SELECTION_RESIZE_BOX_CURSORS[index] || 'move';
                        selectionBoxActive = true;
                        return false;
                    }
                    return true;
                });
            }

            if (selectionBoxActive) return false;
            return true;
        });
    }
};

/**
 * Mouse up event.
 */
const onMouseUp = (event: MouseEvent): void => {
    const canvasEvent = getCanvasCursorPos(event);

    if (isMovingCanvas) {
        canvasDOM.style.cursor = 'grab';
    }
    if (isDrawingLine) {
        canvasDOM.style.cursor = 'grab';
        const revComponents = [...cwComponents].reverse();
        for (let comp of revComponents) {
            let compDimension = {
                x: comp.x,
                y: comp.y,
                w: comp.w,
                h: comp.h
            };

            if (rectCollision(canvasEvent.x, canvasEvent.y, compDimension)) {
                const dropedIndex = reversedIndexOf(revComponents, comp);
                if (dropedIndex !== dragCompIndex) {
                    const startComp = cwComponents[dragCompIndex];

                    if (startComp.options && startComp.options.length) {
                        const line: CanvasLine = {
                            componentKey: startComp.key,
                            optionKey:
                                startComp.options[startDrawLineIndex].key,
                            targetKey: cwComponents[dropedIndex].key,
                            joints: []
                        };
                        if (cwData.lines && cwData.lines.length) {
                            cwData.lines.push(line);
                        } else {
                            cwData.lines = [line];
                        }
                    }
                }
                break;
            }
        }
    }
    isDragging = false;
    isResizing = false;
    isMovingCanvas = false;
    isMovingJoint = false;
    isDrawingLine = false;
    tempComponents = [];
    canvasDOM.removeEventListener('mouseup', onMouseUp);
    cwRender();
};

/**
 * Key down event.
 *
 * @param event KeyboardEvent
 */
const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === ' ' && !listenMovingCanvas) {
        event.preventDefault();
        canvasDOM.style.cursor = 'grab';
        listenMovingCanvas = true;
    }
    if (
        event.key.toLowerCase() === 'delete' ||
        event.key.toLowerCase() === 'backspace'
    ) {
        if (dragLineIndex !== -1) {
            // To-do Remove Line.
            // event.preventDefault();
            // const tempIndex = dragCompIndex;
            // dragLineIndex = -1;
            // setTimeout( () => {
            //     // removeComponent( tempIndex );
            //     triggerLineSelect();
            // }, 100 )
        } else if (dragCompIndex !== -1) {
            event.preventDefault();
            const tempIndex = dragCompIndex;
            dragCompIndex = -1;
            setTimeout(() => {
                removeComponent(tempIndex);
                triggerComponentSelect();
            }, 100);
        }
    }
};

/**
 * Key up event.
 *
 * @param event KeyboardEvent
 */
const onKeyUp = (event: KeyboardEvent): void => {
    if (event.key === ' ') {
        listenMovingCanvas = false;
        isMovingCanvas = false;
        tempComponents = [];
        canvasDOM.style.cursor = 'default';
    }
};

/**
 * Allow drop over canvas.
 *
 * @param ev Event
 */
const allowDrop = (event: any): any => {
    event.preventDefault();
};

/**
 * Drop element event.
 *
 * @param event Event
 */
const onDrop = (event: any) => {
    event.preventDefault();
    if (event.dataTransfer) {
        const id = event.dataTransfer.getData('id');
        const cursorPos = getCanvasCursorPos(event);

        switch (id) {
            case 'box':
                const length = cwComponents.push(
                    getDefaultBoxData(cursorPos.x, cursorPos.y)
                );
                dragCompIndex = length - 1;
                triggerComponentSelect();
                cwRender();
                break;
        }
    }
};

/**
 * Get cursor position in canvas.
 *
 * @param event MouseEvent
 * @returns object
 */
const getCanvasCursorPos = (event: MouseEvent): { x: number; y: number } => {
    const canvasRect = canvasDOM.getBoundingClientRect();
    return {
        x: event.clientX - canvasRect.left,
        y: event.clientY - canvasRect.top
    };
};

/**
 * Trigger component select event. 'cwComponentSelected'
 */
const triggerComponentSelect = (): void => {
    if (canvasDOM) {
        canvasDOM.dispatchEvent(
            new CustomEvent('cwComponentSelected', {
                detail: {
                    index: dragCompIndex,
                    component: cwComponents[dragCompIndex]
                }
            })
        );
    }
};

/**
 * Trigger line select event. 'cwLineSelected'
 */
const triggerLineSelect = (): void => {
    if (canvasDOM) {
        canvasDOM.dispatchEvent(
            new CustomEvent('cwLineSelected', {
                detail: {
                    index: dragLineIndex,
                    line: cwData.lines && cwData.lines[dragLineIndex]
                }
            })
        );
    }
};
