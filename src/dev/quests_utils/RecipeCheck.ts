const RecipesUtil = WRAP_JAVA("com.skyfactory.RecipeList");

interface IRecipeCheck {
	items: number[];

	ui: UiMainBuilder;

	isLeft: boolean;
	tab: string;
	quest: string;

	title?: string;
	description?: string;
};

class RecipeCheck {
	static register_checks: IRecipeCheck[] = [];
	static isCrafts(player: number, items: number[]): boolean {
		return RecipesUtil.is(player, items) == true;
	}

	static addCraft(player: number, item: number): void {
		RecipesUtil.add(player, item);
	}

	static registerRecipeCheck(ui: UiMainBuilder, items: number[], isLeft: boolean, tab: string, quest: string, title: string, description?: string): void {
		RecipeCheck.register_checks.push({
			ui: ui,
			items: items,
			isLeft: isLeft,
			tab: tab,
			quest: quest,
			description: description,
			title: title
		});
	}
};

Callback.addCallback("VanillaWorkbenchCraft", function(result, container, player){
	RecipeCheck.addCraft(player, result.id);
	for(let i in RecipeCheck.register_checks){
		let object: IRecipeCheck = RecipeCheck.register_checks[i];

		if(RecipeCheck.isCrafts(player, object.items))
			if(!object.ui.canQuest(object.isLeft, object.tab, object.quest, player) && object.ui.giveQuest(object.isLeft, object.tab, object.quest, player, true, true) && object.description != undefined && object.title != undefined)
				AchievementAPI.give(player, object.title, object.description, object.ui.getQuest(object.isLeft, object.tab, object.quest).getItem());
	}
});