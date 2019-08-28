import { Component, EventHandler, Property, Event, EmitType, BaseEventArgs } from '@syncfusion/ej2-base';
import { addClass, removeClass, isVisible, closest, attributes, detach, classList, KeyboardEvents } from '@syncfusion/ej2-base';
import { selectAll, setStyleAttribute as setStyle, KeyboardEventArgs } from '@syncfusion/ej2-base';
import { isNullOrUndefined as isNOU, getUniqueID, formatUnit, Collection, compile as templateCompiler } from '@syncfusion/ej2-base';
import { INotifyPropertyChanged, NotifyPropertyChanges, ChildProperty, Browser } from '@syncfusion/ej2-base';
import { updateBlazorTemplate, resetBlazorTemplate, isBlazor } from '@syncfusion/ej2-base';
import { Popup } from '@syncfusion/ej2-popups';
import { calculatePosition } from '@syncfusion/ej2-popups';
import { Button, IconPosition } from '@syncfusion/ej2-buttons';
import { HScroll } from '../common/h-scroll';
import { VScroll } from '../common/v-scroll';
import { ToolbarModel, ItemModel } from './toolbar-model';
/**
 * Specifies the options for supporting element types of Toolbar command.
 */
export type ItemType = 'Button' | 'Separator' | 'Input';
/**
 * Specifies the options of where the text will be displayed in popup mode of the Toolbar.
 */
export type DisplayMode = 'Both' | 'Overflow' | 'Toolbar';
/**
 * Specifies the options of the Toolbar item display area when the Toolbar content overflows to available space.Applicable to `popup` mode.
 */
export type OverflowOption = 'None' | 'Show' | 'Hide';
/**
 * Specifies the options of Toolbar display mode. Display option is considered when Toolbar content exceeds the available space.
 */
export type OverflowMode = 'Scrollable' | 'Popup' | 'MultiRow' | 'Extended';

type HTEle = HTMLElement;
type Str = string;
type ItmAlign = 'lefts' | 'centers' | 'rights';

export type ItemAlign = 'Left' | 'Center' | 'Right';

const CLS_VERTICAL: Str = 'e-vertical';
const CLS_ITEMS: Str = 'e-toolbar-items';
const CLS_ITEM: Str = 'e-toolbar-item';
const CLS_RTL: Str = 'e-rtl';
const CLS_SEPARATOR: Str = 'e-separator';
const CLS_POPUPICON: Str = 'e-popup-up-icon';
const CLS_POPUPDOWN: Str = 'e-popup-down-icon';
const CLS_POPUPOPEN: Str = 'e-popup-open';
const CLS_TEMPLATE: Str = 'e-template';
const CLS_DISABLE: Str = 'e-overlay';
const CLS_POPUPTEXT: Str = 'e-toolbar-text';
const CLS_TBARTEXT: Str = 'e-popup-text';
const CLS_TBAROVERFLOW: Str = 'e-overflow-show';
const CLS_POPOVERFLOW: Str = 'e-overflow-hide';
const CLS_TBARBTN: Str = 'e-tbar-btn';
const CLS_TBARNAV: Str = 'e-hor-nav';
const CLS_TBARSCRLNAV: Str = 'e-scroll-nav';
const CLS_TBARRIGHT: Str = 'e-toolbar-right';
const CLS_TBARLEFT: Str = 'e-toolbar-left';
const CLS_TBARCENTER: Str = 'e-toolbar-center';
const CLS_TBARPOS: Str = 'e-tbar-pos';
const CLS_HSCROLLCNT: Str = 'e-hscroll-content';
const CLS_VSCROLLCNT: Str = 'e-vscroll-content';
const CLS_POPUPNAV: Str = 'e-hor-nav';
const CLS_POPUPCLASS: Str = 'e-toolbar-pop';
const CLS_POPUP: Str = 'e-toolbar-popup';
const CLS_TBARBTNTEXT: Str = 'e-tbar-btn-text';
const CLS_TBARNAVACT: Str = 'e-nav-active';
const CLS_TBARIGNORE: Str = 'e-ignore';
const CLS_POPPRI: Str = 'e-popup-alone';
const CLS_HIDDEN: string = 'e-hidden';
const CLS_MULTIROW: string = 'e-toolbar-multirow';
const CLS_MULTIROWPOS: string = 'e-multirow-pos';
const CLS_MULTIROW_SEPARATOR: string = 'e-multirow-separator';
const CLS_EXTENDABLE_ITEM: string = 'e-extended-item';
const CLS_EXTENDABLE_SEPARATOR: string = 'e-extended-separator';
const CLS_EXTEANDABLE_TOOLBAR: Str = 'e-extended-toolbar';
const CLS_EXTENDABLECLASS: Str = 'e-toolbar-extended';
const CLS_EXTENDPOPUP: Str = 'e-expended-nav';
const CLS_EXTENDEDPOPOPEN: Str = 'e-tbar-extended';

interface Template {
    appendTo: Function;
}

interface ToolbarItemAlignIn {
    lefts: HTMLElement[];
    centers: HTMLElement[];
    rights: HTMLElement[];
}
export interface ClickEventArgs extends BaseEventArgs {
    /** Defines the current Toolbar Item Object. */
    item: ItemModel;
    /** Defines the current Event arguments. */
    originalEvent: Event;
    /** Defines the prevent action. */
    cancel?: boolean;
}

export interface BeforeCreateArgs extends BaseEventArgs {
    /** Enable or disable the popup collision. */
    enableCollision: boolean;
    scrollStep: number;
}

/**
 * An item object that is used to configure Toolbar commands.
 */
export class Item extends ChildProperty<Item>  {
    /**
     * Specifies the unique ID to be used with button or input element of Toolbar items.
     * @default ""
     */
    @Property('')
    public id: string;
    /**
     * Specifies the text to be displayed on the Toolbar button.
     * @default ""
     */
    @Property('')
    public text: string;
    /**
     * Specifies the width of the Toolbar button commands.
     * @default 'auto'
     */
    @Property('auto')
    public width: number | string;
    /**
     * Defines single/multiple classes (separated by space) to be used for customization of commands.
     * @default ""
     */
    @Property('')
    public cssClass: string;
    /**
     * Defines the priority of items to display it in popup always.
     * It allows to maintain toolbar item on popup always but it does not work for toolbar priority items.
     * @default false
     */
    @Property(false)
    public showAlwaysInPopup: boolean;
    /**
     * Defines single/multiple classes separated by space used to specify an icon for the button.
     * The icon will be positioned before the text content if text is available, otherwise the icon alone will be rendered.
     * @default ""
     */
    @Property('')
    public prefixIcon: string;
    /**
     * Defines single/multiple classes separated by space used to specify an icon for the button.
     * The icon will be positioned after the text content if text is available.
     * @default ""
     */
    @Property('')
    public suffixIcon: string;
    /**
     * Specifies the Toolbar command display area when an element's content is too large to fit available space.
     * This is applicable only to `popup` mode. Possible values are:
     * - Show:  Always shows the item as the primary priority on the *Toolbar*. 
     * - Hide: Always shows the item as the secondary priority on the *popup*.
     * - None: No priority for display, and as per normal order moves to popup when content exceeds.
     * @default 'None'
     */
    @Property('None')
    public overflow: OverflowOption;
    /**
     * Specifies the HTML element/element ID as a string that can be added as a Toolbar command.
     * ```
     * E.g - items: [{ template: '<input placeholder="Search"/>' },{ template: '#checkbox1' }]
     * ```
     * @default ""
     */
    @Property('')
    public template: string | Object;
    /**
     * Specifies the types of command to be rendered in the Toolbar.
     * Supported types are:
     * - Button: Creates the Button control with its given properties like text, prefixIcon, etc.
     * - Separator: Adds a horizontal line that separates the Toolbar commands.
     * - Input: Creates an input element that is applicable to template rendering with Syncfusion controls like DropDownList,
     * AutoComplete, etc.
     * @default 'Button'
     */
    @Property('Button')
    public type: ItemType;
    /**
     * Specifies where the button text will be displayed on *popup mode* of the Toolbar.
     * Possible values are:
     * - Toolbar:  Text will be displayed on *Toolbar* only.
     * - Overflow: Text will be displayed only when content overflows to *popup*.
     * - Both: Text will be displayed on *popup* and *Toolbar*.
     * @default 'Both'
     */
    @Property('Both')
    public showTextOn: DisplayMode;
    /**
     * Defines htmlAttributes used to add custom attributes to Toolbar command.
     * Supports HTML attributes such as style, class, etc.
     * @default null
     */
    @Property(null)
    public htmlAttributes: { [key: string]: string; };
    /**
     * Specifies the text to be displayed on the Toolbar button.
     * @default ""
     */
    @Property('')
    public tooltipText: string;
    /**
     * Specifies the location for aligning Toolbar items on the Toolbar. Each command will be aligned according to the `align` property.
     * Possible values are:
     * - Left: To align commands to the left side of the Toolbar.
     * - Center: To align commands at the center of the Toolbar.
     * - Right: To align commands to the right side of the Toolbar.
     * ```html
     * <div id="element"> </div>
     * ```
     * ```typescript
     * let toolbar: Toolbar = new Toolbar({
     *     items: [
     *         { text: "Home" },
     *         { text: "My Home Page" , align: 'Center' },
     *         { text: "Search", align: 'Right' }
     *         { text: "Settings", align: 'Right' }
     *     ]
     * });
     * toolbar.appendTo('#element');
     * ```
     * @default "Left"
     */
    @Property('Left')
    public align: ItemAlign;
    /**
     * Event triggers when `click` the toolbar item.
     * @event
     * @blazorProperty 'OnClick'
     */
    @Event()
    public click: EmitType<ClickEventArgs>;
}
/**
 * The Toolbar control contains a group of commands that are aligned horizontally.
 * ```html
 * <div id="toolbar"/>
 * <script>
 *   var toolbarObj = new Toolbar();
 *   toolbarObj.appendTo("#toolbar");
 * </script>
 * ```
 */
@NotifyPropertyChanges
export class Toolbar extends Component<HTMLElement> implements INotifyPropertyChanged {
    private trgtEle: HTEle;
    private ctrlTem: HTEle;

    /** @hidden */
    private popObj: Popup;
    /** @hidden */
    private tbarEle: HTMLElement[];
    /** @hidden */
    private tbarAlgEle: ToolbarItemAlignIn;
    /** @hidden */
    private tbarAlign: boolean;
    /** @hidden */
    private tbarEleMrgn: number;
    /** @hidden */
    private tbResize: boolean;
    private offsetWid: number;
    private keyModule: KeyboardEvents;
    private scrollModule: HScroll | VScroll;
    private activeEle: HTEle;
    private popupPriCount: number;
    private tbarItemsCol: ItemModel[];
    private enableCollision: boolean;
    private scrollStep: number;
    private isVertical: boolean;
    private tempId: string[];
    private isExtendedOpen: boolean;
    private resizeContext: EventListenerObject = this.resize.bind(this);

