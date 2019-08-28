import { Component, formatUnit, EventHandler, Event, isNullOrUndefined, closest, isBlazor } from '@syncfusion/ej2-base';
import { Property, EmitType, NotifyPropertyChanges, INotifyPropertyChanged, Browser } from '@syncfusion/ej2-base';
import { setStyleAttribute as setStyle, addClass, removeClass, createElement, Touch, SwipeEventArgs } from '@syncfusion/ej2-base';
import { SidebarModel } from './sidebar-model';

const CONTROL: string = 'e-control';
const ROOT: string = 'e-sidebar';
const DOCKER: string = 'e-dock';
const CLOSE: string = 'e-close';
const OPEN: string = 'e-open';
const TRASITION: string = 'e-transition';
const DEFAULTBACKDROP: string = 'e-sidebar-overlay';
const CONTEXTBACKDROP: string = 'e-backdrop';
const RTL: string = 'e-rtl';
const RIGHT: string = 'e-right';
const LEFT: string = 'e-left';
const OVER: string = 'e-over';
const PUSH: string = 'e-push';
const SLIDE: string = 'e-slide';
const VISIBILITY: string = 'e-visibility';
const MAINCONTENTANIMATION: string = 'e-content-animation';
const DISABLEANIMATION: string = 'e-disable-animation';
const CONTEXT: string = 'e-sidebar-context';
const SIDEBARABSOLUTE: string = 'e-sidebar-absolute';


/**
 * Specifies the Sidebar types.
 */
export type SidebarType = 'Slide' | 'Over' | 'Push' | 'Auto';
/**
 * Specifies the Sidebar positions.
 */
export type SidebarPosition = 'Left' | 'Right';

/**
 * Sidebar is an expandable or collapsible
 * component that typically act as a side container to place the primary or secondary content alongside of the main content.
 * ```html
 * <aside id="sidebar">
 * </aside>
 * ```
 * ```typescript
 * <script>
 *   let sidebarObject: Sidebar = new Sidebar();
 *   sidebarObject.appendTo("#sidebar");
 * </script>
 * ```
 */
@NotifyPropertyChanges
export class Sidebar extends Component<HTMLElement> implements INotifyPropertyChanged {
    private modal: HTMLElement;
    private mainContentEle: Touch;
    private sidebarEle: Touch;
    private sidebarEleCopy: HTMLElement;
    protected tabIndex: string;
    private windowWidth: number;

