import { UIManager } from './../../framework/uiManager';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
//返回界面提示脚本
@ccclass('BackPanel')
export class BackPanel extends Component {
    private _callback: Function = null!;

    public show (callback: Function) {
        this._callback = callback;
    }

    public onBtnYesClick () {
        UIManager.instance.hideDialog("back/backPanel");
        this._callback && this._callback();
    }

    public onBtnNoClick () {
        UIManager.instance.hideDialog("back/backPanel");
    }
}
