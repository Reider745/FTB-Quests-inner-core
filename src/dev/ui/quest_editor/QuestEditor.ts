/// <reference path="./api/selectedItemDialog.ts"/>

class QuestEditor extends StandartTabElement {
    public getTextureSlot(style: UiStyle): string {
        return "nbt.byte_array_closed";
    }
    public onClick(position: Vector, container: ItemContainer, tileEntity: TileEntity, window: UI.Window, canvas: globalAndroid.graphics.Canvas, scale: number): boolean {
        return false;
    }
}