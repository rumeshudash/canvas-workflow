import {
    CANVAS_GRID_SIZE,
    LINE_BEND_TENSION,
    MIN_LINE_BEND_MARGIN,
    OPTION_HEIGHT,
    SELECTION_BOX_OFFSET,
    SELECTION_RESIZE_BOX_SIZE
} from '../Constants/canvas.constants';
import {
    BorderRadius,
    BorderRadiusBase,
    BoxComponent,
    CanvasComponent,
    CanvasLine,
    Point
} from '../Dtos/canvas.dtos';
import { ComponentHelper } from './componentHelper';

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
export function debounce(func: Function, timeout = 300) {
    let timer: number;
    return (...args: any[]) => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
}

/**
 * Checks if two given objects are same
 * NOTE: Mainly used in persitance for identifying if two params are same
 * @param  {object} object
 * @param  {object} otherObject
 */
export function IsEqualObject(object: any, otherObject: any) {
    let objKeys = Object.keys(object || {}),
        otherKeys = Object.keys(otherObject || {});

    // Check length of object matches.
    if (objKeys.length !== otherKeys.length) {
        return false;
    }

    // Check index keys matches.
    for (let objKey in objKeys) {
        if (objKeys[objKey] !== otherKeys[objKey]) {
            return false;
        }
    }

    // Check array inside object.
    for (let objKey of objKeys) {
        if (Array.isArray(object[objKey])) {
            if (object[objKey].length !== otherObject[objKey].length) {
                return false;
            }

            for (let i = 0; i < object[objKey].length; i++) {
                if (object[objKey][i] !== otherObject[objKey][i]) {
                    return false;
                }
            }
        } else if (object[objKey] !== otherObject[objKey]) {
            return false;
        }
    }
    return true;
}

/**
 * Get reversed index of item in array.
 *
 * @param arr Arrays
 * @param item Item in array
 * @returns number
 */
export const reversedIndexOf = (arr: any[], item: any): number => {
    const { length } = arr;
    const index = arr.indexOf(item);
    if (index === -1) {
        return -1;
    }
    return length - index - 1;
};

/**
 * Format the border radius.
 *
 * @param borderRadius BorderRadius
 * @returns BorderRadiusBase
 */
export const formatBorderRadius = (
    borderRadius?: BorderRadius
): BorderRadiusBase => {
    const defaultBorder = { tl: 0, tr: 0, br: 0, bl: 0 };

    if (typeof borderRadius === 'undefined') {
        return defaultBorder;
    }

    if (typeof borderRadius !== 'number') {
        return { ...defaultBorder, ...borderRadius };
    }

    return {
        tl: borderRadius as number,
        tr: borderRadius as number,
        br: borderRadius as number,
        bl: borderRadius as number
    };
};

/**
 * Get selection box coordinates.
 *
 * @param compDimension Component Dimension.
 * @param strokeOffset Selection stroke offset.
 * @param boxSize Box size.
 * @returns Array
 */
export const getSelectionBoxCords = (compDimension: {
    x: number;
    y: number;
    w: number;
    h: number;
}): { x: number; y: number; w: number; h: number }[] => {
    let boxCords: { x: number; y: number; w: number; h: number }[] = [];

    for (let i = 1; i <= 8; i++) {
        let boxCord = {
            x: 0,
            y: 0,
            w: SELECTION_RESIZE_BOX_SIZE,
            h: SELECTION_RESIZE_BOX_SIZE
        };

        if ([1, 7, 8].includes(i)) {
            boxCord.x =
                compDimension.x -
                SELECTION_BOX_OFFSET -
                SELECTION_RESIZE_BOX_SIZE / 2;
        } else if ([2, 6].includes(i)) {
            boxCord.x =
                compDimension.x +
                compDimension.w / 2 +
                SELECTION_BOX_OFFSET / 2 -
                SELECTION_RESIZE_BOX_SIZE / 2;
        } else if ([3, 4, 5].includes(i)) {
            boxCord.x =
                compDimension.x +
                compDimension.w +
                SELECTION_BOX_OFFSET -
                SELECTION_RESIZE_BOX_SIZE / 2;
        }

        if ([1, 2, 3].includes(i)) {
            boxCord.y =
                compDimension.y -
                SELECTION_BOX_OFFSET -
                SELECTION_RESIZE_BOX_SIZE / 2;
        } else if ([4, 8].includes(i)) {
            boxCord.y =
                compDimension.y +
                compDimension.h / 2 +
                SELECTION_BOX_OFFSET / 2 -
                SELECTION_RESIZE_BOX_SIZE / 2;
        } else if ([5, 6, 7].includes(i)) {
            boxCord.y =
                compDimension.y +
                compDimension.h +
                SELECTION_BOX_OFFSET -
                SELECTION_RESIZE_BOX_SIZE / 2;
        }

        boxCords.push(boxCord);
    }

    return boxCords;
};

