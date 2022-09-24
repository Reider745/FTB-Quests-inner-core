/// <reference path="./api/selectedItemDialog.ts"/>
/// <reference path="./api/UiDialogSetting.ts"/>

Translation.addTranslation('Quest name:', {
    ru: "Имя квеста"
});
Translation.addTranslation('Quest icon:', {
    ru: "Иконка квеста:"
});
Translation.addTranslation('Description:', {
    ru: "Опиание:"
});

class QuestEditor extends StandartTabElement {
    public getTextureSlot(style: UiStyle): string {
        return "nbt.byte_array_closed";
    }
    public onClick(position: Vector, container: ItemContainer, tileEntity: TileEntity, window: UI.Window, canvas: globalAndroid.graphics.Canvas, scale: number): boolean {
        new UiDialogSetting("Quest editor")
            .addElement(new SettingTextElement("Quest name:", 10))
            .addElement(new SettingKeyboardElement("Quest name", "name"))
            .addElement(new SettingTextElement("Quest icon:", 10))
            .addElement(new SettingIconElement("icon", 45))
            .addElement(new SettingTextElement("x:", 10))
            .addElement(new SettingNumbersElement("x", 0, 1000, 10))
            .addElement(new SettingTextElement("y:", 10))
            .addElement(new SettingNumbersElement("y", 0, 1000, 10))
            .addElement(new SettingTextElement("size:", 10))
            .addElement(new SettingNumbersElement("size", 0, 100, 5))
            .addElement(new SettingTextElement("Description:", 10))
            .addElement(new SettingKeyboardElement("Quest description", "description"))
            .setCloseHandler(function(self){
                alert(JSON.stringify(self.configs));
            })
            .openCenter();
        return false;
    }
}