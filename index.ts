import { strict as assert } from 'assert';

/** 要組合的對象 */
export interface Item {
	/** 種類，不得重複 */
	type: string;
	/** 數量，需為正整數 */
	amount: number;
}

/**
 * 列出所有組合
 * @param items 要撿的東西
 * @param pick 要挑幾個
 */
function combination<T extends Item = Item>(items: Array<T>, pick: number): Array<Array<T>> {
	const result: Array<Array<T>> = [];
	const pickOption: number[][] = items.map(item => {
		const amountOption: number[] = [];
		for (let i = 0; i <= item.amount; ++i) {
			amountOption.push(i);
		}
		return amountOption;
	});

	const nodes = makeNodes(items, pickOption, 0);
	nodes.forEach(node => {
		result.push(...findAllSolutions<T>(node, pick));
	});

	return result;
}

/** 樹狀結構中的節點 \
 * 樹狀結構中，每一層代表一種type的item被pick的所有可能節點，每一條從root到leaf的路徑是一種pick的組合 */
 interface Node {
	/** item的種類 */
	type: string;
	/** item被pick的數量 */
	amount: number;
	/** 父節點 */
	parent: Node;
	/** 子節點 */
	children: Node[];
}

/** 建立樹狀結構\
 * @param items 所有要pick的東西
 * @param pickOption 所有item能被pick的數量選項
 * @param n 起始index，對應到items的index
 * @returns 回傳第一層的所有節點 Node[]
 */
function makeNodes(items: Item[], pickOption: number[][], n: number): Node[] {
	const nodes: Node[] = [];
	for (let i = 0; i < pickOption[n].length; ++i){
		let node: Node = {
			type: items[n].type,
			amount: pickOption[n][i],
			parent: null,
			children: null
		};
		if (n < pickOption.length - 1) {
			const children = makeNodes(items, pickOption, n + 1);
			node.children = children;
			for (let j = 0; j < children.length; ++j) {
				children[j].parent = node;
			}
		}
		nodes.push(node);
	}
	return nodes;
}

/** 測試每種組合的總和是否符合pick的數量，並回傳符合的組合
 * @param node 樹狀的根節點
 * @param pick 要挑幾個
 * @returns 回傳符合的組合
 */
function findAllSolutions<T extends Item = Item>(node: Node, pick: number): T[][] {
	const result: T[][] = [];
	for(let child of node.children){
	
		if (child.children) {
			result.push(...findAllSolutions<T>(child, pick));
		}
		else {
			const [sum, solution] = calculateSumAndReturnCombination<T>(child); 
			if (sum == pick) {
				return [solution];
			}
		}
	};
	return result;
}

/** 向上迭代直到root，並計算該組合所pick的amount總和
 * @param node 要開始向上加總的起始節點
 * @returns 回傳總和及該組合的紀錄
 */
function calculateSumAndReturnCombination<T extends Item = Item>(node: Node): [number,T[]] {
	let sum = node.amount;
	const thisNode = {
		type: node.type,
		amount: node.amount
	};
	const solution: T[] = [<T>thisNode];
	while (node.parent) {
		sum += node.parent.amount;
		const parentNode = {
			type: node.parent.type,
			amount: node.parent.amount
		};
		solution.push(<T>parentNode);
		node = node.parent;
	}
	return [sum, solution];
}



let result = combination([
	{ type: 'Apple', amount: 2 },
	{ type: 'Banana', amount: 3 },
	{ type: 'Cat', amount: 2 },
	{ type: 'Dog', amount: 4 },
	{ type: 'Egg', amount: 1 },
], 12);
assert(result.length === 1);

result = combination([
	{ type: 'Apple', amount: 2 },
	{ type: 'Banana', amount: 3 },
	{ type: 'Cat', amount: 2 },
	{ type: 'Dog', amount: 4 },
	{ type: 'Egg', amount: 1 },
], 7);
result.forEach(ans => {
	const sum = ans.reduce((prev, curr) => {
		return prev + curr.amount;
	}, 0);
	assert(sum === 7);
});

result = combination([
	{ type: 'Apple', amount: 2 },
	{ type: 'Banana', amount: 3 },
	{ type: 'Cat', amount: 2 },
	{ type: 'Dog', amount: 4 },
	{ type: 'Egg', amount: 1 },
], 13);
assert(result.length === 0);

result = combination([
	{ type: 'Apple', amount: 1 },
	{ type: 'Banana', amount: 2 },
	{ type: 'Cat', amount: 3 },
], 2);
/** A1B1 A1C1 B1C1 B2 C2 */
assert(result.length === 5);