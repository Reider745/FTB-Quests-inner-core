/// <reference path="./UiStyle.ts"/>
/// <reference path="./quest_editor/TabEditor.ts"/>
/// <reference path="./quest_editor/QuestEditor.ts"/>

let height = (function(){
    let size = new android.graphics.Point();
    try{
        UI.getContext().getWindowManager().getDefaultDisplay().getSize(size);
    }catch(e){
        return 1000;
    }
    return size.y;
})();
let width = (function(){
    let size = new android.graphics.Point();
    try{
        UI.getContext().getWindowManager().getDefaultDisplay().getSize(size);
    }catch(e){
        return 1000;
    }
    return size.x;
})();

type QUEST_STORAGE = {[quest_id: string]: boolean};
type QUESTS_STORAGE_PLAYERS = {[player: string]: QUEST_STORAGE};

interface PacketUpdateStatusQuest {
    client_ui_name: string;
    isLeft: boolean;
    tab: string;
    quest: string;
    value: boolean;
};

interface PacketSynchronizationStatusQuests {
    client_ui_name: string;
    quests: QUEST_STORAGE;
};

type SendQuests = {[tab: string]: [string, IQuest, IJsonDialogBase][]}[];
interface PacketSynchronizationQuests {
    client_ui_name: string;
    quests: SendQuests
}

Network.addClientPacket("ftb.synchronization_status_quests", (data: PacketSynchronizationStatusQuests) => {
    let players = UiMainBuilder.quests[data.client_ui_name] || {};
    players[Player.get()] = data.quests;
    UiMainBuilder.quests[data.client_ui_name] = players;
});

Network.addClientPacket("ftb.update_status_quest", (data: PacketUpdateStatusQuest) => 
    UiMainBuilder.all_main[data.client_ui_name]
        .updateStatusQuestClient(data.isLeft, data.tab, data.quest, data.value));

function installQuestForServer(main: UiMainBuilder, isLeft: boolean, data: PacketSynchronizationQuests): void {
    let tab_builder = main.getTabsBuilder(isLeft);
    let tabs = data.quests[isLeft ? 1 : 0];

    for(let tab_id in tabs){
        let quests = tabs[tab_id];
        let tab = tab_builder.getTab(tab_id);
        if(tab){
            for(let i in quests){
                let quest = quests[i];
                if(!tab.getQuest(quest[1].id))
                    tab.addQuest(Quest.buildForServer(quest[0], quest[1], UiDialogBase.buildFrom(quest[2])));
            }
        }
    }
}

Network.addClientPacket("ftb.synchronization_quests", (data: PacketSynchronizationQuests) => {
    let main = UiMainBuilder.all_main[data.client_ui_name];
    
    installQuestForServer(main, true, data);
    installQuestForServer(main, false, data);
});

type SAVE_QUESTS = {
    newSave: Nullable<boolean>;
    quests:  {[key: string]: boolean};//старый формат хранения, не удобен для синхронизации квестов между клиентом и сервера
    new_quests: Nullable<QUESTS_STORAGE_PLAYERS>
};

class UiMainBuilder {
    public group: UI.WindowGroup;
    public main: UI.Window;
    public style: UiStyle;
    public ui_left: UiTabsBuilder;
    public ui_right: UiTabsBuilder;
    public client_name: string;
    public container: ItemContainer;

    private debug: boolean = false;
    private send_quests: Nullable<SendQuests> = null;

    static quests: {[client_ui_name: string]: QUESTS_STORAGE_PLAYERS} = {};
    static all_main: {[key: string]: UiMainBuilder} = {};

    static getUiMainByName(name: string): Nullable<UiMainBuilder> {
        return UiMainBuilder.all_main[name];
    }

    public setDebug(debug: boolean): UiMainBuilder {
        if(debug){
            this.addRenderLeft(new TabEditor("tab_added"));
            this.addRenderRight(new QuestEditor("quest_added"));
        }else if(this.getTab(false, "quest_added")){
            this.removeLeft("tab_added");
            this.removeRight("quest_added");
        }
        this.reopen();
        this.debug = debug;
        return this;
    }

