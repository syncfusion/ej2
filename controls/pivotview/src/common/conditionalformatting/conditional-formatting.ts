import { Dialog, BeforeOpenEventArgs, ButtonPropsModel } from '@syncfusion/ej2-popups';
import { isNullOrUndefined as isNaN, createElement, extend, remove, addClass } from '@syncfusion/ej2-base';
import { IConditionalFormatSettings } from '../../base/engine';
import { PivotView } from '../../pivotview/base/pivotview';
import { Button } from '@syncfusion/ej2-buttons';
import { ColorPicker, ColorPickerEventArgs } from '@syncfusion/ej2-inputs';
import { DropDownList, ChangeEventArgs as DropDownArgs } from '@syncfusion/ej2-dropdowns';
import { ConditionalFormatSettingsModel } from '../../pivotview/model/datasourcesettings-model';
import { Condition } from '../../base';
import * as cls from '../../common/base/css-constant';

/**
 * Module to render Conditional Formatting Dialog
 */

/** @hidden */
export class ConditionalFormatting {
    public parent: PivotView;

    /**
     * Internal variables.
     */
    private dialog: Dialog;
    private parentID: string;
    private fieldsDropDown: DropDownList[];
    private conditionsDropDown: DropDownList[];
    private fontNameDropDown: DropDownList[];
    private fontSizeDropDown: DropDownList[];
    private fontColor: ColorPicker[];
    private backgroundColor: ColorPicker[];
    private newFormat: IConditionalFormatSettings[];

    /** Constructor for conditionalformatting module */
    constructor(parent: PivotView) {
        this.parent = parent;
        this.parent.conditionalFormattingModule = this;
        this.parentID = this.parent.element.id;
        this.dialog = null;
        this.fieldsDropDown = [];
        this.conditionsDropDown = [];
        this.fontNameDropDown = [];
        this.fontSizeDropDown = [];
        this.fontColor = [];
        this.backgroundColor = [];
        this.newFormat = [];
    }

    /**
     * To get module name.
     * @returns string
     */
    protected getModuleName(): string {
        return 'conditionalformatting';
    }

    private createDialog(): void {
        if (document.querySelector('#' + this.parentID + 'conditionalformatting') !== null) {
            remove(document.querySelector('#' + this.parentID + 'conditionalformatting'));
        }
        this.parent.element.appendChild(createElement('div', {
            id: this.parentID + 'conditionalformatting',
        }));
        let buttonModel: ButtonPropsModel[] = [
            {
                click: this.addButtonClick.bind(this),
                buttonModel: {
                    cssClass: this.parent.isAdaptive ? (cls.FORMAT_ROUND_BUTTON + ' ' + cls.FORMAT_CONDITION_BUTTON) :
                        cls.FORMAT_CONDITION_BUTTON,
                    iconCss: cls.ICON + ' ' + cls.ADD_ICON_CLASS,
                    content: this.parent.isAdaptive ? '' : this.parent.localeObj.getConstant('condition'),
                }
            },
            {
                click: this.applyButtonClick.bind(this),
                buttonModel: {
                    cssClass: cls.FLAT_CLASS + ' ' + cls.FORMAT_APPLY_BUTTON,
                    content: this.parent.localeObj.getConstant('apply')
                }
            },
            {
                click: this.cancelButtonClick.bind(this),
                buttonModel: {
                    cssClass: cls.FLAT_CLASS + ' ' + cls.FORMAT_CANCEL_BUTTON,
                    content: this.parent.localeObj.getConstant('cancel')
                }
            }
        ];
        if (this.parent.isAdaptive) {
            this.dialog = new Dialog({
                animationSettings: { effect: 'Zoom' }, isModal: true, width: '100%', height: '100%',
                showCloseIcon: false, closeOnEscape: false, enableRtl: this.parent.enableRtl,
                position: { X: 'center', Y: 'center' }, allowDragging: true, buttons: buttonModel,
                beforeOpen: this.beforeOpen.bind(this),
                cssClass: cls.FORMAT_DIALOG, header: this.parent.localeObj.getConstant('conditionalFormating'), target: document.body
            });
        } else {
            this.dialog = new Dialog({
                allowDragging: true, position: { X: 'center', Y: this.parent.element.offsetTop }, buttons: buttonModel,
                beforeOpen: this.beforeOpen.bind(this),
                cssClass: cls.FORMAT_DIALOG, isModal: false, closeOnEscape: true, enableRtl: this.parent.enableRtl,
                showCloseIcon: true, header: this.parent.localeObj.getConstant('conditionalFormating'), target: this.parent.element
            });
        }
        this.dialog.isStringTemplate = true;
        this.dialog.appendTo('#' + this.parentID + 'conditionalformatting');
        this.dialog.element.querySelector('.e-dlg-header').innerHTML = this.parent.localeObj.getConstant('conditionalFormating');
    }

