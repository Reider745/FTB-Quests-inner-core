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

const SIZE_FRAME = 70;

class UiMainBuilder {
    private group: UI.WindowGroup;
    private main: UI.Window;
    private style: UiStyle;
    constructor(){
        this.main = new UI.Window();
        this.style = new UiStyle();
    }
    
    public setStyle(): UiMainBuilder {
        return this;
    }

    private buildTabFrame(left: number, right: number): UI.Window {
        const texture = this.style.tab.frame;
        const location = new UI.WindowLocation();
        let frame = new UI.Window({
            location: {
                padding: {
                    right: right,
                    left: left
                }
            },
            elements:{},
            drawing: [
                {type: "color", color: android.graphics.Color.argb(0, 0, 0, 0)},
                //{type:"frame",bitmap:this.style.tab.frame,x:x,y:0,width:1000,height:height}
                {type: "frame", bitmap: texture, x: 0, y: 0, width: 1000, height: height*(width / SIZE_FRAME), color: android.graphics.Color.argb(.5, 0, 0, 0), scale: 13}
            ]
        });
        return frame;
    }

    public build(): UI.WindowGroup {
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
                }}
            ],
            elements: {
                "close": {type: "closeButton", bitmap: this.style.close_main.bitmap, x: 950, y: 0, scale: this.style.close_main.scale}
            }
        })
        this.group.addWindowInstance("main", this.main);
        this.group.addWindowInstance("left", this.buildTabFrame(0, 1000-SIZE_FRAME));
        this.group.addWindowInstance("right", this.buildTabFrame(1000-SIZE_FRAME, 0));
        return this.group;
    }
};