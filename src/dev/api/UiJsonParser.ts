interface IQuestRecipes {
    type: "recipe",
    items: string[]
}

interface IQuestBlockDestroy {
    type: "destroy",
    block: {
        id: string,
        data: number
    }
}

interface IQuestInventory {
    type: "inventory"
}

interface IUiQuest {
    type?: "quest";
    identifier: string,
    name: string,
    item: {id: any, data: number, count: number},
    x: number,
    y: number,
    give?:(IQuestRecipes | IQuestBlockDestroy | IQuestInventory)[],
    lines: string[],
    size: number,
    dialog: {
        input: {id: string, data: number, count: number}[],
        output:  {id: string, data: number, count: number}[],
        give_item: boolean,
        description: string,
        title: string
    },
    description: string,
};

interface IUiTabs {
    type?: "tab";
    name: string,
    identifier: string,
    item: {id: any, data: number, count: number},
    isLeft: boolean,
    quests:  (string | IUiQuest) [];
};

interface IUiMain {
    type?: "main";
    identifier: string;
    save: boolean;
    debug: boolean;
    setting?: boolean;
    setting_save_path?: string;
    item: {
        createItem?: {
            id: string,
            name: string,
            texture: {
                name: string,
                meta: number
            }
        },
        ui_item: string
    },
    translations?: string[];
    tabs: (string | IUiTabs) [];
}

class UiJsonParser {
    static mains: {[key: string]: {path: string, main: IUiMain}} = {};
    static tab: {[key: string]: {path: string, tab: IUiTabs}} = {};
    static quest: {[key: string]: {path: string, quest: IUiQuest}} = {};

    static tab_build: {[key: string]: {isLeft: boolean, tab: StandartTabElement, quests: string[]}} = {};
    static quest_build: {[key: string]: {quest: Quest}} = {};

    static translations: {[key: string]: {[key: string]: string}} = {};

    static getDirectory(path: string){
        let files: string[] = path.replace(/\\/g, '/').split("/");
        files.pop();
        let result = "";
        for(let file of files)
            result+=file+"/";
        return result;
    }

    static getTranslations(name: string): {[key: string]: string}{
        if(this.translations[name]){
            this.translations[name].en = name;
            return this.translations[name];
        }
        return {en: name};
    }

    public path: string;

    constructor(path: string){
        if(!FileTools.isExists(path)) return;
        this.path = path;
        let object: IUiMain | IUiTabs | IUiQuest = FileTools.ReadJSON(path);
        if(object.type == "main"){
            if(UiJsonParser.mains[path]) return;
            UiJsonParser.mains[path] = {path, main: object};

            if(object.translations){
                let translations = {};
                for(let i in object.translations){
                    let file = object.translations[i];
                    let _path = UiJsonParser.getDirectory(path)+file;
                    let lang = file.split("/").pop().split(".")[0];

                    let objects = FileTools.ReadText(_path).split("\n");
                    for(let i = 0;i < objects.length;i++){
                        let text = objects[i].split(":=");

                        translations[text[0]] = translations[text[0]] || {};
                        translations[text[0]][lang] = (text[1]||"").replace("\\n", "\n");
                    }
                }
                for(let key in translations){
                    UiJsonParser.translations[key] = translations[key];
                    Translation.addTranslation(key, translations[key]);
                }
            }
            for(let i in object.tabs){
                let element = object.tabs[i];
                if(typeof element == "string")
                    new UiJsonParser(UiJsonParser.getDirectory(path)+element);
                else{
                    for(let i in element.quests){
                        let _element = element.quests[i];
                        if(typeof _element == "string")
                            new UiJsonParser(UiJsonParser.getDirectory(path)+_element);
                        else
                            UiJsonParser.quest[path+"_"+i] = {path, quest: _element};
                    }
                    UiJsonParser.tab[path+"_"+element.identifier] = {path, tab: element};
                }
            }
        }else if(object.type == "tab"){
            if(UiJsonParser.tab[path]) return;
            for(let i in object.quests){
                let element = object.quests[i];
                if(typeof element == "string")
                    new UiJsonParser(UiJsonParser.getDirectory(path)+element);
                else
                    UiJsonParser.quest[path+"_"+i] = {path, quest: element};
            }
            UiJsonParser.tab[path] = {path, tab: object};
        }else if(object.type == "quest"){
            if(UiJsonParser.quest[path]) return;
            UiJsonParser.quest[path] = {path, quest: object};
        }
    }

    static buildTab(element: IUiTabs, path: string, key?: string): StandartTabElement {
        let tab = new StandartTabElement(element.identifier);
        tab.setDisplayName(element.name);
        element.item.id = eval(element.item.id);
        tab.setItem(element.item);
        tab.path = path;

        let quests = [];
        for(let i in element.quests){
            let quest = element.quests[i];
            if(typeof quest == "string")
                quests.push(UiJsonParser.getDirectory(path)+quest);
            else
                quests.push(path+"_"+i);
        }

        UiJsonParser.tab_build[key || element.identifier] = {
            isLeft: element.isLeft,
            tab: tab,
            quests
        };
        return tab;
    }

