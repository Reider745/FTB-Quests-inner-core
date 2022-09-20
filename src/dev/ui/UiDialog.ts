/// <reference path="./UiDialogBase.ts"/>

class UiDialogStyle extends UiDialogBaseStyle {
    public slot_size: number;
    public count_slot: number;
    public description_size: number;
    public description_color: [number, number, number];
    constructor(frame: string = undefined, size: number = 20, scale: number = .5, color: [number, number, number, number] = undefined, text: [number, number, number] = [1, 1, 1], background: [number, number, number, number] = [0, 0, 0, 0]){
        super(frame, size, scale, color, text, background);
        this.slot_size = 60;
        this.count_slot = 4;
        this.description_size = 15;
        this.description_color = text;
    }
}

interface Item {
    item: ItemInstance;
}
class UiDialog extends UiDialogBase {
    private input: Item[];
    private result: Item[];
    private description: string;
    public style: UiDialogStyle;

    constructor(title: string, description: string = "", x: number = 0, y: number = 0){
        super(title, x, y);
        this.input = [];
        this.result = [];
        this.description = description;
        this.style = new UiDialogStyle();
    }

    public setInput(inputs: Item[]): UiDialog {
        this.input = inputs;
        return this;
    }

    public setResult(results: Item[]): UiDialog {
        this.result = results;
        return this;
    }

    public getSize(): Size {
        let size = super.getSize();
        try {
            size.height+=30;

            let count_line = Math.ceil(this.input.length / this.style.count_slot);
            if(count_line > Math.ceil(this.result.length / this.style.count_slot))
                count_line = Math.ceil(this.result.length / this.style.count_slot);
            size.height+=(count_line+1)*this.style.slot_size;
        
            let slot = this.style.slot_size;
            if(count_line >= 1 && size.width < slot*(this.style.count_slot*2)+10)
                size.width=slot*(this.style.count_slot*2)+10;
            let description = UiDialogBase.getSize(this.description, this.style.description_size);
            if(this.description != ""){
                if(size.width < description.width)
                    size.width = description.width;
                size.height += description.height+20;
            }
        } catch (error) {}
        return size;
    } 
    protected buildSlots(items: Item[], x: number, name: string): number {
        let content = this.ui.getContent();
        let size = super.getSize();
        let y = this.y+size.height+20;
        let _x = this.x+x;
        for(let i = 0;i < items.length;i++){
            let item = items[i];
            content.elements[name+i] = {type: "slot", x: _x, size: this.style.slot_size, y: y, source: item.item, visual: true, bitmap: "_default_slot_empty"};
            _x += this.style.slot_size;
            if(i+1 % this.style.count_slot == this.style.count_slot){
                y += this.style.slot_size;
                _x =  this.x+x;
            }
        }
        y+=this.style.slot_size;
        return y;
    }
    public build(): UiDialog {
        try {
            super.build();
            let content = this.ui.getContent();
            let _size = this.getSize();
            let size = super.getSize();
            let y = this.y + size.height;
            if(this.input.length > 0 || this.result.length){
                let slots1 = this.buildSlots(this.input, -10, "input_");
                let slots2 = this.buildSlots(this.result, this.style.count_slot*this.style.slot_size, "result_");
                y = Math.max(slots1, slots2);
                if(this.description != "")
                    y+=10;
                content.drawing.push({type: "line", width: 5, x1: this.x - 10, y1: this.y + size.height+15, x2: this.x+_size.width - 10, y2: this.y +size.height+15});
                content.drawing.push({type: "line", width: 5, x1: this.x + _size.width / 2 - 10, y1:this.y + size.height + 15, x2: this.x+_size.width / 2 - 10, y2: y});
            }
            if(this.description != ""){
                content.drawing.push({type: "line", width: 5, x1: this.x - 10, y1: y, x2: this.x+_size.width - 10, y2: y});
                content.elements["description"] = {type: "text", text: this.description, x: this.x, y: y+3, font: {size: this.style.description_size, color: android.graphics.Color.rgb(this.style.description_color[0], this.style.description_color[1],  this.style.description_color[2])}, multiline: true};
            }
            content.elements["frame"].width = _size.width;
            content.elements["frame"].height = _size.height;
        } catch (error) {}
        return this;
    }
}