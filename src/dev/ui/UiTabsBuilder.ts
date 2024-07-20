/// <reference path="./UiDialogBase.ts"/>
let Utils = WRAP_JAVA("com.zhekasmirnov.innercore.utils.UIUtils");

Translation.addTranslation("What?", {
    ru: "Что?"
});

Translation.addTranslation("Delete", {
    ru: "Удалить"
});

Translation.addTranslation("Edit", {
    ru: "Редактировать"
})

class UiTabsBuilder {
    private elements: StandartTabElement[];
    public prefix: string;
    public main: UiMainBuilder;
    public ui: UI.Window;
    public isLeft: boolean;

    constructor(prefix: string, isLeft: boolean){
        this.elements = [];
        this.prefix = prefix;
        this.isLeft = isLeft;
    }
    public getTab(name: string): StandartTabElement {
        for (const element of this.elements)
            if(element.getId() == name)
                return element;
            else{
                let tab = element.getTab(name);
                if(tab)
                    return tab;
            }
        return null;
    }
    public remove(id: string): StandartTabElement {
        for(let i = 0;i < this.elements.length;i++)
            if(this.elements[i].getId() == id)
                return this.elements.splice(i, 1)[0];
        return null;
    }
    public getAllTab(): string[] {
        let tabs = [];
        for(let i in this.elements)
            tabs.push(this.elements[i].getId());
        return tabs;
    }

    public getIdQuest(id: string, count: number = 0, id_org: string = id): string{
        for(let tab in this.elements){
            let elements = this.elements[tab].getAllQuest();
            for(let quest in elements)
                if(id == elements[quest]){
                    count++;
                    return this.getIdQuest(id_org+"_"+count, count, id_org);
                }
        }
        return id;
    }

    public addRender(element: StandartTabElement): UiTabsBuilder {
        if(this.getTab(element.getId()) !== null) return this;

        element.setUiTabsBuilder(this);
        this.elements.push(element);
        element.addedTab();
        
        return this;
    }

    public forEach(func: (tab: StandartTabElement) => void): void {
        for(let i in this.elements)
            func(this.elements[i]);
    }

    public setUiMainBuilder(main: UiMainBuilder, ui: UI.Window): UiTabsBuilder{
        this.main = main;
        this.ui = ui;
        return this;
    }

    public getUiMainBuilder(): UiMainBuilder {
        return this.main;
    }

    public canLeft(): boolean {
        return this.isLeft
    }

    public buildServer(container: ItemContainer): UiTabsBuilder {
        this.elements.forEach(element => {
            if(element.isDisplay())
                element.updateSlotItem(container);
        });
        return this;
    }

    public buildTabInformation(element: StandartTabElement, group: UI.WindowGroup, style: UiStyle){
        element.build(group.getWindow("main"));
    }

    protected clear(element: StandartTabElement,){
        this.elements.forEach(element => {
            this.ui.content.elements[this.prefix+"_"+element.getId()].bitmap = element.getTextureSlot(this.main.style);
        });
    }

    public selectedTab(builder: UiTabsBuilder, element: StandartTabElement){
        this.clear(element);
    }

    protected onClick(element: StandartTabElement, position: Vector, container, tileEntity, window, canvas, scale): void {
        if(element.onClick(position, container, tileEntity, window, canvas, scale)){
            this.main.selectedTab(this, element);
            this.ui.content.elements[this.prefix+"_"+element.getId()].bitmap = element.getTextureSelected(this.main.style);
            this.buildTabInformation(element, this.main.group, this.main.style);
        }
    }

    private dialog: UiDialogBase = new UiDialogBase("", 0, 0);
    public openDialogToTab(dialog: UiDialogBase, tab: StandartTabElement): UiTabsBuilder {
        let element = this.ui.content.elements[this.prefix+"_"+tab.getId()];

        let size = dialog.getSize();
        let y = this.ui.location.windowToGlobal(element.y - this.ui.location.globalToWindow(this.ui.layout.getScrollY() / this.ui.location.getScale()))
        if(this.isLeft)
            dialog.setPos(tab.getSize()+10, y+10).build().open();   
        else
            dialog.setPos((1000-this.getMaxSize())-size.width-10, y+10).build().open();
        return this;
    }