    /**
     * Specifies the size of the Sidebar in dock state.
     * > For more details about dockSize refer to 
     * [`Dock`](https://ej2.syncfusion.com/documentation/sidebar/docking-sidebar/) documentation.
     * @default 'auto'
     */
    @Property('auto')
    public dockSize: string | number;
    /**
     * Specifies the media query string for resolution, which when met opens the Sidebar.
     * ```typescript
     *   let defaultSidebar: Sidebar = new Sidebar({
     *       mediaQuery:'(min-width: 600px)' 
     *   });
     * ```
     * > For more details about mediaQuery refer to 
     * [`Auto Close`](https://ej2.syncfusion.com/documentation/sidebar/auto-close/) documentation.
     * @default null
     * @aspType string
     * @blazorType string
     */
    @Property(null)
    public mediaQuery: string | MediaQueryList;
    /**
     * Specifies the docking state of the component.
     * > For more details about enableDock refer to 
     * [`Dock`](https://ej2.syncfusion.com/documentation/sidebar/docking-sidebar/) documentation.
     * @default false
     */
    @Property(false)
    public enableDock: boolean;
    /**
     * Enables the expand or collapse while swiping in touch devices.
     * This is not a sidebar property.
     * @default 'en-US'
     * @private
     */
    @Property('en-US')
    public locale: string;
    /**
     * Enable or disable persisting component's state between page reloads. If enabled, following list of states will be persisted.
     * 1. Position
     * 2. Type
     * @default false
     */
    @Property(false)
    public enablePersistence: boolean;
    /**
     * Enables the expand or collapse while swiping in touch devices.
     * @default true
     */
    @Property(true)
    public enableGestures: boolean;
    /**
     * Gets or sets the Sidebar component is open or close. 
     * > When the Sidebar type is set to `Auto`,
     * the component will be expanded in the desktop and collapsed in the mobile mode regardless of the isOpen property.
     * @default false
     */
    @Property(false)
    public isOpen: boolean;
    /**
     * Specifies the Sidebar in RTL mode that displays the content in the right-to-left direction.
     * @default false
     */
    @Property(false)
    public enableRtl: boolean;
    /**
     * Enable or disable the animation transitions on expanding or collapsing the Sidebar.
     * @default true
     */
    @Property(true)
    public animate: boolean;
    /**
     * Specifies the height of the Sidebar.
     * @default 'auto'
     * @private
     */
    @Property('auto')
    public height: string | number;
    /**
     * Specifies whether the Sidebar need to be closed or not when document area is clicked.
     * @default false
     */
    @Property(false)
    public closeOnDocumentClick: boolean;
    /**
     * Specifies the position of the Sidebar (Left/Right) corresponding to the main content.
     * > For more details about SidebarPosition refer to 
     * [`position`](https://ej2.syncfusion.com/documentation/sidebar/getting-started/#position) documentation.
     * @default 'Left'
     */
    @Property('Left')
    public position: SidebarPosition;
    /**
     * Allows to place the sidebar inside the target element.
     * > For more details about target refer to 
     * [`Custom Context`](https://ej2.syncfusion.com/documentation/sidebar/custom-context/) documentation.
     * @default null
     */
    @Property(null)
    public target: HTMLElement | string;
    /**
     * Specifies the whether to apply overlay options to main content when the Sidebar is in an open state.
     * > For more details about showBackdrop refer to 
     * [`Backdrop`](https://ej2.syncfusion.com/documentation/sidebar/getting-started/#enable-backdrop) documentation.
     * @default false
     */
    @Property(false)
    public showBackdrop: boolean;
    /**
     * Specifies the expanding types of the Sidebar.
     * * `Over` - The sidebar floats over the main content area.
     * * `Push` - The sidebar pushes the main content area to appear side-by-side, and shrinks the main content within the screen width.
     * * `Slide` - The sidebar translates the x and y positions of main content area based on the sidebar width. 
     * The main content area will not be adjusted within the screen width.
     * * `Auto` - Sidebar with `Over` type in mobile resolution and `Push` type in other higher resolutions.
     * > For more details about SidebarType refer to 
     * [`SidebarType`](./variations.html#types) documentation.
     * @default 'Auto'
     */
    @Property('Auto')
    public type: SidebarType;
    /**
     * Specifies the width of the Sidebar. By default, the width of the Sidebar sets based on the size of its content.
     * Width can also be set in pixel values.
     * @default 'auto'
     */
    @Property('auto')
    public width: string | number;
    /**
     * Specifies the z-index of the Sidebar. It is applicable only when sidebar act as overlay type.
     * @default 1000
     * @aspType double
     * @blazorType double
     */
    @Property(1000)
    public zIndex: string | number;
    /**
     * Triggers when component is created.
     * @event 
     * @blazorproperty 'Created'
     */
    @Event()
    public created: EmitType<Object>;
    /**
     * Triggers when component is closed.
     * @event 
     * @blazorproperty 'OnClose'
     */
    @Event()
    public close: EmitType<EventArgs>;
    /**
     * Triggers when component is opened.
     * @event 
     * @blazorproperty 'OnOpen'
     */
    @Event()
    public open: EmitType<EventArgs>;
    /**
     * Triggers when the state(expand/collapse) of the component is changed.
     * @event 
     * @blazorproperty 'Changed'
     */
    @Event()
    public change: EmitType<ChangeEventArgs>;
    /**
     * Triggers when component gets destroyed.
     * @event 
     * @blazorproperty 'Destroyed'
     */
    @Event()
    public destroyed: EmitType<Object>;

    constructor(options?: SidebarModel, element?: string | HTMLElement) {
        super(options, element);
    }
    protected preRender(): void {
        this.setWidth();
    }
    protected render(): void {
        this.initialize();
        this.wireEvents();
        this.renderComplete();
    }

