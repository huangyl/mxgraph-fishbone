window.onload = function () {
    createEditor();
}

mxGraph.prototype.dblClick = function (evt, cell) {
    return false;
};

function save(editor) {
    editor.graph.selectAll()
    var cells = editor.graph.getSelectionCells();
    editor.graph.selectionModel.clear();
    var geometrys = [];
    cells.forEach(function (item) {
        geometrys.push({
            x: item.geometry.x,
            y: item.geometry.y,
            width: item.geometry.width,
            height: item.geometry.width,
        })
    });
    console.log(geometrys);
}

function open(editor) {
    var parent = editor.graph.getDefaultParent();
    var model = editor.graph.getModel()
    model.beginUpdate();
    var myCell = editor.graph.insertVertex(parent, null, '', 100, 100, 72, 72);
    model.endUpdate();
    // editor.graph.selectCell(myCell)
}

function createEditor() {
    var node = mxUtils.load('./config/layouteditor.xml').getDocumentElement();
    var editor = new mxEditor(node);
    editor.graph.setPanning(false);
}