    public reopen(): boolean {
        let win = this.getUi();
        if(win){
            this.getUi().close();
            this.open();
            return true;
        }
        return false;
    }

    public isDebug(): boolean {
        return this.debug;
    }

    public path: string;

    constructor(client_name: string){
        this.main = new UI.Window();
        this.style = new UiStyle();
        this.ui_left = new UiTabsBuilder("left", true);
        this.ui_right = new UiTabsBuilder("right", false);
        this.client_name = client_name;

        this.ui_left.setUiMainBuilder(this, new UI.Window());
        this.ui_right.setUiMainBuilder(this, new UI.Window());
    
        UiMainBuilder.all_main[client_name] = this;

        //синхронизация о выполниных квестов с игроком
        let self = this;
        Callback.addCallback("ServerPlayerLoaded", (player) => {
            let client = Network.getClientForPlayer(player);
            let players = UiMainBuilder.quests[client_name] || {};

            let packet_status: PacketSynchronizationStatusQuests = {
                client_ui_name: client_name,
                quests: players[player] || {}
            };
            
            if(!self.send_quests){
                let send_quests: SendQuests = [{}, {}];

                self.forEach((isLeft, tab, quest) => {
                    const tab_id = tab.getId();
                    const quests = send_quests[isLeft ? 1 : 0][tab_id] || [];
                    const data = quest.externalPacket();
                    
                    if(data){
                        let ui = quest.getDialog();
                        quests.push([quest.getClientType(), data, ui ? ui.toJson(): null]);
                    }

                    send_quests[isLeft ? 1 : 0][tab_id] = quests;
                });
                
                self.send_quests = send_quests;
            }

            let packet_synchronization: PacketSynchronizationQuests = {
                client_ui_name: client_name,
                quests: self.send_quests
            };

            if(client){
                client.send("ftb.synchronization_status_quests", packet_status);
                client.send("ftb.synchronization_quests", packet_synchronization);
            }
        });

        Callback.addCallback("LevelLeft", () => 
            self.forEach((isLeft, tab, quest) => 
                quest.canExternal() && tab.deleteQuest(quest.getId())));
    }

    public getClientName(): string {
        return this.client_name;
    }

    public getIdTab(id: string, count: number = 0, org_id = id): string {
        let tabs = this.ui_left.getAllTab();
        for(let i in tabs)
            if(tabs[i] == id){
                count++;
                return this.getIdTab(org_id+"_"+count, count, org_id);
            }
        
        tabs = this.ui_right.getAllTab();
        for(let i in tabs)
            if(tabs[i] == id){
                count++;
                return this.getIdTab(org_id+"_"+count, count, org_id);
            }
        return id;
    }

    public getTabsBuilder(isLeft: boolean){
        if(isLeft)
            return this.ui_left;
        return this.ui_right;
    }

    public getTab(isLeft: boolean, tab: string): StandartTabElement {
        return this.getTabsBuilder(isLeft).getTab(tab);
    }

    public getAllQuest(isLeft: boolean, tab: string): string[] {
        return this.getTab(isLeft, tab).getAllQuest();
    }

    public getQuest(isLeft: boolean, tab: string, quest: string): Quest {
        const _tab = this.getTab(isLeft, tab);
        if(_tab != null)
            return _tab.getQuest(quest);
        return null;
    }

    public forEach(func: (isLeft: boolean, tab: StandartTabElement, quest: Quest) => void): void {
       this.ui_left.forEach(tab => tab.forEach(quest => func(true, tab, quest)));
       this.ui_right.forEach(tab => tab.forEach(quest => func(false, tab, quest)));
    }

    public isGive(isLeft: boolean, tab: string, quest: string, player: number = Player.get()): boolean {
        let check = this.getQuest(isLeft, tab, quest);
        let lines = check.getLines();

        if(this.canQuest(isLeft, tab, quest, player)) 
            return true;

        for(const element of lines)
            if(!this.canQuest(isLeft, tab, element, player) || !this.isGive(isLeft, tab, element, player)) 
                return false;

        return true;
    }

