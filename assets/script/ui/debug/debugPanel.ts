import { GameManager } from './../../fight/gameManager';
import { DebugSkillItem } from './debugSkillItem';
import { Constant } from './../../framework/constant';
import { DebugLevelItem } from './debugLevelItem';
import { PlayerData } from './../../framework/playerData';
import { UIManager } from './../../framework/uiManager';
import { LocalConfig } from './../../framework/localConfig';
import { _decorator, Component, Node, Prefab, game, PhysicsSystem, profiler } from 'cc';
import { StorageManager } from '../../framework/storageManager';
import { ClientEvent } from '../../framework/clientEvent';
import { EffectManager, loadAndPlayEffectOptions } from '../../framework/effectManager';
import { AudioManager } from '../../framework/audioManager';
import { PoolManager } from '../../framework/poolManager';
const { ccclass, property } = _decorator;
//调试界面脚本
@ccclass('DebugPanel')
export class DebugPanel extends Component {
    @property(Node)
    public ndContentLevel: Node = null!;//等级父节点

    @property(Node)
    public ndContentPlayerSkill: Node = null!;//技能父节点

    @property(Prefab)
    public pbLevelItem: Prefab = null!;//等级预制体

    @property(Prefab)
    public pbSkillItem: Prefab = null!;//技能预制体

    /**
     * 展示界面
     */
    public show () {
        GameManager.isGamePause = true;

        this._initLevelView();
        this._initSkillView();
    }

    /**
     * 初始化关卡列表
     *
     * @private
     * @memberof DebugPanel
     */
    private _initLevelView () {
        let mapInfo = LocalConfig.instance.getTableArr("checkpoint");

        this.ndContentLevel.children.forEach((item: Node) => {
            item.active = false;
        })

        mapInfo.forEach((itemInfo: any, idx: number, arr: any) => {
            let ndChild: Node = null!;

            if (idx < this.ndContentLevel.children.length) {
                ndChild = this.ndContentLevel.children[idx];
            } else {
                ndChild = PoolManager.instance.getNode(this.pbLevelItem, this.ndContentLevel);
            }

            ndChild.active = true;
            let scriptDebugLevelItem = ndChild.getComponent(DebugLevelItem) as DebugLevelItem;
            scriptDebugLevelItem.init(itemInfo);
        });
    }

    /**
     * 初始化玩家技能列表
     *
     * @private
     * @memberof DebugPanel
     */
    private _initSkillView () {
        let playerSkillInfo = LocalConfig.instance.getTableArr("playerSkill");
        //策划说回复生命的不出现在技能列表里面
        playerSkillInfo = playerSkillInfo.concat().filter((item: any) => {
            return item.ID !== Constant.PLAYER_SKILL.RECOVERY;
        })

        this.ndContentPlayerSkill.children.forEach((item: Node) => {
            item.active = false;
        })

        playerSkillInfo.forEach((itemInfo: any, idx: number, arr: any) => {
            let ndChild: Node = null!;

            if (idx < this.ndContentPlayerSkill.children.length) {
                ndChild = this.ndContentPlayerSkill.children[idx];
            } else {
                ndChild = PoolManager.instance.getNode(this.pbSkillItem, this.ndContentPlayerSkill);
            }

            ndChild.active = true;
            let scriptDebugLevelItem = ndChild.getComponent(DebugSkillItem) as DebugSkillItem;
            scriptDebugLevelItem.init(itemInfo);
        });
    }

    /**
     * 关闭按钮
     *
     * @memberof DebugPanel
     */
    public onBtnCloseClick () {
        UIManager.instance.hideDialog("debug/debugPanel");
        GameManager.isGamePause = false;
    }

    /**
     * 清除玩家缓存
     *
     * @memberof DebugPanel
     */
    public onBtnClearStorageClick () {
        PlayerData.instance.playerInfo = {};
        PlayerData.instance.history = {};
        PlayerData.instance.settings = {};
        PlayerData.instance.saveAll();

        StorageManager.instance.jsonData = {};
        StorageManager.instance.save();
        UIManager.instance.showTips("游戏缓存已清除，请完全关闭游戏并重新打开！");
    }

    /**
     * 切换30帧
     *
     * @memberof DebugPanel
     */
    public onToggleFrame30Click () {
        UIManager.instance.showTips("游戏已经切换为30帧");
        StorageManager.instance.setGlobalData("frameRate", 30);
        game.frameRate = 30;
        PhysicsSystem.instance.fixedTimeStep = 1 / 30;

        this._showState();
    }

    /**
     * 切换60帧
     *
     * @memberof DebugPanel
     */
    public onToggleFrame60Click () {
        UIManager.instance.showTips("游戏已经切换为60帧");
        StorageManager.instance.setGlobalData("frameRate", 60);
        game.frameRate = 60;
        PhysicsSystem.instance.fixedTimeStep = 1 / 60;

        this._showState();
    }

    /**
     * 清除玩家全部技能
     *
     * @memberof DebugPanel
     */
    public onBtnClearPlayerSkillClick () {
        PlayerData.instance.playerInfo.arrSkill = [];
        PlayerData.instance.savePlayerInfoToLocalCache();
        ClientEvent.dispatchEvent(Constant.EVENT_TYPE.PARSE_PLAYER_SKILL);
        this._initSkillView();
    }

    /**
     *  拥有玩家全部技能
     *
     * @memberof DebugPanel
     */
    public onBtnSelectAllPlayerSkillClick () {
        AudioManager.instance.playSound(Constant.SOUND.GET_SKILL);

        let arrSkill = LocalConfig.instance.getTableArr("playerSkill");
        let arr: any = [];
        arrSkill.forEach((item: any) => {
            //生命回复改成在游戏内获得，不通过技能列表获得
            if (item.ID !== Constant.PLAYER_SKILL.RECOVERY) {
                arr.push(item.ID);
            }
        });

        PlayerData.instance.playerInfo.arrSkill = arr;
        PlayerData.instance.savePlayerInfoToLocalCache();
        ClientEvent.dispatchEvent(Constant.EVENT_TYPE.PARSE_PLAYER_SKILL);
        this._initSkillView();

        let options: loadAndPlayEffectOptions = { effectPath: "levelUp/levelUp", ndTarget: GameManager.ndPlayer, isPlayAnimation: false, speed: GameManager.gameSpeed, isRecycle: true };
        EffectManager.instance.loadAndPlayEffect(options);
    }

    /**
     * 切换调试状态
     *
     * @private
     * @memberof DebugPanel
     */
    private _showState () {
        let isDebugOpen = StorageManager.instance.getGlobalData("debug") ?? false;
        isDebugOpen ? profiler.showStats() : profiler.hideStats();
    }
}