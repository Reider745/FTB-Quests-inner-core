/// <reference path="./ui/UiMainBuilder.ts"/>
/// <reference path="./ui/StandartTabElement.ts"/>
/// <reference path="./ui/TabCloseElement.ts"/>
/// <reference path="./ui/GroupTabElement.ts"/>
/// <reference path="./ui/Quest.ts"/>
/// <reference path="./quests_utils/RecipeCheck.ts"/>
/// <reference path="./quests_utils/DestroyBlocks.ts"/>
/// <reference path="./quests_utils/GiveItems.ts"/>

Saver.addSavesScope("FTBQuests",
	function read(scope: any){
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
Callback.addCallback('LevelLeft', function(){
    RecipesUtil.clear();
    DestroyBlocks.blocks = {};
});

ModAPI.registerAPI("FTBQuests", {
    UiMainBuilder: UiMainBuilder,
    StandartTabElement: StandartTabElement,
    GroupTabElement: GroupTabElement,
    UiTabsBuilder: UiTabsBuilder,
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
    GiveItems: GiveItems,
    UiDialogSetting: UiDialogSetting,
    Keyboard: Keyboard,
    SelectedItemDialog: SelectedItemDialog,
    Setting: {
        SettingElement: SettingElement,
        SettingButtonElement: SettingButtonElement,
        SettingIconElement: SettingIconElement,
        SettingItemsElement: SettingItemsElement,
        SettingKeyboardElement: SettingKeyboardElement,
        SettingNumbersElement: SettingNumbersElement,
        SettingStringsElement: SettingStringsElement,
        SettingTextElement: SettingTextElement,
        SettingButtonTextElement: SettingButtonTextElement,
        SettingSlotElement: SettingSlotElement,
        SettingTranslationElement: SettingTranslationElement
    },
    requireGlobal(cmd){
        return eval(cmd);
    }
});