    public giveQuest(isLeft: boolean, tab: string, quest: string, player: number = Player.get(), value: boolean = true, is: boolean = true): boolean {
        let result = true;

        let players = UiMainBuilder.quests[this.client_name] = UiMainBuilder.quests[this.client_name] || {};
        let storages = players[player] = players[player] || {};

        if(!storages[isLeft+":"+tab+":"+quest]){
            if(is && this.isGive(isLeft, tab, quest, player))
                storages[isLeft+":"+tab+":"+quest] = value;
            else if(!is)
                storages[isLeft+":"+tab+":"+quest] = value;
            else 
                result = false;
        }else
            result = false;
        
        Callback.invokeCallback("QuestGive", this, isLeft, tab, quest, player, value, is, result);

        const client = Network.getClientForPlayer(player);
        const data: PacketUpdateStatusQuest = {
            client_ui_name: this.client_name,
            isLeft: isLeft,
            tab: tab,
            quest: quest,
            value: value
        };
        client && client.send("ftb.update_status_quest", data);

        return result;
    }

    public give(isLeft: boolean, tab: string, quest: string, player: number = Player.get(), description: string, title: string){
        if(!this.canQuest(isLeft, tab, quest, player) && this.giveQuest(isLeft, tab, quest, player, true, true) && description != undefined && title != undefined)
			AchievementAPI.give(player, title,description, this.getQuest(isLeft, tab, quest).getItem());
    }

    public updateStatusQuestClient(isLeft: boolean, tab: string, quest: string, value: boolean): void {
        const player = Player.get();

        let players = UiMainBuilder.quests[this.client_name] = UiMainBuilder.quests[this.client_name] || {};
        let storages = players[player] = players[player] || {};

        storages[isLeft+":"+tab+":"+quest] = value;
    }

    public canQuest(isLeft: boolean, tab: string, quest: string, player: number = Player.get()): boolean {
        return !!UiMainBuilder.quests[this.client_name] && !!UiMainBuilder.quests[this.client_name][player] &&  !!UiMainBuilder.quests[this.client_name][player][isLeft+":"+tab+":"+quest];
    }

    public registerSave(): UiMainBuilder {
        let self = this;

        Saver.addSavesScope("FTBQuests."+this.client_name, (scope: any) => {
            let quests = scope.new_quests || {};

            if(!scope.newSave){
                for(let key in scope.quests){
                    let list = key.split(":");
                    let player = list.pop();

                    let players = quests[player] = quests[player] || {};
                    players[list[0]+":"+list[1]+":"+list[2]] = scope.quests[key];
                }
            }

            UiMainBuilder.quests[self.client_name] = quests;
        }, () => {
            return {
                newSave: true,
                quests: {},
                new_quests: UiMainBuilder.quests[self.client_name] || {}
            };
        });

        Callback.addCallback('LevelLeft', function(){//Устаревшие с b116
            UiMainBuilder.quests[self.client_name] = {};
        });        
        return this;
    }
    public registerItem(id: number | string): UiMainBuilder {
        let self = this;

        if(typeof id == "number"){
            for(let key in ItemID)
                if(ItemID[key] == id)
                    id = key;

            for(let key in VanillaItemID)
                    if(VanillaItemID[key] == id)
                        id = key;
            //пошли вы на*** с блоками, знай если кто-то так делает, то ты конченный с*к* имб*ц*л метод называется registerItem, а не  registerBlock
        }

        ItemContainer.registerScreenFactory("FTBQuests."+id+"."+self.client_name, (container) => {
            return self.build(container);
        });
        Item.registerUseFunction(id, function(coords, item, block, player){
            let container: ItemContainer = new ItemContainer();
            self.buildServer(container);
            container.setClientContainerTypeName("FTBQuests."+id+"."+self.client_name);
            container.openFor(Network.getClientForPlayer(player), "main");
        });
        return this;
    }

    public selected_tab: StandartTabElement = null;
    public selectedTab(builder: UiTabsBuilder, element: StandartTabElement){
        this.selected_tab = element;
        this.ui_left.selectedTab(builder, element);
        this.ui_right.selectedTab(builder, element);
    }