    protected initialize(): void {
        this.setTarget();
        this.addClass();
        this.setZindex();
        if (this.enableDock) {
            this.setDock();
        }
        if (this.isOpen) {
            this.show();
        } else {
            this.setMediaQuery();
        }
        this.checkType(true);
        this.setType(this.type);
        this.setCloseOnDocumentClick();
        this.setEnableRTL();
        if (Browser.isDevice) {
            this.windowWidth = window.innerWidth;
        }
    }

    private setEnableRTL(): void {
        this.enableRtl ? (addClass([this.element], RTL)) :
            (removeClass([this.element], RTL));
    }

    private setTarget(): void {
        this.sidebarEleCopy = <HTMLElement>this.element.cloneNode(true);
        if (typeof (this.target) === 'string') {
            this.setProperties({ target: <HTMLElement>document.querySelector(this.target) }, true);
        }
        if (this.target) {
            (<HTMLElement>this.target).insertBefore(this.element, (<HTMLElement>this.target).children[0]);
            addClass([this.element], SIDEBARABSOLUTE);
            addClass([(<HTMLElement>this.target)], CONTEXT);
        }
    }

    private setCloseOnDocumentClick(): void {
        if (this.closeOnDocumentClick) {
            EventHandler.add(document, 'mousedown touchstart', this.documentclickHandler, this);
        } else {
            EventHandler.remove(document, 'mousedown touchstart', this.documentclickHandler);
        }
    }

    private setWidth(): void {
        if (this.enableDock && this.position === 'Left') {
            setStyle(this.element, { 'width': this.setDimension(this.dockSize) });
        } else if (this.enableDock && this.position === 'Right') {
            setStyle(this.element, { 'width': this.setDimension(this.dockSize) });
        } else if (!this.enableDock) {
            setStyle(this.element, { 'width': this.setDimension(this.width) });
        }
    }

    private setDimension(width: number | string): string {
        if (typeof width === 'number') {
            width = formatUnit(width);
        } else if (typeof width === 'string') {
            width = (width.match(/px|%|em/)) ? width : formatUnit(width);
        } else {
            width = '100%';
        }
        return width;
    }

    private setZindex(): void {
        setStyle(this.element, { 'z-index': '' + this.zIndex });
    }

