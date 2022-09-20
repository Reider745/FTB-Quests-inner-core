interface IQuestRecipes {
    type: "recipe",
    items: number[]
}

interface IQuestBlockDestroy {
    type: "destroy",
    blocks: {
        id: number,
        data: number
    }
}

interface IUiQuest {
    type?: "quest";
    identifier: string,
    name: string,
    item: ItemInstance,
    x: number,
    y: number,
    give:(IQuestRecipes | IQuestBlockDestroy)[],
    lines: string[],
    dialog: {
        input: [],
        output: [],
        description: string,
        title: string
    },
    description: string,
};

interface IUiTabs {
    type?: "tab";
    name: string,
    identifier: string,
    item: ItemInstance,
    isLeft: boolean,
    quests:  (string | IUiQuest) [];
};

interface IUiMain {
    type?: "main";
    identifier: string;
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
    tabs: (string | IUiTabs) [];
}

class UiJsonParser {
    static mains: {[key: string]: {path: string, main: IUiMain}} = {};
    static tab: {[key: string]: {path: string, tab: IUiTabs}} = {};
    static quest: {[key: string]: {path: string, quest: IUiQuest}} = {};

    static tab_build: {[key: string]: {isLeft: boolean, tab: StandartTabElement, quests: string[]}} = {};
    static quest_build: {[key: string]: {quest: Quest}} = {};
    static getDirectory(path: string){
        let files: string[] = path.split("/");
        files.pop();
        let result = "";
        for(let file of files)
            result+=file+"/";
        return result;
    }
    constructor(path: string){
        let object: IUiMain | IUiTabs | IUiQuest = FileTools.ReadJSON(path);
        if(object.type == "main"){
            UiJsonParser.mains[path] = {path, main: object};

            for(let i in object.tabs){
                let element = object.tabs[i];
                if(typeof element == "string")
                    new UiJsonParser(UiJsonParser.getDirectory(path+element));
                else
                    UiJsonParser.tab[path+"_"+element.identifier] = {path, tab: element};
            }
        }else if(object.type == "tab"){
            for(let i in object.quests){
                let element = object.quests[i];
                if(typeof element == "string")
                    new UiJsonParser(UiJsonParser.getDirectory(path+element));
                else
                    UiJsonParser.quest[path+"_"+element.identifier] = {path, quest: element};
            }
            UiJsonParser[path+"_"+object.identifier] = object;
        }
    }
};

new UiJsonParser(__dir__+"test.json");

Callback.addCallback("PostLoaded", function(){
    for(const key in UiJsonParser.tab){
        let element = UiJsonParser.tab[key];
        let tab = new StandartTabElement(element.tab.identifier);
        tab.setDisplayName(element.tab.name);
        tab.setItem(element.tab.item);
        UiJsonParser.tab_build[key] = {
            isLeft: element.tab.isLeft,
            tab: tab
        };
    }
    for(const key in UiJsonParser.quest){
        let element = UiJsonParser.quest[key].quest;
        let quest = new Quest({
            id: element.identifier,
            item: element.item,
            x: element.x,
            y: element.y,
            lines: element.lines,

        });
        let dialog = new UiDialog(element.dialog.title, element.dialog.description);
        dialog.setInput(element.dialog.input);
        dialog.setResult(element.dialog.output);
        quest.setDialog(dialog);
        
        UiJsonParser.quest_build[key] = {
            quest: quest
        };
    }
    for(const key in UiJsonParser.mains){
        let element: IUiMain = UiJsonParser.mains[key].main;
        if(element.item.createItem){
            IDRegistry.genItemID(element.item.createItem.id);
            Item.createItem(element.item.createItem.id, element.item.createItem.name, element.item.createItem.texture);
        }
        let main = new UiMainBuilder(element.identifier);
        ItemContainer.registerScreenFactory("FTBQuests."+element.identifier, (container, name) => {
            return main.build(container);
        });
        main.addRenderRight(new TabCloseElement("close_button"));
        for(let i in element.tabs){
            let tab = element.tabs[i];
            if(typeof tab == "string")
                var id = tab;
            else
                var id = UiJsonParser.mains[key].path+"_"+tab.identifier;
            let _tab = UiJsonParser.tab_build[id];
            if(_tab.isLeft)
                main.addRenderLeft(_tab.tab);
            else
                main.addRenderRight(_tab.tab);
        }
       
        Item.registerUseFunction(eval(element.item.ui_item), function(coords, item, block, player){
            let container: ItemContainer = new ItemContainer();
            main.buildServer(container);
            container.setClientContainerTypeName("FTBQuests."+element.identifier);
            container.openFor(Network.getClientForPlayer(player), "main");
        });
    }
});