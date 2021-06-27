export interface CanvasData {
    height?: number,
    background?: string,
    hoverColor?: string,
    components?: CanvasComponent[],
}

export type CanvasComponent = BoxComponent | DiamondComponent;

export interface BaseComponent {
    type: string;
    // paths?: { x: number, y: number }[];
    x: number;
    y: number;
    fillColor?: string;
    lineWidth?: number;
    strokeColor?: string;
    draggable?: boolean;
}

export interface BoxComponent extends BaseComponent {
    w: number;
    h: number;
    text: string;
    textColor?: string;
    fontSize?: number;
    fontFamily?: string;
}

export interface DiamondComponent extends BaseComponent {

}