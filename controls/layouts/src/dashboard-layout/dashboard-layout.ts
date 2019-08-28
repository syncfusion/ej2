import { Component, Property, NotifyPropertyChanges, INotifyPropertyChanged, isUndefined } from '@syncfusion/ej2-base';
import { Collection, Draggable, isNullOrUndefined, DragEventArgs, append, updateBlazorTemplate } from '@syncfusion/ej2-base';
import { EmitType, Event, formatUnit, ChildProperty, compile, closest } from '@syncfusion/ej2-base';
import { setStyleAttribute as setStyle, addClass, detach, removeClass, EventHandler, Browser } from '@syncfusion/ej2-base';
import { DashboardLayoutModel, PanelModel } from './dashboard-layout-model';


// constant class definitions
const preventSelect: string = 'e-prevent';
const dragging: string = 'e-dragging';
const draggable: string = 'e-draggable';
const resize: string = 'e-resize';
const responsive: string = 'e-responsive';
const east: string = 'e-east';
const west: string = 'e-west';
const north: string = 'e-north';
const south: string = 'e-south';
const single: string = 'e-single';
const double: string = 'e-double';
const northEast: string = 'e-north-east';
const southEast: string = 'e-south-east';
const northWest: string = 'e-north-west';
const southWest: string = 'e-south-west';
const panel: string = 'e-panel';
const panelContent: string = 'e-panel-content';
const panelContainer: string = 'e-panel-container';
const disable: string = 'e-disabled';
const header: string = 'e-panel-header';
const panelTransition: string = 'e-panel-transition';

/**
 * Defines the panel of the DashboardLayout component. 
 */
export class Panel extends ChildProperty<Panel> {

    /**
     * Defines the id of the panel.
     * @default ''
     */
    @Property('')
    public id: string;

    /**
     * Defines the CSS class name that can be appended with each panel element.
     * @default ''
     */
    @Property('')
    public cssClass: string;

    /** 
     * Defines the template value that should be displayed as the panel's header. 
     */
    @Property('')
    public header: string | HTMLElement;

    /**
     * Defines the template value that should be displayed as the panel's content. 
     */
    @Property('')
    public content: string | HTMLElement;

    /**
     * Defines whether to the panel should be enabled or not.
     * @default true
     */
    @Property(true)
    public enabled: boolean;

    /**
     * Defines a row value where the panel should be placed.
     * @default 0
     * @aspType int
     * @blazorType int
     */
    @Property(0)
    public row: number;

    /**
     * Defines the column value where the panel to be placed.
     * @default 0
     * @aspType int
     * @blazorType int
     */
    @Property(0)
    public col: number;

    /**
     * Specifies the width of the panel in the layout in cells count.
     *
     * @default 1
     */
    @Property(1)
    public sizeX: number;

    /**
     * Specifies the height of the panel in the layout in cells count.
     *
     * @default 1
     */
    @Property(1)
    public sizeY: number;

    /**
     * Specifies the minimum height of the panel in cells count.
     * 
     * @default 1
     */
    @Property(1)
    public minSizeY: number;

    /**
     * Specifies the minimum width of the panel in cells count.
     * *
     * @default 1
     */
    @Property(1)
    public minSizeX: number;

    /**
     * Specifies the maximum height of the panel in cells count.
     * *
     * @default null
     * @aspType int
     * @blazorType int
     *
     */
    @Property(null)
    public maxSizeY: number;

    /**
     * Specifies the maximum width of the panel in cells count.
     * *
     * @default null
     * @aspType int
     * @blazorType int
     */
    @Property(null)
    public maxSizeX: number;

    /**
     * Specifies the z-index of the panel
     * *
     * @default 1000
     * @aspType double
     * @blazorType double
     */
    @Property(1000)
    public zIndex: number;


}

/**
 * The DashboardLayout is a grid structured layout control, that helps to create a dashboard with panels.
 * Panels hold the UI components or data to be visualized with flexible options like resize, reorder, drag-n-drop, remove and add,
 * that allows users to easily place the panels at a desired position within the grid layout.
 * ```html
 * <div id="default-layout">
 * ```
 * ```typescript
 * <script>
 *   let dashBoardObject : DashboardLayout = new DashboardLayout();
 *   dashBoardObject.appendTo('#default-layout');
 * </script>
 * ```
 */


@NotifyPropertyChanges
export class DashboardLayout extends Component<HTMLElement> implements INotifyPropertyChanged {

    protected panelCollection: HTMLElement[];
    protected checkCollision: HTMLElement[];
    protected mainElement: HTMLElement;
    protected rows: number = 1;
    protected dragobj: Draggable;
    protected dragStartArgs: DragStartArgs;
    protected isDynamicallyUpdated: boolean;
    protected dragStopEventArgs: DragStopArgs;
    protected draggedEventArgs: DraggedEventArgs;
    protected updatedRows: number;
    protected tempObject: DashboardLayout;
    protected sortedArray: HTMLElement[][];
    protected cloneArray: HTMLElement[][];
    protected panelID: number = 0;
    protected movePanelCalled: boolean = false;
    protected resizeCalled: boolean = false;
    protected gridPanelCollection: PanelModel[];
    protected overlapElement: HTMLElement[];
    protected shouldRestrict: boolean;
    protected shouldSubRestrict: boolean;
    protected overlapElementClone: HTMLElement[];
    protected overlapSubElementClone: HTMLElement[];
    protected dragCollection: Draggable[];
    protected iterationValue: number;
    protected shadowEle: HTMLElement;
    protected elementRef: {
        top: string;
        left: string;
        height: string;
        width: string;
    };
    protected allItems: HTMLElement[];
    protected dimensions: (string | number)[];
    protected oldRowCol: {
        [key: string]: {
            row: number,
            col: number
        };
    };
    protected collisionChecker: {
        [key: string]: {
            ele: HTMLElement,
            row: number,
            srcEle: HTMLElement
        };
    };
    protected availableClasses: string[];
    protected addPanelCalled: boolean;
    protected isSubValue: boolean;
    protected direction: number;
    protected directionRow: number;
    protected lastMouseX: number;
    protected lastMouseY: number;
    protected elementX: number;
    protected elementY: number;
    protected elementWidth: number;
    protected elementHeight: number;
    protected previousRow: number;
    protected originalWidth: number;
    protected originalHeight: number;
    protected handleClass: string;
    protected mOffX: number = 0;
    protected mOffY: number = 0;
    protected maxTop: number = 9999;
    protected maxRows: number = 100;
    protected maxLeft: number;
    protected mouseX: number = 0;
    protected mouseY: number = 0;
    protected minTop: number = 0;
    protected minLeft: number = 0;
    protected moveTarget: HTMLElement;
    protected upTarget: HTMLElement;
    protected downTarget: HTMLElement;
    protected leftAdjustable: boolean;
    protected rightAdjustable: boolean;
    protected topAdjustable: boolean;
    protected spacedColumnValue: number;
    protected checkingElement: HTMLElement;
    protected panelContent: HTMLElement;
    protected panelHeaderElement: HTMLElement;
    protected panelBody: HTMLElement;
    protected startRow: number;
    protected startCol: number;
    protected maxColumnValue: number;
    protected checkColumnValue: number;
    protected spacedRowValue: number;
    protected cellSize: number[] | string[];
    protected table: HTMLElement;
    protected cloneObject: {
        [key: string]: {
            row: number,
            col: number
        };
    };
    private panelsInitialModel: PanelModel[];
    protected isRenderComplete: boolean;
    protected isMouseUpBound: boolean;

    /**
     * If allowDragging is set to true, then the DashboardLayout allows you to drag and reorder the panels.
     * *
     * @default true
     */
    @Property(true)
    public allowDragging: boolean;

    /**
     * If allowResizing is set to true, then the DashboardLayout allows you to resize the panels.
     * @default false
     */
    @Property(false)
    public allowResizing: boolean;

    /**
     * If pushing is set to true, then the DashboardLayout allow to push the panels when panels collide
     * while dragging or resizing the panels.
     * *
     * @default true
     * @private
     */
    @Property(true)
    private allowPushing: boolean;

    /**
     * If allowFloating is set to true, then the DashboardLayout automatically move the panels upwards to fill the empty available 
     * cells while dragging or resizing the panels.
     * *
     * @default true
     */
    @Property(true)
    public allowFloating: boolean;

    /** 
     * Defines the cell aspect ratio of the panel. 
     * @default 1
     */
    @Property(1)
    public cellAspectRatio: number;

    /**
     * Defines the spacing between the panels.
     * *
     * @default [5,5]
     */
    @Property([5, 5])
    public cellSpacing: number[];

    /** 
     * Defines the number of columns to be created in the DashboardLayout. 
     * @default 1
     */
    @Property(1)
    public columns: number;
    /**
     * 
     * *
     * @default false
     */
    @Property(false)
    public showGridLines: boolean;

    /**
     * Defines the draggable handle selector which will act as dragging handler for the panels.
     * *
     * @default null
     */
    @Property(null)
    public draggableHandle: string;

    /**
     * Locale property.
     * This is not a dashboard layout property.
     * @default 'en-US'
     * @private
     */
    @Property('en-US')
    public locale: string;

    /**
     * Defines the media query value where the dashboardlayout becomes stacked layout when the resolution meets.
     * @default 'max-width:600px'
     */
    @Property('max-width: 600px')
    public mediaQuery: string;

    /**
     *
     * Defines the panels property of the DashboardLayout component.
     *
     * @default null
     */
    @Collection<PanelModel>([], Panel)
    public panels: PanelModel[];

    /**
     * Defines the resizing handles directions used for resizing the panels.
     * @default 'e-south-east'
     * 
     */
    @Property(['e-south-east'])
    public resizableHandles: string[];

    /**
     * Triggers whenever the panels positions are changed.
     * @event
     * @blazorProperty 'Changed'
     */
    @Event()
    public change: EmitType<ChangeEventArgs>;

    /**
     * Triggers when a panel is about to drag.
     * @event
     * @blazorProperty 'OnDragStart'
     */
    @Event()
    public dragStart: EmitType<DragStartArgs>;

    /**
     * Triggers while a panel is dragged continuously.
     * @event
     * @blazorProperty 'Dragging'
     */
    @Event()
    public drag: EmitType<DraggedEventArgs>;

    /**
     * Triggers when a dragged panel is dropped.
     * @event
     * @blazorProperty 'OnDragStop'
     */
    @Event()
    public dragStop: EmitType<DragStopArgs>;

    /**
     * Triggers when a panel is about to resize.
     * @event
     * @blazorProperty 'OnResizeStart'
     */
    @Event()
    public resizeStart: EmitType<ResizeArgs>;

    /**
     * Triggers when a panel is being resized continuously.
     * @event
     * @blazorProperty 'Resizing'
     */
    @Event()
    public resize: EmitType<ResizeArgs>;

    /**
     * Triggers when a panel resize ends.
     * @event
     * @blazorProperty 'OnResizeStop'
     */
    @Event()
    public resizeStop: EmitType<ResizeArgs>;

    /** 
     * Triggers when Dashboard Layout is created.
     * @event 
     * @blazorproperty 'Created'
     */
    @Event()
    public created: EmitType<Object>;
    /** 
     * Triggers when Dashboard Layout is destroyed.
     * @event 
     * @blazorproperty 'Destroyed'
     */
    @Event()
    public destroyed: EmitType<Object>;


    /**
     * Initialize the event handler
     * @private
     */
    protected preRender(): void {
        this.panelCollection = [];
        this.sortedArray = [];
        this.gridPanelCollection = [];
        this.overlapElement = [];
        this.overlapElementClone = [];
        this.overlapSubElementClone = [];
        this.collisionChecker = {};
        this.dragCollection = [];
        this.elementRef = { top: '', left: '', height: '', width: '' };
        this.dimensions = [];
        this.allItems = [];
        this.oldRowCol = {};
        this.isDynamicallyUpdated = false;
        this.availableClasses = [];
        this.setOldRowCol();
        this.calculateCellSize();
    }

    protected setOldRowCol(): void {
        for (let i: number = 0; i < this.panels.length; i++) {
            if (!this.panels[i].id) {
                this.panelPropertyChange(this.panels[i], { id: 'layout_' + this.panelID.toString() });
                this.panelID = this.panelID + 1;
            }
            this.oldRowCol[this.panels[i].id] = { row: this.panels[i].row, col: this.panels[i].col };
        }
    }

    protected createPanelElement(cssClass: string, idValue: string): HTMLElement {
        let ele: HTMLElement = <HTMLElement>this.createElement('div');
        if (cssClass) { addClass([ele], [cssClass]); }
        if (idValue) { ele.setAttribute('id', idValue); }
        return ele;
    }

    /**
     * To Initialize the control rendering.
     * @returns void
     * @private
     */

    protected render(): void {
        this.initialize();
        this.isRenderComplete = true;
        if (this.showGridLines && !this.checkMediaQuery()) {
            this.initGridLines();
        }
        this.renderComplete();
    }

