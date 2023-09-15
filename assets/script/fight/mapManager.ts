import { Constant } from './../framework/constant';
import { Monster } from './monster';
import { Boss } from './boss';
import { _decorator, Component, Node, Vec3, PhysicsSystem, isValid } from 'cc';
import { LocalConfig } from '../framework/localConfig';
import { ResourceUtil } from '../framework/resourceUtil';
import { GameManager } from './gameManager';
import { ClientEvent } from '../framework/clientEvent';
import { AudioManager } from '../framework/audioManager';
import { PoolManager } from '../framework/poolManager';
const { ccclass, property } = _decorator;
//关卡模型管理脚本（怪物、爱心、障碍、npc）
@ccclass('MapManager')
export class MapManager extends Component {
    public static set isMapAnS (v: boolean) {
        this._isMapAnS = v;
    }

    public static get isMapAnS () {
        return this._isMapAnS;
    }

    private _ndAn: Node = null!;//默认暗夜地图节点
    private _ndAnS: Node = null!;//S型暗夜地图节点
    private _warpGateWorPos_1: Vec3 = new Vec3(16.414, 1.635, -0.804);//an地图传送门位置
    private _warpGateWorPos_2: Vec3 = new Vec3(34.61, 1.635, -20);//anS地图传送门位置
    private _ndWarpGate: Node = null!//传送门
    private _completeListener: Function = null!;//加载完成回调
    private _arrItem: any = [];//存放各项模块节点信息, 除了道路,在玩家后面一定距离则进行回收
    private _arrMap: any = [];//当前关卡数据表
    private _dictModuleType: any;//待加载的模块种类
    private static _isMapAnS: boolean = false;//是否是S型暗夜地图

    onEnable () {
        ClientEvent.on(Constant.EVENT_TYPE.SHOW_WARP_GATE, this._showWarpGate, this);
    }

    onDisable () {
        ClientEvent.off(Constant.EVENT_TYPE.SHOW_WARP_GATE, this._showWarpGate, this);
    }

    start () {
        // [3]
    }

    public buildMap (mapName: string, progressCb: Function, completeCb: Function) {
        this._completeListener = completeCb;
        this._dictModuleType = {};

        this._arrItem = [];
        this._arrMap = [];

        this._arrMap = LocalConfig.instance.getTableArr(mapName).concat();

        let cb = () => {
            if (mapName.startsWith("map1")) {
                this._ndAn && (this._ndAn.active = false);
                this._ndAnS && (this._ndAnS.active = true);
                MapManager.isMapAnS = true;
            } else {
                this._ndAn && (this._ndAn.active = true);
                this._ndAnS && (this._ndAnS.active = false);
                MapManager.isMapAnS = false;
            }

            if (isValid(this._ndWarpGate)) {
                if (PhysicsSystem.PHYSICS_PHYSX) {
                    this._ndWarpGate.destroy();
                } else {
                    PoolManager.instance.putNode(this._ndWarpGate);
                }
            }

            for (let i = this._arrMap.length - 1; i >= 0; i--) {
                const item = this._arrMap[i];
                let baseInfo = LocalConfig.instance.queryByID('base', item.ID);

                if (!this._dictModuleType.hasOwnProperty(baseInfo.type)) {
                    this._dictModuleType[baseInfo.type] = [];
                }

                this._dictModuleType[baseInfo.type].push(item);
            }

            let arrPromise = [];

            for (const i in this._dictModuleType) {
                let item = this._dictModuleType[i];
                if (item.length) {
                    arrPromise.push(this._buildModel(i));
                }
            }

            Promise.all(arrPromise).then(() => {
                this._completeListener && this._completeListener();
                console.log(`load ${mapName} over`);
            }).catch((e) => {
                console.error("load item module err", e);
            })
        }

        if (mapName.startsWith("map0") && !this._ndAn) {
            ResourceUtil.loadModelRes('scene/an').then((prefab: any) => {
                this._ndAn = PoolManager.instance.getNode(prefab, this.node.parent as Node);
                cb();
            })
        } else if (mapName.startsWith("map1") && !this._ndAnS) {
            ResourceUtil.loadModelRes('scene/anS').then((prefab: any) => {
                this._ndAnS = PoolManager.instance.getNode(prefab, this.node.parent as Node);
                cb();
            })
        } else {
            cb();
        }
    }

