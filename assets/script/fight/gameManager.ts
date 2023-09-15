import { ClientEvent } from './../framework/clientEvent';
import { PlayerData } from './../framework/playerData';
import { UIManager } from './../framework/uiManager';
import { _decorator, Component, Node, CameraComponent, Vec3, SkeletalAnimationComponent, ParticleSystemComponent, AnimationComponent, find, Prefab } from 'cc';
import { GameCamera } from './gameCamera';
import { ResourceUtil } from '../framework/resourceUtil';
import { Constant } from '../framework/constant';
import { LocalConfig } from '../framework/localConfig';
import { AudioManager } from '../framework/audioManager';
import { Util } from '../framework/util';
import { PoolManager } from '../framework/poolManager';
const { ccclass, property } = _decorator;
//游戏管理脚本
@ccclass('GameManager')
export class GameManager extends Component {
    @property(GameCamera)
    public camera: GameCamera = null!;//相机脚本

    @property(Node)
    public ndLight: Node = null!; //主光源

    public set scriptMapManager (v: any) {
        this._scriptMapManager = v;
    }

    public get scriptMapManager () {
        return this._scriptMapManager;
    }

    public set mapInfo (v: any) {
        this._mapInfo = v;
    }

    public get mapInfo () {
        return this._mapInfo;
    }

    public static set mainCamera (v: any) {
        this._mainCamera = v;
    }

    public static get mainCamera () {
        return this._mainCamera;
    }

    public static set isGameStart (v: boolean) {
        this._isGameStart = v;
    }

    public static get isGameStart () {
        return this._isGameStart;
    }

    public static set isGamePause (v: boolean) {
        this._isGamePause = v;
    }

    public static get isGamePause () {
        return this._isGamePause;
    }

    public static set isGameOver (v: boolean) {
        this._isGameOver = v;
    }

    public static get isGameOver () {
        return this._isGameOver;
    }

    public static set scriptPlayer (v: any) {
        this._scriptPlayer = v;
    }

    public static get scriptPlayer () {
        return this._scriptPlayer;
    }

    public static set scriptGameCamera (v: GameCamera) {
        this._scriptGameCamera = v;
    }

    public static get scriptGameCamera () {
        return this._scriptGameCamera;
    }

    public static set ndPlayer (v: Node) {
        this._ndPlayer = v;
    }

    public static get ndPlayer () {
        return this._ndPlayer;
    }

    public static set ndBoss (v: Node) {
        this._ndBoss = v;
    }

    public static get ndBoss () {
        return this._ndBoss;
    }

    public static set scriptBoss (v: any) {
        this._scriptBoss = v;
    }

    public static get scriptBoss () {
        return this._scriptBoss;
    }

    public static set ndGameManager (v: Node) {
        this._ndGameManager = v;
    }

    public static get ndGameManager () {
        return this._ndGameManager;
    }

    public static set ndEffectManager (v: Node) {
        this._ndEffectManager = v;
    }

    public static get ndEffectManager () {
        return this._ndEffectManager;
    }

    public static set ndMapManager (v: Node) {
        this._ndMapManager = v;
    }

    public static get ndMapManager () {
        return this._ndMapManager;
    }

    public static set isRevive (v: boolean) {
        this._isRevive = v;
    }

    public static get isRevive () {
        return this._isRevive;
    }

    public static set isTesting (v: boolean) {
        this._isTesting = v;
    }

    public static get isTesting () {
        return this._isTesting;
    }

    public static set isFirstLoad (v: boolean) {
        this._isFirstLoad = v;
    }

    public static get isFirstLoad () {
        return this._isFirstLoad;
    }

    public static set arrMonster (v: Node[]) {
        this._arrMonster = v;
    }

    public static get arrMonster () {
        return this._arrMonster;
    }

    public static set existentNum (v: number) {
        this._existentNum = v;
    }

    public static get existentNum () {
        return this._existentNum;
    }

    public static set attackAddition (v: number) {
        this._attackAddition = v;
    }

    public static get attackAddition () {
        return this._attackAddition;
    }