    /**
     * Contains the keyboard configuration of the Toolbar.
     */
    private keyConfigs: { [key: string]: Str } = {
        moveLeft: 'leftarrow',
        moveRight: 'rightarrow',
        moveUp: 'uparrow',
        moveDown: 'downarrow',
        popupOpen: 'enter',
        popupClose: 'escape',
        tab: 'tab',
        home: 'home',
        end: 'end',
    };
    /**
     * An array of items that is used to configure Toolbar commands.
     * @default []
     */
    @Collection<ItemModel>([], Item)
    public items: ItemModel[];
    /**
     * Specifies the width of the Toolbar in pixels/numbers/percentage. Number value is considered as pixels.
     * @default 'auto'
     */
    @Property('auto')
    public width: string | number;
    /**
     * Specifies the height of the Toolbar in pixels/number/percentage. Number value is considered as pixels.
     * @default 'auto'
     */
    @Property('auto')
    public height: string | number;
    /**
     * Specifies the Toolbar display mode when Toolbar content exceeds the viewing area.
     * Possible modes are:
     * - Scrollable: All the elements are displayed in a single line with horizontal scrolling enabled.
     * - Popup: Prioritized elements are displayed on the Toolbar and the rest of elements are moved to the *popup*.
     * - MultiRow: Displays the overflow toolbar items as an in-line of a toolbar.
     * - Extended: Hide the overflowing toolbar items in the next row.  Show the overflowing toolbar items when you click the expand icons.
     * If the popup content overflows the height of the page, the rest of the elements will be hidden.
     * @default 'Scrollable'
     */
    @Property('Scrollable')
    public overflowMode: OverflowMode;
    /**
     * The event will be fired on clicking the Toolbar elements.
     * @event
     * @blazorProperty 'Clicked'
     */
    @Event()
    public clicked: EmitType<ClickEventArgs>;
    /**
     * The event will be fired when the control is rendered.
     * @event
     * @blazorProperty 'Created'
     */
    @Event()
    public created: EmitType<Event>;
    /**
     * The event will be fired when the control gets destroyed.
     * @event
     * @blazorProperty 'Destroyed'
     */
    @Event()
    public destroyed: EmitType<Event>;
    /**
     * The event will be fired before the control is rendered on a page.
     * @event
     * @blazorProperty 'OnCreate'
     */
    @Event()
    public beforeCreate: EmitType<BeforeCreateArgs>;
    /**
     * Removes the control from the DOM and also removes all its related events.
     * @returns void.
     */
    public destroy(): void {
        let ele: HTEle = this.element;
        super.destroy();
        this.unwireEvents();
        this.tempId.forEach((ele: Str): void => {
            if (!isNOU(this.element.querySelector(ele))) {
              (<HTEle>document.body.appendChild(this.element.querySelector(ele))).style.display = 'none'; }
          });
        while (ele.firstElementChild) {
            ele.removeChild(ele.firstElementChild);
        }
        if (this.trgtEle) {
            ele.appendChild(this.ctrlTem);
        }
        this.clearProperty();
        this.popObj = null;
        this.tbarAlign = null;
        this.remove(this.element, 'e-toolpop');
        ele.removeAttribute('style');
        ['aria-disabled', 'aria-orientation', 'aria-haspopup', 'role'].forEach((attrb: string): void => {
            this.element.removeAttribute(attrb);
        });
    }
    /**
     * Initialize the event handler
     * @private
     */
    protected preRender(): void {
        let eventArgs: BeforeCreateArgs = { enableCollision: true, scrollStep: this.scrollStep };
        this.trigger('beforeCreate', eventArgs);
        this.enableCollision = eventArgs.enableCollision;
        this.scrollStep = eventArgs.scrollStep;
        this.scrollModule = null;
        this.popObj = null;
        this.tempId = [];
        this.tbarItemsCol = this.items;
        this.isVertical = this.element.classList.contains(CLS_VERTICAL) ? true : false;
        this.isExtendedOpen = false;
        this.popupPriCount = 0;
        if (this.enableRtl) {
            this.add(this.element, CLS_RTL);
        }
    }
    /**
     * Initializes a new instance of the Toolbar class.
     * @param options  - Specifies Toolbar model properties as options.
     * @param element  - Specifies the element that is rendered as a Toolbar.
     */
    constructor(options?: ToolbarModel, element?: string | HTMLElement) {
        super(options, <HTEle | Str>element);
    }
    private wireEvents(): void {
        EventHandler.add(this.element, 'click', this.clickHandler, this);
        window.addEventListener('resize', this.resizeContext);
        this.keyModule = new KeyboardEvents(
            this.element,
            {
                keyAction: this.keyActionHandler.bind(this),
                keyConfigs: this.keyConfigs
            });
        EventHandler.add(this.element, 'keydown', this.docKeyDown, this);
        this.element.setAttribute('tabIndex', '0');
    }
    private docKeyDown(e: KeyboardEvent): void {
        if ((<HTEle>e.target).tagName === 'INPUT') { return; }
        let popCheck: boolean = !isNOU(this.popObj) && isVisible(this.popObj.element) && this.overflowMode !== 'Extended';
        if (e.keyCode === 9 && (<HTEle>e.target).classList.contains('e-hor-nav') === true && popCheck) {
            this.popObj.hide({ name: 'FadeOut', duration: 100 });
        }
        let keyCheck: boolean = (e.keyCode === 40 || e.keyCode === 38 || e.keyCode === 35 || e.keyCode === 36);
        if (keyCheck) {
            e.preventDefault();
        }
    }
    private unwireEvents(): void {
        EventHandler.remove(this.element, 'click', this.clickHandler);
        this.destroyScroll();
        this.keyModule.destroy();
        window.removeEventListener('resize', this.resizeContext);
        EventHandler.remove(document, 'scroll', this.docEvent);
        EventHandler.remove(this.element, 'keydown', this.docKeyDown);
        EventHandler.remove(document, 'click', this.docEvent);
    }
    private clearProperty(): void {
        this.tbarEle = [];
        this.tbarAlgEle = { lefts: [], centers: [], rights: [] };
    }
    private docEvent(e: Event): void {
        let popEle: Element = closest(<Element>e.target, '.e-popup');
        if (this.popObj && isVisible(this.popObj.element) && !popEle && this.overflowMode === 'Popup') {
            this.popObj.hide({ name: 'FadeOut', duration: 100 });
        }
    }
    private destroyScroll(): void {
        if (this.scrollModule) {
            if (this.tbarAlign) { this.add(this.scrollModule.element, CLS_TBARPOS); }
            this.scrollModule.destroy(); this.scrollModule = null;
        }
    }
    private destroyItems(): void {
        [].slice.call(this.element.querySelectorAll('.' + CLS_ITEM)).forEach((el: HTEle) => {
            detach(el);
        });
        let tbarItems: HTEle = <HTEle>this.element.querySelector('.' + CLS_ITEMS);
        if (this.tbarAlign) {
            [].slice.call(tbarItems.children).forEach((el: HTEle) => {
                detach(el);
            });
            this.tbarAlign = false;
            this.remove(tbarItems, CLS_TBARPOS);
        }
        this.clearProperty();
    }
    private destroyMode(): void {
        if (this.scrollModule) {
            this.remove(this.scrollModule.element, CLS_RTL);
            this.destroyScroll();
        }
        this.remove(this.element, CLS_EXTENDEDPOPOPEN);
        this.remove(this.element, CLS_EXTEANDABLE_TOOLBAR);
        let tempEle: HTMLElement = this.element.querySelector('.e-toolbar-multirow');
        if (tempEle) { this.remove(tempEle, CLS_MULTIROW); }
        if (this.popObj) {
            this.popupRefresh(this.popObj.element, true);
        }
    }
    private add(ele: HTEle, val: Str): void {
        ele.classList.add(val);
    }
    private remove(ele: HTEle, val: Str): void {
        ele.classList.remove(val);
    }
    private elementFocus(ele: HTEle): void {
        let fChild: HTEle = <HTEle>ele.firstElementChild;
        if (fChild) {
            fChild.focus();
            this.activeEleSwitch(ele);
        } else {
            ele.focus();
        }
    }
    private clstElement(tbrNavChk: Boolean, trgt: HTEle): HTEle {
        let clst: HTEle;
        if (tbrNavChk && this.popObj && isVisible(this.popObj.element)) {
            clst = <HTEle>this.popObj.element.querySelector('.' + CLS_ITEM);
        } else if (this.element === trgt || tbrNavChk) {
            // tslint:disable-next-line:max-line-length
            clst = <HTEle>this.element.querySelector('.' + CLS_ITEM + ':not(.' + CLS_DISABLE + ' ):not(.' + CLS_SEPARATOR + ' ):not(.' + CLS_HIDDEN + ' )');
        } else {
            clst = <HTEle>closest(trgt, '.' + CLS_ITEM);
        }
        return clst;
    }
    private keyHandling(clst: HTEle, e: KeyboardEventArgs, trgt: HTEle, navChk: Boolean, scrollChk: Boolean): void {
        let popObj: Popup = this.popObj;
        let rootEle: HTEle = this.element;
        let popAnimate: Object = { name: 'FadeOut', duration: 100 };
        switch (e.action) {
            case 'moveRight':
                if (this.isVertical) { return; }
                if (rootEle === trgt) {
                    this.elementFocus(clst);
                } else if (!navChk) {
                    this.eleFocus(clst, 'next');
                }
                break;
            case 'moveLeft':
                if (this.isVertical) { return; }
                if (!navChk) {
                    this.eleFocus(clst, 'previous');
                }
                break;
            case 'home':
            case 'end':
                let ele: HTEle;
                let nodes: NodeList;
                if (clst) {
                    let popupCheck: HTEle = <HTEle>closest(clst, '.e-popup');
                    if (popupCheck) {
                        if (isVisible(this.popObj.element)) {
                            nodes = [].slice.call(popupCheck.children);
                            if (e.action === 'home') {
                                ele = <HTEle>nodes[0];
                            } else {
                                ele = <HTEle>nodes[nodes.length - 1];
                            }
                        }
                    } else {
                        nodes = this.element.querySelectorAll('.' + CLS_ITEMS + ' .' + CLS_ITEM);
                        if (e.action === 'home') {
                            ele = <HTEle>nodes[0];
                        } else {
                            ele = <HTEle>nodes[nodes.length - 1];
                        }
                    }
                    if (ele) {
                        this.elementFocus(ele);
                    }
                }
                break;
            case 'moveUp':
            case 'moveDown':
                let value: Str = e.action === 'moveUp' ? 'previous' : 'next';
                if (!this.isVertical) {
                    if (popObj && closest(trgt, '.e-popup')) {
                        let popEle: HTEle = popObj.element;
                        let popFrstEle: HTEle = popEle.firstElementChild as HTEle;
                        if ((value === 'previous' && popFrstEle === clst) || (value === 'next' && popEle.lastElementChild === clst)) {
                            return;
                        } else {
                            this.eleFocus(clst, value);
                        }
                    } else if (e.action === 'moveDown' && popObj && isVisible(popObj.element)) {
                        this.elementFocus(clst);
                    }
                } else {
                    if (e.action === 'moveUp') {
                        this.eleFocus(clst, 'previous');
                    } else {
                        this.eleFocus(clst, 'next');
                    }
                }
                break;
            case 'tab':
                if (!scrollChk && !navChk) {
                    let ele: HTEle = (<HTEle>clst.firstElementChild);
                    if (rootEle === trgt) {
                        if (this.activeEle) {
                            this.activeEle.focus();
                        } else {
                            this.activeEleRemove(ele);
                            ele.focus();
                        }
                        this.element.removeAttribute('tabindex');
                    }
                }
                break;
            case 'popupClose':
                if (popObj && this.overflowMode !== 'Extended') {
                    popObj.hide(popAnimate);
                }
                break;
            case 'popupOpen':
                if (!navChk) { return; }
                if (popObj && !isVisible(popObj.element)) {
                    popObj.element.style.top = rootEle.offsetHeight + 'px';
                    popObj.show({ name: 'FadeIn', duration: 100 });
                } else {
                    popObj.hide(popAnimate);
                }
                break;
        }
    }
    private keyActionHandler(e: KeyboardEventArgs): void {
        let trgt: HTEle = <HTEle>e.target;
        if (trgt.tagName === 'INPUT' || trgt.tagName === 'TEXTAREA' || this.element.classList.contains(CLS_DISABLE)) {
            return;
        }
        e.preventDefault();
        let clst: HTEle;
        let tbrNavChk: boolean = trgt.classList.contains(CLS_TBARNAV);
        let tbarScrollChk: boolean = trgt.classList.contains(CLS_TBARSCRLNAV);
        clst = this.clstElement(tbrNavChk, trgt);
        if (clst || tbarScrollChk) {
            this.keyHandling(clst, e, trgt, tbrNavChk, tbarScrollChk);
        }
    }
    /**
     * Specifies the value to disable/enable the Toolbar component.
     * When set to `true`, the component will be disabled.
     * @param  {boolean} value - Based on this Boolean value, Toolbar will be enabled (false) or disabled (true).
     * @returns void.
     */
    public disable(value: boolean): void {
        let rootEle: HTMLElement = this.element;
        value ? rootEle.classList.add(CLS_DISABLE) : rootEle.classList.remove(CLS_DISABLE);
        rootEle.setAttribute('tabindex', !value ? '0' : '-1');
        if (this.activeEle) {
          this.activeEle.setAttribute('tabindex', !value ? '0' : '-1'); }
        if (this.scrollModule) {
          this.scrollModule.disable(value); }
        if (this.popObj) {
            if (isVisible(this.popObj.element) && this.overflowMode !== 'Extended') {
                this.popObj.hide(); }
            rootEle.querySelector('#' + rootEle.id + '_nav').setAttribute('tabindex', !value ? '0' : '-1');
        }
    }
    private eleContains(el: HTEle): string | boolean {
        // tslint:disable-next-line:max-line-length
        return el.classList.contains(CLS_SEPARATOR) || el.classList.contains(CLS_DISABLE) || el.getAttribute('disabled') || el.classList.contains(CLS_HIDDEN) || !isVisible(el);
        // tslint:enable-next-line:max-line-length
    }
    private eleFocus(closest: HTEle, pos: Str): void {
        let sib: HTEle = Object(closest)[pos + 'ElementSibling'];
        if (sib) {
            let skipEle: string | boolean = this.eleContains(sib);
            if (skipEle) {
                this.eleFocus(sib, pos); return;
            }
            this.elementFocus(sib);
        } else if (this.tbarAlign) {
            let elem: HTEle = Object(closest.parentElement)[pos + 'ElementSibling'] as HTEle;
            if (!isNOU(elem) && elem.children.length === 0) {
                elem = Object(elem)[pos + 'ElementSibling'] as HTEle;
            }
            if (!isNOU(elem) && elem.children.length > 0) {
                if (pos === 'next') {
                    let el: HTEle = <HTEle>elem.querySelector('.' + CLS_ITEM);
                    if (this.eleContains(el)) {
                        this.eleFocus(el, pos);
                    } else {
                        (<HTEle>el.firstElementChild).focus();
                        this.activeEleSwitch(el);
                    }
                } else {
                    let el: HTEle = <HTEle>elem.lastElementChild;
                    if (this.eleContains(el)) {
                        this.eleFocus(el, pos);
                    } else {
                        this.elementFocus(el);
                    }
                }
            }
        }
    }
    private clickHandler(e: Event): void {
        let trgt: HTEle = <HTEle>e.target;
        let clsList: DOMTokenList = trgt.classList;
        let ele: HTEle = this.element;
        let isPopupElement: boolean = !isNOU(closest(trgt, '.' + CLS_POPUPCLASS));
        let popupNav: HTEle = <HTEle>closest(trgt, ('.' + CLS_TBARNAV));
        if (!popupNav) {
            popupNav = trgt;
        }
        if (!ele.children[0].classList.contains('e-hscroll') && !ele.children[0].classList.contains('e-vscroll')
            && (clsList.contains(CLS_TBARNAV))) {
            clsList = trgt.querySelector('.e-icons').classList;
        }
        if (clsList.contains(CLS_POPUPICON) || clsList.contains(CLS_POPUPDOWN)) {
            this.popupClickHandler(ele, popupNav, CLS_RTL);
        }
        let itemObj: ItemModel;
        let clst: HTEle = <HTEle>closest(<Node>e.target, '.' + CLS_ITEM);
        if ((isNOU(clst) || clst.classList.contains(CLS_DISABLE)) && !popupNav.classList.contains(CLS_TBARNAV)) {
            return;
        }
        if (clst) {
            itemObj = this.items[this.tbarEle.indexOf(clst)];
        }
        let eventArgs: ClickEventArgs = { originalEvent: e, item: itemObj };
        if (itemObj && !isNOU(itemObj.click)) {
            this.trigger('items[' + this.tbarEle.indexOf(clst) + '].click', eventArgs);
        }
        if (!eventArgs.cancel) {
            this.trigger('clicked', eventArgs, (clickedArgs: ClickEventArgs) => {
                if (!isNOU(this.popObj) && isPopupElement && !clickedArgs.cancel && this.overflowMode === 'Popup') {
                    this.popObj.hide({ name: 'FadeOut', duration: 100 });
                }
            });
        }
    };
    private popupClickHandler(ele: HTMLElement, popupNav: HTMLElement, CLS_RTL: Str): void {
        let popObj: Popup = this.popObj;
        if (isVisible(popObj.element)) {
            popupNav.classList.remove(CLS_TBARNAVACT);
            popObj.hide({ name: 'FadeOut', duration: 100 });
        } else {
            if (ele.classList.contains(CLS_RTL)) {
                popObj.enableRtl = true;
                popObj.position = { X: 'left', Y: 'top' };
            }
            if (popObj.offsetX === 0 && !ele.classList.contains(CLS_RTL)) {
                popObj.enableRtl = false;
                popObj.position = { X: 'right', Y: 'top' };
            }
            popObj.dataBind();
            popObj.refreshPosition();
            popObj.element.style.top = this.getElementOffsetY() + 'px';
            if (this.overflowMode === 'Extended') { popObj.element.style.minHeight = '0px'; }
            popupNav.classList.add(CLS_TBARNAVACT);
            popObj.show({ name: 'FadeIn', duration: 100 });
        }
    }
    /**
     * To Initialize the control rendering
     * @private
     */
    protected render(): void {
        this.initialize();
        this.renderControl();
        this.separator();
        this.refreshToolbarTemplate();
        this.wireEvents();
        if (isBlazor()) {
            this.renderComplete();
        }
    }
    private initialize(): void {
        let width: Str = formatUnit(this.width);
        let height: Str = formatUnit(this.height);
        if (Browser.info.name !== 'msie' || this.height !== 'auto' || this.overflowMode === 'MultiRow') {
            setStyle(this.element, { 'height': height });
        }
        setStyle(this.element, { 'width': width });
        let ariaAttr: { [key: string]: Str } = {
            'role': 'toolbar', 'aria-disabled': 'false', 'aria-haspopup': 'false',
            'aria-orientation': !this.isVertical ? 'horizontal' : 'vertical',
        };
        attributes(this.element, ariaAttr);
    }
    private renderControl(): void {
        this.trgtEle = (this.element.children.length > 0) ? <HTEle>this.element.querySelector('div') : null;
        this.tbarAlgEle = { lefts: [], centers: [], rights: [] };
        this.renderItems();
        this.renderOverflowMode();
        if (this.tbarAlign) { this.itemPositioning(); }
        if (this.popObj && this.popObj.element.childElementCount > 1 && this.checkPopupRefresh(this.element, this.popObj.element)) {
            this.popupRefresh(this.popObj.element, false);
        }
    }
    /** @hidden */
    public changeOrientation(): void {
        let ele: HTEle = this.element;
        if (this.isVertical) {
            ele.classList.remove(CLS_VERTICAL);
            this.isVertical = false;
            if (this.height === 'auto' || this.height === '100%') {
                ele.style.height = this.height; }
            ele.setAttribute('aria-orientation', 'horizontal');
        } else {
            ele.classList.add(CLS_VERTICAL);
            this.isVertical = true;
            ele.setAttribute('aria-orientation', 'vertical');
            setStyle(this.element, { 'height': formatUnit(this.height), 'width': formatUnit(this.width) });
        }
        this.destroyMode();
        this.refreshOverflow();
    }
    private initScroll(element: HTEle, innerItems: NodeList): void {
        if (!this.scrollModule && this.checkOverflow(element, <HTEle>innerItems[0])) {
            if (this.tbarAlign) {
                this.element.querySelector('.' + CLS_ITEMS + ' .' + CLS_TBARCENTER).removeAttribute('style');
            }
            if (this.isVertical) {
                this.scrollModule = new VScroll({ scrollStep: this.scrollStep, enableRtl: this.enableRtl }, <HTEle>innerItems[0]);
            } else {
                this.scrollModule = new HScroll({ scrollStep: this.scrollStep, enableRtl: this.enableRtl }, <HTEle>innerItems[0]);
            }
            this.remove(this.scrollModule.element, CLS_TBARPOS);
            setStyle(this.element, { overflow: 'hidden' });
        }
    }
    private itemWidthCal(items: HTEle): number {
        let width: number = 0;
        let style: CSSStyleDeclaration;
        [].slice.call(selectAll('.' + CLS_ITEM, items)).forEach((el: HTEle) => {
            if (isVisible(el)) {
                style = window.getComputedStyle(el);
                width += this.isVertical ? el.offsetHeight : el.offsetWidth;
                width += parseFloat(this.isVertical ? style.marginTop : style.marginRight);
                width += parseFloat(this.isVertical ? style.marginBottom : style.marginLeft);
            }
        });
        return width;
    }
    private getScrollCntEle(innerItem: HTEle): HTEle {
        let trgClass: Str = (this.isVertical) ? '.e-vscroll-content' : '.e-hscroll-content';
        return <HTEle>innerItem.querySelector(trgClass);
    }
    private checkOverflow(element: HTEle, innerItem: HTEle): boolean {
        if (isNOU(element) || isNOU(innerItem) || !isVisible(element)) {
            return false;
        }
        let eleWidth: number = this.isVertical ? element.offsetHeight : element.offsetWidth;
        let itemWidth: number = this.isVertical ? innerItem.offsetHeight : innerItem.offsetWidth;
        if (this.tbarAlign || this.scrollModule || (eleWidth === itemWidth)) {
            itemWidth = this.itemWidthCal(this.scrollModule ? this.getScrollCntEle(innerItem) : innerItem);
        }
        let popNav: HTEle = <HTEle>element.querySelector('.' + CLS_TBARNAV);
        let scrollNav: HTEle = <HTEle>element.querySelector('.' + CLS_TBARSCRLNAV);
        let navEleWidth: number = 0;
        if (popNav) {
          navEleWidth = this.isVertical ? popNav.offsetHeight : popNav.offsetWidth;
         } else if (scrollNav) {
           navEleWidth = this.isVertical ? (scrollNav.offsetHeight * (2)) : (scrollNav.offsetWidth * 2);
        }
        if (itemWidth > eleWidth - navEleWidth) {
            return true;
        } else { return false; }
    }
    /**
     * Refresh the whole Toolbar component without re-rendering.
     * - It is used to manually refresh the Toolbar overflow modes such as scrollable, popup, multi row, and extended.
     * - It will refresh the Toolbar component after loading items dynamically.
     * @returns void.
     */
    public refreshOverflow(): void {
        this.resize();
    }
    private toolbarAlign(innerItems: HTEle): void {
        if (this.tbarAlign) {
            this.add(innerItems, CLS_TBARPOS);
            this.itemPositioning();
        }
    }
    private renderOverflowMode(): void {
        let ele: HTEle = this.element;
        let innerItems: HTEle = <HTEle>ele.querySelector('.' + CLS_ITEMS);
        let priorityCheck: boolean = this.popupPriCount > 0;
        if (ele && ele.children.length > 0) {
            this.offsetWid = ele.offsetWidth;
            this.remove(this.element, 'e-toolpop');
            if (Browser.info.name === 'msie' && this.height === 'auto') {
                ele.style.height = '';
            }
            switch (this.overflowMode) {
                case 'Scrollable':
                    if (isNOU(this.scrollModule)) {
                      this.initScroll(ele, ele.getElementsByClassName(CLS_ITEMS)); }
                    break;
                case 'Popup':
                    this.add(this.element, 'e-toolpop');
                    if (this.tbarAlign) { this.removePositioning(); }
                    if (this.checkOverflow(ele, innerItems) || priorityCheck) {
                        this.createPopupEle(ele, [].slice.call(selectAll('.' + CLS_ITEMS + ' .' + CLS_ITEM, ele)));
                        this.element.querySelector('.' + CLS_TBARNAV).setAttribute('tabIndex', '0');
                    }
                    this.toolbarAlign(innerItems);
                    break;
                case 'MultiRow':
                    this.add(innerItems, CLS_MULTIROW);
                    if (this.checkOverflow(ele, innerItems) && this.tbarAlign) {
                        this.removePositioning();
                        this.add(innerItems, CLS_MULTIROWPOS);
                    }
                    if (ele.style.overflow === 'hidden') {
                        ele.style.overflow = '';
                    }
                    if (Browser.info.name === 'msie' || ele.style.height !== 'auto') {
                        ele.style.height = 'auto';
                    }
                    break;
                case 'Extended':
                    this.add(this.element, CLS_EXTEANDABLE_TOOLBAR);
                    if (this.checkOverflow(ele, innerItems) || priorityCheck) {
                        if (this.tbarAlign) {
                            this.removePositioning();
                        }
                        this.createPopupEle(ele, [].slice.call(selectAll('.' + CLS_ITEMS + ' .' + CLS_ITEM, ele)));
                        this.element.querySelector('.' + CLS_TBARNAV).setAttribute('tabIndex', '0');
                    }
                    this.toolbarAlign(innerItems);
            }
        }
    }

