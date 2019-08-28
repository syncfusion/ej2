import { BorderModel, FontModel, ColorMappingModel, LeafItemSettingsModel } from '../model/base-model';
import { createElement, compile, merge, isNullOrUndefined } from '@syncfusion/ej2-base';
import { SvgRenderer } from '@syncfusion/ej2-svg-base';
import { Alignment, LabelPosition } from '../utils/enum';
import { TreeMap } from '../treemap';
import { IShapes } from '../model/interface';
/**
 * Create the class for size
 */
export class Size {
    /** 
     * height of the size
     */
    public height: number;
    /** 
     * width of the size 
     */
    public width: number;
    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }
}

export function stringToNumber(value: string, containerSize: number): number {
    if (value !== null && value !== undefined) {
        return value.indexOf('%') !== -1 ? (containerSize / 100) * parseInt(value, 10) : parseInt(value, 10);
    }
    return null;
}

/**
 * Internal use of type rect
 * @private
 */
export class Rect {
    public x: number;
    public y: number;
    public height: number;
    public width: number;
    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

/**
 * Internal use of rectangle options
 * @private
 */
export class RectOption {
    public id: string;
    public fill: string;
    public x: number;
    public y: number;
    public height: number;
    public width: number;
    public opacity: number;
    public stroke: string;
    public ['stroke-width']: number;
    public ['stroke-dasharray']: string;
    constructor(
        id: string, fill: string, border: BorderModel, opacity: number, rect: Rect, dashArray?: string
    ) {
        this.y = rect.y;
        this.x = rect.x;
        this.height = rect.height;
        this.width = rect.width;
        this.id = id;
        this.fill = fill;
        this.opacity = opacity;
        this.stroke = border.color;
        this['stroke-width'] = border.width;
        this['stroke-dasharray'] = dashArray;
    }
}

export class PathOption {
    public id: string;
    public opacity: number;
    public fill: string;
    public stroke: string;
    public ['stroke-width']: number;
    public ['stroke-dasharray']: string;
    public d: string;
    constructor(
        id: string, fill: string, width: number, color: string, opacity?: number,
        dashArray?: string, d?: string
    ) {
        this.id = id;
        this.opacity = opacity;
        this.fill = fill;
        this.stroke = color;
        this['stroke-width'] = width;
        this['stroke-dasharray'] = dashArray;
        this.d = d;
    }
}

/**
 * Function to measure the height and width of the text.
 * @param  {string} text
 * @param  {FontModel} font
 * @param  {string} id
 * @returns no
 * @private
 */
export function measureText(text: string, font: FontModel): Size {
    let measureObject: HTMLElement = document.getElementById('treeMapMeasureText');
    if (measureObject === null) {
        measureObject = createElement('text', { id: 'treeMapMeasureText' });
        document.body.appendChild(measureObject);
    }
    measureObject.innerHTML = text;
    measureObject.style.position = 'absolute';
    measureObject.style.fontSize = font.size;
    measureObject.style.fontWeight = font.fontWeight;
    measureObject.style.fontStyle = font.fontStyle;
    measureObject.style.fontFamily = font.fontFamily;
    measureObject.style.visibility = 'hidden';
    measureObject.style.top = '-100';
    measureObject.style.left = '0';
    measureObject.style.whiteSpace = 'nowrap';
    // For bootstrap line height issue
    measureObject.style.lineHeight = 'normal';
    return new Size(measureObject.clientWidth, measureObject.clientHeight);
}

/**
 * Internal use of text options
 * @private
 */
export class TextOption {
    public anchor: string;
    public id: string;
    public transform: string = '';
    public x: number;
    public y: number;
    public text: string | string[];
    public baseLine: string = 'auto';
    public connectorText: string;
    constructor(
        id?: string, x?: number, y?: number, anchor?: string, text?: string | string[], transform: string = '',
        baseLine?: string, connectorText?: string
    ) {
        this.id = id;
        this.text = text;
        this.transform = transform;
        this.anchor = anchor;
        this.x = x;
        this.y = y;
        this.baseLine = baseLine;
        this.connectorText = connectorText;
    }
}


/**
 * @private
 * Trim the title text
 */
export function textTrim(maxWidth: number, text: string, font: FontModel): string {
    let label: string = text;
    let size: number = measureText(text, font).width;
    if (size > maxWidth) {
        let textLength: number = text.length;
        for (let i: number = textLength - 1; i >= 0; --i) {
            label = text.substring(0, i) + '...';
            size = measureText(label, font).width;
            if (size <= maxWidth || label.length < 4) {
                if (label.length < 4) {
                    label = ' ';
                }
                return label;
            }
        }
    }
    return label;
}

/**
 * Map internal class for Point
 */

export class Location {
    /**
     * To calculate x value for location
     */
    public x: number;
    /**
     * To calculate y value for location
     */
    public y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

/**
 * Method to calculate x position of title
 */

export function findPosition(location: Rect, alignment: Alignment, textSize: Size, type: string): Location {
    let x: number; let y: number;
    switch (alignment) {
        case 'Near':
            x = location.x;
            break;
        case 'Center':
            x = (type === 'title') ? (location.width / 2 - textSize.width / 2) :
                ((location.x + (location.width / 2)) - textSize.width / 2);
            break;
        case 'Far':
            x = (type === 'title') ? (location.width - location.y - textSize.width) :
                ((location.x + location.width) - textSize.width);
            break;
    }
    y = (type === 'title') ? location.y + (textSize.height / 2) : ((location.y + location.height / 2) + textSize.height / 2);
    return new Location(x, y);
}

export function createTextStyle(
    renderer: SvgRenderer, renderOptions: Object, text: string
): HTMLElement {
    let htmlObject: HTMLElement;
    htmlObject = <HTMLElement>renderer.createText(renderOptions, text);
    htmlObject.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve');
    htmlObject.style['user-select'] = 'none';
    htmlObject.style['-moz-user-select'] = 'none';
    htmlObject.style['-webkit-touch-callout'] = 'none';
    htmlObject.style['-webkit-user-select'] = 'none';
    htmlObject.style['-khtml-user-select'] = 'none';
    htmlObject.style['-ms-user-select'] = 'none';
    htmlObject.style['-o-user-select'] = 'none';
    return htmlObject;
}

/**
 * Internal rendering of text
 * @private
 */
/* tslint:disable:no-string-literal */
export function renderTextElement(
    options: TextOption, font: FontModel, color: string, parent: HTMLElement | Element, isMinus: boolean = false
): Element {
    let renderOptions: Object = {
        'font-size': font.size,
        'font-style': font.fontStyle,
        'font-family': font.fontFamily,
        'font-weight': font.fontWeight,
        'text-anchor': options.anchor,
        'transform': options.transform,
        'opacity': font.opacity,
        'dominant-baseline': options.baseLine,
        'id': options.id,
        'x': options.x,
        'y': options.y,
        'fill': color
    };
    let text: string = typeof options.text === 'string' ? options.text : isMinus ? options.text[options.text.length - 1] : options.text[0];
    let tspanElement: Element;
    let renderer: SvgRenderer = new SvgRenderer('');
    let height: number; let htmlObject: HTMLElement;
    let breadCrumbText: boolean = !isNullOrUndefined(text) && !isNullOrUndefined(options.connectorText) ?
        (text.search(options.connectorText[1]) >= 0) : false;
    if (breadCrumbText) {
        let drilledLabel: string = text;
        let drillLevelText: string[]; let spacing: number = 5;
        drillLevelText = drilledLabel.split('#');
        for (let z: number = 0; z < drillLevelText.length; z++) {
            let drillText: string = (drillLevelText[z].search(options.connectorText) !== -1 && !isNullOrUndefined(options.connectorText)) ?
                options.connectorText : drillLevelText[z];
            renderOptions['id'] = options.id + '_' + z;
            htmlObject = createTextStyle(renderer, renderOptions, drillText);
            if (z % 2 === 0 && z !== 0) {
                let re: RegExp = /\s+/g;
                drillText = drillText.replace(re, '&nbsp');
            }
            let size: Size = measureText(drillText, font);
            renderOptions['x'] = z !== 0 ? renderOptions['x'] + size.width : renderOptions['x'] + size.width + spacing;
            parent.appendChild(htmlObject);
        }
    } else {
        htmlObject = createTextStyle(renderer, renderOptions, text);
        parent.appendChild(htmlObject);
    }
    if (typeof options.text !== 'string' && options.text.length > 1) {
        for (let i: number = 1, len: number = options.text.length; i < len; i++) {
            height = (measureText(options.text[i], font).height);
            tspanElement = renderer.createTSpan(
                {
                    'x': options.x, 'id': options.id,
                    'y': (options.y) + (i * height)
                },
                options.text[i]);
            htmlObject.appendChild(tspanElement);
        }
        parent.appendChild(htmlObject);
    }
    return htmlObject;
}

export function getElement(id: string): Element {
    return document.getElementById(id);
}
/* tslint:disable:no-string-literal */
export function itemsToOrder(a: Object, b: Object): number {
    return a['weight'] === b['weight'] ? 0 : a['weight'] < b['weight'] ? 1 : -1;
}


export function isContainsData(source: string[], pathName: string, processData: Object, treemap: TreeMap): boolean {
    let isExist: boolean = false; let name: string = ''; let path: string;
    let leaf: LeafItemSettingsModel = treemap.leafItemSettings; for (let i: number = 0; i < source.length; i++) {
        path = treemap.levels[i] ? treemap.levels[i].groupPath : leaf.labelPath ? leaf.labelPath : treemap.weightValuePath;
        if (source[i] === processData[path]) {
            name += (processData[path]) + (i === source.length - 1 ? '' : '#');
            if (name === pathName) {
                isExist = true;
                break;
            }
        }
    }
    return isExist;
}

export function findChildren(data: Object): Object {
    let children: Object;
    if (data) {
        let keys: string[] = Object.keys(data);
        children = new Object();
        for (let i: number = 0; i < keys.length; i++) {
            if (data[keys[i]] instanceof Array) {
                children['values'] = data[keys[i]];
                children['key'] = keys[i];
                break;
            }
        }
    }
    return children;
}

export function findHightLightItems(data: Object, items: string[], mode: string, treeMap: TreeMap): string[] {
    if (mode === 'Child') {
        items.push(data['levelOrderName']);
        let children: Object[] = findChildren(data)['values'];
        if (children && children.length > 0) {
            for (let i: number = 0; i < children.length; i++) {
                if (items.indexOf(children[i]['levelOrderName']) === -1) {
                    items.push(children[i]['levelOrderName']);
                }
            }
            for (let j: number = 0; j < children.length; j++) {
                findHightLightItems(children[j], items, mode, treeMap);
            }
        }
    } else if (mode === 'Parent') {
        if (typeof data['levelOrderName'] === 'string' && items.indexOf(data['levelOrderName']) === -1) {
            items.push(data['levelOrderName']);
            findHightLightItems(data['parent'], items, mode, treeMap);
        }
    } else if (mode === 'All') {
        let parentName: string = (data['levelOrderName'] as string).split('#')[0];
        let currentItem: Object;
        for (let i: number = 0; i < treeMap.layout.renderItems.length; i++) {
            currentItem = treeMap.layout.renderItems[i];
            if ((currentItem['levelOrderName']).indexOf(parentName) > -1 && items.indexOf(currentItem['levelOrderName']) === -1) {
                items.push(currentItem['levelOrderName']);
            }
        }
    } else {
        items.push(data['levelOrderName']);
    }
    return items;
}

/**
 * Function to compile the template function for maps.
 * @returns Function
 * @private
 */
export function getTemplateFunction(template: string): Function {
    let templateFn: Function = null;
    let e: Object;
    try {
        if (document.querySelectorAll(template).length) {
            templateFn = compile(document.querySelector(template).innerHTML.trim());
        }
    } catch (e) {
        templateFn = compile(template);
    }
    return templateFn;
}

/**
 * @private
 */
export function convertElement(element: HTMLCollection, labelId: string, data: Object): HTMLElement {
    let childElement: HTMLElement = createElement('div', {
        id: labelId,
        styles: 'position: absolute;pointer-events: auto;'
    });
    let elementLength: number = element.length;
    while (elementLength > 0) {
        childElement.appendChild(element[0]);
        elementLength--;
    }
    let templateHtml: string = childElement.innerHTML;
    let keys: Object[] = Object.keys(data);
    for (let i: number = 0; i < keys.length; i++) {
        templateHtml = templateHtml.replace(new RegExp('{{:' + <String>keys[i] + '}}', 'g'), data[keys[i].toString()]);
    }
    childElement.innerHTML = templateHtml;
    return childElement;
}

export function findLabelLocation(rect: Rect, position: LabelPosition, labelSize: Size, type: string, treemap: TreeMap): Location {
    let location: Location = new Location(0, 0);
    let padding: number = 5;
    let paddings: number = 2;
    let elementRect: ClientRect = treemap.element.getBoundingClientRect();
    let x: number = (type === 'Template') ? treemap.areaRect.x : 0;
    let y: number = (type === 'Template') ? treemap.areaRect.y : 0;
    location.x = (Math.abs(x - ((position.indexOf('Left') > -1) ? rect.x + padding : !(position.indexOf('Right') > -1) ?
        rect.x + ((rect.width / 2) - (labelSize.width / 2)) : (rect.x + rect.width) - labelSize.width))) - paddings;
    if (treemap.enableDrillDown && (treemap.renderDirection === 'BottomLeftTopRight'
        || treemap.renderDirection === 'BottomRightTopLeft')) {
        location.y = Math.abs((rect.y + rect.height) - labelSize.height + padding);
    } else {
        location.y = Math.abs(y - ((position.indexOf('Top') > -1) ? (type === 'Template' ? rect.y : rect.y + labelSize.height) :
            !(position.indexOf('Bottom') > -1) ? type === 'Template' ? (rect.y + ((rect.height / 2) - (labelSize.height / 2))) :
                (rect.y + (rect.height / 2) + labelSize.height / 4) : (rect.y + rect.height) - labelSize.height));
    }

    return location;
}

export function measureElement(element: HTMLElement, parentElement: HTMLElement): Size {
    let size: Size = new Size(0, 0);
    parentElement.appendChild(element);
    size.height = element.offsetHeight;
    size.width = element.offsetWidth;
    document.getElementById(element.id).remove();
    return size;
}

export function getArea(rect: Rect): number {
    return (rect.width - rect.x) * (rect.height - rect.y);
}

export function getShortestEdge(input: Rect): number {
    let container: Rect = convertToContainer(input);
    let width: number = container.width;
    let height: number = container.height;
    let result: number = Math.min(width, height);
    return result;
}

export function convertToContainer(rect: Rect): Rect {
    let x: number = rect.x;
    let y: number = rect.y;
    let width: number = rect.width;
    let height: number = rect.height;
    return {
        x: x,
        y: y,
        width: width - x,
        height: height - y
    };
}

export function convertToRect(container: Rect): Rect {
    let xOffset: number = container.x;
    let yOffset: number = container.y;
    let width: number = container.width;
    let height: number = container.height;
    return {
        x: xOffset,
        y: yOffset,
        width: xOffset + width,
        height: yOffset + height,
    };
}

export function getMousePosition(pageX: number, pageY: number, element: Element): Location {
    let elementRect: ClientRect = element.getBoundingClientRect();
    let pageXOffset: number = element.ownerDocument.defaultView.pageXOffset;
    let pageYOffset: number = element.ownerDocument.defaultView.pageYOffset;
    let clientTop: number = element.ownerDocument.documentElement.clientTop;
    let clientLeft: number = element.ownerDocument.documentElement.clientLeft;
    let positionX: number = elementRect.left + pageXOffset - clientLeft;
    let positionY: number = elementRect.top + pageYOffset - clientTop;
    return new Location((pageX - positionX), (pageY - positionY));
}
export function colorMap(
    colorMapping: ColorMappingModel[], equalValue: string,
    value: number | string, weightValuePath: number): object {
    let fill: string; let paths: string[] = []; let opacity: string;
    if (isNullOrUndefined(equalValue) && (isNullOrUndefined(value) && isNaN(<number>value))) {
        return null;
    }
    for (let i: number = 0; i < colorMapping.length; i++) {
        let isEqualColor: boolean = false; let dataValue: number = <number>value;
        if (!isNullOrUndefined(colorMapping[i].from) && !isNullOrUndefined(colorMapping[i].to)
            && !isNullOrUndefined(colorMapping[i].value)) {
            if ((value >= colorMapping[i].from && colorMapping[i].to >= value) && (colorMapping[i].value === equalValue)) {
                isEqualColor = true;
                if (Object.prototype.toString.call(colorMapping[i].color) === '[object Array]') {
                    fill = !isEqualColor ? colorCollections(colorMapping[i], dataValue) : colorMapping[i].color[0];
                } else {
                    fill = <string>colorMapping[i].color;
                }
            }
        } else if ((!isNullOrUndefined(colorMapping[i].from) && !isNullOrUndefined(colorMapping[i].to))
            || !isNullOrUndefined((colorMapping[i].value))) {
            if ((value >= colorMapping[i].from && colorMapping[i].to >= value) || (colorMapping[i].value === equalValue)) {
                if (colorMapping[i].value === equalValue) {
                    isEqualColor = true;
                }
                if (Object.prototype.toString.call(colorMapping[i].color) === '[object Array]') {
                    fill = !isEqualColor ? colorCollections(colorMapping[i], dataValue) : colorMapping[i].color[0];
                } else {
                    fill = <string>colorMapping[i].color;
                }
            }
        }
        if (((value >= colorMapping[i].from && value <= colorMapping[i].to) || (colorMapping[i].value === equalValue))
            && !isNullOrUndefined(colorMapping[i].minOpacity) && !isNullOrUndefined(colorMapping[i].maxOpacity) && fill) {
            opacity = deSaturationColor(weightValuePath, colorMapping[i], fill, value as number);
        }
        if ((fill === '' || isNullOrUndefined(fill))
            && isNullOrUndefined(colorMapping[i].from) && isNullOrUndefined(colorMapping[i].to)
            && isNullOrUndefined(colorMapping[i].minOpacity) && isNullOrUndefined(colorMapping[i].maxOpacity)
            && isNullOrUndefined(colorMapping[i].value)) {
            fill = (Object.prototype.toString.call(colorMapping[i].color) === '[object Array]') ?
                <string>colorMapping[i].color[0] : <string>colorMapping[i].color;
        }
        opacity = !isNullOrUndefined(opacity) ? opacity : '1';
        paths.push(fill);
    }
    for (let j: number = paths.length - 1; j >= 0; j--) {
        fill = paths[j];
        j = (fill) ? -1 : j;
    }
    return { fill: fill, opacity: opacity };
}


export function deSaturationColor(
    weightValuePath: number, colorMapping: ColorMappingModel, color: string, rangeValue: number): string {
    let opacity: number = 1;
    if ((rangeValue >= colorMapping.from && rangeValue <= colorMapping.to)) {
        let ratio: number = (rangeValue - colorMapping.from) / (colorMapping.to - colorMapping.from);
        opacity = (ratio * (colorMapping.maxOpacity - colorMapping.minOpacity)) + colorMapping.minOpacity;
    }
    return opacity.toString();
}

export function colorCollections(colorMap: ColorMappingModel, value: number): string {
    let gradientFill: string = getColorByValue(colorMap, value);
    return gradientFill;
}

export function rgbToHex(r: number, g: number, b: number): string {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function getColorByValue(colorMap: ColorMappingModel, value: number): string {
    let color: string = '';
    let rbg: ColorValue;
    if (Number(value) === colorMap.from) {
        color = colorMap.color[0];
    } else if (Number(value) === colorMap.to) {
        color = colorMap.color[colorMap.color.length - 1];
    } else {
        rbg = getGradientColor(Number(value), colorMap);
        color = rgbToHex(rbg.r, rbg.g, rbg.b);
    }
    return color;
}

/* tslint:disable-next-line:max-func-body-length */
export function getGradientColor(value: number, colorMap: ColorMappingModel): ColorValue {
    let previousOffset: number = colorMap.from;
    let nextOffset: number = colorMap.to;
    let percent: number = 0; let prev1: string;
    let full: number = nextOffset - previousOffset; let midColor: string; let midreturn: ColorValue;
    percent = (value - previousOffset) / full; let previousColor: string; let nextColor: string;
    if (colorMap.color.length <= 2) {
        previousColor = colorMap.color[0].charAt(0) === '#' ? colorMap.color[0] : colorNameToHex(colorMap.color[0]);
        nextColor = colorMap.color[colorMap.color.length - 1].charAt(0) === '#' ?
            colorMap.color[colorMap.color.length - 1] : colorNameToHex(colorMap.color[colorMap.color.length - 1]);
    } else {
        previousColor = colorMap.color[0].charAt(0) === '#' ? colorMap.color[0] : colorNameToHex(colorMap.color[0]);
        nextColor = colorMap.color[colorMap.color.length - 1].charAt(0) === '#' ?
            colorMap.color[colorMap.color.length - 1] : colorNameToHex(colorMap.color[colorMap.color.length - 1]);
        let a: number = full / (colorMap.color.length - 1); let b: number; let c: number;

        let length: number = colorMap.color.length - 1;
        let splitColorValueOffset: Object[] = []; let splitColor: Object = {};
        for (let j: number = 1; j < length; j++) {
            c = j * a;
            b = previousOffset + c;
            splitColor = { b: b, color: colorMap.color[j] };
            splitColorValueOffset.push(splitColor);
        }
        for (let i: number = 0; i < splitColorValueOffset.length; i++) {
            if (previousOffset <= value && value <= splitColorValueOffset[i]['b'] && i === 0) {
                midColor = splitColorValueOffset[i]['color'].charAt(0) === '#' ?
                    splitColorValueOffset[i]['color'] : colorNameToHex(splitColorValueOffset[i]['color']);
                nextColor = midColor;
                percent = value < splitColorValueOffset[i]['b'] ? 1 - Math.abs((value - splitColorValueOffset[i]['b']) / a)
                    : (value - splitColorValueOffset[i]['b']) / a;
            } else if (splitColorValueOffset[i]['b'] <= value && value <= nextOffset && i === (splitColorValueOffset.length - 1)) {
                midColor = splitColorValueOffset[i]['color'].charAt(0) === '#' ?
                    splitColorValueOffset[i]['color'] : colorNameToHex(splitColorValueOffset[i]['color']);
                previousColor = midColor;
                percent = value < splitColorValueOffset[i]['b'] ?
                    1 - Math.abs((value - splitColorValueOffset[i]['b']) / a) : (value - splitColorValueOffset[i]['b']) / a;
            }
            if (i !== splitColorValueOffset.length - 1 && i < splitColorValueOffset.length) {
                if (splitColorValueOffset[i]['b'] <= value && value <= splitColorValueOffset[i + 1]['b']) {
                    midColor = splitColorValueOffset[i]['color'].charAt(0) === '#' ?
                        splitColorValueOffset[i]['color'] : colorNameToHex(splitColorValueOffset[i]['color']);
                    previousColor = midColor;
                    nextColor = splitColorValueOffset[i + 1]['color'].charAt(0) === '#' ?
                        splitColorValueOffset[i + 1]['color'] : colorNameToHex(splitColorValueOffset[i + 1]['color']);
                    percent = Math.abs((value - splitColorValueOffset[i + 1]['b'])) / a;
                }
            }
        }
    }
    return getPercentageColor(percent, previousColor, nextColor);
}

export function getPercentageColor(percent: number, previous: string, next: string): ColorValue {
    let nextColor: string = next.split('#')[1];
    let prevColor: string = previous.split('#')[1];
    let r: number = getPercentage(percent, parseInt(prevColor.substr(0, 2), 16), parseInt(nextColor.substr(0, 2), 16));
    let g: number = getPercentage(percent, parseInt(prevColor.substr(2, 2), 16), parseInt(nextColor.substr(2, 2), 16));
    let b: number = getPercentage(percent, parseInt(prevColor.substr(4, 2), 16), parseInt(nextColor.substr(4, 2), 16));
    return new ColorValue(r, g, b);
}

export function getPercentage(percent: number, previous: number, next: number): number {
    let full: number = next - previous;
    return Math.round((previous + (full * percent)));
}

export function wordWrap(maximumWidth: number, dataLabel: string, font: FontModel): string[] {
    let textCollection: string[] = dataLabel.split(' ');
    let label: string = '';
    let labelCollection: string[] = [];
    let text: string;
    for (let i: number = 0, len: number = textCollection.length; i < len; i++) {
        text = textCollection[i];
        if (measureText(label.concat(text), font).width < maximumWidth) {
            label = label.concat((label === '' ? '' : ' ') + text);
        } else {
            if (label !== '') {
                labelCollection.push(textTrim(maximumWidth, label, font));
                label = text;
            } else {
                labelCollection.push(textTrim(maximumWidth, text, font));
                text = '';
            }
        }
        if (label && i === len - 1) {
            labelCollection.push(textTrim(maximumWidth, label, font));
        }
    }
    return labelCollection;
}
export function textWrap(maxWidth: number, label: string, font: FontModel): string[] {
    let text: string = label;
    let resultText: string[] = [];
    let currentLength: number = 0;
    let totalWidth: number = measureText(label, font).width;
    let totalLength: number = label.length;
    if (maxWidth >= totalWidth) {
        resultText.push(label);
        return resultText;
    } else {
        for (let i: number = label.length; i > currentLength; i--) {
            let sliceString: string = label.slice(currentLength, i);
            totalWidth = measureText(sliceString, font).width;
            if (totalWidth <= maxWidth) {
                resultText.push(sliceString);
                currentLength += sliceString.length;
                if (totalLength === currentLength) {
                    return resultText;
                }
                i = totalLength + 1;
            }
        }
    }
    return resultText;
}
/**
 * hide function
 */
export function hide(maxWidth: number, maxHeight: number, text: string, font: FontModel): string {
    let hideText: string = text;
    let textSize: Size = measureText(text, font);
    hideText = (textSize.width > maxWidth || textSize.height > maxHeight) ? ' ' : text;
    return hideText;
}

export function orderByArea(a: number, b: number): number {
    if (a['itemArea'] === b['itemArea']) {
        return 0;
    } else if (a['itemArea'] < b['itemArea']) {
        return 1;
    }
    return -1;
}


export function removeClassNames(elements: HTMLCollection, type: string, treemap: TreeMap): void {
    let opacity: string; let process: boolean = true; let element: SVGPathElement;
    let stroke: string; let strokeWidth: string; let fill: string;
    let options: Object = {};
    for (let j: number = 0; j < elements.length; j++) {
        element = elements[j].childNodes[0] as SVGPathElement;
        options = treemap.layout.renderItems[element.id.split('_')[6]]['options'];
        applyOptions(element, options);
        elements[j].classList.remove(type);
        j -= 1;
    }
}

export function applyOptions(element: SVGPathElement, options: Object): void {
    element.setAttribute('opacity', options['opacity']);
    element.setAttribute('fill', options['fill']);
    element.setAttribute('stroke', options['border']['color']);
    element.setAttribute('stroke-width', options['border']['width']);
}

export function textFormatter(format: string, data: object, treemap: TreeMap): string {
    if (isNullOrUndefined(format)) {
        return null;
    }
    let keys: string[] = Object.keys(data);
    for (let key of keys) {
        format = format.split('${' + key + '}').join(formatValue(data[key], treemap).toString());
    }
    return format;
}

export function formatValue(value: number, treemap: TreeMap): string | number {
    let formatValue: string | number; let formatFunction: Function;
    if (treemap.format && !isNaN(Number(value))) {
        formatFunction = treemap.intl.getNumberFormat(
            { format: treemap.format, useGrouping: treemap.useGroupingSeparator });
        formatValue = formatFunction(Number(value));
    } else {
        formatValue = value;
    }
    return formatValue ? formatValue : '';
}

/** @private */
export class ColorValue {
    public r: number;
    public g: number;
    public b: number;
    constructor(r?: number, g?: number, b?: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
}

/** @private */
export function convertToHexCode(value: ColorValue): string {
    return '#' + componentToHex(value.r) + componentToHex(value.g) + componentToHex(value.b);
}

/** @private */
export function componentToHex(value: number): string {
    let hex: string = value.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
}

/** @private */
export function convertHexToColor(hex: string): ColorValue {
    let result: RegExpExecArray = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? new ColorValue(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)) :
        new ColorValue(255, 255, 255);
}

/** @private */
export function colorNameToHex(color: string): string {
    let element: HTMLElement;
    color = color === 'transparent' ? 'white' : color;
    element = document.getElementById('treeMapMeasureText');
    element.style.color = color;
    color = window.getComputedStyle(element).color;
    let exp: RegExp = /^(rgb|hsl)(a?)[(]\s*([\d.]+\s*%?)\s*,\s*([\d.]+\s*%?)\s*,\s*([\d.]+\s*%?)\s*(?:,\s*([\d.]+)\s*)?[)]$/;
    let isRGBValue: RegExpExecArray = exp.exec(color);
    return convertToHexCode(
        new ColorValue(parseInt(isRGBValue[3], 10), parseInt(isRGBValue[4], 10), parseInt(isRGBValue[5], 10))
    );
}

/** @private */
export function drawSymbol(location: Location, shape: string, size: Size, url: string, options: PathOption, label: string): Element {
    let functionName: string = 'Path';
    let svgRenderer: SvgRenderer = new SvgRenderer('');
    let temp: IShapes = renderLegendShape(location, size, shape, options, url);
    let htmlElement: Element = svgRenderer['draw' + temp.functionName](temp.renderOption);
    htmlElement.setAttribute('aria-label', label);
    return htmlElement;
}
/** @private */
export function renderLegendShape(location: Location, size: Size, shape: string, options: PathOption, url: string): IShapes {
    let renderPath: string;
    let functionName: string = 'Path';
    let shapeWidth: number = size.width;
    let shapeHeight: number = size.height;
    let shapeX: number = location.x;
    let shapeY: number = location.y;
    let x: number = location.x + (-shapeWidth / 2);
    let y: number = location.y + (-shapeHeight / 2);
    switch (shape) {
        case 'Circle':
        case 'Bubble':
            functionName = 'Ellipse';
            merge(options, { 'rx': shapeWidth / 2, 'ry': shapeHeight / 2, 'cx': shapeX, 'cy': shapeY });
            break;
        case 'VerticalLine':
            renderPath = 'M' + ' ' + shapeX + ' ' + (shapeY + (shapeHeight / 2)) + ' ' + 'L' + ' ' + shapeX + ' '
                + (shapeY + (-shapeHeight / 2));
            merge(options, { 'd': renderPath });
            break;
        case 'Diamond':
            renderPath = 'M' + ' ' + x + ' ' + shapeY + ' ' +
                'L' + ' ' + shapeX + ' ' + (shapeY + (-shapeHeight / 2)) + ' ' +
                'L' + ' ' + (shapeX + (shapeWidth / 2)) + ' ' + shapeY + ' ' +
                'L' + ' ' + shapeX + ' ' + (shapeY + (shapeHeight / 2)) + ' ' +
                'L' + ' ' + x + ' ' + shapeY + ' z';
            merge(options, { 'd': renderPath });
            break;
        case 'Rectangle':
            renderPath = 'M' + ' ' + x + ' ' + (shapeY + (-shapeHeight / 2)) + ' ' +
                'L' + ' ' + (shapeX + (shapeWidth / 2)) + ' ' + (shapeY + (-shapeHeight / 2)) + ' ' +
                'L' + ' ' + (shapeX + (shapeWidth / 2)) + ' ' + (shapeY + (shapeHeight / 2)) + ' ' +
                'L' + ' ' + x + ' ' + (shapeY + (shapeHeight / 2)) + ' ' +
                'L' + ' ' + x + ' ' + (shapeY + (-shapeHeight / 2)) + ' z';
            merge(options, { 'd': renderPath });
            break;
        case 'Triangle':
            renderPath = 'M' + ' ' + x + ' ' + (shapeY + (shapeHeight / 2)) + ' ' +
                'L' + ' ' + shapeX + ' ' + (shapeY + (-shapeHeight / 2)) + ' ' +
                'L' + ' ' + (shapeX + (shapeWidth / 2)) + ' ' + (shapeY + (shapeHeight / 2)) + ' ' +
                'L' + ' ' + x + ' ' + (shapeY + (shapeHeight / 2)) + ' z';
            merge(options, { 'd': renderPath });
            break;
        case 'InvertedTriangle':
            renderPath = 'M' + ' ' + (shapeX + (shapeWidth / 2)) + ' ' + (shapeY - (shapeHeight / 2)) + ' ' +
                'L' + ' ' + shapeX + ' ' + (shapeY + (shapeHeight / 2)) + ' ' +
                'L' + ' ' + (shapeX - (shapeWidth / 2)) + ' ' + (shapeY - (shapeHeight / 2)) + ' ' +
                'L' + ' ' + (shapeX + (shapeWidth / 2)) + ' ' + (shapeY - (shapeHeight / 2)) + ' z';
            merge(options, { 'd': renderPath });
            break;
        case 'Pentagon':
            let eq: number = 72;
            let xValue: number;
            let yValue: number;
            for (let i: number = 0; i <= 5; i++) {
                xValue = (shapeWidth / 2) * Math.cos((Math.PI / 180) * (i * eq));
                yValue = (shapeWidth / 2) * Math.sin((Math.PI / 180) * (i * eq));
                if (i === 0) {
                    renderPath = 'M' + ' ' + (shapeX + xValue) + ' ' + (shapeY + yValue) + ' ';
                } else {
                    renderPath = renderPath.concat('L' + ' ' + (shapeX + xValue) + ' ' + (shapeY + yValue) + ' ');
                }
            }
            renderPath = renderPath.concat('Z');
            merge(options, { 'd': renderPath });
            break;
        case 'Star':
            renderPath = 'M ' + (location.x + size.width / 3) + ' ' + (location.y - size.height / 2) + ' L ' + (location.x - size.width / 2)
                + ' ' + (location.y + size.height / 6) + ' L ' + (location.x + size.width / 2) + ' ' + (location.y + size.height / 6)
                + ' L ' + (location.x - size.width / 3) + ' ' + (location.y - size.height / 2) + ' L ' + location.x + ' ' +
                (location.y + size.height / 2) + ' L ' + (location.x + size.width / 3) + ' ' + (location.y - size.height / 2) + ' Z';
            merge(options, { 'd': renderPath });
            break;
        case 'Cross':
            renderPath = 'M' + ' ' + x + ' ' + shapeY + ' ' + 'L' + ' ' + (shapeX + (shapeWidth / 2)) + ' ' + shapeY + ' ' +
                'M' + ' ' + shapeX + ' ' + (shapeY + (shapeHeight / 2)) + ' ' + 'L' + ' ' + shapeX + ' ' +
                (shapeY + (-shapeHeight / 2));
            merge(options, { 'd': renderPath });
            break;
        case 'Image':
            functionName = 'Image';
            merge(options, { 'href': url, 'height': shapeHeight, 'width': shapeWidth, x: x, y: y });
            break;
    }
    return { renderOption: options, functionName: functionName };
}

export function isParentItem(data: Object[], item: Object): boolean {
    let isParentItem: boolean = false;
    for (let j: number = 0; j < data.length; j++) {
        if (item['levelOrderName'] === data[j]['levelOrderName']) {
            isParentItem = true;
            break;
        }
    }
    return isParentItem;
}
/**
 * Ajax support for treemap
 */
export class TreeMapAjax {
    /** options for data */
    public dataOptions: string | Object;
    /** type of data */
    public type: string;
    /** async value */
    public async: boolean;
    /** type of the content */
    public contentType: string;
    /** sending data */
    public sendData: string | Object;
    constructor(options: string | Object, type?: string, async?: boolean, contentType?: string, sendData?: string | Object) {
        this.dataOptions = options;
        this.type = type || 'GET';
        this.async = async || true;
        this.contentType = contentType;
        this.sendData = sendData;
    }
}

export function removeShape(collection: object[], value: string): void {
    if (collection.length > 0) {
        for (let i: number = 0; i < collection.length; i++) {
            let item: object = collection[i];
            setColor(item['legendEle'], item['oldFill'], item['oldOpacity'], item['oldBorderColor'], item['oldBorderWidth']);
        }
    }
}

export function removeLegend(collection: object[], value: string): void {
    if (collection.length > 0) {
        for (let j: number = 0; j < collection.length; j++) {
            let item: object = collection[j];
            setColor(item['legendEle'], item['oldFill'], item['oldOpacity'], item['oldBorderColor'], item['oldBorderWidth']);
            let dataCount: number = item['ShapeCollection']['Elements'].length;
            for (let k: number = 0; k < dataCount; k++) {
                setColor(
                    item['ShapeCollection']['Elements'][k], item['shapeOldFill'], item['shapeOldOpacity'],
                    item['shapeOldBorderColor'], item['shapeOldBorderWidth']);
            }
        }
    }
}

export function setColor(element: Element, fill: string, opacity: string, borderColor: string, borderWidth: string): void {
    element.setAttribute('fill', fill);
    element.setAttribute('opacity', opacity);
    element.setAttribute('stroke', borderColor);
    element.setAttribute('stroke-width', borderWidth);
}

export function removeSelectionWithHighlight(collection: object[], element: object[], treemap: TreeMap): void {
    removeShape(collection, 'highlight');
    element = [];
    removeClassNames(document.getElementsByClassName('treeMapHighLight'), 'treeMapHighLight', treemap);
}

export function getLegendIndex(length: number, item: object, treemap: TreeMap): number {
    let index: number;
    for (let i: number = 0; i < length; i++) {
        let dataLength: number = treemap.treeMapLegendModule.legendCollections[i]['legendData'].length;
        for (let j: number = 0; j < dataLength; j++) {
            if (treemap.treeMapLegendModule.legendCollections[i]['legendData'][j]['levelOrderName'] === item['levelOrderName']) {
                index = i;
                break;
            }
        }
    }
    return index;
}

export function pushCollection(
    collection: object[], index: number, number: number, legendElement: Element, shapeElement: Element,
    renderItems: object[], legendCollection: object[]): void {
    collection.push({
        legendEle: legendElement, oldFill: legendCollection[index]['legendFill'],
        oldOpacity: legendCollection[index]['opacity'], oldBorderColor: legendCollection[index]['borderColor'],
        oldBorderWidth: legendCollection[index]['borderWidth'],
        shapeElement: shapeElement, shapeOldFill: renderItems[number]['options']['fill'],
        shapeOldOpacity: renderItems[number]['options']['opacity'],
        shapeOldBorderColor: renderItems[number]['options']['border']['color'],
        shapeOldBorderWidth: renderItems[number]['options']['border']['width']
    });
}