    private beforeOpen(args: BeforeOpenEventArgs): void {
        this.dialog.element.querySelector('.' + cls.DIALOG_HEADER).
            setAttribute('title', this.parent.localeObj.getConstant('conditionalFormating'));
    }

    private addButtonClick(): void {
        let format: ConditionalFormatSettingsModel = {
            conditions: 'LessThan',
            value1: 0,
            style: {
                backgroundColor: 'white',
                color: 'black',
                fontFamily: 'Arial',
                fontSize: '12px'
            }
        };
        this.refreshConditionValues();
        this.newFormat.push(format);
        this.addFormat();
    }

    private applyButtonClick(): void {
        if (this.refreshConditionValues()) {
            this.parent.setProperties({ dataSourceSettings: { conditionalFormatSettings: this.newFormat } }, true);
            this.parent.renderPivotGrid();
            this.destroy();
        }
    }

    private cancelButtonClick(): void {
        this.destroy();
        this.newFormat = [];
    }

    private refreshConditionValues(): boolean {
        for (let i: number = 0; i < this.newFormat.length; i++) {
            if ((document.querySelector('#' + this.parentID + 'conditionvalue1' + i) as HTMLInputElement).value === '' ||
                (document.querySelector('#' + this.parentID + 'conditionvalue2' + i) as HTMLInputElement).value === '') {
                (document.querySelector('#' + this.parentID + 'conditionvalue1' + i) as HTMLInputElement).value === '' ?
                    (document.querySelector('#' + this.parentID + 'conditionvalue1' + i) as HTMLInputElement).focus() :
                    (document.querySelector('#' + this.parentID + 'conditionvalue2' + i) as HTMLInputElement).focus();
                return false;
            }
            this.newFormat[i].value1 =
                Number((document.querySelector('#' + this.parentID + 'conditionvalue1' + i) as HTMLInputElement).value);
            this.newFormat[i].value2 =
                Number((document.querySelector('#' + this.parentID + 'conditionvalue2' + i) as HTMLInputElement).value);
        }
        return true;
    }

    private addFormat(): void {
        let format: HTMLElement = createElement('div', { id: this.parentID + 'formatDiv', className: cls.FORMAT_NEW });
        for (let i: number = 0; i < this.newFormat.length; i++) {
            format.appendChild(this.createDialogElements(i));
        }
        if (this.newFormat.length === 0) {
            let outerDiv: HTMLElement = this.createDialogElements();
            let element: HTMLElement = createElement('p', {
                id: this.parentID + 'emptyFormat',
                innerHTML: this.parent.localeObj.getConstant('emptyFormat'),
                styles: 'margin: 10px'
            });
            outerDiv.appendChild(element);
            format.appendChild(outerDiv);
        }
        this.dialog.setProperties({ 'content': format }, false);
        for (let i: number = 0; i < this.newFormat.length; i++) {
            this.renderDropDowns(i);
            this.renderColorPicker(i);
        }
    }

