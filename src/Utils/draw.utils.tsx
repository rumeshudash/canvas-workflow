import { BORDER_RADIUS, CANVAS_GRID_COLOR, CANVAS_GRID_SIZE, DEFAULT_SHOW_GRID, FONT_FAMILY, FONT_SIZE, LINE_WIDTH, SELECTION_BOX_OFFSET, STROKE_COLOR, TEXT_COLOR } from "../Constants/canvas.constants";
import { BorderRadius, BoxComponent, CanvasComponent, CanvasData } from "../Dtos/canvas.dtos";
import { formatBorderRadius, getSelectionBoxCords } from "./common.utils";

/** */
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
    ctx.clip(); // Clip inner elements inside box.

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
    ctx.restore(); // Restore default state.
}


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
                const comp = component as BoxComponent;
                compDimension.w = comp.w;
                compDimension.h = comp.h;
                // dashedLine = false;
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
        
        const selectionBoxes = getSelectionBoxCords( compDimension );
        for( let box of selectionBoxes ) {
            ctx.rect( box.x, box.y, box.w, box.h );
        }

        ctx.fill();
        ctx.restore();
    }
}

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