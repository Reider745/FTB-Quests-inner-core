/// <reference path="./UiStyle.ts"/>

let height = (function(){
    let size = new android.graphics.Point();
    UI.getContext().getWindowManager().getDefaultDisplay().getSize(size);
    return size.y;
})();
let width = (function(){
    let size = new android.graphics.Point();
    UI.getContext().getWindowManager().getDefaultDisplay().getSize(size);
    return size.x;
})();



class UiMainBuilder {
    public group: UI.WindowGroup;
    public main: UI.Window;
    public style: UiStyle;
    public ui_left: UiTabsBuilder;
    public ui_right: UiTabsBuilder;


    constructor(){
        this.main = new UI.Window();
        this.style = new UiStyle();
        this.ui_left = new UiTabsBuilder("left");
        this.ui_right = new UiTabsBuilder("right");

        this.ui_left.setUiMainBuilder(this, new UI.Window());
        this.ui_right.setUiMainBuilder(this, new UI.Window());
    }
    public selectedTab(builder: UiTabsBuilder, element: StandartTabElement){
        this.ui_left.selectedTab(builder, element);
        this.ui_right.selectedTab(builder, element);
    }
    public getUiLeft(): UiTabsBuilder {
        return this.ui_left;
    }
    public getUiRight(): UiTabsBuilder {
        return this.ui_right;
    }
    public addRenderLeft(element: StandartTabElement){
        this.ui_left.addRender(element);
    }
    public addRenderRight(element: StandartTabElement){
        this.ui_right.addRender(element);
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

    protected buildTabFrame(left: number, right: number, builder: UiTabsBuilder, container: ItemContainer, group: UI.WindowGroup): UI.Window {
        let location = new UI.WindowLocation({
            padding: {
                right: right,
                left: left
            }
        });
        builder.ui = new UI.Window({
            location: {
                padding: {
                    right: right,
                    left: left
                },
                scrollY: builder.getHeight()
            },
            drawing: [
                {type: "color", color: android.graphics.Color.argb(0, 0, 0, 0)}
            ],
            elements: builder.build(container, location),
        });
        return builder.ui;
    }

    public build(container: ItemContainer): UI.WindowGroup {
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
        })
        this.group.addWindowInstance("background", this.main);
        this.group.addWindowInstance("left", this.buildTabFrame(0, 1000-this.ui_left.getMaxSize(), this.ui_left, container, this.group));
        this.group.addWindowInstance("right", this.buildTabFrame(1000-this.ui_right.getMaxSize(), 0, this.ui_right, container, this.group));
        this.group.addWindowInstance("main", new UI.Window({
            location: {
                padding: {
                    left: this.ui_left.getMaxSize()+3,
                    right: this.ui_right.getMaxSize()-3
                }
            },
            drawing: [
                {type: "color", color: android.graphics.Color.argb(0, 0, 0, 0)}
            ],
            elements: {}
        }))
        return this.group;
    }
    public getUi(): UI.WindowGroup{
        return this.group;
    }
};