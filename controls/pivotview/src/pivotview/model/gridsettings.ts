import { Property, ChildProperty, EmitType, Event } from '@syncfusion/ej2-base';
import { ExcelHeaderQueryCellInfoEventArgs, GridLine, ClipMode, BeforeCopyEventArgs, PrintMode } from '@syncfusion/ej2-grids';
import { ExcelQueryCellInfoEventArgs, PdfHeaderQueryCellInfoEventArgs, SelectionSettingsModel } from '@syncfusion/ej2-grids';
import { QueryCellInfoEventArgs, HeaderCellInfoEventArgs, CellSelectEventArgs, RowSelectEventArgs } from '@syncfusion/ej2-grids';
import { CellSelectingEventArgs, CellDeselectEventArgs, ResizeArgs, PrintEventArgs, TextWrapSettings } from '@syncfusion/ej2-grids';
import { ContextMenuItemModel, RowDeselectEventArgs, PdfQueryCellInfoEventArgs, ColumnDragEventArgs } from '@syncfusion/ej2-grids';
import { CheckboxSelectionType, SelectionType } from '@syncfusion/ej2-grids';
import { BeforeOpenCloseMenuEventArgs, MenuEventArgs } from '@syncfusion/ej2-navigations';
import { ColumnRenderEventArgs, SelectionSettings } from '../../common';
import { PivotContextMenuItem, SelectionMode, PivotCellSelectionMode } from '../../common/base/enum';

/**
 * Interface for a class SelectionSettings
 */
export class PivotSelectionSettings extends ChildProperty<PivotSelectionSettings> {

    /**
     * Pivot widget supports row, column, cell, and both (row and column) selection mode. 
     * @default Row
     */
    @Property('Row')
    public mode: SelectionMode;

    /**
     * The cell selection modes are flow and box. It requires the selection 
     * `mode` to be either cell or both.
     * * `Flow`: Selects the range of cells between start index and end index that also includes the other cells of the selected rows.
     * * `Box`: Selects the range of cells within the start and end column indexes that includes in between cells of rows within the range.
     * * `BoxWithBorder`: Selects the range of cells as like Box mode with borders.
     * @default Flow
     */
    @Property('Flow')
    public cellSelectionMode: PivotCellSelectionMode;

    /**
     * Defines options for selection type. They are 
     * * `Single`: Allows selection of only a row or a column or a cell. 
     * * `Multiple`: Allows selection of multiple rows or columns or cells. 
     * @blazorType PivotSelectionType
     * @default Single 
     */
    @Property('Single')
    public type: SelectionType;

    /**
     * If 'checkboxOnly' set to true, then the selection is allowed only through checkbox.
     * 
     * > To enable checkboxOnly selection, should specify the column type as`checkbox`.
     * @default false 
     */
    @Property(false)
    public checkboxOnly: boolean;

    /**
     * If 'persistSelection' set to true, then the selection is persisted on all operations.
     * For persisting selection, any one of the column should be enabled as a primary key.
     * @default false 
     */
    @Property(false)
    public persistSelection: boolean;

    /**
     * Defines options for checkbox selection Mode. They are 
     * * `Default`: This is the default value of the checkboxMode. In this mode, user can select multiple rows by clicking rows one by one.
     * * `ResetOnRowClick`: In ResetOnRowClick mode, on clicking a row it will reset previously selected row and also multiple
     *  rows can be selected by using CTRL or SHIFT key.
     * @blazorType PivotCheckboxSelectionType
     * @default Default
     */
    @Property('Default')
    public checkboxMode: CheckboxSelectionType;

    /**
     * If 'enableSimpleMultiRowSelection' set to true, then the user can able to perform multiple row selection with single clicks.
     * @default false
     */
    @Property(false)
    public enableSimpleMultiRowSelection: boolean;
}

/** 
 *  Represents Pivot widget model class.
 */
export class GridSettings extends ChildProperty<GridSettings> {

    /**
     * Defines the content height of Grid.
     * @default 'auto'
     */
    @Property('auto')
    public height: number | string;

    /**
     * Defines the content width of Grid.
     * @default 'auto'
     */
    @Property('auto')
    public width: number | string;

