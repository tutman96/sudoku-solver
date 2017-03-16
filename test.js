var fs = require('fs');
var P = require('./app/Puzzle');
var Puzzle = P.Puzzle;

var toSolvePerMethod = 0;
var solvedPerMethod = 0;

var solvePuzzle = (method, filename) => {
	if (!filename.match(/.*\.csv/g)) return; //to prevent non-csv files (.DS_Store, etc)

	var puzzle = new Puzzle(fs.readFileSync("puzzles/" + filename).toString().split('\n').map((r) => r.split(',').map((c) => +c))); //create Puzzle from csv file. Has some newline splits and string to number conversion

	var startingSolvedCount = puzzle.solvedCount();
	toSolvePerMethod += 81 - startingSolvedCount;

	var startTime = process.hrtime();
	var changes = method.call(puzzle);
	var totalTime = process.hrtime(startTime)[1] / 1e6;

	if (!puzzle.valid()) {
		console.error("Invalid puzzle (%s)", filename);
		console.log(puzzle.toString());
	}

	if (puzzle.isSolved()) {
		// console.log("Solved %s!", filename);
		// console.log(puzzle.toString());
		fs.writeFileSync("solutions/" + filename, changes.map((c) => `Change (${c[0]}, ${c[1]}) to ${c[2]}`).join("\n"));
	}

	var diffSolved = puzzle.solvedCount() - startingSolvedCount;
	solvedPerMethod += diffSolved;
	console.log("%s solved %d/%d cells in %d ms", filename, diffSolved, 81 - startingSolvedCount, totalTime);
}

var puzzles = fs.readdirSync("puzzles");
var solveAllPuzzlesWithMethod = (method) => {
	toSolvePerMethod = 0;
	solvedPerMethod = 0;
	puzzles.forEach((p) => solvePuzzle(method, p));
	console.log("Total solved %d/%d cells (%d%)", solvedPerMethod, toSolvePerMethod, ((solvedPerMethod / toSolvePerMethod) * 100).toFixed(5));
	console.log();
}

if (!process.argv[2]) {
	console.log("Warming JIT\n---")
	solveAllPuzzlesWithMethod(Puzzle.prototype.solve1);
	solveAllPuzzlesWithMethod(Puzzle.prototype.solve2);
	console.log("\n\n\n");

	console.log("With setting values if there was only one possible value\n---")
	solveAllPuzzlesWithMethod(Puzzle.prototype.solve1);

	console.log("Adding in solve if only value in row/column/block that has that as a possible value\n---")
	solveAllPuzzlesWithMethod(Puzzle.prototype.solve2);
}
else if (Puzzle.prototype['solve' + process.argv[2]]) {
	solveAllPuzzlesWithMethod(Puzzle.prototype['solve' + process.argv[2]]);
}