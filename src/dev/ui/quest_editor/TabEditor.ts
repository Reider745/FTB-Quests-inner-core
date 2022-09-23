/// <reference path="./api/selectedItemDialog.ts"/>

class TabEditorDialog extends UiDialogBase {
    constructor(title: string){
        super(title);
    }
    public getSize(): Size {
        let size = super.getSize();
        return size;
    }
    public build(): TabEditorDialog {
        super.build();
        return this;
    }
};

class TabEditor extends StandartTabElement {
    public getTextureSlot(style: UiStyle): string {
        return "nbt.byte_array_closed";
    }
    public onClick(position: Vector, container: ItemContainer, tileEntity: TileEntity, window: UI.Window, canvas: globalAndroid.graphics.Canvas, scale: number): boolean {
        new SelectedItemDialog("Selected item").getSelectedItem(function(item){
            alert(item.fullId);
        }).openCenter();
        new TabEditorDialog("Tab editor").openCenter();
        return false;
    }
}