    private createDialogElements(i?: number): HTMLElement {
        let outerDiv: HTMLElement = createElement('div', {
            id: this.parentID + 'outerDiv' + i, className: cls.FORMAT_OUTER
        });
        if (i !== undefined) {
            let format: ConditionalFormatSettingsModel = this.newFormat[i];
            let button: HTMLElement = createElement('button', {
                id: this.parentID + 'removeButton' + i, className: cls.FORMAT_DELETE_BUTTON,
                attrs: { 'title': this.parent.localeObj.getConstant('delete') }
            });
            outerDiv.appendChild(button);
            let innerDiv: HTMLElement = createElement('div', { id: this.parentID + 'innerDiv', className: cls.FORMAT_INNER });
            let table: HTMLElement = createElement('table', { id: this.parentID + 'cftable', className: cls.FORMAT_TABLE });
            let tRow: HTMLElement = createElement('tr'); let td: HTMLElement = createElement('td');
            let valuelabel: HTMLElement = createElement('span', {
                id: this.parentID + 'valuelabel' + i, className: cls.FORMAT_VALUE_LABEL,
                innerHTML: this.parent.localeObj.getConstant('value')
            });
            td.appendChild(valuelabel); tRow.appendChild(td);
            table.appendChild(tRow); tRow = createElement('tr'); td = createElement('td');
            let measureDropdown: HTMLElement = createElement('div', { id: this.parentID + 'measure' + i });
            let measureInput: HTMLInputElement = createElement('input', {
                id: this.parentID + 'measureinput' + i,
                attrs: { 'type': 'text', 'tabindex': '1' }
            }) as HTMLInputElement;
            measureDropdown.appendChild(measureInput); td.appendChild(measureDropdown); tRow.appendChild(td); td = createElement('td');
            let conditionDropdown: HTMLElement = createElement('div', { id: this.parentID + 'condition' });
            let conditionInput: HTMLInputElement = createElement('input', {
                id: this.parentID + 'conditioninput' + i,
                attrs: { 'type': 'text', 'tabindex': '1' }
            }) as HTMLInputElement;
            conditionDropdown.appendChild(conditionInput); td.appendChild(conditionDropdown); tRow.appendChild(td);
            td = createElement('td');
            let style: string = !(format.conditions === 'Between' || format.conditions === 'NotBetween') ? 'display:none; width:10px' : '';
            let value1: HTMLInputElement = createElement('input', {
                id: this.parentID + 'conditionvalue1' + i,
                attrs: {
                    'type': 'text', 'tabindex': '1', 'value': !isNaN(format.value1) ? format.value1.toString() : '0',
                    'placeholder': this.parent.localeObj.getConstant('emptyInput')
                },
                styles: this.parent.isAdaptive ? style === '' ? 'width: 35%' : 'width: 100%' : style === '' ? 'width: 45px' :
                    'width: 120px',
                className: cls.INPUT + ' ' + cls.FORMAT_VALUE1
            }) as HTMLInputElement;
            td.appendChild(value1);
            let valuespan: HTMLElement = createElement('span', {
                id: this.parentID + 'valuespan' + i, className: cls.FORMAT_VALUE_SPAN,
                innerHTML: '&', styles: style
            });
            td.appendChild(valuespan);
            let value2: HTMLInputElement = createElement('input', {
                id: this.parentID + 'conditionvalue2' + i,
                attrs: {
                    'type': 'text', 'tabindex': '1', 'value': !isNaN(format.value2) ? format.value2.toString() : '0',
                    'placeholder': this.parent.localeObj.getConstant('emptyInput')
                },
                styles: (this.parent.isAdaptive && style === '') ? 'width: 35%' : style === '' ? 'width: 45px' : style,
                className: cls.INPUT + ' ' + cls.FORMAT_VALUE2
            }) as HTMLInputElement;
            td.appendChild(value2); tRow.appendChild(td); table.appendChild(tRow);
            if (this.parent.isAdaptive) {
                innerDiv.appendChild(table); table = createElement('table', { id: this.parentID + 'cftable', className: cls.FORMAT_TABLE });
            }
            tRow = createElement('tr'); td = createElement('td');
            let formatlabel: HTMLElement = createElement('span', {
                id: this.parentID + 'formatlabel' + i, className: cls.FORMAT_LABEL,
                innerHTML: this.parent.localeObj.getConstant('formatLabel')
            });
            td.appendChild(formatlabel); tRow.appendChild(td); table.appendChild(tRow); tRow = createElement('tr');
            td = createElement('td'); let fontNameDropdown: HTMLElement = createElement('div', { id: this.parentID + 'fontname' });
            let fontNameInput: HTMLInputElement = createElement('input', {
                id: this.parentID + 'fontnameinput' + i, attrs: { 'type': 'text', 'tabindex': '1' }
            }) as HTMLInputElement;
            fontNameDropdown.appendChild(fontNameInput); td.appendChild(fontNameDropdown); tRow.appendChild(td); td = createElement('td');
            let fontSizeDropdown: HTMLElement = createElement('div', { id: this.parentID + 'fontsize' });
            let fontSizeInput: HTMLInputElement = createElement('input', {
                id: this.parentID + 'fontsizeinput' + i, attrs: { 'type': 'text', 'tabindex': '1' }
            }) as HTMLInputElement;
            fontSizeDropdown.appendChild(fontSizeInput); td.appendChild(fontSizeDropdown); tRow.appendChild(td);
            if (this.parent.isAdaptive) {
                table.appendChild(tRow); tRow = createElement('tr'); table.appendChild(tRow); tRow = createElement('tr');
            }
            td = createElement('td');
            let colorPicker1: HTMLInputElement = createElement('input', {
                id: this.parentID + 'fontcolor' + i, attrs: { 'type': 'color', 'tabindex': '1' }, className: cls.FORMAT_FONT_COLOR
            }) as HTMLInputElement;
            td.appendChild(colorPicker1);
            let colorPicker2: HTMLInputElement = createElement('input', {
                id: this.parentID + 'backgroundcolor' + i, attrs: { 'type': 'color', 'tabindex': '1' }, className: cls.FORMAT_BACK_COLOR
            }) as HTMLInputElement;
            td.appendChild(colorPicker2); tRow.appendChild(td); td = createElement('td');
            let valuePreview: HTMLInputElement = createElement('div', {
                id: this.parentID + 'valuepreview' + i, className: cls.INPUT + ' ' + cls.FORMAT_VALUE_PREVIEW,
                innerHTML: '123.45',
            }) as HTMLInputElement;
            td.appendChild(valuePreview); tRow.appendChild(td); table.appendChild(tRow); innerDiv.appendChild(table);
            outerDiv.appendChild(innerDiv);
        }
        return outerDiv;
    }