    private addClass(): void {
        let classELement: HTMLElement = <HTMLElement>document.querySelector('.e-main-content');
        if (!isNullOrUndefined((classELement ||
            (<HTMLElement>this.element.nextElementSibling)))) {
            addClass([classELement || this.element.nextElementSibling], [MAINCONTENTANIMATION]);
        }
        if (!this.enableDock && this.type !== 'Auto') {
            addClass([this.element], [VISIBILITY]);
        }
        removeClass([this.element], [OPEN, CLOSE, RIGHT, LEFT, SLIDE, PUSH, OVER]);
        this.element.classList.add(ROOT);
        addClass([this.element], (this.position === 'Right') ? RIGHT : LEFT);
        if (this.type === 'Auto' && !Browser.isDevice) {
            this.show();
        } else if (!this.isOpen) {
            addClass([this.element], CLOSE);
        }
        if (this.enableDock) {
            addClass([this.element], DOCKER);
        }
        this.tabIndex = this.element.hasAttribute('tabindex') ? this.element.getAttribute('tabindex') : '0';
        this.element.setAttribute('tabindex', this.tabIndex);
    }
    private checkType(val: boolean): void {
        if (!(this.type === 'Push' || this.type === 'Over' || this.type === 'Slide')) {
            this.type = 'Auto';
        } else {
            if (!this.element.classList.contains(CLOSE) && !val) {
                this.hide();
            }
        }
    }
    private transitionEnd(e: Event): void {
        this.setDock();
        if (!isNullOrUndefined(e) && e.target === this.element) {
            this.triggerChange();
        }
        EventHandler.remove(this.element, 'transitionend', this.transitionEnd);
    }
    private destroyBackDrop(): void {
        let sibling: HTMLElement = (<HTMLElement>document.querySelector('.e-main-content')) ||
            (<HTMLElement>this.element.nextElementSibling);
        if (this.target && this.showBackdrop && sibling) {
            removeClass([sibling], CONTEXTBACKDROP);
        } else if (this.showBackdrop && this.modal) {
            this.modal.style.display = 'none';
            this.modal.outerHTML = '';
            this.modal = null;
        }
    }
    /** 
     * Hide the Sidebar component, if it is in an open state.
     * @returns void 
     */
    public hide(e?: Event): void {
        let closeArguments: EventArgs = {
            model: this,
            element: this.element,
            cancel: false,
            isInteracted: !isNullOrUndefined(e),
            event: (e || null)
        };
        if (isBlazor()) {
            delete closeArguments.model;
        }
        this.trigger('close', closeArguments, (observedcloseArgs: EventArgs) => {
            if (!observedcloseArgs.cancel) {
                if (this.element.classList.contains(CLOSE)) {
                    return;
                }
                if (this.element.classList.contains(OPEN) && !this.animate) {
                    this.triggerChange();
                }
                addClass([this.element], CLOSE);
                removeClass([this.element], OPEN);
                this.enableDock ? setStyle(this.element, { 'width': formatUnit(this.dockSize) }) :
                    setStyle(this.element, { 'width': formatUnit(this.width) });
                this.setType(this.type);
                let sibling: HTMLElement = <HTMLElement>document.querySelector('.e-main-content') ||
                    (<HTMLElement>this.element.nextElementSibling);
                if (!this.enableDock && sibling) {
                    sibling.style.transform = 'translateX(' + 0 + 'px)';
                    this.position === 'Left' ? sibling.style.marginLeft = '0px' : sibling.style.marginRight = '0px';
                }
                this.destroyBackDrop();
                this.setAnimation();
                if (this.type === 'Slide') {
                    document.body.classList.remove('e-sidebar-overflow');
                }
                this.setProperties({ isOpen: false }, true);
                if (this.enableDock) {
                    setTimeout((): void => this.setTimeOut(), 50);
                }
                EventHandler.add(this.element, 'transitionend', this.transitionEnd, this);
            }
        });
    }

    private setTimeOut(): void {
        let sibling: HTMLElement = <HTMLElement>document.querySelector('.e-main-content') ||
            (<HTMLElement>this.element.nextElementSibling);
        if (this.element.classList.contains(OPEN) && sibling) {
            if (this.position === 'Left') {
                this.width === 'auto' ? sibling.style.marginLeft = this.setDimension(this.element.getBoundingClientRect().width)
                    : sibling.style.marginLeft = this.setDimension(this.width);
            } else {
                this.width === 'auto' ? sibling.style.marginRight = this.setDimension(this.element.getBoundingClientRect().width)
                    : sibling.style.marginRight = this.setDimension(this.width);
            }
        } else if (this.element.classList.contains(CLOSE) && sibling) {
            if (this.position === 'Left') {
                this.dockSize === 'auto' ? sibling.style.marginLeft = this.setDimension(this.element.getBoundingClientRect().width)
                    : sibling.style.marginLeft = this.setDimension(this.dockSize);
            } else {
                this.dockSize === 'auto' ? sibling.style.marginRight = this.setDimension(this.element.getBoundingClientRect().width)
                    : sibling.style.marginRight = this.setDimension(this.dockSize);
            }
        }
    };
    /** 
     * Shows the Sidebar component, if it is in closed state.
     * @returns void 
     */
    public show(e?: Event): void {
        let openArguments: EventArgs = {
            model: this,
            element: this.element,
            cancel: false,
            isInteracted: !isNullOrUndefined(e),
            event: (e || null)
        };
        if (isBlazor()) {
            delete openArguments.model;
        }
        this.trigger('open', openArguments, (observedopenArgs: EventArgs) => {
            if (!observedopenArgs.cancel) {
                removeClass([this.element], VISIBILITY);
                if (this.element.classList.contains(OPEN)) {
                    return;
                }
                if (this.element.classList.contains(CLOSE) && !this.animate) {
                    this.triggerChange();
                }
                addClass([this.element], [OPEN, TRASITION]);
                setStyle(this.element, { 'transform': '' });
                removeClass([this.element], CLOSE);
                setStyle(this.element, { 'width': formatUnit(this.width) });
                this.setType(this.type);
                this.createBackDrop();
                this.setAnimation();
                if (this.type === 'Slide') {
                    document.body.classList.add('e-sidebar-overflow');
                }
                this.setProperties({ isOpen: true }, true);
                EventHandler.add(this.element, 'transitionend', this.transitionEnd, this);
            }
        });
    }

