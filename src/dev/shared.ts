/// <reference path="./ui/UiMainBuilder.ts"/>
/// <reference path="./ui/StandartTabElement.ts"/>
/// <reference path="./ui/TabCloseElement.ts"/>
/// <reference path="./ui/GroupTabElement.ts"/>
/// <reference path="./ui/Quest.ts"/>
/// <reference path="./quests_utils/RecipeCheck.ts"/>
/// <reference path="./quests_utils/DestroyBlocks.ts"/>
/// <reference path="./quests_utils/GiveItems.ts"/>

type SAVE = {
    new_recipes_status: boolean,
    recipes: {},//старая хуйня, мне на её похуй
    recipes_new: {[player: number]: ITEMS},
    blocks: BLOCKS
};

Saver.addSavesScope("FTBQuests",
	function read(scope: SAVE){
        if(!scope.new_recipes_status){//legacy save
            let keys = Object.keys(scope.recipes);
            for(let i in keys){
                let recipes = scope.recipes[keys[i]];
                for(let a in recipes)
                    RecipesUtil.add(Number(keys[i]), recipes[a]);
            }
        }

        const RECIPES = scope.recipes_new;
        for(let player in RECIPES)
            RecipesUtil.set(Number(player), RECIPES[player]);
		
		DestroyBlocks.blocks = scope.blocks||{};
	}, function save(): SAVE {
		const recipes = {};
		const players = RecipesUtil.getPlayers();

		for(const i in players){
            const player = players[i];
			recipes[player] = RecipesUtil.get(player);
        }
		
		return {
            new_recipes_status: true,
            recipes: {},
			recipes_new: recipes,
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
    TabSetting: TabSetting,

    RecipeCheck: RecipeCheck,
    DestroyBlocks: DestroyBlocks,
    AchievementAPI: AchievementAPI,

    UiDialogBaseStyle: UiDialogBaseStyle,
    UiDialogStyle: UiDialogStyle,
    UiDialog: UiDialog,
    UiDialogBase: UiDialogBase,
    UiStyle: UiStyle,
    MinecraftDialogStyle: MinecraftDialogStyle,

    UiTabStyle: UiTabStyle,
    UiJsonParser: UiJsonParser,
    

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
        SettingTranslationElement: SettingTranslationElement,
        SettingSwitchElement: SettingSwitchElement
    },
    requireGlobal(cmd){
        return eval(cmd);
    }
});
/*
Example

class ExampleCustomTab extends StandartTabElement {
    public onLongClick(position: Vector, container: ItemContainer, tileEntity: TileEntity, window: UI.Window, canvas: globalAndroid.graphics.Canvas, scale: number): boolean {
        alert("tab custom");
        return super.onLongClick(position, container, tileEntity, window, canvas, scale);
    }

    public getDisplayName(): string {
        return "Custom tab";
    }

    public getItem(): ItemInstance {
        return {id: Math.floor(264*Math.random()), count: 1, data: 0};
    }
};

class ExampleCustomQuest extends Quest {
    private custom_ui: UiDialogSetting;

    constructor(description: IQuest){
        super(description);

        this.custom_ui = new UiDialogSetting("Test dialog");
        this.custom_ui.add(new SettingTextElement("Ехал Жека через реку, проебал Жека репу!"))
    }

    public getItem(): ItemInstance {
        return {id: Math.floor(264*Math.random()), count: 1, data: 0};
    }

    public onClick(position: Vector, container: ItemContainer, tileEntity: TileEntity, window: UI.Window, canvas: globalAndroid.graphics.Canvas, scale: number): void {
        this.custom_ui.openCenter();
    }
}

let example = new UiMainBuilder("example_book");
example.addRenderLeft(
    new StandartTabElement("example_tab_left")
        .setItem({id: 264, count: 1, data: 0})
        .setDisplayName("1")

        .addQuest(new ExampleCustomQuest({
            id: "example_1",
            x: 100,
            y: 100,
            size: 60
        }))

        .addQuest(new ExampleCustomQuest({
            id: "example_2",
            x: 200,
            y: 400,
            size: 100,
            lines: ["example_1"]
        }))
);
example.addRenderLeft(
    new GroupTabElement("example_group")
        .addTab(
            new StandartTabElement("example_group_1") 
                .setItem({id: 266, count: 1, data: 0})
                .setDisplayName("2")
        )
        .addTab(
            new StandartTabElement("example_group_2")
                .setItem({id: 263, count: 1, data: 0})
                .setDisplayName("3")
        )
);
example.addRender(true, new ExampleCustomTab("example_custom_tab"))

example.addRenderRight(
    new StandartTabElement("example_tab_right")
        .setItem({id: 1, count: 1, data: 0})
        .setDisplayName("4")
);

example.registerItem(VanillaItemID.book);
example.registerSave();

//The last 2 parameters are needed for the animation of the achievement
RecipeCheck.registerRecipeCheck(example, [263], true, "example_tab_left", "example_1", "Title", "description");
RecipeCheck.registerRecipeCheck(example, [264], true, "example_tab_left", "example_2");*/