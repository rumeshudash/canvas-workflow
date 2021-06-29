export interface CanvasData {
    height?: number,
    background?: string,
    hoverColor?: string,
    selectionStrokeColor?: string,
    selectionLineWidth?: number,
    components?: CanvasComponent[],
}

export type CanvasComponent = BoxComponent | DiamondComponent;

export interface BaseComponent {
    type: string;
    x: number;
    y: number;
    w: number;
    h: number;
    fillColor?: string;
    lineWidth?: number;
    strokeColor?: string;
    draggable?: boolean;
}

export interface BoxComponent extends BaseComponent {
    title: string;
    description?: string;
    textColor?: string;
    fontSize?: number;
    fontFamily?: string;
    borderRadius?: BorderRadius;
}

export interface DiamondComponent extends BaseComponent {

}

export type BorderRadius = number | BorderRadiusBase;

export interface BorderRadiusBase { 
    tl: number; 
    tr: number; 
    br: number; 
    bl: number 
}