    private renderDropDowns(i: number): void {
        let format: ConditionalFormatSettingsModel = this.newFormat[i];
        let fields: { [key: string]: Object }[] = [];
        fields.push({
            index: 0, name: this.parent.localeObj.getConstant('AllValues'),
            field: this.parent.localeObj.getConstant('AllValues')
        });
        for (let i: number = 0; i < this.parent.dataSourceSettings.values.length; i++) {
            fields.push({
                index: i + 1,
                name: this.parent.dataSourceSettings.values[i].caption || this.parent.dataSourceSettings.values[i].name,
                field: this.parent.dataSourceSettings.values[i].name
            });
        }
        let value: string = isNaN(format.measure) ? this.parent.localeObj.getConstant('AllValues') : format.measure;
        this.fieldsDropDown[i] = new DropDownList({
            dataSource: fields, fields: { text: 'name', value: 'field' },
            value: value, width: this.parent.isAdaptive ? '100%' : '120px',
            popupHeight: '200px', popupWidth: 'auto',
            change: this.measureChange.bind(this, i)
        });
        this.fieldsDropDown[i].isStringTemplate = true;
        this.fieldsDropDown[i].appendTo('#' + this.parentID + 'measureinput' + i);
        let conditions: { [key: string]: Object }[] = [
            { value: 'LessThan', name: this.parent.localeObj.getConstant('LessThan') },
            { value: 'LessThanOrEqualTo', name: this.parent.localeObj.getConstant('LessThanOrEqualTo') },
            { value: 'GreaterThan', name: this.parent.localeObj.getConstant('GreaterThan') },
            { value: 'GreaterThanOrEqualTo', name: this.parent.localeObj.getConstant('GreaterThanOrEqualTo') },
            { value: 'Equals', name: this.parent.localeObj.getConstant('Equals') },
            { value: 'NotEquals', name: this.parent.localeObj.getConstant('NotEquals') },
            { value: 'Between', name: this.parent.localeObj.getConstant('Between') },
            { value: 'NotBetween', name: this.parent.localeObj.getConstant('NotBetween') }
        ];
        value = isNaN(format.conditions) ? 'LessThan' : format.conditions;
        this.conditionsDropDown[i] = new DropDownList({
            dataSource: conditions, fields: { value: 'value', text: 'name' },
            value: value, width: this.parent.isAdaptive ? '100%' : '120px',
            popupHeight: '200px', popupWidth: 'auto',
            change: this.conditionChange.bind(this, i)
        });
        this.conditionsDropDown[i].isStringTemplate = true;
        this.conditionsDropDown[i].appendTo('#' + this.parentID + 'conditioninput' + i);
        let fontNames: { [key: string]: Object }[] = [
            { index: 0, name: 'Arial' }, { index: 1, name: 'San Serif' }, { index: 2, name: 'Impact' },
            { index: 3, name: 'Trebuchet MS' }, { index: 4, name: 'Serif' }, { index: 5, name: 'Verdana' },
            { index: 6, name: 'Courier New' }, { index: 7, name: 'Times New Roman' }, { index: 8, name: 'Tahoma' },
            { index: 9, name: 'Gerogia' }
        ];
        value = isNaN(format.style.fontFamily) ? 'Arial' : format.style.fontFamily;
        this.fontNameDropDown[i] = new DropDownList({
            dataSource: fontNames, fields: { text: 'name' },
            value: value, width: this.parent.isAdaptive ? '100%' : '120px',
            popupWidth: '150px', popupHeight: '200px',
            change: this.fontNameChange.bind(this, i)
        });
        this.fontNameDropDown[i].isStringTemplate = true;
        this.fontNameDropDown[i].appendTo('#' + this.parentID + 'fontnameinput' + i);
        let fontSize: { [key: string]: Object }[] = [
            { index: 0, name: '9px' }, { index: 1, name: '10px' }, { index: 2, name: '11px' }, { index: 3, name: '12px' },
            { index: 4, name: '13px' }, { index: 5, name: '14px' }, { index: 6, name: '15px' }, { index: 6, name: '16px' }
        ];
        value = isNaN(format.style.fontSize) ? '12px' : format.style.fontSize;
        this.fontSizeDropDown[i] = new DropDownList({
            dataSource: fontSize, fields: { text: 'name' }, popupHeight: '200px',
            value: value, width: this.parent.isAdaptive ? '100%' : '120px',
            change: this.fontSizeChange.bind(this, i)
        });
        this.fontSizeDropDown[i].isStringTemplate = true;
        this.fontSizeDropDown[i].appendTo('#' + this.parentID + 'fontsizeinput' + i);
    }

