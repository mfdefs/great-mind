import { SVG, Svg, Path } from '@svgdotjs/svg.js'
import '@svgdotjs/svg.draggable.js'
import Mousetrap from 'mousetrap'
import _ from 'lodash';

console.log('Hello world!111');

function createCPath(x1: number, y1: number, x2: number, y2: number) {
    var pathArray = []
    pathArray.push("M" + x1)
    pathArray.push(y1)

    var cx1 = (x1 + x2) / 2;
    var cy1 = y1;
    var cx2 = (x1 + x2) / 2;
    var cy2 = y2;

    pathArray.push("C" + cx1)
    pathArray.push(cy1)
    pathArray.push(cx2)
    pathArray.push(cy2)
    pathArray.push(x2)
    pathArray.push(y2)
    //console.log(path);
    return pathArray;
}


interface IData {
    node: IUiNode
    edges: IUiEdge[]
}
interface IUiNode {
    id: number
    label: string
    x: number
    y: number
    level?: number
    children?: IUiNode[]
    parent?: IUiNode
}

interface IUiEdge {
    id: number
    from: number,
    to: number
}

interface IMindCanvas {
    uiData: IData,
    draw: Svg,
    drawNode(uiData: IUiNode): void;
    setup(): void;
}

class MindCanvas implements IMindCanvas {
    uiData: IData;
    config: any;
    status: any;
    draw: Svg;
    uiDateIdMap: Map<number, IUiNode>;
    uiEdgeMap: Map<number, Path>;
    edgeIdMap: Map<number, IUiEdge>;
    edgeFromMap: Map<number, number[]>;
    edgeToMap: Map<number, number[]>;
    constructor(uiData: IData) {
        this.uiData = uiData
        this.config = {
            node: {
                width: 200,
                height: 100,
                margin: {
                    height: 200,
                    width: 300,
                }
            }
        }
        this.uiDateIdMap = new Map()
        this.edgeFromMap = new Map()
        this.edgeToMap = new Map()
        this.uiEdgeMap = new Map()
        this.edgeIdMap = new Map()
        this.status = {}
    }
    setup() {
        console.log("setup")
        let status = this.status
        let uiDateIdMap = this.uiDateIdMap
        let drawNode = this.drawNode.bind(this)
        let drawEdges = this.drawEdges.bind(this)

        this.status['currentId'] = 0
        let x = window.innerWidth
        let y = window.innerHeight
        this.draw = SVG().addTo('body').size(x, y)

        this.drawNode(this.uiData.node)
        this.drawEdges(this.uiData.edges)

        Mousetrap.bind('4', function () { console.log('4'); });
        Mousetrap.bind('enter', function () {
            console.log(JSON.stringify(uiData))
            console.log('enter');
        });

        Mousetrap.bind('del', function (e: any) {
            console.log(e);
        });

        Mousetrap.bind('tab', function (e: any) {
            console.log('tab', e);
            e.preventDefault()
            console.log(status)
            let id: number = status['currentId']
            let currentNode: IUiNode = uiDateIdMap.get(Number(id))

            let newNode: IUiNode = {
                id: new Date().getTime(),
                label: "新节点",
                // x: window.innerWidth / 2,
                x: currentNode.x + 300,
                y: currentNode.y,
                children: []
            }
            currentNode.children.push(newNode)
            drawNode(newNode)

            let newEdge = {
                id: new Date().getTime(),
                from: currentNode.id,
                to: newNode.id
            }
            console.log(newEdge)
            uiData.edges.push(newEdge)
            drawEdges([newEdge])
        });
    }
    drawEdges(edges: IUiEdge[]): void {
        edges.map((edge) => {
            let fromIds: number[] = this.edgeFromMap.get(edge.from)
            if (fromIds === undefined) {
                fromIds = []
                this.edgeFromMap.set(edge.from, fromIds)
            }
            fromIds.push(edge.id)

            let toIds: number[] = this.edgeToMap.get(edge.to)
            if (toIds === undefined) {
                toIds = []
                this.edgeToMap.set(edge.to, toIds)
            }
            toIds.push(edge.id)

            let from = this.uiDateIdMap.get(edge.from)
            let to = this.uiDateIdMap.get(edge.to)
            var pathArray = createCPath(from.x + 100, from.y, to.x - 100, to.y)
            var path = this.draw.path(pathArray).attr({ strokeWidth: 2, stroke: 'rgb(99,99,99)', fill: 'transparent' })

            this.uiEdgeMap.set(edge.id, path)
            this.edgeIdMap.set(edge.id, edge)
            // path.plot(pathArray)
        })
    }
    drawNode(uiNode: IUiNode): void {
        this.uiDateIdMap.set(uiNode.id, uiNode)
        this.drawNodeUi(uiNode)
        if (uiNode.children !== undefined && uiNode.children.length > 0) {
            uiNode.children.map((item) => {
                this.drawNode(item)
            })
        }
    }
    drawNodeUi(uiNode: IUiNode): void {

        var g = this.draw.group().draggable()
        let draw = this.draw;
        // let uiDateIdMap = this.uiDateIdMap
        // let uiDateIdMap = this.map

        let status = this.status

        g.rect(200, 100).attr({ fill: '#f06' }).center(uiNode.x, uiNode.y)

        var text = 'grouped draggable'
        var planin = g.plain(text).center(uiNode.x, uiNode.y)

        g.attr('uiNodeId', uiNode.id),

            g.dblclick(function (e: any) {
                console.log(e)
                console.log(uiNode)
                planin.remove()
                var foreignObject = g.foreignObject(200, 100).center(uiNode.x, uiNode.y)
                var input = SVG('<input id="n' + uiNode.id + '" type="text" value="' + text + '">')
                foreignObject.add(input)

                var inputDom = <HTMLInputElement> document.getElementById("n" + uiNode.id)
                inputDom.focus()
                inputDom.setSelectionRange(inputDom.value.length, inputDom.value.length);

                foreignObject.on('keydown', function (e: any) {
                    if (e.key === "Enter") {
                        text = e.target.value
                        planin = g.plain(e.target.value).center(uiNode.x, uiNode.y)
                        foreignObject.remove()
                    }
                })

                foreignObject.on('focusout', function (e: any) {
                    console.log(e)
                    text = e.target.value
                    planin = g.plain(e.target.value).center(uiNode.x, uiNode.y)
                    foreignObject.remove()
                })
            })

        g.click(function (e: any) {
            console.log(e)
            status['currentId'] = e.currentTarget.attributes.getNamedItem('uiNodeId').value
            console.log(status)
        })

        g.on('dragmove', (e: any) => {
            // e.preventDefault()
            var debounce_fun = _.debounce(() => {
                console.log(e)
                // debugger
                console.log(e.target.attributes.getNamedItem("uiNodeId").value)
                console.log(this.uiEdgeMap)
            }, 250)
            debounce_fun()
            uiNode.x = e.detail.box.cx
            uiNode.y = e.detail.box.cy

            let toIds = this.edgeToMap.get(Number(e.target.attributes.getNamedItem("uiNodeId").value))
            if (toIds !== undefined) {
                toIds.map((id) => {
                    let uiEdge = this.uiEdgeMap.get(id)
                    let edge = this.edgeIdMap.get(id)
                    let fromNode = this.uiDateIdMap.get(edge.from)
                    // console.log(uiEdge)
                    var pathArray = createCPath(fromNode.x + 100, fromNode.y, uiNode.x - 100, uiNode.y)
                    uiEdge.plot(pathArray)
                })
            }

            let fromIds = this.edgeFromMap.get(Number(e.target.attributes.getNamedItem("uiNodeId").value))
            if (fromIds !== undefined) {
                fromIds.map((id) => {
                    let uiEdge = this.uiEdgeMap.get(id)
                    let edge = this.edgeIdMap.get(id)
                    let toNode = this.uiDateIdMap.get(edge.to)
                    // console.log(uiEdge)
                    var pathArray = createCPath(toNode.x - 100, toNode.y, uiNode.x + 100, uiNode.y)
                    uiEdge.plot(pathArray)
                })
            }


            // e.detail.handler.move(100, 200)
            // console.log(e)
            // events are still bound e.g. dragend will fire anyway
            // line.plot(0, 0, e.target.x.baseVal.value, e.target.y.baseVal.value)

            // var pathArray = createCPath(50, 50,e.target.x.baseVal.value, e.target.y.baseVal.value)
            // path.plot(pathArray)
        })
    }

}

var uiNode: IUiNode = {
    id: 0,
    label: "中心节点",
    // x: window.innerWidth / 2,
    x: window.innerWidth * 1 / 3,
    y: window.innerHeight / 2,
    children: [{
        id: 1,
        label: "中心节点",
        // x: window.innerWidth / 2,
        x: window.innerWidth * 1 / 3 + 300,
        y: window.innerHeight / 2,
        children: []
    }]
}



var uiData: IData = {
    node: uiNode,
    edges: [{
        id: 2,
        from: 0,
        to: 1
    }]
}
// var uiData: IData = {"node":{"id":0,"label":"中心节点","x":640,"y":245.5,"children":[{"id":1,"label":"中心节点","x":940,"y":245.5,"children":[{"id":1647827739598,"label":"新节点","x":1241,"y":106.5,"children":[]},{"id":1647827742023,"label":"新节点","x":1238,"y":299.5,"children":[]}]}]},"edges":[{"id":2,"from":0,"to":1},{"id":1647827739599,"from":1,"to":1647827739598},{"id":1647827742023,"from":1,"to":1647827742023}]}

const mindCanvas = new MindCanvas(uiData);
mindCanvas.setup()
console.log(mindCanvas)