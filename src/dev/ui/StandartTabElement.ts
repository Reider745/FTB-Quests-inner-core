class StandartTabElement {
    protected id: string;
    protected quests: Quest[];
    public tab: UiTabsBuilder;
    public isLeft: boolean;

    public path: string;

    constructor(id: string){
        this.id = id;
        this.quests = [];
    }

    public setUiTabsBuilder(tab: UiTabsBuilder): StandartTabElement {
        this.tab = tab;
        if(tab)
            this.isLeft = tab.isLeft;
        return this;
    }

    public getUitabsBuilder(): UiTabsBuilder {
        return this.tab;
    }

    public getAllQuest(): string[] {
        let result = [];
        for(let i in this.quests)
            result.push(this.quests[i].getId());
        return result;
    }

    public addQuest(quest: Quest): StandartTabElement {
        if(!quest || !quest.onAddedQuest() || this.getQuest(quest.getId()) !== null) return this;

        quest.tab = this;
        this.quests.push(quest);

        return this;
    }

    public forEach(func: (quest: Quest) => void): void {
        for(let i in this.quests)
            func(this.quests[i]);
    }

    public getQuest(name: string): Quest {
        for(const quest of this.quests)
            if(quest.getId() == name)
                return quest;

        return null;
    }

    public copyQuests(tab: StandartTabElement){
        let names = tab.getAllQuest();
        for(const name of names)
            this.addQuest(tab.getQuest(name));

        return this;
    }

    public build(window: UI.Window): void {
        let content = window.getContent();
        let width: number = 0;
        let heigth: number = 0;
        let location = window.getLocation();

        content.drawing = [{type: "color", color: android.graphics.Color.argb(0, 0, 0, 0)}];
        content.elements = {};

        this.quests.forEach(element => {
            element.tab = this;
            let object = element.build(window);
            width = Math.max(width, object.x+object.size);
            heigth = Math.max(heigth, object.y+object.size);
            content.elements[element.getId()] = object;
        });

        window.setContent(content);
        window.forceRefresh();

        location.setScroll(width, heigth);
        window.updateScrollDimensions();
    }

    public getId(): string {
        return this.id;
    }

    private name: string;
    public getDisplayName(): string {
        return this.name || "Display Name";
    }

    public setDisplayName(name: string): StandartTabElement {
        this.name = name;
        return this;
    }

    public isDisplay(): boolean {
        return true;
    }

    private item: ItemInstance;
    public getItem(): ItemInstance {
        return this.item || {id: 0, count: 1, data: 0};
    }

    public setItem(item: ItemInstance): StandartTabElement {
        this.item = item;
        return this;
    }

    public updateSlotItem(container: ItemContainer): void {}
    public updateSlotClient(container: ItemContainer): void {}
    public getTextureSlot(style: UiStyle): string{
        return style.tab.tab_slot;
    }
    public getTextureSelected(style: UiStyle): string{
        return style.tab.tab_selected;
    }
    public getSize(): number {
        return 60;
    }
    public onClick(position: Vector, container: ItemContainer, tileEntity: TileEntity, window: UI.Window, canvas: android.graphics.Canvas, scale: number): boolean {
        return true;
    }
    public onLongClick(position: Vector, container: ItemContainer, tileEntity: TileEntity, window: UI.Window, canvas: android.graphics.Canvas, scale: number): boolean {
        return true;
    }
    public addedTab(): StandartTabElement {
        return this;
    }
    public getTab(name: string): StandartTabElement {
        return null;
    }
    public isEdit(): boolean {
        return true;
    }

    private deleteQuestToTab(tab: IUiTabs, quest: Quest){
        for(let i in tab.quests){
            let quest_ = tab.quests[i];
            if(typeof quest_ == "object" && quest_.identifier == quest.getId()){
                tab.quests.splice(Number(i), 1);
                break;
            }
        }
    }

    public deleteQuest(name: string){
        for(let i in this.quests){
            let quest = this.quests[i];

            if(quest.getId() == name){
                if(!quest.onRemoveQuest())
                    break;

                this.quests.splice(Number(i), 1);
                let file: IUiMain | IUiTabs | IUiQuest = FileTools.ReadJSON(quest.path);

                if(file.type == "main"){
                    for(let tab of file.tabs)
                        if(typeof tab == "object" && tab.identifier == this.getId())
                            this.deleteQuestToTab(tab, quest);
                    
                    FileTools.WriteJSON(quest.path, file, true);
                }else if(file.type == "tab"){
                    this.deleteQuestToTab(file, quest);
                    FileTools.WriteJSON(quest.path, file, true);
                }else
                    new java.io.File(quest.path).delete();

                return this;
            }
        }
        return this;
    }

    public replaceQuest(name: string, quest: Quest){
        for(let i in this.quests)
            if(this.quests[i].getId() == name){
                this.quests[i] = quest;
                return this;
            }
        return this;
    }
};