    private setAnimation(): void {
        if (this.animate) {
            removeClass([this.element], DISABLEANIMATION);
        } else {
            addClass([this.element], DISABLEANIMATION);
        }
    }

    private triggerChange(): void {
        let changeArguments: ChangeEventArgs = { name: 'change', element: this.element };
        this.trigger('change', changeArguments);
    }

    private setDock(): void {
        if (this.enableDock && this.position === 'Left' && !this.getState()) {
            setStyle(this.element, { 'transform': 'translateX(' + -100 + '%) translateX(' + this.setDimension(this.dockSize) + ')' });
        } else if (this.enableDock && this.position === 'Right' && !this.getState()) {
            setStyle(this.element, { 'transform': 'translateX(' + 100 + '%) translateX(' + '-' + this.setDimension(this.dockSize) + ')' });
        }
        if (this.element.classList.contains(CLOSE) && this.enableDock) {
            setStyle(this.element, { 'width': this.setDimension(this.dockSize) });
        }
    }
    private createBackDrop(): void {
        if (this.target && this.showBackdrop && this.getState()) {
            let sibling: HTMLElement = <HTMLElement>document.querySelector('.e-main-content') ||
                (<HTMLElement>this.element.nextElementSibling);
            addClass([sibling], CONTEXTBACKDROP);
        } else if (this.showBackdrop && !this.modal && this.getState()) {
            this.modal = this.createElement('div');
            this.modal.className = DEFAULTBACKDROP;
            this.modal.style.display = 'block';
            document.body.appendChild(this.modal);
        }
    }

    protected getPersistData(): string {
        return this.addOnPersist(['type', 'position', 'isOpen']);
    }

    /**
     * Returns the current module name.
     * @returns string
     * @private
     */
    protected getModuleName(): string {
        return 'sidebar';
    }

    /** 
     * Shows or hides the Sidebar based on the current state.
     * @returns void 
     */
    public toggle(e?: Event): void {
        this.element.classList.contains(OPEN) ? this.hide() : this.show();
    }

    protected getState(): boolean {
        return this.element.classList.contains(OPEN) ? true : false;
    }
    private setMediaQuery(): void {
        if (this.mediaQuery) {
            let media: boolean = false;
            if (typeof (this.mediaQuery) === 'string') {
                media = window.matchMedia(this.mediaQuery).matches;
            } else {
                media = (this.mediaQuery).matches;
            }
            if (media && this.windowWidth !== window.innerWidth) {
                this.show();
            } else if (this.getState() && this.windowWidth !== window.innerWidth) {
                this.hide();
            }
        }
    }
    protected resize(e: Event): void {
        if (this.type === 'Auto') {
            if (Browser.isDevice) {
                addClass([this.element], OVER);
            } else {
                addClass([this.element], PUSH);
            }
        }
        this.setMediaQuery();
        if (Browser.isDevice) {
            this.windowWidth = window.innerWidth;
        }
    }

    private documentclickHandler(e: MouseEvent): void {
        if (closest((<HTMLElement>e.target), '.' + CONTROL + '' + '.' + ROOT)) {
            return;
        }
        this.hide(e);
    }