    private conditionChange(i: number, args: DropDownArgs): void {
        this.newFormat[i].conditions = args.value as Condition;
        if (args.value === 'Between' || args.value === 'NotBetween') {
            (document.querySelector('#' + this.parentID + 'valuespan' + i) as HTMLElement).style.display = 'inline-block';
            (document.querySelector('#' + this.parentID + 'valuespan' + i) as HTMLElement).style.width =
                this.parent.isAdaptive ? '10%' : '10px';
            (document.querySelector('#' + this.parentID + 'conditionvalue2' + i) as HTMLElement).style.display = 'inline-block';
            (document.querySelector('#' + this.parentID + 'conditionvalue2' + i) as HTMLElement).style.width =
                this.parent.isAdaptive ? '35%' : '45px';
            (document.querySelector('#' + this.parentID + 'conditionvalue1' + i) as HTMLElement).style.width =
                this.parent.isAdaptive ? '35%' : '45px';
        } else {
            (document.querySelector('#' + this.parentID + 'valuespan' + i) as HTMLElement).style.display = 'none';
            (document.querySelector('#' + this.parentID + 'conditionvalue2' + i) as HTMLElement).style.display = 'none';
            (document.querySelector('#' + this.parentID + 'conditionvalue1' + i) as HTMLElement).style.width =
                this.parent.isAdaptive ? '100%' : '120px';
        }
    }