    private _buildModel (type: string) {
        return new Promise((resolve, reject) => {
            let arrPromise = [];

            let objItems = this._dictModuleType[type];//同类型的信息
            this._dictModuleType[type] = [];

            for (let idx = 0; idx < objItems.length; idx++) {
                //怪物在该层级别的配置信息
                let layerInfo = objItems[idx];
                //怪物的模块数据
                let baseInfo = LocalConfig.instance.queryByID("base", layerInfo.ID);
                let modelPath = `${type}/${baseInfo.resName}`;
                let p = ResourceUtil.loadModelRes(modelPath).then((prefab: any) => {
                    let parentName = type + 'Group';//先创建父节点
                    let ndParent = this.node.getChildByName(parentName);

                    if (!ndParent) {
                        ndParent = new Node(parentName);
                        ndParent.parent = this.node;
                    }

                    let ndChild = PoolManager.instance.getNode(prefab, ndParent) as Node;
                    let position = layerInfo.position ? layerInfo.position.split(',') : baseInfo.position.split(',');
                    let angle = layerInfo.angle ? layerInfo.angle.split(',') : baseInfo.angle.split(',');
                    let scale = layerInfo.scale ? layerInfo.scale.split(',') : baseInfo.scale.split(',');
                    ndChild.setPosition(new Vec3(Number(position[0]), Number(position[1]), Number(position[2])));
                    ndChild.eulerAngles = new Vec3(Number(angle[0]), Number(angle[1]), Number(angle[2]));
                    ndChild.setScale(new Vec3(Number(scale[0]), Number(scale[1]), Number(scale[2])));

                    //test
                    if (baseInfo.type === Constant.BASE_TYPE.MONSTER) {
                        let scriptMonster = ndChild?.getComponent(Monster) as Monster;
                        scriptMonster.init(baseInfo, layerInfo);
                        GameManager.arrMonster.push(ndChild);
                    } else if (baseInfo.type === Constant.BASE_TYPE.BOSS) {
                        GameManager.arrMonster.push(ndChild);
                        GameManager.ndBoss = ndChild;
                        GameManager.scriptBoss = ndChild?.getComponent(Boss) as Boss;
                        GameManager.scriptBoss.init(baseInfo, layerInfo);
                    } else if (baseInfo.type === Constant.BASE_TYPE.NPC) {
                        GameManager.existentNum += 1;
                    } else if (baseInfo.type === Constant.BASE_TYPE.HEART) {
                        GameManager.existentNum += 1;
                    }

                    this._arrItem.push(ndChild);
                })

                arrPromise.push(p);
            }

            Promise.all(arrPromise).then(() => {
                resolve(null);
            }).catch((e) => {
                console.error("e", e);
            })
        })
    }

    /**
     * 回收模块
     */
    public recycle () {
        for (let index = 0; index < this._arrItem.length; index++) {
            const element = this._arrItem[index];
            this._recycleModel(element);
        }

        this.node.removeAllChildren();
    }

    /**
     * 回收子模块
     * @param ndItem 
     */
    private _recycleModel (ndItem: Node) {
        PoolManager.instance.putNode(ndItem);
    }

    /**
     * 展示传送门
     *
     * @private
     * @memberof GameManager
     */
    private _showWarpGate () {
        ResourceUtil.loadModelRes(`warpGate/warpGate`).then((pf: any) => {
            this._ndWarpGate = PoolManager.instance.getNode(pf, this.node.parent as Node);

            AudioManager.instance.playSound(Constant.SOUND.SHOW_WRAP_GATE);

            if (this._ndAn && this._ndAn.active) {
                this._ndWarpGate.setWorldPosition(this._warpGateWorPos_1);
            } else {
                this._ndWarpGate.setWorldPosition(this._warpGateWorPos_2);
            }
        })
    }
}