    public static set defenseAddition (v: number) {
        this._defenseAddition = v;
    }

    public static get defenseAddition () {
        return this._defenseAddition;
    }

    public static set hpAddition (v: number) {
        this._hpAddition = v;
    }

    public static get hpAddition () {
        return this._hpAddition;
    }

    public static set moveSpeedAddition (v: number) {
        this._moveSpeedAddition = v;
    }

    public static get moveSpeedAddition () {
        return this._moveSpeedAddition;
    }

    public static set attackSpeedAddition (v: number) {
        this._attackSpeedAddition = v;
    }

    public static get attackSpeedAddition () {
        return this._attackSpeedAddition;
    }

    public static set isWin (value: boolean) {
        this._isWin = value;

        if (GameManager.isGameStart) {
            ClientEvent.dispatchEvent(Constant.EVENT_TYPE.ON_GAME_OVER);
        }
    }

    public static get isWin () {
        return this._isWin;
    }

    public static set gameSpeed (value: number) {
        console.log("gameSpeed", GameManager.gameSpeed);

        this._gameSpeed = value;
        GameManager.refreshEffectSpeed(GameManager.ndGameManager, this._gameSpeed);
        GameManager.refreshEffectSpeed(GameManager.ndPlayer as Node, this._gameSpeed);
        GameManager.refreshEffectSpeed(GameManager.ndEffectManager as Node, this._gameSpeed);
    };

    public static get gameSpeed () {
        return this._gameSpeed;
    }

    private _dictMonsterSkill: any = {};//已经预加载的敌人技能
    private _oriMainLightWorPos: Vec3 = null!;//主光源节点初始世界坐标
    private _offsetWorPosMainLight: Vec3 = new Vec3();//主光源和玩家的向量差
    private _scriptMapManager: any = null!;//地图脚本脚本
    private _mapInfo: any = {};//地图信息

    private static _gameSpeed: number = 1;//游戏速度
    private static _isWin: boolean = false;//是否取得胜利
    private static _mainCamera: CameraComponent | null = null;//相机脚本
    private static _isGameStart: boolean = false;//游戏是否开始
    private static _isGamePause: boolean = false;//游戏是否暂停
    private static _isGameOver: boolean = false;//游戏是否结束
    private static _scriptPlayer: any = null!;//玩家脚本
    private static _scriptGameCamera: GameCamera;//相机脚本
    private static _ndPlayer: Node = null!;//玩家节点
    private static _ndBoss: Node = null!;//boss节点
    private static _scriptBoss: any = null!;//boss脚本
    private static _ndGameManager: Node;//游戏全局管理节点
    private static _ndEffectManager: Node = null!;//特效节点
    private static _ndMapManager: Node = null!;//地图节点
    private static _isRevive: boolean = false;//玩家是否复活
    private static _isTesting: boolean = true;//是否开启测试代码
    private static _isFirstLoad: boolean = false;//是否首次加载
    private static _arrMonster: Node[] = []; //小怪、boss数组
    private static _existentNum: number = 0;//本层加载的npc、大爱心现存数量（怪物不会和npc、大爱心同时出现，配置表格需注意）
    //本层敌人加成
    private static _attackAddition: number = 1;//本层敌人攻击加成
    private static _defenseAddition: number = 1;//本层敌人防御加成
    private static _hpAddition: number = 1;//本层敌人生命加成
    private static _moveSpeedAddition: number = 1;//本层敌人移速加成
    private static _attackSpeedAddition: number = 1;//本层敌人攻速加成

    onEnable () {
        ClientEvent.on(Constant.EVENT_TYPE.ON_GAME_INIT, this._onGameInit, this);
        ClientEvent.on(Constant.EVENT_TYPE.ON_GAME_OVER, this._onGameOver, this);
        ClientEvent.on(Constant.EVENT_TYPE.ON_GAME_PAUSE, this._onGamePause, this);
        ClientEvent.on(Constant.EVENT_TYPE.REFRESH_LEVEL, this._refreshLevel, this);
        ClientEvent.on(Constant.EVENT_TYPE.RECYCLE_ALL, this._recycleAll, this);
    }

