class SettingElement {
    public configName = null;

    public getSize(): Size {
        return {
            width: 0,
            height: 0
        };
    }

    public initConfig(config: any){
        
    }

    public build(dialog: UiDialogSetting, content: UI.WindowContent, org_size: Size, size: Size, id: string): UI.Elements[] {
        return null
    }
};

class SettingTextElement extends SettingElement {
    protected text: string;
    public size: number;
    public color: number = android.graphics.Color.WHITE;
    public func: (dialog: UiDialogSetting) => void = function(){}

    constructor(text: string, size: number = 15){
        super();
        this.text = text;
        this.size = size;
    }

    public setStyle(color: number = android.graphics.Color.WHITE, size: number = 15){
        this.color = color;
        this.size = size;
        return this;
    }

    public setClick(func: (dialog: UiDialogSetting) => void){
        this.func = func;
        return this;
    }

    public getSize(): Size {
        return UiDialogBase.getSize(this.text, this.size + .5);
    }

    public build(dialog: UiDialogSetting, content: com.zhekasmirnov.innercore.api.mod.ui.window.WindowContent, org_size: Size, size: Size, id: string): UI.Elements[] {
        let self = this;
        return [{type: "text", text: this.text, x: 0, y: 0, multiline: true, font: {size: this.size, color: this.color}, clicker: {
            onClick(){
                self.func(dialog);
            }
        }}];
    }
}

class SettingKeyboardElement extends SettingTextElement {
    constructor(text: string, configName: string){
        super(text);
        this.configName = configName;
    }
    public getSize(): Size {
        let size = super.getSize();
        size.width += 10;
        size.height += 10;
        return size;
    }

    public initConfig(config: any): void {
        if(config)
            this.text = config;
    }

    public build(dialog: UiDialogSetting, content: com.zhekasmirnov.innercore.api.mod.ui.window.WindowContent, org_size: Size, size: Size, id: string): UI.Elements[] {
        let elements: UI.Elements[] = super.build.call(this, arguments);
        elements[0].x+=5;
        elements[0].y+=5;
        let size_ = this.getSize();
        let self = this
        dialog.configs[self.configName] = this.text;
        elements.unshift({type: "frame", bitmap: "default_container_frame", scale: .3, color: android.graphics.Color.argb(.3, 0, 0, 0), x: 0, y: 0, width: size_.width, height: size_.height, clicker: {
            onClick(){
                new Keyboard(self.text).getText(function(text){
                    dialog.configs[self.configName] = text;
                    self.text = text;
                    dialog.close();
                    dialog.build();
                    dialog.openCenter();
                }).open();
            }
        }});
        return elements;
    }
};

class SettingIconElement extends SettingElement{
    protected item = items[0];
    public size: number;

    constructor(configName: string, size: number = 50){
        super();
        this.configName = configName;
        this.size = size;
    }

    public getSize(): Size {
        return {
            width: this.size,
            height: this.size
        };
    }

    public initConfig(config: any): void {
        if(config)
            this.item = config;
    }

    public build(dialog: UiDialogSetting, content: com.zhekasmirnov.innercore.api.mod.ui.window.WindowContent, org_size: Size, size: Size, id: string): UI.Elements[] {
        let self = this;
        dialog.configs[self.configName] = this.item;
        return [{type: "slot", bitmap: "_default_slot_empty", x: 0, y: 0, size: this.size, clicker: {
            onClick(){
                new SelectedItemDialog("Selected item")
                    .getSelectedItem(function(item){
                        dialog.configs[self.configName] = item;
                        self.item = item;
                        dialog.close();
                        dialog.build();
                        dialog.openCenter();
                    })
                    .openCenter();
            },
            onLongClick(){
                self.item = {id: null, _id: 0, tag: null, fullId: "0"};
                dialog.close();
                dialog.build();
                dialog.openCenter();
            }
        }, source: {
            id: self.item._id,
            count: 1,
            data: 0
        }}];
    }
};

class SettingItemsElement extends SettingElement {
    public items: ItemSelected[] = [null];
    public line_x = 6;
    public size: number;

    constructor(configName: string, size: number = 50){
        super();
        this.configName = configName;
        this.size = size;
    }
    public getSize(): Size {
        let size: Size = {
            width: 0,
            height: 0
        };

        size.width = Math.max(size.width, this.items.length < this.line_x ? this.items.length * this.size : this.line_x * this.size);
        size.height = Math.ceil(this.items.length / this.line_x) * this.size;

        return size;
    }

