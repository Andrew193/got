import {Component} from '@angular/core';
import {GameFieldService} from "../../services/game-field.service";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'game-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-field.component.html',
  styleUrl: './game-field.component.scss'
})
export class GameFieldComponent {
  gameConfig;
  constructor(private fieldService: GameFieldService) {
    this.gameConfig = this.currentLevelConfig;
  }

  get currentLevelConfig() {
    return this.fieldService.getDefaultGameField();
  }

  example() {
    function shortestPath(grid: string | any[], start: { i: number; j: number; }, end: { i: any; j: any; }, checkDiagonals = false) {
      const rows = grid.length;
      const cols = grid[0].length;
      const queue = [{ position: start, path: [start] }];
      const visited = new Set();

      const directions = checkDiagonals
        ? [
          { di: -1, dj: 0 },  // Up
          { di: 1, dj: 0 },   // Down
          { di: 0, dj: -1 },  // Left
          { di: 0, dj: 1 },   // Right
          { di: -1, dj: -1 }, // Up-Left
          { di: -1, dj: 1 },  // Up-Right
          { di: 1, dj: -1 },  // Down-Left
          { di: 1, dj: 1 }    // Down-Right
        ]
        : [
          { di: -1, dj: 0 },
          { di: 1, dj: 0 },
          { di: 0, dj: -1 },
          { di: 0, dj: 1 }
        ];

      let closestPosition = start;
      let minDistance = Infinity;

      while (queue.length > 0) {
        // @ts-ignore
        const { position, path } = queue.shift();
        const distanceToEnd = Math.abs(position.i - end.i) + Math.abs(position.j - end.j);

        if (distanceToEnd < minDistance) {
          closestPosition = position;
          minDistance = distanceToEnd;
        }

        if (position.i === end.i && position.j === end.j) {
          return path;
        }

        for (const { di, dj } of directions) {
          const i = position.i + di;
          const j = position.j + dj;

          if (i >= 0 && i < rows && j >= 0 && j < cols && grid[i][j] !== 1 && !visited.has(`${i},${j}`)) {
            const newPath = [...path, { i, j }];
            queue.push({ position: { i, j }, path: newPath });
            visited.add(`${i},${j}`);
          }
        }
      }

      return shortestPath(grid, start, closestPosition, checkDiagonals);
    }


    const grid = [
      [0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
      [1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
      [1, 0, 1, 0, 1, 1, 0, 1, 1, 1],
      [0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      [0, 1, 0, 0, 1, 1, 0, 1, 0, 0],
      [1, 1, 0, 0, 1, 0, 0, 1, 0, 0],
    ];

    const start = {i: 0, j: 0};
    const end = {i: 7, j: 6};

    const path = shortestPath(grid, start, end, true);
    console.log('Shortest path with diagonals:', path);
    path.forEach((point: { i: number, j: number }) => {
      const element = document.body.querySelector(`.data-i-${point.i}.data-j-${point.j}`)
      console.log(element, point)

      if (element) {
        element.classList.add('red-b')
        element.innerHTML = "fffffffffffffff"
      }
    })
  }
}
