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
    static openEditor(main: UiMainBuilder, _tab: StandartTabElement, isLeft: boolean, added: boolean){
        let ui = new UiDialogSetting("Tab editor")
            .addElement(new SettingTextElement("Tab name:", 10))
            .addElement(new SettingTranslationElement("name", "Tab name", UiJsonParser.getLangs(main.path)))
            .addElement(new SettingTextElement("Tab icon:", 10))
            .addElement(new SettingIconElement("icon"))
            .setCloseHandler(function(self){
                let path = main.path;
                let configs = self.configs;
                if(path){
                    let json: IUiMain = FileTools.ReadJSON(path);
                    if(json.type == "main"){
                        let directory = UiJsonParser.getDirectory(path);
                        let text = configs.name.en;
                        let id = _tab === null ? main.getIdTab(text) : _tab.getId();
                        let item = configs.icon;
                        
                        if(added){ json.tabs.push("tabs/"+id+".json"); FileTools.WriteJSON(path, json, true);}

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

                        UiJsonParser.saveLang(path, configs.name);
                        
                        UiJsonParser.buildTabFunctions(main, UiJsonParser.buildTab(tab, directory+"tabs/"+id+".json", id), isLeft, added);
                        FileTools.WriteJSON(directory+"tabs/"+id+".json", tab, true);
                        main.open();
                    }
                }
            })
        if(!added)
            ui.setConfig({
                name: UiJsonParser.getTranslations(_tab.getDisplayName()),
                icon: SelectedItemDialog.getItemSelectedById(_tab.getItem().id)
            })
        ui.openCenter();
    }
    public isEdit(): boolean {
        return false;
    }
    public onClick(position: Vector, container: ItemContainer, tileEntity: TileEntity, window: UI.Window, canvas: globalAndroid.graphics.Canvas, scale: number): boolean {
        TabEditor.openEditor(this.tab.main, null, this.isLeft, true);
        return false;
    }
}