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
        if(this.tab.main.selected_tab === null || this.tab.main.selected_tab.path === undefined)
            return false;
        let ui = new UiDialogSetting("Quest editor")
            .addElement(new SettingTextElement("Quest name:", 10), true)
            .addElement(new SettingKeyboardElement("Quest name", "name"))
            .addElement(new SettingTextElement("Description:", 10), true)
            .addElement(new SettingKeyboardElement("Quest description", "description"))
            .addElement(new SettingTextElement("Quest icon:", 10), true)
            .addElement(new SettingIconElement("icon", 45))
            .addElement(new SettingTextElement("x:", 10), true)
            .addElement(new SettingNumbersElement("x", 0, 1000, 30))
            .addElement(new SettingTextElement("y:", 10), true)
            .addElement(new SettingNumbersElement("y", 0, 1000, 30))
            .addElement(new SettingTextElement("size:", 10), true)
            .addElement(new SettingNumbersElement("size", 0, 100, 5, 60))

            .addElement(new SettingTextElement("Dialog:", 25))
            .addElement(new SettingTextElement("input:", 10), true)
            .addElement(new SettingItemsElement("input", 50))
            .addElement(new SettingTextElement("output:", 10), true)
            .addElement(new SettingItemsElement("output", 50))
            .addElement(new SettingTextElement("Quest name:", 10), true)
            .addElement(new SettingKeyboardElement("Quest name", "dialog_name"))
            .addElement(new SettingTextElement("Description:", 10), true)
            .addElement(new SettingKeyboardElement("Quest description", "dialog_description"))

            .addElement(new SettingTextElement("Give:", 25))
            .addElement(new SettingStringsElement("type_give", ["recipe", "destroy"], "recipe"));
        let quests = this.tab.main.selected_tab.getAllQuest();
        if(quests.length > 0){
            quests.unshift("");
            ui.addElement(new SettingStringsElement("line", quests));
        }
        let self_tab = this;
        function tab_save(object: IUiTabs, configs: any, path: string) {
            let id = self_tab.tab.main.selected_tab.tab.getIdQuest(configs.name);
            object.quests.push("quests/"+id+"_"+self_tab.tab.main.selected_tab.getId()+".json");
            let save: IUiQuest = {
                type: "quest",
                item: {id: configs.icon.fullId, count: 1, data: 0},
                identifier: id,
                name: configs.name,
                x: configs.x,
                y: configs.y,
                size: configs.size,
                dialog: {
                    input: (() => {
                        let items = [];
                        let items_ = configs.input;
                        for(let i in items_)
                            items.push({id: items_[i].fullId, count: 1, data: 0});
                        return items;
                    })(),
                    output: (() => {
                        let items = [];
                        let items_ = configs.output;
                        for(let i in items_)
                            items.push({id: items_[i].fullId, count: 1, data: 0});
                        return items;
                    })(),
                    give_item: true,
                    title: configs.dialog_name,
                    description: configs.dialog_description
                },
                description: configs.description,
                give: [
                    {
                        type: configs.type_give,
                        items: (() => {
                            let items = [];
                            let items_ = configs.input;
                            for(let i in items_)
                                items.push(items_[i].fullId);
                            return items;
                        })(),
                        block: {
                            id: (configs.input[0]||{}).fullId||"VanillaBlockID.stone",
                            data: 0
                        }
                    }
                ],
                lines: (() => {
                    if(configs.line && configs.line != "")
                        return [configs.line];
                    return [];
                })()
            };

            
            if(!FileTools.isExists(UiJsonParser.getDirectory(path)+"quests"))
                FileTools.mkdir(UiJsonParser.getDirectory(path)+"quests");
            FileTools.WriteJSON(UiJsonParser.getDirectory(path)+"quests/"+id+"_"+self_tab.tab.main.selected_tab.getId()+".json", save, true);

            UiJsonParser.buildQuest(save, UiJsonParser.getDirectory(path)+"quests/"+id+"_"+self_tab.tab.main.selected_tab.getId()+".json", id);
            UiJsonParser.buildQuestFunctions(self_tab.tab.main, self_tab.tab.main.selected_tab, id, self_tab.tab.main.selected_tab.isLeft);

            self_tab.tab.main.group.close();
            self_tab.tab.main.build(self_tab.tab.main.container).open();
        }
        ui.setCloseHandler(function(self){
            let path =  self_tab.tab.main.selected_tab.path;
            let configs = self.configs;
            if(path){
                let json: IUiMain | IUiTabs = FileTools.ReadJSON(path);
                if(json.type == "main"){
                    for(let i in json.tabs){
                        let element = json.tabs[i]
                        if(typeof element != "string"){
                            if(element.identifier == self_tab.tab.main.selected_tab.getId()){
                                tab_save(element, configs, path);
                                break;
                            }}
                    }
                }else if(json.type == "tab")
                    tab_save(json, configs, path);
                FileTools.WriteJSON(path, json, true);
            }
        }).openCenter();
        return false;
    }
}