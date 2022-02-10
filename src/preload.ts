import { contextBridge } from 'electron'
import { ipcRenderer } from 'electron'
import fs from 'fs'
import { IElectronAPI } from './global'

console.log("11111111111111111")
var electronAPI: IElectronAPI = {
    test1: () => ipcRenderer.sendSync('synchronous-message', 'ping'),
    test2: (data: string): void => {
        fs.writeFile('D:\\tmp\\1\\test.json', data, (err: any) => {
            if (err) {
                console.error(err)
                return
            }
            //文件写入成功。
        })
    },
    test3: (): Promise<string> => {
        console.log('test3')
        return new Promise((resolve, reject) => {
            fs.readFile('D:\\tmp\\1\\test.json', 'utf8', (err, data) => {
                if (err) {
                    console.error(err)
                    return
                }
                console.log(data)
                resolve(data);
            })
        });
    }
    // loadPreferences: () => ipcRenderer.invoke('load-prefs')
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)