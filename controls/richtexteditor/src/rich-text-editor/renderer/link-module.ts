import { EventHandler, detach, L10n, isNullOrUndefined, KeyboardEventArgs, select, isBlazor } from '@syncfusion/ej2-base';
import { closest, addClass, removeClass, Browser } from '@syncfusion/ej2-base';
import { IRichTextEditor, NotifyArgs, IRenderer, IImageNotifyArgs, IToolbarItemModel, IShowPopupArgs } from './../base/interface';
import { IDropDownItemModel } from './../base/interface';
import { ServiceLocator } from './../services/service-locator';
import * as events from '../base/constant';
import { CLS_RTE_ELEMENTS } from '../base/classes';
import { Dialog, DialogModel } from '@syncfusion/ej2-popups';
import { CheckBox } from '@syncfusion/ej2-buttons';
import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import { NodeSelection } from '../../selection/selection';
import { RendererFactory } from '../services/renderer-factory';
import { RenderType } from '../base/enum';
import { dispatchEvent, parseHtml } from '../base/util';
import { DialogRenderer } from './dialog-renderer';
import { isIDevice } from '../../common/util';

/**
 * `Link` module is used to handle undo actions.
 */
export class Link {
    private rteID: string;
    private i10n: L10n;
    private parent: IRichTextEditor;
    public contentModule: IRenderer;
    private dialogObj: Dialog;
    private checkBoxObj: CheckBox;
    public serviceLocator: ServiceLocator;
    private rendererFactory: RendererFactory;
    private quickToolObj: IRenderer;
    private dialogRenderObj: DialogRenderer;
    constructor(parent?: IRichTextEditor, serviceLocator?: ServiceLocator) {
        this.parent = parent;
        this.rteID = parent.element.id;
        this.i10n = serviceLocator.getService<L10n>('rteLocale');
        this.addEventListener();
        this.serviceLocator = serviceLocator;
        this.rendererFactory = serviceLocator.getService<RendererFactory>('rendererFactory');
        this.dialogRenderObj = serviceLocator.getService<DialogRenderer>('dialogRenderObject');
    }
    protected addEventListener(): void {
        if (this.parent.isDestroyed) { return; }
        this.parent.on(events.insertLink, this.linkDialog, this);
        this.parent.on(events.keyDown, this.onKeyDown, this);
        this.parent.on(events.insertCompleted, this.showLinkQuickToolbar, this);
        this.parent.on(events.linkToolbarAction, this.onToolbarAction, this);
        this.parent.on(events.iframeMouseDown, this.onIframeMouseDown, this);
        this.parent.on(events.unLink, this.removeLink, this);
        this.parent.on(events.editLink, this.editLink, this);
        this.parent.on(events.openLink, this.openLink, this);
        this.parent.on(events.editAreaClick, this.editAreaClickHandler, this);
    }
    private onToolbarAction(args: NotifyArgs): void {
        let item: IToolbarItemModel = (args.args as ClickEventArgs).item as IToolbarItemModel;
        switch (item.subCommand) {
            case 'OpenLink':
                this.parent.notify(events.openLink, args);
                break;
            case 'EditLink':
                this.parent.notify(events.editLink, args);
                break;
            case 'RemoveLink':
                this.parent.notify(events.unLink, args);
                break;
        }
    }
    protected removeEventListener(): void {
        if (this.parent.isDestroyed) { return; }
        this.parent.off(events.insertLink, this.linkDialog);
        this.parent.off(events.keyDown, this.onKeyDown);
        this.parent.off(events.insertCompleted, this.showLinkQuickToolbar);
        this.parent.off(events.linkToolbarAction, this.onToolbarAction);
        this.parent.off(events.unLink, this.removeLink);
        this.parent.off(events.iframeMouseDown, this.onIframeMouseDown);
        this.parent.off(events.editLink, this.editLink);
        this.parent.off(events.openLink, this.openLink);
        this.parent.off(events.editAreaClick, this.editAreaClickHandler);
    }
    private onIframeMouseDown(): void {
        if (this.dialogObj) {
            this.dialogObj.hide({ returnValue: true } as Event);
        }
    }
    private showLinkQuickToolbar(e: IShowPopupArgs): void {
        if ((e.args as KeyboardEventArgs).action !== 'enter' && (e.args as KeyboardEventArgs).action !== 'space') {
            let pageX: number;
            let pageY: number;
            if (e.type !== 'Links' || isNullOrUndefined(this.parent.quickToolbarModule) ||
                isNullOrUndefined(this.parent.quickToolbarModule.linkQTBar)) { return; }
            this.quickToolObj = this.parent.quickToolbarModule;
            let parentTop: number = this.parent.element.getBoundingClientRect().top;
            let parentLeft: number = this.parent.element.getBoundingClientRect().left;
            let range: Range = this.parent.formatter.editorManager.nodeSelection.getRange(this.parent.contentModule.getDocument());
            let target: HTMLElement;
            [].forEach.call(e.elements, (element: Element, index: number) => {
                if (index === 0) {
                    target = ((element.nodeName === '#text') ? (element.parentNode) : element) as HTMLElement;
                }
            });
            if (e.isNotify) {
                let tbElement: HTMLElement = this.parent.toolbarModule.getToolbarElement() as HTMLElement;
                let linkTop: number = target.getBoundingClientRect().top;
                let linkLeft: number = target.getBoundingClientRect().left;
                let linkPos: number = linkTop - parentTop;
                let tbHeight: number = (tbElement) ? (tbElement.offsetHeight + this.parent.toolbarModule.getExpandTBarPopHeight()) : 0;
                pageX = (this.parent.iframeSettings.enable) ? parentLeft + linkLeft : target.getBoundingClientRect().left;
                pageY = window.pageYOffset + ((this.parent.iframeSettings.enable) ?
                (parentTop + tbHeight + linkTop) : (parentTop + linkPos));
            } else {
                let args: Touch | MouseEvent;
                args = (e.args as TouchEvent).touches ? (e.args as TouchEvent).changedTouches[0] : args = e.args as MouseEvent;
                pageX = (this.parent.iframeSettings.enable) ? window.pageXOffset + parentLeft + args.clientX : args.pageX;
                pageY = (this.parent.iframeSettings.enable) ? window.pageYOffset + parentTop + args.clientY : args.pageY;
            }
            if (this.quickToolObj.linkQTBar) {
                this.quickToolObj.linkQTBar.showPopup(pageX, pageY, range.endContainer as Element);
            }
        }
    }

