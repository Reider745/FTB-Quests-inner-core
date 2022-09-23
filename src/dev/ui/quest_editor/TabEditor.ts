/// <reference path="./api/selectedItemDialog.ts"/>
/// <reference path="./api/Keyboard.ts"/>

Translation.addTranslation("Tab name", {
    ru: "Имя вкладки"
});

Translation.addTranslation("Tab icon:", {
    ru: "Иконка вкладки:"
});

class TabEditorDialog extends UiDialogBase {
    private main: UiMainBuilder;
    private tabName: string = null;
    private item: ItemSelected = items[0];

    constructor(main: UiMainBuilder, title: string){
        super(title);

        this.main= main;
    }
    public getSize(): Size {
        let size = super.getSize();
        let tabName = UiDialogBase.getSize(this.tabName ? this.tabName : Translation.translate("Tab name"), 20);

        size.width = Math.max(size.width, tabName.width+20);
        size.height += tabName.height;

        let iconText = UiDialogBase.getSize(Translation.translate("Tab icon:"), 20);

        size.width = Math.max(size.width, iconText.width+20);
        size.height += iconText.height;

        size.width = Math.max(size.width, 80);
        size.height += 80 + 30;

        return size;
    }
    public build(): TabEditorDialog {
        super.build();

        let size = super.getSize();
        let _size = this.getSize();
        let content = this.ui.getContent();
        let self = this;
        let text = this.tabName ? this.tabName : Translation.translate("Tab name");
        let tabName = UiDialogBase.getSize(text, 20);
        content.elements["tabName"] = {type: "text", multiline: true, font: {size: 20, color: android.graphics.Color.WHITE}, text: text, x: this.x, y: this.y + size.height + 10, clicker: {
            onClick(){
                new Keyboard(content.elements["tabName"].text).getText(function(text){
                    self.tabName = text;
                    self.close();
                    self.build();
                    self.openCenter();
                }).open();
            }
        }};

        content.elements["iconText"] = {type: "text", text: Translation.translate("Tab icon:"), x: this.x, y: this.y + size.height + 10 + tabName.height, font: {size: 20, color: android.graphics.Color.WHITE}};

        content.elements["icon"] = {type: "slot", bitmap: "_default_slot_empty", size: 60, x: this.x, y: this.y + size.height + 30 + tabName.height, source: {
            id: (self.item||{})._id||0,
            count: 1,
            data: 0
        }, clicker: {
            onClick(){
                new SelectedItemDialog("Selected item").getSelectedItem(function(item){
                    self.item = item;
                    self.close();
                    self.build();
                    self.openCenter();
                }).openCenter();
            }
        }};

        content.elements["save"] = {type: "text", text: "save", font: {size: 20, color: android.graphics.Color.WHITE}, x: this.x, y: this.y + size.height + 30 + tabName.height + 60, clicker: {
            onClick(){
                let path = self.main.path;
                if(path){
                    let json: any = FileTools.ReadJSON(path);
                    if(json.type == "main"){
                        let directory = UiJsonParser.getDirectory(path);
                        json.tabs.push(text+".json");
                        FileTools.WriteJSON(path, json, true);
                        FileTools.WriteJSON(directory+text+".json", {
                            "type": "tab",
                            "name": text,
                            "identifier": text,
                            "item": {"id": self.item.fullId, "count": 1, "data": 0},
                            "isLeft": true,
                            "quests": []
                        }, true);

                        let tab = new StandartTabElement(text);
                        tab.setDisplayName(text)
                        tab.setItem({
                            id: self.item._id,
                            count: 1,
                            data: 0
                        });
                        self.main.addRenderLeft(tab);
                        self.main.group.close();
                        self.main.build(self.main.container).open();
                    }
                }
                self.close();
            }
        }};

        content.elements["frame"].width = _size.width;
        content.elements["frame"].height = _size.height;
        content.elements["background"].clicker = {};

        this.ui.setContent(content);

        return this;
    }
};

class TabEditor extends StandartTabElement {
    public getTextureSlot(style: UiStyle): string {
        return "nbt.byte_array_closed";
    }
    public onClick(position: Vector, container: ItemContainer, tileEntity: TileEntity, window: UI.Window, canvas: globalAndroid.graphics.Canvas, scale: number): boolean {
        new TabEditorDialog(this.tab.main, "Tab editor").openCenter();
        return false;
    }
}