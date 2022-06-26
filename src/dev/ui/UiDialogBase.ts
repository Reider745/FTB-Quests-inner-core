/// <reference path="./UiStyle.ts"/>

let Font = com.zhekasmirnov.innercore.api.mod.ui.types.Font;
let TextElement = com.zhekasmirnov.innercore.api.mod.ui.elements.UITextElement;

class UiDialogBase {
    private message: string;
    private x: number;
    private y: number;
    private ui: UI.Window;
    private font: com.zhekasmirnov.innercore.api.mod.ui.types.Font;
    public style: UiDialogStyle;

    constructor(message: string, x: number, y: number){
        this.message = message;
        this.x = x;
        this.y = y;
        this.style = new UiDialogStyle();

        this.build();
    }
    public setStyle(style: UiDialogStyle): UiDialogBase {
        this.style = style;
        return this;
    }
    public build(): UiDialogBase {
        this.font = new Font({size: this.style.size});
        let self = this;
        let description: any = {type: "text", text: this.message, x: this.x, y: this.y, font: {size: this.style.size, color: android.graphics.Color.rgb(this.style.color[0], this.style.color[1], this.style.color[2])}, multiline: true};
        let lines = this.message.split("\n");
        let height = 0;
        let width = 0;
        for (const i in lines) {
            const text = lines[i];
            height += this.font.getTextHeight(text, this.x, this.y+height, 1) * 1.1;
            if(width < this.font.getTextWidth(text, 1))
                width = this.font.getTextWidth(text, 1);
        }

        this.ui = new UI.Window({
            drawing: [
                {type: "color", color: android.graphics.Color.argb(0, 0, 0, 0)}
            ],
            elements: {
                "background": {type: "image", bitmap:"_default_slot_empty" , x: 0, y: 0, width: 1000, height: 999999, clicker: {
                    onClick(position, container, tileEntity, window, canvas, scale) {
                        self.close();
                    },
                }},
                "frame": {type:"frame", bitmap: this.style.frame, x: this.x - 10, y: this.y - 10, width: width + 10, height: height + 20, scale: 3},
                "text": description
            }
        });
        return this;
    }

    public setPos(x: number, y: number): UiDialogBase {
        this.x = x;
        this.y = y;
        return this;
    }

    public setMessage(message: string): UiDialogBase {
        this.message = message;
        return this;
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