    /**
     * Defines the mode of grid lines. The available modes are,
     * * `Both`: Displays both horizontal and vertical grid lines.
     * * `None`: No grid lines are displayed.
     * * `Horizontal`: Displays the horizontal grid lines only.
     * * `Vertical`: Displays the vertical grid lines only.
     * * `Default`: Displays grid lines based on the theme.
     * @blazorType PivotGridLine
     * @default Both
     */
    @Property('Both')
    public gridLines: GridLine;

    /**
     * If `allowTextWrap` set to true,  
     * then text content will wrap to the next line when its text content exceeds the width of the Column Cells. 
     * @default false     
     */
    @Property(false)
    public allowTextWrap: boolean;

    /**
     * If `allowReordering` is set to true, Grid columns can be reordered.
     * Reordering can be done by drag and drop of a particular column from one index to another index.
     * > If Grid is rendered with stacked headers, reordering is allowed only at the same level as the column headers.
     * @default false
     */
    @Property(false)
    public allowReordering: boolean;

    /**
     * If `allowResizing` is set to true, Grid columns can be resized.
     * @default true
     */
    @Property(true)
    public allowResizing: boolean;

    /**
     * Defines the height of Grid rows.
     * @default null
     */
    @Property(null)
    public rowHeight: number;

    /**
     * Defines the height of Grid rows.
     * @default 110
     */
    @Property(110)
    public columnWidth: number;

    /**
     * Defines the cell content's overflow mode. The available modes are
     * * `Clip` -  Truncates the cell content when it overflows its area.
     * * `Ellipsis` -  Displays ellipsis when the cell content overflows its area.
     * * `EllipsisWithTooltip` - Displays ellipsis when the cell content overflows its area
     * also it will display tooltip while hover on ellipsis applied cell.
     * @blazorType PivotClipMode
     * @default Ellipsis
     */
    @Property('Ellipsis')
    public clipMode: ClipMode;

    /**
     * If `allowSelection` is set to true, it allows selection of (highlight row) Grid records by clicking it.
     * @default false
     */
    @Property(false)
    public allowSelection: boolean;

    /**
     * The `selectedRowIndex` allows you to select a row at initial rendering.
     * You can also get the currently selected row index.
     * @default -1
     */
    @Property(-1)
    public selectedRowIndex: number;

    /**
     * Configures the selection settings.
     * @default {mode: 'Row', cellSelectionMode: 'Flow', type: 'Single'}
     */
    @Property({ mode: 'Row', cellSelectionMode: 'Flow', type: 'Single' })
    public selectionSettings: SelectionSettingsModel | SelectionSettings;

    /**
     * Configures the text wrap settings of the Grid.
     * @default { WrapMode: 'Both'}
     */
    @Property({ WrapMode: 'Both' })
    public textWrapSettings: TextWrapSettings;

    /**
     * Defines the print modes. The available print modes are
     * * `AllPages`: Prints all pages of the Grid.
     * * `CurrentPage`: Prints the current page of the Grid.
     * @blazorType PivotPrintMode
     * @default AllPages
     */
    @Property('AllPages')
    public printMode: PrintMode;

    /**    
     * `contextMenuItems` defines both built-in and custom context menu items.
     * @blazorType List<PivotContextMenuItem>       
     * @default null
     */
    @Property()
    public contextMenuItems: PivotContextMenuItem[] | ContextMenuItemModel[];

    /**
     * Triggers before Grid copy action.
     * @event
     * @deprecated
     */
    @Event()
    public beforeCopy: EmitType<BeforeCopyEventArgs>;

    /**
     * Triggers after print action is completed.
     * @event
     * @deprecated
     */
    @Event()
    public printComplete: EmitType<PrintEventArgs>;

    /**
     * Triggers before the print action starts.
     * @event
     * @deprecated
     */
    @Event()
    public beforePrint: EmitType<PrintEventArgs>;

    /** 
     * Triggers before context menu opens.
     * @event
     * @deprecated
     */
    @Event()
    public contextMenuOpen: EmitType<BeforeOpenCloseMenuEventArgs>;

    /** 
     * Triggers when click on context menu.
     * @event
     * @deprecated
     */
    @Event()
    public contextMenuClick: EmitType<MenuEventArgs>;

