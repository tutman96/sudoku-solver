"use strict";
var Cell = (function () {
    function Cell() {
        // stores the current value of this cell
        this.value = 0;
        this.x = 0;
        this.y = 0;
        // stores the possible values this cell can be
        this.possibleValues = new Set();
    }
    return Cell;
}());
var GroupType;
(function (GroupType) {
    GroupType[GroupType["ROW"] = 0] = "ROW";
    GroupType[GroupType["COLUMN"] = 1] = "COLUMN";
    GroupType[GroupType["NONET"] = 2] = "NONET";
})(GroupType || (GroupType = {}));
var Puzzle = (function () {
    function Puzzle(cells) {
        // stores a 1D array of all cells. Used to iterate through linearly
        this.cells = new Array();
        // stores a 2D array of the puzzle with the row index as the top array
        this.rows = new Array();
        // stores a 2D array of the puzzle with the column index as the top array
        this.columns = new Array();
        // stores a 3D array where the index of the block [y,x] stores an array of cells in the block
        this.blocks = new Array();
        for (var y = 0; y < 9; y++) {
            for (var x = 0; x < 9; x++) {
                var cell = new Cell();
                cell.x = x;
                cell.y = y;
                cell.value = cells[y][x];
                if (cell.value == 0) {
                    cell.possibleValues = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                }
                this.cells.push(cell);
                if (!this.rows[y])
                    this.rows[y] = [];
                this.rows[y][x] = cell;
                if (!this.columns[x])
                    this.columns[x] = [];
                this.columns[x][y] = cell;
                var blockX = Math.floor(x / 3);
                var blockY = Math.floor(y / 3);
                if (!this.blocks[blockY])
                    this.blocks[blockY] = [];
                if (!this.blocks[blockY][blockX])
                    this.blocks[blockY][blockX] = [];
                this.blocks[blockY][blockX].push(cell);
            }
        }
        this.solvePossibleValues(); //go ahead and fill the possible values so they aren't empty
    }
    //returns a set of numbers that are in both sets
    Puzzle.prototype.intersectSets = function (s1, s2) {
        var s3 = new Set();
        s1.forEach(function (v) {
            if (s2.has(v))
                s3.add(v);
        });
        return s3;
    };
    //returns a set of number in s1 but not in s2
    Puzzle.prototype.differenceSets = function (s1, s2) {
        var s3 = new Set();
        s1.forEach(function (v) {
            if (!s2.has(v))
                s3.add(v);
        });
        return s3;
    };
    //returns a set of groups that individually must contain 1-9
    Puzzle.prototype.getGroups = function () {
        var groups = new Array();
        //get all block groups
        for (var y = 0; y < 3; y++) {
            for (var x = 0; x < 3; x++) {
                var block = this.blocks[y][x];
                block.type = GroupType.NONET;
                groups.push(block);
            }
        }
        //get all row groups
        for (var y = 0; y < 9; y++) {
            var row = this.rows[y];
            row.type = GroupType.ROW;
            groups.push(row);
        }
        //get all column groups
        for (var x = 0; x < 9; x++) {
            var column = this.columns[x];
            column.type = GroupType.COLUMN;
            groups.push(column);
        }
        return groups;
    };
    //creates the possibleValues set on the Cell object which stores all of the possible values that cell can be
    Puzzle.prototype.solvePossibleValues = function () {
        var _this = this;
        var groups = this.getGroups();
        //Sets the possible values to a set of values that aren't being used by this group
        groups.forEach(function (cells) {
            var unusedValues = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
            for (var _i = 0, cells_1 = cells; _i < cells_1.length; _i++) {
                var c = cells_1[_i];
                //remove from unused if used
                unusedValues.delete(c.value);
            }
            for (var _a = 0, cells_2 = cells; _a < cells_2.length; _a++) {
                var c = cells_2[_a];
                if (c.value)
                    continue;
                //intersect the unused values with the possible values to get a reduced set of possible values
                c.possibleValues = _this.intersectSets(unusedValues, c.possibleValues);
            }
        });
    };
    Puzzle.prototype.solveCellsWhereOnlyCellWithAValue = function () {
        var _this = this;
        var changes = new Array();
        var groups = this.getGroups();
        //If there is a possible value in the current cell but not in any other cells, then this cell must have that value
        groups.forEach(function (cells) {
            //iterate through all of the cells
            for (var _i = 0, cells_3 = cells; _i < cells_3.length; _i++) {
                var c1 = cells_3[_i];
                var uniqueValues = new Set();
                c1.possibleValues.forEach(function (v) { return uniqueValues.add(v); });
                //iterate again, but this time store only store the difference between its current possible values and the ones that the other cells have to find unique possible values
                for (var _a = 0, cells_4 = cells; _a < cells_4.length; _a++) {
                    var c2 = cells_4[_a];
                    if (c1 == c2)
                        continue;
                    uniqueValues = _this.differenceSets(uniqueValues, c2.possibleValues);
                    uniqueValues.delete(c2.value);
                }
                //should never happen
                if (uniqueValues.size > 1) {
                    throw "Weird... cell is the only cell that can be more than one value";
                }
                //if the cell has a unique value, this must be the value of the cell
                if (uniqueValues.size > 0) {
                    var v = uniqueValues.values().next().value;
                    var change = _this.setValue(c1, v, "was the only cell in the " + GroupType[cells.type].toLowerCase() + " that could be");
                    changes = changes.concat(change);
                }
            }
        });
        return changes;
    };
    Puzzle.prototype.setValue = function (cell, value, reason) {
        var _this = this;
        var changes = new Array();
        changes.push([cell.x, cell.y, value, reason]);
        cell.value = value;
        cell.possibleValues = new Set();
        var toCheck = new Array();
        toCheck.push(this.rows[cell.y]);
        toCheck.push(this.columns[cell.x]);
        toCheck.push(this.blocks[Math.floor(cell.y / 3)][Math.floor(cell.x / 3)]);
        toCheck.forEach(function (group) {
            for (var _i = 0, group_1 = group; _i < group_1.length; _i++) {
                var c = group_1[_i];
                if (c == cell)
                    continue;
                var change = _this.removePossibleValue(c, value);
                changes = changes.concat(change);
            }
        });
        return changes;
    };
    Puzzle.prototype.removePossibleValue = function (cell, value) {
        var changes = new Array();
        cell.possibleValues.delete(value);
        if (cell.possibleValues.size == 1) {
            var c = this.setValue(cell, cell.possibleValues.values().next().value, "could only be");
            changes = changes.concat(c);
        }
        return changes;
    };
    Puzzle.prototype.toString = function () {
        var str = "";
        for (var y = 0; y < 9; y++) {
            if (y == 3 || y == 6) {
                str += "\u2501\u2501\u2501\u2501\u2501\u2501\u254B\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u254B\u2501\u2501\u2501\u2501\u2501\u2501\n";
            }
            var prefix = "";
            for (var x = 0; x < 9; x++) {
                if (x == 3 || x == 6) {
                    str += " \u2503";
                }
                str += prefix + (this.rows[y][x].value || "\u2395");
                prefix = " ";
            }
            if (y != 8)
                str += "\n";
        }
        return str;
    };
    Puzzle.prototype.isSolved = function () {
        for (var _i = 0, _a = this.cells; _i < _a.length; _i++) {
            var cell = _a[_i];
            if (!cell.value)
                return false;
        }
        return true;
    };
    Puzzle.prototype.solvedCount = function () {
        var count = 0;
        for (var _i = 0, _a = this.cells; _i < _a.length; _i++) {
            var cell = _a[_i];
            count += (cell.value ? 1 : 0);
        }
        return count;
    };
    Puzzle.prototype.valid = function () {
        var groups = this.getGroups();
        for (var _i = 0, groups_1 = groups; _i < groups_1.length; _i++) {
            var cells = groups_1[_i];
            var values = new Set();
            for (var _a = 0, cells_5 = cells; _a < cells_5.length; _a++) {
                var c1 = cells_5[_a];
                if (c1.value && values.has(c1.value))
                    return false;
                else
                    values.add(c1.value);
            }
        }
        return true;
    };
    Puzzle.prototype.solve1 = function () {
        var _this = this;
        var done = false;
        var changes = new Array();
        var groups = this.getGroups();
        //Sets the possible values to a set of values that aren't being used by this group
        groups.forEach(function (cells) {
            var usedValues = new Set();
            for (var _i = 0, cells_6 = cells; _i < cells_6.length; _i++) {
                var c = cells_6[_i];
                //remove from unused if used
                usedValues.add(c.value);
            }
            for (var _a = 0, cells_7 = cells; _a < cells_7.length; _a++) {
                var c = cells_7[_a];
                if (c.value)
                    continue;
                //intersect the unused values with the possible values to get a reduced set of possible values
                usedValues.forEach(function (v) {
                    var change = _this.removePossibleValue(c, v);
                    changes = changes.concat(change);
                });
            }
        });
        return changes;
    };
    Puzzle.prototype.solve2 = function () {
        var changes = this.solve1();
        var done = false;
        var iterateCount = 0;
        while (!done) {
            if (iterateCount++ > 100)
                break;
            var c = this.solveCellsWhereOnlyCellWithAValue();
            changes = changes.concat(c);
            if (c.length == 0)
                done = true;
        }
        return changes;
    };
    return Puzzle;
}());
exports.Puzzle = Puzzle;
//# sourceMappingURL=Puzzle.js.map