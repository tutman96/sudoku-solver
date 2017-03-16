import { Component } from '@angular/core';
import { Puzzle } from './Puzzle';

@Component({
	selector: 'my-app',
	template: `
<h2>Artificial Intelligence - Project 0</h2>
<table>
	<tr>
		<td style="vertical-align:top;">
			<div>Select File: <input type="file" (change)="onFileUpload($event)"></div>
			<br>
			<div>
				Select Method:<br>
				<div style="padding-left: 1em">
					<label><input type="radio" [(ngModel)]="method" name="method" value="solve1"> Algorithm #1 <small>Set cells if there was only one possible value</small></label><br>
					<label><input type="radio" [(ngModel)]="method" name="method" value="solve2"> Algorithm #1 + Algorithm #2 <small>Does Solve 1 but solves a cell if it is the only cell in its row/column/nonet with that possible value</small></label><br>
				</div>
			</div>
			<br>
			<div>
				<button (click)="solve()">Solve</button>
			</div>
			<br><br>
			Changes:<br>
			<select multiple [(ngModel)]="selectedChanges">
				<option [ngValue]="null">Unsolved</option>
				<option *ngFor="let change of changes" [ngValue]="change">
					Change cell ({{change[0] + 1}}, {{change[1] + 1}}) to {{change[2]}} because it {{change[3]}} {{change[2]}}
				</option>
				<option [ngValue]="changes[changes.length - 1]">Solved</option>
			</select>
			<br><br>
			{{stats}}
		</td>
		<td>
			<table class="puzzle" *ngIf="puzzle">
				<tr>
					<th></th>
					<th *ngFor="let cell of puzzle.rows[0]; let x = index">{{x + 1}}</th>
				</tr>
				<tr *ngFor="let row of puzzle.rows; let y = index">
					<th>{{y + 1}}</th>
					<td *ngFor="let cell of row;">
						<span class="solvedValue" *ngIf="cell.value != 0">{{cell.value}}</span>
						<table class="unsolved">
							<tr *ngFor="let r of [1,2,3]">
								<td *ngFor="let c of [1,2,3]" [ngClass]="{ 'disabled': !cell.possibleValues.has(c + (3 * (r-1))), 'solved': (c + (3 * (r-1))) == cell.value }">
									{{c + (3 * (r-1))}}
								</td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
		</td>
	</tr>
</table>	
`
})
export class AppComponent {
	initialPuzzle: Puzzle;
	puzzle: Puzzle;
	method = "solve1";

	changes = new Array<[number, number, number]>();
	stats = "";

	private _selectedChanges;
	set selectedChanges(changes: Array<[number, number, number]>) {
		this.applyChange(changes[0]);
		this._selectedChanges = [changes[0]];
	}
	get selectedChanges() {
		return this._selectedChanges
	}

	constructor() {
		var str = `0,0,1,0,0,4,0,0,0
3,0,0,0,5,0,9,0,2
0,0,0,9,0,0,0,7,3
0,0,0,0,0,0,0,0,0
0,0,0,0,0,3,8,0,0
7,9,0,0,1,0,0,0,0
5,2,0,0,0,8,0,0,0
0,0,0,0,4,0,0,0,5
0,0,0,1,6,0,0,0,4`
		this.puzzle = new Puzzle(str.split('\n').map((l) => l.split(',').map((c) => +c)));
		this.initialPuzzle = new Puzzle(str.split('\n').map((l) => l.split(',').map((c) => +c)));
	}

	onFileUpload(event) {
		var files: FileList = event.srcElement.files;
		if (files.length == 0) return;

		var file = files.item(0);
		var fr = new FileReader();
		fr.onload = () => {
			var text: string = fr.result;
			this.puzzle = new Puzzle(text.split('\n').map((l) => l.split(',').map((c) => +c)));
			this.initialPuzzle = new Puzzle(text.split('\n').map((l) => l.split(',').map((c) => +c)));
			console.log(this.puzzle);
			this.changes = [];
			this.selectedChanges = [null];
		}
		fr.readAsText(file);
	}

	solve() {
		this.puzzle = new Puzzle(this.initialPuzzle.rows.map((r) => r.map(r => r.value)));
		var initialSolvedCount = this.puzzle.solvedCount();
		if (typeof this.puzzle[this.method] != "function") return;
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
	}

	private changeDebounce;
	applyChange(change: [number, number, number]) {
		clearTimeout(this.changeDebounce);
		this.changeDebounce = setTimeout(() => {
			this.puzzle = new Puzzle(this.initialPuzzle.rows.map((r) => r.map(r => r.value)));

			var index = this.changes.indexOf(change);
			for (var i = 0; i <= index; i++) {
				var c = this.changes[i];
				this.puzzle.columns[c[0]][c[1]].value = c[2];
				this.puzzle.columns[c[0]][c[1]].possibleValues = new Set<number>();
			}

			this.puzzle.solvePossibleValues();
		}, 10)
	}
}  