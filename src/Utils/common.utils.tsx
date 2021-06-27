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
 * Custom Log with tag.
 * 
 * @param message Any values to log.
 */
export const log = ( ...message: any[] ) => {
    console.log( logTag, ...message );
}
