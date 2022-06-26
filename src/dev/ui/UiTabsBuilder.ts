/// <reference path="./UiDialogBase.ts"/>

let Utils = WRAP_JAVA("com.zhekasmirnov.innercore.utils.UIUtils");

class UiTabsBuilder {
    private elements: StandartTabElement[];
    private prefix: string;
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
    protected onLongClick(element: StandartTabElement, position: Vector, container, tileEntity, window, canvas, scale): void {
        if(element.onLongClick(position, container, tileEntity, window, canvas, scale)){
            let elem = this.ui.content.elements[this.prefix+"_"+element.getId()];
            if(element.getDisplayName() != "")
                this.dialog.setMessage(element.getDisplayName()).setPos(this.ui.location.windowToGlobal(elem.x)+element.getSize(), this.ui.location.windowToGlobal(elem.y - this.ui.location.globalToWindow(this.ui.layout.getScrollY() / this.ui.location.getScale()))).build().open();
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