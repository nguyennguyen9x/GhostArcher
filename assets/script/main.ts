import { AudioManager } from './framework/audioManager';
import { GameManager } from './fight/gameManager';
import { Constant } from './framework/constant';
import { _decorator, Component, game, Game, PhysicsSystem, profiler, sys, find, instantiate, Node } from 'cc';
import { PlayerData } from './framework/playerData';
import { StorageManager } from './framework/storageManager';
import { LocalConfig } from './framework/localConfig';
import { Util } from './framework/util';
import { SdkUtil } from './framework/sdkUtil';
import { UIManager } from './framework/uiManager';
import { ResourceUtil } from './framework/resourceUtil';
//挂载到fight场景下的canvas节点
const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {
    private _minLoadDuration: number = 4;//加载开屏最小持续时间

    start () {
        let frameRate = StorageManager.instance.getGlobalData("frameRate");
        if (typeof frameRate !== "number") {
            frameRate = Constant.GAME_FRAME;
            //@ts-ignore
            if (window.wx && Util.checkIsLowPhone()) {
                frameRate = 30;
            }

            StorageManager.instance.setGlobalData("frameRate", frameRate);
        }

        console.log("###frameRate", frameRate);

        game.frameRate = frameRate;
        PhysicsSystem.instance.fixedTimeStep = 1 / frameRate;

        let isDebugOpen = StorageManager.instance.getGlobalData("debug") ?? false;
        isDebugOpen === true ? profiler.showStats() : profiler.hideStats();

        //@ts-ignore
        if (window.cocosAnalytics) {
            //@ts-ignore
            window.cocosAnalytics.init({
                appID: "605630324",              // 游戏ID
                version: '1.0.0',           // 游戏/应用版本号
                storeID: sys.platform.toString(),     // 分发渠道
                engine: "cocos",            // 游戏引擎
            });
        }

        PlayerData.instance.loadGlobalCache();
        if (!PlayerData.instance.userId) {
            PlayerData.instance.generateRandomAccount();
            console.log("###生成随机userId", PlayerData.instance.userId);
        }

        PlayerData.instance.loadFromCache();

        if (!PlayerData.instance.playerInfo || !PlayerData.instance.playerInfo.createDate) {
            PlayerData.instance.createPlayerInfo();
        }

        //加载CSV相关配置
        LocalConfig.instance.loadConfig(() => {
            SdkUtil.shareGame(Constant.GAME_NAME_CH, "");
            this._loadFinish();
        })

        AudioManager.instance.init();

        //引导
        //GuideManager.instance.start();

        //加载子包
        // SubPackageManager.instance.loadAllPackage();

        //记录离线时间
        game.on(Game.EVENT_HIDE, () => {
            if (!PlayerData.instance.settings) {
                PlayerData.instance.settings = {}
            }

            PlayerData.instance.settings.hideTime = Date.now();
            PlayerData.instance.saveAll();
            StorageManager.instance.save();
        })
    }

    private _loadFinish () {
        GameManager.isFirstLoad = true;

        this.scheduleOnce(() => {
            UIManager.instance.showDialog("home/homePanel", [], () => {
                // ResourceUtil.loadEffectRes("cloud/cloud").then((pf: any) => {
                // let ndCloud = instantiate(pf) as Node;
                // ndCloud.parent = this.node.parent;
                find("CanvasLogin")?.destroy();
                console.log("###开屏界面展示时长", Date.now() - Constant.LOGIN_TIME);
                // })
            });
        }, this._minLoadDuration)
    }
}