    private separator(): void {
        let element: HTEle = this.element;
        let eleItem: HTEle[] = [].slice.call(element.querySelectorAll('.' + CLS_SEPARATOR));
        let eleInlineItem: HTEle;
        let multiVar: HTEle = element.querySelector('.' + CLS_MULTIROW_SEPARATOR) as HTEle;
        let extendVar: HTEle = element.querySelector('.' + CLS_EXTENDABLE_SEPARATOR) as HTEle;
        eleInlineItem = this.overflowMode === 'MultiRow' ? multiVar : extendVar;
        if (eleInlineItem !== null) {
            if (this.overflowMode === 'MultiRow') {
                eleInlineItem.classList.remove(CLS_MULTIROW_SEPARATOR);
            } else if (this.overflowMode === 'Extended') {
                eleInlineItem.classList.remove(CLS_EXTENDABLE_SEPARATOR);
            }
        }
        for (let i: number = 0; i <= eleItem.length - 1; i++) {
            if (eleItem[i].offsetLeft < 30 && eleItem[i].offsetLeft !== 0) {
                if (this.overflowMode === 'MultiRow') {
                    eleItem[i].classList.add(CLS_MULTIROW_SEPARATOR);
                } else if (this.overflowMode === 'Extended') {
                    eleItem[i].classList.add(CLS_EXTENDABLE_SEPARATOR);
                }
            }
        }
    }

