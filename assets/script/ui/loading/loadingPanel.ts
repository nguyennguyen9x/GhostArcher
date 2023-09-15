import { _decorator, Component, AnimationComponent, Node } from 'cc';
import { Constant } from './../../framework/constant';
import { UIManager } from './../../framework/uiManager';
import { ClientEvent } from '../../framework/clientEvent';
import { GameManager } from '../../fight/gameManager';
const { ccclass, property } = _decorator;
//加载界面脚本
@ccclass('LoadingPanel')
export class LoadingPanel extends Component {
    @property(Node)
    blackNode: Node = null!;

    @property(AnimationComponent)
    public aniCloud: AnimationComponent = null!;

    private _isShowOver: boolean = false;
    private _isNeedHide: boolean = false;
    private _showCb: Function = null!;
    private _hideCb: Function = null!;

    onEnable () {
        ClientEvent.on(Constant.EVENT_TYPE.HIDE_LOADING_PANEL, this._hideLoadingPanel, this);
    }

    onDisable () {
        ClientEvent.off(Constant.EVENT_TYPE.HIDE_LOADING_PANEL, this._hideLoadingPanel, this);
    }

    public show (callback: Function) {
        this.blackNode.active = true;
        this._isShowOver = false;
        this._isNeedHide = false;
        this._hideCb = null!;
        this._showCb = callback;

        this._showLoadingPanel();
    }

    private _hideLoadingPanel (callback?: Function) {
        this._hideCb = callback!;
        this._isNeedHide = true;
        if (this._isShowOver) {
            GameManager.scriptGameCamera.resetCamera();
            this.blackNode.active = false;
            this._hideCb && this._hideCb();
            this.aniCloud.getState("cloudAnimationOut").time = 0;
            this.aniCloud.getState("cloudAnimationOut").sample();
            this.aniCloud.play("cloudAnimationOut");
            this.aniCloud.once(AnimationComponent.EventType.FINISHED, () => {
                UIManager.instance.hideDialog("loading/loadingPanel");
                UIManager.instance.showDialog("fight/fightPanel", [this]);
            });
        }
    }

    private _showLoadingPanel () {
        this.aniCloud.getState("cloudAnimationIn").time = 0;
        this.aniCloud.getState("cloudAnimationIn").sample();
        this.aniCloud.play("cloudAnimationIn");
        this.aniCloud.once(AnimationComponent.EventType.FINISHED, () => {
            this._showCb && this._showCb();

            this._isShowOver = true;
            if (this._isNeedHide) {
                this._hideLoadingPanel(this._hideCb);
            }
        });
    }
}