    static buildQuest(element: IUiQuest, path: string, key?: string): Quest{
        element.item.id = eval(element.item.id);
        let quest = new Quest({
            id: element.identifier,
            item: element.item,
            x: element.x,
            y: element.y,
            lines: element.lines,
            size: element.size

        });
        quest.quest = element;
        quest.path = path;
        let dialog = new UiDialog(element.dialog.title, element.dialog.description);
        let items = [];
        for(let i in element.dialog.input){
            element.dialog.input[i].id = eval(element.dialog.input[i].id);
            items.push({item: element.dialog.input[i]});
        }
        dialog.setInput(items);
        items = [];
        for(let i in element.dialog.output){
            element.dialog.output[i].id = eval(element.dialog.output[i].id);
            items.push({item: element.dialog.output[i]});
        }
        dialog.setResult(items);
        quest.setDialog(dialog);
        
        UiJsonParser.quest_build[key||element.identifier] = {
            quest: quest
        };
        UiJsonParser.quest[key||element.identifier] = {quest: element, path: path};
        return quest;
    }

    static buildQuestFunctions(main: UiMainBuilder, tab: StandartTabElement, key: string, isLeft: boolean, added: boolean = true){
        if(!UiJsonParser.quest_build[key]) return null;
        let quest: any = UiJsonParser.quest_build[key].quest;
        let object = UiJsonParser.quest[key];
        let items = [];
        for(let i in object.quest.dialog.output){
            object.quest.dialog.output[i].id = eval(object.quest.dialog.output[i].id);
            items.push(object.quest.dialog.output[i]);
        }
        if(object.quest.dialog.give_item)
            GiveItems.registerGive(main, isLeft, tab.getId(), quest.getId(), items);
        if(object.quest.give)
            for(let i in object.quest.give){
                let give = object.quest.give[i];
                if(give.type == "recipe")
                    RecipeCheck.registerRecipeCheck(main, UiJsonParser.getIds(give.items), isLeft, tab.getId(), quest.getId(), object.quest.name, object.quest.description);
                else if(give.type == "destroy")
                    DestroyBlocks.registerDestroyBlocks(main, [eval(give.block.id)+":"+give.block.data], isLeft, tab.getId(), quest.getId(), object.quest.name, object.quest.description);
                else if(give.type == "inventory")
                    quest.dialog.setInventoryCheck(true);
            }
        if(added)
            tab.addQuest(quest);
        else
            tab.replaceQuest(quest.getId(), quest);
    }

    static buildTabFunctions(main: UiMainBuilder, tab: StandartTabElement, isLeft: boolean, added: boolean = true){
        tab.setUiTabsBuilder(main.getTabsBuilder(isLeft));
        if(added)
            main.addRender(isLeft, tab);
        else
            main.getTabsBuilder(isLeft).replaceTab(tab.getId(), tab);
    }

    static getLangs(path: string): string[]{
        let file: IUiMain = FileTools.ReadJSON(path);
        let langs = [];
        for(let path of file.translations)
            langs.push(path.replace(/\\/g, '/').split("/").pop().split(".")[0]);
        return langs
    }

    static saveLang(pathMain: string, translations: {[key: string]: string}){
        this.translations[translations.en] = translations;
        let json: IUiMain = FileTools.ReadJSON(pathMain);
        for(let path of json.translations){
            let text = FileTools.ReadText(this.getDirectory(pathMain) + path);
            let translation = translations[path.replace(/\\/g, '/').split("/").pop().split(".")[0]];
            if(translation && path.replace(/\\/g, '/').split("/").pop().split(".")[0] != translation) text+="\n"+translations.en+":="+translation;
            FileTools.WriteText(this.getDirectory(pathMain) + path, text);
        }
    }

    static getIds(ids: string[]): number[] {
        let result = [];
        for(let i in ids)
            result.push(eval(ids[i]));
        return result;
    }
    static getId(ids: string): number {
        return eval(ids);
    }
};

new UiJsonParser(__dir__+"book.json");

Callback.addCallback("PostLoaded", function(){
    for(const key in UiJsonParser.quest)
        UiJsonParser.buildQuest(UiJsonParser.quest[key].quest, UiJsonParser.quest[key].path, key);
    for(const key in UiJsonParser.tab)
        UiJsonParser.buildTab(UiJsonParser.tab[key].tab, UiJsonParser.tab[key].path, key);
    
    for(const key in UiJsonParser.mains){
        let element: IUiMain = UiJsonParser.mains[key].main;
        if(element.item.createItem){
            IDRegistry.genItemID(element.item.createItem.id);
            Item.createItem(element.item.createItem.id, element.item.createItem.name, element.item.createItem.texture, {
                stack: 1
            });
        }
        let main = new UiMainBuilder(element.identifier);
        main.path = UiJsonParser.mains[key].path;
        main.addRenderRight(new TabCloseElement("close_button"));
        main.setDebug(element.debug);

        if(element.setting === undefined || element.setting)
            main.addRenderRight(new TabSetting("setting_tab", "settings", UiJsonParser.getDirectory(main.path) + (element.setting_save_path || "book_save.json"))
                .setHandlerClose((config) => {
                    main.setDebug(config.quest_editor);
                })
                .apply()
            );
        
        for(let i in element.tabs){
            let tab = element.tabs[i];
            if(typeof tab == "string")
                var id = UiJsonParser.getDirectory(UiJsonParser.mains[key].path)+tab;
            else
                var id = UiJsonParser.mains[key].path+"_"+tab.identifier;
            let _tab = UiJsonParser.tab_build[id];
            if(!_tab) continue;
            UiJsonParser.buildTabFunctions(main, _tab.tab, _tab.isLeft);
            for(let i in _tab.quests)
                UiJsonParser.buildQuestFunctions(main, _tab.tab, _tab.quests[i], _tab.isLeft);
        }
        if(element.save)
            main.registerSave();
        main.registerItem(eval(element.item.ui_item));
        Callback.invokeCallback("MainRegister", main.getClientName(), main);
    }
    Callback.invokeCallback("EndRegisterUi");
});