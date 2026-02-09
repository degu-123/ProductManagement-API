function getMaxBy(arr, key) {
  return arr.reduce((max, item) => item[key] > max[key] ? item : max);
}
function getMinBy(arr, key) {
  return arr.reduce((min, item) => item[key] < min[key] ? item : min);
}

function summarizeSales(sales) {
  const map = {};

  for (const sale of sales) {
    const productId = sale.product._id;

    if (!map[productId]) {
      map[productId] = {
        name: sale.product.name,
        category: sale.product.category,
        currentStock: sale.product.stock,
        totalSold: 0,
        totalProfit: 0,
        prices: [],
        tags: sale.product.tags || [],
      };
    }

    map[productId].totalSold += sale.quantity;
    map[productId].totalProfit += sale.profit;
    map[productId].prices.push(sale.sellingPrice);
  }

  return Object.values(map).map(p => ({
    name: p.name,
    category: p.category,
    soldUnits: p.totalSold,
    profit: p.totalProfit,
    avgPrice: p.prices.reduce((a, b) => a + b, 0) / p.prices.length,
    stockLeft: p.currentStock,
    tags: p.tags,
  }));
}

function buildOwnerPrompt(summary) {
  const text = summary.map(p => `
Product: ${p.name}
Category: ${p.category}
Sold units: ${p.soldUnits}
Profit: ${p.profit}
Average price: ${p.avgPrice}
Stock remaining: ${p.stockLeft}
Tags: ${p.tags.join(", ")}
`).join("\n");
  return `
You are an expert retail business advisor.

Here is sales performance data:
${text}

Analyze this and answer:
1. Which products should be restocked urgently?
2. Which products should NOT be restocked?
3. Which category is most profitable?
4. Give 3 clear business actions to maximize profit.

Return ONLY valid JSON:
{
  "restock": [],
  "doNotRestock": [],
  "bestCategory": "",
  "actions": []
}
`;
}

module.exports ={getMaxBy,getMinBy,summarizeSales,buildOwnerPrompt};