    private fontNameChange(i: number, args: DropDownArgs): void {
        this.newFormat[i].style.fontFamily = args.value.toString();
        (document.querySelector('#' + this.parentID + 'valuepreview' + i) as HTMLElement).style.fontFamily = args.value as string;
    }

    private fontSizeChange(i: number, args: DropDownArgs): void {
        this.newFormat[i].style.fontSize = args.value.toString();
        (document.querySelector('#' + this.parentID + 'valuepreview' + i) as HTMLElement).style.fontSize = args.value as string;
    }

    private measureChange(i: number, args: DropDownArgs): void {
        this.newFormat[i].measure = args.value.toString() === this.parent.localeObj.getConstant('AllValues') ?
            undefined : args.value.toString();
    }

    private renderColorPicker(i: number): void {
        let format: ConditionalFormatSettingsModel = this.newFormat[i];
        let value: string = isNaN(format.style.color) ? 'black' : format.style.color;
        let color: string = this.isHex(value.substr(1)) ? value : this.colourNameToHex(value);
        (document.querySelector('#' + this.parentID + 'valuepreview' + i) as HTMLElement).style.color = color;
        this.fontColor[i] = new ColorPicker({
            cssClass: cls.FORMAT_COLOR_PICKER, value: color, mode: 'Palette',
            change: this.fontColorChange.bind(this, i)
        });
        this.fontColor[i].isStringTemplate = true;
        this.fontColor[i].appendTo('#' + this.parentID + 'fontcolor' + i);
        addClass([this.fontColor[i].element.nextElementSibling.querySelector('.' + cls.SELECTED_COLOR)], cls.ICON);
        value = isNaN(format.style.backgroundColor) ? 'white' : format.style.backgroundColor;
        color = this.isHex(value.substr(1)) ? value : this.colourNameToHex(value);
        (document.querySelector('#' + this.parentID + 'valuepreview' + i) as HTMLElement).style.backgroundColor = color;
        (document.querySelector('#' + this.parentID + 'valuepreview' + i) as HTMLElement).style.fontFamily = format.style.fontFamily;
        (document.querySelector('#' + this.parentID + 'valuepreview' + i) as HTMLElement).style.fontSize = format.style.fontSize;
        this.backgroundColor[i] = new ColorPicker({
            cssClass: cls.FORMAT_COLOR_PICKER, value: color, mode: 'Palette',
            change: this.backColorChange.bind(this, i)
        });
        this.backgroundColor[i].isStringTemplate = true;
        this.backgroundColor[i].appendTo('#' + this.parentID + 'backgroundcolor' + i);
        addClass([this.backgroundColor[i].element.nextElementSibling.querySelector('.e-selected-color')], cls.ICON);
        let toggleBtn: Button = new Button({
            iconCss: cls.ICON + ' ' + cls.FORMAT_DELETE_ICON,
            cssClass: cls.FLAT
        });
        toggleBtn.isStringTemplate = true;
        toggleBtn.appendTo('#' + this.parentID + 'removeButton' + i);
        toggleBtn.element.onclick = this.toggleButtonClick.bind(this, i);
    }

    private backColorChange(i: number, args: ColorPickerEventArgs): void {
        this.newFormat[i].style.backgroundColor = args.currentValue.hex;
        (document.querySelector('#' + this.parentID + 'valuepreview' + i) as HTMLElement).style.backgroundColor =
            args.currentValue.hex;
    }