    onDisable () {
        ClientEvent.off(Constant.EVENT_TYPE.ON_GAME_INIT, this._onGameInit, this);
        ClientEvent.off(Constant.EVENT_TYPE.ON_GAME_OVER, this._onGameOver, this);
        ClientEvent.off(Constant.EVENT_TYPE.ON_GAME_PAUSE, this._onGamePause, this);
        ClientEvent.off(Constant.EVENT_TYPE.REFRESH_LEVEL, this._refreshLevel, this);
        ClientEvent.off(Constant.EVENT_TYPE.RECYCLE_ALL, this._recycleAll, this);
    }

    start () {
        GameManager.mainCamera = this.camera?.getComponent(CameraComponent) as CameraComponent;
        GameManager.scriptGameCamera = this.camera?.getComponent(GameCamera) as GameCamera;
        GameManager.ndGameManager = this.node;
        GameManager.ndMapManager = find("mapManager") as Node;
        GameManager.ndEffectManager = find("effectManager") as Node;

        this._oriMainLightWorPos = this.ndLight.worldPosition.clone();
        this.scriptMapManager = find("mapManager")?.getComponent("MapManager");

        if (GameManager.isTesting) {
            //@ts-ignore
            window.uiManager = UIManager.instance;
            //@ts-ignore
            window.AudioManager = AudioManager.instance;
            //@ts-ignore
            window.playerData = PlayerData.instance;
            //@ts-ignore
            window.clientEvent = ClientEvent;
            //@ts-ignore
            window.ndGameManager = GameManager.ndGameManager;
            //@ts-ignore
            window.GameManager = GameManager;
            //@ts-ignore
            window.ndMapManager = GameManager.ndMapManager;
            //@ts-ignore
            window.ndEffectManager = GameManager.ndEffectManager;
            //@ts-ignore
            window.constant = Constant;
        }
    }

    /**
     * 初始化游戏
     */
    private _onGameInit (finishCb: Function) {
        let level = PlayerData.instance.playerInfo.level;

        let totalLevel = LocalConfig.instance.getTableArr("checkpoint").length;
        //游戏通关后从倒数第10关开始循环(61-70)
        if (level > totalLevel) {
            level = (totalLevel - 10) + (level - totalLevel) % 10;
        }

        this.mapInfo = LocalConfig.instance.queryByID("checkpoint", String(level));
        //设置本层敌人属性加成比例
        GameManager.attackAddition = this.mapInfo.attackAddition;
        GameManager.defenseAddition = this.mapInfo.defenseAddition;
        GameManager.hpAddition = this.mapInfo.hpAddition;
        GameManager.moveSpeedAddition = this.mapInfo.moveSpeedAddition;
        GameManager.attackSpeedAddition = this.mapInfo.attackSpeedAddition;

        GameManager.isGameStart = false;
        GameManager.isGamePause = false;
        GameManager.isGameOver = false;
        GameManager.isWin = false;
        GameManager.isRevive = false;
        GameManager.arrMonster = [];
        GameManager.gameSpeed = 1;
        GameManager.ndBoss = null!;
        GameManager.existentNum = 0;

        PlayerData.instance.addFightTimes();

        AudioManager.instance.stopAllSound();
        AudioManager.instance.stopMusic();

        // if (GameManager.isFirstLoad) {
        //     this._refreshLevel();
        // } else {
        UIManager.instance.showDialog("loading/loadingPanel", [() => {
            this._refreshLevel();
        }], finishCb);
        // }
    }

    /**
     * 刷新关卡, 后期优化写法。。。
     */
    private _refreshLevel () {
        //每层随机一张地图
        let arrMap = this.mapInfo.mapName.split("#");
        let mapName = arrMap[Math.floor(Math.random() * arrMap.length)];

        this.preloadMonsterSkill(mapName).then(() => {
            this._recycleAll();
            this._loadMap(mapName, () => {
                //第一次进入或者失败后被销毁需要重新创建
                if (!GameManager.ndPlayer) {
                    this._createPlayer();
                } else {
                    GameManager.scriptPlayer.preloadArrow(() => {
                        console.log("###_refreshLevel1");
                        ClientEvent.dispatchEvent(Constant.EVENT_TYPE.HIDE_LOADING_PANEL, () => {
                            GameManager.scriptPlayer.resetPlayerState();
                        });
                    })
                }
            });
        })
    }