    private enableGestureHandler(args: SwipeEventArgs): void {
        if (this.position === 'Left' && args.swipeDirection === 'Right' &&
            (args.startX <= 20 && args.distanceX >= 50 && args.velocity >= 0.5)) {
            this.show();
        } else if (this.position === 'Left' && args.swipeDirection === 'Left') {
            this.hide();
        } else if (this.position === 'Right' && args.swipeDirection === 'Right') {
            this.hide();
        } else if (this.position === 'Right' && args.swipeDirection === 'Left'
            && (window.innerWidth - args.startX <= 20 && args.distanceX >= 50 && args.velocity >= 0.5)) {
            this.show();
        }
    }
    private setEnableGestures(): void {
        if (this.enableGestures) {
            this.mainContentEle = new Touch(document.body, { swipe: this.enableGestureHandler.bind(this) });
            this.sidebarEle = new Touch(<HTMLElement>this.element, { swipe: this.enableGestureHandler.bind(this) });
        } else {
            if (this.mainContentEle && this.sidebarEle) {
                this.mainContentEle.destroy();
                this.sidebarEle.destroy();
            }
        }
    }
    private wireEvents(): void {
        this.setEnableGestures();
        window.addEventListener('resize', this.resize.bind(this));
    }
    private unWireEvents(): void {
        window.removeEventListener('resize', this.resize.bind(this));
        EventHandler.remove(document, 'mousedown touchstart', this.documentclickHandler);
        if (this.mainContentEle) { this.mainContentEle.destroy(); }
        if (this.sidebarEle) { this.sidebarEle.destroy(); }
    }
    public onPropertyChanged(newProp: SidebarModel, oldProp: SidebarModel): void {
        let sibling: HTMLElement = <HTMLElement>document.querySelector('.e-main-content') ||
            (<HTMLElement>this.element.nextElementSibling);
        for (let prop of Object.keys(newProp)) {
            switch (prop) {
                case 'isOpen':
                    this.isOpen ? this.show() : this.hide();
                    break;
                case 'width':
                    this.setWidth();
                    if (!this.getState()) {
                        this.setDock();
                    }
                    break;
                case 'animate':
                    this.setAnimation();
                    break;
                case 'type':
                    this.checkType(false);
                    removeClass([this.element], [VISIBILITY]);
                    this.addClass();
                    addClass([this.element], this.type === 'Auto' ? (Browser.isDevice ? ['e-over'] :
                        ['e-push']) : ['e-' + this.type.toLowerCase()]);
                    break;
                case 'position':
                    this.element.style.transform = '';
                    this.setDock();
                    if (sibling) {
                        this.position === 'Left' ? sibling.style.marginRight = '0px' : sibling.style.marginLeft = '0px';
                    }
                    if (this.position === 'Right') {
                        removeClass([this.element], LEFT);
                        addClass([this.element], RIGHT);
                    } else {
                        removeClass([this.element], RIGHT);
                        addClass([this.element], LEFT);
                    }
                    this.setType(this.type);
                    break;
                case 'showBackdrop':
                    if (this.showBackdrop) { this.createBackDrop(); } else {
                        if (this.modal) {
                            this.modal.style.display = 'none';
                            this.modal.outerHTML = '';
                            this.modal = null;
                        }
                    }
                    break;
                case 'target':
                    if (typeof (this.target) === 'string') {
                        this.setProperties({ target: <HTMLElement>document.querySelector(this.target) }, true);
                    }
                    if (isNullOrUndefined(this.target)) {
                        removeClass([this.element], SIDEBARABSOLUTE);
                        removeClass([<HTMLElement>oldProp.target], CONTEXT);
                        setStyle(sibling, { 'margin-left': 0, 'margin-right': 0 });
                        document.body.insertAdjacentElement('afterbegin', this.element);
                    } else {
                        super.refresh();
                    }
                    break;
                case 'closeOnDocumentClick':
                    this.setCloseOnDocumentClick();
                    break;
                case 'enableDock':
                    if (!this.getState()) {
                        this.setDock();
                    }
                    break;
                case 'zIndex':
                    this.setZindex();
                    break;
                case 'mediaQuery':
                    this.setMediaQuery();
                    break;
                case 'enableGestures':
                    this.setEnableGestures();
                    break;
                case 'enableRtl':
                    this.setEnableRTL();
                    break;
            }
        }
    }