    public openTab(builder: UiTabsBuilder, element: StandartTabElement, id?: string){
        this.selectedTab(builder, element);

        if(builder.ui.content.elements[builder.prefix+"_"+id])
            builder.ui.content.elements[builder.prefix+"_"+id].bitmap = element.getTextureSelected(this.style);
        builder.buildTabInformation(element, this.group, this.style);

        return this;
    }

    public getUiLeft(): UiTabsBuilder {
        return this.ui_left;
    }

    public getUiRight(): UiTabsBuilder {
        return this.ui_right;
    }

    public removeLeft(id: string): StandartTabElement {
        return this.ui_left.remove(id);
    }

    public removeRight(id: string): StandartTabElement {
        return this.ui_right.remove(id);
    }

    public remove(isLeft: boolean, id: string): StandartTabElement {
        if(isLeft)
            return this.ui_left.remove(id);
        return this.ui_right.remove(id);
    }

    public addRender(isLeft: boolean, element: StandartTabElement): UiMainBuilder{
        if(isLeft)
            return this.addRenderLeft(element);
        return this.addRenderRight(element);
    }

    public addRenderLeft(element: StandartTabElement): UiMainBuilder{
        this.ui_left.addRender(element);
        return this;
    }

    public addRenderRight(element: StandartTabElement): UiMainBuilder{
        this.ui_right.addRender(element);
        return this;
    }

    public setStyle(style: UiStyle): UiMainBuilder {
        this.style = style;
        return this;
    }

    public getStyle(): UiStyle {
        return this.style;
    }

    public buildServer(container: ItemContainer): void {
        this.ui_left.buildServer(container);
        this.ui_right.buildServer(container);
    }

    public build(container: ItemContainer): UI.WindowGroup {
        this.container = container
        this.group = new UI.WindowGroup();
        let self = this;
        let paint = new android.graphics.Paint();
        let background = self.style.bitmap;
        let _x = Math.ceil(width / background.getWidth())+1;
        let _y = Math.ceil(height / background.getHeight())+1;

        this.main.setContent({
            drawing: [
                {type: "color", color: android.graphics.Color.argb(0, 0, 0, 0)},
                {type: "custom", onDraw(canvas, scale) {
                    paint.setAlpha(255*.8);
                    for(let x = 0;x < _x;x++)
                        for(let y = 0;y < _y;y++)
                            canvas.drawBitmap(background, x*background.getWidth(), y*background.getHeight(), paint);
                }},
                {type: "frame", bitmap: this.style.tab.frame, x: 0, y: 0, width: this.ui_left.getMaxSize(), height: height, color: android.graphics.Color.argb(.5, 0, 0, 0), scale: this.style.tab.scale},
                {type: "frame", bitmap: this.style.tab.frame, x: 1000-this.ui_right.getMaxSize(), y: 0, width: this.ui_right.getMaxSize(), height: height, color: android.graphics.Color.argb(.5, 0, 0, 0), scale: this.style.tab.scale}
            ],
            elements: {
                //"close": {type: "closeButton", bitmap: this.style.close_main.bitmap, x: 950, y: 0, scale: this.style.close_main.scale}
            }
        });

        this.group.addWindowInstance("background", this.main);
        this.group.addWindowInstance("main", new UI.Window({
            location: {
                padding: {
                    left: this.ui_left.getMaxSize()+3,
                    right: this.ui_right.getMaxSize()-3
                },
                forceScrollY: true,
                forceScrollX: true
            },
            drawing: [
                {type: "color", color: android.graphics.Color.argb(0, 0, 0, 0)}
            ],
            elements: {}
        }));
        this.group.addWindowInstance("left", this.ui_left.build(container, 0, 1000-this.ui_left.getMaxSize()).ui);
        this.group.addWindowInstance("right", this.ui_right.build(container, 1000-this.ui_right.getMaxSize(), 0).ui);
        let win = this.group.getWindow("main");
        onSystemUiVisibility(win);
        win.setCloseOnBackPressed(true);
        return this.group;
    }

    public isOpened(): boolean {
        return this.group.isOpened();
    }

    public open(): UiMainBuilder {
        if(this.isOpened())
            this.group.close();
        this.build(this.container).open();
        return this;
    }

    public getUi(): UI.WindowGroup{
        return this.group;
    }
};