    /**
     * 加载地图数据
     *
     * @private
     * @param {Function} [cb=()=>{}]
     * @memberof GameManager
     */
    private _loadMap (mapName: string, cb: Function = () => { }) {
        this.scriptMapManager.buildMap(mapName, () => { }, () => {
            cb && cb();
        })
    }

    /**
     * 创建玩家
     *
     * @private
     * @memberof GameManager
     */
    private _createPlayer () {
        ResourceUtil.loadModelRes("player/player01").then((pf: any) => {
            GameManager.ndPlayer = PoolManager.instance.getNode(pf, this.node) as Node;

            let scriptGameCamera = GameManager.mainCamera?.node.getComponent(GameCamera) as GameCamera;
            scriptGameCamera.ndFollowTarget = GameManager.ndPlayer;

            let scriptPlayer: any = GameManager.ndPlayer?.getComponent("Player");
            GameManager.scriptPlayer = scriptPlayer;
            scriptPlayer?.init();

            // if (GameManager.isFirstLoad) {
            //     GameManager.isFirstLoad = false;
            //     scriptPlayer.preloadArrow(()=>{
            //         clientEvent.dispatchEvent(constant.EVENT_TYPE.REMOVE_NODE_GAME_START);
            //     })
            // } else {
            scriptPlayer.preloadArrow(() => {
                ClientEvent.dispatchEvent(Constant.EVENT_TYPE.HIDE_LOADING_PANEL);
            })
            // }
        })
    }

    /**
     * 回收怪兽, 武器，特效等
     *
     * @private
     * @memberof GameManager
     */
    private _recycleAll () {
        this.scriptMapManager.recycle();

        for (let i = this.node.children.length - 1; i >= 0; i--) {
            const ndChild = this.node.children[i];
            if (ndChild.name !== "player01") {
                PoolManager.instance.putNode(ndChild);
            }
        }

        while (GameManager.ndEffectManager.children.length) {
            PoolManager.instance.putNode(GameManager.ndEffectManager.children[0]);
        }
    }

    /**
     * 游戏结束
     */
    private _onGameOver () {
        if (GameManager.isGameOver) {
            return;
        }

        GameManager.isGamePause = true;

        console.log("game over!", "isWin ?", GameManager.isWin);

        if (GameManager.isWin) {
            UIManager.instance.hideDialog("fight/fightPanel");

            GameManager.isGameOver = true;

            this._recycleAll();

            let nextLevel = Number(PlayerData.instance.playerInfo.level) + 1;
            PlayerData.instance.playerInfo.level = nextLevel;

            //更新已解锁最高层级
            if (nextLevel > PlayerData.instance.playerInfo.highestLevel) {
                PlayerData.instance.playerInfo.highestLevel = nextLevel;
            }

            ClientEvent.dispatchEvent(Constant.EVENT_TYPE.ON_GAME_INIT);
        } else {
            UIManager.instance.showDialog("revive/revivePanel", [() => {
                if (GameManager.ndPlayer) {
                    PoolManager.instance.putNode(GameManager.ndPlayer);
                    GameManager.ndPlayer = null!;
                    GameManager.scriptPlayer = null!;
                }

                this._recycleAll();
            }]);
        }
    }

    /**
     * 游戏暂停
     */
    private _onGamePause () {
        GameManager.isGamePause = true;
    }

    /**
     * 获取距离最近的小怪、boss节点
     * @returns 
     */
    public static getNearestMonster () {
        if (GameManager.arrMonster.length) {
            let arr = GameManager.arrMonster.sort((a: any, b: any) => {
                let distanceA = Util.getTwoNodeXZLength(GameManager.ndPlayer, a);
                let distanceB = Util.getTwoNodeXZLength(GameManager.ndPlayer, b);
                return distanceA - distanceB;
            })

            arr = arr.filter((item: Node) => {
                let scriptMonster = item.getComponent("Monster") as any;
                return item.parent !== null && !scriptMonster.isDie;
            })

            return arr[0];
        } else {
            return null;
        }
    }

