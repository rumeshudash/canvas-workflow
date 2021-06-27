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

export const reversedIndexOf = function( arr: any[], item: any){
    const { length } = arr;
    const index = arr.indexOf(item);
    if(index === -1){
       return -1;
    };
    return length - index - 1;
};

/**
 * Custom Log with tag.
 * 
 * @param message Any values to log.
 */
export const log = ( ...message: any[] ) => {
    console.log( logTag, ...message );
}