    public initConfig(config: any): void {
        if(!config) return;
        config.push(null);
        this.items = config;
    }

    protected getItems(): ItemSelected[] {
        let result = [];
        for(let i in this.items)
            if(this.items[i] !== null)
                result.push(this.items[i]);
        return result;
    }

    public build(dialog: UiDialogSetting, content: com.zhekasmirnov.innercore.api.mod.ui.window.WindowContent, org_size: Size, size: Size, id: string): UI.Elements[] {
        dialog.configs[this.configName] = this.getItems(); 

        let slots: UI.Elements[] = [];
        let count = 0;
        let y = 0;
        let self = this;
        for(let i = 0;i < this.items.length;i++){
            let item = this.items[i];
            
            if(count >= this.line_x){
                y+=this.size;
                count -= this.line_x;
            }
            let a = i;
            if(item === null){
                slots.push({type: "slot", bitmap: "nbt.byte_array_closed", x: this.size*count, y: y, size: this.size, clicker: {
                    onClick(){
                        new SelectedItemDialog("Selected item")
                            .getSelectedItem(function(item){
                                self.items.unshift(item);
                                dialog.configs[self.configName] = self.getItems(); 
                                dialog.close();
                                dialog.build();
                                dialog.openCenter();
                            })
                            .openCenter();
                    }
                }});
                continue;
            }
            slots.push({type: "slot", bitmap: "_default_slot_empty", x: this.size*count, y: y, size: this.size, clicker: {
                onClick(){
                    let items = [];
                    for(let i = 0;i < self.items.length;i++)
                        if(a != i)
                            items.push(self.items[i]);
                    self.items = items;
                    dialog.configs[self.configName] = self.getItems(); 
                    dialog.close();
                    dialog.build();
                    dialog.openCenter();
                }
            }, source: {
                id: item._id,
                count: 1,
                data: 0
            }});
            count++;
        }
        return slots;
    }
};

class SettingButtonElement extends SettingElement {
    public texture: string;
    public scale: number;
    public func: (dialog: UiDialogSetting) => void = () => {};

    constructor(texture: string, scale: number = 1){
        super();
        this.texture = texture;
        this.scale = scale;
    }

    public getSize(): Size {
        let texture: android.graphics.Bitmap = TextureSource.get(this.texture);
        return {
            width: texture.getWidth(),
            height: texture.getHeight()
        };
    }

    public onClick(func: (dialog: UiDialogSetting) => void): SettingButtonElement{
        this.func = func;
        return this;
    }

    public build(dialog: UiDialogSetting, content: com.zhekasmirnov.innercore.api.mod.ui.window.WindowContent, org_size: Size, size: Size, id: string): UI.Elements[] {
        let self = this;
        return [{type: "button", scale: this.scale, bitmap: this.texture, x: 0, y: 0, clicker: {
            onClick(){
                self.func(dialog);
            }
        }}]
    }
};

class SettingNumbersElement extends SettingElement {
    protected min: number;
    protected max: number;
    protected value: number;

    public _value = 0;

    constructor(configName: string, min: number, max: number, value: number, _value: number = 0){
        super();
        this.configName = configName;
        this.min = min;
        this.max = max;
        this.value = value;
        this._value = _value;
    }
    public getSize(): Size {
        return {
            height: 24,
            width: 48*2+UiDialogBase.getSize(String(this._value), 24).width+2
        }
    }

    public initConfig(config: any): void {
        if(config)
            this._value = config;
    }