    private createPopupEle(ele: HTMLElement, innerEle: HTMLElement[]): void {
        let innerNav: HTEle = <HTEle>ele.querySelector('.' + CLS_TBARNAV);
        let vertical: boolean = this.isVertical;
        if (!innerNav) {
            this.createPopupIcon(ele);
        }
        innerNav = <HTEle>ele.querySelector('.' + CLS_TBARNAV);
        let innerNavDom: number = (vertical ? innerNav.offsetHeight : innerNav.offsetWidth);
        let eleWidth: number = ((vertical ? ele.offsetHeight : ele.offsetWidth) - (innerNavDom));
        this.element.classList.remove('e-rtl');
        setStyle(this.element, { direction: 'initial' });
        this.checkPriority(ele, innerEle, eleWidth, true);
        if (this.enableRtl) {
            this.element.classList.add('e-rtl'); }
        this.element.style.removeProperty('direction');
        this.createPopup();
    }
    private pushingPoppedEle(tbarObj: Toolbar, popupPri: Element[], ele: HTEle, eleHeight: number, sepHeight: number): void {
        let element: HTEle = tbarObj.element;
        let nodes: HTEle[] = selectAll('.' + CLS_TBAROVERFLOW, ele);
        let nodeIndex: number = 0;
        let poppedEle: HTEle[] = [].slice.call(selectAll('.' + CLS_POPUP, element.querySelector('.' + CLS_ITEMS)));
        let nodePri: number = 0;
        poppedEle.forEach((el: HTEle, index: number) => {
            nodes = selectAll('.' + CLS_TBAROVERFLOW, ele);
            if (el.classList.contains(CLS_TBAROVERFLOW) && nodes.length > 0) {
                if (tbarObj.tbResize && nodes.length > index) {
                    ele.insertBefore(el, nodes[index]); ++nodePri;
                } else { ele.insertBefore(el, ele.children[nodes.length]); ++nodePri; }
            } else if (el.classList.contains(CLS_TBAROVERFLOW)) {
                ele.insertBefore(el, ele.firstChild); ++nodePri;
            } else if (tbarObj.tbResize && el.classList.contains(CLS_POPOVERFLOW) && ele.children.length > 0 && nodes.length === 0) {
                ele.insertBefore(el, ele.firstChild); ++nodePri;
            } else if (el.classList.contains(CLS_POPOVERFLOW)) {
                popupPri.push(el);
            } else if (tbarObj.tbResize) {
                ele.insertBefore(el, ele.childNodes[nodeIndex + nodePri]);
                ++nodeIndex;
            } else {
                ele.appendChild(el);
            }
            if (el.classList.contains(CLS_SEPARATOR)) {
                setStyle(el, { display: '', height: sepHeight + 'px' });
            } else {
                setStyle(el, { display: '', height: eleHeight + 'px' });
            }
        });
        popupPri.forEach((el: Element) => {
            ele.appendChild(el);
        });
        let tbarEle: HTEle[] = selectAll('.' + CLS_ITEM, element.querySelector('.' + CLS_ITEMS));
        for (let i: number = tbarEle.length - 1; i >= 0; i--) {
            let tbarElement: HTEle = tbarEle[i];
            if (tbarElement.classList.contains(CLS_SEPARATOR) && this.overflowMode !== 'Extended') {
                setStyle(tbarElement, { display: 'none' });
            } else {
                break;
            }
        }
    }
    private createPopup(): void {
        let element: HTEle = this.element;
        let eleHeight: number;
        let eleItem: Element;
        let sepHeight: number;
        let sepItem: Element;
        if (this.overflowMode === 'Extended') {
            sepItem = element.querySelector('.' + CLS_SEPARATOR + ':not(.' + CLS_POPUP + ')');
            sepHeight = (element.style.height === 'auto' || element.style.height === '') ? null : (sepItem as HTEle).offsetHeight;
        }
        eleItem = element.querySelector('.' + CLS_ITEM + ':not(.' + CLS_SEPARATOR + '):not(.' + CLS_POPUP + ')');
        eleHeight = (element.style.height === 'auto' || element.style.height === '') ? null : (eleItem && (eleItem as HTEle).offsetHeight);
        let ele: HTEle;
        let popupPri: Element[] = [];
        if (element.querySelector('#' + element.id + '_popup.' + CLS_POPUPCLASS)) {
            ele = <HTEle>element.querySelector('#' + element.id + '_popup.' + CLS_POPUPCLASS);
        } else {
            let extendEle: HTEle = this.createElement('div', {
                id: element.id + '_popup', className: CLS_POPUPCLASS + ' ' + CLS_EXTENDABLECLASS
            });
            let popupEle: HTEle = this.createElement('div', { id: element.id + '_popup', className: CLS_POPUPCLASS });
            ele = this.overflowMode === 'Extended' ? extendEle : popupEle;
        }
        this.pushingPoppedEle(this, popupPri, ele, eleHeight, sepHeight);
        this.popupInit(element, ele);
    }
    private getElementOffsetY(): number {
        return (this.overflowMode === 'Extended' && window.getComputedStyle(this.element).getPropertyValue('box-sizing') === 'border-box' ?
            this.element.clientHeight : this.element.offsetHeight);
    }
    private popupInit(element: HTEle, ele: HTEle): void {
        if (!this.popObj) {
            element.appendChild(ele);
            setStyle(this.element, { overflow: '' });
            let eleStyles: CSSStyleDeclaration = window.getComputedStyle(this.element);
            let popup: Popup = new Popup(null, {
                relateTo: this.element,
                offsetY: (this.isVertical) ? 0 : this.getElementOffsetY(),
                enableRtl: this.enableRtl,
                open: this.popupOpen.bind(this),
                close: this.popupClose.bind(this),
                collision: { Y: this.enableCollision ? 'flip' : 'none' },
                position: this.enableRtl ? { X: 'left', Y: 'top' } : { X: 'right', Y: 'top' }
            });
            popup.appendTo(ele);
            if (this.overflowMode === 'Extended') {
                popup.width = parseFloat(eleStyles.width) + ((parseFloat(eleStyles.borderRightWidth)) * 2);
                popup.offsetX = 0; }
            EventHandler.add(document, 'scroll', this.docEvent.bind(this));
            EventHandler.add(document, 'click ', this.docEvent.bind(this));
            popup.element.style.maxHeight = popup.element.offsetHeight + 'px';
            if (this.isVertical) { popup.element.style.visibility = 'hidden'; }
            if (this.isExtendedOpen) {
                let popupNav: HTEle = this.element.querySelector('.' + CLS_TBARNAV);
                popupNav.classList.add(CLS_TBARNAVACT);
                classList(popupNav.firstElementChild, [CLS_POPUPICON], [CLS_POPUPDOWN]);
                this.element.querySelector('.' + CLS_EXTENDABLECLASS).classList.add(CLS_POPUPOPEN);
            } else {
                popup.hide();
            }
            this.popObj = popup;
            this.element.setAttribute('aria-haspopup', 'true');
        } else {
            let popupEle: HTEle = this.popObj.element;
            setStyle(popupEle, { maxHeight: '', display: 'block' });
            setStyle(popupEle, { maxHeight: popupEle.offsetHeight + 'px', display: '' });
        }
    }
    private tbarPopupHandler(isOpen: boolean): void {
        if (this.overflowMode === 'Extended') {
          isOpen ? this.add(this.element, CLS_EXTENDEDPOPOPEN) : this.remove(this.element, CLS_EXTENDEDPOPOPEN);
        }
    }
    private popupOpen(e: Event): void {
        let popObj: Popup = this.popObj;
        if (!this.isVertical) {
            popObj.offsetY = this.getElementOffsetY();
            popObj.dataBind();
        }
        let popupEle: HTEle = this.popObj.element;
        let toolEle: HTEle = this.popObj.element.parentElement;
        let popupNav: HTEle = <HTEle>toolEle.querySelector('.' + CLS_TBARNAV);
        setStyle(popObj.element, { height: 'auto', maxHeight: '' });
        popObj.element.style.maxHeight = popObj.element.offsetHeight + 'px';
        if (this.overflowMode === 'Extended') { popObj.element.style.minHeight = ''; }
        let popupElePos: number = popupEle.offsetTop + popupEle.offsetHeight + calculatePosition(toolEle).top;
        let popIcon: Element = (popupNav.firstElementChild as Element);
        popupNav.classList.add(CLS_TBARNAVACT);
        classList(popIcon, [CLS_POPUPICON], [CLS_POPUPDOWN]);
        this.tbarPopupHandler(true);
        let scrollVal: number = isNOU(window.scrollY) ? 0 : window.scrollY;
        if (!this.isVertical && ((window.innerHeight + scrollVal) < popupElePos) && (this.element.offsetTop < popupEle.offsetHeight)) {
            let overflowHeight: number = (popupEle.offsetHeight - ((popupElePos - window.innerHeight - scrollVal) + 5));
            popObj.height = overflowHeight + 'px';
            for (let i: number = 0; i <= popupEle.childElementCount; i++) {
                let ele: HTEle = <HTEle>popupEle.children[i];
                if (ele.offsetTop + ele.offsetHeight > overflowHeight) {
                    overflowHeight = ele.offsetTop;
                    break;
                }
            }
            setStyle(popObj.element, { maxHeight: overflowHeight + 'px' });
        } else if (this.isVertical) {
            let tbEleData: ClientRect = this.element.getBoundingClientRect();
            setStyle(popObj.element, { maxHeight: (tbEleData.top + this.element.offsetHeight) + 'px', bottom: 0, visibility: '' });
        }
    }

