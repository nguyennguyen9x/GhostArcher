import { _decorator, Prefab, Node, SpriteComponent, SpriteFrame, ImageAsset, resources, error, Texture2D, instantiate, isValid, find, TextAsset, JsonAsset } from "cc";
import { Constant } from "./constant";
const { ccclass } = _decorator;

@ccclass("ResourceUtil")
export class ResourceUtil {
    /**
    * 加载资源
    * @param url   资源路径
    * @param type  资源类型
    * @method loadRes
    */
    public static loadRes (url: string, type: any) {
        return new Promise((resolve, reject) => {
            resources.load(url, type, (err: any, res: any) => {
                if (err) {
                    error(err.message || err);
                    reject && reject(err)
                    return;
                }

                resolve && resolve(res);
            })
        })
    }

    /**
     * 获取特效prefab
     * @param modulePath 路径
     * @returns 
     */
    public static async loadEffectRes (modulePath: string) {
        return this.loadRes(`${Constant.RESOURCES_FILE_NAME.PREFAB}/${Constant.PREFAB_FILE_NAME.EFFECT}/${modulePath}`, Prefab);
    }

    /**
     * 获取模型prefab
     * @param modulePath 模型路径
     * @returns 
     */
    public static async loadModelRes (modulePath: string) {
        return this.loadRes(`${Constant.RESOURCES_FILE_NAME.PREFAB}/${Constant.PREFAB_FILE_NAME.MODEL}/${modulePath}`, Prefab)
    }

    /**
     * 获取多模型数据
     * @param path 资源路径
     * @param arrName 资源名称
     * @param progressCb 过程回调函数
     * @param completeCb 完成回调函数
     */
    public static loadModelResArr (path: string, arrName: Array<string>, progressCb: any, completeCb: any) {
        let arrUrls = arrName.map((item) => {
            return `${path}/${item}`;
        })

        resources.load(arrUrls, Prefab, progressCb, completeCb);
    }

    /**
     * 获取贴图资源
     * @param path 贴图路径
     * @returns 
     */
    public static async loadSpriteFrameRes (path: string) {
        const img = await this.loadRes(path, SpriteFrame);
        let texture: any = new Texture2D();
        texture.image = img;

        let sf = new SpriteFrame();
        sf.texture = texture;
        return sf;
    }

    /**
     * 获取关卡数据
     * @param level 关卡
     */
    public static async getMap (level: number) {
        let levelStr: string = 'map';
        //前面补0
        if (level >= 100) {
            levelStr += level;
        } else if (level >= 10) {
            levelStr += '0' + level;
        } else {
            levelStr += '00' + level;
        }

        let txtAsset: any = await this.loadRes(`map/config/${levelStr}`, null);
        let content: string = '';
        if (txtAsset._file) {
            //@ts-ignore
            if (window['LZString']) {
                //@ts-ignore
                content = window['LZString'].decompressFromEncodedURIComponent(txtAsset._file);
            }
            let objJson = JSON.parse(content);
            return objJson;
        } else if (txtAsset.text) {
            //@ts-ignore
            if (window['LZString']) {
                //@ts-ignore
                content = window['LZString'].decompressFromEncodedURIComponent(txtAsset.text);
            }
            let objJson = JSON.parse(content);
            return objJson;
        } else if (txtAsset.json) {
            return txtAsset.json;
        } else {
            return 'failed';
        }
    }

    /**
     * 获取关卡数据
     * @param type 关卡类型
     * @param arrName 资源名称
     * @param progressCb 过程回调函数
     * @param completeCb 完成回调函数
     */
    public static getMapObj (type: string, arrName: Array<string>, progressCb?: any, completeCb?: any) {
        let arrUrls: string[] = [];
        for (let idx = 0; idx < arrName.length; idx++) {
            arrUrls.push(`map/${type}/${arrName[idx]}`)
        }

        resources.load(arrUrls, Prefab, progressCb, completeCb);
    }

    /**
     * 获取UI prefab
     * @param prefabPath prefab路径 
     */
    public static async getUIPrefabRes (prefabPath: string) {
        return this.loadRes(`${Constant.RESOURCES_FILE_NAME.PREFAB}/${Constant.PREFAB_FILE_NAME.UI}/${prefabPath}`, Prefab);
    }

    /**
     * 创建ui界面
     * @param path ui路径
     * @param cb 回调函数
     * @param parent 父节点
     */
    public static async createUI (path: string, parent?: Node) {
        let pf = await this.getUIPrefabRes(path) as Prefab;
        let node: Node = instantiate(pf);
        node.setPosition(0, 0, 0);
        if (!parent) {
            parent = find("Canvas") as Node;
        }
        parent.addChild(node);
        return node;
    }

    /**
     * 获取json数据
     * @param fileName 文件名
     * @param cb 回调函数 
     */
    public static async getJsonData (fileName: string) {
        let content = await this.loadRes(`${Constant.RESOURCES_FILE_NAME.DATA}/` + fileName, null) as JsonAsset;

        if (content.json) {
            return content.json;
        } else {
            return 'failed!!!';
        }
    }

    /**
     * 获取文本数据
     * @param fileName 文件名
     */
    public static async getTextData (fileName: string) {
        let content = await this.loadRes(`${Constant.RESOURCES_FILE_NAME.DATA}/` + fileName, null) as TextAsset;
        let text: string = content.text;
        return text;
    }

    /**
     * 批量加载路径下的资源
     */
    public static loadDirRes (path: string, type: any, callback: Function) {
        resources.loadDir(path, type, (err: any, assets: any) => {
            if (err) {
                console.error(err);
            } else {
                callback(null, assets);
            }
        });
    }

    /**
     * 设置精灵贴图
     * @param path 资源路径
     * @param sprite 精灵
     */
    public static async setSpriteFrame (path: string, sprite: SpriteComponent) {
        let sf = await this.loadRes(path + '/spriteFrame', SpriteFrame) as SpriteFrame;
        if (sprite && isValid(sprite)) {
            sprite.spriteFrame = sf;
        }
    }
}
