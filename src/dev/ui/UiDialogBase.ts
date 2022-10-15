/// <reference path="./UiStyle.ts"/>

let Font = com.zhekasmirnov.innercore.api.mod.ui.types.Font;
let TextElement = com.zhekasmirnov.innercore.api.mod.ui.elements.UITextElement;

class Size {
    public width: number;
    public height: number;
    constructor(width: number, height: number){
        this.width = width;
        this.height = height;
    }
}

Translation.addTranslation("Tasks", {
    ru: "Задачи"
});

Translation.addTranslation("Awards", {
    ru: "Награды"
});

class UiDialogBase {
    protected message: string;
    public x: number;
    public y: number;
    protected ui: UI.Window;
    protected font: com.zhekasmirnov.innercore.api.mod.ui.types.Font;
    public style: UiDialogBaseStyle;

    constructor(message: string, x: number = 0, y: number = 0){
        this.message = Translation.translate(message);
        this.x = x;
        this.y = y;
        this.style = new UiDialogBaseStyle();

        this.build();
    }
    public setStyle(style: UiDialogBaseStyle): UiDialogBase {
        this.style = style;
        return this;
    }
    static getSize(message: string, size: number): Size {
        let font = new Font({size: size});
        let lines = message.split("\n");
        let height: number = 0;
        let width: number = 0;
        for (const i in lines) {
            const text = lines[i];
            height += font.getTextHeight(text, 0, 0+height, 1) * 1.1;
            if(width < font.getTextWidth(text, 1))
                width = font.getTextWidth(text, 1);
        }
        return new Size(width, height);
    }
    public getSize(): Size {
        return UiDialogBase.getSize(this.message, this.style.size);
    }
    public openCenter(location: UI.WindowLocation = new UI.WindowLocation()){
        let size = this.getSize();
        if(size.height < this.ui.location.height)
            this.setPos((1000 / 2) - (size.width / 2), (this.ui.location.height / 2) - (size.height / 2)).build().open();
        else{
            this.setPos((1000 / 2) - (size.width / 2), 0).build().open();
            let location = this.ui.getLocation();
            location.setScroll(0, size.height);
            this.ui.updateWindowLocation();
        }   
    }
    public isDisplay(x: number = this.x, y: number = this.y): boolean{
        let size = this.getSize();
        if(x + size.width > 1000 || y + size.height > height)
            return false;
        return true;
    }
    public build(): UiDialogBase {
        let self = this;
        let description: any = {type: "text", text: this.message, x: this.x, y: this.y, font: {size: this.style.size, color: android.graphics.Color.rgb(this.style.text[0], this.style.text[1],  this.style.text[2])}, multiline: true};
        let size = this.getSize();
        let display = UI.getContext().getWindowManager().getDefaultDisplay();
        let dispaly_size = new android.graphics.Point();
        display.getSize(dispaly_size);

        let location = new UI.WindowLocation();

        this.ui = new UI.Window({
            location: {
                forceScrollY: true
            },
            drawing: [
                {type: "color", color: android.graphics.Color.argb(this.style.background[0], this.style.background[1], this.style.background[2], this.style.background[3])}
            ],
            elements: {
                "background": {type: "image", bitmap:"_default_slot_empty", x: 0, y: 0, width: 1000, height: 999999, onTouchEvent(self_, event){
                    let x = event.x;
                    let y = event.y;

                    let frame = self.ui.getContent().elements.frame;
                    if(!(x >= frame.x && y >= frame.y && x <= frame.x + frame.width && y <= frame.y + frame.height))
                        self.close();

                }, z: -5},
                "frame": {type:"frame", bitmap: this.style.frame, x: this.x - 10, y: this.y - 10, width: size.width + 20, height: size.height + 20, scale: this.style.scale, color: android.graphics.Color.argb(this.style.color[0], this.style.color[1], this.style.color[2],  this.style.color[3])},
                "text": description
            }
        });
        this.ui.setEventListener({
            onClose(window) {},
            onOpen(window) {
                onSystemUiVisibilityChange(self.ui.layout);
            },
        });
        this.ui.setCloseOnBackPressed(true);
        this.ui.setBlockingBackground(true);
        return this;
    }

    public setPos(x: number, y: number): UiDialogBase {
        this.x = x;
        this.y = y;
        return this;
    }

    public setMessage(message: string): UiDialogBase {
        this.message = Translation.translate(message);
        return this;
    }
    public getUi(): UI.Window {
        return this.ui;
    }
    public open(): UiDialogBase{
        this.ui.open();
        return this;
    }
    public close(): UiDialogBase{
        this.ui.close();
        return this;
    }
};