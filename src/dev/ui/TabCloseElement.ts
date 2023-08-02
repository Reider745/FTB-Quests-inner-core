/// <reference path="./StandartTabElement.ts"/>
/// <reference path="./UiStyle.ts"/>

class TabCloseElement extends StandartTabElement {
    public getTextureSlot(style: UiStyle): string {
        return "classic_close_button";
    }

    public isEdit(): boolean {
        return false;
    }

    public onClick(position: Vector, container: ItemContainer, tileEntity: TileEntity, window: UI.Window, canvas: android.graphics.Canvas, scale: number): boolean {
        this.tab.main.main.close();
        return false;
    }

    public onLongClick(position: Vector, container: ItemContainer, tileEntity: TileEntity, window: UI.Window, canvas: globalAndroid.graphics.Canvas, scale: number): boolean {
        return false;
    }
}