    private fontColorChange(i: number, args: ColorPickerEventArgs): void {
        this.newFormat[i].style.color = args.currentValue.hex;
        (document.querySelector('#' + this.parentID + 'valuepreview' + i) as HTMLElement).style.color =
            args.currentValue.hex;
    }

    private toggleButtonClick(i: number): void {
        this.newFormat.splice(i, 1);
        this.addFormat();
    }

    /**
     * To check is Hex or not.
     * @returns boolean
     * @hidden
     */
    public isHex(h: string): boolean {
        let a: number = parseInt(h, 16);
        while (h.charAt(0) === '0') {
            h = h.substr(1);
        }
        return (a.toString(16) === h.toLowerCase() || (a === 0 && h === ''));
    }

    /**
     * To convert hex to RGB.
     * @returns { r: number, g: number, b: number } | null
     * @hidden
     */
    public hexToRgb(hex: string): { r: number, g: number, b: number } | null {
        let result: RegExpExecArray = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * To convert color to hex.
     * @returns string
     * @hidden
     */
    public colourNameToHex(colour: string): string {
        let colours: { [key: string]: string } = {
            'aliceblue': '#f0f8ff', 'antiquewhite': '#faebd7', 'aqua': '#00ffff', 'aquamarine': '#7fffd4',
            'azure': '#f0ffff', 'beige': '#f5f5dc', 'bisque': '#ffe4c4', 'black': '#000000',
            'blanchedalmond': '#ffebcd', 'blue': '#0000ff',
            'blueviolet': '#8a2be2', 'brown': '#a52a2a', 'burlywood': '#deb887', 'cadetblue': '#5f9ea0',
            'chartreuse': '#7fff00', 'chocolate': '#d2691e',
            'coral': '#ff7f50', 'cornflowerblue': '#6495ed', 'cornsilk': '#fff8dc', 'crimson': '#dc143c', 'cyan': '#00ffff',
            'darkblue': '#00008b', 'darkcyan': '#008b8b', 'darkgoldenrod': '#b8860b', 'darkgray': '#a9a9a9', 'darkgreen': '#006400',
            'darkkhaki': '#bdb76b', 'darkmagenta': '#8b008b', 'darkolivegreen': '#556b2f',
            'darkorange': '#ff8c00', 'darkorchid': '#9932cc', 'darkred': '#8b0000', 'darksalmon': '#e9967a', 'darkseagreen': '#8fbc8f',
            'darkslateblue': '#483d8b', 'darkslategray': '#2f4f4f', 'darkturquoise': '#00ced1',
            'darkviolet': '#9400d3', 'deeppink': '#ff1493', 'deepskyblue': '#00bfff', 'dimgray': '#696969', 'dodgerblue': '#1e90ff',
            'firebrick': '#b22222', 'floralwhite': '#fffaf0', 'forestgreen': '#228b22', 'fuchsia': '#ff00ff',
            'gainsboro': '#dcdcdc', 'ghostwhite': '#f8f8ff', 'gold': '#ffd700', 'goldenrod': '#daa520',
            'gray': '#808080', 'green': '#008000',
            'greenyellow': '#adff2f', 'honeydew': '#f0fff0', 'hotpink': '#ff69b4', 'indianred ': '#cd5c5c',
            'indigo': '#4b0082', 'ivory': '#fffff0',
            'khaki': '#f0e68c', 'lavender': '#e6e6fa', 'lavenderblush': '#fff0f5', 'lawngreen': '#7cfc00', 'lemonchiffon': '#fffacd',
            'lightblue': '#add8e6', 'lightcoral': '#f08080', 'lightcyan': '#e0ffff', 'lightgoldenrodyellow': '#fafad2',
            'lightgrey': '#d3d3d3', 'lightgreen': '#90ee90', 'lightpink': '#ffb6c1', 'lightsalmon': '#ffa07a', 'lightseagreen': '#20b2aa',
            'lightskyblue': '#87cefa', 'lightslategray': '#778899', 'lightsteelblue': '#b0c4de',
            'lightyellow': '#ffffe0', 'lime': '#00ff00', 'limegreen': '#32cd32', 'linen': '#faf0e6',
            'magenta': '#ff00ff', 'maroon': '#800000', 'mediumaquamarine': '#66cdaa', 'mediumblue': '#0000cd', 'mediumorchid': '#ba55d3',
            'mediumpurple': '#9370d8', 'mediumseagreen': '#3cb371', 'mediumslateblue': '#7b68ee',
            'mediumspringgreen': '#00fa9a', 'mediumturquoise': '#48d1cc', 'mediumvioletred': '#c71585', 'midnightblue': '#191970',
            'mintcream': '#f5fffa', 'mistyrose': '#ffe4e1', 'moccasin': '#ffe4b5', 'navajowhite': '#ffdead', 'navy': '#000080',
            'oldlace': '#fdf5e6', 'olive': '#808000', 'olivedrab': '#6b8e23', 'orange': '#ffa500', 'orangered': '#ff4500',
            'orchid': '#da70d6',
            'palegoldenrod': '#eee8aa', 'palegreen': '#98fb98', 'paleturquoise': '#afeeee', 'palevioletred': '#d87093',
            'papayawhip': '#ffefd5',
            'peachpuff': '#ffdab9', 'peru': '#cd853f', 'pink': '#ffc0cb', 'plum': '#dda0dd', 'powderblue': '#b0e0e6', 'purple': '#800080',
            'rebeccapurple': '#663399', 'red': '#ff0000', 'rosybrown': '#bc8f8f', 'royalblue': '#4169e1',
            'saddlebrown': '#8b4513', 'salmon': '#fa8072', 'sandybrown': '#f4a460', 'seagreen': '#2e8b57',
            'seashell': '#fff5ee', 'sienna': '#a0522d',
            'silver': '#c0c0c0', 'skyblue': '#87ceeb', 'slateblue': '#6a5acd', 'slategray': '#708090', 'snow': '#fffafa',
            'springgreen': '#00ff7f',
            'steelblue': '#4682b4', 'tan': '#d2b48c', 'teal': '#008080', 'thistle': '#d8bfd8', 'tomato': '#ff6347', 'turquoise': '#40e0d0',
            'violet': '#ee82ee', 'wheat': '#f5deb3', 'white': '#ffffff', 'whitesmoke': '#f5f5f5', 'yellow': '#ffff00',
            'yellowgreen': '#9acd32'
        };

        if (typeof colours[colour.toLowerCase()] !== 'undefined') {
            return colours[colour.toLowerCase()];
        }
        return '#d5d5d5';
    }

    /**
     * To create Conditional Formatting dialog.
     * @returns void
     */
    public showConditionalFormattingDialog(): void {
        this.newFormat = [];
        for (let i: number = 0; i < this.parent.dataSourceSettings.conditionalFormatSettings.length; i++) {
            this.newFormat.push(
                extend(
                    {},
                    (<{ [key: string]: Object }>this.parent.dataSourceSettings.conditionalFormatSettings[i]).properties,
                    null, true) as IConditionalFormatSettings);
        }
        this.createDialog();
        this.dialog.refresh();
        this.addFormat();
    }

    /**
     * To destroy the Conditional Formatting dialog
     * @returns void
     * @hidden
     */
    public destroy(): void {
        if (this.dialog && !this.dialog.isDestroyed) {
            this.dialog.hide();
            for (let i: number = 0; i < this.newFormat.length; i++) {
                if (this.fontColor[i] && !this.fontColor[i].isDestroyed) { this.fontColor[i].destroy(); }
                if (this.backgroundColor[i] && !this.backgroundColor[i].isDestroyed) { this.backgroundColor[i].destroy(); }
            }
            this.dialog.destroy();
        } else {
            return;
        }
    }
}