    public build(dialog: UiDialogSetting, content: com.zhekasmirnov.innercore.api.mod.ui.window.WindowContent, org_size: Size, size: Size, id: string): UI.Elements[] {
        let self = this;
        dialog.configs[this.configName] = this._value;
        return [
            {type: "button", bitmap: "_button_prev_48x24", bitmap2: "_button_prev_48x24p", x: 0, y: 0, clicker: {
                onClick(){
                    self._value = Math.max(self._value-self.value, self.min);

                    dialog.configs[this.configName] = self._value;
                    dialog.close();
                    dialog.build();
                    dialog.openCenter();
                },
                onLongClick(){
                    self._value = Math.max(self._value-(self.value*5), self.min);

                    dialog.configs[this.configName] = self._value;
                    dialog.close();
                    dialog.build();
                    dialog.openCenter();
                }
            }},
            {type: "text", text: String(this._value), font: {size: 24, color: android.graphics.Color.WHITE}, x: 49, y: 0},
            {type: "button", bitmap: "_button_next_48x24", bitmap2: "_button_next_48x24p", x: 50+UiDialogBase.getSize(String(this._value), 24).width, y: 0, clicker: {
                onClick(){
                    self._value = Math.min(self._value+self.value, self.max);

                    dialog.configs[this.configName] = self._value;
                    dialog.close();
                    dialog.build();
                    dialog.openCenter();
                },
                onLongClick(){
                    self._value = Math.min(self._value+(self.value*5), self.max);
                    dialog.configs[this.configName] = self._value;
                    dialog.close();
                    dialog.build();
                    dialog.openCenter();
                }
            }},
        ]
    }
};
 
class SettingStringsElement extends SettingNumbersElement {
    protected strings: string[];

    constructor(configName: string, strings: string[], value: string = ""){
        let index = strings.indexOf(value);
        super(configName, 0, strings.length-1, 1, index == -1 ? 0 : index);
        this.strings = strings;
    }

    public initConfig(config: any): void {
        if(!config) return;
        this._value = this.strings.indexOf(config);
        if(this._value < 0)
            this._value = 0;
    }

    public getSize(): Size {
        return {
            height: 24,
            width: 48*2+UiDialogBase.getSize(this.strings[this._value], 24).width+2
        }
    }

    public build(dialog: UiDialogSetting, content: com.zhekasmirnov.innercore.api.mod.ui.window.WindowContent, org_size: Size, size: Size, id: string): UI.Elements[] {
        let elements: UI.Elements[] = super.build(dialog, content, org_size, size, id);
        elements[1].text = this.strings[this._value];
        dialog.configs[this.configName] = this.strings[this._value];
        elements[2].x = 50+UiDialogBase.getSize(this.strings[this._value], 24).width;
        return elements;
    }
};

class SettingButtonTextElement extends SettingTextElement {
    public bitmap: string;
    public color_frame: number[];

    constructor(text: string, bitmap: string = "default_container_frame", color: number[] = [.25, 0, 0, 0], size_text?: number){
        super(text, size_text);
        this.bitmap = bitmap;
        this.color_frame = color;
    }

    public getSize(): Size {
        let size = super.getSize();
        size.width += 20;
        size.height += 20;
        return size;
    }

    public build(dialog: UiDialogSetting, content: com.zhekasmirnov.innercore.api.mod.ui.window.WindowContent, org_size: Size, size: Size, id: string): UI.Elements[] {
        let build: UI.Elements[] = super.build.apply(this, arguments);
        let _size = this.getSize();
        build[0].x += 10;
        build[0].y += 10;
        let self = this;
        build.unshift({type: "frame", scale: .5, x: 0, y: 0, width: _size.width, height: _size.height, bitmap: this.bitmap, color: android.graphics.Color.argb(this.color_frame[0], this.color_frame[1], this.color_frame[2], this.color_frame[3]), clicker: {
            onClick(){
                self.func(dialog);
            }
        }});
        build[1].clicker = {};

        return build;
    }
};

class SettingSlotElement extends SettingElement {
    private item: ItemInstance;
    private size: number;
    private texture: string;
    private iconScale: number = .8;
    private func: (dialog: UiDialogSetting) => void = () => {}

    constructor(item: ItemInstance = {id: 0, count: 0, data: 0}, size: number = 70, texture: string = "_default_slot_empty"){
        super();
        this.item = item;
        this.size = size;
        this.texture = texture;
    }

    public getSize(): Size {
        return {
            width: this.size,
            height: this.size
        }
    }

    public setClick(func: (dialog: UiDialogSetting) => void){
        this.func = func;
        return this;
    }

    public build(dialog: UiDialogSetting, content: com.zhekasmirnov.innercore.api.mod.ui.window.WindowContent, org_size: Size, size: Size, id: string): UI.Elements[] {
        let self = this;
        return [{type: "slot", bitmap: this.texture, source: this.item, clicker: {
            onClick(){
                self.func(dialog);
            }
        }, x: 0, y: 0, visual: true, size: this.size, iconScale: this.iconScale}];
    }
}

