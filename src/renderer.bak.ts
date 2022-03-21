/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

 import './index.css';
 import { Graph } from '@antv/x6';
 const electronAPI = window.electronAPI
 
 console.log('👋111 This message is being logged by "renderer.js", included via webpack');
 
 console.log(electronAPI.test1());
 
 const graph = new Graph({
     container: document.getElementById('container'),
     width: 800,
     height: 600,
 });
 
 graph.on('node:click', ({ e, x, y, cell, view }) => {
     // console.log(window.myAPI1())
     console.log(graph.toJSON())
     // console.log(window.myAPI2(graph.toJSON()))
     electronAPI.test2(JSON.stringify(graph.toJSON()))
     console.log(111);
 })
 graph.on('node:contextmenu', ({ e, x, y, node, view }) => {
     console.log(2222);
     // window.electronAPI.test3().then(data1 => {
     //     graph.fromJSON(JSON.parse(data1));
     // })
 
     async function queryData() {
         var data = await electronAPI.test3()
         graph.fromJSON(JSON.parse(data));
     }
     queryData()
 })
 
 const data = {
     // 节点
     nodes: [
         {
             id: 'node1', // String，可选，节点的唯一标识
             x: 40,       // Number，必选，节点位置的 x 值
             y: 40,       // Number，必选，节点位置的 y 值
             width: 80,   // Number，可选，节点大小的 width 值
             height: 40,  // Number，可选，节点大小的 height 值
             label: 'hello33', // String，节点标签
         },
         {
             id: 'node2', // String，节点的唯一标识
             x: 160,      // Number，必选，节点位置的 x 值
             y: 180,      // Number，必选，节点位置的 y 值
             width: 80,   // Number，可选，节点大小的 width 值
             height: 40,  // Number，可选，节点大小的 height 值
             label: 'world44', // String，节点标签
         },
     ],
     // 边
     edges: [
         {
             source: 'node1', // String，必须，起始节点 id
             target: 'node2', // String，必须，目标节点 id
         },
     ],
 };
 graph.fromJSON(data)