    /** 
     * Triggered every time a request is made to access cell information, element, or data.
     * This will be triggered before the cell element is appended to the Grid element.
     * @event
     * @deprecated
     */
    @Event()
    public queryCellInfo: EmitType<QueryCellInfoEventArgs>;

    /** 
     * Triggered for column header.
     * This will be triggered before the cell element is appended to the Grid element.
     * @event
     * @deprecated
     */
    @Event()
    public headerCellInfo: EmitType<HeaderCellInfoEventArgs>;

    /** 
     * Triggers before row selection occurs.
     * @event
     * @deprecated
     */
    @Event()
    public rowSelecting: EmitType<RowSelectEventArgs>;

    /** 
     * Triggers after a row is selected.
     * @event
     * @deprecated
     */
    @Event()
    public rowSelected: EmitType<RowSelectEventArgs>;

    /** 
     * Triggers before deselecting the selected row.
     * @event
     * @deprecated
     */
    @Event()
    public rowDeselecting: EmitType<RowDeselectEventArgs>;

    /** 
     * Triggers when a selected row is deselected.
     * @event
     * @deprecated
     */
    @Event()
    public rowDeselected: EmitType<RowDeselectEventArgs>;

    /** 
     * Triggers before any cell selection occurs.
     * @event
     * @deprecated
     */
    @Event()
    public cellSelecting: EmitType<CellSelectingEventArgs>;

    /** 
     * Triggers after a cell is selected.
     * @event
     * @deprecated
     */
    @Event()
    public cellSelected: EmitType<CellSelectEventArgs>;

    /** 
     * Triggers before the selected cell is deselecting.
     * @event
     * @deprecated
     */
    @Event()
    public cellDeselecting: EmitType<CellDeselectEventArgs>;

    /** 
     * Triggers when a particular selected cell is deselected.
     * @event
     * @deprecated
     */
    @Event()
    public cellDeselected: EmitType<CellDeselectEventArgs>;

    /** 
     * Triggers when column resize starts.
     * @event
     * @deprecated
     */
    @Event()
    public resizeStart: EmitType<ResizeArgs>;

    /** 
     * Triggers on column resizing.
     * @event
     * @deprecated
     */
    @Event()
    public resizing: EmitType<ResizeArgs>;

    /** 
     * Triggers when column resize ends.
     * @event
     * @deprecated
     */
    @Event()
    public resizeStop: EmitType<ResizeArgs>;

    /** 
     * Triggers before exporting each header cell to PDF document. You can also customize the PDF cells.
     * @event
     * @deprecated
     */
    @Event()
    public pdfHeaderQueryCellInfo: EmitType<PdfHeaderQueryCellInfoEventArgs>;

    /** 
     * Triggers before exporting each cell to PDF document. You can also customize the PDF cells.
     * @event
     * @deprecated
     */
    @Event()
    public pdfQueryCellInfo: EmitType<PdfQueryCellInfoEventArgs>;

    /** 
     * Triggers before exporting each header cell to Excel file.
     * You can also customize the Excel cells.
     * @event
     * @deprecated
     */
    @Event()
    public excelHeaderQueryCellInfo: EmitType<ExcelHeaderQueryCellInfoEventArgs>;

    /** 
     * Triggers before exporting each cell to Excel file.
     * You can also customize the Excel cells.
     * @event
     * @deprecated
     */
    @Event()
    public excelQueryCellInfo: EmitType<ExcelQueryCellInfoEventArgs>;

    /**  
     * Triggers when column header element drag (move) starts. 
     * @event
     * @deprecated
     */
    @Event()
    public columnDragStart: EmitType<ColumnDragEventArgs>;

    /**  
     * Triggers when column header element is dragged (moved) continuously. 
     * @event
     * @deprecated
     */
    @Event()
    public columnDrag: EmitType<ColumnDragEventArgs>;

    /**  
     * Triggers when a column header element is dropped on the target column. 
     * @event
     * @deprecated
     */
    @Event()
    public columnDrop: EmitType<ColumnDragEventArgs>;

    /**
     * This allows to configure the column before it renders.
     * @event
     * @deprecated
     */
    @Event()
    public columnRender: EmitType<ColumnRenderEventArgs>;
}