/**
 * Created by numen_huang on 2014/8/6.
 */

var fishBone = function () {};

fishBone.prototype.graph = null;

fishBone.prototype.init = function () {
    this.resetSourceCode();
    this.buildCanvas();
    this.setCanvasStyle();
    this.buildContextMenu();
    this.createFishBone();
};

fishBone.prototype.resetSourceCode = function () {
    var _this = this;
    mxCellRenderer.prototype.createLabel = function (state, value) {
        var graph = state.view.graph;
        var isEdge = graph.getModel().isEdge(state.cell);
        if (state.style[mxConstants.STYLE_FONTSIZE] > 0 || state.style[mxConstants.STYLE_FONTSIZE] == null) {
            var isForceHtml = (graph.isHtmlLabel(state.cell) || (value != null && mxUtils.isNode(value))) && graph.dialect == mxConstants.DIALECT_SVG;
            var h = '';
            var spacingRight = -30;
            var spacingLeft = 1;
            if (state.cell.id == 'fishboneHead') {
                h = 'horizontal';
                spacingRight = spacingLeft = 0;
            }
            if (state.cell.level % 2 == 0 && state.cell.id != 'fishboneHead') {
                h = 'horizontal';
                if (_this.getSelfTopParent(state.cell).direction == 'bottom') {
                    spacingLeft = -25;
                } else {
                    spacingLeft = 0;
                }
            }
            var background = state.style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR];
            var borderColor = state.style[mxConstants.STYLE_LABEL_BORDERCOLOR];
            var color = state.style[mxConstants.STYLE_FONTCOLOR];
            if (state.cell.level == 1) {
                background = '#B3D9D9';
                borderColor = '#005757';
                color = '#336666';
            } else {
                background = '#F3F3F3';
                borderColor = '#005757';
                color = '#336666';
            }
            state.text = new mxText(
                value,
                null,
                (state.style[mxConstants.STYLE_ALIGN] || mxConstants.ALIGN_CENTER),
                graph.getVerticalAlign(state),
                color,
                state.style[mxConstants.STYLE_FONTFAMILY],
                state.style[mxConstants.STYLE_FONTSIZE],
                state.style[mxConstants.STYLE_FONTSTYLE],
                state.style[mxConstants.STYLE_SPACING],
                spacingLeft,
                2,
                spacingRight,
                2,
                h,
                background,
                borderColor,
                graph.isWrapping(state.cell),
                graph.isLabelClipped(state.cell),
                state.style[mxConstants.STYLE_OVERFLOW]
            );
            // state.text.opacity = state.style[mxConstants.STYLE_TEXT_OPACITY];
            state.text.dialect = (isForceHtml) ? mxConstants.DIALECT_STRICTHTML : state.view.graph.dialect;

            this.initializeLabel(state);
            var getState = function (evt) {
                var result = state;
                if (mxClient.IS_TOUCH) {
                    var x = mxEvent.getClientX(evt);
                    var y = mxEvent.getClientY(evt);
                    var pt = mxUtils.convertPoint(graph.container, x, y);
                    result = graph.view.getState(graph.getCellAt(pt.x, pt.y));
                }
                return result;
            };
            var md = (mxClient.IS_TOUCH) ? 'touchstart' : 'mousedown';
            var mm = (mxClient.IS_TOUCH) ? 'touchmove' : 'mousemove';
            var mu = (mxClient.IS_TOUCH) ? 'touchend' : 'mouseup';
            mxEvent.addListener(state.text.node, md, mxUtils.bind(this,
                function (evt) {
                    if (this.isLabelEvent(state, evt)) {
                        graph.fireMouseEvent(mxEvent.MOUSE_DOWN, new mxMouseEvent(evt, state));
                    }
                }));
            mxEvent.addListener(state.text.node, mm, mxUtils.bind(this,
                function (evt) {
                    if (this.isLabelEvent(state, evt)) {
                        graph.fireMouseEvent(mxEvent.MOUSE_MOVE, new mxMouseEvent(evt, getState(evt)));
                    }
                }));
            mxEvent.addListener(state.text.node, mu, mxUtils.bind(this,
                function (evt) {
                    if (this.isLabelEvent(state, evt)) {
                        graph.fireMouseEvent(mxEvent.MOUSE_UP, new mxMouseEvent(evt, getState(evt)));
                    }
                }));
            mxEvent.addListener(state.text.node, 'dblclick', mxUtils.bind(this,
                function (evt) {
                    if (this.isLabelEvent(state, evt)) {
                        graph.dblClick(evt, state.cell);
                        mxEvent.consume(evt);
                    }
                }));
        }
    };

    mxTriangle.prototype.redrawPath = function (path, x, y, w, h) {
        if (this.direction == mxConstants.DIRECTION_NORTH) {
            path.moveTo(0, h);
            path.lineTo(0.5 * w, 0);
            path.lineTo(w, h);
        } else if (this.direction == mxConstants.DIRECTION_SOUTH) {
            path.moveTo(0, 0);
            path.lineTo(0.5 * w, h);
            path.lineTo(w, 0);
        } else if (this.direction == mxConstants.DIRECTION_WEST) {
            path.moveTo(0, 0);
            path.lineTo(w, 0.5 * h);
            path.lineTo(0, h);
        } else if (this.direction == 'east') {
            path.moveTo(0, 0);
            path.quadTo(w, 0.25 * h, w + 1, 0.5 * h);
            path.quadTo(w + 1, 0.75 * h, 0, h);
        } else {
            path.moveTo(0, 0);
            path.lineTo(w, 0.5 * h);
            path.lineTo(0, h);
        }
        path.close();
    };
    mxGraphSelectionModel.prototype.singleSelection = true;
    mxGraph.prototype.foldingEnabled = false;
    mxGraph.prototype.selectCellForEvent = function (cell, evt) {
        if (cell.id != 'fishboneEnd' && cell.id != 'fishboneBody' && !cell.isEdge()) {
            var isSelected = this.isCellSelected(cell);
            if (this.isToggleEvent(evt)) {
                if (isSelected) {
                    this.removeSelectionCell(cell);
                } else {
                    this.addSelectionCell(cell);
                }
            } else if (!isSelected || this.getSelectionCount() != 1) {
                this.setSelectionCell(cell);
            }
        }
    };
    mxGraph.prototype.moveCells = function (cells, dx, dy, clone, target, evt) {
        if (cells == null || cells.length > 1) {
            return false;
        }
        var cell = cells[0];

        if (dx != 0 || dy != 0 || clone || target != null) {
            this.getModel().beginUpdate();
            try {
                if (clone) {
                    return false;
                }
                if (cell.level == 1) {
                    var fishHead = _this.getCellById('fishboneHead');
                    var fishBody = _this.getCellById('fishboneBody');
                    var fishEnd = _this.getCellById('fishboneEnd');
                    if (cell.geometry.x + dx > fishHead.geometry.x - 100) {
                        cell.geometry.x += dx;
                        var size = cell.geometry.x - fishHead.geometry.x;
                        fishHead.geometry.x += size + 100;
                        fishBody.geometry.width += size + 100;
                    } else if (cell.geometry.x + dx < fishEnd.geometry.x + fishEnd.geometry.width + 100) {
                        cell.geometry.x += dx;
                        var size = cell.geometry.x - (fishEnd.geometry.x + fishEnd.geometry.width);
                        fishBody.geometry.width += Math.abs(size - 100);
                        fishEnd.geometry.x += size - 100;
                        fishBody.geometry.x += size - 100;
                    } else {
                        cell.geometry.x += dx;
                    }
                } else if (cell.id == 'fishboneHead') {
                    var fishHead = _this.getCellById('fishboneHead');
                    var fishBody = _this.getCellById('fishboneBody');
                    var children = _this.getChildSubject(fishHead);

                    var maxX = children.length > 0 ? children[0].geometry.x : fishHead.geometry.x - 30;
                    for (var i = 0; i < children.length; i++) {
                        if (children[i].geometry.x > maxX) {
                            maxX = children[i].geometry.x;
                        }
                    }
                    var oldX = fishHead.geometry.x;
                    fishHead.geometry.x += dx;
                    var size = fishHead.geometry.x - oldX;
                    if (fishHead.geometry.x < maxX + 100) {
                        fishHead.geometry.x = maxX + 100;
                        size = fishHead.geometry.x - oldX;
                    }
                    fishBody.geometry.width += size;
                } else if (cell.id == 'fishboneEnd') {
                    var fishHead = _this.getCellById('fishboneHead');
                    var fishBody = _this.getCellById('fishboneBody');
                    var fishEnd = _this.getCellById('fishboneEnd');
                    var children = _this.getChildSubject(fishHead);
                    var minX = children.length > 0 ? children[0].geometry.x : fishEnd.geometry.x - 100;
                    for (var i = 0; i < children.length; i++) {
                        if (children[i].geometry.x < minX) {
                            minX = children[i].geometry.x;
                        }
                    }
                    var oldX = fishEnd.geometry.x;
                    fishEnd.geometry.x += dx;
                    var size = fishEnd.geometry.x - oldX;
                    if (fishEnd.geometry.x > minX - 100) {
                        fishEnd.geometry.x = minX - 100;
                        size = fishEnd.geometry.x - oldX;
                    }
                    fishBody.geometry.x = fishEnd.geometry.x + fishEnd.geometry.width;
                    fishBody.geometry.width -= size;
                } else if (cell.direction == 'top' || cell.direction == 'bottom') {
                    if (cell.parent.children.length == 1) {
                        cell.geometry.x = 0;
                        cell.parent.geometry.width -= dx;
                        cell.parent.geometry.x += dx;
                        if (cell.parent.geometry.width <= 70) {
                            cell.parent.geometry.width = 70;
                            cell.parent.geometry.x = -70;
                        }
                    } else {
                        if (cell.geometry.x == 0) {
                            if (dx < 0) {
                                for (var i = 0; i < cell.parent.children.length; i++) {
                                    if (cell.parent.children[i].id != cell.id) {
                                        cell.parent.children[i].geometry.x -= dx;
                                    }
                                }
                                cell.parent.geometry.width -= dx;
                                cell.parent.geometry.x += dx;
                                cell.geometry.x = 0;
                            } else {
                                if (cell.parent.children.length == 1) {
                                    if (cell.geometry.x + dx < cell.parent.geometry.width - 70) {
                                        cell.geometry.x += dx;
                                    } else {
                                        cell.geometry.x = cell.parent.geometry.width - 70;
                                    }
                                } else {
                                    var children = cell.parent.children;
                                    var temp1 = children[0]; //最小y坐标的cell
                                    var t = 0;
                                    for (var i = 0; i < children.length; i++) {
                                        if (children[i].geometry.x < temp1.geometry.x) {
                                            temp1 = children[i];
                                        }
                                        if (children[i].geometry.x == 0) {
                                            t++;
                                        }
                                    }
                                    var temp2 = null; //第二小x坐标的cell
                                    for (var i = 0; i < children.length; i++) {
                                        if (children[i].geometry.x > cell.geometry.x && !temp2) {
                                            temp2 = children[i];
                                            continue;
                                        } else if (temp2) {
                                            if (children[i].geometry.x < temp2.geometry.x && children[i].id != cell.id) {
                                                temp2 = children[i];
                                            }
                                        }
                                    }
                                    if (temp2 && t == 1) {
                                        //没有超过第二小x坐标
                                        if (temp2.geometry.x - dx > 0) {
                                            for (var k = 0; k < cell.parent.children.length; k++) {
                                                if (cell.parent.children[k].id != cell.id) {
                                                    cell.parent.children[k].geometry.x -= dx;
                                                }
                                            }
                                            cell.geometry.x += dx;
                                            cell.parent.geometry.width -= dx;
                                            cell.parent.geometry.x += dx;
                                            cell.geometry.x = 0;
                                        }
                                        //超过第二小x坐标
                                        else {
                                            if (cell.parent.geometry.width - temp2.geometry.x == 70) {
                                                for (var k = 0; k < cell.parent.children.length; k++) {
                                                    cell.parent.children[k].geometry.x = 0;
                                                }
                                                cell.parent.geometry.width = 70;
                                                cell.parent.geometry.x = -70;
                                            } else {
                                                var size = dx - temp2.geometry.x;
                                                var pSize = cell.parent.geometry.width - temp2.geometry.x;
                                                for (var k = 0; k < cell.parent.children.length; k++) {
                                                    if (cell.parent.children[k].id != temp2.id && cell.parent.children[k].id != cell.id) {
                                                        cell.parent.children[k].geometry.x -= temp2.geometry.x;
                                                    }
                                                }
                                                cell.parent.geometry.width -= temp2.geometry.x;
                                                cell.parent.geometry.x += temp2.geometry.x;
                                                temp2.geometry.x = 0;
                                                if (size - pSize > 0) {
                                                    cell.geometry.x = cell.parent.geometry.width - 70;
                                                } else {
                                                    cell.geometry.x = size;
                                                }
                                            }
                                        }
                                    } else if (t > 1) {
                                        if (cell.geometry.x + dx < cell.parent.geometry.width - 70) {
                                            cell.geometry.x += dx;
                                        } else {
                                            cell.geometry.x = cell.parent.geometry.width - 70;
                                        }
                                    }
                                }
                            }
                        } else {
                            if (cell.geometry.x + dx < 0) {
                                var size = 0 - (cell.geometry.x + dx);
                                for (var i = 0; i < cell.parent.children.length; i++) {
                                    if (cell.parent.children[i].id != cell.id) {
                                        cell.parent.children[i].geometry.x += size;
                                    }
                                }
                                cell.parent.geometry.x -= size;
                                cell.parent.geometry.width += size;
                                cell.geometry.x = 0;
                            } else if (cell.geometry.x + dx == 0) {
                                cell.geometry.x = 0;
                            } else if (cell.geometry.x + dx > 0 && cell.geometry.x + dx < cell.parent.geometry.width - 70) {
                                cell.geometry.x += dx;
                            } else {
                                cell.geometry.x = cell.parent.geometry.width - 70;
                            }
                        }
                    }
                } else if (cell.direction == 'left') {
                    var py = 0;
                    var myCell = cell;
                    if (cell.parent.direction == 'bottom') {
                        cell.geometry.y += dy;
                        for (var i = 0; i < cell.parent.children.length; i++) {
                            if (cell.parent.children[i].geometry.y > py)
                                py = cell.parent.children[i].geometry.y;
                        }
                        if (py > 70) {
                            cell.parent.geometry.height = py;
                        } else {
                            cell.parent.geometry.height = 70;
                        }
                        if (cell.geometry.y < 70) {
                            cell.geometry.y = 70;
                        }
                    } else {
                        if (cell.geometry.y == 0) {
                            if (dy < 0) {
                                for (var i = 0; i < cell.parent.children.length; i++) {
                                    if (cell.parent.children[i].id != cell.id) {
                                        cell.parent.children[i].geometry.y -= dy;
                                    }
                                }
                                cell.parent.geometry.y += dy;
                                cell.parent.geometry.height -= dy;
                            } else {
                                //只有一个子集的时候
                                if (cell.parent.children.length == 1) {
                                    var fishBody = _this.getCellById('fishboneBody');
                                    //拖动超过父级label的位置
                                    if (!(cell.geometry.y == 0 && cell.parent.geometry.height == 70)) {
                                        if (cell.parent.geometry.height - dy < 70) {
                                            if (cell.parent.parent.id == 1) {
                                                cell.parent.geometry.y = fishBody.geometry.y - 68;
                                            } else {
                                                cell.parent.geometry.y = cell.parent.parent.geometry.y - 70;
                                            }
                                            cell.parent.geometry.height = 70;
                                        } else {
                                            cell.parent.geometry.height -= dy;
                                            cell.parent.geometry.y += dy;
                                        }
                                        cell.geometry.y = 0;
                                    }
                                } else { //超过一个子集
                                    var children = cell.parent.children;
                                    var temp1 = children[0]; //最小y坐标的cell
                                    var t = 0;
                                    for (var i = 0; i < children.length; i++) {
                                        if (children[i].geometry.y < temp1.geometry.y) {
                                            temp1 = children[i];
                                        }
                                        if (children[i].geometry.y == 0) {
                                            t++;
                                        }
                                    }
                                    var temp2 = null; //第二小y坐标的cell
                                    for (var i = 0; i < children.length; i++) {
                                        if (children[i].geometry.y > temp1.geometry.y && !temp2) {
                                            temp2 = children[i];
                                            continue;
                                        } else if (temp2) {
                                            if (children[i].geometry.y < temp2.geometry.y && children[i].id != temp1.id) {
                                                temp2 = children[i];
                                            }
                                        }
                                    }
                                    //当没有超过第二小y坐标时。
                                    if (temp2 && t == 1) {
                                        if (cell.geometry.y + dy < temp2.geometry.y) {
                                            for (var k = 0; k < cell.parent.children.length; k++) {
                                                if (cell.parent.children[k].id != cell.id) {
                                                    cell.parent.children[k].geometry.y -= dy;
                                                }
                                            }
                                            cell.parent.geometry.height -= dy;
                                            cell.parent.geometry.y += dy;
                                            cell.geometry.y = 0;
                                        }
                                        //当超过第二小y坐标时候
                                        else {
                                            cell.geometry.y += dy;
                                            var py = cell.parent.geometry.height - (cell.parent.geometry.height - temp2.geometry.y);
                                            for (var k = 0; k < cell.parent.children.length; k++) {
                                                if (cell.parent.children[k].id != temp2.id) {
                                                    cell.parent.children[k].geometry.y -= py;
                                                }
                                            }
                                            cell.parent.geometry.height -= temp2.geometry.y;
                                            cell.parent.geometry.y += temp2.geometry.y;
                                            temp2.geometry.y = 0;

                                            for (var j = 0; j < cell.parent.children.length; j++) {
                                                if (cell.parent.geometry.height - cell.parent.children[j].geometry.y < 70) {
                                                    cell.parent.children[j].geometry.y = cell.parent.geometry.height - 70;
                                                }
                                            }
                                        }
                                    } else if (t > 1) {
                                        if (cell.parent.geometry.height > 70) {
                                            if (cell.parent.geometry.height - dy < 70) {
                                                cell.geometry.y = 70;
                                            } else {
                                                cell.geometry.y = dy;
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            if (cell.geometry.y + dy > 0) {
                                if (cell.parent.geometry.height - (cell.geometry.y + dy) <= 70) {
                                    cell.geometry.y = cell.parent.geometry.height - 70;
                                } else {
                                    cell.geometry.y += dy;
                                }
                            } else {
                                for (var i = 0; i < cell.parent.children.length; i++) {
                                    if (cell.parent.children[i].id != cell.id) {
                                        cell.parent.children[i].geometry.y -= (cell.geometry.y + dy);
                                    }
                                }
                                cell.parent.geometry.y += (cell.geometry.y + dy);
                                cell.parent.geometry.height -= cell.geometry.y + dy;
                                cell.geometry.y = 0;
                            }
                        }
                    }
                }
            } finally {
                this.getModel().endUpdate();
                this.refresh();
            }
        }
        return cells;
    };

    mxGraph.prototype.dblClick = function (evt, cell) {
        if (cell.id != 'fishboneEnd' && cell.id != 'fishboneBody' && !cell.isEdge()) {
            var mxe = new mxEventObject(mxEvent.DOUBLE_CLICK, 'event', evt, 'cell', cell);
            this.fireEvent(mxe);
            if (this.isEnabled() && !mxEvent.isConsumed(evt) && !mxe.isConsumed() && cell != null && this.isCellEditable(cell)) {
                this.startEditingAtCell(cell, evt);
            }
        }
    };
    //    mxGraph.prototype.labelChanged = function(cell, value, evt) {
    //        this.model.beginUpdate();
    //        var geo=cell.geometry;
    //        try {
    //            this.cellLabelChanged(cell, value, true);
    //            this.fireEvent(new mxEventObject(mxEvent.LABEL_CHANGED, 'cell', cell, 'value', value, 'event', evt));
    //            geo.height =geo.height+((value.length-5>0)? (value.length-5)*18:0);
    //            cell.geometry=geo;
    //            if(cell.level>1){
    //                var myEdge = cell.edges[0];
    //                var point = myEdge.geometry.points[0];
    //                point.x=0;
    //                myEdge.geometry.points=[point];
    //            }
    //        } finally {
    //            this.model.endUpdate();
    //        }
    //        return cell;
    //    };
    mxCellEditor.prototype.init = function () {
        this.textarea = document.createElement('input');
        this.textarea.className = 'mxCellEditor';
        this.textarea.style.position = 'absolute';
        this.textarea.style.overflow = 'visible';
        this.textarea.setAttribute('type', 'textbox');
        mxEvent.addListener(this.textarea, 'blur', mxUtils.bind(this,
            function (evt) {
                this.stopEditing(!this.graph.isInvokesStopCellEditing());
            }));
        mxEvent.addListener(this.textarea, 'keydown', mxUtils.bind(this,
            function (evt) {
                if (!mxEvent.isConsumed(evt)) {
                    if (evt.keyCode == 113 || (this.graph.isEnterStopsCellEditing() && evt.keyCode == 13 && !mxEvent.isControlDown(evt) && !mxEvent.isShiftDown(evt))) {
                        this.graph.stopEditing(false);
                        mxEvent.consume(evt);
                    } else if (evt.keyCode == 27) {
                        this.graph.stopEditing(true);
                        mxEvent.consume(evt);
                    } else {
                        if (this.clearOnChange) {
                            this.clearOnChange = false;
                            this.textarea.value = '';
                        }
                        this.setModified(true);
                    }
                }
            }));
    };
    mxGraphHandler.prototype.selectEnabled = false;
};

fishBone.prototype.buildCanvas = function () {
    var container = document.createElement('div');
    container.setAttribute('style', 'background: url(../images/grid.gif);position: absolute;overflow: hidden;left: 0px;top: 0px;right: 0px;bottom: 0px;');
    document.body.appendChild(container);
    var outline = document.createElement('div');
    outline.setAttribute('style', 'position: absolute;overflow: hidden;bottom: 0px;right: 0px;z-index:2;background:#FFF;width:200px;');
    document.body.appendChild(outline);

    var node = mxUtils.load('config/keyhandler-commons.xml').getDocumentElement();
    this.editor = new mxEditor(node);
    this.editor.graph = new mxGraph(container);
    this.graph = this.editor.graph;
    new mxOutline(this.graph, outline);
    // if (mxClient.IS_IE) {
    new mxDivResizer(container);
    new mxDivResizer(outline);
    // }
    this.graph.clearSelection();
    this.graph.setEnabled(true);
    this.graph.setTooltips(false);
    this.graph.setConnectable(false);
    this.graph.setPanning(true);
    this.graph.setCellsResizable(false);
    console.log(this.graph)
};

fishBone.prototype.setCanvasStyle = function () {
    var graph = this.graph;
    var style = graph.getStylesheet().getDefaultVertexStyle();
    style[mxConstants.STYLE_FONTCOLOR] = 'black';
    style[mxConstants.STYLE_STROKECOLOR] = '#8E8E8E';
    style[mxConstants.STYLE_FILLCOLOR] = 'white';
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_FONTSTYLE] = 1;
    style[mxConstants.STYLE_FONTFAMILY] = '微软雅黑';
    // Sets the default style for edges
    style = graph.getStylesheet().getDefaultEdgeStyle();
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_EDGE] = mxEdgeStyle.STRAIGHT;

    // Enables rubberband selection and key handling
    new mxRubberband(graph);
    new mxKeyHandler(graph);
};

fishBone.prototype.buildContextMenu = function () {
    var fish = this;
    mxPopupMenu.prototype.submenuImage = 'src/images/submenu.gif';
    this.graph.panningHandler.factoryMethod = function (menu, cell, evt) {
        if (cell != null && !cell.isEdge() && cell.id != 'fishboneEnd' && cell.id != 'fishboneBody') {
            menu.addItem('插入主题', '', function () {
                fish.createSubject(cell);
                fish.graph.clearSelection();
            });
            menu.addItem('插入子主题', '', function () {
                fish.createSubject(cell, true);
                fish.graph.clearSelection();
            });
            menu.addItem('删除', '', function () {
                fish.graph.removeCells([cell]);
            });
            menu.addItem('编辑', '', function () {
                fish.graph.startEditingAtCell(cell);
            });
        } else {
            this.graph.clearSelection();
        };
    };
};

fishBone.prototype.createFishBone = function () {
    var xml = '\
            <mxGraphModel>                                                                 \
              <root>                                                                       \
                <mxCell id="0"/>                                                           \
                <mxCell id="1" parent="0"/>                                                \
                <mxCell id="fishboneEnd" value="" parent="1" vertex="1" style="shape=triangle;direction=east1;fillColor=#CEFFCE;gradientColor=#93FF93;">      \
                  <mxGeometry x="210" y="240" width="40" height="110" as="geometry"/>      \
                </mxCell>                                                                  \
                <mxCell id="fishboneBody" value="" vertex="1" parent="1" style="shape=triangle;direction=west;fillColor=#4F4F4F;">        \
                  <mxGeometry x="250" y="290" width="800" height="10" as="geometry"/>      \
                </mxCell>                                                                  \
                <mxCell id="fishboneHead" level="0" value="需要解决的问题" vertex="1" parent="1" style="shape=triangle;direction=east;fillColor=#CEFFCE;gradientColor=#93FF93;fontSize=18;">           \
                  <mxGeometry x="1051" y="252" width="150" height="80" as="geometry"/>     \
                </mxCell>\
              </root>                                                                      \
            </mxGraphModel>                                                                \
        ';
    doc = mxUtils.parseXml(xml);
    var codec = new mxCodec(doc);
    //mxShape.prototype.direction = mxConstants.DIRECTION_NORTH;
    codec.decode(doc.documentElement, this.graph.getModel());
    var items = ['人员', '管理', '过程', '环境', '设备', '材料'];
    var cell = this.getCellById('fishboneHead');
    for (var i = 0; i < items.length; i++) {
        this.createSubject(cell, true, items[i]);
    };
};


fishBone.prototype.createSubject = function (cell, isSub, text) {
    var model = this.graph.getModel();
    var graph = this.graph;
    var fish = this;
    var x = 0,
        y = 0,
        py = 0,
        px = 0;
    var myChild = fish.getChildSubject(cell);
    if (!cell.children) cell.children = [];

    //子主题在下方，插入子主题方向错误
    //子主题在右侧，插入子主题方向错误
    /*水平方向子主题*/
    var insertHorizontalSubLevel = function () {
        var selfTopParent = fish.getSelfTopParent(cell);
        if (!text) text = '分支主题' + (cell.children.length + 1);
        x = -70;
        if (selfTopParent.direction == 'bottom') {
            if (cell.children.length == 0) {
                y = -70;
            } else {
                y += cell.geometry.height + 70;
            }
            var myCell = graph.insertVertex(cell, null, text, x, y, 70, 1, 'shape=line;verticalAlign=top;align=right;strokeWidth=1;strokeColor=#BB3D00;');
            myCell.level = cell.level + 1;
            myCell.direction = 'left';
            myCell.geometry.x -= 0;
            if (myCell.parent.parent.direction == 'left') {
                myCell.parent.parent.geometry.height = 1;
            }
            console.log(myCell)
            var resize = function (cell) {
                if (cell.parent.direction == 'bottom' && cell.parent.level > 1) {
                    if (cell.parent.parent.children.length > 1 && cell.parent.children.length == 1 && cell.parent.geometry.x > 0) {
                        for (var k = 0; k < cell.parent.parent.children.length; k++) {
                            if (cell.parent.parent.children[k].geometry.x >= cell.parent.geometry.x && cell.parent.children.length == 1) {
                                cell.parent.parent.children[k].geometry.x += 50;
                                cell.parent.parent.geometry.x -= 50;
                                cell.parent.parent.geometry.width += 50;
                            }
                        }
                    }
                    cell.parent.geometry.height = cell.parent.children[cell.parent.children.length - 1].geometry.y;
                } else {
                    cell.parent.geometry.height = 1;
                }
                if (cell.parent.level != 1) {
                    resize(cell.parent);
                } else {
                    cell.parent.geometry.height = cell.parent.children[cell.parent.children.length - 1].geometry.y;
                }
            };
            resize(myCell);
        } else {
            y = 0;
            for (var i = 0; i < cell.children.length; i++) {
                cell.children[i].geometry.y += 70;
            }
            if (cell.children.length > 0) {
                cell.geometry.height += 70;
                cell.geometry.y -= 70;
            }
            var myCell = graph.insertVertex(cell, null, text, x, y, 70, 1, 'shape=line;verticalAlign=top;align=right;strokeWidth=1;strokeColor=#BB3D00;');
            myCell.level = cell.level + 1;
            myCell.direction = 'left';
            myCell.geometry.x -= 70;

            if (myCell.parent.parent.direction == 'left') {
                myCell.parent.parent.geometry.height = 1;
            }

            var resize = function (cell) {
                if (cell.direction == 'top' && cell.level != 1 && cell.children.length == 1) {
                    for (var k = cell.parent.children.length - 1; k >= 0; k--) {
                        if (cell.parent.children[k].geometry.x >= cell.geometry.x) {
                            cell.parent.children[k].geometry.x += cell.children[0].geometry.width;
                        }
                    }
                    cell.geometry.x -= myCell.geometry.width;
                }
            };
            resize(myCell.parent);
        }
    };
    /*垂直方向子主题*/
    var insertVerticalSubLevel = function () {
        var selfTopParent = fish.getSelfTopParent(cell);
        var leftTopParents = fish.getLeftTopParent(selfTopParent, true);
        if (!text) text = '分支主题' + (cell.children.length + 1);
        if (cell.children.length == 0)
            x = 0;
        else {
            var maxX = 0;
            for (var i = 0; i < cell.children.length; i++) {
                if (cell.children[i].geometry.x > maxX) {
                    maxX = cell.children[i].geometry.x;
                }
            }
            x = 50 + maxX;
        }
        var align = 'right';
        var direction = 'bottom';
        if (selfTopParent.direction == 'bottom') {
            y = 1;
        } else {
            y = 0;
            align = 'left';
            direction = 'top';
        }

        var myCell = graph.insertVertex(cell, null, text, x, y, 1, 70, 'transform=rotate(-215);shape=line;direction=north;verticalAlign=top;align=' + align + ';spacingBottom=10;strokeWidth=1;strokeColor=#BB3D00;');
        myCell.parentId = cell.id;
        myCell.level = cell.level + 1;
        myCell.direction = direction;
        if (selfTopParent.direction == 'bottom') {
            if (cell.children.length == 1) {
                var t = 0;
                for (var i = 0; i < cell.parent.children.length; i++) {
                    if (cell.parent.children[i].id != cell.id && cell.parent.children[i].geometry.y > cell.geometry.y) {
                        cell.parent.children[i].geometry.y += myCell.geometry.height;
                        t++;
                    }
                }
                if (t > 0) {
                    selfTopParent.geometry.height += myCell.geometry.height;
                }
            };
            var resize = function (cell) {
                var parent = cell.parent;
                if (parent.id != 1) {
                    if (cell.direction == 'left') cell.geometry.height = 1;
                    if (parent.direction == 'left') {
                        parent.geometry.height = 1;
                        if (parent.children.length > 1 && cell.geometry.x > 0) {
                            parent.geometry.width += 50;
                            parent.geometry.x -= 50;
                        }
                        resize(parent);
                    } else {
                        parent.geometry.height = parent.children[parent.children.length - 1].geometry.y;
                        if (parent.level != 1 && parent.parent.children.length > 1 && cell.parent.geometry.x > 0) {
                            for (var k = 0; k < parent.parent.children.length; k++) {
                                if (parent.parent.children[k].geometry.x >= parent.geometry.x)
                                    parent.parent.children[k].geometry.x += 50;
                            }
                        }
                        resize(parent);
                    }
                }
            };
            resize(myCell);
        } else {
            myCell.geometry.y -= 70;
            var t = 0;
            if (cell.children.length == 1 && cell.geometry.y > 0) {
                for (var i = 0; i < cell.parent.children.length; i++) {
                    if (cell.parent.children[i].geometry.y > 0 && cell.parent.children[i].geometry.y >= cell.geometry.y) {
                        cell.parent.children[i].geometry.y += cell.geometry.height;
                        t++;
                    }
                }
                cell.parent.geometry.height += myCell.geometry.height;
                cell.parent.geometry.y -= myCell.geometry.height;
            };
            var resize = function (cell) {
                if (cell.direction == 'left') {
                    cell.geometry.height = 1;
                    if (cell.children.length > 1) {
                        for (var k = 0; k < cell.children.length; k++) {
                            if (cell.children[k].geometry.x <= cell.geometry.x)
                                cell.children[k].geometry.x += 50;
                        }
                        cell.geometry.x -= 50;
                        cell.geometry.width += 50;
                    }
                } else {
                    if (cell.children.length > 1) {
                        for (var k = 0; k < cell.children.length; k++) {
                            if (cell.children[k].geometry.x >= cell.geometry.x)
                                cell.children[k].geometry.x += 50;
                        }
                        cell.geometry.x -= 50;
                    }
                }
            };
            resize(myCell.parent);
        }

    };

    var insertTopLevel = function () {
        var direction = 'bottom';
        if (myChild.length % 2 == 0) {
            direction = 'top';
        }
        model.beginUpdate();
        x = cell.geometry.x - (myChild.length / 2 * 100) - (myChild.length + 1) * 30;
        if (myChild.length > 0) {
            x = myChild[0].geometry.x;
            for (var t = 0; t < myChild.length; t++) {
                if (myChild[t].geometry.x < x) {
                    x = myChild[t].geometry.x;
                }
            }
        }
        x -= 100;
        if (myChild.length % 2 == 0) {
            y = cell.geometry.y - 30;
        } else {
            y = cell.geometry.y + 45;
        }
        if (!text) text = '分支主题';
        var vAlign = 'top';
        var dir = 'north';
        var align = 'right';
        if (myChild.length % 2 == 0) {
            vAlign = 'bottom';
            dir = 'south';
            align = 'left';
        }
        var myCell = graph.insertVertex(graph.getDefaultParent(), null, text, x, y, 1, 70, 'shape=line;align=' + align + ';verticalAlign=' + vAlign + ';direction=' + dir + ';verticalLabelPosition=middle;fontSize=18;strokeWidth=1;strokeColor=#8C8C00;');
        myCell.parentId = cell.id;
        myCell.level = cell.level + 1;
        myCell.direction = direction;

        model.endUpdate();
        graph.clearSelection();
    };
    var insert = function () {
        if (cell.level == 0) {
            insertTopLevel();
        } else {
            if (isSub) {
                insertSubLevel();
            } else {
                insertSameLevel();
            }
        }
    };
    var insertSameLevel = function () {
        if (cell.level) {
            if (cell.level == 1) {
                cell = fish.getCellById('fishboneHead');
                myChild = fish.getChildSubject(cell);
                insertTopLevel();
            } else {
                cell = cell.parent;
                myChild = cell.children;
                insertSubLevel();
            }
        } else {
            cell = cell.parent;
            myChild = cell.children;
            insertTopLevel();
        }

    };
    var insertSubLevel = function () {
        switch (cell.direction) {
            case 'left':
                insertVerticalSubLevel();
                break;
            case 'top':
            case 'bottom':
                insertHorizontalSubLevel();
                break;
        }
        graph.refresh();
    };

    insert();
    this.graph.refresh()
};

fishBone.prototype.getChildSubject = function (cell) {
    var allCells = this.graph.model.root.children[0].children;
    var children = [];
    for (var i = 0; i < allCells.length; i++) {
        if (allCells[i].parentId == cell.id) {
            children.push(allCells[i]);
        }
    }
    return children;
};

fishBone.prototype.getCellById = function (id) {
    var allCells = this.graph.model.root.children[0].children;
    for (var i = 0; i < allCells.length; i++) {
        if (allCells[i].id == id) {
            return allCells[i];
        }
    }
    return null;
};


/*
 * 获取当前主题的1级主题
 * */
fishBone.prototype.getSelfTopParent = function (cell) {
    if (cell.level == 1) {
        return cell;
    } else {
        if (cell.parent.level == 1) {
            return cell.parent;
        } else {
            return this.getSelfTopParent(cell.parent);
        }
    }
};
/*
 * 获取左侧所有1级主题
 * */
fishBone.prototype.getLeftTopParent = function (selfParentCell, isBottom) {
    var allCells = this.graph.model.root.children[0].children;
    var arr = [];
    for (var i = 0; i < allCells.length; i++) {
        if (isBottom) {
            if (allCells[i].level == 1 && allCells[i].direction == 'bottom' && allCells[i].geometry.x < selfParentCell.geometry.x) {
                arr.push(allCells[i]);
            }
        } else {

        }
    }
    return arr;
};
/*
 * 获取除自己以外的1级主题
 * */
fishBone.prototype.getOtherTopParentCell = function (selfParentCell) {
    var allCells = this.graph.model.root.children[0].children;
    var allTopParentCell = [];
    for (var i = 0; i < allCells.length; i++) {
        if (allCells[i].level == 1 && allCells[i].id != selfParentCell.id) {
            allTopParentCell.push(allCells[i]);
        }
    }
    return allTopParentCell;
}