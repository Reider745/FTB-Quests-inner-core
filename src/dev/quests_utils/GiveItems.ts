class GiveItems {
    static items: {[key: string]: ItemInstance[]} = {};

    static registerGive(main: UiMainBuilder, isLeft: boolean, tab: string, quest: string, items: ItemInstance[]){
        GiveItems.items[main.getClientName()+":"+isLeft+":"+tab+":"+quest] = items;
    }
};

Callback.addCallback("QuestGive", function(main: UiMainBuilder, isLeft: boolean, tab: string, quest: string, player: number, value: boolean, is: boolean, result: boolean){
    if(result){
        let items = GiveItems.items[main.getClientName()+":"+isLeft+":"+tab+":"+quest];
        if(items){
            let actor = new PlayerActor(player);
            for(let item of items)
                actor.addItemToInventory(item.id, item.count, item.data, item.extra||null, true);
        }
    }
});