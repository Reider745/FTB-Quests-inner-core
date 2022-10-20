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
    dialog?: UiDialogBase;
}

Network.addServerPacket("ftb.accept_quest", (client, data: {items: Item[], main: string, isLeft: boolean, tab: string, quest: string, description: string, title: string}) => {
    if(UiMainBuilder.getUiMainByName(data.main).canQuest(data.isLeft, data.tab, data.quest, client.getPlayerUid())) return;
    let actor = new PlayerActor(client.getPlayerUid());
    let items: {[key: string]: {slot: number, item: ItemInstance}} = {};
    for(let slot = 0;slot < 36;slot++){
        let item = actor.getInventorySlot(slot);
        for(let input of data.items)
            if(input.item.id == item.id && input.item.data == item.data && input.item.count <= item.count){
                items[item.id] = {slot,item:input.item};
                break;
            }
    }
    let keys = Object.keys(items);
    for(let input of data.items)
        if(keys.indexOf(String(input.item.id)) == -1)
            return;
    
    for(let key in items){
        let item = items[key];
        let _item = actor.getInventorySlot(item.slot);
        actor.setInventorySlot(item.slot, _item.id, _item.count - item.item.count, _item.data, null);
    }
    UiMainBuilder.getUiMainByName(data.main).give(data.isLeft, data.tab, data.quest, client.getPlayerUid(), data.description, data.title);
});

class UiDialog extends UiDialogBase {
    private input: Item[];
    private result: Item[];
    private description: string;
    public style: UiDialogStyle;

    constructor(title: string, description: string = "", x: number = 0, y: number = 0){
        super(title, x, y);
        this.input = [];
        this.result = [];
        this.description = Translation.translate(description);
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
            this.style.count_slot = Math.min(Math.max(this.input.length, this.result.length), this.style.count_slot);
            let count_line = Math.max(Math.ceil(this.input.length / this.style.count_slot), Math.ceil(this.result.length / this.style.count_slot));
            if(this.input.length % this.style.count_slot != 0 || this.result.length % this.style.count_slot != 0)
                count_line++;
            size.height+=(count_line*this.style.slot_size)||0;
        
            let slot = this.style.slot_size;
            if(count_line >= 1 && size.width < slot*(this.style.count_slot*2)+10)
                size.width=slot*(this.style.count_slot*2)+10;
            let description = UiDialogBase.getSize(this.description, this.style.description_size);
            if(this.description != ""){
                size.width = Math.max(size.width, description.width+40);
                size.height += description.height+20;
            }
            if(this.inventontory_check  && this.quest){
                size.width = Math.max(size.width, 102);
                size.height += 62;
            }
        } catch (error) {}
        return size;
    } 
    private inventontory_check = false;
    public setInventoryCheck(inventontory_check: boolean){
        this.inventontory_check = inventontory_check
        return this;
    }
    protected buildSlots(items: Item[], x: number, name: string): number {
        let content = this.ui.getContent();
        let size = super.getSize();
        let y = this.y+size.height+20;
        let _x = this.x+x;
        for(let i = 0;i < items.length;i++){
            let item = items[i];
            content.elements[name+i] = {type: "slot", x: _x, size: this.style.slot_size, y: y, source: item.item, visual: true, bitmap: "_default_slot_empty", clicker: {
                onClick(){
                    if(item.dialog)
                        item.dialog.openCenter();
                }
            }};
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
            if(this.input.length > 0 || this.result.length > 0){
                let slots1 = this.buildSlots(this.input, -10, "input_");
                let slots2 = this.buildSlots(this.result, _size.width/2-10, "result_");
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
            let self = this;
            if(this.inventontory_check && this.quest)
                content.elements["accrpt"] = {type: "button", bitmap: "accept", bitmap2: "accept_gray", x: this.x + _size.width - 62, y: this.y + _size.height - 62, scale: 2, clicker: {
                    onClick(){
                        Network.sendToServer("ftb.accept_quest", {
                            items: self.input,
                            main: self.quest.tab.tab.main.getClientName(),
                            isLeft: self.quest.tab.tab.isLeft,
                            tab: self.quest.tab.getId(),
                            quest: self.quest.getId(),
                            description: self.quest.quest.description,
                            title: self.quest.quest.name
                        });
                    }
                }};
            content.elements["frame"].width = _size.width;
            content.elements["frame"].height = _size.height;
        } catch (error) {}
        return this;
    }
}