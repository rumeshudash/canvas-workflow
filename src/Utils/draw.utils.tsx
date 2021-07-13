import { 
    BORDER_RADIUS, 
    CANVAS_GRID_COLOR, 
    CANVAS_GRID_SIZE, 
    DEFAULT_SHOW_GRID, 
    FONT_FAMILY, 
    FONT_SIZE, 
    LINE_WIDTH, 
    OPTION_BG_COLOR, 
    OPTION_FONT_SIZE, 
    OPTION_TEXT_COLOR, 
    OPTION_HEIGHT,
    SELECTION_BOX_OFFSET, 
    STROKE_COLOR, 
    TEXT_COLOR 
} from "../Constants/canvas.constants";
import { BorderRadius, BoxComponent, CanvasComponent, CanvasData } from "../Dtos/canvas.dtos";
import { formatBorderRadius, getLineAngle, getSelectionBoxCords, getDrawLineButtonCords } from "./common.utils";

/**
 * Draw Canvas Dot grid.
*/
export const drawCanvasDotGrid = ( canvasData: CanvasData, canvasDOM?: HTMLCanvasElement, ctx?: CanvasRenderingContext2D | null ) => {
    if( ! canvasDOM || ! ctx ) return;
    if( ! ( typeof canvasData.showGrid !== 'undefined' ? canvasData.showGrid : DEFAULT_SHOW_GRID ) ) return;

    const dot_size = 1,
        vw = canvasDOM.width,
        vh = canvasDOM.height;

    for (var x = 0; x < vw + CANVAS_GRID_SIZE; x+= CANVAS_GRID_SIZE ) {
        for (var y = 0; y < vh + CANVAS_GRID_SIZE; y+= CANVAS_GRID_SIZE) {
            ctx.fillStyle = canvasData.gridColor || CANVAS_GRID_COLOR;
            ctx.fillRect( x - (dot_size / 2), y - (dot_size / 2), dot_size, dot_size );
        }
    }
}

/**
 * Draw rounded rect ( With border radius ).
 * 
 * @param ctx Context.
 * @param x Rect X Coord.
 * @param y Rect Y Coord.
 * @param width Width of rect.
 * @param height Height of rect.
 * @param borderRadius Border radius of rect.
 */
export const drawRoundedRect = ( ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, borderRadius?: BorderRadius ) => {
    const radius = formatBorderRadius( borderRadius );
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
}

/**
 * Draw box selection border or indicator.
 * 
 * @param component Canvas Component
 */
export const drawSelectionHandle = ( component: CanvasComponent, canvasData: CanvasData, selectedIndex: number, canvasDefaultData: any, cwMode: 'editor' | 'viewer', ctx?: CanvasRenderingContext2D | null ) => {
    if( 
        ctx 
        && cwMode === 'editor'
        && selectedIndex > -1 
        && canvasData.components?.length 
        && selectedIndex === canvasData.components.indexOf(component) 
    ) {
        let dashedLine = true;
        let compDimension = {
            x: component.x,
            y: component.y,
            w: 0,
            h: 0,
        }

        switch( component.type ) {
            case 'box':
                compDimension.w = (component as BoxComponent).w;
                compDimension.h = (component as BoxComponent).h;
                break;
        }

        // Draw border for selections.
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = canvasData.selectionLineWidth || canvasDefaultData.selectionLineWidth;
        if( dashedLine ) {
            ctx.setLineDash([5, 5])
        }
        ctx.strokeStyle = canvasData.selectionStrokeColor || canvasDefaultData.selectionStrokeColor;
        ctx.rect( 
            compDimension.x - SELECTION_BOX_OFFSET, 
            compDimension.y - SELECTION_BOX_OFFSET,
            compDimension.w + (SELECTION_BOX_OFFSET * 2),
            compDimension.h + (SELECTION_BOX_OFFSET * 2),
        )
        ctx.stroke();
        ctx.restore();

        // Draw border points
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = canvasData.selectionStrokeColor || canvasDefaultData.selectionStrokeColor;
        
        // Draw selection resize boxes.
        const selectionBoxes = getSelectionBoxCords( compDimension );
        for( let box of selectionBoxes ) {
            ctx.rect( box.x, box.y, box.w, box.h );
        }

        const drawArrowBoxes = getDrawLineButtonCords ( component );
        for( let arrowBox of drawArrowBoxes ) {
            ctx.drawImage( document.getElementById('arrowLineIcon') as any, arrowBox.x, arrowBox.y, arrowBox.w, arrowBox.h );
        }

        ctx.fill();
        ctx.restore();
    }
}

/**
 * Draw Text/Word with word wrap.
 * 
 * @param ctx Context
 * @param text Text to draw
 * @param x Text X Coord.
 * @param y Text Y Coord.
 * @param lineHeight Text line height.
 * @param fitWidth Width to fit text.
 * @returns void
 */
export const printAtWordWrap = ( ctx: CanvasRenderingContext2D , text: string, x: number, y: number, lineHeight: number, fitWidth?: number) => {
    fitWidth = fitWidth || 0;
    
    if (fitWidth <= 0)
    {
        ctx.fillText( text, x, y );
        return;
    }
    var words = text.split(' ');
    var currentLine = 0;
    var idx = 1;
    while (words.length > 0 && idx <= words.length)
    {
        var str = words.slice(0,idx).join(' ');
        var w = ctx.measureText(str).width;
        if ( w > fitWidth )
        {
            if (idx==1)
            {
                idx=2;
            }
            ctx.fillText( words.slice(0,idx-1).join(' '), x, y + (lineHeight * currentLine) );
            currentLine++;
            words = words.splice(idx-1);
            idx = 1;
        }
        else
        {idx++;}
    }
    if  (idx > 0)
        ctx.fillText( words.join(' '), x, y + (lineHeight * currentLine) );
}

