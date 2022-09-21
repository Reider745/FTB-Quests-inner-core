/// <reference path="./ui/UiMainBuilder.ts"/>
/// <reference path="./ui/StandartTabElement.ts"/>
/// <reference path="./ui/TabCloseElement.ts"/>
/// <reference path="./ui/Quest.ts"/>
/// <reference path="./quests_utils/RecipeCheck.ts"/>
/// <reference path="./quests_utils/DestroyBlocks.ts"/>

Saver.addSavesScope(__name__,
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
		let players = RecipesUtil.getPlayers();
		for(let i in players){
			let result = [];
			let items = RecipesUtil.get(players[i]);
			for(let a in items)
				result.push(items[a]);
			recipes[Number(players[i])] = result;
		}
		return {
			recipes: recipes,
			blocks: DestroyBlocks.blocks||{}
		}
});

ModAPI.registerAPI("FTBQuests", {
    UiMainBuilder: UiMainBuilder,
    StandartTabElement: StandartTabElement,
    Quest: Quest,
    TabCloseElement: TabCloseElement,
    RecipeCheck: RecipeCheck,
    DestroyBlocks: DestroyBlocks,
    AchievementAPI: AchievementAPI,
    UiDialogBaseStyle: UiDialogBaseStyle,
    UiDialogStyle: UiDialogStyle,
    UiDialog: UiDialog,
    UiDialogBase: UiDialogBase,
    UiTabStyle: UiTabStyle,
    UiJsonParser: UiJsonParser,
    UiStyle: UiStyle,
    CloseButtonStyle: CloseButtonStyle,
    requireGlobal(cmd){
        return eval(cmd);
    }
});