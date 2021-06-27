import { log } from "./common.utils";

/**
 * Render Time.
 */
let renderTime: number;

/**
 * Time Logger class.
 */
export const TimeLogger = {
    /**
     * Start recording time.
     */
    start: () => {
        renderTime = Date.now();
    },
    /**
     * Stop recording time and Log final elapsed time.
     * @param prefix Prefix value for log.
     */
    stop: ( prefix?: string ) => {
        const elapseTime = Date.now() - renderTime;
        log( 
            prefix ? prefix + ' Time:' : 'Time:', 
            elapseTime < 1000 ? elapseTime + 'ms' : (elapseTime / 1000) + 's'
        );
    }
}