class SettingTranslationElement extends SettingButtonTextElement {
    private translations:  {[key: string]: string} = {};

    constructor(configName: string, en: string, langs: string[]){
        super(en);
        langs = langs.slice(0);
        this.configName = configName;
        for(let i in langs)
            this.translations[langs[i]] = langs[i];
        this.translations.en = en;
        langs.unshift("en");
        let self = this;
        this.setClick(function(dialog){
            let ui = new UiDialogSetting("Translation text");
            for(const lang of langs)
                ui.addElement(new SettingTextElement(lang+":")).addElement(new SettingKeyboardElement(lang, lang));
            ui.setCloseHandler(function(){
                for(let key in ui.configs)
                    self.translations[key] = ui.configs[key];
                dialog.configs[configName] = self.translations;
            }).setConfig(self.translations).openCenter();
        });
    }

    public initConfig(config: any): void {
        this.translations = config;
    }

    public build(dialog: UiDialogSetting, content: com.zhekasmirnov.innercore.api.mod.ui.window.WindowContent, org_size: Size, size: Size, id: string): UI.Elements[] {
        let result = super.build.apply(this, arguments);
        dialog.configs[this.configName] = this.translations;
        return result;
    }
};

interface IUiDialogSetting {
    newHeigth: boolean,
    element: SettingElement
};

class UiDialogSetting extends UiDialogBase {
    private elements: IUiDialogSetting[] = [];
    public configs: {[key: string]: any} = {};
    private func: (self: UiDialogSetting) => void = (self) => {};
    private texture: string;

    public addElement(element: SettingElement, newHeigth: boolean = false): UiDialogSetting {
        this.elements.push({element, newHeigth});
        return this;
    }

    constructor(title: string){
        super(title);
        this.texture = "icon_mod_compile";
        this.setEnableExitButton(true);
    }

    public setConfig(configs: {[key: string]: any}): UiDialogSetting {
        this.configs = configs;
        for(let el of this.elements)
            el.element.initConfig(this.configs[el.element.configName]);
        return this;
    }

    public setTextureExit(texture: string): UiDialogSetting{
        this.texture = texture;
        return this;
    }

    public getSize(): Size {
        let size = super.getSize();
        let width = 0;
        for(let i in this.elements){
            let _size = this.elements[i].element.getSize();
            if(this.elements[i].newHeigth){
                size.height = Math.max(size.height, size.height + 5)
                width += _size.width + 10;
                size.width = Math.max(size.width, width + 20);
            }else{
                if(this.elements[Number(i)-1] && this.elements[Number(i)-1].newHeigth)
                    size.width = Math.max(size.width, width + _size.width + 20);
                else
                    size.width = Math.max(size.width, _size.width + 20);
                width = 0;
                size.height += _size.height + 5;
            }
        }
        size.width += 20;
        size.height += 20;
        if(this.enableExitButton)
            size.height += 30;
        return size;
    }
    public setCloseHandler(func: (self: UiDialogSetting) => void ): UiDialogSetting {
        this.func = func;
        return this;
    }
    private enableExitButton: boolean;
    public setEnableExitButton(status: boolean){
        this.enableExitButton = status;
        return this;
    }
    public canEnableExitButton(){
        return this.enableExitButton;
    }
    public build(): UiDialogSetting {
        super.build();

        let size = super.getSize();
        let _size = this.getSize();

        let content = this.ui.getContent();
        let heigth = size.height;
        let x = 0;
        for(let i in this.elements){
            let el = this.elements[i].element;
            let elements = el.build(this, content, size, _size, "element_"+i+"_");
            let element_size = el.getSize();
            for(let a in elements){
                let element = elements[a];
                element.x += this.x+x;
                element.y += this.y+heigth;
                content.elements["element_"+i+"_"+a] = element;
            }
            if(this.elements[i].newHeigth)
                x += element_size.width+5;
            else{
                x = 0;
                heigth += element_size.height+5;
            }
        }
        if(this.enableExitButton){
            let self = this
            content.elements["save"] = {type: "button", bitmap: self.texture, scale: 30/15, x: this.x, y: this.y + heigth, clicker: {
                onClick(){
                    self.func(self);
                    self.close();
                }
            }};
        }
        content.elements["frame"].width = _size.width;
        content.elements["frame"].height = _size.height;

        this.ui.setContent(content);

        return this;
    }
}