    private popupClose(e: Event): void {
        let element: HTEle = this.element;
        let popupNav: HTEle = <HTEle>element.querySelector('.' + CLS_TBARNAV);
        let popIcon: Element = (popupNav.firstElementChild as Element);
        popupNav.classList.remove(CLS_TBARNAVACT);
        classList(popIcon, [CLS_POPUPDOWN], [CLS_POPUPICON]);
        this.tbarPopupHandler(false);
    }
    private checkPriority(ele: HTEle, inEle: HTEle[], eleWidth: number, pre: boolean): void {
        let popPriority: boolean = this.popupPriCount > 0;
        let len: number = inEle.length;
        let eleWid: number = eleWidth;
        let eleOffset: number;
        let checkoffset: boolean;
        let sepCheck: number = 0; let itemCount: number = 0; let itemPopCount: number = 0;
        let checkClass: Function = (ele: HTEle, val: Str[]) => {
            let rVal: Boolean = false;
            val.forEach((cls: string) => {
                if (ele.classList.contains(cls)) {
                    rVal = true;
                }
            });
            return rVal;
        };
        for (let i: number = len - 1; i >= 0; i--) {
            let mrgn: number;
            let compuStyle: CSSStyleDeclaration = window.getComputedStyle(inEle[i]);
            if (this.isVertical) {
                mrgn = parseFloat((compuStyle).marginTop);
                mrgn += parseFloat((compuStyle).marginBottom);
            } else {
                mrgn = parseFloat((compuStyle).marginRight);
                mrgn += parseFloat((compuStyle).marginLeft);
            }
            let fstEleCheck: Boolean = inEle[i] === this.tbarEle[0];
            if (fstEleCheck) { this.tbarEleMrgn = mrgn; }
            eleOffset = this.isVertical ? inEle[i].offsetHeight : inEle[i].offsetWidth;
            let eleWid: number = fstEleCheck ? (eleOffset + mrgn) : eleOffset;
            if (checkClass(inEle[i], [CLS_POPPRI]) && popPriority) {
                inEle[i].classList.add(CLS_POPUP);
                if (this.isVertical) {
                    setStyle(inEle[i], { display: 'none', minHeight: eleWid + 'px' });
                } else {
                    setStyle(inEle[i], { display: 'none', minWidth: eleWid + 'px' }); }
                itemPopCount++;
            }
            if (this.isVertical) {
                checkoffset = (inEle[i].offsetTop + inEle[i].offsetHeight + mrgn) > eleWidth;
            } else {
                checkoffset = (inEle[i].offsetLeft + inEle[i].offsetWidth + mrgn) > eleWidth; }
            if (checkoffset) {
                if (inEle[i].classList.contains(CLS_SEPARATOR)) {
                    if (this.overflowMode === 'Extended') {
                        if (itemCount === itemPopCount) {
                            let sepEle: HTEle = (inEle[i] as HTEle);
                            if (checkClass(sepEle, [CLS_SEPARATOR, CLS_TBARIGNORE])) {
                                inEle[i].classList.add(CLS_POPUP);
                                itemPopCount++;
                            }
                        }
                        itemCount++;
                    } else if (this.overflowMode === 'Popup') {
                        if (sepCheck > 0 && itemCount === itemPopCount) {
                            let sepEle: HTEle = (inEle[i + itemCount + (sepCheck - 1)] as HTEle);
                            if (checkClass(sepEle, [CLS_SEPARATOR, CLS_TBARIGNORE])) {
                                setStyle(sepEle, { display: 'none' });
                            }
                        }
                        sepCheck++; itemCount = 0; itemPopCount = 0;
                    }
                } else {
                    itemCount++;
                }
                if (inEle[i].classList.contains(CLS_TBAROVERFLOW) && pre) {
                    eleWidth -= (( this.isVertical ? inEle[i].offsetHeight : inEle[i].offsetWidth) + (mrgn));
                } else if (!checkClass(inEle[i], [CLS_SEPARATOR, CLS_TBARIGNORE])) {
                    inEle[i].classList.add(CLS_POPUP);
                    if (this.isVertical) {
                        setStyle(inEle[i], { display: 'none', minHeight: eleWid + 'px' });
                    } else {
                        setStyle(inEle[i], { display: 'none', minWidth: eleWid + 'px' });
                    }
                    itemPopCount++;
                } else {
                    eleWidth -= (( this.isVertical ? inEle[i].offsetHeight : inEle[i].offsetWidth) + (mrgn));
                }
            }
        }
        if (pre) {
            let popedEle: HTEle[] = selectAll('.' + CLS_ITEM + ':not(.' + CLS_POPUP + ')', this.element);
            this.checkPriority(ele, popedEle, eleWid, false);
        }
    }

    private createPopupIcon(element: HTEle): void {
        let id: Str = element.id.concat('_nav');
        let className: Str = 'e-' + element.id.concat('_nav ' + CLS_POPUPNAV);
        className = this.overflowMode === 'Extended' ? className + ' ' + CLS_EXTENDPOPUP : className;
        let nav: HTEle = this.createElement('div', { id: id, className: className });
        if (Browser.info.name === 'msie' || Browser.info.name === 'edge') {
            nav.classList.add('e-ie-align');
        }
        let navItem: HTEle = this.createElement('div', { className: CLS_POPUPDOWN + ' e-icons' });
        nav.appendChild(navItem);
        nav.setAttribute('tabindex', '0');
        element.appendChild(nav);
    }

    private tbarPriRef(inEle: HTEle, indx: number, sepPri: number, el: HTEle, des: boolean, elWid: number, wid: number, ig: number): void {
        let ignoreCount: number = ig;
        let popEle: HTEle = this.popObj.element;
        let query: Str = '.' + CLS_ITEM + ':not(.' + CLS_SEPARATOR + '):not(.' + CLS_TBAROVERFLOW + ')';
        let priEleCnt: number = selectAll('.' + CLS_POPUP + ':not(.' + CLS_TBAROVERFLOW + ')', popEle).length;
        let checkClass: Function = (ele: HTEle, val: Str) => {
            return ele.classList.contains(val);
        };
        if (selectAll(query, inEle).length === 0) {
            let eleSep: HTEle = inEle.children[indx - (indx - sepPri) - 1] as HTEle;
            let ignoreCheck: Boolean = (!isNOU(eleSep) && checkClass(eleSep, CLS_TBARIGNORE));
            if ((!isNOU(eleSep) && checkClass(eleSep, CLS_SEPARATOR) && !isVisible(eleSep)) || ignoreCheck) {
                let sepDisplay: Str = 'none';
                eleSep.style.display = 'inherit';
                let eleSepWidth: number = eleSep.offsetWidth + (parseFloat(window.getComputedStyle(eleSep).marginRight) * 2);
                let prevSep: HTEle = eleSep.previousElementSibling as HTEle;
                if ((elWid + eleSepWidth) < wid || des) {
                    inEle.insertBefore(el, inEle.children[(indx + ignoreCount) - (indx - sepPri)]);
                    if (!isNOU(prevSep)) {
                        prevSep.style.display = '';
                    }
                } else {
                    if (prevSep.classList.contains(CLS_SEPARATOR)) {
                        prevSep.style.display = sepDisplay;
                    }
                }
                eleSep.style.display = '';
            } else {
                inEle.insertBefore(el, inEle.children[(indx + ignoreCount) - (indx - sepPri)]);
            }
        } else {
            inEle.insertBefore(el, inEle.children[(indx + ignoreCount) - priEleCnt]);
        }
    }

