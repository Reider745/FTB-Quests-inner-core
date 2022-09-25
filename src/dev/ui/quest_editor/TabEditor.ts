/// <reference path="./api/selectedItemDialog.ts"/>
/// <reference path="./api/Keyboard.ts"/>

Translation.addTranslation("Tab name:", {
    ru: "Имя вкладки:"
});

Translation.addTranslation("Tab icon:", {
    ru: "Иконка вкладки:"
});

class TabEditor extends StandartTabElement {
    public getTextureSlot(style: UiStyle): string {
        return "nbt.byte_array_closed";
    }
    public onClick(position: Vector, container: ItemContainer, tileEntity: TileEntity, window: UI.Window, canvas: globalAndroid.graphics.Canvas, scale: number): boolean {
        //new TabEditorDialog(this.tab.main, "Tab editor").openCenter();
        let self_tab = this.tab;
        new UiDialogSetting("Tab editor")
            .addElement(new SettingTextElement("Tab name:", 10))
            .addElement(new SettingKeyboardElement("Tab name", "name"))
            .addElement(new SettingTextElement("Tab icon:", 10))
            .addElement(new SettingIconElement("icon"))
            .setCloseHandler(function(self){
                let path = self_tab.main.path;
                let configs = self.configs;
                if(path){
                    let json: any = FileTools.ReadJSON(path);
                    if(json.type == "main"){
                        let directory = UiJsonParser.getDirectory(path);
                        let text = configs.name;
                        let id = self_tab.main.getIdTab(text);
                        let item = configs.icon;
                        json.tabs.push("tabs/"+id+".json");
                        FileTools.WriteJSON(path, json, true);
                        if(!FileTools.isExists(directory+"tabs"))
                            FileTools.mkdir(directory+"tabs");
                        FileTools.WriteJSON(directory+"tabs/"+id+".json", {
                            "type": "tab",
                            "name": text,
                            "identifier": id,
                            "item": {"id": item.fullId, "count": 1, "data": 0},
                            "isLeft": true,
                            "quests": []
                        }, true);

                        let tab = new StandartTabElement(id);
                        tab.setDisplayName(text)
                        tab.setItem({
                            id: item._id,
                            count: 1,
                            data: 0
                        });
                        tab.path = directory+"tabs/"+id+".json";
                        self_tab.main.addRenderLeft(tab);
                        self_tab.main.group.close();
                        self_tab.main.build(self_tab.main.container).open();
                    }
                }
            })
            .openCenter();
        return false;
    }
}