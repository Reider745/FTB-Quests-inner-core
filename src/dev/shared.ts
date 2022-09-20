/// <reference path="./ui/UiMainBuilder.ts"/>
/// <reference path="./ui/StandartTabElement.ts"/>
/// <reference path="./ui/TabCloseElement.ts"/>
/// <reference path="./ui/Quest.ts"/>
/// <reference path="./quests_utils/RecipeCheck.ts"/>
/// <reference path="./quests_utils/DestroyBlocks.ts"/>

Saver.addSavesScope("save.skyblock",
	function read(scope: any){
        RecipesUtil.clear();
        let keys = Object.keys(scope.recipes);
		for(let i in keys){
			let recipes = scope.recipes[keys[i]];
			for(let a in recipes)
                RecipesUtil.add(Number(keys[i]), recipes[a]);
		}
		
		DestroyBlocks.blocks = scope.blocks||{};
	}, function save() {
		let recipes = {};
        alert("test 1");
		let players = RecipesUtil.getPlayers();
		for(let i in players){
			let result = [];
			let items = RecipesUtil.get(players[i]);
			for(let a in items)
				result.push(items[a]);
			recipes[Number(players[i])] = result;
		}
		alert("test 2");
		return {
			recipes: recipes,
			blocks: DestroyBlocks.blocks||{}
		}
});

ModAPI.registerAPI("FTBQuests", {
    UiMainBuilder: UiMainBuilder
});

let items = Object.keys(ItemID);
let main = new UiMainBuilder("client_name");
for(let i = 0;i < 15;i++)
    main.addRenderLeft(new StandartTabElement("test"+i).setDisplayName("Test Name").setItem({id: 5, data: 0, count: 1}).addQuest(new Quest({
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

main.addRenderRight(new TabCloseElement("close"));
main.addRenderRight(new StandartTabElement("test2"));
main.addRenderRight(new StandartTabElement("test3"));
main.addRenderRight(new StandartTabElement("test4"));

RecipeCheck.registerRecipeCheck(main, [264], true, "test0", "test1", "АЛМАЗЫ!!!", "Получите алмазы!");
DestroyBlocks.registerRecipeCheck(main, ["1:0"], true, "test0", "test2", "КАМЕНЬ!!!", "СЛОМАЙ КАМЕНЬ!");

ItemContainer.registerScreenFactory("FTBQuests.Main", (container, name) => {
    return main.build(container);
});
Callback.addCallback("ItemUse", function(coords, item, block, is, player){
    if(item.id == 280){
        AchievementAPI.give(player, "Test Display Name", "Test super puper description\nnew line", {id: 5, data: 1, count: 1});
        return;
    }
    if(item.id == 263)
        main.giveQuest(true, "test0", "test2", player, true, true);
    else if(item.id != 265) return;
    let container: ItemContainer = new ItemContainer();
    main.buildServer(container);
    container.setClientContainerTypeName("FTBQuests.Main");
    container.openFor(Network.getClientForPlayer(player), "main");
});