    private hideLinkQuickToolbar(): void {
        if (this.quickToolObj && this.quickToolObj.linkQTBar && document.body.contains(this.quickToolObj.linkQTBar.element)) {
            this.quickToolObj.linkQTBar.hidePopup();
        }
    }

    private editAreaClickHandler(e: IImageNotifyArgs): void {
        let args: MouseEvent = e.args as MouseEvent;
        let showOnRightClick: boolean = this.parent.quickToolbarSettings.showOnRightClick;
        if (args.which === 2 || (showOnRightClick && args.which === 1) || (!showOnRightClick && args.which === 3)) { return; }
        if (this.parent.editorMode === 'HTML' && this.parent.quickToolbarModule && this.parent.quickToolbarModule.linkQTBar) {
            this.quickToolObj = this.parent.quickToolbarModule;
            let target: HTMLElement = args.target as HTMLElement;
            target = this.getAnchorNode(target);
            this.contentModule = this.rendererFactory.getRenderer(RenderType.Content);
            let isPopupOpen: boolean = this.quickToolObj.linkQTBar.element.classList.contains('e-rte-pop');
            if (target.nodeName === 'A' && !target.contains(target.querySelector('img'))) {
                if (isPopupOpen) { return; }
                this.showLinkQuickToolbar({
                    args: args,
                    isNotify: false,
                    type: 'Links',
                    elements: [args.target as Element]
                } as IShowPopupArgs);
            } else {
                this.hideLinkQuickToolbar();
            }
        }
    }
    private onKeyDown(event: NotifyArgs): void {
        let originalEvent: KeyboardEventArgs = event.args as KeyboardEventArgs;
        switch (originalEvent.action) {
            case 'escape':
                if (!isNullOrUndefined(this.dialogObj)) {
                    this.dialogObj.close();
                }
                break;
            case 'insert-link':
                if (this.parent.editorMode === 'HTML') {
                    let range: Range = this.parent.formatter.editorManager.nodeSelection.getRange(this.parent.contentModule.getDocument());
                    let save: NodeSelection = this.parent.formatter.editorManager.nodeSelection.save(
                        range, this.parent.contentModule.getDocument());
                    let selectNodeEle: Node[] = this.parent.formatter.editorManager.nodeSelection.getNodeCollection(range);
                    let selectParentEle: Node[] = this.parent.formatter.editorManager.nodeSelection.getParentNodeCollection(range);
                    let eventArgs: NotifyArgs = {
                        args: event.args, selectNode: selectNodeEle, selection: save, selectParent: selectParentEle
                    };
                    this.linkDialog(eventArgs);
                } else {
                    let textArea: HTMLTextAreaElement = this.parent.contentModule.getEditPanel() as HTMLTextAreaElement;
                    this.parent.formatter.editorManager.markdownSelection.save(textArea.selectionStart, textArea.selectionEnd);
                    this.linkDialog({
                        args: {
                            item: { command: 'Links', subCommand: 'Link' } as IToolbarItemModel,
                            originalEvent: originalEvent
                        },
                        member: 'link',
                        text: this.parent.formatter.editorManager.markdownSelection.getSelectedText(
                            this.parent.contentModule.getEditPanel() as HTMLTextAreaElement),
                        module: 'Markdown',
                        name: 'insertLink'
                    });
                }
                originalEvent.preventDefault();
                break;
        }
    }
    private linkDialog(e?: NotifyArgs, inputDetails?: { [key: string]: string }): void {
        if (this.dialogObj) {
            this.dialogObj.hide({ returnValue: true } as Event); return;
        }
        if (this.parent.editorMode === 'HTML' && (e.selectParent.length > 0 &&
            !isNullOrUndefined((e.selectParent[0] as HTMLElement).classList) &&
            (e.selectParent[0] as HTMLElement).classList.contains('e-rte-anchor')) && isNullOrUndefined(inputDetails)) {
            this.editLink(e); return; }
        let selectText: string; let linkWebAddress: string = this.i10n.getConstant('linkWebUrl');
        let linkDisplayText: string = this.i10n.getConstant('linkText');
        let linkTooltip: string = this.i10n.getConstant('linkTooltipLabel');
        let urlPlace: string = this.i10n.getConstant('linkurl');
        let textPlace: string = this.i10n.getConstant('textPlaceholder'); let title: string = this.i10n.getConstant('linkTitle');
        let linkDialogEle: HTMLElement = this.parent.createElement('div', { className: 'e-rte-link-dialog', id: this.rteID + '_rtelink' });
        this.parent.element.appendChild(linkDialogEle);
        let linkContent: HTMLElement = this.parent.createElement('div', {
            className: 'e-rte-linkcontent', id: this.rteID + '_linkContent'
        });
        let htmlTextbox: string = (this.parent.editorMode === 'HTML') ? '<label>' + linkTooltip +
            '</label></div><div class="e-rte-field">' +
            '<input type="text" data-role ="none" spellcheck="false" placeholder = "' + title + '" class="e-input e-rte-linkTitle"></div>' +
            '<div class="e-rte-label"></div>' + '<div class="e-rte-field">' +
            '<input type="checkbox" class="e-rte-linkTarget"  data-role ="none"></div>' : '';
        let content: string = '<div class="e-rte-label"><label>' + linkWebAddress + '</label></div>' + '<div class="e-rte-field">' +
            '<input type="text" data-role ="none" spellcheck="false" placeholder="' + urlPlace + '" class="e-input e-rte-linkurl"/></div>' +
            '<div class="e-rte-label">' + '<label>' + linkDisplayText + '</label></div><div class="e-rte-field"> ' +
            '<input type="text" data-role ="none" spellcheck="false" class="e-input e-rte-linkText" placeholder="' + textPlace + '">' +
            '</div><div class="e-rte-label">' + htmlTextbox;
        let contentElem: DocumentFragment = parseHtml(content);
        linkContent.appendChild(contentElem);
        let linkTarget: HTMLInputElement = linkContent.querySelector('.e-rte-linkTarget') as HTMLInputElement;
        let linkUrl: HTMLInputElement = linkContent.querySelector('.e-rte-linkurl') as HTMLInputElement;
        let linkText: HTMLInputElement = linkContent.querySelector('.e-rte-linkText') as HTMLInputElement;
        let linkTitle: HTMLInputElement = linkContent.querySelector('.e-rte-linkTitle') as HTMLInputElement;
        let linkOpenLabel: string = this.i10n.getConstant('linkOpenInNewWindow');
        this.checkBoxObj = new CheckBox({ label: linkOpenLabel, checked: true, enableRtl: this.parent.enableRtl });
        this.checkBoxObj.isStringTemplate = true;
        this.checkBoxObj.createElement = this.parent.createElement;
        this.checkBoxObj.appendTo(linkTarget);
        selectText = (this.parent.editorMode === 'HTML') ? e.selection.getRange(this.parent.contentModule.getDocument()).toString() :
            e.text;
        let linkInsert: string = this.i10n.getConstant('dialogInsert'); let linkCancel: string = this.i10n.getConstant('dialogCancel');
        let selection: NodeSelection = e.selection;
        let selectObj: NotifyArgs = { selfLink: this, selection: e.selection, selectParent: e.selectParent, args: e.args as MouseEvent };
        let dialogModel: DialogModel = {
            header: this.i10n.getConstant('linkHeader'),
            content: linkContent,
            cssClass: CLS_RTE_ELEMENTS,
            enableRtl: this.parent.enableRtl,
            locale: this.parent.locale,
            showCloseIcon: true, closeOnEscape: true, width: (Browser.isDevice) ? '290px' : '310px', height: 'inherit',
            isModal: (Browser.isDevice as boolean),
            buttons: [{
                click: this.insertlink.bind(selectObj),
                buttonModel: { content: linkInsert, cssClass: 'e-flat e-insertLink', isPrimary: true }
            },
            { click: this.cancelDialog.bind(selectObj), buttonModel: { cssClass: 'e-flat', content: linkCancel } }],
            target: (Browser.isDevice) ? document.body : this.parent.element,
            animationSettings: { effect: 'None' },
            close: (event: { [key: string]: object }) => {
                this.parent.isBlur = false;
                if (event && (event.event as { [key: string]: string }).returnValue) {
                    if (this.parent.editorMode === 'HTML') {
                        selection.restore();
                    } else {
                        this.parent.formatter.editorManager.markdownSelection.restore(
                            this.parent.contentModule.getEditPanel() as HTMLTextAreaElement);
                    }
                }
                this.dialogObj.destroy();
                detach(this.dialogObj.element);
                let args: Dialog = isBlazor() ? null : this.dialogObj;
                this.dialogRenderObj.close(args);
                this.dialogObj = null;
            },
        };
        this.dialogObj = this.dialogRenderObj.render(dialogModel);
        this.dialogObj.createElement = this.parent.createElement;
        this.dialogObj.appendTo(linkDialogEle);
        linkDialogEle.style.maxHeight = 'inherit';
        if (!isNullOrUndefined(inputDetails)) {
            linkUrl.value = inputDetails.url;
            linkText.value = inputDetails.text;
            linkTitle.value = inputDetails.title;
            (inputDetails.target) ? this.checkBoxObj.checked = true : this.checkBoxObj.checked = false;
            this.dialogObj.header = inputDetails.header;
            this.dialogObj.element.querySelector('.e-insertLink').textContent = inputDetails.btnText;
        }
        this.checkUrl(false);
        if ((this.parent.editorMode === 'HTML' && ((!isNullOrUndefined(selectText) && selectText !== '') &&
            (e.selection.range.startOffset === 0) || e.selection.range.startOffset !== e.selection.range.endOffset))
            || e.module === 'Markdown') { linkText.value = selectText; }
        EventHandler.add(document, 'mousedown', this.onDocumentClick, this);
        if (this.quickToolObj) {
            this.hideLinkQuickToolbar();
            if (this.quickToolObj.inlineQTBar && document.body.contains(this.quickToolObj.inlineQTBar.element)) {
                this.quickToolObj.inlineQTBar.hidePopup();
            }
        }
    }

