import { Constant } from './../../framework/constant';
import { LocalConfig } from './../../framework/localConfig';
import { SkillIcon } from './skillIcon';
import { PoolManager } from './../../framework/poolManager';
import { _decorator, Component, Node, Prefab } from 'cc';
import { PlayerData } from '../../framework/playerData';
const { ccclass, property } = _decorator;
//技能列表脚本
@ccclass('SkillList')
export class SkillList extends Component {
    @property(Prefab)
    public pbSkillIcon: Prefab = null!;

    public init (callback?: Function) {
        let arrUnLockSkill = PlayerData.instance.playerInfo.arrSkill.concat();

        this.node.children.forEach((ndChild: Node) => {
            ndChild.active = false;
        })

        if (arrUnLockSkill.length > Constant.MAX_SKILL_ICON_NUM) {
            arrUnLockSkill.length = Constant.MAX_SKILL_ICON_NUM;
        }

        arrUnLockSkill.forEach((skillInfo: any, idx: number) => {
            let ndChild: Node;
            if (idx >= this.node.children.length) {
                ndChild = PoolManager.instance.getNode(this.pbSkillIcon, this.node) as Node;
            } else {
                ndChild = this.node.children[idx];
            }

            ndChild.active = true;
            let itemInfo = LocalConfig.instance.queryByID("playerSkill", arrUnLockSkill[idx]);
            let scriptSkillIcon = ndChild.getComponent(SkillIcon) as SkillIcon;
            scriptSkillIcon.init(idx, itemInfo, callback);
        })
    }
}
