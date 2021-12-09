import { BaseComponent, Point } from '../Dtos/canvas.dtos';

export class ComponentHelper {
    component: BaseComponent;

    constructor(component: BaseComponent) {
        this.component = component;
    }

    getLeftPoint(): Point {
        return {
            x: this.component.x,
            y: this.component.y + this.component.h / 2
        };
    }

    getRightPoint(): Point {
        return {
            x: this.component.x + this.component.w,
            y: this.component.y + this.component.h / 2
        };
    }

    getTopPoint(): Point {
        return {
            x: this.component.x + this.component.w / 2,
            y: this.component.y
        };
    }

    getBottomPoint(): Point {
        return {
            x: this.component.x + this.component.w / 2,
            y: this.component.y + this.component.h
        };
    }

    isOnRight(point: Point, threshold: number = 0) {
        return point.x + threshold < this.component.x;
    }

    isOnLeft(point: Point, threshold: number = 0) {
        return point.x + threshold >= this.component.x + this.component.w;
    }

    isOnBottom(point: Point, threshold: number = 0) {
        return point.y + threshold < this.component.y;
    }

    isOnTop(point: Point, threshold: number = 0) {
        return point.y + threshold > this.component.y + this.component.h;
    }
}
