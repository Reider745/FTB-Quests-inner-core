//const RecipesUtil = WRAP_JAVA("com.ftbquests.RecipeList");
type ITEMS = {[item: number]: number};
namespace RecipesUtil {
	let itemsCraft: {[player: number]: ITEMS} = {};

	export function is(player: number, items: number[]): boolean {
		let items_crafts = itemsCraft[player];
		if(!items_crafts) return false;

		for(let item in items_crafts)
			if(items_crafts[item] < 1)
				return false;

		return true;
	}

	export function add(player: number, item: number): void {
		let items_crafts: ITEMS = (itemsCraft[player] || {});

		items_crafts[item] = (items_crafts[item]||0) + 1;

		itemsCraft[player] = items_crafts;
	}

	export function getPlayers(): number[] {
		let players: number[] = [];
		for(let player in itemsCraft) players.push(Number(player));
		return players;
	}

	export function get(player: number): ITEMS {
		return itemsCraft[player] || {};
	}

	export function set(player: number, items: ITEMS): void {
		itemsCraft[player] = items;
	}

	export function clear(): void {
		itemsCraft = {};
	}
}

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

	static registerRecipeCheck(ui: UiMainBuilder, items: number[], isLeft: boolean, tab: string, quest: string, title?: string, description?: string): void {
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