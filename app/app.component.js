"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var Puzzle_1 = require("./Puzzle");
var AppComponent = (function () {
    function AppComponent() {
        this.method = "solve1";
        this.changes = new Array();
        this.stats = "";
        var str = "0,0,1,0,0,4,0,0,0\n3,0,0,0,5,0,9,0,2\n0,0,0,9,0,0,0,7,3\n0,0,0,0,0,0,0,0,0\n0,0,0,0,0,3,8,0,0\n7,9,0,0,1,0,0,0,0\n5,2,0,0,0,8,0,0,0\n0,0,0,0,4,0,0,0,5\n0,0,0,1,6,0,0,0,4";
        this.puzzle = new Puzzle_1.Puzzle(str.split('\n').map(function (l) { return l.split(',').map(function (c) { return +c; }); }));
        this.initialPuzzle = new Puzzle_1.Puzzle(str.split('\n').map(function (l) { return l.split(',').map(function (c) { return +c; }); }));
    }
    Object.defineProperty(AppComponent.prototype, "selectedChanges", {
        get: function () {
            return this._selectedChanges;
        },
        set: function (changes) {
            this.applyChange(changes[0]);
            this._selectedChanges = [changes[0]];
        },
        enumerable: true,
        configurable: true
    });
    AppComponent.prototype.onFileUpload = function (event) {
        var _this = this;
        var files = event.srcElement.files;
        if (files.length == 0)
            return;
        var file = files.item(0);
        var fr = new FileReader();
        fr.onload = function () {
            var text = fr.result;
            _this.puzzle = new Puzzle_1.Puzzle(text.split('\n').map(function (l) { return l.split(',').map(function (c) { return +c; }); }));
            _this.initialPuzzle = new Puzzle_1.Puzzle(text.split('\n').map(function (l) { return l.split(',').map(function (c) { return +c; }); }));
            console.log(_this.puzzle);
            _this.changes = [];
            _this.selectedChanges = [null];
        };
        fr.readAsText(file);
    };
    AppComponent.prototype.solve = function () {
        this.puzzle = new Puzzle_1.Puzzle(this.initialPuzzle.rows.map(function (r) { return r.map(function (r) { return r.value; }); }));
        var initialSolvedCount = this.puzzle.solvedCount();
        if (typeof this.puzzle[this.method] != "function")
            return;
        try {
            var startTime = performance.now();
            this.changes = this.puzzle[this.method].call(this.puzzle);
            this.selectedChanges = [this.changes[this.changes.length - 1]];
            var endTime = performance.now();
            var finalSolvedCount = this.puzzle.solvedCount() - initialSolvedCount;
            this.stats = "Solved " + finalSolvedCount + "/" + (81 - initialSolvedCount) + " (" + ((finalSolvedCount / (81 - initialSolvedCount)) * 100).toFixed(2) + "%) in " + (endTime - startTime).toFixed(3) + " ms";
        }
        catch (e) {
            console.error(e);
            alert("Error");
            window['puzzle'] = this.puzzle;
        }
    };
    AppComponent.prototype.applyChange = function (change) {
        var _this = this;
        clearTimeout(this.changeDebounce);
        this.changeDebounce = setTimeout(function () {
            _this.puzzle = new Puzzle_1.Puzzle(_this.initialPuzzle.rows.map(function (r) { return r.map(function (r) { return r.value; }); }));
            var index = _this.changes.indexOf(change);
            for (var i = 0; i <= index; i++) {
                var c = _this.changes[i];
                _this.puzzle.columns[c[0]][c[1]].value = c[2];
                _this.puzzle.columns[c[0]][c[1]].possibleValues = new Set();
            }
            _this.puzzle.solvePossibleValues();
        }, 10);
    };
    return AppComponent;
}());
AppComponent = __decorate([
    core_1.Component({
        selector: 'my-app',
        template: "\n<h2>Artificial Intelligence - Project 0</h2>\n<table>\n\t<tr>\n\t\t<td style=\"vertical-align:top;\">\n\t\t\t<div>Select File: <input type=\"file\" (change)=\"onFileUpload($event)\"></div>\n\t\t\t<br>\n\t\t\t<div>\n\t\t\t\tSelect Method:<br>\n\t\t\t\t<div style=\"padding-left: 1em\">\n\t\t\t\t\t<label><input type=\"radio\" [(ngModel)]=\"method\" name=\"method\" value=\"solve1\"> Algorithm #1 <small>Set cells if there was only one possible value</small></label><br>\n\t\t\t\t\t<label><input type=\"radio\" [(ngModel)]=\"method\" name=\"method\" value=\"solve2\"> Algorithm #1 + Algorithm #2 <small>Does Solve 1 but solves a cell if it is the only cell in its row/column/nonet with that possible value</small></label><br>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<br>\n\t\t\t<div>\n\t\t\t\t<button (click)=\"solve()\">Solve</button>\n\t\t\t</div>\n\t\t\t<br><br>\n\t\t\tChanges:<br>\n\t\t\t<select multiple [(ngModel)]=\"selectedChanges\">\n\t\t\t\t<option [ngValue]=\"null\">Unsolved</option>\n\t\t\t\t<option *ngFor=\"let change of changes\" [ngValue]=\"change\">\n\t\t\t\t\tChange cell ({{change[0] + 1}}, {{change[1] + 1}}) to {{change[2]}} because it {{change[3]}} {{change[2]}}\n\t\t\t\t</option>\n\t\t\t\t<option [ngValue]=\"changes[changes.length - 1]\">Solved</option>\n\t\t\t</select>\n\t\t\t<br><br>\n\t\t\t{{stats}}\n\t\t</td>\n\t\t<td>\n\t\t\t<table class=\"puzzle\" *ngIf=\"puzzle\">\n\t\t\t\t<tr>\n\t\t\t\t\t<th></th>\n\t\t\t\t\t<th *ngFor=\"let cell of puzzle.rows[0]; let x = index\">{{x + 1}}</th>\n\t\t\t\t</tr>\n\t\t\t\t<tr *ngFor=\"let row of puzzle.rows; let y = index\">\n\t\t\t\t\t<th>{{y + 1}}</th>\n\t\t\t\t\t<td *ngFor=\"let cell of row;\">\n\t\t\t\t\t\t<span class=\"solvedValue\" *ngIf=\"cell.value != 0\">{{cell.value}}</span>\n\t\t\t\t\t\t<table class=\"unsolved\">\n\t\t\t\t\t\t\t<tr *ngFor=\"let r of [1,2,3]\">\n\t\t\t\t\t\t\t\t<td *ngFor=\"let c of [1,2,3]\" [ngClass]=\"{ 'disabled': !cell.possibleValues.has(c + (3 * (r-1))), 'solved': (c + (3 * (r-1))) == cell.value }\">\n\t\t\t\t\t\t\t\t\t{{c + (3 * (r-1))}}\n\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t</table>\n\t\t\t\t\t</td>\n\t\t\t\t</tr>\n\t\t\t</table>\n\t\t</td>\n\t</tr>\n</table>\t\n"
    }),
    __metadata("design:paramtypes", [])
], AppComponent);
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map