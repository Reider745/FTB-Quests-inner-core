/// <reference path="./UiDialogBase.ts"/>

let Utils = WRAP_JAVA("com.zhekasmirnov.innercore.utils.UIUtils");

class UiTabsBuilder {
    private elements: StandartTabElement[];
    private prefix: string;
    private content: UI.ElementSet;
    public main: UiMainBuilder;
    public ui: UI.Window;

    constructor(prefix: string){
        this.elements = [];
        this.prefix = prefix;
    }
    public addRender(element: StandartTabElement): UiTabsBuilder {
        element.setUiTabsBuilder(this);
        this.elements.push(element);
        return this;
    }
    public setUiMainBuilder(main: UiMainBuilder, ui: UI.Window): UiTabsBuilder{
        this.main = main;
        this.ui = ui;
        return this;
    }
    public buildServer(container: ItemContainer): UiTabsBuilder {
        this.elements.forEach(element => {
            if(element.isDisplay())
                element.updateSlotItem(container);
        });
        return this;
    }
    protected buildTabInformation(element: StandartTabElement, group: UI.WindowGroup, style: UiStyle){
        element.build(group.getWindow("main"), style);
    }
    protected clear(element: StandartTabElement,){
        this.elements.forEach(element => {
            this.content[this.prefix+"_"+element.getId()].bitmap = element.getTextureSlot(this.main.style);
        });
    }
    public selectedTab(builder: UiTabsBuilder, element: StandartTabElement){
        this.clear(element);
    }
    protected onClick(element: StandartTabElement, location: UI.WindowLocation, position, container, tileEntity, window, canvas, scale): void {
        if(element.onClick(position, container, tileEntity, window, canvas, scale)){
            this.main.selectedTab(this, element);
            this.content[this.prefix+"_"+element.getId()].bitmap = element.getTextureSelected(this.main.style);
            this.buildTabInformation(element, this.main.group, this.main.style);
        }
    }
    private dialog: UiDialogBase = new UiDialogBase("", 0, 0).setStyle(new UiDialogStyle())
    protected onLongClick(element: StandartTabElement, location: UI.WindowLocation, position, container, tileEntity, window: UI.Window, canvas, scale): void {
        if(element.onLongClick(position, container, tileEntity, window, canvas, scale)){
            let elem = this.content[this.prefix+"_"+element.getId()];
            alert(elem.y+ " "+this.ui.layout.getScrollY()+" "+this.ui.layout.getTranslationY()+" "+this.ui.layout.getScrollY());
            if(element.getDisplayName() != "")
                this.dialog.setMessage(element.getDisplayName()).setPos(location.windowToGlobal(elem.x)+element.getSize(), location.windowToGlobal(elem.y - this.ui.layout.getScrollY()) ).build().open();
            //this.main.selectedTab(this, element);
            //this.content[this.prefix+"_"+element.getId()].bitmap = element.getTextureSelected(this.main.style);
            //this.buildTabInformation(element, this.main.group, this.main.style);
        }
    }
    public build(container: ItemContainer, location: UI.WindowLocation): UI.ElementSet{
        let elements: UI.ElementSet = {};
        let self = this;
        let y = 0;
        this.elements.forEach(element => {
            if(element.isDisplay()){
                let size = location.globalToWindow(element.getSize());
                elements[this.prefix+"_"+element.getId()] = {type: "slot", x: 0, y: y, size: size, visual: true, bitmap: element.getTextureSlot(this.main.style), clicker: {
                    onClick(position, container, tileEntity, window, canvas, scale) {
                        self.onClick(element, location, position, container, tileEntity, window, canvas, scale);
                    },
                    onLongClick(position, container, tileEntity, window: any, canvas, scale) {
                        self.onLongClick(element, location, position, container, tileEntity, window, canvas, scale)
                    },
                }, source: element.getItem()};
                element.updateSlotClient(container);
                y+=size;
            }
        });
        this.content = elements;
        return elements;
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