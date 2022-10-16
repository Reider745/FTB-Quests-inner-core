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
        let self_tab = this;
        new UiDialogSetting("Tab editor")
            .addElement(new SettingTextElement("Tab name:", 10))
            .addElement(new SettingKeyboardElement("Tab name", "name"))
            .addElement(new SettingTextElement("Tab icon:", 10))
            .addElement(new SettingIconElement("icon"))
            .setCloseHandler(function(self){
                let path = self_tab.tab.main.path;
                let configs = self.configs;
                if(path){
                    let json: any = FileTools.ReadJSON(path);
                    if(json.type == "main"){
                        let directory = UiJsonParser.getDirectory(path);
                        let text = configs.name;
                        let id = self_tab.tab.main.getIdTab(text);
                        let item = configs.icon;
                        json.tabs.push("tabs/"+id+".json");
                        FileTools.WriteJSON(path, json, true);
                        if(!FileTools.isExists(directory+"tabs"))
                            FileTools.mkdir(directory+"tabs");
                        let tab: IUiTabs = {
                            "type": "tab",
                            "name": text,
                            "identifier": id,
                            "item": {"id": item.fullId, "count": 1, "data": 0},
                            "isLeft": true,
                            "quests": []
                        };
                        FileTools.WriteJSON(directory+"tabs/"+id+".json", tab, true);
                        UiJsonParser.buildTabFunctions(self_tab.tab.main, UiJsonParser.buildTab(tab, directory+"tabs/"+id+".json", id), self_tab.isLeft);

                        self_tab.tab.main.group.close();
                        self_tab.tab.main.build(self_tab.tab.main.container).open();
                    }
                }
            })
            .openCenter();
        return false;
    }
}