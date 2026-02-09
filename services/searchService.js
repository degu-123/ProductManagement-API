function rankProducts(products, tokens) {
  return products.map(p => {
    let score = 0;

    p.tags.forEach(tag => {
      tokens.forEach(token => {
        if (tag.includes(token)) score++;
      });
    });

    return { ...p.toObject(), score };
  }).sort((a, b) => b.score - a.score);
}
module.exports=rankProducts;