    private initGridLines(): void {
        this.table = document.createElement('table');
        let tbody: HTMLElement = document.createElement('tbody');
        this.table.classList.add('e-dashboard-gridline-table');
        for (let i: number = 0; i < this.maxRow(); i++) {
            let tr: HTMLElement = document.createElement('tr');
            for (let j: number = 0; j < this.columns; j++) {
                let td: HTMLElement = document.createElement('td');
                td.classList.add('e-dashboard-gridline');
                this.setAttributes({ value: { row: i.toString(), col: j.toString(), sizeX: '1', sizeY: '1' } }, td);
                td.setAttribute('id', '' + j);
                this.setPanelPosition(td, i, j);
                this.setHeightAndWidth(td, { row: i, col: j, sizeX: 1, sizeY: 1 });
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
        this.table.appendChild(tbody);
        this.element.appendChild(this.table);
    }

    private initialize(): void {
        this.updateRowHeight();
        if (this.element.childElementCount > 0) {
            let panelElements: HTMLElement[] = [];
            this.setProperties({ panels: [] }, true);
            for (let i: number = 0; i < this.element.querySelectorAll('.e-panel').length; i++) {
                panelElements.push(<HTMLElement>(this.element.querySelectorAll('.e-panel')[i]));
            }
            for (let i: number = 0; i < panelElements.length; i++) {
                let panelElement: HTMLElement = <HTMLElement>panelElements[i];
                if (this.enableRtl) {
                    addClass([panelElement], 'e-rtl');
                }
                this.getInlinePanels(panelElement);
                this.maxCol();
                this.maxRow();
            }
            for (let i: number = 0; i < this.panels.length; i++) {
                let panelElement: HTMLElement = this.element.querySelector('#' + this.panels[i].id);
                this.setMinMaxValues(this.panels[i]);
                if (this.maxColumnValue < this.panels[i].col || this.maxColumnValue < (this.panels[i].col + this.panels[i].sizeX)) {
                    let colValue: number = this.maxColumnValue - this.panels[i].sizeX;
                    this.panelPropertyChange(this.panels[i], { col: colValue < 0 ? 0 : colValue });
                }
                this.setXYAttributes(panelElement, this.panels[i]);
                let panel: HTMLElement = this.renderPanels(panelElement, this.panels[i], this.panels[i].id, false);
                this.panelCollection.push(panel);
                this.setHeightAndWidth(panelElement, this.panels[i]);
                this.tempObject = this;
                if (this.mediaQuery && !window.matchMedia('(' + this.mediaQuery + ')').matches) {
                    this.setPanelPosition(panelElement, this.panels[i].row, this.panels[i].col);
                    this.mainElement = panelElement;
                    this.updatePanelLayout(panelElement, this.panels[i]);
                    this.mainElement = null;
                }
                this.setClasses([panelElement]);
            }
            if (this.checkMediaQuery()) {
                this.checkMediaQuerySizing();
            }
        } else {
            this.renderDashBoardCells(this.panels);
        }
        if (this.allowDragging && (this.mediaQuery ? !window.matchMedia('(' + this.mediaQuery + ')').matches : true)) {
            this.enableDraggingContent(this.panelCollection);
        }
        this.sortedPanel();
        this.bindEvents();
        this.updatePanels();
        this.updateCloneArrayObject();
        this.checkColumnValue = this.maxColumnValue;
        if (!(this.checkMediaQuery())) {
            this.panelResponsiveUpdate();
        }
        this.setEnableRtl();
    }
    protected checkMediaQuery(): boolean {
        return (this.mediaQuery && window.matchMedia('(' + this.mediaQuery + ')').matches);
    }
    protected calculateCellSize(): void {
        this.cellSize = [];
        if ((this.checkMediaQuery())) {
            this.cellSize[1] = this.element.parentElement
                && Math.floor((this.element.parentElement.offsetWidth)) / this.cellAspectRatio;
        } else {

            this.cellSize[0] = this.element.parentElement &&
                Math.floor((this.element.parentElement.offsetWidth));
            this.cellSize[0] = this.element.parentElement
                && Math.floor((this.element.parentElement.offsetWidth - ((this.maxCol() - 1) * this.cellSpacing[0]))
                    / (this.maxCol()));
            this.cellSize[1] = <number>this.cellSize[0] / this.cellAspectRatio;
        }
    }
    protected maxRow(): number {
        let maxRow: number = 1;
        if (this.rows > 1) {
            maxRow = this.rows;
            return maxRow;
        }
        for (let i: number = 0; i < this.panels.length; i++) {
            if (this.panels[i].sizeY + this.panels[i].row > maxRow) {
                maxRow = this.panels[i].sizeY + this.panels[i].row;
            }
        }
        if (this.panels.length === 0) {
            maxRow = this.columns;
        }
        return maxRow;
    }

    protected maxCol(): number {
        let maxCol: number = 1;
        maxCol = this.columns;
        this.maxColumnValue = maxCol;
        return maxCol;
    }

    protected updateOldRowColumn(): void {
        for (let i: number = 0; i < this.panels.length; i++) {
            let id: string = this.panels[i].id;
            if (document.getElementById(id)) {
                let row: number = parseInt(document.getElementById(id).getAttribute('data-row'), 10);
                let col: number = parseInt(document.getElementById(id).getAttribute('data-col'), 10);
                this.oldRowCol[this.panels[i].id] = { row: row, col: col };
            } else {
                continue;
            }
        }
    }

    protected createSubElement(cssClass: string, idValue: string, className: string): HTMLElement {
        let element: HTMLElement = <HTMLElement>this.createElement('div');
        if (className) { addClass([element], [className]); }
        if (cssClass) { addClass([element], [cssClass]); }
        if (idValue) { element.setAttribute('id', idValue); }
        return element;
    }
    private templateParser(template: string): Function {
        if (template) {
            try {
                if (document.querySelectorAll(template).length) {
                    return compile(document.querySelector(template).innerHTML.trim());
                }
            } catch (error) {
                return compile(template);
            }
        }
        return undefined;
    }

    protected renderTemplate(content: string, appendElement: HTMLElement, type: string, isStringTemplate: boolean): void {
        let templateFn: Function = this.templateParser(content);
        let templateElements: HTMLElement[] = [];
        for (let item of templateFn({}, null, null, type, isStringTemplate)) {
            templateElements.push(item);
        }
        append([].slice.call(templateElements), appendElement);
    }

    protected renderPanels(cellElement: HTMLElement, panelModel: PanelModel, panelId: string, isStringTemplate: boolean): HTMLElement {
        addClass([cellElement], [panel, panelTransition]);
        this.panelContent = cellElement.querySelector('.e-panel-container') ?
            cellElement.querySelector('.e-panel-container') :
            this.createSubElement(panelModel.cssClass, cellElement.id + '_content', panelContainer);
        cellElement.appendChild(this.panelContent);
        if (!panelModel.enabled) { this.disablePanel(cellElement); }
        if (panelModel.header) {
            let headerTemplateElement: HTMLElement = cellElement.querySelector('.e-panel-header') ?
                cellElement.querySelector('.e-panel-header') : this.createSubElement('', cellElement.id + 'template', '');
            addClass([headerTemplateElement], [header]);
            if (!cellElement.querySelector('.e-panel-header')) {
                let id: string = this.element.id + 'HeaderTemplate' + panelId;
                this.renderTemplate(<string>panelModel.header, headerTemplateElement, id, isStringTemplate);
                this.panelContent.appendChild(headerTemplateElement);
                updateBlazorTemplate(id, 'HeaderTemplate', panelModel);
            }
        }
        if (panelModel.content) {
            this.panelBody = cellElement.querySelector('.e-panel-content') ? cellElement.querySelector('.e-panel-content') :
                this.createSubElement(panelModel.cssClass, cellElement.id + '_body', panelContent);
            let headerHeight: string = this.panelContent.querySelector('.e-panel-header') ?
                window.getComputedStyle(this.panelContent.querySelector('.e-panel-header')).height : '0px';
            let contentHeightValue: string = 'calc( 100% - ' + headerHeight + ')';
            setStyle(this.panelBody, { height: contentHeightValue });
            if (!cellElement.querySelector('.e-panel-content')) {
                let id: string = this.element.id + 'ContentTemplate' + panelId;
                this.renderTemplate(<string>panelModel.content, this.panelBody, id, isStringTemplate);
                this.panelContent.appendChild(this.panelBody);
                updateBlazorTemplate(id, 'ContentTemplate', panelModel);
            }

        }
        return cellElement;
    }

    protected disablePanel(panelElement: HTMLElement): void {
        addClass([panelElement], [disable]);
    }

    protected getInlinePanels(panelElement: HTMLElement): void {
        let model: PanelModel = {
            sizeX: panelElement.hasAttribute('data-sizex') ? parseInt(panelElement.getAttribute('data-sizex'), 10) : 1,
            sizeY: panelElement.hasAttribute('data-sizey') ? parseInt(panelElement.getAttribute('data-sizey'), 10) : 1,
            minSizeX: panelElement.hasAttribute('data-minsizex') ? parseInt(panelElement.getAttribute('data-minsizex'), 10) : 1,
            minSizeY: panelElement.hasAttribute('data-minsizey') ? parseInt(panelElement.getAttribute('data-minsizey'), 10) : 1,
            maxSizeX: panelElement.hasAttribute('data-maxsizex') ? parseInt(panelElement.getAttribute('data-maxsizex'), 10) : null,
            maxSizeY: panelElement.hasAttribute('data-maxsizey') ? parseInt(panelElement.getAttribute('data-maxsizey'), 10) : null,
            row: panelElement.hasAttribute('data-row') ? parseInt(panelElement.getAttribute('data-row'), 10) : 0,
            col: panelElement.hasAttribute('data-col') ? parseInt(panelElement.getAttribute('data-col'), 10) : 0,
            id: panelElement.getAttribute('id'),
            zIndex: panelElement.hasAttribute('data-zindex') ? parseInt(panelElement.getAttribute('data-zIndex'), 10) : 1000,
            header: panelElement.querySelector('.e-panel-header') && '.e-panel-header',
            content: panelElement.querySelector('.e-panel-content') && '.e-panel-content',
        };
        if (!model.id) {
            model.id = 'layout_' + this.panelID.toString();
            panelElement.setAttribute('id', model.id);
            this.panelID = this.panelID + 1;
        }
        if (isUndefined(model.enabled)) {
            model.enabled = true;
        }
        panelElement.style.zIndex = '' + model.zIndex;
        // tslint:disable-next-line
        let panelProp: Panel = new Panel((<any>this), 'panels', model);
        this.panels.push(panelProp);
    }
    private resizeEvents(): void {
        if (this.allowResizing) {
            for (let i: number = 0; i < this.element.querySelectorAll('.e-panel .e-panel-container .e-resize').length; i++) {
                let eventName: string = (Browser.info.name === 'msie') ? 'mousedown pointerdown' : 'mousedown';
                EventHandler.add(document.querySelectorAll('.e-resize')[i], eventName, this.downResizeHandler, this);
                if (Browser.info.name !== 'mise') {
                    EventHandler.add(document.querySelectorAll('.e-resize')[i], 'touchstart', this.touchDownResizeHandler, this);
                }
            }
        }
    }

    protected bindEvents(): void {
        window.addEventListener('resize', this.refresh.bind(this));
        this.resizeEvents();
    }
    protected downResizeHandler(e: MouseEvent): void {
        this.downHandler(e);
        this.lastMouseX = e.pageX;
        this.lastMouseY = e.pageY;
        let moveEventName: string = (Browser.info.name === 'msie') ? 'mousemove pointermove' : 'mousemove';
        let upEventName: string = (Browser.info.name === 'msie') ? 'mouseup pointerup' : 'mouseup';
        EventHandler.add(document, moveEventName, this.moveResizeHandler, this);
        if (!this.isMouseUpBound) {
            EventHandler.add(document, upEventName, this.upResizeHandler, this);
            this.isMouseUpBound = true;
        }
    };

    protected downHandler(e: MouseEvent | TouchEvent): void {
        this.resizeCalled = false;
        let el: HTMLElement = (<HTMLElement>closest(<HTMLElement>(<HTMLElement>(e.currentTarget)), '.e-panel'));
        let args: ResizeArgs = { event: e, element: el };
        this.trigger('resizeStart', args);
        this.downTarget = (<HTMLElement>e.currentTarget);
        this.shadowEle = document.createElement('div');
        this.shadowEle.classList.add('e-holder');
        addClass([this.element], [preventSelect]);
        this.element.appendChild(this.shadowEle);
        this.elementX = parseInt(el.style.left, 10);
        this.elementY = parseInt(el.style.top, 10);
        this.elementWidth = el.offsetWidth;
        this.elementHeight = el.offsetHeight;
        this.originalWidth = this.getCellInstance(el.id).sizeX;
        this.originalHeight = this.getCellInstance(el.id).sizeY;
        this.previousRow = this.getCellInstance(el.id).row;
    }

    protected touchDownResizeHandler(e: TouchEvent): void {
        this.downHandler(e);
        this.lastMouseX = e.changedTouches[0].pageX;
        this.lastMouseY = e.changedTouches[0].pageY;
        EventHandler.add(document, 'touchmove', this.touchMoveResizeHandler, this);
        if (!this.isMouseUpBound) {
            EventHandler.add(document, 'touchend', this.upResizeHandler, this);
            this.isMouseUpBound = true;
        }
    }

    private getCellSize(): number[] {
        return [parseInt(<string>(this.cellSize[0]), 10), parseInt(<string>this.cellSize[1], 10)];
    }

    protected updateMaxTopLeft(e: MouseEvent | TouchEvent): void {
        this.moveTarget = this.downTarget;
        let el: HTMLElement = (<HTMLElement>closest(<HTMLElement>(this.moveTarget), '.e-panel'));
        let args: ResizeArgs = { event: e, element: el };
        this.trigger('resize', args);
    }

    protected updateResizeElement(el: HTMLElement): void {
        this.maxLeft = this.element.offsetWidth - 1;
        this.maxTop = <number>this.cellSize[1] * this.maxRows - 1;
        removeClass([el], 'e-panel-transition');
        addClass([el], [dragging]);
        let handleArray: string[] = [east, west, north, south, southEast, northEast, northWest, southWest];
        for (let i: number = 0; i < (<HTMLElement>this.moveTarget).classList.length; i++) {
            if (handleArray.indexOf((<HTMLElement>this.moveTarget).classList[i]) !== -1) {
                this.handleClass = ((<HTMLElement>this.moveTarget).classList[i]);
            }
        }
    }

    protected moveResizeHandler(e: MouseEvent): void {
        this.updateMaxTopLeft(e);
        let el: HTMLElement = (<HTMLElement>closest(<HTMLElement>(this.moveTarget), '.e-panel'));
        if (this.lastMouseX === e.pageX || this.lastMouseY === e.pageY) {
            return;
        }
        this.updateResizeElement(el);
        let panelModel: PanelModel = this.getCellInstance(el.getAttribute('id'));
        this.mouseX = e.pageX;
        this.mouseY = e.pageY;
        let diffY: number = this.mouseY - this.lastMouseY + this.mOffY;
        let diffX: number = this.mouseX - this.lastMouseX + this.mOffX;
        this.mOffX = this.mOffY = 0;
        this.lastMouseY = this.mouseY;
        this.lastMouseX = this.mouseX;
        this.resizingPanel(el, panelModel, diffX, diffY);
    }

    protected touchMoveResizeHandler(e: TouchEvent): void {
        this.updateMaxTopLeft(e);
        let el: HTMLElement = (<HTMLElement>closest(<HTMLElement>(this.moveTarget), '.e-panel'));
        if (this.lastMouseX === e.changedTouches[0].pageX || this.lastMouseY === e.changedTouches[0].pageY) {
            return;
        }
        this.updateResizeElement(el);
        let panelModel: PanelModel = this.getCellInstance(el.getAttribute('id'));
        this.mouseX = e.changedTouches[0].pageX;
        this.mouseY = e.changedTouches[0].pageY;
        let diffX: number = this.mouseX - this.lastMouseX + this.mOffX;
        let diffY: number = this.mouseY - this.lastMouseY + this.mOffY;
        this.mOffX = this.mOffY = 0;
        this.lastMouseX = this.mouseX;
        this.lastMouseY = this.mouseY;
        this.resizingPanel(el, panelModel, diffX, diffY);
    }
    /* istanbul ignore next */
    protected resizingPanel(el: HTMLElement, panelModel: PanelModel, currentX: number, currentY: number): void {
        let oldSizeX: number = this.getCellInstance(el.id).sizeX;
        let oldSizeY: number = this.getCellInstance(el.id).sizeY;
        let dY: number = currentY;
        let dX: number = currentX;
        if (this.handleClass.indexOf('north') >= 0) {
            if (this.elementHeight - dY < this.getMinHeight(panelModel)) {
                currentY = this.elementHeight - this.getMinHeight(panelModel);
                this.mOffY = dY - currentY;
            } else if (panelModel.maxSizeY && this.elementHeight - dY > this.getMaxHeight(panelModel)) {
                currentY = this.elementHeight - this.getMaxHeight(panelModel);
                this.mOffY = dY - currentY;
            } else if (this.elementY + dY < this.minTop) {
                currentY = this.minTop - this.elementY;
                this.mOffY = dY - currentY;
            }
            this.elementY += currentY;
            this.elementHeight -= currentY;
        }
        if (this.handleClass.indexOf('south') >= 0) {
            if (this.elementHeight + dY < this.getMinHeight(panelModel)) {
                currentY = this.getMinHeight(panelModel) - this.elementHeight;
                this.mOffY = dY - currentY;
            } else if (panelModel.maxSizeY && this.elementHeight + dY > this.getMaxHeight(panelModel)) {
                currentY = this.getMaxHeight(panelModel) - this.elementHeight;
                this.mOffY = dY - currentY;
            } else if (this.elementY + this.elementHeight + dY > this.maxTop) {
                currentY = this.maxTop - this.elementY - this.elementHeight;
                this.mOffY = dY - currentY;
            }
            this.elementHeight += currentY;
        }
        if (this.handleClass.indexOf('west') >= 0) {
            if (this.elementWidth - dX < this.getMinWidth(panelModel)) {
                currentX = this.elementWidth - this.getMinWidth(panelModel);
                this.mOffX = dX - currentX;
            } else if (panelModel.maxSizeX && this.elementWidth - dX > this.getMaxWidth(panelModel)) {
                currentX = this.elementWidth - this.getMaxWidth(panelModel);
                this.mOffX = dX - currentX;
            } else if (this.elementX + dX < this.minLeft) {
                currentX = this.minLeft - this.elementX;
                this.mOffX = dX - currentX;
            }
            this.elementX += currentX;
            this.elementWidth -= currentX;
        }
        if (this.handleClass.indexOf('east') >= 0) {
            if (this.elementWidth + dX < this.getMinWidth(panelModel)) {
                currentX = this.getMinWidth(panelModel) - this.elementWidth;
                this.mOffX = dX - currentX;
            } else if (panelModel.maxSizeX && this.elementWidth + dX > this.getMaxWidth(panelModel)) {
                currentX = this.getMaxWidth(panelModel) - this.elementWidth;
                this.mOffX = dX - currentX;
            } else if (this.elementX + this.elementWidth + dX > this.maxLeft) {
                currentX = this.maxLeft - this.elementX - this.elementWidth;
                this.mOffX = dX - currentX;
            }
            this.elementWidth += currentX;
        }
        el.style.top = this.elementY + 'px';
        el.style.left = this.elementX + 'px';
        el.style.width = this.elementWidth + 'px';
        el.style.height = this.elementHeight + 'px';
        let item: PanelModel = this.getResizeRowColumn(panelModel, <HTMLElement>this.moveTarget);
        if (item.col + item.sizeX > this.columns) {
            this.panelPropertyChange(item, { sizeX: item.sizeX - 1 });
        }
        this.shadowEle.style.top = ((item.row * this.getCellSize()[1] + (item.row * this.cellSpacing[1]))) + 'px';
        this.shadowEle.style.left = ((item.col * this.getCellSize()[0]) + ((item.col) * this.cellSpacing[0])) + 'px';
        this.shadowEle.style.height = ((item.sizeY * (this.getCellSize()[1] + (this.cellSpacing[1])))) + 'px';
        this.shadowEle.style.width = ((item.sizeX * (this.getCellSize()[0] + (this.cellSpacing[0])))) + 'px';
        if (oldSizeX !== item.sizeX || oldSizeY !== item.sizeY) {
            oldSizeX = item.sizeX;
            oldSizeY = item.sizeY;
            let model: PanelModel = this.getCellInstance(el.id);
            let value: IAttributes = {
                attributes: {
                    row: model.row.toString(),
                    col: model.col.toString(),
                    sizeX: model.sizeX.toString(),
                    sizeY: model.sizeY.toString()
                }
            };
            this.setAttributes(value, el);
            this.mainElement = el;
            this.updatePanelLayout(el, this.getCellInstance(el.id));
            this.updateOldRowColumn();
            this.sortedPanel();
        }
    }

    protected upResizeHandler(e: MouseEvent | TouchEvent): void {
        if (isNullOrUndefined(this.downTarget)) {
            return;
        }
        this.upTarget = (<HTMLElement>this.downTarget);
        let el: HTMLElement = (<HTMLElement>closest(<HTMLElement>(this.upTarget), '.e-panel'));
        let args: ResizeArgs = { event: e, element: el };
        this.trigger('resizeStop', args);
        if (el) {
            addClass([el], 'e-panel-transition');
            let moveEventName: string = (Browser.info.name === 'msie') ? 'mousemove pointermove' : 'mousemove';
            let upEventName: string = (Browser.info.name === 'msie') ? 'mouseup pointerup' : 'mouseup';
            EventHandler.remove(document, moveEventName, this.moveResizeHandler);
            EventHandler.remove(document, upEventName, this.upResizeHandler);
            if (Browser.info.name !== 'mise') {
                EventHandler.remove(document, 'touchmove', this.touchMoveResizeHandler);
                EventHandler.remove(document, 'touchend', this.upResizeHandler);
            }
            this.isMouseUpBound = false;
            if (this.shadowEle) {
                detach(this.shadowEle);
            }
            this.shadowEle = null;
            let panelModel: PanelModel = this.getCellInstance(el.getAttribute('id'));
            this.setPanelPosition(el, panelModel.row, panelModel.col);
            this.setHeightAndWidth(el, panelModel);
        }
        this.resizeCalled = false;
        this.lastMouseX = this.lastMouseY = undefined;
        this.mOffX = this.mOffY = 0;
        this.mainElement = null;
        if (this.allowFloating) {
            this.moveItemsUpwards();
        }
        this.updatePanels();
        this.updateCloneArrayObject();
    }
    protected getResizeRowColumn(item: PanelModel, e: HTMLElement): PanelModel {
        let isChanged: boolean = false;
        let col: number = item.col;
        if (['e-west', 'e-south-west'].indexOf(this.handleClass) !== -1) {
            col = this.pixelsToColumns(this.elementX, false);
        }
        let row: number = item.row;
        if (['e-north'].indexOf(this.handleClass) !== -1) {
            row = this.pixelsToRows(this.elementY, false);
            if (this.previousRow !== row) {
                this.previousRow = row;
                isChanged = true;
            }
        }
        let sizeX: number = item.sizeX;
        if (['e-north', 'e-south'].indexOf(this.handleClass) === -1) {
            sizeX = this.pixelsToColumns(this.elementWidth - (sizeX) * this.cellSpacing[1], true);
        }
        let sizeY: number = item.sizeY;
        if (['e-east', 'e-west'].indexOf(this.handleClass) === -1) {
            if (this.handleClass === 'e-north' ? isChanged : true) {
                sizeY = this.pixelsToRows(this.elementHeight - (sizeY) * this.cellSpacing[0], true);
            }
        }
        if (item.col + item.sizeX > this.columns) {
            item.sizeX = item.sizeX - 1;
        }
        let canOccupy: boolean = row > -1 && col > -1 && sizeX + col <= this.maxCol() && sizeY + row <= this.maxRow();
        if (canOccupy && (this.collisions(row, col, sizeX, sizeY, this.getPanelBase(item.id)).length === 0)
            || this.allowPushing !== false) {
            this.panelPropertyChange(item, { row: row, col: col, sizeX: sizeX, sizeY: sizeY });
        }
        return item;

    }
    protected pixelsToColumns(pixels: number, isCeil: boolean): number {
        let curColWidth: number = <number>this.cellSize[0];
        if (isCeil) {
            return Math.ceil(pixels / curColWidth);
        } else {
            return Math.floor(pixels / curColWidth);
        }
    }
    protected pixelsToRows(pixels: number, isCeil: boolean): number {
        if (isCeil) {
            return Math.round(pixels / <number>this.cellSize[1]);
        } else {
            return Math.round(pixels / (<number>this.cellSize[1] + this.cellSpacing[0]));
        }
    }
    protected getMinWidth(item: PanelModel): number {
        return (item.minSizeX) * this.getCellSize()[0];
    };

    protected getMaxWidth(item: PanelModel): number {
        return (item.maxSizeX) * this.getCellSize()[0];
    };

    protected getMinHeight(item: PanelModel): number {
        return (item.minSizeY) * this.getCellSize()[1];
    };

    protected getMaxHeight(item: PanelModel): number {
        return (item.maxSizeY) * this.getCellSize()[1];
    };

    protected sortedPanel(): void {
        this.sortedArray = [];
        for (let i: number = 0, l: number = this.panelCollection.length; i < l; ++i) {
            this.sortItem(this.panelCollection[i]);
        }
    }

    protected moveItemsUpwards(): void {
        if (this.allowFloating === false) {
            return;
        }
        for (let rowIndex: number = 0, l: number = this.sortedArray.length; rowIndex < l; ++rowIndex) {
            let columns: HTMLElement[] = this.sortedArray[rowIndex];
            if (!columns) {
                continue;
            }
            for (let colIndex: number = 0, len: number = columns.length; colIndex < len; ++colIndex) {
                let item: HTMLElement = columns[colIndex];
                if (item) {
                    this.moveItemUpwards(item);
                }
            }
        }
        this.updateGridLines();
    };

    protected moveItemUpwards(item: HTMLElement): void {
        if (this.allowFloating === false || item === this.mainElement) {
            return;
        }
        let colIndex: number = this.getCellInstance(item.id).col;
        let sizeY: number = parseInt(item.getAttribute('data-sizeY'), 10);
        let sizeX: number = parseInt(item.getAttribute('data-sizeX'), 10);
        let availableRow: number = null;
        let availableColumn: number = null;
        let rowIndex: number = parseInt(item.getAttribute('data-row'), 10) - 1;
        while (rowIndex > -1) {
            let items: HTMLElement[] = this.collisions(rowIndex, colIndex, sizeX, sizeY, item);
            if (items.length !== 0) {
                break;
            }
            availableRow = rowIndex;
            availableColumn = colIndex;
            --rowIndex;
        }
        if (availableRow !== null) {
            this.sortItem(item, availableRow, availableColumn);
        }
    }

    private sortItem(item: HTMLElement, rowValue?: number, columnValue?: number, ignoreItems?: HTMLElement[] | HTMLElement): void {
        this.overlapElement = [];
        let column: number = parseInt((<HTMLElement>item).getAttribute('data-col'), 10);
        let row: number = parseInt((<HTMLElement>item).getAttribute('data-row'), 10);
        if (!this.sortedArray[row]) {
            this.sortedArray[row] = [];
        }
        this.sortedArray[row][column] = item;
        if (item !== undefined && rowValue !== undefined && columnValue !== undefined) {
            if (this.oldRowCol[item.id] !== undefined && this.oldRowCol[item.id].row !== null &&
                typeof this.oldRowCol[item.id].col !== 'undefined') {
                {
                    let oldRow: HTMLElement[] = this.sortedArray[this.oldRowCol[item.id].row];
                    if (this.oldRowCol[item.id] && oldRow[this.oldRowCol[item.id].col] === item) {
                        delete oldRow[this.oldRowCol[item.id].col];
                        this.updateOldRowColumn();
                        this.sortedPanel();
                    }
                }
            }
            this.oldRowCol[item.id].row = rowValue;
            this.oldRowCol[item.id].row = columnValue;
            if (!this.sortedArray[row]) {
                this.sortedArray[row] = [];
            }
            this.sortedArray[row][column] = item;
            if (this.allItems.indexOf(item) === -1) {
                this.allItems.push(item);
            }
            this.panelPropertyChange(this.getCellInstance(item.id), { row: rowValue, col: columnValue });
            let panelModel: PanelModel = this.getCellInstance(item.id);
            this.setAttributes({ value: { col: panelModel.col.toString(), row: panelModel.row.toString() } }, item);
            this.updateLayout(item, this.getCellInstance(item.id));
        }
    }

    protected updateLayout(element: HTMLElement, panelModel: PanelModel): void {
        this.setPanelPosition(element, panelModel.row, panelModel.col);
        this.setHeightAndWidth(element, panelModel);
        this.updateRowHeight();
        this.sortedPanel();
    };

    public refresh(): void {
        if (this.checkMediaQuery()) {
            this.checkMediaQuerySizing();
        } else {
            if (this.element.classList.contains(responsive)) {
                removeClass([this.element], [responsive]);
                for (let i: number = 0; i < this.element.querySelectorAll('.e-panel').length; i++) {
                    let ele: HTMLElement = <HTMLElement>this.element.querySelectorAll('.e-panel')[i];
                    let cellInstance: PanelModel = this.getCellInstance(ele.id);
                    let row: number = parseInt(ele.getAttribute('data-row'), 10);
                    let col: number = parseInt(ele.getAttribute('data-col'), 10);
                    this.panelPropertyChange(cellInstance, { row: row, col: col });
                    this.setHeightAndWidth(ele, this.getCellInstance(ele.id));
                    this.setPanelPosition(ele, row, col);
                    this.updateRowHeight();
                }
            }
            this.panelResponsiveUpdate();
            this.updateGridLines();
        }
        this.removeResizeClasses(this.panelCollection);
        this.setClasses(this.panelCollection);
        this.resizeEvents();
        this.checkDragging(this.dragCollection);
    }

    protected updateGridLines(): void {
        if (this.element.querySelector('.e-dashboard-gridline-table')) {
            if (this.table) {
                detach(this.table);
            }
            this.initGridLines();
        }
    }

    protected checkDragging(dragCollection: Draggable[]): void {
        if (this.checkMediaQuery() || !this.allowDragging) {
            for (let i: number = 0; i < dragCollection.length; i++) {
                dragCollection[i].destroy();
            }
        } else {
            for (let i: number = 0; i < dragCollection.length; i++) {
                dragCollection[i].destroy();
            }
            this.enableDraggingContent(this.panelCollection);
        }

    }

    protected sortPanels(): PanelModel[] {
        let model: PanelModel[] = [];
        for (let row: number = 0; row <= this.rows; row++) {
            for (let col: number = 0; col < this.columns; col++) {
                this.panels.filter((panel: PanelModel) => {
                    if (panel.row === row && panel.col === col) {
                        model.push(panel);
                    }
                });
            }
        }
        return model;
    }

    protected checkMediaQuerySizing(): void {
        addClass([this.element], [responsive]);
        let updatedPanel: PanelModel[] = this.sortPanels();
        this.updatedRows = updatedPanel.length;
        for (let i: number = 0; i < updatedPanel.length; i++) {
            let panelElement: HTMLElement = document.getElementById(updatedPanel[i].id);
            if (panelElement) {
                setStyle(<HTMLElement>panelElement, { 'width': '100%' });
                (<HTMLElement>panelElement).style.height = ' ' + (this.element.parentElement
                    && this.element.parentElement.offsetWidth / this.cellAspectRatio) + 'px';
                this.cellSize[1] = this.element.parentElement
                    && (this.element.parentElement.offsetWidth / this.cellAspectRatio);
                this.panelPropertyChange(updatedPanel[i], { row: i, col: 0 });
                this.setPanelPosition(<HTMLElement>panelElement, updatedPanel[i].row, updatedPanel[i].col);
                this.setClasses(this.panelCollection);
                this.checkDragging(this.dragCollection);
                this.removeResizeClasses(this.panelCollection);
            }
        }
        this.updateRowHeight();
    }

    protected panelResponsiveUpdate(): void {
        this.element.classList.add('e-responsive');
        this.calculateCellSize();
        for (let i: number = 0; i < this.element.querySelectorAll('.e-panel').length; i++) {
            let ele: Element = this.element.querySelectorAll('.e-panel')[i];
            let panelModel: PanelModel = this.getCellInstance(ele.id);
            this.setHeightAndWidth(<HTMLElement>ele, panelModel);
        }
        for (let i: number = 0; i < this.panels.length; i++) {
            this.setPanelPosition(document.getElementById(this.panels[i].id), this.panels[i].row, this.panels[i].col);
        }
        this.updateRowHeight();
    }

    protected updateRowHeight(): void {
        this.getRowColumn();
        this.setHeightWidth();
    }

    protected setHeightWidth(): void {
        let heightValue: string; let widthValue: string;
        if (this.checkMediaQuery()) {
            heightValue = ((this.maxRow()) *
                (this.element.parentElement && Math.floor((this.element.parentElement.offsetWidth)) / this.cellAspectRatio) +
                (this.maxRow() - 1) * this.cellSpacing[1]) + 'px';
        } else {
            heightValue = ((this.maxRow()) *
                (<number>this.cellSize[0] / this.cellAspectRatio) + (this.maxRow() - 1) * this.cellSpacing[1]) + 'px';
        }
        setStyle(this.element, { 'height': heightValue });
        widthValue = window.getComputedStyle(this.element).width;
        setStyle(this.element, { 'width': widthValue });
    }

    protected setHeightAndWidth(panelElement: HTMLElement, panelModel: PanelModel): void {
        setStyle(panelElement, { 'height': formatUnit(this.setXYDimensions(panelModel)[0]) });
        setStyle(panelElement, { 'width': formatUnit(this.setXYDimensions(panelModel)[1]) });
    }

    protected renderCell(panel: PanelModel, isStringTemplate: boolean): HTMLElement {
        this.dimensions = this.setXYDimensions(panel);
        if (isUndefined(panel.enabled)) {
            panel.enabled = true;
        }
        let cellElement: HTMLElement = this.createPanelElement(panel.cssClass, panel.id);
        cellElement.style.zIndex = '' + panel.zIndex;
        this.element.appendChild(cellElement);
        let dashBoardCell: HTMLElement = this.renderPanels(cellElement, panel, panel.id, isStringTemplate);
        this.panelCollection.push(dashBoardCell);
        this.setXYAttributes(cellElement, panel);
        this.setHeightAndWidth(cellElement, panel);
        return cellElement;
    }

    protected setPanelPosition(cellElement: HTMLElement, row: number, col: number): void {
        if (!cellElement) {
            return;
        }
        let heightValue: number | string = this.getCellSize()[1];
        let widthValue: number | string = this.getCellSize()[0];
        let left: number = col === 0 ? 0 : (((col) * (parseInt(widthValue.toString(), 10) + this.cellSpacing[0])));
        let top: number = row === 0 ? 0 : (((row) * (parseInt(heightValue.toString(), 10) + this.cellSpacing[1])));
        setStyle(cellElement, { 'left': left + 'px', 'top': top + 'px' });
    }

    protected getRowColumn(): void {
        this.rows = null;
        if (this.element.querySelectorAll('.e-panel').length > 0 && !this.updatedRows) {
            let panelElements: NodeList = this.element.querySelectorAll('.e-panel');
            for (let i: number = 0; i < panelElements.length; i++) {
                let panelElement: HTMLElement = <HTMLElement>panelElements[i];
                let rowValue: number = parseInt(panelElement.getAttribute('data-row'), 10);
                let xValue: number = parseInt(panelElement.getAttribute('data-sizeY'), 10);
                this.rows = Math.max(this.rows, (rowValue + xValue));
            }
        } else {
            if (this.updatedRows) {
                this.rows = this.updatedRows;
                this.updatedRows = null;
            }
            for (let i: number = 0; i < this.panels.length; i++) {
                this.rows = Math.max(this.rows, this.panels[i].row);
            }
        }
    }

    protected setMinMaxValues(panel: PanelModel): void {
        if (!panel.sizeX || panel.sizeX < panel.minSizeX) {
            this.panelPropertyChange(panel, { sizeX: panel.minSizeX });
        } else if ((panel.maxSizeX && panel.sizeX > panel.maxSizeX)) {
            this.panelPropertyChange(panel, { sizeX: panel.maxSizeX });
        } else if (panel.sizeX > this.columns) {
            this.panelPropertyChange(panel, { sizeX: this.columns });
        } else {
            this.panelPropertyChange(panel, { sizeX: panel.sizeX });
        }
        if (!panel.sizeY || panel.sizeY < panel.minSizeY) {
            this.panelPropertyChange(panel, { sizeY: panel.minSizeY });
        } else if (panel.maxSizeY && panel.sizeY > panel.maxSizeY) {
            this.panelPropertyChange(panel, { sizeY: panel.maxSizeY });
        } else {
            this.panelPropertyChange(panel, { sizeY: panel.sizeY });
        }
    }

    protected checkMinMaxValues(panel: PanelModel): void {
        if (panel.col + panel.sizeX > this.columns) {
            this.panelPropertyChange(panel, { sizeX: panel.sizeX + (this.columns - (panel.col + panel.sizeX)) });
        }
    }

    protected panelPropertyChange(panel: PanelModel, value: IChangePanel): void {
        // tslint:disable-next-line
        (panel as any).setProperties(value, true);
    }

    protected renderDashBoardCells(cells: PanelModel[]): void {
        if (this.element.querySelectorAll('.e-panel').length > 0 || this.panels.length > 0) {
            for (let j: number = 0; j < cells.length; j++) {
                this.gridPanelCollection.push(<HTMLElement>cells[j]);
                this.setMinMaxValues(cells[j]);
                if (this.maxColumnValue < cells[j].col || this.maxColumnValue < (cells[j].col + cells[j].sizeX)) {
                    this.panelPropertyChange(cells[j], { col: this.maxColumnValue - cells[j].sizeX });
                }
                let cell: HTMLElement = this.renderCell(cells[j], false);
                if (this.enableRtl) {
                    addClass([cell], 'e-rtl');
                }
                this.element.appendChild(cell);
                if (this.checkMediaQuery() && j === cells.length - 1) {
                    this.checkMediaQuerySizing();
                } else {
                    this.setPanelPosition(cell, cells[j].row, cells[j].col);
                    this.mainElement = cell;
                    this.updatePanelLayout(cell, cells[j]);
                    this.mainElement = null;
                }
            }
        }
        this.setClasses(this.panelCollection);
    }

    protected collisions(row: number, col: number, sizeX: number, sizeY: number, ignore: HTMLElement[] | HTMLElement): HTMLElement[] {
        let items: HTMLElement[] = [];
        if (!sizeX || !sizeY) {
            sizeX = sizeY = 1;
        }
        if (ignore && !(ignore instanceof Array)) {
            ignore = [ignore];
        }
        let item: PanelModel;
        for (let h: number = 0; h < sizeY; ++h) {
            for (let w: number = 0; w < sizeX; ++w) {
                item = this.getPanel(row + h, col + w, ignore);
                if (item && (!ignore || (<HTMLElement[]>ignore).indexOf(document.getElementById(item.id)) === -1) &&
                    (<HTMLElement[]>items).indexOf(document.getElementById(item.id)) === -1) {
                    items.push(document.getElementById(item.id));
                }
            }
        }
        return items;
    };

    protected rightWardsSpaceChecking(rowElements: HTMLElement[], col: number, ele: HTMLElement): number[] {
        let columns: number[] = [];
        let spacedColumns: number[] = [];
        rowElements.forEach((element: HTMLElement) => {
            let columnValue: number = parseInt(element.getAttribute('data-col'), 10);
            let sizeXValue: number = parseInt(element.getAttribute('data-sizeX'), 10);
            if (col < this.columns && columnValue >= col) {
                if (sizeXValue > 1) {
                    for (let i: number = columnValue; i < columnValue + sizeXValue; i++) {
                        columns.push(i);
                    }
                } else {
                    columns.push(columnValue);
                }
            }
        });
        if (columns.length > 0) {
            for (let i: number = col + 1; i <= this.columns - 1; i++) {
                if (columns.indexOf(i) === -1 && i !== col) {
                    if (spacedColumns.indexOf(i) === -1) {
                        spacedColumns.push(i);
                    }
                }
            }
        }
        let occupiedValues: number[] = this.getOccupiedColumns(ele, 'right');
        occupiedValues.forEach((colValue: number) => {
            if (colValue > col && spacedColumns.indexOf(colValue) !== -1) {
                spacedColumns.splice(spacedColumns.indexOf(colValue), 1);
            }
        });
        let eleOccupiedValues: number[] = this.getOccupiedColumns(this.checkingElement, 'left');
        eleOccupiedValues.forEach((col: number) => {
            if (col > parseInt(ele.getAttribute('data-col'), 10) && occupiedValues.indexOf(col) === -1 &&
                spacedColumns.indexOf(col) === -1) {
                spacedColumns.push(col);
            }
        });
        spacedColumns = spacedColumns.sort((next: number, previous: number) => { return next - previous; });
        return spacedColumns;
    }

    protected getOccupiedColumns(element: HTMLElement, type: string): number[] {
        let occupiedItems: number[] = [];
        let sizeX: number = parseInt(element.getAttribute('data-sizeX'), 10);
        let col: number = parseInt(element.getAttribute('data-col'), 10);
        for (let i: number = col; (i < col + sizeX && i <= this.columns); i++) {
            occupiedItems.push(i);
        }
        return occupiedItems;
    }

    protected leftWardsSpaceChecking(rowElements: HTMLElement[], col: number, ele: HTMLElement): number[] {
        let spacedColumns: number[] = [];
        let columns: number[] = [];
        rowElements.forEach((element: HTMLElement) => {
            let colValue: number = parseInt(element.getAttribute('data-col'), 10);
            let xValue: number = parseInt(element.getAttribute('data-sizeX'), 10);
            if (col <= this.columns && colValue <= col) {
                if (xValue > 1) {
                    for (let i: number = colValue; i < colValue + xValue; i++) {
                        columns.push(i);
                    }
                } else {
                    columns.push(colValue);
                }
            }
        });
        if (columns.length > 0) {
            for (let i: number = 0; i <= col; i++) {
                if (columns.indexOf(i) === -1 && i !== col) {
                    if (spacedColumns.indexOf(i) === -1) {
                        spacedColumns.push(i);
                    }
                }
            }
        }
        let occupiedValues: number[] = this.getOccupiedColumns(ele, 'left');
        occupiedValues.forEach((colValue: number) => {
            if (colValue < col && spacedColumns.indexOf(colValue) !== -1) {
                spacedColumns.splice(spacedColumns.indexOf(colValue), 1);
            }
        });
        let eleOccupiedValues: number[] = this.getOccupiedColumns(this.checkingElement, 'left');
        eleOccupiedValues.forEach((col: number) => {
            if (col < parseInt(ele.getAttribute('data-col'), 10) && occupiedValues.indexOf(col) === -1 &&
                spacedColumns.indexOf(col) === -1) {
                spacedColumns.push(col);
            }
        });
        spacedColumns = spacedColumns.sort((next: number, prev: number) => { return next - prev; });
        spacedColumns = spacedColumns.reverse();
        return spacedColumns;
    }

    protected adjustmentAvailable(row: number, col: number, sizeY: number, sizeX: number, ele: HTMLElement): boolean {
        this.leftAdjustable = undefined;
        this.rightAdjustable = undefined;
        let isAdjustable: boolean = false;
        let leftSpacing: number[];
        let rightSpacing: number[];
        let rowElement: HTMLElement[] = [];
        this.topAdjustable = undefined;
        let eleSizeX: number = parseInt(ele.getAttribute('data-sizeX'), 10);
        let eleCol: number = parseInt(ele.getAttribute('data-col'), 10);
        rowElement = this.getRowElements(this.collisions(row, 0, this.columns, sizeY, []));
        if (rowElement.indexOf(ele) === -1) {
            rowElement.push(ele);
        }
        leftSpacing = this.leftWardsSpaceChecking(rowElement, col, ele);
        if (leftSpacing.length > 0) {
            this.leftAdjustable = this.isLeftAdjustable(leftSpacing, ele, row, col, sizeX, sizeY);
            if (this.spacedColumnValue !== eleCol - this.getCellInstance(this.checkingElement.id).sizeX) {
                this.leftAdjustable = false;
            }
            if (this.leftAdjustable) {
                this.rightAdjustable = false;
            } else {
                this.leftAdjustable = false;
                rightSpacing = this.rightWardsSpaceChecking(rowElement, col, ele);
                this.rightAdjustable = rightSpacing.length > 0 ? this.isRightAdjustable(rightSpacing, ele, row, col, sizeX, sizeY) : false;
                if (this.spacedColumnValue !== eleSizeX + eleCol) {
                    this.rightAdjustable = false;
                }
                if (!this.rightAdjustable) {
                    this.rightAdjustable = false;
                }
            }
        } else {
            rightSpacing = this.rightWardsSpaceChecking(rowElement, col, ele);
            this.rightAdjustable = rightSpacing.length > 0 ? this.isRightAdjustable(rightSpacing, ele, row, col, sizeX, sizeY) : false;
            if (this.spacedColumnValue !== eleSizeX + eleCol) {
                this.rightAdjustable = false;
            }
            if (this.rightAdjustable) {
                this.leftAdjustable = false;
            }
        }
        if (!this.rightAdjustable && !this.leftAdjustable && row > 0) {
            let endRow: number = this.getCellInstance(ele.id).row;
            let topCheck: boolean = false;
            if (this.startRow !== endRow) {
                topCheck = true;
            }
            for (let rowValue: number = row; rowValue >= 0; rowValue--) {
                let element: HTMLElement = (this.getCellInstance(ele.id).sizeY > 1 && topCheck) ? this.checkingElement : ele;
                if ((rowValue !== endRow) && (sizeY > 1 ? rowValue === endRow - sizeY - 1 : rowValue === endRow - sizeY) &&
                    this.collisions(rowValue, col, sizeX, sizeY, element).length === 0) {
                    topCheck = false;
                    this.topAdjustable = true;
                    this.spacedRowValue = isNullOrUndefined(this.spacedRowValue) ? rowValue : this.spacedRowValue;
                    this.spacedColumnValue = col;
                }
            }
        }
        if (this.rightAdjustable || this.leftAdjustable || this.topAdjustable) {
            isAdjustable = true;
            if (isNullOrUndefined(this.spacedRowValue)) {
                this.spacedRowValue = row;
            }
        }
        return isAdjustable;
    }

    protected isXSpacingAvailable(spacing: number[], sizeX?: number): boolean {
        let isSpaceAvailable: boolean = false;
        let subSpacingColumns: number[] = [];
        for (let i: number = 0; i < spacing.length; i++) {
            if (spacing[i + 1] - spacing[i] === 1 || spacing[i + 1] - spacing[i] === -1) {
                subSpacingColumns.push(spacing[i]);
                if (sizeX === 2) {
                    subSpacingColumns.push(spacing[i + 1]);
                }
                if (i === spacing.length - 2) {
                    subSpacingColumns.push(spacing[i + 1]);
                    if (subSpacingColumns.length > sizeX) {
                        subSpacingColumns.splice(-1);
                    }
                }
                if (subSpacingColumns.length === sizeX) {
                    isSpaceAvailable = true;
                    this.spacedColumnValue = subSpacingColumns.sort((next: number, previous: number) => { return next - previous; })[0];
                    if (this.spacedColumnValue < 0) {
                        this.spacedColumnValue = 1;
                    }
                    return isSpaceAvailable;
                }
            } else {
                subSpacingColumns = [];
                continue;
            }
        }
        return isSpaceAvailable;
    }

    protected getRowElements(base: HTMLElement[]): HTMLElement[] {
        let rowElements: HTMLElement[] = [];
        for (let i: number = 0; i < base.length; i++) {
            rowElements.push(base[i]);
        }
        return rowElements;
    }
    protected isLeftAdjustable(spaces: number[], ele: HTMLElement, row: number, col: number, sizeX: number, sizeY: number): boolean {
        let isLeftAdjudtable: boolean;
        if (sizeX === 1 && sizeY === 1 && spaces.length > 0) {
            this.spacedColumnValue = spaces[0];
            isLeftAdjudtable = true;
        } else if (sizeX > 1 && sizeY === 1) {
            isLeftAdjudtable = this.isXSpacingAvailable(spaces, sizeX);
        } else if (sizeY > 1) {
            if (sizeX === 1) {
                let xAdjust: boolean;
                if (spaces.length >= 1) {
                    xAdjust = true;
                }
                if (xAdjust) {
                    for (let i: number = 0; i < spaces.length; i++) {
                        let collisionValue: HTMLElement[] = this.collisions(row, spaces[i], sizeX, sizeY, this.checkingElement);
                        if (collisionValue.length === 0) {
                            this.spacedColumnValue = spaces[i];
                            isLeftAdjudtable = true;
                            return isLeftAdjudtable;
                        } else {
                            isLeftAdjudtable = false;
                        }
                    }
                }
            } else {
                isLeftAdjudtable = this.replacable(spaces, sizeX, row, sizeY, ele);
            }
        }
        return isLeftAdjudtable;
    }

    protected isRightAdjustable(spacing: number[], ele: HTMLElement, row: number, col: number, sizeX: number, sizeY: number): boolean {
        let isRightAdjudtable: boolean;
        if (sizeX === 1 && sizeY === 1 && spacing.length > 0) {
            this.spacedColumnValue = spacing[0];
            isRightAdjudtable = true;
        } else if (sizeX > 1 && sizeY === 1) {
            isRightAdjudtable = this.isXSpacingAvailable(spacing, sizeX);
        } else if (sizeY > 1) {
            if (sizeX === 1) {
                let xAdjust: boolean;
                if (spacing.length >= 1) {
                    xAdjust = true;
                }
                if (xAdjust) {
                    for (let i: number = 0; i < spacing.length; i++) {
                        let collisionValue: HTMLElement[] = this.collisions(row, spacing[i], sizeX, sizeY, this.checkingElement);
                        for (let collision: number = 0; collision < collisionValue.length; collision++) {
                            if (parseInt(ele.getAttribute('data-col'), 10) !== spacing[i]) {
                                collisionValue.splice(collisionValue.indexOf(collisionValue[collision]), 1);
                            }
                        }
                        if (collisionValue.length === 0) {
                            isRightAdjudtable = true;
                            this.spacedColumnValue = spacing[i];
                            return isRightAdjudtable;
                        } else {
                            isRightAdjudtable = false;
                        }
                    }
                }
            } else {
                isRightAdjudtable = this.replacable(spacing, sizeX, row, sizeY, ele);
            }
        }
        return isRightAdjudtable;
    }
    protected replacable(spacing: number[], sizeX: number, row: number, sizeY: number, ele: HTMLElement): boolean {
        let isRightAdjudtable: boolean;
        let updatedCollision: HTMLElement[] = [];
        for (let j: number = 0; j < spacing.length; j++) {
            let xAdjust: boolean = this.isXSpacingAvailable(spacing, sizeX);
            if (xAdjust) {
                let exclusions: HTMLElement[] = [];
                exclusions.push(this.checkingElement);
                exclusions.push(ele);
                if (updatedCollision.length === 0) {
                    isRightAdjudtable = true;
                    this.spacedColumnValue = this.spacedColumnValue;
                    return isRightAdjudtable;
                } else {
                    isRightAdjudtable = false;
                }
            }
        }
        return isRightAdjudtable;
    }

    protected sortCollisionItems(collisionItems: HTMLElement[]): HTMLElement[] {
        let updatedCollision: HTMLElement[] = [];
        let rowElements: HTMLElement[];
        for (let row: number = this.rows - 1; row >= 0; row--) {
            rowElements = [];
            collisionItems.forEach((element: HTMLElement) => {
                if (element && element.getAttribute('data-row') === row.toString()) {
                    rowElements.push(element);
                }
            });
            for (let column: number = this.columns - 1; column >= 0; column--) {
                rowElements.forEach((item: HTMLElement) => {
                    if (item && item.getAttribute('data-col') === column.toString()) {
                        updatedCollision.push(item);
                    }
                });
            }
        }
        return updatedCollision;
    }

    protected updatedModels(collisionItems: HTMLElement[], panelModel: PanelModel, ele: HTMLElement): HTMLElement[] {
        if (!this.mainElement) {
            this.sortedPanel();
        }
        collisionItems.forEach((element: HTMLElement) => {
            this.checkingElement = element;
            let model: PanelModel = this.getCellInstance(element.id);
            let adjust: boolean = !this.adjustmentAvailable(model.row, model.col, model.sizeY, model.sizeX, ele);
            if (model.sizeX > 1 && adjust) {
                for (let rowValue: number = model.row; rowValue < panelModel.row + panelModel.sizeY; rowValue++) {
                    let collisions: HTMLElement[] = this.collisions(rowValue, model.col, model.sizeX, model.sizeY, element);
                    collisions.forEach((item: HTMLElement) => {
                        if (collisionItems.indexOf(item) >= 0) {
                            collisionItems.splice(collisionItems.indexOf(item), 1);
                        }
                    });
                }
            }
        });
        return collisionItems;
    }

    protected resetLayout(model: PanelModel, element: HTMLElement): HTMLElement[] {
        let collisions: HTMLElement[] = this.collisions(model.row, model.col, model.sizeX, model.sizeY, this.mainElement);
        if (!this.mainElement || this.addPanelCalled || this.resizeCalled || this.movePanelCalled) {
            return collisions;
        }
        if (this.mainElement && this.oldRowCol !== this.cloneObject) {
            for (let i: number = 0; i < this.panels.length; i++) {
                let element: HTMLElement = document.getElementById(this.panels[i].id);
                if (element === this.mainElement) {
                    continue;
                }
                let rowValue: number = this.cloneObject[element.id].row;
                let colValue: number = this.cloneObject[element.id].col;
                this.setPanelPosition(element, rowValue, colValue);
                this.panelPropertyChange(this.getCellInstance(element.id), { row: rowValue, col: colValue });
                this.setAttributes({ value: { col: colValue.toString(), row: rowValue.toString() } }, element);
                this.updateOldRowColumn();
            }
        }
        this.sortedArray = this.cloneArray;
        collisions = this.collisions(model.row, model.col, model.sizeX, model.sizeY, this.mainElement);
        this.sortedPanel();
        this.updateOldRowColumn();
        if (this.checkCollision && this.checkCollision.length > 0 && collisions.indexOf(this.checkCollision[0]) === -1 &&
            this.cloneObject[this.checkCollision[0].id].row === model.row) {
            collisions.push(this.checkCollision[0]);
        }
        return collisions;
    }

    protected swapAvailability(collisions: HTMLElement[], element: HTMLElement): boolean {
        let available: boolean = true;
        let eleModel: PanelModel = this.getCellInstance(element.id);
        for (let count: number = 0; count < collisions.length; count++) {
            let collideModel: PanelModel = this.getCellInstance(collisions[count].id);
            for (let i: number = 1; i < eleModel.sizeY; i++) {
                let excludeEle: HTMLElement[] = [];
                excludeEle.push(element);
                excludeEle.push(collisions[count]);
                let collision: HTMLElement[];
                collision = this.collisions(eleModel.row + i, collideModel.col, collideModel.sizeX, collideModel.sizeY, excludeEle);
                if (collision.length > 0) {
                    available = false;
                    return false;
                } else {
                    continue;
                }
            }
        }
        return available;
    }

    protected checkForSwapping(collisions: HTMLElement[], element: HTMLElement, panelModel: PanelModel): boolean {
        if (!this.mainElement || collisions.length === 0) {
            return false;
        }
        let direction: number;
        let eleSwapRow: number = parseInt(collisions[0].getAttribute('data-row'), 10);
        if (this.startRow < eleSwapRow) {
            direction = 1;
        } else if (this.startRow > eleSwapRow) {
            direction = 0;
        }
        if (!this.swapAvailability(collisions, element)) {
            return false;
        }
        let isSwappable: boolean = false;
        for (let count1: number = 0; count1 < collisions.length; count1++) {
            if (collisions.length >= 1 && this.cloneObject[this.mainElement.id].row === this.oldRowCol[this.mainElement.id].row) {
                return false;
            }
        }
        let updatedRow: number = direction === 0 ?
            this.getCellInstance(this.mainElement.id).row + this.getCellInstance(this.mainElement.id).sizeY
            : this.startRow;
        for (let count: number = 0; count < collisions.length; count++) {
            let collideInstance: PanelModel = this.getCellInstance(collisions[count].id);
            let elementinstance: PanelModel = this.getCellInstance(element.id);
            let ignore: HTMLElement[] = [];
            if (collideInstance.sizeY === 1) {
                ignore.push(collisions[count]);
            } else if (collideInstance.sizeY > 1) {
                if (direction === 1 && elementinstance.row === (this.cloneObject[collideInstance.id].row + collideInstance.sizeY - 1)) {
                    ignore.push(collisions[count]);
                } else if (direction === 0 && elementinstance.row === (this.cloneObject[collideInstance.id].row)) {
                    ignore.push(collisions[count]);
                } else {
                    return false;
                }
            }
            if (collideInstance.sizeY <= elementinstance.sizeY) {
                ignore.push(collisions[count]);
            }
            let swapCollision: HTMLElement[];
            swapCollision = this.collisions(updatedRow, collideInstance.col, collideInstance.sizeX, collideInstance.sizeY, ignore);
            if (swapCollision.length > 0) {
                isSwappable = false;
                return isSwappable;
            } else {
                if (count === collisions.length - 1) {
                    isSwappable = true;
                }
                continue;
            }
        }
        return isSwappable;
    }

    protected swapItems(collisions: HTMLElement[], element: HTMLElement, panelModel: PanelModel): void {
        let direction: number;
        let swappedElements: HTMLElement[] = [];
        swappedElements.push(element);
        let eleSwapRow: number = parseInt(collisions[0].getAttribute('data-row'), 10);
        if (this.startRow < eleSwapRow) {
            direction = 1;
        } else if (this.startRow > eleSwapRow) {
            direction = 0;
        }
        let collisionItemsRow: number = direction === 0 ? eleSwapRow + panelModel.sizeY : this.startRow;
        this.panelPropertyChange(panelModel, { row: direction === 0 ? eleSwapRow : collisionItemsRow + 1 });
        for (let count: number = 0; count < collisions.length; count++) {
            swappedElements.push(collisions[count]);
            this.setPanelPosition(collisions[count], collisionItemsRow, (this.getCellInstance(collisions[count].id)).col);
            this.panelPropertyChange(this.getCellInstance(collisions[count].id), { row: collisionItemsRow });
            collisions[count].setAttribute('data-row', collisionItemsRow.toString());
        }
        element.setAttribute('data-row', panelModel.row.toString());
        this.setPanelPosition(this.shadowEle, panelModel.row, panelModel.col);
        for (let i: number = 0; i < this.panels.length; i++) {
            this.oldRowCol[this.panels[i].id] = { row: this.panels[i].row, col: this.panels[i].col };
        }
        this.startRow = panelModel.row;
        this.updateOldRowColumn();
        swappedElements.forEach((item: HTMLElement) => {
            this.cloneObject[item.id] = this.oldRowCol[item.id];
            let itemModel: PanelModel = this.getCellInstance(item.id);
            for (let i: number = 0; i < this.sortedArray.length; i++) {
                if (!this.sortedArray[i]) {
                    continue;
                }
                for (let j: number = 0; j < this.sortedArray[i].length; j++) {
                    if (this.sortedArray[i][j] === item) {
                        this.sortedArray[i][j] = undefined;
                    }
                }
            }
            if (!this.sortedArray[itemModel.row]) {
                this.sortedArray[itemModel.row] = [];
            }
            this.sortedArray[itemModel.row][itemModel.col] = item;
            this.cloneArray = this.sortedArray;
        });
    }

    protected updatePanelLayout(element: HTMLElement, panelModel: PanelModel): void {
        this.collisionChecker = {};
        let initialModel: HTMLElement[] = [];
        let checkForAdjustment: boolean;
        let collisionModels: HTMLElement[] = [];
        let swappingAvailable: boolean;
        if (this.mainElement && this.isRenderComplete) {
            initialModel = this.resetLayout(panelModel, element);
        } else {
            initialModel = this.collisions(panelModel.row, panelModel.col, panelModel.sizeX, panelModel.sizeY, element);
        }
        if (initialModel.length > 0) {
            initialModel = this.sortCollisionItems(initialModel);
            initialModel = this.updatedModels(initialModel, panelModel, element);
            swappingAvailable = !isNullOrUndefined(this.startRow) ? this.checkForSwapping(initialModel, element, panelModel) : false;
            if (swappingAvailable) {
                this.swapItems(initialModel, element, panelModel);
            } else {
                for (let i: number = 0; i < initialModel.length; i++) {
                    let model: PanelModel = this.getCellInstance(initialModel[i].id);
                    this.checkingElement = initialModel[i];
                    this.spacedRowValue = null;
                    this.spacedColumnValue = null;
                    checkForAdjustment = this.adjustmentAvailable(model.row, model.col, model.sizeY, model.sizeX, element);
                    if (checkForAdjustment && !isNullOrUndefined(this.spacedColumnValue)) {
                        this.setPanelPosition(initialModel[i], this.spacedRowValue, this.spacedColumnValue);
                        this.oldRowCol[(initialModel[i].id)] = { row: this.spacedRowValue, col: this.spacedColumnValue };
                        let value: IAttributes = {
                            attributes: {
                                row: this.spacedRowValue.toString(),
                                col: this.spacedColumnValue.toString(),
                            }
                        };
                        this.setAttributes(value, initialModel[i]);
                        this.panelPropertyChange(model, { col: this.spacedColumnValue, row: this.spacedRowValue });
                        this.spacedRowValue = null;
                        if (i < initialModel.length) {
                            continue;
                        }
                    } else {
                        collisionModels.push(initialModel[i]);
                    }
                }
            }
        }
        if (collisionModels.length > 0) {
            let proxy: DashboardLayout = this;
            collisionModels.forEach((item1: HTMLElement) => {
                if (proxy.overlapElement.indexOf(item1) === -1) {
                    proxy.overlapElement.push(item1);
                }
            });
            if (this.overlapElement && this.overlapElement.indexOf(element) !== -1) {
                this.overlapElement.splice(this.overlapElement.indexOf(element), 1);
            }
            if (collisionModels.length > 0) {
                this.updateRowColumn(panelModel.row, this.overlapElement, element);
                this.checkForCompletePushing();
            }
        }
        if (!this.isSubValue) {
            this.sortedPanel();
        }
        this.updateRowHeight();
        this.updateGridLines();
    }

    protected checkForCompletePushing(): void {
        for (let i: number = 0; i < this.panels.length; i++) {
            if (this.collisionChecker[this.panels[i].id] && this.collisionChecker[this.panels[i].id] !== null) {
                this.overlapElement = [this.collisionChecker[this.panels[i].id].ele];
                let key: string = this.panels[i].id;
                this.updateRowColumn(this.collisionChecker[key].row, this.overlapElement, this.collisionChecker[key].srcEle);
            }
        }
    }

    protected updateCollisionChecked(item: HTMLElement): void {
        for (let count: number = 0; count < Object.keys(this.collisionChecker).length; count++) {
            this.collisionChecker[item.id] = null;
        }
    }
    protected updateRowColumn(row: number, ele: HTMLElement[], srcEle: HTMLElement): void {
        if (!srcEle) {
            return;
        }
        let eleSizeY: number = parseInt(srcEle.getAttribute('data-sizeY'), 10);
        let eleRow: number = parseInt(srcEle.getAttribute('data-row'), 10);
        this.overlapElementClone = this.overlapElement && !this.shouldRestrict ? this.overlapElement : this.overlapElement;
        for (let i: number = 0; i < this.overlapElementClone.length; i++) {
            if (this.overlapElementClone.length === 0) {
                return;
            }
            for (let i: number = 0; i < this.overlapElementClone.length; i++) {
                this.collisionChecker[this.overlapElementClone[i].id] = {
                    ele: this.overlapElementClone[i],
                    row: row,
                    srcEle: srcEle
                };
            }
            let updatedRow: number = eleRow + eleSizeY;
            let collisionY: number = parseInt(this.overlapElementClone[i].getAttribute('data-sizeY'), 10);
            let collisionCol: number = parseInt(this.overlapElementClone[i].getAttribute('data-col'), 10);
            let collisionX: number = parseInt(this.overlapElementClone[i].getAttribute('data-sizeX'), 10);
            let colValue: number;
            let collisionModels: HTMLElement[];
            if (this.overlapSubElementClone.indexOf(srcEle) === - 1) {
                this.overlapSubElementClone.push(srcEle);
            }
            if (this.overlapSubElementClone.indexOf(this.overlapElementClone[i]) === - 1) {
                this.overlapSubElementClone.push(this.overlapElementClone[i]);
            }
            if (collisionY > 1 || collisionX > 1) {
                let overlapElementModel: PanelModel = this.getCellInstance(this.overlapElementClone[i].id);
                colValue = overlapElementModel.col;
                let ele: HTMLElement = document.getElementById(overlapElementModel.id);
                for (let k: number = overlapElementModel.row; k < eleRow + eleSizeY; k++) {
                    this.isSubValue = true;
                    this.panelPropertyChange(overlapElementModel, { row: overlapElementModel.row + 1 });
                    ele.setAttribute('data-row', overlapElementModel.row.toString());
                    this.setPanelPosition(ele, overlapElementModel.row, colValue);
                    this.updateCollisionChecked(ele);
                    this.oldRowCol[(ele.id)] = { row: overlapElementModel.row, col: colValue };
                    let panelModel: PanelModel = this.getCellInstance(ele.id);
                    this.panelPropertyChange(panelModel, { col: colValue, row: overlapElementModel.row });
                    let eleRow: number = parseInt(ele.getAttribute('data-row'), 10);
                    let eleCol: number = parseInt(ele.getAttribute('data-col'), 10);
                    let sizeX: number = parseInt(ele.getAttribute('data-sizeX'), 10);
                    let sizeY: number = parseInt(ele.getAttribute('data-sizeY'), 10);
                    let excludeElements: HTMLElement[] = [];
                    excludeElements.push(ele);
                    excludeElements.push(srcEle);
                    collisionModels = this.collisions(eleRow, eleCol, sizeX, sizeY, excludeElements);
                    if (this.mainElement && collisionModels.indexOf(this.mainElement) !== -1) {
                        collisionModels.splice(collisionModels.indexOf(this.mainElement), 1);
                    }
                    this.collisionPanel(collisionModels, eleCol, eleRow, ele);
                }
                this.isSubValue = false;
            } else {
                if (this.addPanelCalled) {
                    this.addPanelCalled = false;
                }
                this.overlapElementClone[i].setAttribute('data-row', updatedRow.toString());
                let excludeEle: HTMLElement[] = [];
                excludeEle.push(this.overlapElementClone[i]);
                excludeEle.push(srcEle);
                collisionModels = this.collisions(updatedRow, collisionCol, collisionX, collisionY, excludeEle);
                if (this.mainElement && collisionModels.indexOf(this.mainElement) !== -1) {
                    collisionModels.splice(collisionModels.indexOf(this.mainElement), 1);
                }
                colValue = parseInt(this.overlapElementClone[i].getAttribute('data-col'), 10);
                this.setPanelPosition(this.overlapElementClone[i], updatedRow, colValue);
                this.updateCollisionChecked(this.overlapElementClone[i]);
                this.oldRowCol[(this.overlapElementClone[i].id)] = { row: updatedRow, col: colValue };
                let panelModel: PanelModel = this.getCellInstance(this.overlapElementClone[i].id);
                this.panelPropertyChange(panelModel, { col: colValue, row: updatedRow });
                this.collisionPanel(collisionModels, colValue, updatedRow, this.overlapElementClone[i]);
            }
        }
    }

    protected collisionPanel(collisionModels: HTMLElement[], colValue: number, updatedRow: number, clone: HTMLElement): void {
        let panelModel: PanelModel = this.getCellInstance(clone.id);
        this.panelPropertyChange(panelModel, { row: updatedRow, col: colValue });
        if (collisionModels.length > 0) {
            let proxy: DashboardLayout = this;
            this.overlapElement = [];
            this.shouldRestrict = true;
            collisionModels.forEach((item1: HTMLElement) => {
                proxy.overlapElement.push(item1);
            });
            let overlapElementRow1: number = parseInt(clone.getAttribute('data-row'), 10);
            for (let m: number = 0; m < this.overlapElement.length; m++) {
                this.updateRowColumn(overlapElementRow1, this.overlapElement, clone);
            }
            this.shouldRestrict = false;
        } else {
            if (!this.addPanelCalled) {
                this.sortedPanel();
            }
            if (this.overlapSubElementClone.length > 0) {
                for (let p: number = 0; p < this.overlapSubElementClone.length; p++) {
                    let rowVal: number = parseInt(this.overlapSubElementClone[p].getAttribute('data-row'), 10);
                    let colValue: number = parseInt(this.overlapSubElementClone[p].getAttribute('data-col'), 10);
                    let sizeX: number = parseInt(this.overlapSubElementClone[p].getAttribute('data-sizeX'), 10);
                    let sizeY: number = parseInt(this.overlapSubElementClone[p].getAttribute('data-sizeY'), 10);
                    let collisionModels1: HTMLElement[];
                    collisionModels1 = this.collisions(rowVal, colValue, sizeX, sizeY, this.overlapSubElementClone);
                    if (this.mainElement && collisionModels1.indexOf(this.mainElement) !== -1) {
                        collisionModels1.splice(collisionModels1.indexOf(this.mainElement), 1);
                    }
                    let proxy: DashboardLayout = this;
                    collisionModels1.forEach((item1: HTMLElement) => {
                        proxy.overlapElement.push(item1);
                    });
                    if (collisionModels1.length > 0) {
                        this.updateRowColumn(rowVal, this.overlapElement, this.overlapSubElementClone[p]);
                    }
                }
            }
            this.overlapSubElementClone = [];
        }
    }

    protected removeResizeClasses(panelElements: HTMLElement[]): void {
        for (let i: number = 0; i < panelElements.length; i++) {
            let element: HTMLElement = panelElements[i];
            let resizerElements: NodeList = element.querySelectorAll('.e-resize');
            for (let i: number = 0; i < resizerElements.length; i++) {
                detach(resizerElements[i]);
            }
        }
    }

    protected setClasses(panelCollection: HTMLElement[]): void {
        for (let i: number = 0; i < panelCollection.length; i++) {
            let element: HTMLElement = panelCollection[i];
            let containerEle: HTMLElement = panelCollection[i].querySelector('.e-panel-container');
            if (this.allowDragging) {
                if (this.draggableHandle && element.querySelectorAll(this.draggableHandle)[0]) {
                    addClass([element.querySelectorAll(this.draggableHandle)[0]], [draggable]);
                }
            }
            if (this.allowResizing &&
                this.mediaQuery ? !(this.checkMediaQuery()) : false) {
                this.setResizingClass(element, containerEle);
            }
        }

    }
    protected setResizingClass(ele?: HTMLElement, container?: HTMLElement): void {
        this.availableClasses = this.resizableHandles;
        for (let j: number = 0; j < this.availableClasses.length; j++) {
            let spanEle: HTMLElement = this.createElement('span');
            let addClassValue: string;
            container.appendChild(spanEle);
            if (this.availableClasses[j] === 'e-east' || this.availableClasses[j] === 'e-west' ||
                this.availableClasses[j] === 'e-north' || this.availableClasses[j] === 'e-south') {
                addClassValue = single;
            } else {
                addClassValue = double;
            }
            addClass([spanEle], [addClassValue, this.availableClasses[j], resize]);
        }
    }
    protected setXYAttributes(element: HTMLElement, panelModel: PanelModel): void {
        let value: IAttributes = {
            value: {
                sizeX: panelModel.sizeX.toString(),
                sizeY: panelModel.sizeY.toString(),
                minSizeX: panelModel.minSizeX.toString(),
                minSizeY: panelModel.minSizeY.toString(),
                maxSizeX: !isNullOrUndefined(panelModel.maxSizeX) ? panelModel.maxSizeX.toString() : undefined,
                maxSizeY: !isNullOrUndefined(panelModel.maxSizeY) ? panelModel.maxSizeY.toString() : undefined,
                row: panelModel.row.toString(),
                col: panelModel.col.toString(),
            }
        };
        this.setAttributes(value, element);
    }

    protected setXYDimensions(panelModel: PanelModel): (string | number)[] {
        let cellHeight: number | string = this.getCellSize()[1];
        let cellWidth: number | string = this.getCellSize()[0];
        let widthValue: number | string; let heigthValue: number | string;
        if (panelModel && typeof (cellWidth) === 'number' && typeof (panelModel.sizeX) === 'number' && panelModel.sizeX > 1) {
            widthValue = (panelModel.sizeX * cellWidth) + (panelModel.sizeX - 1) * this.cellSpacing[0];
        } else {
            widthValue = cellWidth;
        }
        if (panelModel && typeof (cellHeight) === 'number' && panelModel.sizeY > 1 && typeof (panelModel.sizeY) === 'number') {
            heigthValue = (panelModel.sizeY * cellHeight) + (panelModel.sizeY - 1) * this.cellSpacing[1];
        } else {
            heigthValue = formatUnit(cellHeight);
        }
        return [heigthValue, widthValue];
    }

    protected getRowColumnDragValues(args: DragEventArgs): number[] {
        let value: number[] = [];
        let elementTop: number = parseInt(args.element.style.top, 10);
        let elementLeft: number = parseInt(args.element.style.left, 10);
        let row: number = Math.round(elementTop / (this.getCellSize()[1] + this.cellSpacing[1]));
        let col: number = Math.round(elementLeft / (this.getCellSize()[0] + + this.cellSpacing[0]));
        value = [row, col];
        return value;
    }
    protected enableDraggingContent(collections: HTMLElement[]): void {
        for (let i: number = 0; i < collections.length; i++) {
            let cellElement: HTMLElement = collections[i];
            {
                this.dragobj = new Draggable(cellElement, {
                    preventDefault: false,
                    clone: false,
                    dragArea: this.element,
                    handle: this.draggableHandle ? this.draggableHandle : '.e-panel',
                    abort: '.e-resize',
                    dragStart: this.onDraggingStart.bind(this),
                    dragStop: (args: DragEventArgs) => {
                        let model: PanelModel = this.getCellInstance(this.mainElement.id);
                        if (this.allowPushing &&
                            this.collisions(model.row, model.col, model.sizeX, model.sizeY, this.mainElement).length > 0) {
                            this.setHolderPosition(args);
                            this.setPanelPosition(this.mainElement, model.row, model.col);
                            this.updatePanelLayout(this.mainElement, model);
                        } else {
                            this.setPanelPosition(this.mainElement, model.row, model.col);
                        }
                        let changedPanels: PanelModel[] = [];
                        this.mainElement = null;
                        let item: PanelModel = this.getPanelBase(args);
                        if (this.shadowEle) {
                            detach(this.shadowEle);
                        }
                        removeClass([this.element], [preventSelect]);
                        removeClass([args.element], [dragging]);
                        this.shadowEle = null;
                        args.element.classList.remove('e-dragging');
                        let row: number = this.getRowColumnDragValues(args)[0];
                        let col: number = this.getRowColumnDragValues(args)[1];
                        let panelModel: PanelModel = this.getCellInstance(args.element.id);
                        if (this.allowPushing &&
                            this.collisions(row, col, panelModel.sizeX, panelModel.sizeY, document.getElementById(item.id)).length === 0) {
                            this.panelPropertyChange(this.getCellInstance(args.element.id), { row: row, col: col });
                            this.oldRowCol[args.element.id].row = row;
                            this.oldRowCol[args.element.id].col = col;
                            this.setAttributes({ value: { col: col.toString(), row: row.toString() } }, args.element);
                            this.sortedPanel();
                        } else {
                            this.panelPropertyChange(this.getCellInstance(args.element.id), {
                                row: this.oldRowCol[args.element.id].row,
                                col: this.oldRowCol[args.element.id].col
                            });
                            args.element.setAttribute('data-col', this.getCellInstance(args.element.id).col.toString());
                            args.element.setAttribute('data-row', this.getCellInstance(args.element.id).row.toString());
                            this.sortedPanel();
                        }
                        let panelInstance: PanelModel = this.getCellInstance(args.element.id);
                        this.setPanelPosition(args.element, panelInstance.row, panelInstance.col);
                        this.updatePanels();
                        this.updateCloneArrayObject();
                        for (let i: number = 0; i < this.panels.length; i++) {
                            if (this.panels[i].row !== this.panelsInitialModel[i].row ||
                                this.panels[i].col !== this.panelsInitialModel[i].col) {
                                changedPanels.push(this.panels[i]);
                            }
                        }
                        if (changedPanels.length > 0) {
                            let changedArgs: ChangeEventArgs = { changedPanels: changedPanels };
                            this.trigger('change', changedArgs);
                        }
                        this.dragStopEventArgs = { event: args.event, element: args.element };
                        this.trigger('dragStop', args);
                        this.resizeEvents();
                    },
                    drag: (args: DragEventArgs) => {
                        this.draggedEventArgs = {
                            event: args.event,
                            element: args.element,
                            target: <HTMLElement>closest((args.target), '.e-panel')
                        };
                        this.trigger('drag', this.draggedEventArgs);
                        this.onDragStart(args);
                    }
                });
                if (this.dragCollection.indexOf(this.dragobj) === -1) {
                    this.dragCollection.push(this.dragobj);
                }
            }
        }
    };

    protected updatePanels(): void {
        this.moveItemsUpwards();
        this.updateOldRowColumn();
        this.sortedPanel();
    }

    private onDraggingStart(args: DragEventArgs): void {
        this.dragStartArgs = { event: args.event, element: args.element, cancel: false };
        this.trigger('dragStart', this.dragStartArgs);
        this.panelsInitialModel = this.cloneModels(this.panels);
        this.mainElement = args.element;
        this.cloneObject = JSON.parse(JSON.stringify(this.cloneObject));
        let eleRowValue: number = this.startRow = parseInt(args.element.getAttribute('data-row'), 10);
        this.startCol = parseInt(args.element.getAttribute('data-col'), 10);
        let eleSizeY: number = parseInt(args.element.getAttribute('data-sizeY'), 10);
        if (eleRowValue + eleSizeY === this.rows) {
            this.rows = this.rows + eleSizeY;
            this.setHeightWidth();
            // tslint:disable-next-line
            (<any>this.dragobj).setDragArea();
        }
        this.shadowEle = document.createElement('div');
        this.shadowEle.classList.add('e-holder');
        this.shadowEle.classList.add('e-holder-transition');
        setStyle(this.shadowEle, { 'position': 'absolute' });
        addClass([this.element], [preventSelect]);
        addClass([args.element], [dragging]);
        this.element.appendChild(this.shadowEle);
        this.shadowEle = document.querySelector('.e-holder');
        this.shadowEle.style.height = (this.getCellInstance(args.element.id).sizeY * <number>this.cellSize[1]) + 'px';
        this.shadowEle.style.width = (this.getCellInstance(args.element.id).sizeX * <number>this.cellSize[0]) + 'px';
        let panelInstance: PanelModel = this.getCellInstance(args.element.id);
        this.setPanelPosition(this.shadowEle, panelInstance.row, panelInstance.col);
    };
    // tslint:disable-next-line
    private cloneModels(source?: any, target?: any): PanelModel[] {
        if (target === undefined) {
            target = [];
        }
        for (let i: number = 0; i < source.length; i++) {
            // tslint:disable-next-line
            if (!target[i]) {
                target[i] = {};
            }
            // tslint:disable-next-line
            for (let k in source[i]) {
                target[i][k] = source[i][k];
            }
        }
        return target;
    };

    private onDragStart(args: DragEventArgs): void {
        let endCol: number;
        let endRow: number;
        let dragCol: number;
        let col: number = dragCol = this.getRowColumnDragValues(args)[1];
        let row: number = this.getRowColumnDragValues(args)[0];
        this.panelPropertyChange(this.getCellInstance(args.element.id), { row: row, col: col });
        let panelModel: PanelModel = this.getCellInstance(args.element.id);
        if (this.allowPushing) {
            this.setAttributes({ value: { col: col.toString(), row: row.toString() } }, args.element);
            this.panelPropertyChange(this.getCellInstance(args.element.id), { row: row, col: col });
            endCol = this.oldRowCol[(args.element.id)].col;
            endRow = this.oldRowCol[(args.element.id)].row;
            this.oldRowCol[(args.element.id)] = { row: row, col: col };
            this.updateOldRowColumn();
            if (this.startCol !== endCol || this.startRow !== endRow) {
                this.setHolderPosition(args);
                if (this.startCol !== endCol) {
                    this.startRow = endRow;
                }
                if (this.startRow !== endRow) {
                    this.startCol = endCol;
                }
                if (this.allowPushing) {
                    this.mainElement = args.element;
                    let model: PanelModel = panelModel;
                    this.checkCollision = this.collisions(model.row, model.col, model.sizeX, model.sizeY, args.element);
                    if (panelModel.col >= this.checkColumnValue) {
                        this.checkCollision = [];
                    }
                    this.updatePanelLayout(args.element, panelModel);
                    this.moveItemsUpwards();
                }
            }
        }
        if (this.allowPushing !== false) {
            this.panelPropertyChange(this.getCellInstance(args.element.id), { row: row, col: col });
        }
        if (this.oldRowCol[args.element.id].row !== row || this.oldRowCol[args.element.id].col !== col) {
            this.panelPropertyChange(this.getCellInstance(args.element.id), { row: row, col: col });
            this.setAttributes({ value: { col: col.toString(), row: row.toString() } }, args.element);
        }
        if (this.startCol !== dragCol) {
            this.startCol = endCol;
            this.moveItemsUpwards();
        }
        if (!this.allowPushing) {
            this.setHolderPosition(args);
        }
        this.removeResizeClasses(this.panelCollection);
        this.setClasses(this.panelCollection);
        if (this.allowPushing === false) {
            return;
        }
    }

    protected getPanelBase(args: HTMLElement | DragEventArgs | String): HTMLElement {
        let item: HTMLElement;
        for (let i: number = 0; i < this.panelCollection.length; i++) {
            if (this.panelCollection[i].id === (((<DragEventArgs>args).element
                && (<DragEventArgs>args).element.id) || <string>args)) {
                item = this.panelCollection[i];
            }
        }
        return item;
    }

    protected getPanel(row: number, column: number, excludeItems: HTMLElement[] | HTMLElement): PanelModel {
        if (excludeItems && !(excludeItems instanceof Array)) {
            excludeItems = [excludeItems];
        }
        let sizeY: number = 1;
        while (row > -1) {
            let sizeX: number = 1;
            let col: number = column;
            while (col > -1) {
                let items: HTMLElement[] = this.sortedArray[row];
                if (items) {
                    let item: HTMLElement = items[col];
                    if (item && (!excludeItems ||
                        (<HTMLElement[]>excludeItems).indexOf(item) === -1) && parseInt(item.getAttribute('data-sizeX'), 10) >= sizeX
                        && parseInt(item.getAttribute('data-sizeY'), 10) >= sizeY) {
                        return item;
                    }
                }
                ++sizeX;
                --col;
            }
            --row;
            ++sizeY;
        }
        return null;
    };

    protected setHolderPosition(args: DragEventArgs): void {
        let cellSizeOne: number;
        let cellSizeZero: number;
        let sizeY: number = parseInt(args.element.getAttribute('data-sizeY'), 10);
        let col: number = parseInt(args.element.getAttribute('data-col'), 10);
        let row: number = parseInt(args.element.getAttribute('data-row'), 10);
        let sizeX: number = parseInt(args.element.getAttribute('data-sizeX'), 10);
        let widthValue: number = this.getCellSize()[0];
        let heightValue: number = this.getCellSize()[1];
        let top: number = row === 0 ? 0 : (((row) * (parseInt(heightValue.toString(), 10) + this.cellSpacing[1])));
        let left: number = col === 0 ? 0 : (((col) * (parseInt(widthValue.toString(), 10) + this.cellSpacing[0])));
        cellSizeOne = this.getCellSize()[1];
        cellSizeZero = this.getCellSize()[0];
        this.elementRef.top = this.shadowEle.style.top = top + 'px';
        this.elementRef.left = this.shadowEle.style.left = left + 'px';
        this.elementRef.height = this.shadowEle.style.height = ((sizeY * cellSizeOne) + ((sizeY - 1) * this.cellSpacing[1])) + 'px';
        this.elementRef.width = this.shadowEle.style.width = ((sizeX * cellSizeZero) + ((sizeX - 1) * this.cellSpacing[0])) + 'px';
    };

    protected getCellInstance(idValue: string): PanelModel {
        let currentCellInstance: PanelModel;
        for (let i: number = 0; i < this.panels.length; i++) {
            if (this.panels[i].id === idValue) {
                currentCellInstance = this.panels[i];
            }
        }
        return currentCellInstance;
    }

    /**
     * Allows to add a panel to the Dashboardlayout.
     */
    public addPanel(panel: PanelModel): void {
        this.maxCol();
        if (!panel.minSizeX) {
            panel.minSizeX = 1;
        }
        if (!panel.minSizeY) {
            panel.minSizeY = 1;
        }
        if (!panel.id) {
            panel.id = 'layout_' + this.panelID.toString();
            this.panelID = this.panelID + 1;
        }
        // tslint:disable-next-line
        let panelProp: Panel = new Panel((<any>this), 'panels', panel);
        this.panels.push(panelProp);
        this.setMinMaxValues(panelProp);
        if (this.maxColumnValue < panelProp.col || this.maxColumnValue < (panelProp.col + panelProp.sizeX)) {
            this.panelPropertyChange(panelProp, { col: this.maxColumnValue - panelProp.sizeX });
        }
        let cell: HTMLElement = this.renderCell(panelProp, true);
        this.oldRowCol[panelProp.id] = { row: panelProp.row, col: panelProp.col };
        this.cloneObject[panelProp.id] = { row: panelProp.row, col: panelProp.col };
        this.updateOldRowColumn();
        this.element.insertAdjacentElement('afterbegin', cell);
        let container: HTMLElement = cell.querySelector('.e-panel-container');
        if (this.checkMediaQuery()) {
            this.checkMediaQuerySizing();
            this.removeResizeClasses(this.panelCollection);
        } else {
            this.addPanelCalled = true;
            this.mainElement = cell;
            if (!this.checkCollision) {
                this.checkCollision = [];
            }
            this.setPanelPosition(cell, panelProp.row, panelProp.col);
            this.updatePanelLayout(cell, panelProp);
            this.addPanelCalled = false;
        }
        if (this.allowResizing &&
            this.mediaQuery ? !(this.checkMediaQuery()) : false) {
            this.setResizingClass(cell, container);
        }
        if (this.allowDragging &&
            this.mediaQuery ? !(this.checkMediaQuery()) : false) {
            this.enableDraggingContent([document.getElementById(panelProp.id)]);
        }
        if (this.allowFloating) {
            this.moveItemsUpwards();
        }
        this.updateOldRowColumn();
        this.sortedPanel();
        this.updateCloneArrayObject();
        if (this.allowResizing) {
            for (let i: number = 0; i < cell.querySelectorAll('.e-resize').length; i++) {
                let eventName: string = (Browser.info.name === 'msie') ? 'mousedown pointerdown' : 'mousedown';
                EventHandler.add(cell.querySelectorAll('.e-resize')[i], eventName, this.downResizeHandler, this);
                if (Browser.info.name !== 'mise') {
                    EventHandler.add(cell.querySelectorAll('.e-resize')[i], 'touchstart', this.touchDownResizeHandler, this);
                }
            }
        }
    }

    /**
     * Allows to update a panel in the DashboardLayout.
     */
    public updatePanel(panel: PanelModel): void {
        if (!panel.id) {
            return;
        }
        let panelInstance: PanelModel = this.getCellInstance(panel.id);
        if (!panelInstance) {
            return;
        }
        this.maxCol();
        panel.col = (panel.col < 1) ? 0 : ((panel.col > this.columns)) ? this.columns - 1 : panel.col;
        if (isNullOrUndefined(panel.col)) {
            panel.col = panelInstance.col;
        }
        this.panelPropertyChange(panelInstance, panel);
        this.setMinMaxValues(panelInstance);
        let cell: HTMLElement = document.getElementById(panel.id);
        this.mainElement = cell;
        this.panelContent = cell.querySelector('.e-panel-container') ?
            cell.querySelector('.e-panel-container') :
            this.createSubElement(panelInstance.cssClass, cell.id + '_content', panelContainer);
        cell.appendChild(this.panelContent);
        if (panelInstance.header) {
            let headerTemplateElement: HTMLElement = cell.querySelector('.e-panel-header') ?
                cell.querySelector('.e-panel-header') : this.createSubElement('', cell.id + 'template', '');
            addClass([headerTemplateElement], [header]);
            headerTemplateElement.innerHTML = '';
            let id: string = this.element.id + 'HeaderTemplate' + panelInstance.id;
            this.renderTemplate(<string>panelInstance.header, headerTemplateElement, id, true);
            this.panelContent.appendChild(headerTemplateElement);
        } else {
            if (cell.querySelector('.e-panel-header')) {
                detach(cell.querySelector('.e-panel-header'));
            }
        }
        if (panelInstance.content) {
            this.panelBody = cell.querySelector('.e-panel-content') ? cell.querySelector('.e-panel-content') :
                this.createSubElement(panelInstance.cssClass, cell.id + '_body', panelContent);
            this.panelBody.innerHTML = '';
            let headerHeight: string = this.panelContent.querySelector('.e-panel-header') ?
                window.getComputedStyle(this.panelContent.querySelector('.e-panel-header')).height : '0px';
            let contentHeightValue: string = 'calc( 100% - ' + headerHeight + ')';
            setStyle(this.panelBody, { height: contentHeightValue });
            let id: string = this.element.id + 'ContentTemplate' + panelInstance.id;
            this.renderTemplate(<string>panelInstance.content, this.panelBody, id, true);
            this.panelContent.appendChild(this.panelBody);
        } else {
            if (cell.querySelector('.e-panel-content')) {
                detach(cell.querySelector('.e-panel-content'));
            }
        }
        this.setXYAttributes(cell, panelInstance);
        this.setHeightAndWidth(cell, panelInstance);
        this.setPanelPosition(cell, panelInstance.row, panelInstance.col);
        this.updatePanelLayout(cell, panelInstance);
        this.mainElement = null;
        this.updatePanels();
        this.updateCloneArrayObject();
    }

    protected updateCloneArrayObject(): void {
        this.cloneArray = this.sortedArray;
        this.cloneObject = JSON.parse(JSON.stringify(this.oldRowCol));
    }

    /**
     * Returns the panels object of the DashboardLayout.
     */
    public serialize(): PanelModel[] {
        let cloneModel: PanelModel[] = this.cloneModels(this.panels);
        let customObject: {
            id: string, row: number, col: number, sizeX: number,
            sizeY: number, minSizeX: number, minSizeY: number, maxSizeX: number,
            maxSizeY: number
        }[] = [];
        for (let i: number = 0; i < cloneModel.length; i++) {
            customObject.push({
                id: cloneModel[i].id, row: cloneModel[i].row, col: cloneModel[i].col, sizeX: cloneModel[i].sizeX,
                sizeY: cloneModel[i].sizeY, minSizeX: cloneModel[i].minSizeX, minSizeY: cloneModel[i].minSizeY,
                maxSizeX: cloneModel[i].maxSizeX, maxSizeY: cloneModel[i].maxSizeY
            });
        }
        return (customObject);
    }

    /**
     * Removes all the panels from the DashboardLayout.
     */

    public removeAll(): void {
        for (let i: number = 0; i < this.panelCollection.length; i++) {
            detach(this.panelCollection[i]);
        }
        this.element.innerHTML = '';
        this.rows = 0;
        this.gridPanelCollection = [];
        this.setHeightWidth();
        this.sortedPanel();
        this.sortedArray = [];
        this.overlapElementClone = [];
        this.overlapElement = [];
        this.overlapSubElementClone = [];
        this.panelCollection = [];
        this.oldRowCol = {};
        this.cloneObject = {};
        this.panels = [];
        this.updatePanels();
        this.updateCloneArrayObject();
    }

    /**
     * Removes the panel from the DashboardLayout.
     */
    public removePanel(id: string): void {
        for (let i: number = 0; i < this.panelCollection.length; i++) {
            if (this.panelCollection[i].id === id) {
                detach(this.panelCollection[i]);
                this.panelCollection.splice(i, 1);
            }
            if (this.panels[i].id === id) {
                this.panels.splice(i, 1);
                this.updateOldRowColumn();
                this.sortedPanel();
            }
        }
        this.updatePanels();
        this.gridPanelCollection.forEach((item: HTMLElement) => {
            if (item.id === id) {
                this.gridPanelCollection.splice(this.gridPanelCollection.indexOf(item), 1);
            }
        });
        this.updateCloneArrayObject();
    }

    constructor(options?: DashboardLayoutModel, element?: string | HTMLInputElement) {
        super(options, element);
    }

    /**
     * Moves the panel in the DashboardLayout.
     */
    public movePanel(id: string, row: number, col: number): void {
        this.movePanelCalled = true;
        let panelInstance: PanelModel = this.getCellInstance(id);
        if (col < 1) {
            col = 0;
        } else if (col > this.columns) {
            col = this.columns - 1;
        }
        this.panelPropertyChange(panelInstance, { row: row, col: col });
        let ele: HTMLElement = document.getElementById(id);
        this.mainElement = ele;
        this.setAttributes({ value: { col: col.toString(), row: row.toString() } }, ele);
        this.setPanelPosition(ele, row, col);
        this.updatePanelLayout(ele, panelInstance);
        this.updateRowHeight();
        this.updatePanels();
        this.updateCloneArrayObject();
        this.movePanelCalled = false;
    }

    protected setAttributes(value: IAttributes, ele: HTMLElement): void {
        for (let i: number = 0; i < Object.keys(value).length; i++) {
            if (Object.keys(value)) {
                if (value[Object.keys(value)[i]].col) {
                    ele.setAttribute('data-col', value[Object.keys(value)[i]].col.toString());
                }
                if (value[Object.keys(value)[i]].row) {
                    ele.setAttribute('data-row', value[Object.keys(value)[i]].row.toString());
                }
                if (value[Object.keys(value)[i]].sizeX) {
                    ele.setAttribute('data-sizeX', value[Object.keys(value)[i]].sizeX.toString());
                }
                if (value[Object.keys(value)[i]].sizeY) {
                    ele.setAttribute('data-sizeY', value[Object.keys(value)[i]].sizeY.toString());
                }
                if (value[Object.keys(value)[i]].minSizeX) {
                    ele.setAttribute('data-minSizeX', value[Object.keys(value)[i]].minSizeX.toString());
                }
                if (value[Object.keys(value)[i]].minSizeY) {
                    ele.setAttribute('data-minSizeY', value[Object.keys(value)[i]].minSizeY.toString());
                }
                if (value[Object.keys(value)[i]].maxSizeX) {
                    ele.setAttribute('data-maxSizeY', value[Object.keys(value)[i]].maxSizeX.toString());
                }
                if (value[Object.keys(value)[i]].maxSizeY) {
                    ele.setAttribute('data-maxSizeY', value[Object.keys(value)[i]].maxSizeY.toString());
                }
            }
        }
    }

    /**
     * Resize the panel in the DashboardLayout.
     */
    public resizePanel(id: string, sizeX: number, sizeY: number): void {
        let panelInstance: PanelModel = this.getCellInstance(id);
        this.resizeCalled = true;
        this.panelPropertyChange(panelInstance, { sizeX: sizeX, sizeY: sizeY });
        this.setMinMaxValues(panelInstance);
        this.checkMinMaxValues(panelInstance);
        let ele: HTMLElement = document.getElementById(id);
        this.mainElement = ele;
        this.setAttributes({ value: { sizeX: panelInstance.sizeX.toString(), sizeY: panelInstance.sizeY.toString() } }, ele);
        this.setHeightAndWidth(ele, panelInstance);
        this.updatePanelLayout(ele, panelInstance);
        this.updatePanels();
        this.updateRowHeight();
        this.resizeCalled = false;
    }

    /**
     * Destroys the DashboardLayout component
     */
    public destroy(): void {
        removeClass([this.element], ['e-dashboardlayout', 'e-lib', 'e-responsive', 'e-control']);
        this.element.removeAttribute('style');
        for (let i: number = 0; i < this.dragCollection.length; i++) {
            this.dragCollection[i].destroy();
        }
        this.element.innerHTML = '';
        super.destroy();
    }

    protected setEnableRtl(): void {
        this.enableRtl ? addClass([this.element], 'e-rtl') : removeClass([this.element], 'e-rtl');
    }
    protected getDragInstance(id: string): Draggable {
        let draggableInstance: Draggable;
        let ele: HTMLElement = document.getElementById(id);
        for (let i: number = 0; i < this.dragCollection.length; i++) {
            draggableInstance = this.dragCollection[i].element === ele ? this.dragCollection[i] : null;
            if (draggableInstance) {
                return draggableInstance;
            }
        }
        return draggableInstance;
    }

    /**
     * Called internally if any of the property value changed.
     * returns void
     * @private
     */
    private updateCellSizeAndSpacing(): void {
        this.panelResponsiveUpdate();
        this.setHeightWidth();
        this.getRowColumn();
        for (let i: number = 0; i < this.element.querySelectorAll('.e-panel').length; i++) {
            let ele: HTMLElement = <HTMLElement>this.element.querySelectorAll('.e-panel')[i];
            let panelModel: PanelModel = this.getCellInstance(ele.id);
            this.setHeightAndWidth(ele, panelModel);
            this.setPanelPosition(ele, panelModel.row, panelModel.col);
        }
    }

    private updatePanelsDynamically(panels: PanelModel[]): void {
        this.removeAll();
        this.setProperties({ panels: panels }, true);
        this.setOldRowCol();
        this.initialize();
        if (this.showGridLines) {
            this.initGridLines();
        }
    }

    private checkForIDValues(panels: PanelModel[]): void {
        if (!isNullOrUndefined(panels)) {
            this.panelID = 0;
            panels.forEach((panel: PanelModel) => {
                if (!panel.id) {
                    this.panelPropertyChange(panel, { id: 'layout_' + this.panelID.toString() });
                    this.panelID = this.panelID + 1;
                }
            });
        }
    }

    /**
     * Called internally if any of the property value changed.
     * returns void
     * @private
     */

    public onPropertyChanged(newProp: DashboardLayoutModel, oldProp: DashboardLayoutModel): void {
        if (newProp.panels) { this.checkForIDValues(newProp.panels); }
        for (let prop of Object.keys(newProp)) {
            switch (prop) {
                case 'enableRtl':
                    this.setProperties({ enableRtl: newProp.enableRtl }, true);
                    this.setEnableRtl();
                    break;
                case 'mediaQuery':
                    this.setProperties({ mediaQuery: newProp.mediaQuery }, true);
                    if (this.checkMediaQuery()) { this.checkMediaQuerySizing(); }
                    break;
                case 'allowDragging':
                    this.setProperties({ allowDragging: newProp.allowDragging }, true);
                    this.checkDragging(this.dragCollection);
                    break;
                case 'allowResizing':
                    this.setProperties({ allowResizing: newProp.allowResizing }, true);
                    if (this.allowResizing) {
                        this.setClasses(this.panelCollection);
                        this.resizeEvents();
                    } else {
                        for (let i: number = 0; i < document.querySelectorAll('.e-resize').length; i++) {
                            let eventName: string = (Browser.info.name === 'msie') ? 'mousedown pointerdown' : 'mousedown';
                            let element: HTMLElement = <HTMLElement>document.querySelectorAll('.e-resize')[i];
                            EventHandler.remove(element, eventName, this.downResizeHandler);
                            if (Browser.info.name !== 'mise') {
                                EventHandler.remove(element, 'touchstart', this.touchDownResizeHandler);
                            }
                        }
                        this.removeResizeClasses(this.panelCollection);
                    }
                    break;
                case 'cellSpacing':
                    this.setProperties({ cellSpacing: newProp.cellSpacing }, true);
                    this.updateCellSizeAndSpacing();
                    this.updateGridLines();
                    break;
                case 'draggableHandle':
                    this.setProperties({ draggableHandle: newProp.draggableHandle }, true);
                    for (let i: number = 0; i < this.element.querySelectorAll('.e-panel').length; i++) {
                        let ele: HTMLElement = <HTMLElement>this.element.querySelectorAll('.e-panel')[i];
                        let draggableInstance: Draggable = this.getDragInstance(ele.id);
                        draggableInstance.handle = this.draggableHandle;
                    }
                    break;
                case 'allowFloating':
                    this.setProperties({ allowFloating: newProp.allowFloating }, true);
                    this.moveItemsUpwards();
                    break;
                case 'showGridLines':
                    if (this.showGridLines) {
                        this.setProperties({ showGridLines: newProp.showGridLines }, true);
                        this.initGridLines();
                    } else {
                        if (this.table) { detach(this.table); }
                    }
                    break;
                case 'allowPushing':
                    this.setProperties({ allowPushing: newProp.allowPushing }, true);
                    break;
                case 'panels':
                    if (!this.isDynamicallyUpdated) {
                        this.isRenderComplete = false;
                        this.updatePanelsDynamically(newProp.panels);
                        this.isRenderComplete = true;
                        this.isDynamicallyUpdated = true;
                    } else { this.isDynamicallyUpdated = false; }
                    break;
                case 'columns':
                    this.isRenderComplete = false;
                    if (newProp.panels && !this.isDynamicallyUpdated) {
                        this.updatePanelsDynamically(newProp.panels);
                        this.isDynamicallyUpdated = true;
                    } else { this.isDynamicallyUpdated = false; }
                    this.setProperties({ columns: newProp.columns }, true);
                    this.panelCollection = [];
                    this.maxColumnValue = this.columns;
                    this.calculateCellSize();
                    this.panels.forEach((panel: PanelModel) => {
                        this.setMinMaxValues(panel);
                        if (this.maxColumnValue < panel.col || this.maxColumnValue < (panel.col + panel.sizeX)) {
                            let colValue: number = this.maxColumnValue - panel.sizeX;
                            this.panelPropertyChange(panel, { col: colValue < 0 ? 0 : colValue });
                            this.setXYAttributes(document.getElementById(panel.id), panel);
                        }
                        this.setHeightAndWidth(document.getElementById(panel.id), panel);
                        this.panelCollection.push(document.getElementById(panel.id));
                        this.setPanelPosition(document.getElementById(panel.id), panel.row, panel.col);
                        this.mainElement = document.getElementById(panel.id);
                        this.updatePanelLayout(document.getElementById(panel.id), panel);
                        this.mainElement = null;
                    });
                    this.updatePanels();
                    this.updateCloneArrayObject();
                    this.isRenderComplete = true;
                    this.updateGridLines();
                    break;
            }
        }
    }
    /**
     * Gets the properties to be maintained upon browser refresh.
     * @returns string
     */
    public getPersistData(): string {
        let keyEntity: string[] = ['panels'];
        return this.addOnPersist(keyEntity);
    }

    /**
     * Returns the current module name.
     * @returns string
     * @private
     */
    protected getModuleName(): string {
        return 'DashboardLayout';
    }

}

/**
 * Defines the dragstart event arguments
 */
export interface DragStartArgs {

    /**
     * Specifies the original event.
     */
    event: MouseEvent | TouchEvent;

    /**
     * Illustrates whether the current action needs to be prevented or not.
     */
    cancel: boolean;

    /**
     * Specifies the cell element being dragged.
     */
    element: HTMLElement;
}


/**
 * Defines the change event arguments
 */
export interface ChangeEventArgs {

    /**
     * Specifies the model values of the position changed panels.
     */
    changedPanels: PanelModel[];
}

/**
 * Defines the Drag event arguments
 */

export interface DraggedEventArgs {

    /**
     * Specifies the original event.
     */
    event: MouseEvent | TouchEvent;

    /**
     * Specifies the cell element being dragged.
     */
    element: HTMLElement;

    /**
     * Specifies the element below the cell element being dragged.
     */
    target: HTMLElement;
}

/**
 * Defines the dragstop event arguments
 */
export interface DragStopArgs {

    /**
     * Specifies the original event.
     */
    event: MouseEvent | TouchEvent;

    /**
     * Specifies the cell element being dragged.
     */
    element: HTMLElement;
}


/**
 * Defines the resize event arguments
 */
export interface ResizeArgs {

    /**
     * Specifies the original event.
     */
    event: MouseEvent | TouchEvent;

    /**
     * Specifies the cell element being resized.
     */
    element: HTMLElement;
}

interface IAttributes {
    [key: string]: {
        sizeX?: string | number;
        sizeY?: string | number;
        minSizeX?: string | number;
        minSizeY?: string | number;
        maxSizeX?: string | number;
        maxSizeY?: string | number;
        row?: string | number;
        col?: string | number;
    };
}

interface IChangePanel {
    sizeX?: number;
    sizeY?: number;
    minSizeX?: number;
    minSizeY?: number;
    maxSizeX?: number;
    maxSizeY?: number;
    row?: number;
    col?: number;
    id?: string;
    header?: string | HTMLElement;
    content?: string | HTMLElement;
}