/**
 * Get Device pixel ratio.
 *
 * @param ctx Canvas Rendering Context 2D.
 * @returns number
 */
export const getDevicePixelRatio = (ctx: CanvasRenderingContext2D) => {
    let dpr = window.devicePixelRatio || 1,
        bsr =
            (ctx as any).webkitBackingStorePixelRatio ||
            (ctx as any).mozBackingStorePixelRatio ||
            (ctx as any).msBackingStorePixelRatio ||
            (ctx as any).oBackingStorePixelRatio ||
            (ctx as any).backingStorePixelRatio ||
            1;

    return dpr / bsr;
};

// https://stackoverflow.com/a/3368855/9784022
/**
 * JavaScript code to detect available availability of a
 * particular font in a browser using JavaScript and CSS.
 */
var FontDetector = function () {
    // a font will be compared against all the three default fonts.
    // and if it doesn't match all 3 then that font is not available.
    const baseFonts = ['monospace', 'sans-serif', 'serif'];

    //we use m or w because these two characters take up the maximum width.
    // And we use a LLi so that the same matching fonts can get separated
    const testString = 'mmmmmmmmmmlli';

    //we test using 72px font size, we may use any size. I guess larger the better.
    const testSize = '72px';

    const h = document.getElementsByTagName('body')[0];

    // create a SPAN in the document to get the width of the text we use to test
    const s = document.createElement('span');
    s.style.fontSize = testSize;
    s.innerHTML = testString;
    let defaultWidth = {};
    let defaultHeight = {};
    for (let index in baseFonts) {
        //get the default width for the three base fonts
        s.style.fontFamily = baseFonts[index];
        h.appendChild(s);
        defaultWidth[baseFonts[index]] = s.offsetWidth; //width for the default font
        defaultHeight[baseFonts[index]] = s.offsetHeight; //height for the defualt font
        h.removeChild(s);
    }

    function detect(font: string) {
        let detected = false;
        for (let index in baseFonts) {
            s.style.fontFamily = font + ',' + baseFonts[index]; // name of the font along with the base font for fallback.
            h.appendChild(s);
            const matched =
                s.offsetWidth != defaultWidth[baseFonts[index]] ||
                s.offsetHeight != defaultHeight[baseFonts[index]];
            h.removeChild(s);
            detected = detected || matched;
        }
        return detected;
    }

    this.detect = detect;
    return this;
} as any;

/**
 * Get list of available fonts.
 *
 * @returns string[]
 */
