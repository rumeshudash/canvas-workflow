export interface CanvasData {
    height?: number,
    background?: string,
    selectionStrokeColor?: string,
    selectionLineWidth?: number,
    showGrid?: boolean,
    gridColor?: string,
    components?: CanvasComponent[],
}

export type CanvasComponent = BoxComponent | DiamondComponent;

export interface BaseComponent {
    key: string;
    type: string;
    x: number;
    y: number;
    w: number;
    h: number;
    fillColor?: string;
    lineWidth?: number;
    strokeColor?: string;
    draggable?: boolean;
    options?: Option[];
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

export interface Option {
    key: string;
    name: string;
}