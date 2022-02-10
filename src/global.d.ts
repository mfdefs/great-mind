export interface IElectronAPI {
    test1: () => Promise<void>,
    test2: (data:String) => void,
    test3: () => Promise<string>,
}

declare global {
    interface Window {
        electronAPI: IElectronAPI
    }
}