export const getAvailableFontList = (): string[] => {
    let availableList: string[] = [];
    let detector = new FontDetector();
    const fontList = [
        // Windows 10
        'Arial',
        'Arial Black',
        'Bahnschrift',
        'Calibri',
        'Cambria',
        'Cambria Math',
        'Candara',
        'Comic Sans MS',
        'Consolas',
        'Constantia',
        'Corbel',
        'Courier New',
        'Ebrima',
        'Franklin Gothic Medium',
        'Gabriola',
        'Gadugi',
        'Georgia',
        'HoloLens MDL2 Assets',
        'Impact',
        'Ink Free',
        'Javanese Text',
        'Leelawadee UI',
        'Lucida Console',
        'Lucida Sans Unicode',
        'Malgun Gothic',
        'Marlett',
        'Microsoft Himalaya',
        'Microsoft JhengHei',
        'Microsoft New Tai Lue',
        'Microsoft PhagsPa',
        'Microsoft Sans Serif',
        'Microsoft Tai Le',
        'Microsoft YaHei',
        'Microsoft Yi Baiti',
        'MingLiU-ExtB',
        'Mongolian Baiti',
        'MS Gothic',
        'MV Boli',
        'Myanmar Text',
        'Nirmala UI',
        'Palatino Linotype',
        'Segoe MDL2 Assets',
        'Segoe Print',
        'Segoe Script',
        'Segoe UI',
        'Segoe UI Historic',
        'Segoe UI Emoji',
        'Segoe UI Symbol',
        'SimSun',
        'Sitka',
        'Sylfaen',
        'Symbol',
        'Tahoma',
        'Times New Roman',
        'Trebuchet MS',
        'Verdana',
        'Webdings',
        'Wingdings',
        'Yu Gothic',
        // macOS
        'American Typewriter',
        'Andale Mono',
        'Arial',
        'Arial Black',
        'Arial Narrow',
        'Arial Rounded MT Bold',
        'Arial Unicode MS',
        'Avenir',
        'Avenir Next',
        'Avenir Next Condensed',
        'Baskerville',
        'Big Caslon',
        'Bodoni 72',
        'Bodoni 72 Oldstyle',
        'Bodoni 72 Smallcaps',
        'Bradley Hand',
        'Brush Script MT',
        'Chalkboard',
        'Chalkboard SE',
        'Chalkduster',
        'Charter',
        'Cochin',
        'Comic Sans MS',
        'Copperplate',
        'Courier',
        'Courier New',
        'Didot',
        'DIN Alternate',
        'DIN Condensed',
        'Futura',
        'Geneva',
        'Georgia',
        'Gill Sans',
        'Helvetica',
        'Helvetica Neue',
        'Herculanum',
        'Hoefler Text',
        'Impact',
        'Lucida Grande',
        'Luminari',
        'Marker Felt',
        'Menlo',
        'Microsoft Sans Serif',
        'Monaco',
        'Noteworthy',
        'Optima',
        'Palatino',
        'Papyrus',
        'Phosphate',
        'Rockwell',
        'Savoye LET',
        'SignPainter',
        'Skia',
        'Snell Roundhand',
        'Tahoma',
        'Times',
        'Times New Roman',
        'Trattatello',
        'Trebuchet MS',
        'Verdana',
        'Zapfino'
    ].sort();

    for (let font of fontList) {
        if (!availableList.includes(font) && detector.detect(font)) {
            availableList.push(font);
        }
    }

    return availableList;
};

/**
 * Custom Log with tag.
 *
 * @param message Any values to log.
 */
export const log = (...message: any[]): void => {
    console.log(logTag, ...message);
};

export const getDefaultBoxData = (x?: number, y?: number) => {
    let boxData: BoxComponent = {
        key: getUniqueKey(),
        type: 'box',
        title: 'Workflow',
        description: 'Your workflow description here.',
        x: 100,
        y: 100,
        w: 150,
        h: 100,
        lineWidth: 1,
        fillColor: '#ffffff',
        options: [
            {
                key: getUniqueKey(),
                name: 'Always'
            }
        ]
    };

    if (typeof x !== 'undefined') {
        boxData.x = x - boxData.w / 2;
    }
    if (typeof y !== 'undefined') {
        boxData.y = y - boxData.h / 2;
    }

    const cords = getSnapCords(boxData.x, boxData.y);
    boxData.x = cords.x;
    boxData.y = cords.y;

    return boxData;
};

/**
 * Get Snapped coordinates.
 *
 * @param x X coord.
 * @param y Y coord.
 * @returns {x: number, y: number}
 */
export const getSnapCords = (x: number, y: number) => {
    return {
        x: Math.round(x / CANVAS_GRID_SIZE) * CANVAS_GRID_SIZE,
        y: Math.round(y / CANVAS_GRID_SIZE) * CANVAS_GRID_SIZE
    };
};

/**
 * Get Snapped size coordinates.
 *
 * @param w Width coord.
 * @param h Height coord.
 * @returns { w: number, h: number }
 */
export const getSnapSize = (w: number, h: number) => {
    return {
        w: Math.round(w / CANVAS_GRID_SIZE) * CANVAS_GRID_SIZE,
        h: Math.round(h / CANVAS_GRID_SIZE) * CANVAS_GRID_SIZE
    };
};

