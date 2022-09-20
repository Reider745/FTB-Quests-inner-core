interface IDestroyBlocks {
	blocks: string[];

	ui: UiMainBuilder;

	isLeft: boolean;
	tab: string;
	quest: string;

	title?: string;
	description?: string;
};

class DestroyBlocks {
	static blocks: {[key: string]: {[key: string]: boolean}} = {};
	static register_checks: IDestroyBlocks[] = [];

	static isDestroys(player: number, arr: string[]): boolean {
		let blocks = DestroyBlocks.blocks[player] = DestroyBlocks.blocks[player] || {};
		for(let i in arr)
			if(!blocks[arr[i]])
				return false;
		return true;
	}

	static addDestroy(player, id, data): void {
		this.blocks[player] = this.blocks[player] || {};
		this.blocks[player][id+":"+data] = true;
	}

	static registerRecipeCheck(ui: UiMainBuilder, blocks: string[], isLeft: boolean, tab: string, quest: string, title: string, description?: string): void {
		DestroyBlocks.register_checks.push({
			ui: ui,
			blocks: blocks,
			isLeft: isLeft,
			tab: tab,
			quest: quest,
			description: description,
			title: title
		});
	}
};

Callback.addCallback("DestroyBlock", function(coords, tile, player){
	DestroyBlocks.addDestroy(player, tile.id, tile.data);
	for(let i in DestroyBlocks.register_checks){
		let object: IDestroyBlocks = DestroyBlocks.register_checks[i];

		if(DestroyBlocks.isDestroys(player, object.blocks))
			if(!object.ui.canQuest(object.isLeft, object.tab, object.quest, player) && object.ui.giveQuest(object.isLeft, object.tab, object.quest, player, true, true) && object.description != undefined && object.title != undefined)
				AchievementAPI.give(player, object.title, object.description, object.ui.getQuest(object.isLeft, object.tab, object.quest).getItem());
	}
});