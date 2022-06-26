interface IQuest {
    id: string,
    x: number,
    y: number,
    size?: number,
    item?: ItemInstance,
    texture?: string
}


class Quest {
    protected description: IQuest;
    constructor(description: IQuest){
        this.description = description;
    }
    public getId(): string {
        return this.description.id;
    }
    public getItem(): ItemInstance {
        return this.description.item === undefined ? {id: 0, count: 1, data: 0} : this.description.item
    }
    public getX(): number {
        return this.description.x;
    }
    public getY(): number {
        return this.description.y;
    }
    public getSize(): number {
        return this.description.size === undefined ? 50 : this.description.size;
    }
    public getTexture(style: UiStyle): string {
        return this.description.texture === undefined ? style.tab.quest : this.description.texture;
    }
    
    public build(style: UiStyle): any {
        return {type: "slot", bitmap: this.getTexture(style), source: this.getItem(), x: this.getX(), y: this.getY(), size: this.getSize(), visual: true};
    }
};