// History of each generations states
var generations = [];
// Update interval (ms)
var generationPeriod = 1000;
// Start/stop flag
var newGame;

// Field configuration
var field = {
	row: 0, 
	col: 0,
	setField: function (row, col) {
		this.row = row;
		this.col = col;
	}
};

// Class "Generation" - interprets the cells state in each generation
function Generation () {
	this.cells = [];
	
	this.addCell = function (cell) {
		this.cells.push(cell);
	};
	
	this.findCellByCoords = function (row, col) {
		return this.cells.filter(function (item) {
			return (item.coords.row == row && item.coords.col == col) ? item : null;
		})[0];
	};
	
	this.findCellNeighbors = function (cell) {
		var cellRow = cell.coords.row;
		var cellCol = cell.coords.col;
		
		for (var i = cellRow-1; i <= cellRow+1 ; i++) {
			for (var j = cellCol-1; j <= cellCol+1; j++) {
				// Check field borders
				if ((i >= 0 && j >= 0) && (i <= field.row-1 && j <= field.col-1)) {
					var nextNeighbor = this.findCellByCoords(i, j);
					if (nextNeighbor != cell) {
						cell.addNeighbor(nextNeighbor);
					}
				}
			}
		}
	};
	
	this.saveGeneration = function () {
		generations.push(this.cells.slice());
	};
}

// Class "Cell" - interprets the state of each cell
function Cell (row, col, status) {
	this.coords = {row: row, col: col};
	this.neighbors = [];
	this.status = status;
	
	this.addNeighbor = function (neighbor) {
		this.neighbors.push(neighbor);
	};
	
	this.countAliveNeighbors = function () {
		return this.neighbors.filter(function (item) {
			return item.status == "alive";
		}).length;
	};
	
	this.changeStatus = function (status) {
		this.status = status;
	};
	
}

$(function () {
	// Event handlers
	$("input").on("change", function () {
		initField();
	});
	$("input").trigger("change");
	
	$("#start").click(function (event) {
		newGame = setInterval(startGame, generationPeriod);
	});
	
	$("#stop").click(function (event) {
		stopGame();
	});
	
});

function initField () {
	$("#field").children().detach();
	var gameField = $("#field");
	var rows = $("#rows").val();
	var cols = $("#cols").val();
	field.setField(rows, cols);
	
	for (var i = 0; i < rows; i++) {
		$("<tr></tr>").appendTo(gameField);
		for (var j = 0; j < cols; j++) {
			$("<td class='dead'></td>").data("row-index", i).data("col-index", j).appendTo("#field tr:last-child");
		}
	}
	
	$("#field td").on("click", function (event) {
		$(this).toggleClass("dead").toggleClass("alive");
	});

}

function startGame () {
	if (generations.length == 0) {
		var newGeneration = new Generation();
		var tds = $("#field td");
		tds.each(function () {
			var elem = $(this);
			var row = elem.data("row-index");
			var col = elem.data("col-index");
			var status = elem.attr("class");
			var cell = new Cell(row, col, status);
			newGeneration.addCell(cell);
		});

		for (var i = 0; i < newGeneration.cells.length; i++) {
			var cell = newGeneration.cells[i];
			newGeneration.findCellNeighbors(cell);
		}
		newGeneration.saveGeneration();
	} else if (generations.length > 0) {
		var newGeneration = new Generation();
		var currentGeneration = generations[generations.length - 1];
		for (var i = 0; i < currentGeneration.length; i++){
			var cell = currentGeneration[i];
			var cntAliveNeighbors = cell.countAliveNeighbors();
			if (cell.status == "dead" && cntAliveNeighbors == 3){
				newGeneration.addCell(new Cell(cell.coords.row, cell.coords.col, "alive"));
			} else if (cell.status == "alive" && (cntAliveNeighbors < 2 || cntAliveNeighbors > 3)) {
				newGeneration.addCell(new Cell(cell.coords.row, cell.coords.col, "dead"));
			} else {
				newGeneration.addCell(new Cell(cell.coords.row, cell.coords.col, cell.status));
			}
		}
		for (var i = 0; i < newGeneration.cells.length; i++) {
			var cell = newGeneration.cells[i];
			newGeneration.findCellNeighbors(cell);
		}
		newGeneration.saveGeneration();
		updateUI(newGeneration);
	}
}

function updateUI (newGeneration) {
	var tds = $("#field td");
	tds.each(function () {
		var elem = $(this);
		var row = elem.data("row-index");
		var col = elem.data("col-index");
		var status = elem.attr("class");
		var cell = newGeneration.findCellByCoords(row, col);
		if (cell.status != status) {
			elem.toggleClass("dead").toggleClass("alive");
		}
	});
}

function stopGame () {
	clearInterval(newGame);
}