/**
 * Get Unique key.
 *
 * @returns String
 */
export const getUniqueKey = () => {
    return getRandomValue().toString(36);
};

/**
 * Get random value.
 *
 * @returns number
 */
export const getRandomValue = () => {
    const crypto = window.crypto || (window as any).msCrypto;
    return crypto.getRandomValues(new Uint32Array(1))[0];
};

/**
 * Get angle of line in degree.
 *
 * @param cx Starting line X coord.
 * @param cy Starting line Y coord.
 * @param ex Ending line X coord.
 * @param ey Ending line Y coord.
 * @returns number
 */
export const getLineAngle = (
    cx: number,
    cy: number,
    ex: number,
    ey: number
) => {
    var dy = ey - cy;
    var dx = ex - cx;
    var theta = Math.atan2(dy, dx);
    theta *= 180 / Math.PI;
    if (theta < 0) theta = 360 + theta; // range [0, 360)
    return theta;
};

export const getDrawLineButtonCords = (component: CanvasComponent): any[] => {
    let cords = [];
    if (component.options) {
        const optionsLength = component.options.length;
        const buttonSize = 16;

        for (let i = 1; i <= optionsLength; i++) {
            cords.push({
                x: component.x + component.w + 5,
                y:
                    component.y +
                    component.h -
                    OPTION_HEIGHT * i +
                    (OPTION_HEIGHT - buttonSize) / 2,
                w: buttonSize + 4,
                h: buttonSize
            });
        }
    }

    return cords;
};

export const getComponentByKey = (
    key: string,
    components: CanvasComponent[]
) => {
    if (components && Array.isArray(components)) {
        return components.find((comp) => comp.key === key);
    }
    return null;
};

export const getOptionCoordsByKey = (
    key: string,
    component?: CanvasComponent | null
) => {
    if (component) {
        return getDrawLineButtonCords(component)
            .reverse()
            .find(
                (_, index) =>
                    component.options && component.options[index].key === key
            );
    }
    return null;
};

export const reduceLineSize = (
    start: { x: number; y: number },
    end: { x: number; y: number },
    deduct: number
) => {
    const length = Math.sqrt(
        Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2)
    );
    const t0 = 1 - deduct / length;
    return {
        x: start.x + t0 * (end.x - start.x),
        y: start.y + t0 * (end.y - start.y)
    };
};

export const getLinePath = (
    line: CanvasLine,
    components?: CanvasComponent[]
) => {
    const startComp = getComponentByKey(line.componentKey, components || []);
    const endComp = getComponentByKey(line.targetKey, components || []);
    const startOptionCoords = getOptionCoordsByKey(line.optionKey, startComp);

    let points: { start: Point; end: Point } | null = null;

    if (startComp && endComp && startOptionCoords) {
        const endCompHelper = new ComponentHelper(endComp);

        points = {
            start: {
                x: startOptionCoords.x - 5,
                y: startOptionCoords.y + startOptionCoords.h / 2
            },
            end: endCompHelper.getLeftPoint()
        };

        if (endCompHelper.isOnTop(points.start, -MIN_LINE_BEND_MARGIN)) {
            points.end = endCompHelper.getBottomPoint();
        } else if (
            endCompHelper.isOnBottom(points.start, MIN_LINE_BEND_MARGIN)
        ) {
            points.end = endCompHelper.getTopPoint();
        }

        if (endCompHelper.isOnLeft(points.start, endComp.w / 2)) {
            points.end = endCompHelper.getRightPoint();
        }
    }

    return points;
};