    protected setType(type?: string): void {
        let elementWidth: number = this.element.getBoundingClientRect().width;
        this.setZindex();
        let sibling: HTMLElement = <HTMLElement>document.querySelector('.e-main-content') ||
            (<HTMLElement>this.element.nextElementSibling);
        if (sibling) {
            sibling.style.transform = 'translateX(' + 0 + 'px)';
            if (!Browser.isDevice && this.type !== 'Auto') {
                this.position === 'Left' ? sibling.style.marginLeft = '0px' : sibling.style.marginRight = '0px';
            }
        }
        let margin: string = this.position === 'Left' ? elementWidth + 'px' : elementWidth + 'px';
        let eleWidth: Number = this.position === 'Left' ? elementWidth : - (elementWidth);
        removeClass([this.element], [PUSH, OVER, SLIDE]);
        switch (type) {
            case 'Push':
                addClass([this.element], [PUSH]);
                if (sibling && (this.enableDock || this.element.classList.contains(OPEN))) {
                    this.position === 'Left' ? sibling.style.marginLeft = margin : sibling.style.marginRight = margin;

                } break;
            case 'Slide':
                addClass([this.element], [SLIDE]);
                if (sibling && (this.enableDock || this.element.classList.contains(OPEN))) {
                    sibling.style.transform = 'translateX(' + eleWidth + 'px)';
                } break;
            case 'Over':
                addClass([this.element], [OVER]);
                if (this.enableDock && this.element.classList.contains(CLOSE)) {
                    if (sibling) {
                        this.position === 'Left' ? sibling.style.marginLeft = margin : sibling.style.marginRight = margin;
                    }
                }
                break;
            case 'Auto':
                addClass([this.element], [TRASITION]);
                if (Browser.isDevice) {
                    if (sibling && (this.enableDock) && !this.getState()) {
                        this.position === 'Left' ? sibling.style.marginLeft = margin : sibling.style.marginRight = margin;
                        addClass([this.element], PUSH);
                    } else {
                        addClass([this.element], OVER);
                    }
                } else {
                    addClass([this.element], PUSH);
                    if (sibling && (this.enableDock || this.element.classList.contains(OPEN))) {
                        this.position === 'Left' ? sibling.style.marginLeft = margin : sibling.style.marginRight = margin;
                    }
                }
                this.createBackDrop();
        }
    }

    /**
     * Removes the control from the DOM and detaches all its related event handlers. Also it removes the attributes and classes.
     * @returns void
     */
    public destroy(): void {
        super.destroy();
        removeClass([this.element], [OPEN, CLOSE, PUSH, SLIDE, OVER, LEFT, RIGHT, TRASITION]);
        if (this.target) {
            removeClass([this.element], SIDEBARABSOLUTE);
            removeClass([<HTMLElement>this.target], CONTEXT);
        }
        this.destroyBackDrop();
        this.element.style.width = '';
        this.element.style.zIndex = '';
        this.element.style.transform = '';
        this.windowWidth = null;
        (!isNullOrUndefined(this.sidebarEleCopy.getAttribute('tabindex'))) ?
            this.element.setAttribute('tabindex', this.tabIndex) : this.element.removeAttribute('tabindex');
        let sibling: HTMLElement = <HTMLElement>document.querySelector('.e-main-content')
            || (<HTMLElement>this.element.nextElementSibling);
        if (!isNullOrUndefined(sibling)) {
            sibling.style.margin = '';
            sibling.style.transform = '';
        }
        this.unWireEvents();
    }
}
/**
 * Defines the event arguments for the event.
 * @returns void
 */

export interface ChangeEventArgs {
    /**
     * Returns event name
     */
    name: string;
    /**
     * Defines the element.
     */
    element: HTMLElement;
}

export interface TransitionEvent extends Event {
    /**
     * Returns event name
     */
    propertyName: string;
}

export interface EventArgs {
    /**
     * Illustrates whether the current action needs to be prevented or not.
     */
    cancel?: boolean;
    /**
     *  Defines the Sidebar model.
     */
    model?: SidebarModel;
    /**
     * Defines the element.
     */
    element: HTMLElement;
    /** 
     * Defines the boolean that returns true when the Sidebar is closed by user interaction, otherwise returns false.
     */
    isInteracted?: boolean;

    /** 
     * Defines the original event arguments. 
     */
    event?: MouseEvent | Event;
}