    public replaceTab(name: string, tab: StandartTabElement){
        for(const i in this.elements)
            if(this.elements[i].getId() == name){
                this.deleteFileTab(this.elements[i]);
                tab.copyQuests(this.elements[i]);
                this.elements[i] = tab;
                break;
            }
    
    }

    public deleteFileTab(tab: StandartTabElement){
        let file: IUiMain | IUiTabs = FileTools.ReadJSON(tab.path);
        if(file.type == "main"){
            for(const i in file.tabs){
                let path: any = file.tabs[i];
                let _tab: IUiTabs = FileTools.ReadJSON(path);
                if(_tab.identifier == tab.getId()){
                    file.tabs.splice(Number(i), 1);
                    break;
                }
            }
            FileTools.WriteJSON(tab.path, file, true);
        }else
            new java.io.File(tab.path).delete();
    }

    public deleteTab(name: string){
        for(const i in this.elements)
            if(this.elements[i].getId() == name){
                this.deleteFileTab(this.elements.splice(Number(i), 1)[0]);
                break;
            }
        return this;
    }

    protected onLongClick(element: StandartTabElement, position: Vector, container, tileEntity, window, canvas, scale): void {
        if(this.main.isDebug() && element.isEdit()){
            let self = this;
            let ui = new UiDialogSetting("What?")
                .addElement(new SettingButtonTextElement(Translation.translate("Delete")).setClick(function(){
                    self.deleteTab(element.getId());
                    ui.close();
                    self.main.open();
                }))
                .addElement(new SettingButtonTextElement(Translation.translate("Edit")).setClick(function(){
                    ui.close();
                    TabEditor.openEditor(self.main, element, self.isLeft, false);
                }))
                .setEnableExitButton(false);
            ui.openCenter();
            return;
        }
        if(element.onLongClick(position, container, tileEntity, window, canvas, scale) && element.getDisplayName() != ""){
            this.dialog.setMessage(element.getDisplayName());
            this.openDialogToTab(this.dialog, element);
        }
    }

    public build(container: ItemContainer, left: number, right: number): UiTabsBuilder {
        let location = new UI.WindowLocation({
            padding: {
                right: right,
                left: left
            }
        });
        
        let elements: UI.ElementSet = {};
        let self = this;
        let y = 0;
        this.elements.forEach(element => {
            if(element.isDisplay()){
                let size = location.globalToWindow(element.getSize());
                elements[this.prefix+"_"+element.getId()] = {type: "slot", x: 0, y: y, size: size, visual: true, bitmap: element.getTextureSlot(this.main.style), clicker: {
                    onClick(position: Vector, container, tileEntity, window, canvas, scale) {
                        self.onClick(element, position, container, tileEntity, window, canvas, scale);
                    },
                    onLongClick(position: Vector, container, tileEntity, window: any, canvas, scale) {
                        self.onLongClick(element, position, container, tileEntity, window, canvas, scale)
                    },
                }, source: element.getItem()};
                element.updateSlotClient(container);
                y+=size;
            }
        });

        location.setScroll(0, location.windowToGlobal(y));

        this.ui = new UI.Window({
            location: location.asScriptable(),
            drawing: [
                {type: "color", color: android.graphics.Color.argb(0, 0, 0, 0)}
            ],
            elements: elements,
        });
        onSystemUiVisibility(this.ui);
        return this;
    }

    public getMaxSize(): number {
        let max = 0;
        this.elements.forEach(element => {
            if(element.isDisplay() && max < element.getSize())
                max = element.getSize();
        });
        return max;
    }

    public getHeight(): number {
        let y = 0;
        this.elements.forEach(element => {
            if(element.isDisplay())
                y += element.getSize();
        });
        return y;
    }
};