export const drawLine = ( ctx: CanvasRenderingContext2D, points: any, joints?: any[], tension = 1 ) => {
    ctx.beginPath();
    ctx.moveTo( points.start.x, points.start.y );
    
    ctx.lineTo( points.end.x, points.end.y );
    // var t = (tension !== null) ? tension : 0;
    // for (var i = 0; i < points.length - 1; i++) {
    //     var p0 = (i > 0) ? points[i - 1] : points[0];
    //     var p1 = points[i];
    //     var p2 = points[i + 1];
    //     var p3 = (i != points.length - 2) ? points[i + 2] : p2;

    //     var cp1x = p1.x + (p2.x - p0.x) / 10 * t;
    //     var cp1y = p1.y + (p2.y - p0.y) / 10 * t;

    //     var cp2x = p2.x - (p3.x - p1.x) / 10 * t;
    //     var cp2y = p2.y - (p3.y - p1.y) / 10 * t;

    //     ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    // }
    ctx.stroke();
    const angle = getLineAngle( points.start.x, points.start.y, points.end.x, points.end.y );
    drawArrowHead( ctx, points.end.x, points.end.y, 7, angle, '#000' );
}

/**
 * 
 * @param ctx CanvasRenderingContext2D
 * @param x Line end Y.
 * @param y Line end Y.
 * @param size Size of arrow head.
 * @param angle Angle to rotate.
 * @param fillColor Fill color of arrow head.
 */
export const drawArrowHead = ( ctx: CanvasRenderingContext2D, x: number, y: number, size: number, angle: number, fillColor: string ) => {
    ctx.save();

    ctx.translate(x, y);
    ctx.rotate( angle * Math.PI / 180 );
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo( - size, - ( size / 2 ) );
    ctx.lineTo( - size, size / 2 );
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    ctx.restore();
}

/**
 * Draw Polygon.
 */
export const drawPolygon = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, sideCount: number, size: number, fillColor = '#000000', rotationDegrees = 0 ) => {
    ctx.save();

    ctx.translate(centerX,centerY);
    ctx.rotate( rotationDegrees * Math.PI / 180 );
    ctx.beginPath();
    ctx.moveTo (size * Math.cos(0), size * Math.sin(0));          
    for (var i = 1; i <= sideCount;i += 1) {
        ctx.lineTo (size * Math.cos(i * 2 * Math.PI / sideCount), size * Math.sin(i * 2 * Math.PI / sideCount));
    }
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    ctx.restore();
}

/**
 * Draw Box component.
 * 
 * @param component Box Component
 * @returns void
 */
export const drawBoxComponent = ( component: BoxComponent, ctx?: CanvasRenderingContext2D | null ) => {
    if( ! ctx ) return;

    const padding = 5;
    const fontSize = component.fontSize || FONT_SIZE;
    const borderRadius = typeof component.borderRadius !== "undefined" ? component.borderRadius : BORDER_RADIUS ;

    ctx.save(); // Save the default state to restore later.
    ctx.beginPath();
    drawRoundedRect( ctx, component.x, component.y, component.w, component.h, borderRadius );

    if( component.fillColor ) {
        // Draw box fill
        ctx.fillStyle = component.fillColor || 'transparent';
        ctx.fill();
    }

    // Draw box stroke or border.
    ctx.lineWidth = component.lineWidth || LINE_WIDTH;
    ctx.strokeStyle = component.strokeColor || STROKE_COLOR;
    ctx.stroke();
    ctx.clip('evenodd'); // Clip inner elements inside box.

    // Draw box text.
    ctx.font = `bold ${fontSize}px ${component.fontFamily || FONT_FAMILY}`;
    ctx.fillStyle = component.textColor || TEXT_COLOR;
    ctx.fillText(
        component.title, 
        component.x + padding + ctx.lineWidth, 
        component.y + padding + fontSize + ctx.lineWidth - 5,
    );
    
    if( component.description ) {
        ctx.font = `${fontSize}px ${component.fontFamily || FONT_FAMILY}`;
        printAtWordWrap(
            ctx,
            component.description,
            component.x + padding + ctx.lineWidth,
            component.y + (padding * 2) + (fontSize * 2) + ctx.lineWidth - 5,
            fontSize,
            component.w - (padding * 2) - ctx.lineWidth,
        );
    }

    if( component.options ) {
        const optionsLength = component.options.length;

        component.options.forEach( ( option, index ) => {
            ctx.fillStyle = OPTION_BG_COLOR;
            const optionDim = {
                x: component.x,
                y: component.y + component.h - ( OPTION_HEIGHT * (optionsLength - index) ),
                w: component.w,
                h: OPTION_HEIGHT,
            }
            ctx.fillRect( optionDim.x, optionDim.y, optionDim.w, optionDim.h );

            ctx.font = `${OPTION_FONT_SIZE}px ${component.fontFamily || FONT_FAMILY}`;
            ctx.fillStyle = OPTION_TEXT_COLOR;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(
                option.name, 
                optionDim.x + ( optionDim.w / 2 ),
                optionDim.y + ( OPTION_HEIGHT / 2 ),
            );

            ctx.strokeStyle = component.strokeColor || STROKE_COLOR;
            ctx.moveTo(component.x, optionDim.y);
            ctx.lineTo(component.x + component.w, optionDim.y);
            ctx.stroke();
        } );
    }

    ctx.restore(); // Restore default state.
}