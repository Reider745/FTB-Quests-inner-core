/// <reference path="./api/UiMainBuilder.ts"/>
ModAPI.registerAPI("FTBQuests", {
    UiMainBuilder: UiMainBuilder
});
ItemContainer.registerScreenFactory("FTBQuests.Main", (container, name) => {
    return new UiMainBuilder().build();
});
Callback.addCallback("ItemUse", function(coords, item, block, is, player){
    let container: ItemContainer = new ItemContainer();
    container.setClientContainerTypeName("FTBQuests.Main");
    container.openFor(Network.getClientForPlayer(player), "main");
});