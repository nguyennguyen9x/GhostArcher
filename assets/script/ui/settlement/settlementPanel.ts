import { Constant } from './../../framework/constant';
import { PlayerData } from './../../framework/playerData';
import { GameManager } from './../../fight/gameManager';
import { SpriteComponent } from 'cc';
import { UIManager } from './../../framework/uiManager';
import { _decorator, Component, Node, SpriteFrame, LabelComponent } from 'cc';
import { ClientEvent } from '../../framework/clientEvent';
import { SkillList } from '../pause/skillList';
const { ccclass, property } = _decorator;
//结算界面脚本
@ccclass('SettlementPanel')
export class SettlementPanel extends Component {
    @property(SpriteFrame)
    public sfTitleWin: SpriteFrame = null!;

    @property(SpriteFrame)
    public sfTitleFail: SpriteFrame = null!;

    @property(SpriteComponent)
    public spTitle: SpriteComponent = null!;

    @property(LabelComponent)
    public lbLevel: LabelComponent = null!;

    @property(Node)
    public ndSkillList: Node = null!;

    private _callback: Function = null!;

    public show (callback: Function) {
        this._callback = callback;

        this.lbLevel.string = PlayerData.instance.playerInfo.level;

        if (GameManager.isWin) {
            this.spTitle.spriteFrame = this.sfTitleWin;
        } else {
            this.spTitle.spriteFrame = this.sfTitleWin;
        }

        let scriptSkillList = this.ndSkillList.getComponent(SkillList) as SkillList;
        scriptSkillList.init();
    }

    public onBtnHomeClick () {
        this._callback && this._callback();

        if (!GameManager.isWin) {
            //失败的时候清空技能和层级
            PlayerData.instance.playerInfo.arrSkill = [];
            PlayerData.instance.playerInfo.level = 1;
            PlayerData.instance.savePlayerInfoToLocalCache();
        }

        UIManager.instance.hideDialog("settlement/settlementPanel");
        UIManager.instance.showDialog("home/homePanel");
    }

    public onBtnPlayAgainClick () {
        ClientEvent.dispatchEvent(Constant.EVENT_TYPE.ON_GAME_INIT, () => {
            UIManager.instance.hideDialog("settlement/settlementPanel");

            UIManager.instance.showDialog("fight/fightPanel");
        });
    }


    // update (deltaTime: number) {
    //     // [4]
    // }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.0/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.0/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.0/manual/en/scripting/life-cycle-callbacks.html
 */
