var sudoku = require('sudoku');
var fs = require('fs');

var number = +process.argv[2] || 1;

for (var i = 0; i < number; i++) {
	var puzzle = sudoku.makepuzzle();
	var str = "";
	var prefix = "";
	for (var j = 0; j < 81; j++) {
		if (j != 0 && j % 9 == 0) {
			str += "\n";
			prefix = "";
		}
		str += prefix + ((puzzle[j] || 0));
		prefix = ",";
	}
	fs.writeFileSync('puzzles/puzzle' + ("0000" + (i + 1)).substr((number >= 100) ? -3 : -2) + '.csv', str);
}

// var puzzles = fs.readFileSync('input.csv').toString().split('\n')
// puzzles.shift();
// puzzles = puzzles.map((r) => r.split("").map((v) => +v || 0));

// var i = 0;
// for (var puzzle of puzzles) {
// 	i++;
// 	var str = "";
// 	var prefix = "";
// 	for (var j = 0; j < 81; j++) {
// 		if (j != 0 && j % 9 == 0) {
// 			str += "\n";
// 			prefix = "";
// 		}
// 		str += prefix + ((puzzle[j] || 0));
// 		prefix = ",";
// 	}
// 	fs.writeFileSync('puzzles/' + process.argv[2] + ("0000" + i).substr((puzzles.length >= 100) ? -3 : -2) + '.csv', str);
// }