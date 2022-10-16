Translation.addTranslation("Tabs", {
    ru: "Вкладки"
})

class GroupTabElement extends StandartTabElement {
    private tabs: StandartTabElement[] = [];

    public addTab(tab: StandartTabElement): GroupTabElement {
        tab.setUiTabsBuilder(this.tab);
        this.tabs.push(tab);
        return this;
    }

    public getQuest(name: string): Quest {
        for(const tab of this.tabs){
            let quest = tab.getQuest(name);
            if(quest)
                return quest;
        }
        return null;
    }

    public getTab(name: string): StandartTabElement {
        for(const tab of this.tabs)
            if(tab.getId() == name)
                return tab;
        return null;
    }

    public addedTab(): GroupTabElement {
        for(const tab of this.tabs)
            tab.setUiTabsBuilder(this.tab);
        return this;
    }

    public onClick(position: Vector, container: ItemContainer, tileEntity: TileEntity, window: UI.Window, canvas: globalAndroid.graphics.Canvas, scale: number): boolean {
        let ui = new UiDialogSetting("Tabs")
            .setEnableExitButton(false);
        let self = this;
        for(const tab of this.tabs)
            ui.addElement(new SettingButtonTextElement(tab.getDisplayName()).setClick(function(){
                self.tab.main.openTab(self.tab, tab, self.getId());
                ui.close();
            }));
        
        this.tab.openDialogToTab(ui, this);
        return false;
    }
    public onLongClick(position: Vector, container: ItemContainer, tileEntity: TileEntity, window: UI.Window, canvas: globalAndroid.graphics.Canvas, scale: number): boolean {
        return this.onClick.apply(this, arguments)
    }
};