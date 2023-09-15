import { _decorator, Prefab, Node, instantiate, NodePool } from "cc";
const { ccclass, property } = _decorator;
@ccclass("PoolManager")
export class PoolManager {
    private _dictPool: any = {}//对象池字典
    private _dictPrefab: any = {}//预制体字典

    static _instance: PoolManager;

    static get instance() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new PoolManager();
        return this._instance;
    }

    /**
     * 根据预设从对象池中获取对应节点
     */
    public getNode(prefab: Prefab, parent: Node) {
        let name = prefab.name;
        //@ts-ignore
        if (!prefab.position) {
            //@ts-ignore
            name = prefab.data.name;
        }

        this._dictPrefab[name] = prefab;
        let node: Node = null!;
        if (this._dictPool.hasOwnProperty(name)) {
            //已有对应的对象池
            let pool = this._dictPool[name];
            if (pool.size() > 0) {
                node = pool.get();
            } else {
                node = instantiate(prefab);
            }
        } else {
            //没有对应对象池，创建他！
            let pool = new NodePool();
            this._dictPool[name] = pool;

            node = instantiate(prefab);
        }

        node.parent = parent;
        node.active = true;
        return node;
    }

    /**
     * 将对应节点放回对象池中
     */
    public putNode(node: Node) {
        if (!node) {
            return;
        }
        let name = node.name;
        let pool = null;
        if (this._dictPool.hasOwnProperty(name)) {
            //已有对应的对象池
            pool = this._dictPool[name];
        } else {
            //没有对应对象池，创建他！
            pool = new NodePool();
            this._dictPool[name] = pool;
        }

        pool.put(node);
    }

    /**
     * 根据名称，清除对应对象池
     */
    public clearPool(name: string) {
        if (this._dictPool.hasOwnProperty(name)) {
            let pool = this._dictPool[name];
            pool.clear();
        }
    }
    
    /**
     * 预生成对象池
     *
     * @param {Prefab} prefab 预制体
     * @param {number} num 需要预加载的数量
     * @returns
     * @memberof PoolManager
     */
    public preloadPool (prefab: Prefab, num: number) {
        let name = prefab.name;
        // @ts-ignore
        if (!prefab.position) {
            // @ts-ignore
            name = prefab.data.name;
        }

        let pool: any = null;
        if (this._dictPool.hasOwnProperty(name)) {
            // 已有对应的对象池
            pool = this._dictPool[name];
        } else {
            // 没有对应对象池，创建他！
            pool = new NodePool();
            this._dictPool[name] = pool;
        }         

        for (let i = 0; i < num; i++) {
            let node = instantiate(prefab);
            pool.put(node);
        }
    }
}
