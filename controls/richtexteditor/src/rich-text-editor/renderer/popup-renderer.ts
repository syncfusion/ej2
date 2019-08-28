import { Popup } from '@syncfusion/ej2-popups';
import { CLS_QUICK_POP } from '../base/classes';
import { IRenderer, IRichTextEditor } from '../base/interface';
import { BaseQuickToolbar } from '../actions/base-quick-toolbar';
import * as events from '../base/constant';
import { isBlazor } from '@syncfusion/ej2-base';
/**
 * `Popup renderer` module is used to render popup in RichTextEditor.
 * @hidden
 */
export class PopupRenderer implements IRenderer {
    private popupObj: Popup;
    private popupPanel: Element;
    protected parent: IRichTextEditor;

    /**
     * Constructor for popup renderer module
     */
    constructor(parent?: IRichTextEditor) {
        this.parent = parent;
    }

    private quickToolbarOpen(): void {
        let args: Popup = isBlazor() ? null : this.popupObj;
        this.parent.trigger(events.quickToolbarOpen, args);
    }

    public renderPopup(args: BaseQuickToolbar): void {
        this.setPanel(args.element);
        this.renderPanel();
        args.popupObj = new Popup(args.element, {
            targetType: 'relative',
            relateTo: this.parent.element,
            open: this.quickToolbarOpen.bind(this)
        });
        this.popupObj = args.popupObj;
        args.popupObj.hide();
    }

    /**
     * The function is used to add popup class in Quick Toolbar
     */
    public renderPanel(): void {
        this.getPanel().classList.add(CLS_QUICK_POP);
    }

    /**
     * Get the popup element of RichTextEditor
     * @return {Element}
     */
    public getPanel(): Element {
        return this.popupPanel;
    }

    /**
     * Set the popup element of RichTextEditor
     * @param  {Element} panel
     */
    public setPanel(panel: Element): void {
        this.popupPanel = panel;
    }
}