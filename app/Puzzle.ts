class Cell {
	// stores the current value of this cell
	value: number = 0;

	x: number = 0;
	y: number = 0;

	// stores the possible values this cell can be
	possibleValues = new Set<number>();
}

enum GroupType {
	ROW,
	COLUMN,
	NONET
}

interface CellGroup extends Array<Cell> {
	type: GroupType
}

export class Puzzle {
	// stores a 1D array of all cells. Used to iterate through linearly
	cells = new Array<Cell>();

	// stores a 2D array of the puzzle with the row index as the top array
	rows = new Array<Array<Cell>>();

	// stores a 2D array of the puzzle with the column index as the top array
	columns = new Array<Array<Cell>>();

	// stores a 3D array where the index of the block [y,x] stores an array of cells in the block
	blocks = new Array<Array<Array<Cell>>>();

	constructor(cells: Array<Array<number>>) {
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

				if (!this.rows[y]) this.rows[y] = [];
				this.rows[y][x] = cell;

				if (!this.columns[x]) this.columns[x] = [];
				this.columns[x][y] = cell;

				var blockX = Math.floor(x / 3);
				var blockY = Math.floor(y / 3);
				if (!this.blocks[blockY]) this.blocks[blockY] = [];
				if (!this.blocks[blockY][blockX]) this.blocks[blockY][blockX] = [];
				this.blocks[blockY][blockX].push(cell);
			}
		}

		this.solvePossibleValues(); //go ahead and fill the possible values so they aren't empty
	}

	//returns a set of numbers that are in both sets
	private intersectSets(s1: Set<number>, s2: Set<number>): Set<number> {
		var s3 = new Set<number>();
		s1.forEach((v) => {
			if (s2.has(v)) s3.add(v);
		})
		return s3;
	}

	//returns a set of number in s1 but not in s2
	private differenceSets(s1: Set<number>, s2: Set<number>): Set<number> {
		var s3 = new Set<number>();
		s1.forEach((v) => {
			if (!s2.has(v)) s3.add(v);
		})
		return s3;
	}

	//returns a set of groups that individually must contain 1-9
	private getGroups() {
		var groups = new Array<CellGroup>();

		//get all block groups
		for (var y = 0; y < 3; y++) {
			for (var x = 0; x < 3; x++) {
				var block = this.blocks[y][x] as CellGroup;
				block.type = GroupType.NONET;
				groups.push(block);
			}
		}

		//get all row groups
		for (var y = 0; y < 9; y++) {
			var row = this.rows[y] as CellGroup;
			row.type = GroupType.ROW;
			groups.push(row);
		}

		//get all column groups
		for (var x = 0; x < 9; x++) {
			var column = this.columns[x] as CellGroup;
			column.type = GroupType.COLUMN
			groups.push(column);
		}
		return groups;
	}

	//creates the possibleValues set on the Cell object which stores all of the possible values that cell can be
	solvePossibleValues() {
		var groups = this.getGroups();

		//Sets the possible values to a set of values that aren't being used by this group
		groups.forEach((cells) => {
			var unusedValues = new Set<number>([1, 2, 3, 4, 5, 6, 7, 8, 9]);
			for (var c of cells) {
				//remove from unused if used
				unusedValues.delete(c.value);
			}
			for (var c of cells) {
				if (c.value) continue;
				//intersect the unused values with the possible values to get a reduced set of possible values
				c.possibleValues = this.intersectSets(unusedValues, c.possibleValues);
			}
		});
	}
	
	private solveCellsWhereOnlyCellWithAValue() {
		var changes = new Array<[number, number, number, string]>();

		var groups = this.getGroups();

		//If there is a possible value in the current cell but not in any other cells, then this cell must have that value
		groups.forEach((cells) => {
			//iterate through all of the cells
			for (var c1 of cells) {
				var uniqueValues = new Set<number>();
				c1.possibleValues.forEach((v) => uniqueValues.add(v));

				//iterate again, but this time store only store the difference between its current possible values and the ones that the other cells have to find unique possible values
				for (var c2 of cells) {
					if (c1 == c2) continue;
					uniqueValues = this.differenceSets(uniqueValues, c2.possibleValues);
					uniqueValues.delete(c2.value);
				}

				//should never happen
				if (uniqueValues.size > 1) {
					throw "Weird... cell is the only cell that can be more than one value";
				}

				//if the cell has a unique value, this must be the value of the cell
				if (uniqueValues.size > 0) {
					var v = uniqueValues.values().next().value;
					var change = this.setValue(c1, v, "was the only cell in the " + GroupType[cells.type].toLowerCase() + " that could be");
					changes = changes.concat(change)
				}
			}
		})

		return changes;
	}
	
	//helper for setting a value on a cell that also removes it from possible values of the cells in the row/column/nonet
	private setValue(cell: Cell, value: number, reason: string): Array<[number, number, number, string]> {
		var changes = new Array<[number, number, number, string]>();
		changes.push([cell.x, cell.y, value, reason]);
		cell.value = value;
		cell.possibleValues = new Set<number>();

		var toCheck = new Array<Array<Cell>>();
		toCheck.push(this.rows[cell.y]);
		toCheck.push(this.columns[cell.x]);
		toCheck.push(this.blocks[Math.floor(cell.y / 3)][Math.floor(cell.x / 3)]); //adds the cells in the current nonet
		toCheck.forEach((group) => {
			for (var c of group) {
				if (c == cell) continue;
				var change = this.removePossibleValue(c, value); //removes the value we just set from the possible values of this cell
				changes = changes.concat(change);
			}
		})
		return changes;
	}
	
	//helper for removing a possible value that sets the value if there is only one possible value after being removed
	private removePossibleValue(cell: Cell, value: number): Array<[number, number, number, string]> {
		var changes = new Array<[number, number, number, string]>();
		cell.possibleValues.delete(value); //remove the va

		if (cell.possibleValues.size == 1) {
			var c = this.setValue(cell, cell.possibleValues.values().next().value, "could only be");
			changes = changes.concat(c);
		}
		return changes;
	}
	
	toString() {
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
			if (y != 8) str += "\n";
		}
		return str;
	}
	
	//quickly checks if the puzzle is solved
	isSolved() {
		for (var cell of this.cells) {
			if (!cell.value) return false;
		}
		return true;
	}
	
	//figures out how many cells are solved
	solvedCount() {
		var count = 0;
		for (var cell of this.cells) {
			count += (cell.value ? 1 : 0);
		}
		return count;
	}
	
	//checks each row/column/nonet for duplicates
	valid() {
		var groups = this.getGroups();
		for (var cells of groups) {
			var values = new Set<number>();
			for (var c1 of cells) {
				if (c1.value && values.has(c1.value)) return false;
				else values.add(c1.value);
			}
		}
		return true;
	}
	
	//Algorithm #1
	solve1() {
		var done = false;

		var changes = new Array<[number, number, number, string]>();
		var groups = this.getGroups();

		//Sets the possible values to a set of values that aren't being used by this group
		groups.forEach((cells: Array<Cell>) => {
			var usedValues = new Set<number>();
			for (var c of cells) {
				//remove from unused if used
				usedValues.add(c.value);
			}
			for (var c of cells) {
				if (c.value) continue;
				//intersect the unused values with the possible values to get a reduced set of possible values
				usedValues.forEach((v) => {
					var change = this.removePossibleValue(c, v);
					changes = changes.concat(change);
				})
			}
		});
		return changes;
	}
	
	//Algorithm #2
	solve2() {
		var changes = this.solve1();

		var done = false;
		var iterateCount = 0;
		while (!done) {
			if (iterateCount++ > 100) break; //jut a safety

			var c = this.solveCellsWhereOnlyCellWithAValue();
			changes = changes.concat(c);
			if (c.length == 0) done = true;
		}
		return changes;
	}
}