    private popupRefresh(popupEle: HTMLElement, destroy: boolean): void {
        let ele: HTEle = this.element;
        let isVer: boolean = this.isVertical;
        let popNav: HTEle = <HTEle>ele.querySelector('.' + CLS_TBARNAV);
        let innerEle: HTEle = <HTEle>ele.querySelector('.' + CLS_ITEMS);
        if (isNOU(popNav)) {
            return;
        }
        innerEle.removeAttribute('style');
        popupEle.style.display = 'block';
        let dimension: number;
        if (isVer) {
          dimension = ele.offsetHeight - (popNav.offsetHeight + innerEle.offsetHeight);
        } else {
            dimension = ele.offsetWidth - (popNav.offsetWidth + innerEle.offsetWidth); }
        let popupEleWidth: number = 0;
        [].slice.call(popupEle.children).forEach((el: HTMLElement): void => {
          popupEleWidth += this.popupEleWidth(el);
          setStyle(el, {'position': ''});  });
        if ((dimension + (isVer ? popNav.offsetHeight : popNav.offsetWidth)) > (popupEleWidth) && this.popupPriCount === 0 ) {
          destroy = true; }
        this.popupEleRefresh(dimension, popupEle, destroy);
        popupEle.style.display = '';
        if (popupEle.children.length === 0 && popNav && this.popObj) {
            detach(popNav);
            popNav = null;
            this.popObj.destroy();
            detach(this.popObj.element);
            this.popObj = null;
            ele.setAttribute('aria-haspopup', 'false');
        }
    }
    private ignoreEleFetch(index: number, innerEle: HTEle): number {
        let ignoreEle: HTEle[] = [].slice.call(innerEle.querySelectorAll('.' + CLS_TBARIGNORE));
        let ignoreInx: number[] = [];
        let count: number = 0;
        if (ignoreEle.length > 0) {
            ignoreEle.forEach((ele: HTEle): void => {
                ignoreInx.push([].slice.call(innerEle.children).indexOf(ele));
            });
        } else {
            return 0;
        }
        ignoreInx.forEach((val: number): void => {
            if (val <= index) { count++; }
        });
        return count;
    }
    private checkPopupRefresh(root: HTEle, popEle: HTEle): boolean {
        popEle.style.display = 'block';
        let elWid: number = this.popupEleWidth(<HTEle>popEle.firstElementChild);
        (<HTEle>popEle.firstElementChild).style.removeProperty('Position');
        let tbarWidth: number = root.offsetWidth - (<HTEle>root.querySelector('.' + CLS_TBARNAV)).offsetWidth;
        let tbarItemsWid: number = (<HTEle>root.querySelector('.' + CLS_ITEMS)).offsetWidth;
        popEle.style.removeProperty('display');
        if (tbarWidth > (elWid + tbarItemsWid)) {
            return true;
        }
        return false;
    }
    private popupEleWidth(el: HTEle): number {
        el.style.position = 'absolute';
        let elWidth: number = this.isVertical ? el.offsetHeight : el.offsetWidth;
        let btnText: HTEle = <HTEle>el.querySelector('.' + CLS_TBARBTNTEXT);
        if (el.classList.contains('e-tbtn-align') || el.classList.contains(CLS_TBARTEXT)) {
            let btn: HTEle = <HTEle>el.children[0];
            if (!isNOU(btnText) && el.classList.contains(CLS_TBARTEXT)) {
                btnText.style.display = 'none';
            } else if (!isNOU(btnText) && el.classList.contains(CLS_POPUPTEXT)) {
                btnText.style.display = 'block';
            }
            btn.style.minWidth = '0%';
            elWidth = parseFloat( !this.isVertical ? el.style.minWidth : el.style.minHeight);
            btn.style.minWidth = '';
            btn.style.minHeight = '';
            if (!isNOU(btnText)) {
                btnText.style.display = '';
            }
        }
        return elWidth;
    }
    private popupEleRefresh(width: number, popupEle: HTEle, destroy: boolean): void {
        let popPriority: boolean = this.popupPriCount > 0;
        let eleSplice: HTEle[] = this.tbarEle;
        let priEleCnt: number;
        let index: number;
        let checkOverflow: boolean;
        let innerEle: HTEle = <HTEle>this.element.querySelector('.' + CLS_ITEMS);
        let ignoreCount: number = 0;
        for (let el of [].slice.call(popupEle.children)) {
            if (el.classList.contains(CLS_POPPRI) && popPriority && !destroy) {
                continue;
            }
            let elWidth: number = this.popupEleWidth(el);
            if (el === this.tbarEle[0]) { elWidth += this.tbarEleMrgn; }
            el.style.position = '';
            if (elWidth < width || destroy) {
                setStyle(el, { minWidth: '', height: '', minHeight: '' });
                if (!el.classList.contains(CLS_POPOVERFLOW)) {
                    el.classList.remove(CLS_POPUP);
                }
                index = this.tbarEle.indexOf(el);
                if (this.tbarAlign) {
                    let pos: ItemAlign = this.items[index].align;
                    index = this.tbarAlgEle[(pos + 's').toLowerCase() as ItmAlign].indexOf(el);
                    eleSplice = this.tbarAlgEle[(pos + 's').toLowerCase() as ItmAlign];
                    innerEle = <HTEle>this.element.querySelector('.' + CLS_ITEMS + ' .' + 'e-toolbar-' + pos.toLowerCase());
                }
                let sepBeforePri: number = 0;
                if (this.overflowMode !== 'Extended') {
                eleSplice.slice(0, index).forEach((el: HTEle) => {
                    if (el.classList.contains(CLS_TBAROVERFLOW) || el.classList.contains(CLS_SEPARATOR)) {
                        if (el.classList.contains(CLS_SEPARATOR)) {
                            el.style.display = '';
                            width -= el.offsetWidth;
                        }
                        sepBeforePri++;
                    }
                }); }
                ignoreCount = this.ignoreEleFetch(index, innerEle);
                if (el.classList.contains(CLS_TBAROVERFLOW)) {
                    this.tbarPriRef(innerEle, index, sepBeforePri, el, destroy, elWidth, width, ignoreCount);
                    width -= el.offsetWidth;
                } else if (index === 0) {
                    innerEle.insertBefore(el, innerEle.firstChild);
                    width -= el.offsetWidth;
                } else {
                    priEleCnt = selectAll('.' + CLS_TBAROVERFLOW, this.popObj.element).length;
                    innerEle.insertBefore(el, innerEle.children[(index + ignoreCount) - priEleCnt]);
                    width -= el.offsetWidth;
                }
                el.style.height = '';
            } else {
                break;
            }
        }
        checkOverflow = this.checkOverflow(this.element, this.element.getElementsByClassName(CLS_ITEMS)[0] as HTEle);
        if (checkOverflow && !destroy) {
            this.renderOverflowMode();
        }
    }
    private removePositioning(): void {
        let item: HTEle = this.element.querySelector('.' + CLS_ITEMS) as HTEle;
        if (isNOU(item) || !item.classList.contains(CLS_TBARPOS)) { return; }
        this.remove(item, CLS_TBARPOS);
        let innerItem: HTEle[] = [].slice.call(item.childNodes);
        innerItem[1].removeAttribute('style');
        innerItem[2].removeAttribute('style');
    }
    private refreshPositioning(): void {
        let item: HTEle = this.element.querySelector('.' + CLS_ITEMS) as HTEle;
        this.add(item, CLS_TBARPOS);
        this.itemPositioning();
    }
    private itemPositioning(): void {
        let item: HTEle = this.element.querySelector('.' + CLS_ITEMS) as HTEle;
        let margin: number;
        if (isNOU(item) || !item.classList.contains(CLS_TBARPOS)) { return; }
        let popupNav: HTEle = <HTEle>this.element.querySelector('.' + CLS_TBARNAV);
        let innerItem: HTEle[];
        if (this.scrollModule) {
            let trgClass: Str = (this.isVertical) ? CLS_VSCROLLCNT : CLS_HSCROLLCNT;
            innerItem = [].slice.call(item.querySelector('.' + trgClass).children);
        } else {
            innerItem = [].slice.call(item.childNodes);
        }
        if (this.isVertical) {
          margin = innerItem[0].offsetHeight + innerItem[2].offsetHeight;
        } else {
           margin = innerItem[0].offsetWidth + innerItem[2].offsetWidth; }
        let tbarWid: number = this.isVertical ? this.element.offsetHeight : this.element.offsetWidth;
        if (popupNav) {
            tbarWid -= (this.isVertical ? popupNav.offsetHeight : popupNav.offsetWidth);
            let popWid: string = (this.isVertical ? popupNav.offsetHeight : popupNav.offsetWidth) + 'px';
            innerItem[2].removeAttribute('style');
            if (this.isVertical) {
              this.enableRtl ? innerItem[2].style.top = popWid : innerItem[2].style.bottom = popWid;
            } else {
                this.enableRtl ? innerItem[2].style.left = popWid : innerItem[2].style.right = popWid; }
        }
        if (tbarWid <= margin) { return; }
        let value: number = (((tbarWid - margin)) - (!this.isVertical ? innerItem[1].offsetWidth : innerItem[1].offsetHeight)) / 2;
        innerItem[1].removeAttribute('style');
        let mrgn: Str = ((!this.isVertical ? innerItem[0].offsetWidth : innerItem[0].offsetHeight) + value) + 'px';
        if (this.isVertical) {
            this.enableRtl ? innerItem[1].style.marginBottom = mrgn : innerItem[1].style.marginTop = mrgn;
        } else {
        this.enableRtl ? innerItem[1].style.marginRight = mrgn : innerItem[1].style.marginLeft = mrgn; }
    }
    private tbarItemAlign(item: ItemModel, itemEle: HTEle, pos: number): void {
        if (item.showAlwaysInPopup && item.overflow !== 'Show') { return; }
        let alignDiv: HTMLElement[] = [];
        alignDiv.push(this.createElement('div', { className: CLS_TBARLEFT }));
        alignDiv.push(this.createElement('div', { className: CLS_TBARCENTER }));
        alignDiv.push(this.createElement('div', { className: CLS_TBARRIGHT }));
        if (pos === 0 && item.align !== 'Left') {
            alignDiv.forEach((ele: HTEle) => {
                itemEle.appendChild(ele);
            });
            this.tbarAlign = true;
            this.add(itemEle, CLS_TBARPOS);
        } else if (item.align !== 'Left') {
            let alignEle: NodeList = itemEle.childNodes;
            let leftAlign: HTEle = alignDiv[0];
            [].slice.call(alignEle).forEach((el: HTEle) => {
                this.tbarAlgEle.lefts.push(el);
                leftAlign.appendChild(el);
            });
            itemEle.appendChild(leftAlign);
            itemEle.appendChild(alignDiv[1]);
            itemEle.appendChild(alignDiv[2]);
            this.tbarAlign = true;
            this.add(itemEle, CLS_TBARPOS);
        }
    }
    private ctrlTemplate(): void {
        this.ctrlTem = <HTEle>this.trgtEle.cloneNode(true);
        this.add(this.trgtEle, CLS_ITEMS);
        this.tbarEle = [];
        let innerEle: HTEle[] = [].slice.call(this.trgtEle.children);
        innerEle.forEach((ele: HTEle) => {
            if (ele.tagName === 'DIV') {
                this.tbarEle.push(ele);
                ele.setAttribute('aria-disabled', 'false');
                this.add(ele, CLS_ITEM);
            }
        });
    }
    private renderItems(): void {
        let ele: HTEle = this.element;
        let itemEleDom: HTEle;
        let innerItem: HTEle;
        let innerPos: HTEle;
        let items: Item[] = <Item[]>this.items;
        if (ele && ele.children.length > 0) {
            itemEleDom = <HTEle>ele.querySelector('.' + CLS_ITEMS);
        }
        if (this.trgtEle != null) {
            this.ctrlTemplate();
        } else if (ele && items.length > 0) {
            if (!itemEleDom) {
                itemEleDom = this.createElement('div', { className: CLS_ITEMS });
            }
            for (let i: number = 0; i < items.length; i++) {
                innerItem = this.renderSubComponent(items[i], i);
                if (this.tbarEle.indexOf(innerItem) === -1) {
                    this.tbarEle.push(innerItem);
                }
                if (!this.tbarAlign) {
                    this.tbarItemAlign(items[i], itemEleDom, i);
                }
                innerPos = <HTEle>itemEleDom.querySelector('.e-toolbar-' + items[i].align.toLowerCase());
                if (innerPos) {
                    if (!(items[i].showAlwaysInPopup && items[i].overflow !== 'Show')) {
                        this.tbarAlgEle[(items[i].align + 's').toLowerCase() as ItmAlign].push(innerItem);
                    }
                    innerPos.appendChild(innerItem);
                } else {
                    itemEleDom.appendChild(innerItem);
                }
            }
            ele.appendChild(itemEleDom);
        }
    }
    private setAttr(attr: { [key: string]: Str; }, element: HTEle): void {
        let key: Object[] = Object.keys(attr);
        let keyVal: Str;
        for (let i: number = 0; i < key.length; i++) {
            keyVal = key[i] as Str;
            keyVal === 'class' ? this.add(element, attr[keyVal]) : element.setAttribute(keyVal, attr[keyVal]);
        }
    }
    /**
     * Enables or disables the specified Toolbar item.
     * @param  {number|HTMLElement|NodeList} items - DOM element or an array of items to be enabled or disabled.
     * @param  {boolean} isEnable  - Boolean value that determines whether the command should be enabled or disabled.
     * By default, `isEnable` is set to true.
     * @returns void.
     */
    public enableItems(items: number | HTMLElement | NodeList, isEnable?: boolean): void {
        let elements: NodeList = <NodeList>items;
        let len: number = elements.length;
        let ele: HTEle | number;
        if (isNOU(isEnable)) {
            isEnable = true;
        }
        let enable: Function = (isEnable: Boolean, ele: HTEle) => {
            if (isEnable) {
                ele.classList.remove(CLS_DISABLE);
                ele.setAttribute('aria-disabled', 'false');
            } else {
                ele.classList.add(CLS_DISABLE);
                ele.setAttribute('aria-disabled', 'true');
            }
        };
        if (!isNOU(len) && len >= 1) {
            for (let a: number = 0, element: HTEle[] = [].slice.call(elements); a < len; a++) {
                let itemElement: HTEle = element[a];
                if (typeof (itemElement) === 'number') {
                    ele = this.getElementByIndex(itemElement);
                    if (isNOU(ele)) {
                        return;
                    } else {
                        elements[a] = ele;
                    }
                } else {
                    ele = itemElement;
                }
                enable(isEnable, ele);
            }
            isEnable ? removeClass(elements, CLS_DISABLE) : addClass(elements, CLS_DISABLE);
        } else {
            if (typeof (elements) === 'number') {
                ele = this.getElementByIndex(elements);
                if (isNOU(ele)) {
                    return;
                }
            } else {
                ele = <HTEle>items;
            }
            enable(isEnable, ele);
        }
    }
    private getElementByIndex(index: number): HTEle {
        if (this.tbarEle[index]) {
            return this.tbarEle[index];
        }
        return null;
    }
    /**
     * Adds new items to the Toolbar that accepts an array as Toolbar items.
     * @param  {ItemsModel[]} items - DOM element or an array of items to be added to the Toolbar.
     * @param  {number} index - Number value that determines where the command is to be added. By default, index is 0.
     * @returns void.
     */
    public addItems(items: ItemModel[], index?: number): void {
        let innerItems: HTEle[];
        this.extendedOpen();
        let itemsDiv: HTEle = <HTEle>this.element.querySelector('.' + CLS_ITEMS);
        if (isNOU(itemsDiv)) {
            this.itemsRerender(items);
            return;
        }
        let innerEle: HTEle;
        let itemAgn: Str = 'Left';
        if (isNOU(index)) {
            index = 0;
        }
        items.forEach((e: ItemModel) => {
            if (!isNOU(e.align) && e.align !== 'Left' && itemAgn === 'Left') {
                itemAgn = e.align;
            }
        });
        for (let item of items) {
            if (isNOU(item.type)) {
                item.type = 'Button';
            }
            innerItems = selectAll('.' + CLS_ITEM, this.element);
            item.align = <ItemAlign>itemAgn;
            innerEle = this.renderSubComponent(item, index);
            if (this.tbarEle.length >= index && innerItems.length >= 0) {
                if (isNOU(this.scrollModule)) {
                this.destroyMode(); }
                let algIndex: number = item.align[0] === 'L' ? 0 : item.align[0] === 'C' ? 1 : 2;
                let ele: Element;
                if (!this.tbarAlign && itemAgn !== 'Left') {
                    this.tbarItemAlign(item, itemsDiv, 1);
                    this.tbarAlign = true;
                    ele = closest(innerItems[0], '.' + CLS_ITEMS).children[algIndex];
                    ele.appendChild(innerEle);
                    this.tbarAlgEle[(item.align + 's').toLowerCase() as ItmAlign].push(innerEle);
                    this.refreshPositioning();
                } else if (this.tbarAlign) {
                 ele = closest(innerItems[0] , '.' + CLS_ITEMS).children[algIndex];
                 ele.insertBefore(innerEle, ele.children[index]);
                 this.tbarAlgEle[(item.align + 's').toLowerCase() as ItmAlign].splice(index, 0, innerEle);
                 this.refreshPositioning();
                } else if (innerItems.length === 0) {
                    innerItems = selectAll('.' + CLS_ITEMS, this.element);
                    innerItems[0].appendChild(innerEle);
                } else {
                innerItems[0].parentNode.insertBefore(innerEle, innerItems[index]); }
                this.items.splice(index, 0, item);
                this.tbarEle.splice(index, 0, innerEle);
                index++;
                this.offsetWid = itemsDiv.offsetWidth;
            }
        }
        itemsDiv.style.width = '';
        this.renderOverflowMode();
    }
    /**
     * Removes the items from the Toolbar. Acceptable arguments are index of item/HTMLElement/node list.
     * @param  {number|HTMLElement|NodeList|HTMLElement[]} args
     * Index or DOM element or an Array of item which is to be removed from the Toolbar.
     * @returns void.
     */
    public removeItems(args: number | HTMLElement | NodeList | Element | HTMLElement[]): void {
        let elements: NodeList = <NodeList>args;
        let index: number;
        let innerItems: HTEle[] = [].slice.call(selectAll('.' + CLS_ITEM, this.element));
        if (typeof (elements) === 'number') {
            index = parseInt(args.toString(), 10);
            this.removeItemByIndex(index, innerItems);
        } else {
            if (elements && elements.length > 1) {
                for (let ele of [].slice.call(elements)) {
                    index = this.tbarEle.indexOf(ele);
                    this.removeItemByIndex(index, innerItems);
                    innerItems = selectAll('.' + CLS_ITEM, this.element);
                }
            } else {
                let ele: HTEle = (elements && elements.length && elements.length === 1) ? <HTEle>elements[0] : <HTEle>args;
                index = innerItems.indexOf(ele);
                this.removeItemByIndex(index, innerItems);
            }
        }
        this.resize();
    }
    private removeItemByIndex(index: number, innerItems: HTEle[]): void {
        if (this.tbarEle[index] && innerItems[index]) {
            let eleIdx: number = this.tbarEle.indexOf(innerItems[index]);
            if (this.tbarAlign) {
                let indexAgn: number;
                indexAgn = this.tbarAlgEle[(this.items[eleIdx].align + 's').toLowerCase() as ItmAlign].indexOf(this.tbarEle[eleIdx]);
                this.tbarAlgEle[(this.items[eleIdx].align + 's').toLowerCase() as ItmAlign].splice(indexAgn, 1);
            }
            detach(innerItems[index]);
            this.items.splice(eleIdx, 1);
            this.tbarEle.splice(eleIdx, 1);
        }
    }
    private templateRender(templateProp: Object | Str, innerEle: HTEle, item: ItemModel, index: number): void {
        let itemType: Str = item.type;
        let eleObj: Template = <Template>templateProp;
        let isComponent: Boolean;
        if (typeof (templateProp) === 'object') {
            isComponent = typeof (eleObj.appendTo) === 'function';
        }
        if (typeof (templateProp) === 'string' || !isComponent) {
            let templateFn: Function;
            let val: Str = <Str>templateProp;
            val = (typeof (templateProp) === 'string') ? <Str>templateProp.trim() : <Str>templateProp;
            let e: Object;
            try {
                if (typeof (templateProp) === 'object' && !isNOU((templateProp as HTEle).tagName)) {
                    innerEle.appendChild(templateProp as HTEle);
                } else if (document.querySelectorAll(val).length) {
                    let ele: Element = document.querySelector(val);
                    let tempStr: Str = ele.outerHTML.trim();
                    innerEle.appendChild(ele);
                    (<HTMLElement>ele).style.display = '';
                    if (!isNOU(tempStr)) {
                      this.tempId.push(val);
                    }
                }
            } catch (e) {
                templateFn = templateCompiler(val);
            }
            let tempArray: HTEle[];
            if (!isNOU(templateFn)) {
                let toolbarTemplateID: string = this.element.id + index + '_template';
                tempArray = templateFn({}, this, 'template', toolbarTemplateID, this.isStringTemplate);
            }
            if (!isNOU(tempArray) && tempArray.length > 0) {
                [].slice.call(tempArray).forEach((ele: HTEle): void => {
                    if (!isNOU(ele.tagName)) {
                        ele.style.display = '';
                    }
                    innerEle.appendChild(ele);
                });
            }
        } else if (itemType === 'Input') {
            let ele: HTEle = this.createElement('input');
            item.id ? (ele.id = item.id) : (ele.id = getUniqueID('tbr-ipt'));
            innerEle.appendChild(ele);
            eleObj.appendTo(ele);
        }
        this.add(innerEle, CLS_TEMPLATE);
        this.tbarEle.push(innerEle);
    }
    private buttonRendering(item: ItemModel, innerEle: HTEle): HTEle {
        let dom: HTEle = this.createElement('button', { className: CLS_TBARBTN });
        dom.setAttribute('type', 'button');
        let textStr: Str = item.text;
        let iconCss: Str;
        let iconPos: Str;
        item.id ? (dom.id = item.id) : dom.id = getUniqueID('e-tbr-btn');
        let btnTxt: HTEle = this.createElement('span', { className: 'e-tbar-btn-text' });
        if (textStr) {
            btnTxt.innerHTML = textStr;
            dom.appendChild(btnTxt);
            dom.classList.add('e-tbtn-txt');
        } else {
            this.add(innerEle, 'e-tbtn-align');
        }
        if (item.prefixIcon || item.suffixIcon) {
            if ((item.prefixIcon && item.suffixIcon) || item.prefixIcon) {
                iconCss = item.prefixIcon + ' e-icons';
                iconPos = 'Left';
            } else {
                iconCss = item.suffixIcon + ' e-icons';
                iconPos = 'Right';
            }
        }
        let btnObj: Button = new Button({ iconCss: iconCss, iconPosition: <IconPosition>iconPos });
        btnObj.createElement = this.createElement;
        btnObj.appendTo( dom as HTMLButtonElement);
        if (item.width) {
            setStyle(dom, { 'width': formatUnit(item.width) });
        }
        return dom;
    }
    private renderSubComponent(item: ItemModel, index: number): HTEle {
        let innerEle: HTEle;
        let dom: HTEle;
        innerEle = this.createElement('div', { className: CLS_ITEM });
        innerEle.setAttribute('aria-disabled', 'false');
        if (!this.tbarEle) {
            this.tbarEle = [];
        }
        if (item.htmlAttributes) {
            this.setAttr(item.htmlAttributes, innerEle);
        }
        if (item.tooltipText) {
            let tempDom: HTEle = this.createElement('div', {innerHTML: item.tooltipText});
            innerEle.setAttribute('title', tempDom.textContent );
        }
        if (item.cssClass) {
            innerEle.className = innerEle.className + ' ' + item.cssClass;
        }
        if (item.template) {
            this.templateRender(item.template, innerEle, item, index);
        } else {
            switch (item.type) {
                case 'Button':
                    dom = this.buttonRendering(item, innerEle);
                    dom.setAttribute('tabindex', '-1');
                    innerEle.appendChild(dom);
                    innerEle.addEventListener('click', this.itemClick.bind(this));
                    break;
                case 'Separator':
                    this.add(innerEle, CLS_SEPARATOR);
                    break;
            }
        }
        if (item.showTextOn) {
            let sTxt: Str = item.showTextOn;
            if (sTxt === 'Toolbar') {
                this.add(innerEle, CLS_POPUPTEXT);
                this.add(innerEle, 'e-tbtn-align');
            } else if (sTxt === 'Overflow') {
                this.add(innerEle, CLS_TBARTEXT);
            }
        }
        if (item.overflow) {
            let overflow: Str = item.overflow;
            if (overflow === 'Show') {
                this.add(innerEle, CLS_TBAROVERFLOW);
            } else if (overflow === 'Hide') {
                if (!innerEle.classList.contains(CLS_SEPARATOR)) {
                    this.add(innerEle, CLS_POPOVERFLOW);
                }
            }
        }
        if (item.overflow !== 'Show' && item.showAlwaysInPopup && !innerEle.classList.contains(CLS_SEPARATOR)) {
            this.add(innerEle, CLS_POPPRI);
            this.popupPriCount++;
        }
        return innerEle;
    }