export const getLineJoints = (
    line: CanvasLine,
    linePath: any,
    components?: CanvasComponent[]
) => {
    const startComp = getComponentByKey(line.componentKey, components || []);
    const endComp = getComponentByKey(line.targetKey, components || []);
    const startOptionCoords = getOptionCoordsByKey(line.optionKey, startComp);

    let joints: Point[] = [];
    let points = linePath;

    if (startComp && endComp && startOptionCoords) {
        const endCompHelper = new ComponentHelper(endComp);

        if (
            !endCompHelper.isOnRight(points.start) ||
            endCompHelper.isOnRight(
                points.start,
                MIN_LINE_BEND_MARGIN - endComp.w / 2
            )
        ) {
            // Component is on right
            if (endCompHelper.isOnRight(points.start)) {
                // Component is on right top or right bottom
                if (
                    endCompHelper.isOnTop(
                        points.start,
                        endComp.h / 2 - LINE_BEND_TENSION * 2
                    ) ||
                    endCompHelper.isOnBottom(points.start)
                ) {
                    joints = [
                        {
                            x: points.start.x + MIN_LINE_BEND_MARGIN,
                            y: points.start.y
                        },
                        {
                            x: points.start.x + MIN_LINE_BEND_MARGIN,
                            y: points.end.y
                        }
                    ];
                }

                // Component is on right & fully top OR right & fully bottom
                if (
                    endCompHelper.isOnTop(
                        points.start,
                        -MIN_LINE_BEND_MARGIN
                    ) ||
                    endCompHelper.isOnBottom(points.start, MIN_LINE_BEND_MARGIN)
                ) {
                    joints = [
                        {
                            x: points.end.x,
                            y: points.start.y
                        }
                    ];
                }
            } else if (
                endCompHelper.isOnTop(points.start) &&
                endCompHelper.isOnLeft(points.start, endComp.w / 2)
            ) {
                if (points.start.x < points.end.x) {
                    joints = [
                        {
                            x: points.end.x + MIN_LINE_BEND_MARGIN,
                            y: points.start.y
                        },
                        {
                            x: points.end.x + MIN_LINE_BEND_MARGIN,
                            y: points.end.y
                        }
                    ];
                } else {
                    joints = [
                        {
                            x: points.start.x + MIN_LINE_BEND_MARGIN,
                            y: points.start.y
                        },
                        {
                            x: points.start.x + MIN_LINE_BEND_MARGIN,
                            y: points.end.y
                        }
                    ];
                }
            } else if (
                endCompHelper.isOnBottom(points.start, -endComp.h) &&
                endCompHelper.isOnLeft(points.start, endComp.w / 2)
            ) {
                if (points.start.x < points.end.x) {
                    joints = [
                        {
                            x: points.end.x + MIN_LINE_BEND_MARGIN,
                            y: points.start.y
                        },
                        {
                            x: points.end.x + MIN_LINE_BEND_MARGIN,
                            y: points.end.y
                        }
                    ];
                } else {
                    joints = [
                        {
                            x: points.start.x + MIN_LINE_BEND_MARGIN,
                            y: points.start.y
                        },
                        {
                            x: points.start.x + MIN_LINE_BEND_MARGIN,
                            y: points.end.y
                        }
                    ];
                }
            }
        }
    }

    return joints;
};

/**
 * Rectangular collision detection.
 *
 * @param x Cursor X.
 * @param y Cursor Y
 * @param rect Rectangle coords.
 * @returns boolean
 */
export const rectCollision = (
    x: number,
    y: number,
    rect: { x: number; y: number; w: number; h: number }
): boolean => {
    if (
        x > rect.x &&
        y > rect.y &&
        x < rect.w + rect.x &&
        y < rect.h + rect.y
    ) {
        return true;
    }
    return false;
};

const dist = (x1: number, y1: number, x2: number, y2: number) =>
    Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);

export const linePointCollision = (
    point: Point,
    linePath: { start: Point; end: Point },
    joints?: Point[],
    buffer = 0.2
) => {
    let collided = false;
    let linePoints = [linePath.start];

    if (joints) {
        linePoints = linePoints.concat(joints);
    }
    linePoints.push(linePath.end);

    for (let i = 1; i < linePoints.length; i++) {
        let start = { ...linePoints[i - 1] };

        const lineLen = dist(
            start.x,
            start.y,
            linePoints[i].x,
            linePoints[i].y
        );
        const dist1 = dist(start.x, start.y, point.x, point.y);
        const dist2 = dist(linePoints[i].x, linePoints[i].y, point.x, point.y);

        if (
            dist1 + dist2 >= lineLen - buffer &&
            dist1 + dist2 <= lineLen + buffer
        ) {
            collided = true;
            break;
        }
    }

    return collided;
};
