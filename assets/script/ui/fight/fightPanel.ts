import { UIManager } from './../../framework/uiManager';
import { BossBloodBar } from './bossBloodBar';
import { GameManager } from './../../fight/gameManager';
import { Util } from './../../framework/util';
import { PlayerData } from './../../framework/playerData';
import { Constant } from './../../framework/constant';
import { ClientEvent } from './../../framework/clientEvent';
import { _decorator, Component, Node, LabelComponent } from 'cc';
import { LocalConfig } from '../../framework/localConfig';
const { ccclass, property } = _decorator;
//战斗界面脚本
@ccclass('FightPanel')
export class FightPanel extends Component {
    @property(Node)
    public ndJoystick: Node = null!;//手柄节点

    @property(LabelComponent)
    public lbGold: LabelComponent = null!;//金币数量

    @property(LabelComponent)
    public lbLevel: LabelComponent = null!;//等级

    @property(Node)
    public ndBossBloodBar: Node = null!;//boss血量进度条节点

    private _debugClickTimes: number = 0;//调试点击次数

    onEnable () {
        ClientEvent.on(Constant.EVENT_TYPE.REFRESH_GOLD, this._refreshGold, this);
        ClientEvent.on(Constant.EVENT_TYPE.REFRESH_LEVEL, this._refreshLevel, this);
    }

    onDisable () {
        ClientEvent.off(Constant.EVENT_TYPE.REFRESH_GOLD, this._refreshGold, this);
        ClientEvent.off(Constant.EVENT_TYPE.REFRESH_LEVEL, this._refreshLevel, this);
    }

    public show () {
        this.ndBossBloodBar.active = false;

        this._refreshGold();
        this._refreshLevel();

        if (GameManager.ndBoss) {
            let bossInfo = LocalConfig.instance.queryByID("base", Constant.BASE.BOSS_01);
            let scriptBossBloodBar = this.ndBossBloodBar.getComponent(BossBloodBar) as BossBloodBar;
            scriptBossBloodBar.show(GameManager.scriptBoss, bossInfo.hp);
        }

        this._debugClickTimes = 0;
    }

    private _refreshGold () {
        this.lbGold.string = Util.formatMoney(PlayerData.instance.playerInfo.gold);
    }

    private _refreshLevel () {
        this.lbLevel.string = `第${PlayerData.instance.playerInfo.level}层`;
    }

    public onBtnPauseClick () {
        UIManager.instance.showDialog("pause/pausePanel", [], () => { }, Constant.PRIORITY.DIALOG);
        GameManager.isGamePause = true;
    }

    public onBtnDebugClick () {
        this._debugClickTimes += 1;

        if (this._debugClickTimes >= 1) {
            this._debugClickTimes = 0;
            UIManager.instance.showDialog("debug/debugPanel", [], () => { }, Constant.PRIORITY.DIALOG);
        }
    }
}
