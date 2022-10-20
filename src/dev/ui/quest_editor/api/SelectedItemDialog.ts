interface ItemSelected {
    id: string;
    _id: number;
    tag: string;
    fullId: string;
};

let items: ItemSelected[] = [];
let ItemIconSource = WRAP_JAVA("com.zhekasmirnov.innercore.api.mod.ui.icon.ItemIconSource").instance

function added(object: any, tag: string): void {
    for(let key in object)
        items.push({
            id: key,
            _id: object[key],
            tag: tag,
            fullId: tag+key
        });
}

Callback.addCallback("PostLoaded", function(){
    added(VanillaBlockID, "VanillaBlockID.");
    added(VanillaItemID, "VanillaItemID.");
    added(BlockID, "BlockID.");
    added(ItemID, "ItemID.");
});


class SelectedItemDialog extends UiDialogBase {
    public count_x: number= 10;
    public count_y: number = 8;
    public size: number = 40;
    public list = 0;
    public items: ItemSelected[] = items;
    public func: (item: ItemSelected) => void;

    static getItemSelectedById(id: number): ItemSelected {
        for(let item of items)
            if(item._id == id)
                return item;
        return null;
    }

    constructor(title: string){
        super(title);
    }
    public getSize(): Size {
        let size = super.getSize();

        size.width = Math.max(size.width, 20 + this.size * this.count_x);
        size.height = Math.max(size.height, 20 + this.size * this.count_y + size.height + 28);

        return size;
    }

    protected updateList(content: UI.WindowContent, height: number): void{
        let self = this;
        let i = 0 + this.list * (this.count_x*this.count_y);
        for(let y = 0; y < this.count_y;y++)
            for(let x = 0; x < this.count_x;x++){
                let _i = i;
                content.elements["slot_"+x+"_"+y] = {type: "slot", x: this.x+this.size*x, y: this.y+this.size*y+height, size: this.size, source: {
                    id: i < this.items.length ? this.items[i]._id : 0,
                    count: 1,
                    data: 0
                }, visual: true, bitmap: "_default_slot_empty", clicker: {
                    onClick(){
                        self.close();
                        self.func(self.items[_i]);
                    }
                }}
                i++;
            }
    }

    public build(): SelectedItemDialog {
        super.build();
        let size = super.getSize();
        let _size = this.getSize();
        if(!this.items) this.items = items;
        let content = this.ui.getContent();
        let max = Math.ceil(this.items.length / (this.count_x*this.count_y));
        this.updateList(content, size.height);
        let y = this.y+this.size*this.count_y+size.height;
        let self = this;
        content.elements["button_next"] = {type: "button", bitmap: "_button_next_48x24", bitmap2: "_button_next_48x24p", clicker: {
            onClick(){
                self.list = (self.list + 1) % max;
                self.updateList(content, size.height);
                self.ui.forceRefresh();
            }
        }, x: (this.x+this.size*(this.count_x-1))-48+this.size, y: y+2};
        content.elements["button_prev"] = {type: "button", bitmap: "_button_prev_48x24", bitmap2: "_button_prev_48x24p", clicker: {
            onClick(){
                self.list = (self.list - 1) % max;
                if(self.list < 0)
                    self.list = max-1;
                self.updateList(content, size.height);
                self.ui.forceRefresh();
            }
        }, x: this.x, y: y+2};
        content.elements["search"] = {type: "image", bitmap: "ftb_search", x: this.x+49, y: y+2, width: 24, height: 24, clicker: {
            onClick(){
                new Keyboard("")
                    .getText(function(text){
                        let _items = [];

                        for(const item of items)
                            if(Item.getName(item._id, 0).toLowerCase().split(text.toLowerCase()).length > 1)
                                _items.push(item);

                        self.close();
                        self.list = 0;
                        self.items = _items;
                        self.openCenter();
                    })
                    .open();
            },
            onLongClick(){
                self.close();
                self.list = 0;
                self.items = items;
                self.openCenter();
            }
        }};

        content.elements["frame"].width = _size.width;
        content.elements["frame"].height = _size.height;
        content.elements["background"].clicker = {};

        return this;
    }

    public getSelectedItem(func: (item: ItemSelected) => void): SelectedItemDialog {
        this.func = func;
        return this;
    }
};