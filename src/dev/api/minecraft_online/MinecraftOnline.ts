
namespace MinecraftOnline {
    let mods: Mod[] = [];

    interface IMain {
        init?: string;
        patcheds?: {[name: string]: string};
        information?: {
            version?: string;
            change_logs?: {[name: string]: string};
        }
    }

    export class Mod {
        private filesystem: IFileSystem
        private name: string = "";
        private show: boolean = false;
        private main: string;

        constructor(filesystem: IFileSystem, main: string){
            this.filesystem = filesystem;
            this.main = main;
        }

        public initFileJsCode(path: string): void {

        }

        public init(): void {
            let json = this.filesystem.getJsonToFile<IMain>(this.main);
            if(json == null) return;


        }

        public setName(name: string): Mod {
            this.name = name;
            return this;
        }

        public getName(): string {
            return this.name;
        }

        public setShow(show: boolean): Mod {
            this.show = show;
            return this;
        }

        public canShow(): boolean {
            return this.show;
        }
    }

    export function register(mod: Mod): void {
        mods.push(mod);
        mod.init();
    }

    export function endLoadMods(): void {
        open();
    }

    export function open(): void {

    }

    export function close(): void {
        
    }
}

Callback.addCallback("CoreConfigured", () => {
    MinecraftOnline.endLoadMods();
});

Callback.addCallback("NativeGuiChanged", (name) => {
    if(name == "start_screen")
        MinecraftOnline.open();
    else
        MinecraftOnline.close();
});

MinecraftOnline.register(new MinecraftOnline.Mod(new AndroidFileSystem(__dir__+"test"), "main.json")
    .setName("FtbQuests")
    .setShow(true));