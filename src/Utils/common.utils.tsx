import { BorderRadius, BorderRadiusBase } from "../Dtos/canvas.dtos";

/**
 * Log tag.
 */
const logTag = 'CanvasWorkflow:';

/**
 * Debounce the given function.
 * 
 * @param func Function.
 * @param timeout Timeout in ms.
 * @returns Function.
 */
export function debounce(func: Function, timeout = 300){
    let timer: number;
    return (...args: any[]) => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

/**
 * Get reversed index of item in array.
 * 
 * @param arr Arrays
 * @param item Item in array
 * @returns number
 */
export const reversedIndexOf = function( arr: any[], item: any){
    const { length } = arr;
    const index = arr.indexOf(item);
    if(index === -1){
       return -1;
    };
    return length - index - 1;
};

/**
 * Format the border radius.
 * 
 * @param borderRadius BorderRadius
 * @returns BorderRadiusBase
 */
export const formatBorderRadius = ( borderRadius?: BorderRadius ): BorderRadiusBase => {
    if( typeof borderRadius !== 'number' ) {
        return { ...{ tl: 0, tr: 0, br: 0, bl: 0 }, ...borderRadius };
    }
    
    return { 
        tl: borderRadius as number, 
        tr: borderRadius as number, 
        br: borderRadius as number, 
        bl: borderRadius as number 
    };
}

/**
 * Get selection box coordinates.
 * 
 * @param compDimension Component Dimension.
 * @param strokeOffset Selection stroke offset.
 * @param boxSize Box size.
 * @returns Array
 */
export const getSelectionBoxCords = ( compDimension: { x: number, y: number, w: number, h: number }, strokeOffset: number, boxSize: number ) => {
    let boxCords: { x: number, y: number, w: number, h: number }[] = [];

    for( let i = 1; i <= 8; i++ ) {
        let boxCord = {
            x: 0,
            y: 0,
            w: boxSize,
            h: boxSize,
        }

        if( [ 1, 7, 8 ].includes(i) ) {
            boxCord.x = compDimension.x - strokeOffset - (boxSize / 2);
        } else if( [ 2, 6 ].includes(i) ) {
            boxCord.x = compDimension.x + ( compDimension.w / 2 ) + ( strokeOffset / 2 ) - (boxSize / 2);
        } else if( [ 3, 4, 5 ].includes(i) ) {
            boxCord.x = compDimension.x + compDimension.w + strokeOffset - (boxSize / 2);
        }

        if( [ 1, 2, 3 ].includes(i) ) {
            boxCord.y = compDimension.y - strokeOffset - (boxSize / 2);
        } else if( [ 4, 8 ].includes(i) ) {
            boxCord.y = compDimension.y + ( compDimension.h / 2 ) + ( strokeOffset / 2 ) - (boxSize / 2);
        } else if( [ 5, 6, 7 ].includes(i) ) {
            boxCord.y = compDimension.y + compDimension.h + strokeOffset - (boxSize / 2);
        }

        boxCords.push( boxCord );
    }

    return boxCords;
}

/**
 * Custom Log with tag.
 * 
 * @param message Any values to log.
 */
export const log = ( ...message: any[] ) => {
    console.log( logTag, ...message );
}