    private refreshToolbarTemplate(): void {
        let blazorContain: string[] = Object.keys(window) as string[];
        for (let a: number = 0, length: number = this.items.length; a < length; a++) {
            let item: ItemModel = this.items[a];
            if (item.template && blazorContain.indexOf('Blazor') > -1 && !this.isStringTemplate && (<string>item.template).indexOf('<div>Blazor') === 0) {
                resetBlazorTemplate(this.element.id + a + '_template', 'Template');
                updateBlazorTemplate(this.element.id + a + '_template', 'Template', item);
            }
        }
    }

    private itemClick(e: Event): void {
        this.activeEleSwitch(<HTEle>e.currentTarget);
    }
    private activeEleSwitch(ele: HTEle): void {
        this.activeEleRemove(<HTEle>ele.firstElementChild);
        this.activeEle.focus();
    }
    private activeEleRemove(curEle: HTEle): void {
        if (!isNOU(this.activeEle)) {
            this.activeEle.setAttribute('tabindex', '-1');
        }
        this.activeEle = curEle;
        if (isNOU(this.trgtEle) && !(<HTEle>curEle.parentElement).classList.contains(CLS_TEMPLATE)) {
            curEle.removeAttribute('tabindex');
        } else {
            this.activeEle.setAttribute('tabindex', '0');
        }
    }
    protected getPersistData(): string {
        return this.addOnPersist([]);
    }
    /**
     * Returns the current module name.
     * @returns string
     * @private
     */
    protected getModuleName(): string {
        return 'toolbar';
    }
    private itemsRerender(newProp: ItemModel[]): void {
        this.items = this.tbarItemsCol;
        this.destroyMode();
        this.destroyItems();
        this.items = newProp;
        this.tbarItemsCol = this.items;
        this.renderItems();
        this.renderOverflowMode();
    }
    private resize(): void {
        let ele: HTEle = this.element;
        this.tbResize = true;
        if (this.tbarAlign) { this.itemPositioning(); }
        if (this.popObj && this.overflowMode === 'Popup') {
            this.popObj.hide();
        }
        let checkOverflow: boolean = this.checkOverflow(ele, ele.getElementsByClassName(CLS_ITEMS)[0] as HTEle);
        if (!checkOverflow) {
            this.destroyScroll();
            let multirowele: HTEle = ele.querySelector('.' + CLS_ITEMS);
            if (!isNOU(multirowele)) {
                this.remove(multirowele, CLS_MULTIROWPOS);
                if (this.tbarAlign) { this.add(multirowele, CLS_TBARPOS); }
            }
        }
        if (checkOverflow && this.scrollModule && (this.offsetWid === ele.offsetWidth)) { return; }
        if (this.offsetWid > ele.offsetWidth || checkOverflow) {
            this.renderOverflowMode();
        }
        if (this.popObj) {
            if (this.overflowMode === 'Extended') {
                let eleStyles: CSSStyleDeclaration = window.getComputedStyle(this.element);
                this.popObj.width = parseFloat(eleStyles.width) + ((parseFloat(eleStyles.borderRightWidth)) * 2); }
            if (this.tbarAlign) { this.removePositioning(); }
            this.popupRefresh(this.popObj.element, false);
            if (this.tbarAlign) { this.refreshPositioning(); }
        }
        this.offsetWid = ele.offsetWidth;
        this.tbResize = false;
        this.separator();
    }

