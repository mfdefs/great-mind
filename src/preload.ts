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
                resolve(data)
            })
        })
    },
    // loadPreferences: () => ipcRenderer.invoke('load-prefs')
    save: (data: string): void => {
        ipcRenderer.send('asynchronous-save', data);
        // ipcRenderer.send('asynchronous-message', 'ping')
    },
    open: () => {
        let result = ipcRenderer.sendSync('asynchronous-open', 'ping')
        console.log(result)
        return new Promise((resolve, reject) => {
            fs.readFile(JSON.parse(result), 'utf8', (err, data) => {
                if (err) {
                    console.error(err)
                    return
                }
                console.log(data)
                resolve(data)
            })
        })
    },
}

ipcRenderer.on('asynchronous-reply', (event, arg) => {
    console.log(arg) // prints "pong"
})

ipcRenderer.on('asynchronous-save-reply', (event, arg) => {
    console.log('asynchronous-save-reply', arg) // prints "pong"
    fs.writeFile(arg.filePath, arg.data, (err: any) => {
        if (err) {
            console.error(err)
            return
        }
        //文件写入成功。
    })
})

// ipcRenderer.on('asynchronous-open-reply', (event, arg) => {
//     console.log('asynchronous-open-reply', arg) // prints "pong"
//     fs.readFile(arg, 'utf8', (err, data) => {
//         if (err) {
//             console.error(err)
//             return
//         }
//         console.log(data)
//     })
// })

contextBridge.exposeInMainWorld('electronAPI', electronAPI)