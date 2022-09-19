/// <reference path="./ui/UiMainBuilder.ts"/>
/// <reference path="./ui/StandartTabElement.ts"/>
/// <reference path="./ui/Quest.ts"/>

ModAPI.registerAPI("FTBQuests", {
    UiMainBuilder: UiMainBuilder
});

let items = Object.keys(ItemID);
let main = new UiMainBuilder("client_name");
for(let i = 0;i < 15;i++)
    main.addRenderLeft(new StandartTabElement("test"+i).addQuest(new Quest({
        id: "test1",
        x: 50,
        y: 50,
        texture: "test",
        item: {
            id: ItemID[items[Math.floor(Math.random() * items.length)]],
            count: 1,
            data: 0
        }
    })).addQuest(new Quest({
        id: "test2",
        x: 300,
        y: 50,
        texture: "test",
        lines: ["test1"],
        item: {
            id: ItemID[items[Math.floor(Math.random() * items.length)]],
            count: 1,
            data: 0
        }
    })));

main.addRenderRight(new StandartTabElement("test"));
main.addRenderRight(new StandartTabElement("test2"));
main.addRenderRight(new StandartTabElement("test3"));
main.addRenderRight(new StandartTabElement("test4"));

ItemContainer.registerScreenFactory("FTBQuests.Main", (container, name) => {
    return main.build(container);
});
Callback.addCallback("ItemUse", function(coords, item, block, is, player){
    if(item.id == 280){
        AchievementAPI.give(player, "Test Display Name", "Test super puper description\nnew line", {id: 5, data: 1, count: 1});
        return;
    }
    if(item.id == 264)
        main.giveQuest(true, "test0", "test1", player, true, true);
    else if(item.id == 263)
        main.giveQuest(true, "test0", "test2", player, true, true);
    let container: ItemContainer = new ItemContainer();
    main.buildServer(container);
    container.setClientContainerTypeName("FTBQuests.Main");
    container.openFor(Network.getClientForPlayer(player), "main");
});