    private insertlink(e: MouseEvent): void {
        let linkEle: HTMLElement = (this as NotifyArgs).selfLink.dialogObj.element as HTMLElement;
        let linkUrl: string = (linkEle.querySelector('.e-rte-linkurl') as HTMLInputElement).value;
        let linkText: string = (linkEle.querySelector('.e-rte-linkText') as HTMLInputElement).value;
        let linkTitle: string;
        if ((this as NotifyArgs).selfLink.parent.editorMode === 'HTML') {
            linkTitle = (linkEle.querySelector('.e-rte-linkTitle') as HTMLInputElement).value;
        }
        let target: string = ((this as NotifyArgs).selfLink.checkBoxObj.checked) ? '_blank' : null;
        if (linkUrl === '') { (this as NotifyArgs).selfLink.checkUrl(true); return; }
        if (!(this as NotifyArgs).selfLink.isUrl(linkUrl)) {
            linkText = (linkText === '') ? linkUrl : linkText;
            if (!(this as NotifyArgs).selfLink.parent.enableAutoUrl) {
                linkUrl = linkUrl.indexOf('http') > -1 ? linkUrl : 'http://' + linkUrl;
            } else {
                linkUrl = linkUrl;
            }
        } else {
            (this as NotifyArgs).selfLink.checkUrl(false);
        }
        let proxy: Link = (this as NotifyArgs).selfLink;
        if (proxy.parent.editorMode === 'HTML' && isNullOrUndefined(
            closest(
                (this as IImageNotifyArgs).selection.range.startContainer.parentNode, '#' + proxy.parent.contentModule.getPanel().id))) {
            (proxy.parent.contentModule.getEditPanel() as HTMLElement).focus();
            if (Browser.isIE && proxy.parent.iframeSettings.enable) { (this as NotifyArgs).selection.restore(); }
            let range: Range = proxy.parent.formatter.editorManager.nodeSelection.getRange(proxy.parent.contentModule.getDocument());
            (this as NotifyArgs).selection = proxy.parent.formatter.editorManager.nodeSelection.save(
                range, proxy.parent.contentModule.getDocument());
            (this as NotifyArgs).selectParent = proxy.parent.formatter.editorManager.nodeSelection.getParentNodeCollection(range);
        }
        let value: NotifyArgs = {
            url: linkUrl, text: linkText, title: linkTitle, target: target,
            selection: (this as NotifyArgs).selection, selectParent: (this as NotifyArgs).selectParent
        };
        if (document.body.contains(proxy.dialogObj.element)) {
            (this as NotifyArgs).selfLink.dialogObj.hide({ returnValue: false } as Event);
        }
        if (isIDevice() && proxy.parent.iframeSettings.enable) {
            (<HTMLIFrameElement>select('iframe', proxy.parent.element)).contentWindow.focus();
        }
        if (proxy.parent.editorMode === 'HTML') { (this as NotifyArgs).selection.restore(); }
        if (proxy.parent.formatter.getUndoRedoStack().length === 0) {
            proxy.parent.formatter.saveData();
        }
        (this as NotifyArgs).selfLink.parent.formatter.process(
            (this as NotifyArgs).selfLink.parent, (this as NotifyArgs).args,
            ((this as NotifyArgs).args as ClickEventArgs).originalEvent, value);
        ((this as NotifyArgs).selfLink.parent.contentModule.getEditPanel() as HTMLElement).focus();
    }
    private isUrl(url: string): boolean {
        let regexp: RegExp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gi;
        return regexp.test(url);
    }
    private checkUrl(e: boolean): void {
        let linkEle: HTMLElement = this.dialogObj.element as HTMLElement;
        let linkUrl: HTMLElement = linkEle.querySelector('.e-rte-linkurl') as HTMLElement;
        if (e) {
            addClass([linkUrl], 'e-error');
            (linkUrl as HTMLInputElement).setSelectionRange(0, (linkUrl as HTMLInputElement).value.length);
            (linkUrl as HTMLInputElement).focus();
        } else {
            removeClass([linkUrl], 'e-error');
        }
    }
    private removeLink(e: NotifyArgs): void {
        if (this.parent.formatter.getUndoRedoStack().length === 0) {
            this.parent.formatter.saveData();
        }
        this.parent.formatter.process(
            this.parent, e.args, e.args,
            {
                selectNode: e.selectNode, selectParent: e.selectParent, selection: e.selection,
                subCommand: ((e.args as ClickEventArgs).item as IDropDownItemModel).subCommand
            });
        if (isIDevice() && this.parent.iframeSettings.enable) {
            (<HTMLIFrameElement>select('iframe', this.parent.element)).contentWindow.focus();
        } else {
            (this.parent.contentModule.getEditPanel() as HTMLElement).focus();
        }
        this.hideLinkQuickToolbar();
    }
    private openLink(e: NotifyArgs): void {
        let selectParentEle: HTMLElement = this.getAnchorNode(e.selectParent[0] as HTMLElement);
        if (selectParentEle.classList.contains('e-rte-anchor') || selectParentEle.tagName === 'A') {
            this.parent.formatter.process(
                this.parent, e.args, e.args,
                {
                    url: (selectParentEle as HTMLAnchorElement).href,
                    target: (selectParentEle as HTMLAnchorElement).target === '' ? '_self' : '_blank', selectNode: e.selectNode,
                    subCommand: ((e.args as ClickEventArgs).item as IDropDownItemModel).subCommand
                });
        }
    }
    private getAnchorNode(element: HTMLElement): HTMLElement {
        let selectParent: HTMLElement = closest(element, 'a') as HTMLElement;
        return <HTMLElement>(selectParent ? selectParent : element);
    }
    private editLink(e: NotifyArgs): void {
        let selectParentEle: HTMLElement = this.getAnchorNode(e.selectParent[0] as HTMLElement);
        if (selectParentEle.classList.contains('e-rte-anchor') || selectParentEle.tagName === 'A') {
            let linkUpdate: string = this.i10n.getConstant('dialogUpdate');
            let inputDetails: { [key: string]: string } = {
                url: (selectParentEle as HTMLAnchorElement).getAttribute('href'), text: selectParentEle.innerText,
                title: selectParentEle.title, target: (selectParentEle as HTMLAnchorElement).target,
                header: this.i10n.getConstant('editLink'), btnText: linkUpdate
            };
            this.linkDialog(e, inputDetails);
        }
    }