    private extendedOpen(): void {
        let sib: HTEle = this.element.querySelector('.' + CLS_EXTENDABLECLASS) as HTEle;
        if (this.overflowMode === 'Extended' && sib) {
            this.isExtendedOpen = sib.classList.contains(CLS_POPUPOPEN);
        }
    }

    /**
     * Gets called when the model property changes.The data that describes the old and new values of the property that changed.
     * @param  {ToolbarModel} newProp
     * @param  {ToolbarModel} oldProp
     * @returns void
     * @private
     */
    public onPropertyChanged(newProp: ToolbarModel, oldProp: ToolbarModel): void {
        let tEle: HTEle = this.element;
        this.extendedOpen();
        for (let prop of Object.keys(newProp)) {
            switch (prop) {
                case 'items':
                    if (!(newProp.items instanceof Array && oldProp.items instanceof Array)) {
                        let changedProb: Object[] = Object.keys(newProp.items);
                        for (let i: number = 0; i < changedProb.length; i++) {
                            let index: number = parseInt(Object.keys(newProp.items)[i], 10);
                            let property: Str = Object.keys(newProp.items[index])[0];
                            let oldProperty: Str = Object(oldProp.items[index])[property];
                            let newProperty: Str = Object(newProp.items[index])[property];
                            if (this.tbarAlign || property === 'align') {
                                this.refresh();
                                this.trigger('created');
                                break;
                            }
                            let popupPriCheck: Boolean = property === 'showAlwaysInPopup' && !newProperty;
                            let booleanCheck: Boolean = property === 'overflow' && this.popupPriCount !== 0;
                            if ((popupPriCheck) || (this.items[index].showAlwaysInPopup) && booleanCheck) {
                                --this.popupPriCount;
                            }
                            if (isNOU(this.scrollModule)) {
                              this.destroyMode(); }
                            let itemCol: HTEle[] = [].slice.call(selectAll('.' + CLS_ITEMS + ' .' + CLS_ITEM, tEle));
                            detach(itemCol[index]);
                            this.tbarEle.splice(index, 1);
                            this.addItems([this.items[index]], index);
                            this.items.splice(index, 1);
                            if (this.items[index].template) {
                                this.tbarEle.splice(this.items.length, 1);
                            }
                        }
                    } else {
                        this.itemsRerender(newProp.items);
                    }
                    break;
                case 'width':
                    let wid: number = tEle.offsetWidth;
                    setStyle(tEle, { 'width': formatUnit(newProp.width) });
                    this.renderOverflowMode();
                    if (this.popObj && wid < tEle.offsetWidth) {
                        this.popupRefresh(this.popObj.element, false);
                    }
                    break;
                case 'height':
                    setStyle(this.element, { 'height': formatUnit(newProp.height) });
                    break;
                case 'overflowMode':
                    this.destroyMode();
                    this.renderOverflowMode();
                    if (this.enableRtl) {
                        this.add(tEle, CLS_RTL);
                    }
                    this.refreshOverflow();
                    break;
                case 'enableRtl':
                    newProp.enableRtl ? this.add(tEle, CLS_RTL) : this.remove(tEle, CLS_RTL);
                    if (!isNOU(this.scrollModule)) {
                        newProp.enableRtl ? this.add(this.scrollModule.element, CLS_RTL) : this.remove(this.scrollModule.element, CLS_RTL);
                    }
                    if (!isNOU(this.popObj)) {
                        newProp.enableRtl ? this.add(this.popObj.element, CLS_RTL) : this.remove(this.popObj.element, CLS_RTL);
                    }
                    if (this.tbarAlign) { this.itemPositioning(); }
                    break;
            }
        }
    }
    /**
     * Shows or hides the Toolbar item that is in the specified index.
     * @param  {number | HTMLElement} index - Index value of target item or DOM element  of items to be hidden or shown.
     * @param  {boolean} value - Based on this Boolean value, item will be hide (true) or show (false). By default, value is false.
     * @returns void.
     */
    public hideItem(index: number| HTMLElement | Element, value?: boolean): void {
        let isElement: boolean = (typeof (index) === 'object') ? true : false;
        let eleIndex: number = index as number;
        let initIndex: number;
        let ele: HTMLElement;
        let innerItems: HTEle[] = [].slice.call(selectAll('.' + CLS_ITEM, this.element));
        if (isElement) {
            ele = (index as HTMLElement);
        } else if (this.tbarEle[eleIndex]) {
            let innerItems: HTEle[] = [].slice.call(selectAll('.' + CLS_ITEM, this.element));
            ele = innerItems[eleIndex];
        }
        if (ele) {
        value ? ele.classList.add(CLS_HIDDEN) : ele.classList.remove(CLS_HIDDEN);
        if (value && isNOU(this.element.getAttribute('tabindex')) && !ele.classList.contains(CLS_SEPARATOR)) {
            if (isNOU(ele.firstElementChild.getAttribute('tabindex'))) {
                ele.firstElementChild.setAttribute('tabindex', '-1');
                let innerItems: HTEle[] = [].slice.call(selectAll('.' + CLS_ITEM, this.element));
                if (isElement) {
                    eleIndex = innerItems.indexOf(ele);
                }
                let nextEle: HTEle = innerItems[++eleIndex];
                while (nextEle) {
                    let skipEle: string | boolean = this.eleContains(nextEle);
                    if (!skipEle) {
                        nextEle.firstElementChild.removeAttribute('tabindex');
                        break;
                    }
                    nextEle = innerItems[++eleIndex];
                }
            }
        } else if (isNOU(this.element.getAttribute('tabindex')) && !ele.classList.contains(CLS_SEPARATOR)) {
            initIndex = 0;
            let setFlag: boolean = false;
            let removeFlag: boolean = false;
            let initELe: HTEle = innerItems[initIndex];
            while (initELe) {
                if (!initELe.classList.contains(CLS_SEPARATOR)) {
                    if (isNOU(initELe.firstElementChild.getAttribute('tabindex'))) {
                        initELe.firstElementChild.setAttribute('tabindex', '-1');
                        setFlag = true;
                    } else {
                        if (setFlag && removeFlag) { break; }
                        let skipEle: string | boolean = this.eleContains(initELe);
                        if (!skipEle) {
                            initELe.firstElementChild.removeAttribute('tabindex');
                            removeFlag = true;
                        }
                        initELe = innerItems[++initIndex];
                    }
                } else {
                    initELe = innerItems[++initIndex];
                }
            }
        }
        this.refreshOverflow(); }
    }
}