    /**
     * 获取除了怪物本身自己外一定范围内的怪物
     *
     * @static
     * @param {Node} ndMonster 被击中的敌人
     * @param {boolean} [isAll=false] 是否返回全部敌人,否则只随机返回一个
     * @param {number} [range=5] 范围
     * @return {*} 
     * @memberof GameManager
     */
    public static getNearbyMonster (ndMonster: Node, isAll: boolean = false, range: number = 7) {
        //范围
        let arrMonster: any[] = [];

        if (GameManager.arrMonster.length) {
            arrMonster = GameManager.arrMonster.concat();
        }

        arrMonster = arrMonster.filter((item: Node) => {
            let scriptMonster = item.getComponent("Monster") as any;
            let length = Util.getTwoNodeXZLength(GameManager.ndPlayer, item);
            return item.parent !== null && !scriptMonster.isDie && length <= range && ndMonster.worldPosition !== item.worldPosition;
        })

        if (arrMonster.length) {
            if (!isAll) {
                let index = Math.floor(Math.random() * arrMonster.length);
                return arrMonster = arrMonster.filter((ndChild: Node, idx: number) => {
                    return idx === index;
                })
            } else {
                return arrMonster;
            }
        } else {
            return arrMonster;
        }
    }

    /**
     * 刷新节点下的动画、粒子播放速度
     * @param targetNode 
     * @param value 
     * @returns 
     */
    public static refreshEffectSpeed (targetNode: Node, value: number) {
        if (!targetNode) {
            return;
        }
        let arrAni = targetNode.getComponentsInChildren(AnimationComponent);
        arrAni.forEach((item: AnimationComponent) => {
            item.clips.forEach((clip: any) => {
                let aniName = clip?.name as string
                let aniState = item.getState(aniName);
                aniState.speed = value;
            })
        })

        let arrSkeletalAni = targetNode.getComponentsInChildren(SkeletalAnimationComponent);
        arrSkeletalAni.forEach((item: SkeletalAnimationComponent) => {
            item.clips.forEach((clip: any) => {
                let aniName = clip?.name as string
                let aniState = item.getState(aniName);
                aniState.speed = value;
            })
        })

        let arrParticle = targetNode.getComponentsInChildren(ParticleSystemComponent);
        arrParticle.forEach((item: ParticleSystemComponent) => {
            item.simulationSpeed = value;
        })
    }

    /**
     * 添加金币
     *
     * @static
     * @param {number} [value=1]
     * @memberof GameManager
     */
    public static addGold (value: number = 1) {
        PlayerData.instance.updatePlayerInfo('gold', Math.ceil(value));
        ClientEvent.dispatchEvent(Constant.EVENT_TYPE.REFRESH_GOLD);
    }