    private cancelDialog(e: MouseEvent): void {
        (this as NotifyArgs).selfLink.parent.isBlur = false;
        (this as NotifyArgs).selfLink.dialogObj.hide({ returnValue: true } as Event);
        if (isIDevice()) {
            (this as NotifyArgs).selection.restore();
        } else {
            ((this as NotifyArgs).selfLink.parent.contentModule.getEditPanel() as HTMLElement).focus();
        }
    }

    private onDocumentClick(e: MouseEvent): void {
        let target: HTMLElement = <HTMLElement>e.target;
        if (!isNullOrUndefined(this.dialogObj) && ((
            !closest(target, '#' + this.dialogObj.element.id) && this.parent.toolbarSettings.enable &&
            this.parent.getToolbarElement() && !this.parent.getToolbarElement().contains(e.target as Node)) ||
            (((this.parent.getToolbarElement() && this.parent.getToolbarElement().contains(e.target as Node)) ||
            this.parent.inlineMode.enable) && !closest(target, '#' + this.parent.getID() + '_toolbar_CreateLink') &&
                !target.querySelector('#' + this.parent.getID() + '_toolbar_CreateLink')))
        ) {
            this.dialogObj.hide({ returnValue: true } as Event);
            this.parent.isBlur = true;
            dispatchEvent(this.parent.element, 'focusout');
        }
    }
    /**
     * Destroys the ToolBar.
     * @method destroy
     * @return {void}
     * @hidden
     */
    public destroy(): void {
        this.removeEventListener();
    }
    /**
     * For internal use only - Get the module name.
     */
    private getModuleName(): string {
        return 'link';
    }
}