    /**
     * 每层进入前预加载该层所需的敌人技能
     *
     * @private
     * @memberof GameManager
     */
    public preloadMonsterSkill (mapName: string) {
        return new Promise((resolve, reject) => {
            let arrLoadSkill: string[] = [];//等待预加载的技能
            let arrInfo = LocalConfig.instance.getTableArr(mapName);
            //获取所有敌人信息
            arrInfo = arrInfo.filter((item: any) => {
                return item.ID.startsWith("2");
            })

            //获得敌人技能列表
            if (arrInfo.length) {
                let arrSkill: any = [];
                arrInfo.forEach((element: any) => {
                    arrSkill = arrSkill.concat(element.skill === "" ? [] : element.skill.split("#"));
                });

                arrSkill.length && arrSkill.forEach((id: string) => {
                    if (!this._dictMonsterSkill[id]) {
                        arrLoadSkill.push(id);
                        this._dictMonsterSkill[id] = { "num": 1 };
                    } else {
                        let arr = arrSkill.filter((itemId: any) => {
                            return itemId === id;
                        })

                        if (arr.length > this._dictMonsterSkill[id].num) {
                            arrLoadSkill.push(id);
                            this._dictMonsterSkill[id].num += 1;
                        }
                    }
                });

                let arrPromise = [];

                // console.log("需要预加载的技能数组", arrLoadSkill, "已经预加载的敌人技能", this._dictMonsterSkill);

                if (arrLoadSkill.length) {
                    for (let i = 0; i < arrLoadSkill.length; i++) {
                        const element = arrLoadSkill[i];
                        //预加载敌人技能
                        let skillInfo = LocalConfig.instance.queryByID("monsterSkill", element);
                        let p = ResourceUtil.loadEffectRes(`${skillInfo.resName}/${skillInfo.resName}`).then((prefab: any) => {
                            let ndSkillCollider = PoolManager.instance.getNode(prefab, GameManager.ndGameManager as Node) as Node;
                            ndSkillCollider.setWorldPosition(this.node.worldPosition.x, 30, this.node.worldPosition.z);
                        })
                        arrPromise.push(p);
                    }

                    Promise.all(arrPromise).then(() => {
                        resolve(null);
                    }).catch((e: any) => {
                        console.error("预加载敌人技能报错", e);
                    })
                } else {
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        })
    }

    /**
     * 判断本层的爱心、npc是否都已经触发
     *
     * @static
     * @memberof GameManager
     */
    public static checkTriggerAll () {
        GameManager.existentNum -= 1;

        if (GameManager.existentNum <= 0) {
            ClientEvent.dispatchEvent(Constant.EVENT_TYPE.SHOW_WARP_GATE);
        }
    }

    /**
     * 预加载弓箭特效
     * 
     * @static
     * @param {number} num
     * @returns
     * @memberof GameManager
     */
    public static preloadArrowEffects (num: number) {
        return new Promise((resolve, reject) => {
            ResourceUtil.loadDirRes("prefab/effect/arrow", Prefab, (err: any, pfs: any) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    pfs.forEach((pf: Prefab) => {
                        PoolManager.instance.preloadPool(pf, num);
                    });

                    resolve(null);
                }
            });
        })
    }

    /**
     * 预加载箭
     *
     * @static
     * @param {string} arrowName
     * @param {number} num
     * @memberof GameManager
     */
    public static preloadArrow (arrowName: string, num: number) {
        ResourceUtil.loadModelRes(`weapon/arrow/${arrowName}`).then((prefab: any) => {
            PoolManager.instance.preloadPool(prefab, num);
        })
    }

    /**
     * 展示奖励(金币、爱心)弹跳
     *
     * @param {Node} ndMonster
     * @param {string} modelPath
     * @param {number} [rewardNum=1]
     * @param {Function} [callback=()=>{}]
     * @memberof EffectManager
     */
    public static showRewardBounce (ndMonster: Node, modelPath: string, rewardNum: number = 1, callback: Function = () => { }) {
        let time = rewardNum <= 10 ? 0.15 : 0.07;
        ResourceUtil.loadModelRes(modelPath).then((pf: any) => {
            for (let i = 0; i < rewardNum; i++) {
                let ndReward = PoolManager.instance.getNode(pf, GameManager.ndEffectManager) as Node;
                ndReward.setWorldPosition(ndMonster.worldPosition.x, 1.65, ndMonster.worldPosition.z);
                ndReward.active = false;
                let scriptReward = ndReward.getComponent("Reward") as any;
                scriptReward.init((i + 1) * time, GameManager.ndEffectManager);
            }

            callback && callback();
        });
    }

    update (deltaTime: number) {
        //光源跟随玩家人物移动
        if (GameManager.scriptPlayer && GameManager.scriptPlayer.node && !GameManager.isGameOver) {
            Vec3.subtract(this._offsetWorPosMainLight, GameManager.ndPlayer.worldPosition, this._oriMainLightWorPos);
            this._offsetWorPosMainLight.set(this._offsetWorPosMainLight.x, 0, this._offsetWorPosMainLight.z);
            this.ndLight.setWorldPosition(this._offsetWorPosMainLight.add(this._oriMainLightWorPos));
        }
    }
}
